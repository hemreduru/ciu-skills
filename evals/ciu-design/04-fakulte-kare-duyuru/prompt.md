---
max_turns: 60
timeout_seconds: 1800
runs: 1
plugins: ["../../.."]
append_system_prompt: "Evaluation harness note: after the final render, also copy the final image to eval-final.png in the current working directory. This is only a copy; keep the normal output file as well."
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, WebFetch]
---

Mühendislik Fakültesi için 'Robotik Atölyesi' duyurusu, kare format. Fotoğraf: girdiler/photo-2.jpg
