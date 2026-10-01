---
max_turns: 80
timeout_seconds: 2400
runs: 1
plugins: ["../../.."]
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, WebFetch]
---

Videoyu markalı yap ve altyazı ekle: girdiler/clip.mp4. Konuşma metni zamanlı olarak girdiler/altyazi.srt dosyasında hazır. Altyazıyı o dosyadan al, kendin yeniden yazıya dökme. Soru sorma.
