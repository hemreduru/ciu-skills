#!/usr/bin/env python3
"""Usage: check.py sunum.pptx — teslimden önce denetler; hata varsa çıkış kodu 1, ilk satır OK değildir."""
import os
import sys

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE, PP_PLACEHOLDER

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fits, is_example  # noqa: E402

MAX_BULLETS, MAX_TITLE_WORDS = 6, 7
TITLES = {PP_PLACEHOLDER.TITLE, PP_PLACEHOLDER.CENTER_TITLE}


def font_pt(shape, default):
    sizes = [r.font.size.pt for p in shape.text_frame.paragraphs for r in p.runs if r.font.size]
    return max(sizes) if sizes else default


def walk(shapes):
    for sh in shapes:
        yield sh
        if sh.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from walk(sh.shapes)


def check(path):
    errors, warnings = [], []
    prs = Presentation(path)
    for n, slide in enumerate(prs.slides, 1):
        for sh in walk(slide.shapes):
            if getattr(sh, "has_table", False):
                for cell in (c for row in sh.table.rows for c in row.cells):
                    if is_example(cell.text):
                        errors.append(f"Slayt {n}: tabloda şablondan kalan örnek metin var: \"{cell.text.strip()[:40]}\".")
            is_ph = sh.is_placeholder
            kind = sh.placeholder_format.type if is_ph else None
            if is_ph and kind == PP_PLACEHOLDER.PICTURE:
                errors.append(f"Slayt {n}: boş resim alanı var ('{sh.name}').")
                continue
            if not sh.has_text_frame:
                continue
            text = sh.text_frame.text
            if not text.strip():
                if is_ph:
                    errors.append(f"Slayt {n}: boş alan var ('{sh.name}'); doldur ya da sil.")
                continue
            if is_example(text):
                errors.append(f"Slayt {n}: şablondan kalan örnek metin var: \"{text.strip()[:40]}\".")
            paras = [p.text for p in sh.text_frame.paragraphs if p.text.strip()]
            if not any(r.font.size for p in sh.text_frame.paragraphs for r in p.runs):
                warnings.append(f"Slayt {n}: '{sh.name}' yazı boyutu belirtilmemiş; taşma tahmini varsayılan boyutla yapıldı, PowerPoint'te gözle kontrol et.")
            bullets = is_ph and kind == PP_PLACEHOLDER.OBJECT
            default = 40 if kind in TITLES else 18
            if sh.width and sh.height and not fits(paras, sh.width, sh.height, font_pt(sh, default), bullets, kind in TITLES):
                errors.append(f"Slayt {n}: metin kutusuna sığmıyor ('{sh.name}'); kısalt ya da slaytı ikiye böl.")
            if bullets and len(paras) > MAX_BULLETS:
                errors.append(f"Slayt {n}: çok fazla madde ({len(paras)}); en fazla {MAX_BULLETS} olmalı, slaytı böl.")
            if kind in TITLES and len(text.split()) > MAX_TITLE_WORDS:
                warnings.append(f"Slayt {n}: başlık {len(text.split())} kelime; 7 kelimeden kısa tut.")
        notes = slide.notes_slide.notes_text_frame.text if slide.has_notes_slide else ""
        if is_example(notes):
            errors.append(f"Slayt {n}: konuşmacı notunda şablondan kalan örnek metin var.")
        if not notes.strip():
            warnings.append(f"Slayt {n}: konuşmacı notu yok.")
    return errors, warnings


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Kullanım: check.py sunum.pptx")
        sys.exit(2)
    errors, warnings = check(sys.argv[1])
    print("\n".join([f"- {e}" for e in errors] if errors else ["OK"]))
    print("\n".join(f"UYARI {w}" for w in warnings))
    sys.exit(1 if errors else 0)
