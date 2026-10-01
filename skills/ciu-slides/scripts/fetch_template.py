#!/usr/bin/env python3
"""Usage: fetch_template.py <hedef-klasor>  — UKÜ sunum şablonlarını indirir, sablon-1..3.pptx olarak yazar."""
import os
import re
import shutil
import ssl
import sys
import tempfile
import urllib.request
import zipfile

URL = "https://share.ciu.edu.tr/index.php/s/a0mByX3Yz08ssi0/download"
# Sunucu ara sertifikayı göndermiyor; genel ara sertifika sistem köklerine eklenir, doğrulama açık kalır.
PEM = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "globalsign-gcc-r46-ov-tls-ca-2025.pem")


def extract_templates(zip_path, dest):
    found = {}
    with zipfile.ZipFile(zip_path) as z:
        for name in z.namelist():
            m = re.search(r"Template\s*(\d)\.pptx$", name, re.I)
            if m:
                found[m.group(1)] = name
        if sorted(found) != ["1", "2", "3"]:
            raise RuntimeError(f"Zip içinde 3 şablon yok (bulunan: {sorted(found)})")
        os.makedirs(dest, exist_ok=True)
        for n, name in found.items():
            tmp = os.path.join(dest, f".sablon-{n}.tmp")
            with z.open(name) as src, open(tmp, "wb") as out:
                shutil.copyfileobj(src, out)
            os.replace(tmp, os.path.join(dest, f"sablon-{n}.pptx"))


def download(dest):
    ctx = ssl.create_default_context()
    ctx.load_verify_locations(cafile=PEM)
    with tempfile.TemporaryDirectory() as d:
        zp = os.path.join(d, "s.zip")
        with urllib.request.urlopen(URL, context=ctx, timeout=120) as r, open(zp, "wb") as f:
            shutil.copyfileobj(r, f)
        extract_templates(zp, dest)


if __name__ == "__main__":
    try:
        download(sys.argv[1])
    except Exception as e:
        print(f"{type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)
