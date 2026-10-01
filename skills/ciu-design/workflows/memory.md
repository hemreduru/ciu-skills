# Memory `$MEMORY` (ciu-hafiza.md)

`H="node <skill>/scripts/hafiza.mjs $MEMORY"`
- `$H show` — print it (do this at the start; `hepsi` lists everything).
- `$H set birim "Mimarlık Fakültesi"` / `set sik "post 1080×1350, reels"`
- `$H add begeni "sade, tek vurgu rengi"` / `add begenmeme "kalın çerçeve"`
- `$H seri "Haftalık Etkinlik" --layout band --vurgu orange --logo official-ciu-color-3lines-tr --etiketler "#HaftalıkEtkinlik" --numara 4` — start or update; `--sonraki` adds 1 and prints `NUMARA=n` (use it as the issue number).
- `$H unut "<text or series name>"` — delete on "unut".

After any write tell the user in one line what was saved. No personal data (phone, ID, e-mail): the script refuses. ENV=claudeai: copy `$MEMORY` to `$OUT` after writing and say "Sonraki sohbette ciu-hafiza.md dosyasını yükle."; setup restores it from `$IN`.
