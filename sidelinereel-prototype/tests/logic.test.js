// Run: node tests/logic.test.js  (maps to spec acceptance criteria)
const assert = require('assert');
const L = require('../logic.js');
const { scenarios } = require('../data.js');

const g = scenarios.standard;
const byId = (plan, id) => plan.clips.find((c) => c.id === id);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('✓', name); };

t('AC1 low confidence flagged', () => {
  assert.ok(byId(L.computePublishPlan(g, {}), 'c07').reasons.includes('low_confidence'));
});
t('AC2 #11 flagged as look-alike with #1 as alternative', () => {
  const c = byId(L.computePublishPlan(g, {}), 'c06');
  assert.ok(c.reasons.includes('lookalike'));
  assert.ok(c.alternativeIds.includes('p01'));
});
t('AC2 #14↔#4 and #21↔#12 transposition flagged', () => {
  const p = L.computePublishPlan(g, {});
  assert.ok(byId(p, 'c04').alternativeIds.includes('p04'));
  assert.ok(byId(p, 'c09').alternativeIds.includes('p12'));
});
t('AC3 shared digit alone is NOT flagged (#23 vs #3, #9)', () => {
  const p = L.computePublishPlan(g, {});
  assert.strictEqual(byId(p, 'c10').flagged, false);
  assert.strictEqual(byId(p, 'c01').flagged, false);
});
t('AC4 number not on roster → no_unique_match', () => {
  assert.ok(byId(L.computePublishPlan(g, {}), 'c08').reasons.includes('no_unique_match'));
});
t('AC4 duplicate roster number → no_unique_match', () => {
  const dup = Object.assign({}, g, { roster: g.roster.concat([{ id: 'px', number: 9, name: 'Dup' }]) });
  assert.ok(byId(L.computePublishPlan(dup, {}), 'c01').reasons.includes('no_unique_match'));
});
t('Exactly 5 flagged in standard scenario', () => {
  assert.strictEqual(L.computePublishPlan(g, {}).stats.flagged, 5);
});
t('AC6 confirm → verified, in suggested player reel', () => {
  const p = L.computePublishPlan(g, { c04: { action: 'confirm' } });
  assert.strictEqual(byId(p, 'c04').status, 'verified');
  assert.ok(p.reels.find((r) => r.player.id === 'p14').clips.some((c) => c.id === 'c04'));
});
t('AC7 reassign → only in new player reel', () => {
  const p = L.computePublishPlan(g, { c04: { action: 'reassign', playerId: 'p04' } });
  assert.ok(p.reels.find((r) => r.player.id === 'p04').clips.some((c) => c.id === 'c04'));
  assert.ok(!p.reels.find((r) => r.player.id === 'p14').clips.some((c) => c.id === 'c04'));
});
t('AC8 unidentifiable → in no reel and not in recap', () => {
  const p = L.computePublishPlan(g, { c06: { action: 'unidentifiable' } });
  assert.ok(p.reels.every((r) => !r.clips.some((c) => c.id === 'c06')));
  assert.ok(!p.recap.clipIds.includes('c06'));
});
t('AC9 unresolved never publish; trusted still publish', () => {
  const p = L.computePublishPlan(g, {});
  const unresolved = p.unresolved.map((c) => c.id);
  assert.strictEqual(unresolved.length, 5);
  p.reels.forEach((r) => r.clips.forEach((c) => assert.ok(!unresolved.includes(c.id))));
  unresolved.forEach((id) => assert.ok(!p.recap.clipIds.includes(id)));
  assert.strictEqual(p.recap.clipIds.length, 7);
  assert.strictEqual(p.safeToPublish, true);
});
t('AC10 thumbnails only from eligible clips', () => {
  const p = L.computePublishPlan(g, {});
  const eligible = new Set(p.eligible.map((c) => c.id));
  p.reels.forEach((r) => { if (r.thumbnailClipId) assert.ok(eligible.has(r.thumbnailClipId)); });
});
t('AC12 nothing flagged → all clips trusted', () => {
  const clean = Object.assign({}, g, { clips: g.clips.filter((c) => [9, 3, 7, 5, 23, 6].includes(c.detectedNumber)) });
  const p = L.computePublishPlan(clean, {});
  assert.strictEqual(p.stats.flagged, 0);
  assert.strictEqual(p.eligible.length, clean.clips.length);
});
t('AC13 player whose only clip is unresolved → no_eligible, others publish', () => {
  const p = L.computePublishPlan(g, {});
  const leo = p.reels.find((r) => r.player.id === 'p08');
  assert.strictEqual(leo.status, 'no_eligible');
  assert.strictEqual(leo.thumbnailClipId, null);
  assert.strictEqual(leo.withheld, 1);
  assert.strictEqual(p.reels.find((r) => r.player.id === 'p09').status, 'publish');
});
t('AC14 game with zero eligible clips → no recap video', () => {
  const p = L.computePublishPlan(scenarios.allFlagged, {});
  assert.strictEqual(p.recap.create, false);
  assert.ok(p.reels.every((r) => r.status === 'no_eligible'));
});
t('Correction rate counts reassign + unidentifiable only', () => {
  const p = L.computePublishPlan(g, { c04: { action: 'confirm' }, c06: { action: 'reassign', playerId: 'p01' }, c07: { action: 'unidentifiable' } });
  assert.strictEqual(p.stats.reviewed, 3);
  assert.strictEqual(p.stats.corrections, 2);
});
console.log(`\n${n} tests passed`);
