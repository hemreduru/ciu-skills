import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = json.load(open(os.path.join(HERE, "templates.json"), encoding="utf-8"))

ROLE_BG = {"title": "hero", "section": "hero", "closing": "closing"}
HERO_ROLES = {"title", "section", "closing"}
EXAMPLE_PATTERNS = [
    r"^\s*(presentation title|text|thank you|your text here)\s*$", r"click to (add|edit)", r"lorem ipsum",
    r"master (title|text) style", r"\b(second|third|fourth|fifth) level\b", r"örnek (metin|başlık)",
    r"(başlık|metin) (eklemek|düzenlemek) için", r"başlığı düzenlemek", r"^\s*(sunum başlığı|metin)\s*$",
]

_TR = str.maketrans("ığüşöçİĞÜŞÖÇ", "igusocIGUSOC")


def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.translate(_TR).lower()).strip("-")
    return s[:60] or "sunum"


def is_example(text):
    return any(re.search(p, text, re.I) for p in EXAMPLE_PATTERNS)


# Myriad Pro averages ~0.5 em per character; 0.52 errs on the safe side. Same estimate for builder and check.
CHAR_EM, LINE_EM, PARA_GAP_EM, INSET_PT = 0.52, 1.2, 0.5, 7.2


def est_height_pt(paras, width_emu, pt, bullets=False, bold=False):
    inner_pt = width_emu / 12700 - 14.4 - (21.6 if bullets else 0)
    per_line = max(1, int(inner_pt / (pt * CHAR_EM * (1.06 if bold else 1))))
    lines = 0
    for p in paras:
        n, cur = 1, 0
        for w in p.split():
            need = len(w) + (1 if cur else 0)
            if cur and cur + need > per_line:
                n, cur = n + 1, len(w)
            else:
                cur += need
            while cur > per_line:
                n, cur = n + 1, cur - per_line
        lines += n
    return lines * pt * LINE_EM + max(0, len(paras) - 1) * pt * PARA_GAP_EM + INSET_PT


def fits(paras, width_emu, height_emu, pt, bullets=False, bold=False):
    return est_height_pt(paras, width_emu, pt, bullets, bold) <= height_emu / 12700


def pick_size(paras, width_emu, height_emu, ladder, bullets=False, bold=False):
    for pt in ladder:
        if fits(paras, width_emu, height_emu, pt, bullets, bold):
            return pt
    return ladder[-1]
