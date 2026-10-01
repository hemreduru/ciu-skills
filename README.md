# ciu-skills

Uluslararası Kıbrıs Üniversitesi (UKÜ / CIU) için skill seti. Agent Skills açık standardını kullanır; Claude Code, claude.ai, Codex, Cursor, Gemini CLI, GitHub Copilot ve diğer uyumlu ajanlarda çalışır.

| Skill | Ne yapar | Durum |
|---|---|---|
| `ciu-design` | Kurumsal kimliğe uygun görsel ve video | geliştiriliyor |

- Tasarım: `docs/superpowers/specs/2026-10-01-ciu-design.md`
- Plan: `docs/superpowers/plans/2026-10-01-ciu-design.md`

## Ön koşullar

- **Node.js 22.18 veya üstü** (https://nodejs.org, LTS). claude.ai'de kod çalıştırma ortamında hazır gelir.
- **Ağ erişimi:** ilk çalıştırmada skill, Remotion paketlerini ve bir tarayıcıyı indirir. Bu 1–3 dakika sürer; sonraki sohbetler hızlıdır.
- **claude.ai:** Ayarlar → Yetenekler'de *Kod çalıştırma ve dosya oluşturma* açık olmalı. Ağ kısıtlıysa yöneticiniz kod çalıştırma ağ izinlerinde `registry.npmjs.org`, `remotion.media` ve `storage.googleapis.com` adreslerine izin vermelidir.
- Remotion'ı ayrıca kurmanız gerekmez; skill kendisi kurar.

## Kurulum — ciu-design (tasarımcı için)

### claude.ai (web / masaüstü sohbet)
1. Ayarlar → Yetenekler'de **Kod çalıştırma ve dosya oluşturma** açık olmalı.
2. Ayarlar → Yetenekler → Skills → **Skill yükle** → `ciu-design.zip` dosyasını seç.
3. Yeni sohbette yaz: "UKÜ için bu fotoğrafla bir duyuru postu yap" ve fotoğrafı ekle.
> Organizasyon planınız Team/Enterprise ise yönetici skill'i herkese açabilir; bu durumda adım 2 gerekmez.

### Claude masaüstü uygulaması — Code sekmesi
1. Bir klasör seç (ör. `Belgeler/CIU-Tasarim`) ve Code sekmesinde aç.
2. Customize → Plugins → **Add marketplace** → `hemreduru/ciu-skills` → `ciu-design` (yalnızca tasarım) ya da `ciu-skills` (setin tamamı) kur. Marketplace ayarlarında **otomatik güncelleme**yi aç.
3. Fotoğraf/videoları klasördeki `girdiler/` içine koy; çıktılar `ciktilar/` klasörüne gelir.

## Kurulum — diğer AI ajanları (Codex, Cursor, Gemini CLI, Copilot, …)

Node.js gerekir. Kurulu ajanlar otomatik algılanır:

    npx skills add hemreduru/ciu-skills                      # setten seçerek kur
    npx skills add hemreduru/ciu-skills --skill ciu-design   # yalnızca bir skill
    npx skills add hemreduru/ciu-skills --all                # hepsi, tüm ajanlara
    npx skills update                                      # güncelle

`ciu-design` için ajanın komut çalıştırabilmesi ve görsel okuyabilmesi gerekir.

## ciu-slides (sunum)

UKÜ'nün resmi sunum şablonuyla (https://ciu.edu.tr/tr/uku-sablonu) marka uyumlu `.pptx` hazırlar: konu, taslak ya da belge ver; skill slaytları planlar, şablonu **her çalıştırmada güncel haliyle indirir**, sunumu üretir ve teslimden önce denetler (boş alan, örnek metin, taşma, çok madde, uzun başlık, konuşmacı notu).

- Kurulum `ciu-design` ile aynıdır (`ciu-slides.zip` ya da `ciu-skills` seti). Node.js ve Python 3 gerekir; python-pptx claude.ai'de hazırdır, yerelde skill 1.0.2 sürümünü kendisi kurar.
- Ağ: `share.ciu.edu.tr` (şablon) ve yerelde ilk kurulumda `pypi.org`. claude.ai'de ağ kısıtlıysa yöneticiden `share.ciu.edu.tr` için izin istenir; indirme olmazsa son kopya ya da kullanıcının yüklediği şablon kullanılır.
- TLS: sunucu ara sertifikayı göndermediği için GlobalSign GCC R46 OV TLS CA 2025 genel sertifikası skill'e gömülüdür (`skills/ciu-slides/globalsign-gcc-r46-ov-tls-ca-2025.pem`) ve sistem kökleriyle birlikte kullanılır; doğrulama hiçbir zaman kapatılmaz. Sertifika 2029'da biter; sunucu ara sertifikasını değiştirirse yenisini bu dosyaya koy.
- Önizleme (PDF + slayt PNG'leri) için LibreOffice (`soffice`) gerekir; yoksa atlanır.
- Test: `pip install -r skills/ciu-slides/requirements.txt && python -m unittest discover -s skills/ciu-slides/scripts -p 'test_*.py'`; CI: `.github/workflows/slides.yml`. Şablon yapısı: `skills/ciu-slides/templates.md`.

## Eval'ler

`evals/` altında skill davranış testleri var (case: `prompt.md`, `scaffold.sh`, `graders/*.md`). Koşu başsız Claude Code ile yapılır, transcript'ler `/tmp/w4-runs/<koşu>/` altına yazılır ve repoya girmez:

```bash
node evals/run.mjs run ciu-design/01-etkinlik-post-tr ciu-slides/04-kullanici-sablonu --run 3 --parallel 2
node evals/run.mjs run ciu-design/01-etkinlik-post-tr --run 3 --grade-only   # yalnız yeniden notlandır
node evals/run.mjs report --run 3             # tablo; llm grader'lar için verdicts.json gerekir
```

Slides case'leri için `CIU_PYTHON` python-pptx'li bir python'u göstermeli. Son baseline (claude 2.1.286, `claude-sonnet-5-5`, 2026-10-01): 1. koşu 11/19 → düzeltmeler sonrası 2. koşu 19/19; ayrıntı ve kök nedenler `evals/results-claude-code-sonnet.md`. Grader testi: `node --test evals/run.test.mjs` (CI'da koşar; eval'ler CI'da koşmaz).

## Bakımcı için

- Test: `cd skills/ciu-design/remotion && npm ci && npm test && npm run typecheck`; scriptler: `node --test skills/ciu-design/scripts/scripts.test.mjs`
- CI: `.github/workflows/ci.yml` (test + temiz dizinde setup/render smoke + paketleme). Release: `v<sürüm>` tag'i (marketplace.json `metadata.version` ile aynı olmalı) `release.yml`'i çalıştırır, `dist/*.zip` dosyalarını GitHub Release'e ekler.
- Remotion kuralları (`remotion-dev/skills`) tek commit'e sabit: `skills/ciu-design/scripts/remotion-rules.mjs` (setup ve build aynı dosyayı kullanır). Güncellemek için SHA'yı değiştir.
- Doğrulayıcı `scripts/check.mjs`, logo seçici `scripts/logo.mjs`; kural mantığı `remotion/src/lib/rules.ts` içinde.
- Tasarım kalitesi: `brand/art-direction.md` (konsept + iskelet kataloğu), `brand/slop.md` (yapma listesi), `brand/motion.md` (video hareket kuralları). Özel kompozisyonlar `remotion/src/custom/` altında; her export otomatik kayıtlı.
- Logolar değişti: yeni dosyaları `raw/` altına koy → `python3 tools/make_logos.py`
- claude.ai paketleri: `node tools/build.mjs` → her skill için `dist/<skill>.zip`
- Sürüm: `.claude-plugin/marketplace.json` → `metadata.version`'ı artır (Claude Code güncellemeleri); `npx skills update` doğrudan repodan çeker.
- Yeni skill eklemek: `skills/<ad>/SKILL.md` oluştur; marketplace.json'a `<ad>` girişi ekle ve `ciu-skills` girişinin `skills` dizisine `./skills/<ad>` yaz; README tablosunu güncelle. `build.mjs` ve `npx skills` yeni skill'i otomatik bulur.
- Lisans: Remotion (https://github.com/remotion-dev/remotion/blob/main/LICENSE.md). Source Sans 3 ve Poppins: SIL OFL 1.1.
