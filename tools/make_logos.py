#!/usr/bin/env python3
"""raw/{logos,units} → remotion/public/brand/{logos,units} + src/logos.json (+ raw/contact-sheet.png)."""
import json
import re
import subprocess
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
REM = ROOT / "skills/ciu-design/remotion"
PUBLIC = REM / "public/brand"
VECTOR_TO_SVG = {".pdf", ".ai", ".eps"}
RASTER = {".png", ".jpg", ".jpeg"}
TR = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.translate(TR)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def tone_of(name: str) -> str:
    n = f"-{slug(name)}-"
    if re.search(r"-(beyaz|white|negatif)-", n):
        return "white"
    if re.search(r"-(siyah|black)-", n):
        return "black"
    if re.search(r"-(gri|gray|grey)-", n):
        return "gray"
    return "color"


def lang_of(name: str) -> str:
    n = f"-{slug(name)}-"
    if "-tr-" in n or "turkce" in n:
        return "tr"
    if "-en-" in n or "ingilizce" in n or "english" in n:
        return "en"
    return "bi"


def svg_aspect(svg: Path) -> float:
    head = svg.read_text(errors="ignore")[:4000]
    m = re.search(r'viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"', head)
    return round(float(m.group(1)) / float(m.group(2)), 4)


def convert(src: Path, dest_dir: Path, stem: str) -> tuple[str, float]:
    dest_dir.mkdir(parents=True, exist_ok=True)
    ext = src.suffix.lower()
    if ext == ".svg":
        out = dest_dir / f"{stem}.svg"
        out.write_bytes(src.read_bytes())
        return out.name, svg_aspect(out)
    if ext in VECTOR_TO_SVG:
        out = dest_dir / f"{stem}.svg"
        subprocess.run(["pdftocairo", "-svg", "-f", "1", "-l", "1", str(src), str(out)], check=True)
        return out.name, svg_aspect(out)
    img = Image.open(src).convert("RGBA")
    bbox = img.getchannel("A").getbbox()
    if bbox:
        img = img.crop(bbox)
    out = dest_dir / f"{stem}.png"
    img.save(out, optimize=True)
    return out.name, round(img.width / img.height, 4)


def collect(kind: str) -> list[dict]:
    entries = []
    base = RAW / ("logos" if kind == "main" else "units")
    for src in sorted(base.rglob("*")):
        if src.suffix.lower() not in VECTOR_TO_SVG | RASTER | {".svg"}:
            continue
        rel = src.relative_to(base).with_suffix("")
        stem = slug(str(rel))
        folder = "logos" if kind == "main" else "units"
        name, aspect = convert(src, PUBLIC / folder, stem)
        entries.append({
            "id": stem,
            "file": f"{folder}/{name}",
            "kind": kind,
            "tone": tone_of(str(rel)),
            "lang": lang_of(str(rel)),
            "aspect": aspect,
            "label": str(rel),
        })
    return entries


def contact_sheet(entries: list[dict]) -> None:
    cell, cols = 260, 6
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell), "#888888")
    draw = ImageDraw.Draw(sheet)
    for i, e in enumerate(entries):
        x, y = (i % cols) * cell, (i // cols) * cell
        path = PUBLIC / e["file"]
        if path.suffix == ".png":
            img = Image.open(path)
            img.thumbnail((cell - 20, cell - 60))
            sheet.paste(img, (x + 10, y + 10), img)
        draw.text((x + 10, y + cell - 45), f"{e['id'][:34]}\n{e['tone']} {e['lang']} {e['aspect']}", fill="black")
    sheet.save(RAW / "contact-sheet.png")


if __name__ == "__main__":
    entries = collect("main") + collect("unit")
    ids = [e["id"] for e in entries]
    assert len(ids) == len(set(ids)), "duplicate logo ids"
    (REM / "src/logos.json").write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")
    contact_sheet(entries)
    print(f"{len(entries)} logos → src/logos.json, raw/contact-sheet.png")
