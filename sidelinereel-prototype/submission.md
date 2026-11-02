# SidelineReel: Product Manager Assessment
**Candidate:** Kedar Mhetre · **Company:** Ajaia ([ajaia.ai](https://ajaia.ai))

**Video walkthrough:** [VIDEO LINK — to be added]
**Working prototype:** [NETLIFY LINK — to be added]
**Prototype source:** `sidelinereel-prototype/` (open `index.html`; tests: `node tests/logic.test.js`)

---

## Task 1: The Roadmap Call

### The main product problem
SidelineReel's promise is simple: the right kid's highlights, delivered automatically. The evidence suggests the first part of that promise is breaking. Roster tagging sometimes puts a highlight in the wrong child's reel, most often when jersey numbers look alike. A parent who opens a reel and sees someone else's child loses trust in a way a late or plain reel doesn't cause. The same error also hides part of the product's value from our own health metric.

### Evidence
- **Wrong-kid tagging follows a pattern (M3).** Three tickets this week, from three clubs in three sports (soccer, lacrosse, baseball), describe the same failure: 14 vs. 4, 1 vs. 11, and "swapped digits." One came from **Ridgeline**. Three tickets don't give us an error rate. But the errors look systematic, not random. Tickets also undercount: a parent who sees the wrong thumbnail and never opens the reel is unlikely to file one.
- **Our headline metric overstates engagement (M5).** The 92% Reel Share Rate counts only reels a parent opened. About 30% of generated reels are never opened, so the share rate across all generated reels is roughly 64% (0.92 × 0.70). Analytics names two causes for unopened reels: late-night notifications, and wrong-kid thumbnails (most often with similar jersey numbers). We don't yet know how the 30% splits between them.
- **Auto-delivered content is what families use (M2).** The Share button is used on 90% of weekly auto-recaps sent. That is a different metric from the 92% above: the 90% covers the team recap, the 92% covers personal reels. Both point the same way. Families value what arrives ready to share without any work.
- **Parents ask for editing but don't use it (M2).** 58% of survey respondents (n=210, 40 clubs) named editing controls as their top request. In the last 90 days, only 6% of parents opened the Reel Editor, and fewer than 1% of those finished an edit.
- **Ridgeline's renewal is at real risk (M1, M4).** Ridgeline is our largest club account at $180k a season, with renewal and signups opening in six weeks. Carla's board wants livestreaming, and Sales calls this our highest-risk renewal this quarter. Carla also says highlight reels are "a big part of why half our parents renewed."

### Ranked roadmap
| Rank | Item | Decision | Why |
|---|---|---|---|
| 1 | **Roster-tagging accuracy:** stop uncertain or ambiguous jersey-number matches from being published to the wrong child | **Build now** | It protects the core promise across every club, including Ridgeline. The first version focuses on catching uncertain matches before they publish, not on a full model retrain. |
| 2 | **Unopened-reel causes / notification timing** | **Investigate now** | Measure how much of the 30% comes from late notifications vs. wrong thumbnails. The result could change priority #1's scope or move notification timing up. |
| 3 | **Ridgeline livestreaming** | **Investigate now** (7-day evaluation) | A $180k renewal deserves a real answer: customer requirements, strategic fit, feasibility, cost, and smaller or phased alternatives, worked through with Sales and Engineering. |
| 4 | **Expanded reel editing controls** | **Defer** | What parents say and what they do conflict. We need to understand why people abandon the editor before building more of it. |
| 5 | **Watermark on camera-roll save; app icon** | **Backlog** | Each comes from a single ticket and neither affects trust or retention. The coach called the watermark "not urgent." |

### What we are not building next, and why
**Full livestreaming.** It is a new product line, not an improvement to the one families renew for. Sales calls it "a big lift," and the only evidence of demand is one account's board. We have no cost or feasibility estimate. Committing to it in a six-week window would mean promising something we haven't scoped, and it would likely delay the accuracy work that affects every club, Ridgeline included. If the evaluation finds a feasible smaller version or pilot, we'll weigh it against priority #1 using real numbers.

**Expanded editing controls.** The 58% survey result doesn't match behavior: fewer than 1% of parents who opened the editor finished an edit. Building more controls before we know why people drop off risks adding to a feature parents don't use. *Open question, not a finding:* some "editing" requests may come from parents trying to work around wrong clips.

### Ridgeline stakeholder response
1. **Now:** acknowledge to Carla the wrong-kid issue her parents reported, and name an owner for it.
2. **Within seven days:** give her a recommendation on livestreaming from the evaluation (including any smaller or phased option), plus an accuracy improvement plan with dates.
3. **No early promises:** we don't commit to fixing accuracy before signups, or to livestreaming, unless Engineering has validated that commitment.

This gives Carla something specific to take to her board: an owner, a date and a plan, rather than "we hear you." It also avoids a promise we might break during her renewal window. The $180k risk stays in front of us. If the evaluation shows livestreaming decides the renewal and a feasible version exists, we reprioritize.

### Uncertainties and reversal conditions
| Uncertainty | What would change the decision |
|---|---|
| The actual tagging error rate (we have 3 tickets, not a rate) | If errors turn out rare **and** notification timing drives most unopened reels **and** it's substantially cheaper to fix, notification timing moves to #1. |
| Livestreaming cost, and whether it decides the renewal | If the evaluation finds a feasible scoped version and Ridgeline confirms it decides the renewal, it gets reprioritized against #1 with real numbers. |
| Why parents abandon the editor | If research shows a specific, fixable blocker, editing could come back sooner. |

### How we'll know it's working
- Wrong-kid reports per personal reels published go down, measured against a baseline we set first.
- Share rate measured across **all generated reels**, not only opened ones, reported next to the existing 92%.
- The open rate for generated reels goes up. Read it together with the notification-timing findings so we credit the right fix.
- Ridgeline-specific wrong-kid tickets go down before its renewal decision.

We have no baseline yet, so targets will be set once instrumentation is live.

---

## Task 2: Spec — Roster-Tagging Verification (MVP)

### 1. Problem and outcome
**Problem.** Roster tagging sometimes puts a highlight in the wrong child's reel, most often when jersey numbers look alike (M3). Wrong-kid clips and thumbnails damage family trust, and analytics names them as one reason about 30% of generated reels are never opened (M5). How often this happens, and how much of the 30% it explains, is unknown.

**Outcome.** Uncertain player matches stop reaching families under the wrong child's name. Reels and the weekly auto-recap keep publishing on their current schedule. Coach review stays small and measured.

### 2. User and user story
**Primary user:** the coach, who already uploads footage and knows the players. **Beneficiary:** the parent.
> As a coach, I want to quickly confirm or fix the few highlights SidelineReel isn't sure about, so that every family sees their own child, without me rebuilding reels by hand.

### 3. Scope
**In scope**
- Ambiguity detection on each clip-to-player attribution.
- One batched coach review queue per game, sent before publishing.
- Review actions: **Confirm**, **Reassign**, **Mark unidentifiable**.
- Publishing gate. A flagged clip publishes under a player's name only after a coach confirms or reassigns it.
- Thumbnail protection. A flagged clip that hasn't been verified is never a reel thumbnail.
- Exclusion of unresolved and unidentifiable clips from the auto-recap.
- A configurable review cutoff tied to the scheduled publish time.
- A "No eligible highlights" state for players and games.
- Instrumentation for tagging accuracy and coach workload.

**Out of scope**
- Model retraining
- Livestreaming
- Changes to notification timing
- New editing controls
- Parent-side reporting
- Automatic updates to a reel after it has published
- Opponent-team players

### 4. Workflow
1. **Tagging (existing).** The model produces clip → jersey number → roster player attributions, each with a confidence value (assumption A1).
2. **Ambiguity check (new).** An attribution is **flagged** if any of these is true:
   - **Low confidence:** confidence is below a configurable threshold.
   - **Look-alike number on the roster:** the predicted number has a plausible visually similar alternative **that is also on this team's roster**. The rule set is configurable and deliberately narrow. Initial rules:
     - (a) an added or dropped digit **"1"** (4↔14, 1↔11)
     - (b) a two-digit transposition (12↔21)
     
     Numbers that merely share a digit (e.g. 23 and 3) are **not** flagged. Engineering validates the rules on real tagging data before launch.
   - **No unique mapping:** the number matches no roster player, or matches more than one.
   
   Attributions that aren't flagged follow the existing pipeline unchanged.
3. **Review queue.** One queue per game holds every flagged attribution. Coaches get one notification per game. No queue is created when nothing is flagged.
4. **Coach review.** For each item, the coach sees a short clip preview, the AI-suggested player, and plausible roster alternatives, with the full roster one tap away. Actions:
   - **Confirm:** the attribution becomes verified.
   - **Reassign:** the clip is attributed to the selected player and marked verified.
   - **Mark unidentifiable:** the clip is excluded from player-attributed publishing and from the recap.
5. **Cutoff.** At the configured cutoff before publish time, the queue locks. Items not yet reviewed become **unresolved**.
6. **Publish (existing schedule).** Reels and the recap publish on time using only eligible clips: unflagged clips plus coach-verified clips. Thumbnails come only from eligible clips.

### 5. Human in the loop
| The AI decides | The coach decides | The system enforces |
|---|---|---|
| Which attributions are uncertain; which players to suggest | Who is actually in each flagged clip, or that nobody can tell | Unverified flagged clips never publish under a child's name; review never blocks the schedule |

When no one responds, the **default is to exclude the clip**. The system never falls back to the AI's best guess.

### 6. Acceptance criteria
1. **Given** an attribution with confidence below the threshold, **when** tagging completes, **then** it is flagged with reason `low_confidence`.
2. **Given** a roster containing #1 and #11, **when** a clip is tagged #11, **then** it is flagged `lookalike` and #1's player appears as an alternative.
3. **Given** a roster with #23 and #3 and no look-alike pair under the rules, **when** a clip is tagged #23 with confidence above the threshold, **then** it is **not** flagged.
4. **Given** a detected number that is not on the roster, or is shared by two players, **when** tagging completes, **then** it is flagged `no_unique_match`.
5. **Given** a game with ≥1 flagged attribution, **when** processing finishes, **then** the team's coaches receive exactly one review notification for that game.
6. **Given** a flagged item, **when** the coach confirms it, **then** the attribution is verified and the clip is eligible for that player's reel.
7. **Given** a flagged item, **when** the coach reassigns it, **then** the clip appears only in the new player's reel.
8. **Given** a flagged item, **when** the coach marks it unidentifiable, **then** the clip appears in no personal reel and not in the recap.
9. **Given** unresolved items at the cutoff, **when** publish time arrives, **then** reels and the recap publish on time and contain none of the unresolved clips.
10. **Given** a player with a flagged, unverified clip, **when** the thumbnail is chosen, **then** it comes only from that player's eligible clips.
11. **Given** a coach acts after the cutoff, **when** the reel has already published, **then** the reel is unchanged and the decision is logged for accuracy measurement.
12. **Given** a game with no flagged attributions, **when** it is processed, **then** publishing behaves exactly as it does today.
13. **Given** a player whose only clips are unresolved or unidentifiable, **when** publishing runs, **then** no reel is created for that player, their status reads "No eligible highlights," and all other eligible reels publish on time.
14. **Given** a game with zero eligible clips, **when** publishing runs, **then** no recap video is created and "No eligible highlights" is shown.

### 7. Edge cases
| Case | Behavior |
|---|---|
| No roster match | Flag as `no_unique_match`. Confirm isn't available; the coach can reassign from the full roster or mark the clip unidentifiable. |
| Duplicate number on the roster | Flag as `no_unique_match` and list both players as alternatives. |
| Ambiguous identity (look-alike number) | Flag, showing the suggested player first and look-alike players as alternatives. |
| Coach doesn't act | Clips are unresolved at the cutoff and excluded. Publishing goes ahead on schedule. |
| Several coaches on a team | Any of them can review. The first decision on an item is final until the cutoff. Every decision is logged with who made it. |
| One clip involves several players | Each attribution is flagged and reviewed on its own. |
| A player has no eligible clips | No empty reel and no unverified clips. Show "No eligible highlights." Other reels aren't delayed. |
| A game has no eligible clips | No recap video is created. Show "No eligible highlights." Other games aren't affected. |
| Coach reviews after the cutoff | The decision is logged; the published reel isn't updated (MVP limitation). |

### 8. Top two post-launch failure modes
**F1. Review fatigue: too many flags.** Coaches ignore the queue, so many real highlights are withheld. Or they tap Confirm on everything without looking, which lets wrong-kid clips through again. The risk is structural: under the look-alike rule, every clip for a player whose number has a roster look-alike is flagged, every week.
*How we'd catch it:*
- Flags per game rising
- Review completion before the cutoff falling
- Withheld-clip rate rising
- Confirm rate near 100% combined with very short time per item
- Parent tickets about missing highlights

*Response:* tighten the rules or the threshold, using the logged coach decisions as evidence.

**F2. Confident wrong matches the rules don't catch.** The model is confidently wrong on a pair the rules don't cover, so the wrong kid still gets published.
*How we'd catch it:*
- Wrong-kid tickets tagged by whether the clip was flagged
- Coach reassignments clustering on number pairs the rules don't cover

*Response:* add those pairs to the rule set and adjust the threshold.

### 9. Success metrics
| Metric | Numerator | Denominator | Intent |
|---|---|---|---|
| Wrong-kid report rate | Wrong-kid support tickets | Personal reels published | ↓ vs. pre-launch baseline |
| Share of wrong-kid reports involving unflagged clips | Wrong-kid tickets on unflagged clips | All wrong-kid tickets | Points to gaps in detection (F2). Tickets show only part of the actual model errors, so this is directional, not a true miss rate. |
| Flag rate | Flagged attributions | All attributions | Workload driver |
| Coach correction rate | Flagged attributions reassigned or marked unidentifiable | Flagged attributions reviewed | Flag precision (near 0% means over-flagging) |
| Review completion | Flagged attributions resolved before cutoff | Flagged attributions | Coach engagement (F1) |
| Coach workload | Median review time per game; flags per game | Games with a review queue | Guardrail |
| Withheld-clip rate | Clips excluded as unresolved or unidentifiable | All clips | Cost of the conservative default |
| On-time publish rate | Reels and recaps published at scheduled time | Reels and recaps scheduled | Guardrail: must not drop |
| Reel open rate | Personal reels opened | Personal reels generated | ↑, read with the notification-timing investigation |
| Share rate (all reels) | Personal reels shared | Personal reels generated | ↑, reported next to the existing 92% opened-only figure |

No targets until we have a baseline.

### 10. Assumptions and open engineering questions
**Assumptions**
- **A1.** The model exposes a confidence value for each attribution.
- **A2.** Rosters store a jersey number for every player.
- **A3.** Coaches can receive notifications and use the review screen in the app.
- **A4.** Publishing runs on a schedule, so a cutoff can be set relative to it.
- **A5.** Uploaded and sideline-camera footage go through the same tagging pipeline.

**Open questions**
- **E1.** Does the auto-recap show player identity? MVP default: leave unidentifiable clips out of the recap.
- **E3.** Initial threshold, look-alike rule set and cutoff length, all validated on historical data.
- **E4.** If A1 is false, fall back to the look-alike and no-unique-match rules only.
- **E5.** How do we label wrong-kid tickets so the baseline is reliable?

*(E2, what happens when no clips are eligible, was resolved by AC13 and AC14.)*

---

## Task 3: Working Prototype

**Link:** [NETLIFY LINK — to be added] · **Source:** `sidelinereel-prototype/` (plain HTML, CSS and JavaScript, no build step)

### The three core screens
1. **Coach Review Queue.** Shows the team, the game, the review cutoff and scheduled publish time, review progress, and each flagged highlight with its AI-suggested player and the reason it was flagged. There is also a small instrumentation panel showing flag rate, correction rate, review completion, median decision time and late decisions logged.
2. **Player Verification.** A simulated clip preview you can play. It shows the AI's jersey read and confidence, a plain-language explanation of why the clip was flagged, the look-alike alternatives, and the full roster. All three actions (Confirm, Reassign, Mark unidentifiable) update state and move on to the next flagged clip.
3. **Publishing Preview.** Lists each player's reel (with its thumbnail or "No eligible highlights"), the recap contents, unresolved clips and coach-excluded clips, and whether it is safe to publish. Demo buttons move the clock forward to the cutoff and then to the scheduled publish. After cutoff, decisions are logged but don't change reels.

### Demo data
- **Standard game:** 12 highlights.
  - 5 flagged:
    - #14 (look-alike of #4)
    - #11 (look-alike of #1)
    - #8 (low confidence)
    - #30 (no roster match)
    - #21 (transposition of #12)
  - 7 trusted.
- **Evening game:** 3 highlights, all flagged. Shows that no recap video is created when nothing is eligible.

### Verified behavior
- **17 automated logic tests** map to AC1–AC14, plus a guard test.
- **Exhaustive audit** of all 12,600 decision combinations across both scenarios, with zero failures. Every combination checked that:
  - each clip is exactly one of eligible, unresolved or excluded
  - personal reel clip counts sum to the eligible count
  - the recap contains only eligible clips
  - thumbnails always come from that player's eligible clips
  - "No eligible highlights" appears exactly when a player has zero eligible clips
- **Browser test (Chromium, desktop and 390px mobile)**, no console errors. Example run: reassign #14 to #4, confirm #11, mark #8 unidentifiable, leave #30 and #21 unreviewed. Result:
  - 9 eligible clips
  - 8 personal reels published
  - a recap with 9 clips
  - 2 unresolved clips and 1 excluded clip withheld
  - Leo (#8) and Sofia (#21) show "No eligible highlights"
- **Personally reviewed** by me in Chrome: review queue, verification, publishing preview and scheduled publish.

### What is simulated
- Footage is an animated pitch labeled "SIMULATED FOOTAGE." There is no real video or computer vision.
- AI jersey reads and confidence values are fixed sample data. The 75% threshold is illustrative, not a recommendation.
- Time is simulated with buttons. Notifications, login and multiple coaches aren't modeled.
- Team, players and games are fictional.

---

## Task 4: AI Workflow Note

I used Claude as a critical-thinking partner and Claude Code as the implementation engine. I made the product decisions.

- **Analysis and challenge (Claude):** Claude extracted facts, contradictions and unknowns from the five materials without choosing a winner. It then challenged my first answer: I had jumped from the problem to a solution, I couldn't attribute the 30% unopened reels to tagging alone, and three tickets aren't a rate. It also pointed out the Ridgeline wrong-kid ticket, which I then used to connect accuracy work to the $180k renewal.
- **Decisions I made:** the #1 priority; a 7-day livestreaming evaluation instead of a commitment; and the Ridgeline response (acknowledgement, a named owner, a dated plan). I **modified** Claude's suggestion to give Carla a dated accuracy commitment: we promise nothing before signups unless Engineering validates it. I **moved** notification timing from Claude's proposed "defer" to "investigate now." I **kept parent-side reporting out of scope** when Claude offered it as an optional secondary signal. On the spec, Claude laid out options for five behaviors (detection, verification, no response, recap and thumbnails, cutoff) and I approved each with changes:
  - a narrower detection rule
  - a fixed set of five review steps
  - no automatic updates after publishing
  - an explicit "No eligible highlights" state
  - renaming a metric so support tickets aren't presented as a complete measure of model errors
- **Implementation (Claude Code):** Claude Code wrote the prototype, the logic tests, a browser test and an exhaustive state audit, and ran all of them. I opened and reviewed the prototype myself in Chrome.
- **What the AI got wrong:**
  - The look-alike rule Claude first wrote into the spec ("one-digit add or drop") would have flagged #1 against #12, #14 and #21, which is the over-flagging I had told it to avoid. Claude caught this while coding and narrowed it to an added or dropped "1" plus transpositions. It flagged the change for my approval instead of applying it silently.
  - The final audit found a logic gap. The publishing logic would have accepted "confirm" on a clip with no roster match, although the UI blocked that action. It was fixed with a guard and a test.
  - Claude had miscounted the published reels in its build summary (7 instead of 8). The audit caught that as well.

---
*Built for the Ajaia Product Manager assessment · [ajaia.ai](https://ajaia.ai)*
