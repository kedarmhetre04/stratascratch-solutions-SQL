/* SidelineReel — Roster-Tagging Verification MVP: core logic.
 * Pure functions, no DOM. Loaded by index.html and by tests/logic.test.js.
 * All AI predictions and confidence values are SIMULATED sample data.
 */
(function (root) {
  'use strict';

  // Illustrative config. Real values must be validated with Engineering on real tagging data (spec E3).
  const CONFIG = {
    confidenceThreshold: 0.75,
    reviewCutoffHoursBeforePublish: 2,
  };

  const REASONS = {
    low_confidence: 'Low confidence',
    lookalike: 'Look-alike jersey number',
    no_unique_match: 'No unique roster match',
  };

  // Look-alike rules (configurable, deliberately narrow; NOT "any shared digit"):
  //  1) Added/dropped digit "1"  (4↔14, 1↔11, 7↔17) — the thin "1" stroke is easily missed.
  //  2) Two-digit transposition  (12↔21).
  function lookalikeNumbers(n) {
    const s = String(n);
    const out = new Set();
    // add a "1" in any position
    for (let i = 0; i <= s.length; i++) out.add(s.slice(0, i) + '1' + s.slice(i));
    // drop a "1" from any position
    for (let i = 0; i < s.length; i++) if (s[i] === '1' && s.length > 1) out.add(s.slice(0, i) + s.slice(i + 1));
    // transposition
    if (s.length === 2 && s[0] !== s[1]) out.add(s[1] + s[0]);
    out.delete(s);
    return [...out].filter((x) => x !== '' && !/^0\d/.test(x)).map(Number);
  }

  // Returns { reasons: [...], suggestedPlayerId, alternativeIds: [...] }
  function detectFlags(clip, roster, config) {
    const cfg = config || CONFIG;
    const reasons = [];
    const matches = roster.filter((p) => p.number === clip.detectedNumber);
    const suggestedPlayerId = matches.length === 1 ? matches[0].id : null;

    if (matches.length !== 1) reasons.push('no_unique_match');
    if (clip.confidence < cfg.confidenceThreshold) reasons.push('low_confidence');

    const alikes = lookalikeNumbers(clip.detectedNumber);
    const lookalikePlayers = roster.filter((p) => alikes.includes(p.number));
    if (lookalikePlayers.length > 0) reasons.push('lookalike');

    // Alternatives: look-alike players first, then duplicate-number players.
    const alternativeIds = [
      ...lookalikePlayers.map((p) => p.id),
      ...(matches.length > 1 ? matches.map((p) => p.id) : []),
    ].filter((id, i, a) => id !== suggestedPlayerId && a.indexOf(id) === i);

    return { reasons, suggestedPlayerId, alternativeIds };
  }

  /* Clip statuses:
   *  trusted       — not flagged, publishes via existing flow
   *  verified      — flagged, coach confirmed or reassigned before cutoff
   *  unidentifiable— flagged, coach marked unidentifiable (excluded)
   *  unresolved    — flagged, no coach decision (excluded from publishing)
   */
  function resolveClips(game, decisions) {
    return game.clips.map((clip) => {
      const det = detectFlags(clip, game.roster);
      const flagged = det.reasons.length > 0;
      const d = decisions[clip.id];
      let status, playerId;
      if (!flagged) {
        status = 'trusted';
        playerId = det.suggestedPlayerId;
      } else if (!d) {
        status = 'unresolved';
        playerId = null;
      } else if (d.action === 'unidentifiable') {
        status = 'unidentifiable';
        playerId = null;
      } else {
        status = 'verified';
        playerId = d.action === 'confirm' ? det.suggestedPlayerId : d.playerId;
      }
      return Object.assign({}, clip, det, { flagged, status, playerId, decision: d || null });
    });
  }

  const ELIGIBLE = new Set(['trusted', 'verified']);

  function computePublishPlan(game, decisions) {
    const clips = resolveClips(game, decisions);
    const eligible = clips.filter((c) => ELIGIBLE.has(c.status));
    const unresolved = clips.filter((c) => c.status === 'unresolved');
    const excluded = clips.filter((c) => c.status === 'unidentifiable');

    const reels = game.roster.map((p) => {
      const own = eligible.filter((c) => c.playerId === p.id);
      // Withheld = flagged clips the AI attributed to this player that are not eligible.
      const withheld = clips.filter(
        (c) => c.suggestedPlayerId === p.id && !ELIGIBLE.has(c.status)
      ).length;
      const thumb = own.slice().sort((a, b) => b.confidence - a.confidence)[0] || null;
      return {
        player: p,
        clips: own,
        thumbnailClipId: thumb ? thumb.id : null, // only ever an eligible clip
        status: own.length ? 'publish' : 'no_eligible',
        withheld,
      };
    });

    const recap = eligible.length
      ? { create: true, clipIds: eligible.map((c) => c.id) }
      : { create: false, clipIds: [] };

    const flagged = clips.filter((c) => c.flagged);
    const reviewed = flagged.filter((c) => c.decision);

    return {
      clips,
      eligible,
      unresolved,
      excluded,
      reels,
      recap,
      // Publishing is always safe: the gate excludes anything not trusted/verified.
      safeToPublish: true,
      stats: {
        total: clips.length,
        flagged: flagged.length,
        reviewed: reviewed.length,
        corrections: reviewed.filter(
          (c) => c.decision.action === 'unidentifiable' ||
            (c.decision.action === 'reassign' && c.decision.playerId !== c.suggestedPlayerId)
        ).length,
      },
    };
  }

  const api = { CONFIG, REASONS, lookalikeNumbers, detectFlags, resolveClips, computePublishPlan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SRLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
