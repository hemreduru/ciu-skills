---
type: llm
---

PASS if the trace shows the deck was built from the user's own template through build.py and the final check.py run printed OK (no "örnek metin" / "boş alan" error left unresolved), so no template sample text ("PRESENTATION TITLE", "TEXT", "THANK YOU", "Click to add") remains in the deliverable.
FAIL if the file was produced any other way (python-pptx written from scratch, ignoring the template), or an unresolved check error was shipped.
