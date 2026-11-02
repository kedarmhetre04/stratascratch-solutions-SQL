# SidelineReel: Product Manager Assessment
**Candidate:** Kedar Mhetre · kedar.mhetre04@gmail.com
**Prototype:** [PROTOTYPE LINK] · **Video:** [VIDEO LINK]

---

## TL;DR

- **Build next: Confident Tagging.** Stop putting the wrong kid's clip in a child's reel. Today jersey-number mix-ups (4↔14, 1↔11, swapped digits) cause it. Clips with a confusable number go to a one-tap coach check before they reach a personal reel. Parents get a "Not my kid" button.
- **Why:** this is the only problem that appears in every source: support tickets from 3 different clubs (one of them Ridgeline), the analytics note on unopened reels, and the reason reels drive renewals at all. Getting tagging wrong damages trust in the product's core promise.
- **The dashboard number misleads.** The 92% share rate only counts reels that were opened. About 30% of reels are never opened, so the share rate across all generated reels is about **64%** (0.70 × 0.92). The gap between 92% and 64% is where the real problem is.
- **Not building next:** full livestreaming (including as a promise to Ridgeline) and expanding the Reel Editor. The survey asks for the editor, but usage data contradicts the survey.
- **Ridgeline:** we give Carla something concrete that is not a livestream date. We fix the problem her own parents are reporting before signups open, and we run a dated livestream discovery with Ridgeline as design partner. Draft reply is in §1.5.

---

## Task 1: The roadmap call

### 1.1 What the evidence actually says

| Signal | What it says on the surface | What I read from it |
|---|---|---|
| Survey: 58% want more editing controls (M2) | Build a better editor | Stated preference. Behaviour disagrees: 6% of parents opened the editor and **<1% of those finished an edit** (~0.06% of parents). The Share button is used on 90% of auto-recaps. Parents value the product because it needs no effort from them. |
| 3 wrong-kid tickets from 3 clubs (M3) | Edge-case bugs | It is one systematic failure: **similar jersey numbers** (4/14, 1/11, swapped digits). It repeats across sports (soccer, lacrosse, baseball) and across clubs. Tickets undercount: most parents who see the wrong kid don't file one, they stop opening reels. |
| Reel Share Rate 92% (M5) | Healthy | The figure is only measured over reels that were opened. About 30% of generated reels go unopened. Analytics names two causes: **wrong-kid thumbnails on similar numbers** and late-night notifications. Measured over all generated reels, the share rate is about **64%**. |
| Ridgeline wants livestream, $180k at risk (M1, M4) | Commit to livestream | Real commercial risk, but the request comes from one account. Carla also says highlight reels are *why half our parents renewed*. One of the wrong-kid tickets is **from a Ridgeline parent**. Making the reels trustworthy protects her renewal story. A livestream promise we can't keep in 6 weeks would damage it. |
| App icon, missing watermark (M3) | Polish | Low impact, single reports, no trust or revenue consequence. Goes to the backlog. |

### 1.2 Ranked roadmap

Scoring: **Reach** (share of families affected), **Impact** on the north-star metric (*generated reels that are opened and shared*), **Confidence** in the evidence, **Effort** (S/M/L; T-shirt sizes are my guesses, to validate with engineering).

| # | Candidate | Evidence | Reach | Impact | Confidence | Effort | Call |
|---|---|---|---|---|---|---|---|
| **1** | **Confident Tagging**: confusable-number detection, confidence routing, coach one-tap check, parent "Not my kid", thumbnails only from trusted clips | M3 ×3 tickets, M5 analytics note, M1 (reels drive renewal) | High: any roster with 4/14, 1/11, 12/21… (most rosters) | High: wrong-kid thumbnails are a named cause of the 30% unopened | High | M | **Build now.** Ship to pilot clubs in ~3 weeks and to everyone before Ridgeline signups (6 wks). |
| **2** | **Notification timing**: deliver reels in a sensible local-time window instead of late at night | M5 analytics note | All families | Medium–High on open rate | Medium (cause is named, size isn't) | S | **Build now, in parallel.** Small enough for a second engineer, and it acts on the same unopened-reel metric. |
| **3** | **Fix the health metric**: report share rate over *generated* reels; add open rate and wrong-kid rate | M5 | Internal | Enables decisions | High | S | **Do now** (analytics). Without it we can't prove #1 or #2 worked. |
| **4** | **Livestream discovery with Ridgeline as design partner.** Find the underlying need (grandparents? scouts? real-time vs same-day?). Test a lighter option such as a shareable **full-game replay link** posted the same day | M1, M4 | One large account, unknown elsewhere | Retention risk on $180k | Low (one voice) | S for discovery; L+ for the build | **Discover now, decide by a date.** Give Carla a decision date, not a ship date. |
| 5 | Watermark missing on camera-roll save | M3 | Low | Low | Medium | S | Backlog (bug triage) |
| 6 | Multi-sport app icon | M3 | Low | Low | Low | S (design) | Backlog. Pass to design/brand. |

### 1.3 What I would NOT build next, and why

1. **Full livestreaming, including as a commitment to Ridgeline before signups.**
   - It's a different product: real-time video infrastructure, sideline connectivity, latency, and moderation. It is not a feature of a highlights pipeline. It cannot be built well in 6 weeks, and a rushed promise turns a renewal risk into a trust problem.
   - Livestreaming minors to "college scouts" and the public raises **safeguarding and consent** questions (club consent policies, opt-outs, who can access the stream) that need club and legal input before any commitment.
   - The evidence for it comes from one account's board, passed on twice by Sales. We should confirm the real need first: grandparents watching may be fine with a same-day replay, and scouts rarely need real time.
2. **Expanding the Reel Editor (trim, music).** It's the most-requested survey item (58%), but <1% of the 6% of parents who opened the editor finished an edit. Parents say they want control, but what they actually do is share automatic recaps. Adding features to a tool almost nobody finishes using takes effort away from the automatic output that drives sharing. I'd revisit it only after finding out why editing sessions are abandoned.
3. **App icon / watermark.** These are real but minor, so they go to the backlog. They don't change trust, open rate or renewal.

### 1.4 Success metrics for the quarter

- **North star:** % of *generated* reels opened **and** shared (baseline ≈ 64%).
- **Leading:** wrong-kid rate per 1,000 clips published to personal reels (needs instrumenting; baseline in week 0); % reels opened within 24h.
- **Guardrails:** median clips per personal reel (must not fall >10%); coach time spent reviewing per game.

### 1.5 What we tell Carla (draft, via Jamal)

> Carla, thank you for pushing on this. I'll give you a concrete answer rather than a vague one.
> **Before your signups open**, we're shipping a fix to the problem one of your own Ridgeline parents reported: highlights going to the wrong child when jersey numbers look alike (4 vs 14). Ridgeline will be one of the first clubs on it, in about 3 weeks.
> **On live streaming**: we won't promise a ship date we can't keep. We'd like Ridgeline to be our design partner. We'll spend 30 minutes with you and a board member in the next two weeks to understand who needs to watch live, and why. We'll give you a written go / no-go and scope **by [date, before your board meeting]**. If a same-day full-game replay link for grandparents covers most of the need, that's something we could pilot this season.

Sales is right that this has to be concrete. It is: a dated ship for the fix, and a dated decision on livestreaming.

---

## Task 2: Spec. Confident Tagging

### 2.1 Problem

Roster tagging assigns a clip to a kid by reading the jersey number. When two roster numbers look alike (one contains the other, like 4/14 or 1/11, swapped digits like 12/21, or similar digit shapes like 3/8), the system confidently picks one. The clip and sometimes the **reel thumbnail** then go to the wrong family. Parents see another child, are disappointed, and stop opening reels (named cause of ~30% unopened reels).

### 2.2 Outcome

Families only see their own child in their child's reel. The product should treat being uncertain as better than being wrong, and should spend as little coach time as possible doing it.

| Metric | Baseline | Target (6 weeks after GA) |
|---|---|---|
| Wrong-kid clips per 1,000 clips published to personal reels ("Not my kid" flags + support tickets) | Instrument in week 0 | **−80%** |
| Wrong-kid thumbnails | Unknown | **0 by design** (thumbnails only from trusted clips) |
| Generated reels opened within 24h | ~70% | **≥ 78%** (shared with Notification timing work) |
| *Guardrail:* median clips per personal reel | Week-0 value | No more than 10% drop |
| *Guardrail:* coach review time per game | n/a | Median ≤ 60 seconds |

### 2.3 How it works

1. **Confusable pairs per roster.** When a roster is saved, compute which numbers on it can be mistaken for each other:
   - one number contains the other: 4/14, 1/11, 1/12, 2/12
   - swapped digits: 12/21, 13/31
   - similar-looking digits in the same position: 1/7, 3/8, 6/8, 5/6, 0/8 (list owned by ML, tunable).
2. **Route every tagged clip** using the detected number, confidence, and the confusable list:
   - **Auto:** confidence ≥ auto threshold *and* the number has no confusable neighbour on the roster → goes straight to the kid's reel.
   - **Coach check:** number is confusable *or* confidence is between the thresholds → held for a coach decision.
   - **Team recap only:** confidence below the low threshold, or number not on the roster → used in the team recap with no name caption, not in any personal reel.
3. **Coach check:** a batched "Check N clips before tonight's reels" card in the coach app. Each clip shows a short loop or still, a zoomed jersey crop, and the candidate kids side by side (e.g. "#4 Maya" / "#14 Sofia") plus "Neither / other team". One tap per clip.
4. **Cut-off and fail-safe:** the queue closes 60 min before the scheduled reel send. **Clips nobody reviewed are held back.** They are not guessed. The reel sends on time with the trusted clips. If a held clip is confirmed later, it's added to the reel and the family is not notified again.
5. **Thumbnails** are chosen only from Auto or coach-confirmed clips.
6. **"Not my kid"** on every clip in the parent view: one tap hides it from that reel for all viewers. The clip goes back to the coach queue as "Parent flagged" and is logged as a wrong-kid event.
7. All coach confirmations and corrections are stored as labelled examples for ML.

### 2.4 Scope

**In scope (v1)**
- Confusable-pair computation per roster (soccer, lacrosse, baseball rosters)
- Confidence + confusable routing with two thresholds, configurable by Ajaia staff (not by clubs)
- Coach check queue (mobile), one-tap decisions, cut-off and hold-back behaviour
- Thumbnail eligibility rule
- Parent "Not my kid" flag and its routing
- Instrumentation: route decision, coach decision and latency, flags, wrong-kid rate dashboard
- Fixing the Reel Share Rate definition (share over generated reels, alongside the existing metric)

**Out of scope (v1), and why**
- **Face recognition or any biometric matching of minors**: consent and legal exposure. Not a shortcut we take.
- Retraining or replacing the jersey-number model. v1 only collects labels for it.
- Coach notifications for every individual clip (batch only)
- Parent-side re-tagging ("this is actually Ava"). Parents can only remove clips. Coaches assign.
- Livestreaming, Reel Editor changes, auto-recap layout changes
- Club-admin settings for thresholds

### 2.5 Where a human stays in the loop

| Who | Decides | Why a human |
|---|---|---|
| **Coach** | Which kid a confusable or medium-confidence clip belongs to, or that it's an opponent | Knows the kids. Can resolve in one second what the model can't. |
| **Parent** | That a clip is *not* their child (removal only) | Most reliable judge of their own child. Can't move clips to other kids, which would cause new errors. |
| **Ajaia ML/PM** | Threshold values and the confusable-digit list, reviewed weekly against audit data | Trade-off between coach workload and accuracy is a product decision |
| **Support** | Can see the routing and decision log for any clip | Can explain to families what happened |

The system never guesses on ambiguous clips: if no human decides, the clip is held back.

### 2.6 Acceptance criteria

1. **Pairs:** a roster with #4 and #14 lists the pair {4, 14}. A roster with #4 but no #14 does not. {1,11}, {12,21} and {3,8} are each detected when both numbers are on the roster.
2. **Routing to check:** a clip read as #4 at 0.95 confidence on a roster containing #14 goes to Coach check and appears in **no** personal reel before a decision.
3. **Auto:** a clip read as #23 at ≥ auto threshold, with #23 having no confusable neighbour, goes into #23's reel with no coach action.
4. **Low confidence:** a clip below the low threshold appears in the team recap without a name caption and in no personal reel.
5. **Unknown number:** a clip whose number isn't on the roster is treated as in criterion 4.
6. **Coach confirm:** when the coach confirms "#14 Sofia", the clip appears in Sofia's reel within 5 minutes (or in the scheduled send if before the cut-off).
7. **"Neither / other team":** the clip is removed from all personal reels and kept in the recap only if the coach chooses to keep it.
8. **Cut-off:** with 2 unreviewed clips at cut-off, reels still send on time without them. A kid whose only clips are unreviewed gets no personal reel that week but still gets the team recap.
9. **Thumbnail:** across a 50-game test set, no thumbnail ever comes from a clip that was held or unconfirmed.
10. **"Not my kid":** after tapping it, the clip disappears from that reel for every viewer within 60 seconds, a `clip_flagged_wrong_kid` event is logged, and the clip shows in the coach queue tagged "Parent flagged".
11. **Coach effort:** each decision takes ≤ 2 taps. The card shows both candidate names and numbers, a jersey crop, and the game minute.
12. **Golden set:** on a labelled set of ≥ 500 confusable clips (including the three ticket cases: 4/14, 1/11, swapped digits), clips assigned to the **wrong** personal reel ≤ 0.5%.
13. **Instrumentation:** route decision, coach decision and time to decide, flags, and the reel-open timestamp are all present for 100% of clips in staging.

### 2.7 Top two ways this fails after launch, and what catches each

**Failure 1: coaches don't review the queue, or tap without looking.**
Volunteer coaches are busy. If the queue is large, coaches ignore it, so reels get thinner and parents complain that their kid is missing. Or coaches tap the first option every time, and the errors get a human approval stamp.
- **What catches it:** per-team queue completion rate. Median time per decision (< 1s suggests coaches aren't looking). Coaches who always pick the first candidate. Median clips per reel against baseline (guardrail). "My kid has no highlights" tickets.
- **Response:** alert when completion falls below 60% for a team 2 weeks running. Tune thresholds so the queue stays ≤ ~5 clips per game. Shuffle candidate order on each card. Nudge with a team-manager fallback reviewer.

**Failure 2: the model is confidently wrong in a way the confusable rules don't cover.**
Examples: the opposing team's #14 gets tagged as our #14. Digit pairs we didn't list (say 2/7 on faded pinnies). Calibration that varies by sport or uniform. These clips route as Auto and go wrong the same way as today.
- **What catches it:** "Not my kid" flag rate per 1,000 Auto-routed clips, sliced by sport, club and number pair (a spike points to a missing rule). A weekly human audit of 200 random Auto clips. Support tickets tagged "wrong kid".
- **Response:** add the pair to the confusable list (a configuration change, no release needed). Raise the auto threshold for that sport. Send opponent-tag cases to ML as a team-colour signal for v2.

### 2.8 Rollout

- **Wk 0:** instrument the baseline wrong-kid rate and fix the metric definition.
- **Wk 1–3:** build behind a flag.
- **Wk 3–4:** pilot with Ridgeline, Brightwater and Cobblestone (the clubs that filed tickets) and watch both failure signals daily.
- **Wk 5:** GA, before Ridgeline signups open in week 6.

### 2.9 Open questions / assumptions
- Effort estimates are mine. Engineering to size before we commit to the pilot date.
- Do we have confidence scores per clip today? (Assumed yes. If not, v1 routes on confusable pairs only.)
- Is there a team-colour signal in the existing model that would help with opponent mis-tags?
- Reel send schedule per club (the cut-off depends on it).

---

## Task 3: Prototype

**Link:** [PROTOTYPE LINK] (single self-contained HTML file: `ajaia-pm-assessment/prototype.html`, opens in any browser)

It covers the three steps that matter, using sample data for a Ridgeline U12 roster that has the real ticket pairs (#4 Maya / #14 Sofia, #1 / #11, #12 / #21):
1. **Routing**: what the pipeline does with one game's clips. Confusable pairs are computed live from the roster, and each clip is routed Auto / Coach check / Team recap only. Two threshold sliders show the trade-off between coach workload and accuracy.
2. **Coach check**: the one-tap queue with jersey crop and side-by-side candidates, including an opponent wearing #14.
3. **Parent reel**: a kid's reel with a **Today / With Confident Tagging** toggle. "Today" shows Sofia's clip landing in Maya's reel (the ticket). "Not my kid" removes a clip and sends it back to the coach.

---

## Task 4: AI workflow note

> ✏️ *Kedar: rewrite this in your own words so it is accurate. Below is a starting point based on how this session actually went.*

I used Claude (Claude Code) as a co-pilot for all four tasks. It helped me organise the five materials into an evidence table, calculated the share rate over all generated reels (~64%), drafted the spec structure and acceptance criteria, and built the HTML prototype. I kept these decisions for myself: [the final ranking and the call not to commit to livestreaming for Ridgeline / the wording of the message to Carla / the coach-check cut-off and fail-safe rule / the out-of-scope call on face recognition: *keep the ones that are true*]. One thing I changed or didn't use: [*fill in a real example, e.g. a threshold, a metric target, or wording you rejected and why*].

---

## Video outline (5–10 min)

1. **(0:00–0:45) The answer first:** "We build Confident Tagging next, not livestreaming. Here's why."
2. **(0:45–3:00) Roadmap:** the 92%→64% share-rate correction. Survey vs behaviour on the editor. Three tickets, one systematic failure. Ranked table. Not-building list. The Carla reply.
3. **(3:00–5:00) Spec:** routing rules, hold back rather than guess, human-in-the-loop table, 2–3 acceptance criteria, the two failure modes and what catches them.
4. **(5:00–7:30) Prototype demo:** Parent reel on **Today** (Sofia's clip in Maya's reel) → switch to **With Confident Tagging** → Coach check: confirm #14 Sofia, mark the opponent as "other team" → back to the parent reel → "Not my kid" → Routing tab: move the slider to show the workload trade-off.
5. **(7:30–9:00) About me:** who I am, why this role and why Ajaia, salary expectation: **[your number/range]**.
