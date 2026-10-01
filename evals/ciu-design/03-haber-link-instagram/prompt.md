---
max_turns: 60
timeout_seconds: 1800
runs: 1
plugins: ["../../.."]
append_system_prompt: "Evaluation harness note: after the final render, also copy the final image to eval-final.png in the current working directory. This is only a copy; keep the normal output file as well."
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, WebFetch]
---

Şu haberi Instagram postuna çevir: https://ciu.edu.tr/tr/haberler/uku-2026-2027-yili-oryantasyon-gunleri-basliyor
