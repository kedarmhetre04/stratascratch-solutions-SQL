/* SidelineReel — Roster-Tagging Verification prototype UI (vanilla JS). */
(function () {
  'use strict';
  const L = window.SRLogic;
  const D = window.SRData;
  const STORE_KEY = 'sidelinereel-verify-demo-v1';

  const fresh = (scenario) => ({
    scenario: scenario || 'standard',
    view: 'dashboard', // dashboard | verify | preview
    currentClipId: null,
    selectedPlayerId: null,
    phase: 'review', // review | cutoff | published
    decisions: {}, // clipId -> {action, playerId, ms}
    lateDecisions: [], // logged after cutoff, never applied (MVP: no post-publication updates)
    openedAt: null,
    published: null, // snapshot of plan at publish time
  });

  let state = load() || fresh();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function set(patch) { Object.assign(state, patch); save(); render(); }

  const game = () => D.scenarios[state.scenario];
  const player = (id) => game().roster.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (x) => Math.round(x * 100) + '%';
  const plan = () => L.computePublishPlan(game(), state.decisions);
  const locked = () => state.phase !== 'review';
  const clock = () => state.phase === 'review' ? game().clockStart : state.phase === 'cutoff' ? game().cutoffAt : game().publishAt;

  // ---------- small render helpers ----------
  function reasonChip(r) {
    const cls = { low_confidence: 'amber', lookalike: 'violet', no_unique_match: 'red' }[r];
    return `<span class="chip ${cls}">${esc(L.REASONS[r])}</span>`;
  }
  function statusChip(c) {
    const map = {
      trusted: ['green', 'Trusted'],
      verified: ['green', 'Coach verified'],
      unidentifiable: ['grey', 'Excluded · unidentifiable'],
      unresolved: locked() ? ['red', 'Excluded · not reviewed by cutoff'] : ['amber', 'Needs review'],
    };
    const [cls, txt] = map[c.status];
    return `<span class="chip ${cls}">${txt}</span>`;
  }
  function thumb(c, small, num) {
    const hue = { Goal: 150, Save: 205, Assist: 260, 'Big play': 30, 'Shot on target': 340, Breakaway: 15, Tackle: 190, 'Goal-line block': 110 }[c.moment] || 200;
    return `<div class="thumb ${small ? 'sm' : ''}" style="--h:${hue}">
      <span class="thumb-num">#${num != null ? num : c.detectedNumber}</span><span class="thumb-m">${esc(c.moment)} · ${c.minute}'</span></div>`;
  }
  function explain(c) {
    const out = [];
    if (c.reasons.includes('low_confidence')) out.push(`The AI read #${c.detectedNumber} with only ${pct(c.confidence)} confidence (threshold ${pct(L.CONFIG.confidenceThreshold)}, illustrative).`);
    if (c.reasons.includes('lookalike')) {
      const alts = c.alternativeIds.map(player).filter(Boolean).filter((p) => p.number !== c.detectedNumber);
      out.push(`#${c.detectedNumber} looks similar to ${alts.map((p) => `#${p.number} (${esc(p.name)})`).join(', ')} on this roster.`);
    }
    if (c.reasons.includes('no_unique_match')) out.push(`#${c.detectedNumber} doesn't match exactly one player on the roster.`);
    return out.map((t) => `<li>${t}</li>`).join('');
  }

  // ---------- views ----------
  function header() {
    const g = game();
    return `
    <header class="top">
      <div class="brand"><span class="logo">▶</span> SidelineReel <span class="brand-sub">Coach</span></div>
      <nav class="tabs">
        <button class="tab ${state.view !== 'preview' ? 'on' : ''}" data-act="go" data-view="dashboard">1 · Review queue</button>
        <button class="tab ${state.view === 'preview' ? 'on' : ''}" data-act="go" data-view="preview">3 · Publishing preview</button>
      </nav>
      <div class="demo">
        <label class="demo-l">Demo scenario
          <select data-act="scenario">${Object.values(D.scenarios).map((s) => `<option value="${s.key}" ${s.key === state.scenario ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}</select>
        </label>
        <span class="clock" title="Simulated clock">🕑 ${esc(clock())}</span>
        <button class="btn ghost sm" data-act="reset">↺ Reset demo</button>
      </div>
    </header>
    <section class="game">
      <div><h1>${esc(g.team)}</h1><p class="muted">vs ${esc(g.opponent)} · ${esc(g.date)} · ${esc(g.score)}</p></div>
      <div class="sched">
        <div><span class="k">Review cutoff</span><span class="v">${esc(g.cutoffAt)}</span></div>
        <div><span class="k">Scheduled publish</span><span class="v">${esc(g.publishAt)}</span></div>
        <div><span class="k">Status</span><span class="v">${{ review: '<span class="dot amber"></span>Review open', cutoff: '<span class="dot red"></span>Cutoff passed', published: '<span class="dot green"></span>Published' }[state.phase]}</span></div>
      </div>
    </section>`;
  }

  function dashboard() {
    const p = plan();
    const flagged = p.clips.filter((c) => c.flagged);
    const done = flagged.filter((c) => c.decision).length;
    const times = flagged.filter((c) => c.decision && c.decision.ms).map((c) => c.decision.ms).sort((a, b) => a - b);
    const median = times.length ? (times[Math.floor((times.length - 1) / 2)] / 1000).toFixed(1) + 's' : '—';
    const nextOpen = flagged.find((c) => !c.decision);
    return `
    ${lockBanner()}
    <section class="card summary">
      <div class="sum-main">
        <div class="big">${flagged.length - done}<span>of ${flagged.length}</span></div>
        <div>
          <h2>${flagged.length - done === 0 ? 'All flagged highlights reviewed' : 'Highlights need your check'}</h2>
          <p class="muted">The AI isn't sure who's in ${flagged.length} of ${p.clips.length} highlights. ${p.clips.length - flagged.length} trusted highlights will publish automatically.</p>
          <div class="bar"><i style="width:${flagged.length ? (done / flagged.length) * 100 : 100}%"></i></div>
          <p class="tiny muted">${done} reviewed · Unreviewed clips are withheld at cutoff, never published with the AI's best guess.</p>
        </div>
      </div>
      <div class="sum-act">
        ${nextOpen && !locked() ? `<button class="btn primary" data-act="open" data-id="${nextOpen.id}">Start review →</button>` : ''}
        <button class="btn" data-act="go" data-view="preview">Publishing preview</button>
      </div>
    </section>

    <section class="card">
      <div class="card-h"><h3>Flagged highlights</h3><span class="tiny muted">AI predictions are simulated</span></div>
      ${flagged.length === 0 ? '<p class="empty">Nothing flagged for this game. Publishing runs exactly as today.</p>' : ''}
      <ul class="list">
        ${flagged.map((c) => {
          const sug = player(c.suggestedPlayerId);
          const final = c.playerId ? player(c.playerId) : null;
          return `<li class="row">
            ${thumb(c, true)}
            <div class="row-main">
              <div class="row-t">${esc(c.moment)} · ${c.minute}' <span class="muted">· AI read #${c.detectedNumber} (${pct(c.confidence)})</span></div>
              <div class="row-s">AI suggests: <b>${sug ? `#${sug.number} ${esc(sug.name)}` : 'No roster match'}</b>
                ${c.decision ? ` → <b>${c.status === 'verified' ? `#${final.number} ${esc(final.name)}` : 'Unidentifiable'}</b>` : ''}</div>
              <div class="chips">${c.reasons.map(reasonChip).join('')} ${statusChip(c)}</div>
            </div>
            <button class="btn ${c.decision ? 'ghost' : 'primary'} sm" data-act="open" data-id="${c.id}">${locked() ? 'View' : c.decision ? 'Change' : 'Review'}</button>
          </li>`;
        }).join('')}
      </ul>
    </section>

    <section class="card metrics">
      <div class="card-h"><h3>Instrumentation (spec §9)</h3><span class="tiny muted">what this session would log</span></div>
      <div class="mgrid">
        <div><span class="v">${pct(p.stats.flagged / Math.max(p.stats.total, 1))}</span><span class="k">Flag rate<br><small>flagged ÷ all attributions</small></span></div>
        <div><span class="v">${p.stats.reviewed ? pct(p.stats.corrections / p.stats.reviewed) : '—'}</span><span class="k">Coach correction rate<br><small>reassigned + unidentifiable ÷ reviewed</small></span></div>
        <div><span class="v">${flagged.length ? pct(done / flagged.length) : '—'}</span><span class="k">Review completion<br><small>resolved ÷ flagged</small></span></div>
        <div><span class="v">${median}</span><span class="k">Median decision time<br><small>per flagged clip</small></span></div>
        <div><span class="v">${state.lateDecisions.length}</span><span class="k">Late decisions logged<br><small>after cutoff, not applied</small></span></div>
      </div>
    </section>`;
  }

  function verify() {
    const p = plan();
    const c = p.clips.find((x) => x.id === state.currentClipId);
    if (!c) return dashboard();
    const flagged = p.clips.filter((x) => x.flagged);
    const idx = flagged.findIndex((x) => x.id === c.id);
    const sug = player(c.suggestedPlayerId);
    const options = [c.suggestedPlayerId, ...c.alternativeIds].filter(Boolean);
    const sel = state.selectedPlayerId;
    const selP = player(sel);
    const others = game().roster.filter((r) => !options.includes(r.id));
    const blur = c.reasons.includes('low_confidence') ? 'blur' : c.reasons.includes('lookalike') ? 'partial' : '';

    let primaryLabel = 'Select a player';
    let primaryAct = '';
    if (sel && sel === c.suggestedPlayerId) { primaryLabel = `✓ Confirm ${selP.name}`; primaryAct = 'confirm'; }
    else if (sel) { primaryLabel = `⇄ Reassign to ${selP.name}`; primaryAct = 'reassign'; }

    return `
    ${lockBanner()}
    <div class="crumbs"><button class="link" data-act="go" data-view="dashboard">← Review queue</button><span class="muted">Clip ${idx + 1} of ${flagged.length}</span></div>
    <section class="verify">
      <div class="card media">
        <div class="pitch ${state.playing ? 'playing' : ''}" data-act="play">
          <span class="sim">SIMULATED FOOTAGE</span>
          <svg viewBox="0 0 320 180" aria-label="Simulated clip preview">
            <rect x="0" y="0" width="320" height="180" fill="#2f7d3f"/>
            <g stroke="#ffffff55" fill="none" stroke-width="2"><rect x="8" y="8" width="304" height="164"/><line x1="160" y1="8" x2="160" y2="172"/><circle cx="160" cy="90" r="26"/><rect x="262" y="55" width="50" height="70"/></g>
            <g class="mover"><circle r="15" fill="#f4c430" stroke="#1b1b1b" stroke-width="2"/><text class="jn ${blur}" text-anchor="middle" dy="5" font-size="13" font-weight="800" fill="#1b1b1b">${c.detectedNumber}</text></g>
            <g class="mover2"><circle r="13" fill="#f4c430" stroke="#1b1b1b" stroke-width="2" opacity=".85"/></g>
            <circle class="ball" r="4" fill="#fff" stroke="#222"/>
          </svg>
          <div class="playbtn">${state.playing ? '❚❚' : '▶'}</div>
        </div>
        <div class="media-meta">${esc(c.moment)} · ${c.minute}' · 6s clip <span class="muted">· tap preview to ${state.playing ? 'pause' : 'play'}</span></div>
      </div>

      <div class="card decide">
        <div class="ai">
          <div class="tiny muted">AI SUGGESTION (simulated)</div>
          <div class="ai-p">${sug ? `<span class="jersey">${sug.number}</span> ${esc(sug.name)}` : `<span class="jersey q">?</span> No roster player wears #${c.detectedNumber}`}</div>
          <div class="tiny">Read jersey <b>#${c.detectedNumber}</b> · confidence <b>${pct(c.confidence)}</b></div>
          <div class="chips">${c.reasons.map(reasonChip).join('')}</div>
          <ul class="why">${explain(c)}</ul>
        </div>

        <h4>Who is in this clip?</h4>
        <div class="opts">
          ${options.map((id) => {
            const r = player(id);
            return `<button class="opt ${sel === id ? 'on' : ''}" data-act="select" data-id="${id}" ${locked() && state.phase === 'published' ? '' : ''}>
              <span class="jersey">${r.number}</span><span>${esc(r.name)}</span>${id === c.suggestedPlayerId ? '<em>AI pick</em>' : '<em>look-alike</em>'}</button>`;
          }).join('')}
        </div>
        <label class="other">Someone else on the roster
          <select data-act="selectOther"><option value="">Choose player…</option>
            ${others.map((r) => `<option value="${r.id}" ${sel === r.id ? 'selected' : ''}>#${r.number} ${esc(r.name)}</option>`).join('')}
          </select>
        </label>

        <div class="actions">
          <button class="btn primary wide" data-act="decide" data-action="${primaryAct}" ${primaryAct ? '' : 'disabled'}>${esc(primaryLabel)}</button>
          <button class="btn wide" data-act="decide" data-action="unidentifiable">Can't tell — mark unidentifiable</button>
        </div>
        <p class="tiny muted">${locked()
          ? 'Cutoff has passed: your decision will be logged for accuracy measurement but won’t change reels (no post-publication updates in this MVP).'
          : 'Unidentifiable clips are left out of every personal reel and the team recap.'}</p>
        ${c.decision ? `<p class="tiny">Current decision: <b>${c.status === 'verified' ? `${esc(player(c.playerId).name)} (${c.decision.action})` : 'Unidentifiable'}</b></p>` : ''}
      </div>
    </section>`;
  }

  function preview() {
    const p = state.phase === 'published' && state.published ? state.published : plan();
    const g = game();
    const withheld = p.unresolved.length + p.excluded.length;
    const publishing = p.reels.filter((r) => r.status === 'publish');
    const clipById = (id) => p.clips.find((c) => c.id === id);
    return `
    ${state.phase === 'published' ? `
      <section class="banner ok"><b>Published on schedule at ${esc(g.publishAt)}.</b> ${publishing.length} personal reels and ${p.recap.create ? `a team recap with ${p.recap.clipIds.length} clips` : 'no recap video (no eligible highlights)'} went out. ${withheld} flagged clip(s) were withheld. Published reels won't be updated automatically in this MVP.</section>`
    : `<section class="banner ${p.unresolved.length ? 'warn' : 'ok'}">
        <b>✓ Safe to publish on schedule.</b> ${p.eligible.length} eligible clips (trusted or coach-verified).
        ${p.unresolved.length ? `${p.unresolved.length} unresolved clip(s) will be <b>withheld</b> if not reviewed by ${esc(g.cutoffAt)}. Publishing won't wait for them.` : 'No unresolved clips.'}
      </section>`}

    <div class="pv-act">
      ${state.phase === 'review' ? `<button class="btn" data-act="cutoff">⏩ Simulate review cutoff (${esc(g.cutoffAt)})</button>` : ''}
      ${state.phase !== 'published' ? `<button class="btn primary" data-act="publish">⏩ Run scheduled publish (${esc(g.publishAt)})</button>` : `<button class="btn" data-act="reset">↺ Reset demo</button>`}
    </div>

    <section class="card">
      <div class="card-h"><h3>Personal reels</h3><span class="tiny muted">${publishing.length} of ${p.reels.length} players receive a reel</span></div>
      <div class="reels">
        ${p.reels.map((r) => {
          const t = r.thumbnailClipId ? clipById(r.thumbnailClipId) : null;
          return `<div class="reel ${r.status}">
            ${t ? thumb(t, false, r.player.number) : `<div class="thumb none"><span>No eligible highlights</span></div>`}
            <div class="reel-b">
              <div class="reel-n"><span class="jersey">${r.player.number}</span>${esc(r.player.name)}</div>
              ${r.status === 'publish'
                ? `<span class="chip green">${state.phase === 'published' ? 'Published' : 'Will publish'} · ${r.clips.length} clip${r.clips.length > 1 ? 's' : ''}</span>`
                : `<span class="chip grey">No eligible highlights</span>`}
              ${r.withheld ? `<div class="tiny muted">${r.withheld} AI-suggested clip${r.withheld > 1 ? 's' : ''} withheld</div>` : ''}
              ${r.status === 'no_eligible' ? '<div class="tiny muted">No empty reel is sent</div>' : ''}
            </div></div>`;
        }).join('')}
      </div>
    </section>

    <section class="card">
      <div class="card-h"><h3>Weekly team recap</h3><span class="tiny muted">auto-assembled, sent to every family</span></div>
      ${p.recap.create
        ? `<div class="strip">${p.recap.clipIds.map((id) => { const c = clipById(id); return thumb(c, true, player(c.playerId).number); }).join('')}</div>
           <p class="tiny muted">${p.recap.clipIds.length} clips · unresolved and unidentifiable clips are excluded.</p>`
        : `<p class="empty"><b>No eligible highlights.</b> No recap video will be created for this game. Other games and reels are unaffected.</p>`}
    </section>

    <section class="two">
      <div class="card">
        <div class="card-h"><h3>Unresolved</h3><span class="chip ${p.unresolved.length ? 'amber' : 'green'}">${p.unresolved.length}</span></div>
        ${listMini(p.unresolved, state.phase === 'review' ? 'Withheld unless reviewed before cutoff' : 'Withheld: not reviewed by cutoff')}
      </div>
      <div class="card">
        <div class="card-h"><h3>Excluded by coach</h3><span class="chip grey">${p.excluded.length}</span></div>
        ${listMini(p.excluded, 'Marked unidentifiable')}
      </div>
    </section>`;
  }

  function listMini(arr, note) {
    if (!arr.length) return '<p class="empty sm">None</p>';
    return `<ul class="mini">${arr.map((c) => {
      const s = player(c.suggestedPlayerId);
      return `<li>${thumb(c, true)}<div><b>${esc(c.moment)} · ${c.minute}'</b><div class="tiny muted">AI guess: ${s ? esc(s.name) : 'no match'} · ${note}</div></div>
        ${state.phase === 'review' ? `<button class="btn ghost sm" data-act="open" data-id="${c.id}">Review</button>` : ''}</li>`;
    }).join('')}</ul>`;
  }

  function lockBanner() {
    if (state.phase === 'review') return '';
    return `<section class="banner info">${state.phase === 'cutoff' ? 'Review cutoff passed.' : 'This game has been published.'} Unreviewed flagged clips are excluded. Late decisions are logged but don't change reels.</section>`;
  }

  function render() {
    const body = state.view === 'verify' ? verify() : state.view === 'preview' ? preview() : dashboard();
    document.getElementById('app').innerHTML = header() + `<main>${body}</main>` +
      `<footer>Prototype for the Ajaia Product Manager assessment · <a href="https://ajaia.ai" target="_blank" rel="noopener">ajaia.ai</a> · Fictional data; AI tagging, confidence and footage are simulated.</footer>` +
      `<div id="toast" class="${toastMsg ? 'show' : ''}">${esc(toastMsg)}</div>`;
  }

  // ---------- actions ----------
  let toastMsg = '';
  let toastTimer;
  function toast(m) { toastMsg = m; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = ''; render(); }, 2600); }

  function openClip(id) {
    const c = plan().clips.find((x) => x.id === id);
    const pre = c.decision ? (c.decision.action === 'unidentifiable' ? null : c.playerId) : c.suggestedPlayerId;
    set({ view: 'verify', currentClipId: id, selectedPlayerId: pre, openedAt: Date.now(), playing: false });
  }

  function decide(action) {
    const p = plan();
    const c = p.clips.find((x) => x.id === state.currentClipId);
    if (!c || !action) return;
    const playerId = action === 'unidentifiable' ? null : state.selectedPlayerId;
    if (action !== 'unidentifiable' && !playerId) return;
    const entry = { action, playerId, ms: state.openedAt ? Date.now() - state.openedAt : null };

    if (locked()) {
      state.lateDecisions = state.lateDecisions.concat([Object.assign({ clipId: c.id }, entry)]);
      toast('Logged for accuracy measurement. Reels unchanged (cutoff passed).');
      set({ view: 'dashboard' });
      return;
    }
    state.decisions = Object.assign({}, state.decisions, { [c.id]: entry });
    const name = playerId ? player(playerId).name : null;
    toast(action === 'confirm' ? `Confirmed: ${name}` : action === 'reassign' ? `Reassigned to ${name}` : 'Marked unidentifiable — excluded from reels and recap');
    const next = plan().clips.find((x) => x.flagged && !x.decision);
    if (next) openClip(next.id); else set({ view: 'preview', currentClipId: null });
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act;
    if (a === 'go') set({ view: el.dataset.view, playing: false });
    else if (a === 'open') openClip(el.dataset.id);
    else if (a === 'select') set({ selectedPlayerId: el.dataset.id });
    else if (a === 'decide') decide(el.dataset.action);
    else if (a === 'play') set({ playing: !state.playing });
    else if (a === 'cutoff') { toast('Cutoff reached: unreviewed clips are now withheld.'); set({ phase: 'cutoff' }); }
    else if (a === 'publish') {
      const snap = plan();
      toast('Published on schedule.');
      set({ phase: 'published', published: snap, view: 'preview' });
    }
    else if (a === 'reset') { state = fresh(state.scenario); save(); toast('Demo reset'); render(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset.act === 'selectOther' && el.value) set({ selectedPlayerId: el.value });
    if (el.dataset.act === 'scenario') { state = fresh(el.value); save(); toast('Scenario loaded'); render(); }
  });

  render();
})();
