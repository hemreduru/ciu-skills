# Captions (only on request)

Variables `$WORK`, `$DATA`, `$IN`, `$OUT` come from setup. `S=<skill>/scripts/captions.mjs`.

1. `node $S plan --data $DATA` → `WHISPER=ready|needs-install|unavailable`.
2. **ready / needs-install:** if `needs-install`, tell the user the `UYARI` line (download size and time, one time only) and wait for a yes. Then
   `node $S transcribe <clip> --work $WORK --data $DATA --out $OUT/altyazi.srt --lang tr --names "UKÜ,<unit and person names from the request>" [--install]`.
   Exit code 3 means consent is missing — never add `--install` before the user agrees.
   Whisper and its model live in `$DATA/whisper` (kept between sessions, not in `$WORK`).
3. **unavailable, or transcribe failed:** ask for an SRT or the plain text of the speech. `node $S import <file.srt|file.txt> --out $OUT/altyazi.srt [--seconds <clip length>] [--names …]`. Plain text is spread evenly over the clip: say that the timing is approximate.
4. **Show the text** (the script prints it) and ask for typo fixes. Edit the SRT; keep UKÜ, CIU and department/person names exactly. Cues stay ≤ 32 characters, one line.
5. Put it in the design: `{"video":"klip.mp4","videoSound":true,"srt":"<the SRT text>","seconds":N,…}` (slide `srt` is clip-timed; `trimStartSec` is applied for you). Music with speech: `musicVolume` ≤ 0.3; it ducks by itself.
6. `check.mjs`, render a frame mid-speech and look at it (caption inside the safe area, readable on the footage), then the full render. Deliver `altyazi.srt` too.
