# SidelineReel — Roster-Tagging Verification (MVP prototype)

Clickable prototype for the Ajaia Product Manager assessment (https://ajaia.ai).
A coach reviews uncertain AI jersey-number matches before personal reels and the weekly recap publish.

**Everything is fictional or simulated:** team data, footage, AI predictions and confidence values. The confidence threshold (75%) is illustrative only.

## Run
Open `index.html` in any browser. No build step and no dependencies. Or serve the folder:
`python3 -m http.server 8000`, then go to http://localhost:8000

## Test the logic
`node tests/logic.test.js`. The tests map to spec acceptance criteria AC1–AC14.

## Files
- `data.js`: fictional roster and two demo scenarios
- `logic.js`: flag detection and publishing gate (pure functions)
- `app.js`: UI and state
- `index.html`: layout and styles
