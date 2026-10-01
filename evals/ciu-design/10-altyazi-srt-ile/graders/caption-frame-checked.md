---
type: 'llm'
---

PASS if, before the full render, the agent rendered at least one still frame during speech (remotion still ... --frame=N with N inside the speech, roughly 15..240) and looked at it, and the cue texts come from the supplied SRT (not re-transcribed). FAIL if it rendered the video without checking a caption frame, or rewrote the speech text itself.
