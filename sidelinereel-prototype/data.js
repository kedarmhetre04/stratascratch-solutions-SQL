/* Fictional sample data. All jersey detections and confidence values are SIMULATED. */
(function (root) {
  'use strict';

  const roster = [
    { id: 'p01', number: 1, name: 'Mia Alvarez' },
    { id: 'p03', number: 3, name: 'Jack Wilson' },
    { id: 'p04', number: 4, name: 'Ava Patel' },
    { id: 'p05', number: 5, name: 'Maya Johnson' },
    { id: 'p06', number: 6, name: 'Owen Brooks' },
    { id: 'p07', number: 7, name: 'Zoe Okafor' },
    { id: 'p08', number: 8, name: 'Leo Martinez' },
    { id: 'p09', number: 9, name: 'Sam Torres' },
    { id: 'p11', number: 11, name: 'Noah Kim' },
    { id: 'p12', number: 12, name: 'Ethan Park' },
    { id: 'p14', number: 14, name: 'Lily Chen' },
    { id: 'p21', number: 21, name: 'Sofia Nguyen' },
    { id: 'p23', number: 23, name: 'Grace Liu' },
  ];

  const scenarios = {
    standard: {
      key: 'standard',
      label: 'Standard game',
      team: 'Maple Grove FC — U10 Comets',
      opponent: 'Harbor City United',
      date: 'Sat, Nov 1 · 10:00 AM',
      score: '4–2 W',
      publishAt: 'Sun 6:00 PM',
      cutoffAt: 'Sun 4:00 PM',
      clockStart: 'Sun 1:15 PM',
      roster,
      clips: [
        { id: 'c01', minute: 12, moment: 'Goal', detectedNumber: 9, confidence: 0.96 },
        { id: 'c02', minute: 18, moment: 'Save', detectedNumber: 3, confidence: 0.93 },
        { id: 'c03', minute: 22, moment: 'Big play', detectedNumber: 7, confidence: 0.91 },
        { id: 'c04', minute: 27, moment: 'Goal', detectedNumber: 14, confidence: 0.88 },
        { id: 'c05', minute: 27, moment: 'Assist', detectedNumber: 5, confidence: 0.94 },
        { id: 'c06', minute: 33, moment: 'Shot on target', detectedNumber: 11, confidence: 0.9 },
        { id: 'c07', minute: 38, moment: 'Breakaway', detectedNumber: 8, confidence: 0.58 },
        { id: 'c08', minute: 41, moment: 'Tackle', detectedNumber: 30, confidence: 0.84 },
        { id: 'c09', minute: 45, moment: 'Goal', detectedNumber: 21, confidence: 0.86 },
        { id: 'c10', minute: 47, moment: 'Goal-line block', detectedNumber: 23, confidence: 0.95 },
        { id: 'c11', minute: 50, moment: 'Assist', detectedNumber: 9, confidence: 0.92 },
        { id: 'c12', minute: 52, moment: 'Big play', detectedNumber: 6, confidence: 0.89 },
      ],
    },
    allFlagged: {
      key: 'allFlagged',
      label: 'Evening game (all clips flagged)',
      team: 'Maple Grove FC — U10 Comets',
      opponent: 'Lakeside Rovers',
      date: 'Thu, Oct 30 · 6:30 PM (floodlights)',
      score: '1–1 D',
      publishAt: 'Sun 6:00 PM',
      cutoffAt: 'Sun 4:00 PM',
      clockStart: 'Sun 1:15 PM',
      roster,
      clips: [
        { id: 'e01', minute: 9, moment: 'Goal', detectedNumber: 4, confidence: 0.66 },
        { id: 'e02', minute: 24, moment: 'Save', detectedNumber: 8, confidence: 0.52 },
        { id: 'e03', minute: 40, moment: 'Big play', detectedNumber: 23, confidence: 0.61 },
      ],
    },
  };

  const api = { roster, scenarios };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SRData = api;
})(typeof window !== 'undefined' ? window : globalThis);
