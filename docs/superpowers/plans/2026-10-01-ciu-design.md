# ciu-design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** UKÜ grafik tasarımcısının Claude Code ve claude.ai'de prompt + fotoğraf/video/URL ile kurumsal kimliğe uygun statik görsel, motion graphic ve markalı video üretmesini sağlayan `ciu-design` skill'i.

**Architecture:** `ciu-skills` reposu bir **skill seti**dir ve Agent Skills açık standardının düzenini kullanır: her skill `skills/<ad>/SKILL.md`. Aynı repo (1) `.claude-plugin/marketplace.json` ile Claude Code marketplace'i (`ciu-skills` = setin tamamı, `ciu-design` = tek skill; `strict: false` + `skills` dizisi), (2) `npx skills add <owner>/ciu-skills [--skill <ad>]` ile Codex, Cursor, Gemini CLI, Copilot vb. 80+ ajana kurulabilir, (3) `tools/build.mjs` ile her skill için claude.ai zip'i üretir. v1'de yalnızca `ciu-design` var; `ciu-coding`, `ciu-accounting` ileride aynı kalıpla eklenir (şimdi eklenmez). `ciu-design` marka bilgisi (brand.md, style.md, referanslar), markaya ayarlı bir Remotion projesi (statik + video tek motor) ve bir kurulum script'inden oluşur.

**Tech Stack:** Remotion 4.0.532, React 19.2.3, TypeScript 5.9.3, Node (çalışma ≥18, bakımcı 24), Python 3 + Pillow (yalnızca bakımcı araçları), poppler-utils.

**Spec:** `docs/superpowers/specs/2026-10-01-ciu-design.md`

## Global Constraints

- `remotion` ve tüm `@remotion/*` paketleri **tam olarak** `4.0.532`; `react`/`react-dom` `19.2.3`; `typescript` `5.9.3`; `@types/react` `19.2.7`. Hepsi `--save-exact`.
- Teknik adlar `ciu-` önekli (küçük harf, rakam, tire; "ü" kullanılamaz): repo/marketplace `ciu-skills`, skill `ciu-design`. Kullanıcıya görünen başlık "CIU Design"; kurumsal metinlerde "UKÜ" aynen kalır. SKILL.md `description` ≤ 1024 karakter, XML etiketi yok.
- Skill seti kuralı: yeni skill = `skills/<ad>/SKILL.md` + marketplace.json'da kendi girişi + `ciu-skills` girişinin `skills` dizisine bir satır. Ortak kod/klasör yalnızca ikinci bir tüketici gerçekten çıktığında oluşturulur.
- Ajan-bağımsızlık: SKILL.md Claude'a özgü araç adı içermez ("run", "open the image", "fetch the page" gibi genel fiiller); script'ler yalnızca Node + shell ister; `CLAUDE_PLUGIN_DATA` yalnızca varsa kullanılır.
- **Git yazma yok (PS5):** commit/push/branch yok. Her task sonunda değişen dosyaları listele; commit'i Emre yapar.
- v1'de API anahtarı/secret yok. Üretken AI kapsam dışı.
- Font: yalnızca OFL lisanslı fontlar repoya girer. **Myriad Pro asla.**
- Tarih/saat biçimi tasarım metinlerinde `d.m.Y H:i` → `15.10.2026 14:00`.
- Logolar yalnızca `<Logo>` bileşeniyle, orijinal dosyadan; renk/kontür/esnetme yok.
- Resmi `remotion-dev/skills` içeriği **git'e girmez** (lisans dosyası yok, Remotion License): yalnızca `dist/` zip'ine ve çalışma anında `$DATA/remotion-skills`'e indirilir.
- Görseller kayıpsız optimize; referans görseller ≤ 540px genişlik JPEG q80.
- Yorumlar minimum (satır başına ≤ 15 kelime). Tasarımcıya giden mesajlar Türkçe ve teknik olmayan dilde.
- Renk token'ları (Pantone resmi sRGB karşılıkları): orange `#FE5000` (Orange 021 C), wine `#862633` (202 C), red `#A6192E` (187 C), ink `#231F20` (K:100), gray `#9D9FA2` (K:45).

## Spec'ten bilinçli sapmalar

- Spec §5'teki `assets/` klasörü yerine logolar/fontlar doğrudan `remotion/public/brand/` altında durur (Remotion `staticFile` yalnızca `public/` okur; ikinci kopya adımı gereksiz).
- `vendor/remotion/` yalnızca zip'te bulunur; Code'da `setup.mjs` aynı içeriği `$DATA/remotion-skills`'e indirir.
- Code'da girdi/çıktı klasörleri: çalışma klasöründe `girdiler/` ve `ciktilar/`.
- Zip boyutu aşılırsa kulüp logolarını çalışma anında siteden çekmek yerine (spec §5) logolar 1600px'e küçültülür (Task 3 Step 8) — ağ erişimine bağımlılık yok.

## Dosya haritası

```
~/ciu-skills/
├── .claude-plugin/marketplace.json        # Task 2 — Claude Code: set + tek skill girişleri
├── .gitignore                             # Task 2
├── README.md                              # Task 2 (iskelet), Task 11 (tam)
├── tools/probe.md                         # Task 1 — claude.ai yetenek testi prompt'u
├── tools/make_logos.py                    # Task 3 — ham logo → public/brand + logos.json
├── tools/build.mjs                        # Task 11 — her skill için dist/<skill>.zip
├── evals/ciu-design/evals.json, files/*   # Task 12
├── raw/                                   # (gitignored) ham indirmeler
└── skills/ciu-design/
    ├── SKILL.md                           # Task 10
    ├── brand/brand.md                     # Task 3
    ├── brand/style.md                     # Task 4
    ├── brand/references/*.jpg             # Task 4
    ├── scripts/setup.mjs                  # Task 9
    └── remotion/
        ├── package.json, package-lock.json, tsconfig.json   # Task 5
        ├── public/brand/logos/*, units/*  # Task 3
        ├── public/brand/fonts/SourceSans3.ttf, OFL.txt      # Task 3
        ├── public/input/sample.jpg        # Task 3
        └── src/
            ├── index.ts, Root.tsx, samples.ts               # Task 6–8
            ├── brand.ts, schema.ts, fonts.ts                # Task 6
            ├── logos.json                                   # Task 3
            ├── lib/rules.ts, lib/rules.test.ts              # Task 5
            ├── components/Logo.tsx, TextBlock.tsx, PhotoFrame.tsx   # Task 6
            ├── components/BrandCard.tsx                     # Task 7
            ├── components/LowerThird.tsx, Captions.tsx      # Task 8
            └── compositions/Post.tsx (6), Motion.tsx (7), Branded.tsx (8)
```

Sıra: 1 → 2 → (3, 4, 5 paralel olabilir) → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13.

---

### Task 1: claude.ai yetenek testi (spike)

Amaç: claude.ai sandbox'ında Remotion'ın çalışıp çalışmadığını ve yolları ölçmek. Çıktı kod değil, karardır.

**Files:**
- Create: `tools/probe.md`
- Modify: `docs/superpowers/specs/2026-10-01-ciu-design.md` (§2 tablosu + "Yetenek testi sonuçları" bölümü)

**Interfaces:**
- Produces: claude.ai için kesin değerler → Task 9 `setup.mjs` sabitleri: `IN`, `OUT`, `DATA` yolları, Chromium yolu (varsa), npm/indirme erişimi.

- [ ] **Step 1: `tools/probe.md` dosyasını yaz**

````markdown
# claude.ai yetenek testi

claude.ai'de **yeni bir sohbet** aç (Ayarlar → Yetenekler'de "Kod çalıştırma ve dosya oluşturma" açık olmalı), aşağıdaki prompt'u olduğu gibi yapıştır, çıkan raporu Emre'ye ilet.

---

Run every command below in your code execution sandbox exactly as written, do not skip any, and finish with ONE markdown table: `check | result | raw output (short)`. Do not try to fix failures; just report them.

```bash
uname -m; head -2 /etc/os-release; ldd --version | head -1
node -v; npm -v; python3 --version; nproc; free -h | head -2; df -h /tmp | tail -1
which chromium chromium-browser google-chrome ffmpeg ffprobe tar curl zip 2>&1
ls -d ~/.cache/ms-playwright/* 2>&1 | head; pip show playwright 2>&1 | head -2
ls -la /mnt 2>&1; ls -la /mnt/user-data /mnt/user-data/uploads /mnt/user-data/outputs 2>&1 | head -20
ls -la /mnt/skills 2>&1 | head; echo "OUTPUT_DIR=$OUTPUT_DIR"
for u in https://registry.npmjs.org/remotion https://remotion.media https://storage.googleapis.com https://codeload.github.com https://ciu.edu.tr https://github.com; do echo "$u -> $(curl -s -o /dev/null -w '%{http_code}' -m 15 $u)"; done
```

```bash
mkdir -p /tmp/probe/src && cd /tmp/probe && npm init -y >/dev/null
time npm i --save-exact --no-audit --no-fund remotion@4.0.532 @remotion/cli@4.0.532 react@19.2.3 react-dom@19.2.3 2>&1 | tail -3
cat > src/index.ts <<'EOF'
import { registerRoot } from "remotion";
import { Root } from "./Root";
registerRoot(Root);
EOF
cat > src/Root.tsx <<'EOF'
import { AbsoluteFill, Composition, Still, useCurrentFrame } from "remotion";
const Card = () => <AbsoluteFill style={{ background: "#A6192E", color: "white", fontSize: 80, justifyContent: "center", alignItems: "center" }}>İĞŞ ığş {useCurrentFrame()}</AbsoluteFill>;
export const Root = () => (<>
  <Still id="S" component={Card} width={1080} height={1350} />
  <Composition id="V" component={Card} width={1080} height={1920} fps={30} durationInFrames={90} />
</>);
EOF
time npx remotion browser ensure 2>&1 | tail -3
time npx remotion still src/index.ts S out/s.png 2>&1 | tail -3
time npx remotion render src/index.ts V out/v.mp4 --codec=h264 2>&1 | tail -3
ls -la out; du -sh node_modules
cp out/* /mnt/user-data/outputs/ 2>/dev/null || cp out/* "$OUTPUT_DIR"/ 2>/dev/null; echo copied
```

If `browser ensure` failed but a Chromium/Chrome binary exists anywhere (check the `which` output and `~/.cache/ms-playwright/*/chrome-linux/chrome`), retry the still and render commands with `--browser-executable=<that path>` and report both attempts.
````

- [ ] **Step 2: Emre testi claude.ai'de çalıştırır ve raporu getirir** (bu adımı insan yapar; ajan beklemeye alır).

- [ ] **Step 3: Sonuçları spec'e işle**

Spec §2 tablosundaki ⚠️ satırlarını ✅/❌ yap ve §9'dan önce şu bölümü ekle:

```markdown
## Yetenek testi sonuçları (claude.ai)

| Kontrol | Sonuç |
|---|---|
| Node / npm | <sürümler> |
| npm registry erişimi | <http kodu> |
| remotion.media / storage.googleapis.com | <http kodları> |
| Chromium hazır mı / yolu | <yol veya yok> |
| npm install süresi | <sn> |
| still / 3 sn MP4 render süresi | <sn> / <sn> |
| Yüklenen dosya yolu | <ör. /mnt/user-data/uploads> |
| Çıktı yolu | <ör. /mnt/user-data/outputs> |
| glibc | <sürüm> |
```

- [ ] **Step 4: Karar kapısı** — sonuca göre tam olarak biri:
  - **A) npm + tarayıcı indirme çalışıyor:** plan olduğu gibi devam.
  - **B) npm çalışıyor, tarayıcı indirme engelli ama Chromium var:** Task 9'da `KNOWN_CHROMES` listesine o yolu ekle (kod zaten destekliyor), devam.
  - **C) npm engelli ya da hiç Chromium yok:** DUR. claude.ai'de Remotion çalışamaz; kapsamı Emre ile yeniden konuş (claude.ai'de yalnızca Code yönlendirmesi ya da ayrı Pillow motoru). Plana devam etme.

- [ ] **Step 5: Değişen dosyaları listele** (`tools/probe.md`, spec). Commit Emre'de.

---

### Task 2: Skill seti iskeleti (marketplace + standart düzen)

**Files:**
- Create: `.claude-plugin/marketplace.json`, `.gitignore`, `README.md`, `skills/` klasörü

**Interfaces:**
- Produces: marketplace adı `ciu-skills`; girişler `ciu-skills` (setin tamamı) ve `ciu-design` (tek skill). Kurulum: `/plugin install ciu-skills@ciu-skills` ya da `/plugin install ciu-design@ciu-skills`; diğer ajanlar `npx skills add <owner>/ciu-skills [--skill ciu-design]`.

- [ ] **Step 1: Emre'ye GitHub sahibini sor** (kullanıcı adı ya da org; repo adı `ciu-skills`). Aşağıda `<owner>` bu değerdir. Cevap gelene kadar Task 2'nin diğer adımları ve Task 3–10 bloklanmaz; `<owner>` yalnızca Task 11 README'sinde gerekir.

- [ ] **Step 2: `.claude-plugin/marketplace.json`**

```json
{
  "name": "ciu-skills",
  "owner": { "name": "UKÜ (CIU)" },
  "metadata": {
    "description": "Uluslararası Kıbrıs Üniversitesi (CIU) için Claude / Agent Skills seti",
    "version": "0.1.0"
  },
  "plugins": [
    {
      "name": "ciu-skills",
      "description": "Setin tamamı: tüm CIU skill'leri.",
      "source": "./",
      "strict": false,
      "skills": ["./skills/ciu-design"]
    },
    {
      "name": "ciu-design",
      "description": "UKÜ kurumsal kimliğine uygun post, story, Reels, motion graphic ve markalı video üretir.",
      "source": "./",
      "strict": false,
      "skills": ["./skills/ciu-design"]
    }
  ]
}
```

- [ ] **Step 3: `.gitignore`**

```gitignore
node_modules/
dist/
raw/
out/
ciktilar/
girdiler/
skills/*/vendor/
skills/ciu-design/remotion/public/input/*
!skills/ciu-design/remotion/public/input/sample.jpg
```

- [ ] **Step 4: `README.md` iskeleti**

```markdown
# ciu-skills

Uluslararası Kıbrıs Üniversitesi (UKÜ / CIU) için skill seti. Agent Skills açık standardını kullanır; Claude Code, claude.ai, Codex, Cursor, Gemini CLI, GitHub Copilot ve diğer uyumlu ajanlarda çalışır.

| Skill | Ne yapar | Durum |
|---|---|---|
| `ciu-design` | Kurumsal kimliğe uygun görsel ve video | geliştiriliyor |

- Tasarım: `docs/superpowers/specs/2026-10-01-ciu-design.md`
- Plan: `docs/superpowers/plans/2026-10-01-ciu-design.md`

Kurulum talimatları Task 11'de eklenecek.
```

- [ ] **Step 5: Doğrula**

Run: `node -e "const m=JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'));for(const p of m.plugins)for(const s of p.skills)if(!require('fs').existsSync(s))console.log('missing',s);console.log('ok')"`
Expected: Task 10 öncesi `missing ./skills/ciu-design` + `ok`; Task 10 sonrası yalnızca `ok`. Sonra: `npx -y skills add ./ --list` → `ciu-design` listelenir (Task 10 sonrası).

- [ ] **Step 6: Değişen dosyaları listele.** Emre GitHub'da `<owner>/ciu-skills` reposunu (public) açıp ilk commit'i atar.

---

### Task 3: Marka kaynakları (logolar, font, renkler, brand.md)

**Files:**
- Create: `tools/make_logos.py`, `skills/ciu-design/remotion/src/logos.json` (script üretir), `skills/ciu-design/remotion/public/brand/{logos,units}/*`, `skills/ciu-design/remotion/public/brand/fonts/{SourceSans3.ttf,OFL.txt}`, `skills/ciu-design/remotion/public/input/sample.jpg`, `skills/ciu-design/brand/brand.md`

**Interfaces:**
- Produces: `logos.json` → `LogoEntry[]`:
  `{ id: string; file: string /* public/brand'e göre, ör. "logos/logo1-tr-color.png" */; kind: "main" | "unit"; tone: "color" | "white" | "black" | "gray"; lang: "tr" | "en" | "bi"; aspect: number /* genişlik/yükseklik */; label: string }`
- Produces: `public/brand/fonts/SourceSans3.ttf` (variable, wght 200–900), `public/input/sample.jpg`.

- [ ] **Step 1: İndirilecek paylaşım linklerini topla**

Şu sayfalardaki tüm `share.ciu.edu.tr` linklerini çıkar:

```bash
for p in uku-logolari uku-fakulte-ve-yuksekokul-logolari uku-arastirma-merkezi-logolari hakkimizda/kurumsal-kimlik-kilavuzu/kulup-logolari; do
  echo "== $p"; curl -sL "https://ciu.edu.tr/tr/$p" | grep -oE 'https://share\.ciu\.edu\.tr/[^"]+' | sort -u
done
```

Expected: her sayfa için ≥1 link.

- [ ] **Step 2: Emre zip'leri indirir.** `share.ciu.edu.tr` kampüs ağında iç IP'ye çözülüyor ve SSL ara sertifikası eksik; TLS doğrulamasını **kapatma**. Emre linkleri tarayıcıda açıp indirir ve şöyle yerleştirir:
  - Ana logolar → `raw/logos/` (renkli ve beyaz paketler, zip'ten çıkarılmış)
  - Fakülte/YO, araştırma merkezi, kulüp → `raw/units/<grup-adı>/`

- [ ] **Step 3: Font ve örnek fotoğraf indir**

```bash
B=skills/ciu-design/remotion/public
mkdir -p $B/brand/fonts $B/input
curl -fL -o $B/brand/fonts/SourceSans3.ttf "https://github.com/google/fonts/raw/main/ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf"
curl -fL -o $B/brand/fonts/OFL.txt "https://github.com/google/fonts/raw/main/ofl/sourcesans3/OFL.txt"
curl -fL -o $B/input/sample.jpg "https://ciu.edu.tr/sites/default/files/2026-09/uku-oryantasyon-gunleri-basliyor-2027.jpg"
file $B/brand/fonts/SourceSans3.ttf $B/input/sample.jpg
```

Expected: `TrueType Font data` ve `JPEG image data`. `curl -f` 404 verirse google/fonts reposunda `ofl/sourcesans3/` klasörünü listeleyip doğru dosya adını kullan.

- [ ] **Step 4: `tools/make_logos.py` yaz**

```python
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
    n = name.lower()
    if re.search(r"beyaz|white|negatif", n):
        return "white"
    if re.search(r"siyah|black", n):
        return "black"
    if re.search(r"gri|gray|grey", n):
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
```

- [ ] **Step 5: Çalıştır**

Run: `python3 tools/make_logos.py`
Expected: `N logos → src/logos.json, raw/contact-sheet.png` (N ≥ 2). JPG logolarda alfa yoksa bbox kırpması atlanır — bu durumda contact sheet'te beyaz kutu görünür; Emre'den PNG/SVG sürümünü iste.

- [ ] **Step 6: Görsel doğrulama**

`raw/contact-sheet.png`'yi aç (SVG'ler sheet'te boş görünür; onları tarayıcıda `file://` ile aç). Her girdi için `tone` ve `lang` doğru mu kontrol et; yanlışsa `src/logos.json`'da elle düzelt. Ayrıca: fakülte/birim logoları UKÜ amblemini **zaten içeriyor mu**? Cevabı Step 7'deki brand.md "Unit logos" satırına yaz.

- [ ] **Step 7: `skills/ciu-design/brand/brand.md` yaz**

```markdown
# UKÜ / CIU Brand Rules

Source: Kurumsal Kimlik Kılavuzu — https://ciu.edu.tr/sites/default/files/2025-02/uku-kurumsal-kimlik-kilavuzu-TR.pdf

## Names
- TR: Uluslararası Kıbrıs Üniversitesi (UKÜ) · EN: Cyprus International University (CIU)
- Never abbreviate the name inside a logo. In body copy "UKÜ"/"CIU" is fine.

## Emblem & logos
- Emblem = letters C, I, U from a circle; evokes a torch ("aydınlık ve uygarlık"). Rounded forms.
- 8 logo layouts (logotype above/right of emblem, TR-first or EN-first, one-line or three-line, logos 7–8 with slogan).
- Logotype is Myriad Pro Regular, uppercase, black (CMYK K:100). Never re-typeset it — always use the logo file.
- Official alternates: full black (K:100), grayscale (K:45), white on dark.
- All usable files are listed in `remotion/src/logos.json` (id, tone, lang, aspect). Use only those ids.
- Unit logos (faculty, school, research center, club): <Task 3 Step 6 sonucu: "already contain the UKÜ emblem → use alone as logoId" YA DA "do not contain it → place next to the main logo via unitLogoId">.

## Colors
| Token | Pantone | CMYK | HEX (screen) |
|---|---|---|---|
| orange | Orange 021 C | 0 83 100 0 | #FE5000 |
| wine | 202 C | 29 94 67 33 | #862633 |
| red | 187 C | 22 100 89 15 | #A6192E |
| ink | — | K:100 | #231F20 |
| gray | — | K:45 | #9D9FA2 |
Use tokens from `remotion/src/brand.ts`, never ad-hoc hex values.

## Typography
- Brand family: Myriad Pro (Condensed, Regular, Italic) — Adobe-licensed, NOT bundled.
- Bundled substitute: Source Sans 3 (OFL, Adobe's open humanist sans, closest match).
- Special-use logo text ("Hosted by / Ev sahipliğiyle"): italic, K:55.

## Logo misuse — HARD rules (refuse, explain, offer an alternative)
1. Do not break the logo's integrity, move the logotype, or slant it.
2. Do not stretch or squash it in any direction.
3. Do not use a different font or shorten the university name.
4. Do not bold the logotype or resize individual words.
5. No outline/contour on the logo; never change logotype or emblem colors.
6. For black-and-white use, do not convert to grayscale — use the official black logo.
7. Do not add text onto the logo outside the defined special-use areas.

## Slogan logos (layouts 7–8)
- Slogan width must not exceed the logo width; slogan-to-logo distance = 2× the "e" height; centered.
```

`<Task 3 Step 6 sonucu ...>` satırını Step 6'da bulduğun gerçek cümleyle değiştir (iki seçenekten biri).

- [ ] **Step 8: Boyut kontrolü**

Run: `du -sh skills/ciu-design/remotion/public/brand`
Expected: ≤ 15 MB. Fazlaysa en büyük PNG'leri `python3 -c "from PIL import Image; ..."` ile 1600px yüksekliğe indir (oranı koru) ve script'i tekrar çalıştır.

- [ ] **Step 9: Değişen dosyaları listele.**

---

### Task 4: Sosyal medya stil analizi (style.md + referanslar)

**Files:**
- Create: `skills/ciu-design/brand/style.md`, `skills/ciu-design/brand/references/*.jpg`
- Modify: `skills/ciu-design/remotion/src/brand.ts` (Task 6'dan sonra çalışıyorsa; yoksa bulguyu not et, Task 6 uygular) — yalnızca `fonts.heading` ve `typography.titleUpper`

**Interfaces:**
- Produces: `brand/references/<platform>-<NN>-<tür>.jpg` (tür ∈ duyuru, etkinlik, tebrik, haber, kampanya, reels, diger); `style.md` aşağıdaki başlıklarla.

- [ ] **Step 1: Instagram** — yerleşik tarayıcıda `https://www.instagram.com/ciu.official/` aç. Giriş duvarı yoksa görsel URL'lerini topla:

```js
[...document.querySelectorAll('article img, main img')].map(i => i.src).filter(s => s.includes('cdninstagram') || s.includes('fbcdn')).slice(0, 30)
```

Her URL'yi `curl -fsL -o raw/social/instagram/NN.jpg "<url>"` ile indir (NN = 01, 02, …). **Hesaba giriş yapma, hesap oluşturma.** Giriş duvarı varsa Emre'den son 20 postun ekran görüntüsünü `raw/social/instagram/` altına koymasını iste.

- [ ] **Step 2: Facebook ve LinkedIn** — `https://www.facebook.com/CIUOfficial` ve `https://www.linkedin.com/school/uluslararas%C4%B1-k%C4%B1br%C4%B1s-%C3%BCniversitesi/` için Step 1'in aynısı (`raw/social/facebook/`, `raw/social/linkedin/`). LinkedIn büyük ihtimalle giriş ister → Emre'den 5–10 ekran görüntüsü.

- [ ] **Step 3: Web sitesi** — `https://ciu.edu.tr/tr/haberler` ve `/tr/etkinlikler` sayfalarındaki son 10 haberin `og:image` görsellerini indir:

```bash
mkdir -p raw/social/web
curl -sL https://ciu.edu.tr/tr/haberler | grep -oE 'href="/tr/haberler/[^"]+"' | sort -u | head -10 | sed 's/href="//;s/"$//' | while read p; do
  img=$(curl -sL "https://ciu.edu.tr$p" | grep -oE 'property="og:image" content="[^"]+"' | sed 's/.*content="//;s/"$//')
  [ -n "$img" ] && curl -fsL -o "raw/social/web/$(basename "$p").jpg" "$img"
done; ls raw/social/web | wc -l
```

Expected: ≥ 5 dosya. Ayrıca https://ciu.edu.tr/tr/uku-sablonu sayfasındaki sunum ve Zoom arka planı önizleme görsellerini `raw/social/web/` altına indir (kurumsal şablon dili referansı).

- [ ] **Step 4: Seç ve küçült** — tüm `raw/social/**` görsellerine bak; UKÜ'yü en iyi temsil eden 15–25 tanesini seç (tür çeşitliliği gözet). Seçilenleri yeniden adlandırıp küçült:

```bash
python3 - <<'EOF'
from pathlib import Path
from PIL import Image
picks = {  # kaynak yol: hedef ad  (seçimine göre doldur)
    "raw/social/instagram/01.jpg": "instagram-01-etkinlik.jpg",
}
out = Path("skills/ciu-design/brand/references"); out.mkdir(parents=True, exist_ok=True)
for src, name in picks.items():
    im = Image.open(src).convert("RGB"); im.thumbnail((540, 2000)); im.save(out / name, quality=80, optimize=True)
print(len(picks), "references")
EOF
du -sh skills/ciu-design/brand/references
```

`picks` sözlüğünü seçtiğin gerçek dosyalarla doldur. Expected: 15–25 references, toplam ≤ 3 MB.

- [ ] **Step 5: `style.md` yaz** — tam olarak şu başlıklarla, her biri gözleme dayalı somut maddeler ve ilgili referans dosya adlarıyla:

```markdown
# UKÜ Social Media Style (observed <tarih>, sources: Instagram/Facebook/LinkedIn/web)

## Overall feel
## Color usage            (which tokens dominate, on what, photo vs. flat backgrounds)
## Typography             (case, weight, hierarchy, approximate font if identifiable)
## Layout patterns        (one bullet per recurring pattern + example reference file)
## Logo placement         (which logo variant/tone, where, size relative to canvas)
## Copy tone              (TR and EN separately; length; emoji use; sign-offs)
## Hashtags & handles     (recurring hashtags, @ciu.official, web address usage)
## Do / Don't             (patterns UKÜ avoids)
```

- [ ] **Step 6: Token kararları** — gözleme göre:
  - Başlıklar çoğunlukla büyük harf mi? → `typography.titleUpper` `true`/`false`.
  - Başlık fontu tanınabilir bir OFL font mu (Poppins, Montserrat vb.)? Evet ise `curl -fL -o skills/ciu-design/remotion/public/brand/fonts/<Ad>.ttf "https://github.com/google/fonts/raw/main/ofl/<klasör>/<dosya>.ttf"` indir, `fonts.heading`'i o aile adına çevir ve `fonts.ts`'e ikinci bir `loadFont` satırı ekle (Task 6 formatında). Hayır ise Source Sans 3 kalır.

- [ ] **Step 7: Değişen dosyaları listele.** (`raw/` gitignored.)

---

### Task 5: Remotion projesi + kurallar modülü (TDD)

**Files:**
- Create: `skills/ciu-design/remotion/package.json`, `package-lock.json` (npm üretir), `tsconfig.json`, `src/lib/rules.ts`, `src/lib/rules.test.ts`

**Interfaces:**
- Produces (`src/lib/rules.ts`):
  - `type Size = { width: number; height: number }`
  - `resolveSize(size: string): Size` — alias ya da `WxH`; çift sayıya yuvarlar; bilinmeyende `Error("Bilinmeyen boyut: …")`
  - `trUpper(text: string, lang: "tr" | "en"): string`
  - `type LogoEntry` (Task 3 şeması)
  - `findLogo(logos: LogoEntry[], id: string): LogoEntry` — yoksa `Error("Logo bulunamadı: …")`
  - `logoHeight(o: { requested: number; canvasShort: number; aspect: number; maxWidth?: number }): number`
  - `type SafeArea = { top: number; bottom: number; side: number }`
  - `safeArea(width: number, height: number): SafeArea`

- [ ] **Step 1: `package.json`**

```json
{
  "name": "ciu-design-remotion",
  "private": true,
  "scripts": {
    "studio": "remotion studio src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "node --test src/lib/rules.test.ts"
  },
  "dependencies": {
    "@remotion/captions": "4.0.532",
    "@remotion/cli": "4.0.532",
    "@remotion/fonts": "4.0.532",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "remotion": "4.0.532"
  },
  "devDependencies": {
    "@types/react": "19.2.7",
    "typescript": "5.9.3"
  }
}
```

- [ ] **Step 2: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noUnusedLocals": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

- [ ] **Step 3: Kur ve lock üret**

Run: `cd skills/ciu-design/remotion && npm install --no-audit --no-fund`
Expected: `package-lock.json` oluşur, hata yok.

- [ ] **Step 4: Failing test — `src/lib/rules.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { findLogo, logoHeight, resolveSize, safeArea, trUpper } from "./rules.ts";

test("resolveSize: aliases, WxH, even rounding, unknown", () => {
  assert.deepEqual(resolveSize("story"), { width: 1080, height: 1920 });
  assert.deepEqual(resolveSize("Post"), { width: 1080, height: 1350 });
  assert.deepEqual(resolveSize("1200x627"), { width: 1200, height: 628 });
  assert.deepEqual(resolveSize(" 1080X1080 "), { width: 1080, height: 1080 });
  assert.throws(() => resolveSize("büyük"), /Bilinmeyen boyut/);
});

test("trUpper: Turkish dotted/dotless i", () => {
  assert.equal(trUpper("istanbul ılık", "tr"), "İSTANBUL ILIK");
  assert.equal(trUpper("istanbul", "en"), "ISTANBUL");
});

test("logoHeight: minimum size wins, maxWidth shrinks", () => {
  assert.equal(logoHeight({ requested: 10, canvasShort: 1080, aspect: 3 }), 43);
  assert.equal(logoHeight({ requested: 200, canvasShort: 1080, aspect: 3 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 4, maxWidth: 800 }), 200);
  assert.equal(logoHeight({ requested: 300, canvasShort: 1080, aspect: 40, maxWidth: 800 }), 43);
});

test("findLogo: unknown id throws", () => {
  const logo = { id: "a", file: "logos/a.png", kind: "main", tone: "color", lang: "bi", aspect: 2, label: "a" } as const;
  assert.equal(findLogo([logo], "a").file, "logos/a.png");
  assert.throws(() => findLogo([logo], "x"), /Logo bulunamadı: x/);
});

test("safeArea: tall formats reserve platform UI zones", () => {
  assert.deepEqual(safeArea(1080, 1920), { top: 269, bottom: 384, side: 65 });
  assert.deepEqual(safeArea(1080, 1350), { top: 65, bottom: 65, side: 65 });
  assert.deepEqual(safeArea(1920, 1080), { top: 65, bottom: 65, side: 65 });
});
```

- [ ] **Step 5: Testin düştüğünü gör**

Run: `cd skills/ciu-design/remotion && npm test`
Expected: FAIL — `Cannot find module '.../rules.ts'`.

- [ ] **Step 6: `src/lib/rules.ts`**

```ts
export type Size = { width: number; height: number };
export type SafeArea = { top: number; bottom: number; side: number };
export type LogoEntry = {
  id: string;
  file: string;
  kind: "main" | "unit";
  tone: "color" | "white" | "black" | "gray";
  lang: "tr" | "en" | "bi";
  aspect: number;
  label: string;
};

const ALIASES: Record<string, [number, number]> = {
  post: [1080, 1350],
  portrait: [1080, 1440],
  kare: [1080, 1080],
  square: [1080, 1080],
  story: [1080, 1920],
  reels: [1080, 1920],
  reel: [1080, 1920],
  yatay: [1920, 1080],
  landscape: [1920, 1080],
  youtube: [1920, 1080],
  linkedin: [1200, 628],
  og: [1200, 630],
};

const even = (n: number): number => n + (n % 2);

export const resolveSize = (size: string): Size => {
  const key = size.trim().toLowerCase();
  const alias = ALIASES[key];
  if (alias) return { width: alias[0], height: alias[1] };
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(key);
  if (!m) throw new Error(`Bilinmeyen boyut: ${size}`);
  return { width: even(Number(m[1])), height: even(Number(m[2])) };
};

export const trUpper = (text: string, lang: "tr" | "en"): string =>
  text.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US");

export const findLogo = (logos: readonly LogoEntry[], id: string): LogoEntry => {
  const logo = logos.find((l) => l.id === id);
  if (!logo) throw new Error(`Logo bulunamadı: ${id}`);
  return logo;
};

const MIN_LOGO_RATIO = 0.04;
const MIN_LOGO_PX = 40;

export const logoHeight = (o: { requested: number; canvasShort: number; aspect: number; maxWidth?: number }): number => {
  const fitted = o.maxWidth ? Math.min(o.requested, o.maxWidth / o.aspect) : o.requested;
  return Math.round(Math.max(fitted, o.canvasShort * MIN_LOGO_RATIO, MIN_LOGO_PX));
};

export const safeArea = (width: number, height: number): SafeArea => {
  const edge = Math.round(Math.min(width, height) * 0.06);
  if (height / width < 1.7) return { top: edge, bottom: edge, side: edge };
  return { top: Math.round(height * 0.14), bottom: Math.round(height * 0.2), side: edge };
};
```

Not: `logoHeight({requested:10, canvasShort:1080})` = max(10, 43.2, 40) → 43. `aspect:40, maxWidth:800` → fitted 20 → min 43 kazanır.

- [ ] **Step 7: Testlerin geçtiğini gör**

Run: `cd skills/ciu-design/remotion && npm test`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 8: Değişen dosyaları listele.**

---

### Task 6: Marka çekirdeği + `Post` (statik) kompozisyonu

**Files:**
- Create: `src/brand.ts`, `src/schema.ts`, `src/fonts.ts`, `src/components/Logo.tsx`, `src/components/TextBlock.tsx`, `src/components/PhotoFrame.tsx`, `src/compositions/Post.tsx`, `src/samples.ts`, `src/Root.tsx`, `src/index.ts` (hepsi `skills/ciu-design/remotion/` altında)

**Interfaces:**
- Consumes: Task 5 `rules.ts`; Task 3 `logos.json`, `public/brand/fonts/SourceSans3.ttf`, `public/input/sample.jpg`.
- Produces:
  - `brand.ts`: `colors` (orange, wine, red, ink, gray, white), `type Accent = "orange" | "wine" | "red"`, `fonts` ({ heading, body }), `typography` ({ titleUpper }), `contact` ({ web, instagram }), `FPS = 30`
  - `schema.ts`: `Lang`, `Photo`, `PostProps` (aşağıda)
  - `<Logo id height maxWidth? />`, `<LogoRow logoId unitLogoId? height divider />`, `<TextBlock …/>`, `<PhotoFrame photo zoomFrames? />`
  - Composition id `"Post"` (Still)

- [ ] **Step 1: `src/brand.ts`**

```ts
export const colors = {
  orange: "#FE5000",
  wine: "#862633",
  red: "#A6192E",
  ink: "#231F20",
  gray: "#9D9FA2",
  white: "#FFFFFF",
} as const;

export type Accent = "orange" | "wine" | "red";

export const fonts = { heading: "Source Sans 3", body: "Source Sans 3" } as const;

export const typography = { titleUpper: true } as const;

export const contact = { web: "ciu.edu.tr", instagram: "@ciu.official" } as const;

export const FPS = 30;
```

(Task 4 Step 6 bulgusu varsa `fonts.heading` / `typography.titleUpper`'ı ona göre ayarla.)

- [ ] **Step 2: `src/schema.ts`**

```ts
import type { Accent } from "./brand";

export type Lang = "tr" | "en";

export type Photo = { src: string; focusX?: number; focusY?: number };

export type PostProps = {
  size: string;
  lang: Lang;
  layout: "band" | "overlay";
  title: string;
  subtitle?: string;
  meta?: string;
  titleScale?: number;
  photo?: Photo;
  logoId: string;
  unitLogoId?: string;
  accent?: Accent;
  transparent?: boolean;
};
```

- [ ] **Step 3: `src/fonts.ts`**

```ts
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fonts } from "./brand";

loadFont({ family: fonts.body, url: staticFile("brand/fonts/SourceSans3.ttf"), weight: "200 900" });
```

- [ ] **Step 4: `src/components/Logo.tsx`**

```tsx
import type { FC } from "react";
import { Img, staticFile, useVideoConfig } from "remotion";
import logos from "../logos.json";
import { findLogo, logoHeight, type LogoEntry } from "../lib/rules";

const ALL = logos as LogoEntry[];

export const Logo: FC<{ id: string; height: number; maxWidth?: number }> = ({ id, height, maxWidth }) => {
  const { width: w, height: h } = useVideoConfig();
  const logo = findLogo(ALL, id);
  const px = logoHeight({ requested: height, canvasShort: Math.min(w, h), aspect: logo.aspect, maxWidth });
  return <Img src={staticFile(`brand/${logo.file}`)} style={{ display: "block", height: px, width: px * logo.aspect }} />;
};

export const LogoRow: FC<{ logoId: string; unitLogoId?: string; height: number; divider: string }> = ({
  logoId,
  unitLogoId,
  height,
  divider,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.35 }}>
    <Logo id={logoId} height={height} />
    {unitLogoId && <div style={{ width: Math.max(1, height * 0.02), height: height * 0.8, backgroundColor: divider }} />}
    {unitLogoId && <Logo id={unitLogoId} height={height} />}
  </div>
);
```

- [ ] **Step 5: `src/components/TextBlock.tsx`**

```tsx
import type { FC } from "react";
import { fonts, typography } from "../brand";
import { trUpper } from "../lib/rules";
import type { Lang } from "../schema";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  lang: Lang;
  color: string;
  accent: string;
  u: number;
  titleScale?: number;
};

export const TextBlock: FC<Props> = ({ title, subtitle, meta, lang, color, accent, u, titleScale = 1 }) => (
  <div lang={lang} style={{ color, fontFamily: fonts.body }}>
    <div style={{ width: 12 * u, height: 0.8 * u, backgroundColor: accent, marginBottom: 2.5 * u }} />
    <div style={{ fontFamily: fonts.heading, fontSize: 7 * u * titleScale, fontWeight: 700, lineHeight: 1.05 }}>
      {typography.titleUpper ? trUpper(title, lang) : title}
    </div>
    {subtitle && <div style={{ fontSize: 3.6 * u, marginTop: 2 * u, lineHeight: 1.25 }}>{subtitle}</div>}
    {meta && <div style={{ fontSize: 3 * u, fontWeight: 600, marginTop: 3 * u }}>{meta}</div>}
  </div>
);
```

- [ ] **Step 6: `src/components/PhotoFrame.tsx`**

```tsx
import type { FC } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Photo } from "../schema";

export const PhotoFrame: FC<{ photo: Photo; zoomFrames?: number }> = ({ photo, zoomFrames }) => {
  const frame = useCurrentFrame();
  const scale = zoomFrames ? interpolate(frame, [0, zoomFrames], [1, 1.08], { extrapolateRight: "clamp" }) : 1;
  const pos = `${(photo.focusX ?? 0.5) * 100}% ${(photo.focusY ?? 0.5) * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`input/${photo.src}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${scale})`, transformOrigin: pos }}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 7: `src/compositions/Post.tsx`**

```tsx
import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { LogoRow } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import type { PostProps } from "../schema";

export const Post: FC<PostProps> = (p) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const text = { title: p.title, subtitle: p.subtitle, meta: p.meta, lang: p.lang, accent: colors[p.accent ?? "red"], u, titleScale: p.titleScale };

  if (p.layout === "band" && !p.transparent) {
    const bandH = Math.round(height * 0.38);
    return (
      <AbsoluteFill style={{ backgroundColor: colors.white }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: height - bandH, backgroundColor: colors.wine }}>
          {p.photo && <PhotoFrame photo={p.photo} />}
        </div>
        <div style={{ position: "absolute", left: safe.side, right: safe.side, top: height - bandH + 5 * u }}>
          <TextBlock {...text} color={colors.ink} />
        </div>
        <div style={{ position: "absolute", right: safe.side, bottom: safe.bottom }}>
          <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={8 * u} divider={colors.gray} />
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: p.transparent ? undefined : colors.wine }}>
      {p.photo && !p.transparent && <PhotoFrame photo={p.photo} />}
      {!p.transparent && (
        <AbsoluteFill style={{ background: `linear-gradient(to top, ${colors.ink}E6 0%, ${colors.ink}00 65%)` }} />
      )}
      <div style={{ position: "absolute", top: safe.top, left: safe.side }}>
        <LogoRow logoId={p.logoId} unitLogoId={p.unitLogoId} height={8 * u} divider={colors.white} />
      </div>
      <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom }}>
        <TextBlock {...text} color={colors.white} />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 8: `src/samples.ts`** — `<COLOR_ID>` ve `<WHITE_ID>` yerine `src/logos.json`'dan `kind:"main"` olan gerçek bir `tone:"color"` ve bir `tone:"white"` id'si yaz.

```ts
import type { PostProps } from "./schema";

export const LOGO_COLOR = "<COLOR_ID>";
export const LOGO_WHITE = "<WHITE_ID>";

export const samplePost: PostProps = {
  size: "post",
  lang: "tr",
  layout: "overlay",
  title: "Oryantasyon Günleri Başlıyor",
  subtitle: "Yeni öğrencilerimizi kampüste ağırlamaya hazırız.",
  meta: "11.09.2026 09:00 · UKÜ Kampüsü",
  photo: { src: "sample.jpg" },
  logoId: LOGO_WHITE,
};
```

- [ ] **Step 9: `src/Root.tsx` ve `src/index.ts`**

```tsx
import type { FC } from "react";
import { Still, type CalculateMetadataFunction } from "remotion";
import "./fonts";
import { Post } from "./compositions/Post";
import { resolveSize } from "./lib/rules";
import { samplePost } from "./samples";
import type { PostProps } from "./schema";

const stillMeta: CalculateMetadataFunction<PostProps> = ({ props }) => resolveSize(props.size);

export const RemotionRoot: FC = () => (
  <>
    <Still id="Post" component={Post} defaultProps={samplePost} calculateMetadata={stillMeta} />
  </>
);
```

```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

- [ ] **Step 10: Typecheck + testler**

Run: `cd skills/ciu-design/remotion && npm run typecheck && npm test`
Expected: tsc çıktısız; `# fail 0`. Generic hatası olursa (`Still` + `calculateMetadata`), Remotion dokümanı https://www.remotion.dev/docs/calculate-metadata.md'ye göre tipi düzelt.

- [ ] **Step 11: Render ve görsel doğrulama**

```bash
cd skills/ciu-design/remotion && mkdir -p ../../../out
npx remotion still src/index.ts Post ../../../out/post-overlay.png
npx remotion still src/index.ts Post ../../../out/post-band.png --props='{"size":"post","lang":"tr","layout":"band","title":"İĞŞÇÖÜ ığşçöü başlık","meta":"15.10.2026 14:00","photo":{"src":"sample.jpg"},"logoId":"<COLOR_ID>"}'
npx remotion still src/index.ts Post ../../../out/post-story.png --props='{"size":"story","lang":"tr","layout":"overlay","title":"Story testi","photo":{"src":"sample.jpg"},"logoId":"<WHITE_ID>"}'
npx remotion still src/index.ts Post ../../../out/post-layer.png --props='{"size":"post","lang":"tr","layout":"overlay","title":"Şeffaf katman","logoId":"<WHITE_ID>","transparent":true}'
```

Expected: 4 PNG. Her birini aç ve kontrol et: (a) logo orijinal oranında, (b) "İĞŞÇÖÜ ığşçöü" Source Sans 3 ile doğru glifler (yedek font değil), (c) story'de metin üst %14 / alt %20 dışında, (d) `post-layer.png` arka planı şeffaf (`python3 -c "from PIL import Image; print(Image.open('../../../out/post-layer.png').getpixel((5,5)))"` → son değer 0).

- [ ] **Step 12: Değişen dosyaları listele.**

---

### Task 7: `Motion` kompozisyonu (fotoğraflardan Reels)

**Files:**
- Create: `src/components/BrandCard.tsx`, `src/compositions/Motion.tsx`
- Modify: `src/schema.ts`, `src/samples.ts`, `src/Root.tsx`

**Interfaces:**
- Consumes: Task 6 bileşenleri, `colors`, `fonts`, `FPS`, `safeArea`, `resolveSize`.
- Produces:
  - `MotionProps`, `Slide` tipleri; `motionSeconds(p: MotionProps): number`; composition id `"Motion"`.
  - `<BrandCard logoId lines? />` (Task 8 de kullanır).
  - Ortak `videoMeta<T>(seconds)` fonksiyonu `Root.tsx`'te.

- [ ] **Step 1: `schema.ts`'e ekle**

```ts
export type Slide = { photo: Photo; title?: string; subtitle?: string; seconds: number };

export type MotionProps = {
  size: string;
  lang: Lang;
  slides: Slide[];
  bugLogoId: string;
  cardLogoId: string;
  outro: string[];
  music?: string;
  accent?: Accent;
};
```

- [ ] **Step 2: `src/components/BrandCard.tsx`**

```tsx
import type { FC } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../brand";
import { Logo } from "./Logo";

export const BrandCard: FC<{ logoId: string; lines?: string[] }> = ({ logoId, lines = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const show = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white, alignItems: "center", justifyContent: "center", gap: 3 * u }}>
      <div style={{ opacity: show(0), transform: `translateY(${(1 - show(0)) * 4 * u}px)`, marginBottom: 2 * u }}>
        <Logo id={logoId} height={20 * u} maxWidth={width * 0.8} />
      </div>
      {lines.map((line, i) => (
        <div key={line} style={{ opacity: show(10 + i * 5), fontFamily: fonts.body, fontSize: 3.4 * u, color: colors.ink }}>
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: `src/compositions/Motion.tsx`**

```tsx
import type { FC } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Logo } from "../components/Logo";
import { PhotoFrame } from "../components/PhotoFrame";
import { TextBlock } from "../components/TextBlock";
import { safeArea } from "../lib/rules";
import type { Lang, MotionProps, Slide } from "../schema";

const OUTRO_SECONDS = 3;

export const motionSeconds = (p: MotionProps): number => p.slides.reduce((sum, s) => sum + s.seconds, 0) + OUTRO_SECONDS;

const SlideView: FC<{ slide: Slide; lang: Lang; frames: number; accent: string }> = ({ slide, lang, frames, accent }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const fade = interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 0.3 * fps, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <PhotoFrame photo={slide.photo} zoomFrames={frames} />
      {slide.title && (
        <>
          <AbsoluteFill style={{ background: `linear-gradient(to top, ${colors.ink}E6 0%, ${colors.ink}00 60%)` }} />
          <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, opacity: rise, transform: `translateY(${(1 - rise) * 5 * u}px)` }}>
            <TextBlock title={slide.title} subtitle={slide.subtitle} lang={lang} color={colors.white} accent={accent} u={u} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Motion: FC<MotionProps> = (p) => {
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const f = (s: number) => Math.round(s * fps);
  const starts = p.slides.map((_, i) => p.slides.slice(0, i).reduce((sum, s) => sum + f(s.seconds), 0));
  const slidesEnd = p.slides.reduce((sum, s) => sum + f(s.seconds), 0);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      {p.slides.map((slide, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={f(slide.seconds)}>
          <SlideView slide={slide} lang={p.lang} frames={f(slide.seconds)} accent={colors[p.accent ?? "red"]} />
        </Sequence>
      ))}
      <Sequence durationInFrames={slidesEnd}>
        <div style={{ position: "absolute", top: safe.top, left: safe.side }}>
          <Logo id={p.bugLogoId} height={7 * u} />
        </div>
      </Sequence>
      <Sequence from={slidesEnd} durationInFrames={f(OUTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} lines={p.outro} />
      </Sequence>
      {p.music && <Audio src={staticFile(`input/${p.music}`)} />}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: `samples.ts`'e ekle**

```ts
import { contact } from "./brand";
import type { MotionProps } from "./schema";

export const sampleMotion: MotionProps = {
  size: "reels",
  lang: "tr",
  slides: [
    { photo: { src: "sample.jpg" }, title: "Yeni Dönem", subtitle: "Hoş geldiniz!", seconds: 3 },
    { photo: { src: "sample.jpg", focusX: 0.3 }, title: "Oryantasyon", seconds: 3 },
  ],
  bugLogoId: LOGO_WHITE,
  cardLogoId: LOGO_COLOR,
  outro: [contact.web, contact.instagram],
};
```

(Import'ları dosyanın başındaki mevcut import'larla birleştir.)

- [ ] **Step 5: `Root.tsx`'i güncelle** — tam dosya:

```tsx
import type { FC } from "react";
import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import "./fonts";
import { FPS } from "./brand";
import { Motion, motionSeconds } from "./compositions/Motion";
import { Post } from "./compositions/Post";
import { resolveSize } from "./lib/rules";
import { sampleMotion, samplePost } from "./samples";
import type { PostProps } from "./schema";

const stillMeta: CalculateMetadataFunction<PostProps> = ({ props }) => resolveSize(props.size);

const videoMeta =
  <T extends Record<string, unknown> & { size: string }>(seconds: (p: T) => number): CalculateMetadataFunction<T> =>
  ({ props }) => ({ ...resolveSize(props.size), durationInFrames: Math.max(1, Math.round(seconds(props) * FPS)) });

export const RemotionRoot: FC = () => (
  <>
    <Still id="Post" component={Post} defaultProps={samplePost} calculateMetadata={stillMeta} />
    <Composition id="Motion" component={Motion} fps={FPS} defaultProps={sampleMotion} calculateMetadata={videoMeta(motionSeconds)} />
  </>
);
```

- [ ] **Step 6: Typecheck + test**

Run: `cd skills/ciu-design/remotion && npm run typecheck && npm test`
Expected: hata yok, `# fail 0`.

- [ ] **Step 7: Storyboard + tam render**

```bash
cd skills/ciu-design/remotion
for fr in 10 100 190; do npx remotion still src/index.ts Motion ../../../out/motion-$fr.png --frame=$fr --scale=0.5; done
time npx remotion render src/index.ts Motion ../../../out/motion.mp4 --codec=h264
npx remotion ffprobe -v error -show_entries stream=width,height,codec_name -show_entries format=duration -of compact ../../../out/motion.mp4
```

Expected: 3 PNG (slayt 1, slayt 2, outro); ffprobe `h264`, `1080x1920`, süre ≈ 9.0 sn. PNG'leri aç: logo köşede bozulmamış, outro'da renkli logo + iki satır.

- [ ] **Step 8: Değişen dosyaları listele.**

---

### Task 8: `Branded` kompozisyonu (yüklenen videoyu markalama)

**Files:**
- Create: `src/components/LowerThird.tsx`, `src/components/Captions.tsx`, `src/compositions/Branded.tsx`
- Modify: `src/schema.ts`, `src/samples.ts`, `src/Root.tsx`

**Interfaces:**
- Consumes: `BrandCard`, `Logo`, `videoMeta`, `safeArea`.
- Produces: `BrandedProps`, `LowerThirdItem`; `brandedSeconds(p)`; composition id `"Branded"`. `srt` alanı SRT metni (dosya değil).

- [ ] **Step 1: `schema.ts`'e ekle**

```ts
export type LowerThirdItem = { name: string; role?: string; fromSec: number; toSec: number };

export type BrandedProps = {
  size: string;
  lang: Lang;
  video: string;
  videoSeconds: number;
  bugLogoId: string;
  cardLogoId: string;
  lowerThirds: LowerThirdItem[];
  srt?: string;
  outro: string[];
  music?: string;
  musicVolume?: number;
};
```

- [ ] **Step 2: `src/components/LowerThird.tsx`**

```tsx
import type { FC } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../brand";
import { safeArea } from "../lib/rules";

export const LowerThird: FC<{ name: string; role?: string; frames: number }> = ({ name, role, frames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const cfg = { damping: 200 };
  const p = spring({ frame, fps, config: cfg }) - spring({ frame: frame - (frames - 0.5 * fps), fps, config: cfg });
  return (
    <div style={{ position: "absolute", left: safe.side, bottom: safe.bottom + 8 * u, opacity: p, transform: `translateX(${(p - 1) * 10 * u}px)`, fontFamily: fonts.body }}>
      <div style={{ display: "inline-block", backgroundColor: colors.red, color: colors.white, fontWeight: 700, fontSize: 3.6 * u, padding: `${1.2 * u}px ${2.4 * u}px` }}>
        {name}
      </div>
      {role && (
        <div>
          <div style={{ display: "inline-block", backgroundColor: colors.white, color: colors.ink, fontSize: 2.8 * u, padding: `${0.9 * u}px ${2.4 * u}px` }}>
            {role}
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: `src/components/Captions.tsx`**

```tsx
import { parseSrt } from "@remotion/captions";
import { useMemo, type FC } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../brand";
import { safeArea } from "../lib/rules";

export const Captions: FC<{ srt: string }> = ({ srt }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const captions = useMemo(() => parseSrt({ input: srt }).captions, [srt]);
  const ms = (frame / fps) * 1000;
  const current = captions.find((c) => c.startMs <= ms && ms < c.endMs);
  if (!current) return null;
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  return (
    <div style={{ position: "absolute", left: safe.side, right: safe.side, bottom: safe.bottom, textAlign: "center" }}>
      <span style={{ backgroundColor: `${colors.ink}CC`, color: colors.white, fontFamily: fonts.body, fontWeight: 600, fontSize: 3.4 * u, lineHeight: 1.5, padding: `${0.4 * u}px ${1.2 * u}px`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {current.text.trim()}
      </span>
    </div>
  );
};
```

- [ ] **Step 4: `src/compositions/Branded.tsx`**

```tsx
import type { FC } from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { BrandCard } from "../components/BrandCard";
import { Captions } from "../components/Captions";
import { Logo } from "../components/Logo";
import { LowerThird } from "../components/LowerThird";
import { safeArea } from "../lib/rules";
import type { BrandedProps } from "../schema";

const INTRO_SECONDS = 2;
const OUTRO_SECONDS = 3;

export const brandedSeconds = (p: BrandedProps): number => INTRO_SECONDS + p.videoSeconds + OUTRO_SECONDS;

export const Branded: FC<BrandedProps> = (p) => {
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const safe = safeArea(width, height);
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <Sequence durationInFrames={f(INTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} />
      </Sequence>
      <Sequence from={f(INTRO_SECONDS)} durationInFrames={f(p.videoSeconds)}>
        <OffthreadVideo src={staticFile(`input/${p.video}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: safe.top, right: safe.side }}>
          <Logo id={p.bugLogoId} height={6 * u} />
        </div>
        {p.lowerThirds.map((l, i) => (
          <Sequence key={i} from={f(l.fromSec)} durationInFrames={f(l.toSec - l.fromSec)}>
            <LowerThird name={l.name} role={l.role} frames={f(l.toSec - l.fromSec)} />
          </Sequence>
        ))}
        {p.srt && <Captions srt={p.srt} />}
      </Sequence>
      <Sequence from={f(INTRO_SECONDS + p.videoSeconds)} durationInFrames={f(OUTRO_SECONDS)}>
        <BrandCard logoId={p.cardLogoId} lines={p.outro} />
      </Sequence>
      {p.music && <Audio src={staticFile(`input/${p.music}`)} volume={p.musicVolume ?? 0.25} />}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 5: `samples.ts`'e ekle**

```ts
import type { BrandedProps } from "./schema";

export const sampleBranded: BrandedProps = {
  size: "reels",
  lang: "tr",
  video: "sample.mp4",
  videoSeconds: 4,
  bugLogoId: LOGO_WHITE,
  cardLogoId: LOGO_COLOR,
  lowerThirds: [{ name: "Prof. Dr. Ad Soyad", role: "Rektör", fromSec: 0.5, toSec: 3.5 }],
  srt: "1\n00:00:00,500 --> 00:00:02,000\nUKÜ'ye hoş geldiniz\n\n2\n00:00:02,000 --> 00:00:03,800\nYeni dönemde başarılar\n",
  outro: [contact.web, contact.instagram],
};
```

- [ ] **Step 6: `Root.tsx`'e kompozisyonu ekle** — import'lara `import { Branded, brandedSeconds } from "./compositions/Branded";` ve `sampleBranded` ekle; `<>` içine:

```tsx
    <Composition id="Branded" component={Branded} fps={FPS} defaultProps={sampleBranded} calculateMetadata={videoMeta(brandedSeconds)} />
```

- [ ] **Step 7: Sentetik test klibi üret** (git'e girmez)

Run: `cd skills/ciu-design/remotion && npx remotion ffmpeg -y -f lavfi -i testsrc=duration=4:size=1080x1920:rate=30 -f lavfi -i sine=frequency=440:duration=4 -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac public/input/sample.mp4`
Expected: `public/input/sample.mp4` oluşur.

- [ ] **Step 8: Typecheck + test + render**

```bash
cd skills/ciu-design/remotion && npm run typecheck && npm test
for fr in 20 90 200; do npx remotion still src/index.ts Branded ../../../out/branded-$fr.png --frame=$fr --scale=0.5; done
npx remotion render src/index.ts Branded ../../../out/branded.mp4 --codec=h264
npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 ../../../out/branded.mp4
```

Expected: typecheck/test temiz; süre ≈ 9.0; kare 20 = intro logo, kare 90 = video + köşe logo + isim bandı + altyazı, kare 200 = outro.

- [ ] **Step 9: Değişen dosyaları listele.**

---

### Task 9: `setup.mjs` — ortam kontrolü ve çalışma alanı

**Files:**
- Create: `skills/ciu-design/scripts/setup.mjs`

**Interfaces:**
- Consumes: Task 1 kararı (claude.ai yolları, Chromium yolu).
- Produces: stdout'ta `KEY=VALUE` satırları: `ENV` (`claudeai`|`local`), `IN`, `OUT`, `WORK`, `REMOTION_RULES`, `CHROME` (boş olabilir), `RULES_WARNING` (opsiyonel). Hata halinde tek satır `ERROR=<KOD>` + `DETAIL=<son 3 satır>` ve exit 1. Kodlar: `NODE_TOO_OLD`, `NPM_INSTALL_FAILED`, `BROWSER_DOWNLOAD_FAILED`.

- [ ] **Step 1: `scripts/setup.mjs`** — Task 1 sonuçlarıyla `CLAUDEAI` sabitlerini ve `KNOWN_CHROMES`'u doğrula/güncelle.

```js
#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_TARBALL = "https://codeload.github.com/remotion-dev/skills/tar.gz/refs/heads/main";
const CLAUDEAI = { in: "/mnt/user-data/uploads", out: "/mnt/user-data/outputs", data: "/tmp/ciu-design" };
const KNOWN_CHROMES = ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];

const fail = (code, err) => {
  const detail = String(err?.stderr || err?.message || "").trim().split("\n").slice(-3).join(" | ");
  console.log(`ERROR=${code}\nDETAIL=${detail}`);
  process.exit(1);
};
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "pipe"] }).toString();

if (Number(process.versions.node.split(".")[0]) < 18) fail("NODE_TOO_OLD", { message: process.versions.node });

const env = existsSync("/mnt/user-data") ? "claudeai" : "local";
const data = env === "claudeai" ? CLAUDEAI.data : process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".cache", "ciu-design");
const inDir = env === "claudeai" ? CLAUDEAI.in : join(process.cwd(), "girdiler");
const outDir = env === "claudeai" ? CLAUDEAI.out : join(process.cwd(), "ciktilar");
const work = join(data, "remotion");
[data, inDir, outDir].forEach((d) => mkdirSync(d, { recursive: true }));

rmSync(join(work, "src"), { recursive: true, force: true });
rmSync(join(work, "public"), { recursive: true, force: true });
cpSync(join(SKILL, "remotion"), work, { recursive: true, filter: (src) => !src.includes("node_modules") });

const lock = readFileSync(join(work, "package-lock.json"), "utf8");
const stamp = join(work, "node_modules", ".ciu-lock");
if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== lock) {
  try {
    sh("npm ci --omit=dev --no-audit --no-fund --loglevel=error", work);
    writeFileSync(stamp, lock);
  } catch (e) {
    fail("NPM_INSTALL_FAILED", e);
  }
}

let chrome = process.env.CIU_CHROME || "";
try {
  sh("npx remotion browser ensure", work);
} catch (e) {
  chrome ||= KNOWN_CHROMES.find((p) => existsSync(p)) || "";
  if (!chrome) fail("BROWSER_DOWNLOAD_FAILED", e);
}

let rules = join(SKILL, "vendor", "remotion");
let rulesWarning = "";
if (!existsSync(rules)) {
  rules = join(data, "remotion-skills");
  if (!existsSync(join(rules, "remotion-best-practices"))) {
    try {
      mkdirSync(rules, { recursive: true });
      sh(`curl -fsL ${RULES_TARBALL} | tar -xz -C "${rules}" --strip-components=2 skills-main/skills`);
    } catch {
      rulesWarning = "Remotion kuralları indirilemedi; yalnızca hazır kompozisyonları kullan.";
    }
  }
}

console.log([
  `ENV=${env}`, `IN=${inDir}`, `OUT=${outDir}`, `WORK=${work}`, `REMOTION_RULES=${rules}`, `CHROME=${chrome}`,
  rulesWarning && `RULES_WARNING=${rulesWarning}`,
].filter(Boolean).join("\n"));
```

- [ ] **Step 2: İlk çalıştırma (soğuk)**

Run: `cd /tmp && rm -rf /tmp/ciu-setup-test && time CLAUDE_PLUGIN_DATA=/tmp/ciu-setup-test node ~/ciu-skills/skills/ciu-design/scripts/setup.mjs`
Expected: `ENV=local`, `WORK=/tmp/ciu-setup-test/remotion`, `REMOTION_RULES=/tmp/ciu-setup-test/remotion-skills`, hata yok. `ls /tmp/ciu-setup-test/remotion-skills` → `remotion-best-practices remotion-markup …`.

- [ ] **Step 3: İkinci çalıştırma (sıcak) hızlı mı**

Run: `cd /tmp && time CLAUDE_PLUGIN_DATA=/tmp/ciu-setup-test node ~/ciu-skills/skills/ciu-design/scripts/setup.mjs`
Expected: < 15 sn, aynı çıktı.

- [ ] **Step 4: Hata yolu**

Run: `cd /tmp && rm -rf /tmp/ciu-setup-fail && CLAUDE_PLUGIN_DATA=/tmp/ciu-setup-fail npm_config_registry=http://127.0.0.1:9 node ~/ciu-skills/skills/ciu-design/scripts/setup.mjs; echo "exit=$?"`
Expected: `ERROR=NPM_INSTALL_FAILED`, `DETAIL=…`, `exit=1`.

- [ ] **Step 5: Çalışma alanında render**

Run: `cd /tmp/ciu-setup-test/remotion && npx remotion still src/index.ts Post /tmp/ciu-setup-test/check.png && ls -la /tmp/ciu-setup-test/check.png`
Expected: PNG var.

- [ ] **Step 6: Temizlik + değişen dosyaları listele** (`rm -rf /tmp/ciu-setup-test /tmp/ciu-setup-fail /tmp/girdiler /tmp/ciktilar`).

---

### Task 10: SKILL.md

**Files:**
- Create: `skills/ciu-design/SKILL.md`

**Interfaces:**
- Consumes: `setup.mjs` çıktı anahtarları; composition id'leri `Post`/`Motion`/`Branded`; `schema.ts` tipleri; `logos.json`; `brand.md`, `style.md`, `references/`.

- [ ] **Step 1: `SKILL.md` yaz**

````markdown
---
name: ciu-design
description: Creates on-brand visuals and videos for Cyprus International University (CIU / UKÜ, Uluslararası Kıbrıs Üniversitesi) — Instagram/Facebook/LinkedIn posts, stories, reels, banners, motion graphics, and branded versions of uploaded video clips (intro/outro, logo, name bars, subtitles) — from a prompt plus optional photos, clips or a ciu.edu.tr news/event link. Applies the official corporate identity guide and UKÜ's social media style. Use for ANY UKÜ/CIU design or video request, e.g. "UKÜ için story yap", "bu fotoğrafla duyuru tasarla", "etkinlik postu hazırla", "Reels yap", "videoya logo ve altyazı ekle", "bayram tebriği", "CIU Instagram post", or when a ciu.edu.tr link is shared and a post is wanted.
---

# CIU Design

You are UKÜ's in-house designer. The user is a graphic designer, not a developer: reply in their language (usually Turkish), plainly, no code or stack traces unless asked. `<skill>` below = the directory containing this file.

## 0. Setup — once per conversation
Run `node <skill>/scripts/setup.mjs` and keep its KEY=VALUE output (ENV, IN, OUT, WORK, REMOTION_RULES, CHROME).
On `ERROR=…` stop and tell the user (Turkish, one or two sentences):
- NODE_TOO_OLD → "Bilgisayardaki Node.js sürümü eski. https://nodejs.org adresinden LTS sürümünü kurup bana 'tekrar dene' yaz."
- NPM_INSTALL_FAILED → claude.ai: "Gerekli paketler indirilemedi. Yöneticinizden Ayarlar → Kod çalıştırma ağ izinlerinde registry.npmjs.org, remotion.media ve storage.googleapis.com'a izin vermesini isteyin." Local: "İnternet bağlantısını kontrol edip 'tekrar dene' yaz."
- BROWSER_DOWNLOAD_FAILED → same as NPM_INSTALL_FAILED.
If CHROME is non-empty, add `--browser-executable=$CHROME` to every remotion command. If RULES_WARNING is present, do not write custom compositions.

## 1. Load the brand
Always read `<skill>/brand/brand.md` and `<skill>/brand/style.md`. Look at the 3–5 files in `<skill>/brand/references/` whose names match the request type (duyuru, etkinlik, tebrik, haber, kampanya, reels).

## 2. Gather inputs
- Mode: **Post** (still) by default; **Motion** for "Reels / video / animasyon" from photos; **Branded** when a video clip is provided.
- Files: claude.ai → `$IN`. Local agent → paths the user gives, or files in `$IN` (tell the user: "Dosyaları çalışma klasöründeki `girdiler` klasörüne koyabilirsin"). If an image is only visible in the chat with no file, ask for the file.
- Copy every input into `$WORK/public/input/` with a short ASCII name (no spaces, no Turkish letters).
- ciu.edu.tr link → fetch the page; use `og:title`, `og:description`, `og:image`, `<time datetime>`. Download `og:image` into `$WORK/public/input/`; if blocked, ask the user to upload it.
- Look at every photo yourself: short side < 1080 px → warn; note faces and the focal point (→ `focusX`/`focusY`, 0–1).
- Clip duration: `cd $WORK && npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 public/input/<clip>` → `videoSeconds`. Unsupported codec (mov/hevc/webm) → `npx remotion ffmpeg -y -i public/input/<clip> -c:v libx264 -pix_fmt yuv420p -c:a aac public/input/clip.mp4`. claude.ai and clip > 180 s → warn that rendering may time out and offer to trim.

## 3. Brief — think before designing
Write a 3–5 line brief (goal, audience, platform, key message, available material). Then add at most 3 items, each labeled **Gerekli** or **İsteğe bağlı**, when:
- material is insufficient (low resolution, missing speaker photo, text too long for the size);
- the request is vague → offer 2–3 concept directions (idea + headline + layout);
- something adds clear value (EN version, carousel split, Instagram caption + hashtags, alt text);
- the user asks ("ne önerirsin", "fikir ver", "düşün").
Skip this step for clear, complete requests or when the user says "direkt yap". Never block on **İsteğe bağlı** items — proceed with defaults.

## 4. Ask only what is missing
At most 2 questions: size, language (tr / en / both), text. Size aliases: post 1080×1350, portrait 1080×1440, kare 1080×1080, story/reels 1080×1920, yatay/youtube 1920×1080, linkedin 1200×628, og 1200×630, or `WxH`.

## 5. Compose
Create `$OUT/<YYYYMMDD-HHmm>-<slug>/` and write `design.json` there. Props must match `<skill>/remotion/src/schema.ts`:
- Post: `PostProps` (layout `band` = photo on top, white text band; `overlay` = full-bleed photo with text; `transparent: true` = logo+text layer only).
- Motion: `MotionProps` (slides of 2–5 s, `outro` lines e.g. `["ciu.edu.tr", "@ciu.official"]`).
- Branded: `BrandedProps` (`lowerThirds` timings in clip seconds, `srt` as SRT text).
Rules:
- Logo ids only from `<skill>/remotion/src/logos.json`. Photo/dark background → `tone: white`; white background → `tone: color`. Follow brand.md for unit logos.
- Copy in the tone of style.md. Dates/times as `15.10.2026 14:00`. Long titles → `titleScale` 0.7–0.9.
- Music only if the user provides an audio file (`music`).
- If the built-in compositions cannot express the idea, read `$REMOTION_RULES/remotion-best-practices/SKILL.md`, write a new composition in `$WORK/src/custom/`, register it in `$WORK/src/Root.tsx` (never edit `<skill>`), and use `<Logo>`, `brand.ts` tokens and `safeArea` in it.

## 6. Preview
Run remotion commands from `$WORK`. `D=$OUT/<dir>`.
- Post: two variants (e.g. band vs overlay): `npx remotion still src/index.ts Post $D/preview-a.png --props=$D/design-a.json --scale=0.5` (and b).
- Video: storyboard of three frames (opening, middle, closing): `npx remotion still src/index.ts <Motion|Branded> $D/frame-<n>.png --props=$D/design.json --frame=<n> --scale=0.5`.

## 7. Self-check — before showing anything
Open each rendered image and check: logo intact, correct tone, not too small; text legible with enough contrast, nothing overflowing or cut; Turkish letters correct (İ, ı, ğ, ş); on 9:16 nothing important in the top 14 % / bottom 20 %; no faces cropped. Fix and re-render (max 2 rounds), then show the user.

## 8. Final render & revisions
- Post: `npx remotion still src/index.ts Post $D/final.png --props=$D/design.json`
- Video: `npx remotion render src/index.ts <Motion|Branded> $D/final.mp4 --props=$D/design.json --codec=h264`
- Carousel: one design-N.json per slide, rendered as final-N.png.
Revisions edit design.json and re-render. "Aynısını İngilizce / story yap" → copy design.json, change `lang`/`size`, rewrite text.
Render error → read it, fix, retry at most twice; then explain plainly what failed and what the user can do.

## Brand guardrails
- HARD (refuse, say why in one sentence, offer an alternative): recolor/outline/shadow/stretch the logo, re-typeset or abbreviate the logo text, add text into the logo, grayscale-convert a logo — see brand.md "Logo misuse".
- SOFT (warn once, then do it): off-palette colors, non-brand fonts, layouts that contradict style.md.
````

- [ ] **Step 2: Description uzunluğu**

Run: `node -e "const t=require('fs').readFileSync('skills/ciu-design/SKILL.md','utf8');const d=t.match(/^description: (.*)$/m)[1];console.log(d.length, d.length<=1024?'ok':'TOO LONG')"`
Expected: `<sayı> ok`

- [ ] **Step 3: Description optimizasyonu** — `anthropic-skills:skill-creator` skill'ini çağır ve description tetikleme optimizasyonu adımını uygula (TR ve EN tetikleyici örnekleriyle). Sonucu 1024 sınırında tut.

- [ ] **Step 4: Değişen dosyaları listele.**

---

### Task 11: Build (her skill için claude.ai zip'i) + README kurulum rehberi

**Files:**
- Create: `tools/build.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces: `skills/*` altındaki her skill için `dist/<skill>.zip` (kökte `<skill>/SKILL.md`). `remotion/` klasörü olan skill'lere `<skill>/vendor/remotion/` eklenir. Zip'ler `node_modules` ve `public/input/sample.mp4` içermez. Şimdilik tek çıktı: `dist/ciu-design.zip`.

- [ ] **Step 1: `tools/build.mjs`**

```js
#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const RULES_TARBALL = "https://codeload.github.com/remotion-dev/skills/tar.gz/refs/heads/main";
const sh = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: "inherit" });
const dirs = (p) => (existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : []);

rmSync(DIST, { recursive: true, force: true });
for (const skill of dirs(join(ROOT, "skills"))) {
  const src = join(ROOT, "skills", skill);
  const stage = join(DIST, "stage", skill);
  cpSync(src, stage, { recursive: true, filter: (p) => !/node_modules|vendor|sample\.mp4$/.test(p.slice(src.length)) });
  if (existsSync(join(src, "remotion"))) {
    mkdirSync(join(stage, "vendor", "remotion"), { recursive: true });
    sh(`curl -fsL ${RULES_TARBALL} | tar -xz -C "${join(stage, "vendor", "remotion")}" --strip-components=2 skills-main/skills`);
  }
  sh(`zip -rq ../${skill}.zip ${skill}`, join(DIST, "stage"));
  console.log(`dist/${skill}.zip ${(statSync(join(DIST, `${skill}.zip`)).size / 1048576).toFixed(1)} MB`);
}
rmSync(join(DIST, "stage"), { recursive: true, force: true });
```

- [ ] **Step 2: Build ve içerik kontrolü**

```bash
cd ~/ciu-skills && node tools/build.mjs
unzip -l dist/ciu-design.zip | grep -E 'ciu-design/SKILL.md|vendor/remotion/remotion-best-practices/SKILL.md|logos.json|SourceSans3.ttf'
unzip -l dist/ciu-design.zip | grep -cE 'node_modules|sample\.mp4'
```

Expected: `dist/ciu-design.zip <n> MB`; 4 eşleşme; ikinci komut `0`. Boyut Task 1'de bulunan limitin altında (limit bilinmiyorsa < 30 MB hedefle).

- [ ] **Step 3: `README.md`'yi tamamla** — "Kurulum talimatları Task 11'de eklenecek." satırını şu içerikle değiştir (`<owner>` Task 2'deki değer):

```markdown
## Kurulum — ciu-design (tasarımcı için)

### claude.ai (web / masaüstü sohbet)
1. Ayarlar → Yetenekler'de **Kod çalıştırma ve dosya oluşturma** açık olmalı.
2. Ayarlar → Yetenekler → Skills → **Skill yükle** → `ciu-design.zip` dosyasını seç.
3. Yeni sohbette yaz: "UKÜ için bu fotoğrafla bir duyuru postu yap" ve fotoğrafı ekle.
> Organizasyon planınız Team/Enterprise ise yönetici skill'i herkese açabilir; bu durumda adım 2 gerekmez.

### Claude masaüstü uygulaması — Code sekmesi
1. Bir klasör seç (ör. `Belgeler/CIU-Tasarim`) ve Code sekmesinde aç.
2. Customize → Plugins → **Add marketplace** → `<owner>/ciu-skills` → `ciu-design` (yalnızca tasarım) ya da `ciu-skills` (setin tamamı) kur. Marketplace ayarlarında **otomatik güncelleme**yi aç.
3. Fotoğraf/videoları klasördeki `girdiler/` içine koy; çıktılar `ciktilar/` klasörüne gelir.

## Kurulum — diğer AI ajanları (Codex, Cursor, Gemini CLI, Copilot, …)

Node.js gerekir. Kurulu ajanlar otomatik algılanır:

    npx skills add <owner>/ciu-skills                      # setten seçerek kur
    npx skills add <owner>/ciu-skills --skill ciu-design   # yalnızca bir skill
    npx skills add <owner>/ciu-skills --all                # hepsi, tüm ajanlara
    npx skills update                                      # güncelle

`ciu-design` için ajanın komut çalıştırabilmesi ve görsel okuyabilmesi gerekir.

## Bakımcı için

- Test: `cd skills/ciu-design/remotion && npm test && npm run typecheck`
- Logolar değişti: yeni dosyaları `raw/` altına koy → `python3 tools/make_logos.py`
- claude.ai paketleri: `node tools/build.mjs` → her skill için `dist/<skill>.zip`
- Sürüm: `.claude-plugin/marketplace.json` → `metadata.version`'ı artır (Claude Code güncellemeleri); `npx skills update` doğrudan repodan çeker.
- Yeni skill eklemek: `skills/<ad>/SKILL.md` oluştur; marketplace.json'a `<ad>` girişi ekle ve `ciu-skills` girişinin `skills` dizisine `./skills/<ad>` yaz; README tablosunu güncelle. `build.mjs` ve `npx skills` yeni skill'i otomatik bulur.
- Lisans: Remotion (https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) — UKÜ'nün kâr amacı gütmeyen statüsü teyit edilmeli. Source Sans 3: SIL OFL 1.1.
```

- [ ] **Step 4: Değişen dosyaları listele.**

---

### Task 12: Kurulum + eval (iki platform) + tasarımcı kabulü

**Files:**
- Create: `evals/ciu-design/evals.json`, `evals/ciu-design/files/photo-1.jpg`, `evals/ciu-design/files/photo-2.jpg`, `evals/ciu-design/files/photo-3.jpg`, `evals/ciu-design/files/clip.mp4`

**Interfaces:**
- Consumes: tüm önceki task'lar; `dist/ciu-design.zip`; plugin marketplace.

- [ ] **Step 1: Eval dosyaları** — `raw/social/web/` içinden 3 fotoğrafı `evals/ciu-design/files/photo-{1,2,3}.jpg` olarak kopyala; klibi üret:

Run: `cd skills/ciu-design/remotion && npx remotion ffmpeg -y -f lavfi -i testsrc=duration=12:size=1080x1920:rate=30 -f lavfi -i sine=frequency=330:duration=12 -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac ../../../evals/ciu-design/files/clip.mp4`

- [ ] **Step 2: `evals/ciu-design/evals.json`** — formatı `skill-creator` skill'inin `references/schemas.md` dosyasıyla doğrula; içerik:

```json
{
  "skill_name": "ciu-design",
  "evals": [
    { "id": 1, "prompt": "Bu fotoğrafla 4:5 bir etkinlik duyurusu yap: 'Kariyer Günleri', 15 Ekim 2026 saat 14:00, Kongre Merkezi.", "files": ["evals/ciu-design/files/photo-1.jpg"], "expected_output": "1080x1350 PNG; Türkçe; tarih '15.10.2026 14:00'; resmi logo bozulmamış; önce 2 varyant önizleme." },
    { "id": 2, "prompt": "Aynı tasarımın İngilizce versiyonunu ve story boyutunu da yap.", "files": [], "expected_output": "Önceki design.json kopyalanmış; EN metin; 1080x1920; metin story güvenli alanında." },
    { "id": 3, "prompt": "Şu haberi Instagram postuna çevir: https://ciu.edu.tr/tr/haberler/uku-2026-2027-yili-oryantasyon-gunleri-basliyor", "files": [], "expected_output": "Başlık/özet/görsel sayfadan; post metni + hashtag önerisi." },
    { "id": 4, "prompt": "Mühendislik Fakültesi için 'Robotik Atölyesi' duyurusu, kare format.", "files": ["evals/ciu-design/files/photo-2.jpg"], "expected_output": "1080x1080; fakülte logosu brand.md kuralına göre yerleştirilmiş." },
    { "id": 5, "prompt": "Bu üç fotoğraftan 15 saniyelik bir Reels yap, başlık 'Kampüste Bahar'.", "files": ["evals/ciu-design/files/photo-1.jpg", "evals/ciu-design/files/photo-2.jpg", "evals/ciu-design/files/photo-3.jpg"], "expected_output": "1080x1920 H.264 MP4, ~15 sn; önce 3 karelik storyboard; outro'da logo + ciu.edu.tr." },
    { "id": 6, "prompt": "Bu videoya UKÜ intro ve outro ekle, 1. saniyeden 4. saniyeye 'Prof. Dr. Ayşe Yılmaz – Rektör' isim bandı koy.", "files": ["evals/ciu-design/files/clip.mp4"], "expected_output": "MP4 = 2 sn intro + 12 sn klip + 3 sn outro; köşe logosu; isim bandı doğru zamanda." },
    { "id": 7, "prompt": "Logoyu kırmızı yap, daha dikkat çekici olsun.", "files": [], "expected_output": "Reddeder, kılavuz kuralını tek cümleyle söyler, alternatif önerir (ör. kırmızı vurgu bandı)." },
    { "id": 8, "prompt": "Bayram için bir şey yap.", "files": [], "expected_output": "Brief + 2–3 konsept yönü önerir; hangi bayram/boyut/dil olduğunu sorar ya da varsayılanı belirtir." }
  ]
}
```

- [ ] **Step 3: Code kurulumu (yerel)** — Claude masaüstü uygulamasında Code sekmesi → Customize → Plugins → Add marketplace → `~/ciu-skills` (yerel yol) → `ciu-design` kur (ayrıca `ciu-skills` girişinin de kurulabildiğini doğrula). Boş bir test klasöründe yeni oturum aç.

- [ ] **Step 4: Code'da eval** — `skill-creator` eval döngüsüyle 8 senaryoyu çalıştır; her çıktı için `expected_output` karşılandı mı not et (`evals/ciu-design/results-code.md`: `id | geçti/kaldı | not`). Kalanları SKILL.md / bileşenlerde düzelt, tekrar çalıştır.

- [ ] **Step 5: claude.ai kurulumu ve eval** — `node tools/build.mjs`; `dist/ciu-design.zip`'i claude.ai'ye yükle (README adımları); 8 senaryoyu yeni sohbetlerde çalıştır → `evals/ciu-design/results-claudeai.md`. (Bu adımı insan yürütür; ajan sonuçları alıp düzeltmeleri yapar.)

- [ ] **Step 5b: Claude dışı ajan duman testi** — Emre'nin makinesinde kurulu bir ajanla (Codex CLI ya da Gemini CLI; yoksa `npx skills add ./ --list` ile yalnızca keşif doğrulanır): `npx skills add ./ --skill ciu-design -a <ajan> -y`, sonra o ajanda eval 1'i çalıştır → `evals/ciu-design/results-<ajan>.md`. Ajan-bağımsızlığı bozan SKILL.md ifadelerini düzelt.

- [ ] **Step 6: Code'da sürükle-bırak gözlemi** — masaüstü uygulamasında görsel sohbete sürüklendiğinde dosya yolu mu yoksa yalnızca ek mi oluştuğunu not et; SKILL.md §2 "Files" maddesini buna göre netleştir.

- [ ] **Step 7: Tasarımcı kabulü** — tasarımcı en az 3 gerçek işini skill'le üretir. "UKÜ'ye yakışmıyor" geri bildirimleri `style.md`/`brand.ts`/layout'lara işlenir. Kabul gelene kadar task açık kalır.

- [ ] **Step 8: Değişen dosyaları listele.** Emre GitHub'a push eder; Code kurulumu `<owner>/ciu-skills` marketplace'ine çevrilir.

---

### Task 13: Otomatik altyazı (yalnızca Claude Code)

Ön koşul: Task 12 kabul edildi. Mac'te Xcode Command Line Tools (`xcode-select --install`) gerekir; claude.ai'de çalışmaz (whisper.cpp derleme + 800 MB model indirme).

**Files:**
- Create: `skills/ciu-design/scripts/transcribe.mjs`
- Modify: `skills/ciu-design/remotion/package.json` (+ `@remotion/install-whisper-cpp@4.0.532`), `package-lock.json`, `skills/ciu-design/SKILL.md` (§2 Branded maddesi)

**Interfaces:**
- Produces: `node <skill>/scripts/transcribe.mjs <WORK> <clip-in-public/input> [tr|en]` → stdout'a SRT metni (Branded `srt` alanına doğrudan konur).

- [ ] **Step 1: Paketi ekle**

Run: `cd skills/ciu-design/remotion && npm i --save-exact @remotion/install-whisper-cpp@4.0.532 && npm test`
Expected: kurulum + `# fail 0`.

- [ ] **Step 2: `scripts/transcribe.mjs`**

```js
#!/usr/bin/env node
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

const [work, clip, lang = "tr"] = process.argv.slice(2);
const require = createRequire(join(work, "package.json"));
const { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } = require("@remotion/install-whisper-cpp");
const { createTikTokStyleCaptions, serializeSrt } = require("@remotion/captions");

const WHISPER = join(work, "..", "whisper");
const VERSION = "1.5.5";
const MODEL = "large-v3-turbo";
const wav = join(work, "public", "input", "audio16k.wav");

execSync(`npx remotion ffmpeg -y -i "${join(work, "public", "input", clip)}" -ar 16000 -ac 1 "${wav}"`, { cwd: work, stdio: "ignore" });
await installWhisperCpp({ to: WHISPER, version: VERSION });
await downloadWhisperModel({ model: MODEL, folder: WHISPER });
const out = await transcribe({ inputPath: wav, whisperPath: WHISPER, whisperCppVersion: VERSION, model: MODEL, tokenLevelTimestamps: true, language: lang });
const { captions } = toCaptions({ whisperCppOutput: out });
const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
const lines = pages.map((p) => [{ text: p.text, startMs: p.startMs, endMs: p.startMs + p.durationMs, timestampMs: null, confidence: null }]);
process.stdout.write(serializeSrt({ lines }));
```

- [ ] **Step 3: Gerçek konuşmalı klip ile dene** — Emre'den 20–30 sn Türkçe konuşmalı bir klip iste (`girdiler/`), WORK'e kopyala:

Run: `node skills/ciu-design/scripts/transcribe.mjs "$WORK" konusma.mp4 tr | head -20`
Expected: zaman damgalı Türkçe SRT satırları. `serializeSrt`/`toCaptions` imzası farklıysa https://www.remotion.dev/docs/captions/serialize-srt.md ve https://www.remotion.dev/docs/install-whisper-cpp/to-captions.md'ye göre düzelt.

- [ ] **Step 4: SKILL.md §2'ye ekle** (Branded maddesinin altına):

```markdown
- Subtitles: Code → `node <skill>/scripts/transcribe.mjs $WORK <clip> <tr|en>` and put the output into `srt` (first run downloads ~800 MB; tell the user it takes a few minutes). claude.ai → ask the user for the text or an .srt file.
```

- [ ] **Step 5: Eval 6'yı altyazılı tekrar çalıştır; değişen dosyaları listele.**
