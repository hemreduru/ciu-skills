# ciu-skills

Türkçe | [English](README.md)

Uluslararası Kıbrıs Üniversitesi (UKÜ / CIU) için Agent Skills seti. Açık [Agent Skills](https://agentskills.io) standardını kullanır; Claude'da (claude.ai, Claude Code, Claude masaüstü uygulaması) ve Codex, Cursor, Gemini CLI, GitHub Copilot gibi uyumlu ajanlarda çalışır.

Skill'ler yazılımcılar için değil, üniversitenin tasarımcıları ve personeli için hazırlandı: ne istediğinizi sade bir dille anlatırsınız, skill de sizin dilinizde (genellikle Türkçe) yanıt verir.

| Skill | Ne yapar | Örnek istek |
|---|---|---|
| [`ciu-design`](skills/ciu-design/SKILL.md) | Kurumsal kimliğe uygun görsel ve video: Instagram/Facebook/LinkedIn postları, story, Reels, banner, hareketli grafik ve kendi video klipleriniz için markalı sürümler (intro/outro, logo, isim bandı, altyazı). | `UKÜ için bu fotoğrafla bir duyuru postu yap` |
| [`ciu-slides`](skills/ciu-slides/SKILL.md) | UKÜ'nün resmi sunum şablonuyla ya da kendi şablonunuzla PowerPoint (`.pptx`) sunumu. | `UKÜ şablonuyla fakülte tanıtım sunumu hazırla` |

Güncel sürüm: **0.3.0** ([sürüm sayfası](https://github.com/hemreduru/ciu-skills/releases/tag/v0.3.0)).

## Hızlı başlangıç

1. [Sürüm sayfasından](https://github.com/hemreduru/ciu-skills/releases/tag/v0.3.0) `ciu-design.zip` ve/veya `ciu-slides.zip` dosyasını indirin.
2. claude.ai'de [Customize → Skills](https://claude.ai/customize/skills) sayfasını açıp zip dosyasını yükleyin. **Code execution and file creation** (kod çalıştırma ve dosya oluşturma) seçeneğinin açık olduğundan emin olun.
3. Yeni bir sohbette şunu yazın: `UKÜ için bu fotoğrafla bir duyuru postu yap` (fotoğrafı ekleyin).

İlk çalıştırmada skill gerekli paketleri kurar ve bu 1–3 dakika sürer; sonraki sohbetler hızlıdır.

## Kurulum

### claude.ai (web ve masaüstü sohbet)

1. **Code execution and file creation** seçeneğini açın (Settings → Capabilities).
2. [Customize → Skills](https://claude.ai/customize/skills) sayfasında skill yüklemeyi seçip zip dosyasını gösterin: [sürüm sayfasındaki](https://github.com/hemreduru/ciu-skills/releases/tag/v0.3.0) `ciu-design.zip` veya `ciu-slides.zip`. Zip'leri kendiniz üretmek için [Bakımcılar](#katkı-ve-bakımcılar) bölümüne bakın.
3. Yeni bir sohbet açıp ihtiyacınızı anlatın.

Team ve Enterprise planlarında yönetici skill'i herkese açabilir; bu durumda 2. adım gerekmez.

Claude Code'a aynı hesapla giriş yaparsanız claude.ai skill'leriniz oraya da senkronlanır (`/skills` → "claude.ai sync").

### Claude Code ve Claude masaüstü uygulaması (Code sekmesi)

Masaüstü uygulamasında bir klasör seçin (ör. `Belgeler/CIU-Tasarim`), Code sekmesinde açın ve şunları yapın:

1. Customize → Plugins → **Add marketplace** → `hemreduru/ciu-skills`.
2. `ciu-design` (yalnızca tasarım), `ciu-slides` (yalnızca sunum) ya da `ciu-skills` (ikisi birden) eklentisini kurun. Marketplace ayarlarında **otomatik güncelleme**yi açın.
3. Fotoğraf ve videoları klasördeki `girdiler/` içine koyun; çıktılar `ciktilar/` klasörüne gelir.

Claude Code komut satırında karşılığı şudur:

```text
/plugin marketplace add hemreduru/ciu-skills
/plugin install ciu-skills@ciu-skills
```

### Diğer ajanlar (Codex, Cursor, Gemini CLI, Copilot, …)

Node.js gerekir. Kurulu ajanlar otomatik algılanır:

```bash
npx skills add hemreduru/ciu-skills                      # setten seçerek kur
npx skills add hemreduru/ciu-skills --skill ciu-design   # yalnızca bir skill
npx skills add hemreduru/ciu-skills --all                # hepsi, tüm ajanlara
npx skills update                                        # güncelle
```

`ciu-design` için ajanın komut çalıştırabilmesi ve görsel okuyabilmesi gerekir.

## Güncelleme

| Nereye kurdunuz | Nasıl güncellenir |
|---|---|
| claude.ai | Yerinde güncelleme yoktur. [Customize → Skills](https://claude.ai/customize/skills) sayfasında eski skill'i silin, [son sürümden](https://github.com/hemreduru/ciu-skills/releases) yeni zip'i yükleyin, sonra **yeni bir sohbette** deneyin. |
| Claude Code / masaüstü uygulaması | Marketplace'te otomatik güncelleme açıksa yapacak bir şey yok. Değilse marketplace'i yenileyip eklentiyi Customize → Plugins'ten güncelleyin. Güncellemeler, `.claude-plugin/marketplace.json` içindeki `metadata.version` artınca yayımlanır. |
| Diğer ajanlar | `npx skills update` |

## Gereksinimler ve ağ

- **Node.js 22.18 veya üstü** ([nodejs.org](https://nodejs.org), LTS). claude.ai'nin kod çalıştırma ortamında hazır gelir.
- `ciu-slides` için **Python 3**. python-pptx claude.ai'de hazırdır; yerelde skill 1.0.2 sürümünü kendisi kurar.
- **Ağ erişimi.** `ciu-design` ilk çalıştırmada Remotion paketlerini ve bir tarayıcıyı indirir (1–3 dakika). Remotion'ı ayrıca kurmanız gerekmez.
- **claude.ai:** *Code execution and file creation* açık olmalı. Ağ kısıtlıysa yöneticiniz kod çalıştırma ağ izinlerinde şu adreslere izin vermelidir:
  - `ciu-design`: `registry.npmjs.org`, `remotion.media`, `storage.googleapis.com`
  - `ciu-slides`: `share.ciu.edu.tr` (şablon indirme)
- **LibreOffice** (`soffice`) isteğe bağlıdır; `ciu-slides` slayt önizlemesi (PDF + PNG) için kullanır, yoksa önizlemeyi atlar.

## ciu-design

Resmi kurumsal kimlik kılavuzuna ve UKÜ'nün sosyal medya diline uygun görsel ve video üretir.

- **Post**: istediğiniz boyutlarda post, story, banner ve carousel gibi durağan görseller. Varsayılan olarak seçmeniz için farklı yerleşimli iki varyant sunulur.
- **Motion**: fotoğraflardan Reels ve animasyon; isteğe bağlı olarak hazır paketteki ya da kendi müziğinizle.
- **Branded**: kendi video klibinize intro ve outro kartı, logo, isim bandı ve altyazı ekler. Altyazı, verdiğiniz SRT/metinden gelir ya da siz isterseniz konuşmadan çıkarılır.
- Girdi olarak bir istek ile isteğe bağlı fotoğraf, klip, font, müzik, `ciu.edu.tr` haber/etkinlik bağlantısı ya da **toplu üretim** için CSV/Excel listesi (satır başına bir görsel) alır.
- Her teslimatla birlikte `paylasim.md` gelir: Türkçe ve İngilizce açıklamalar, hashtag'ler, alternatif metinler ve paylaşım saati önerisi.
- Biriminizi, sık kullandığınız boyutları ve post serilerinizi `ciu-hafiza.md` dosyasında hatırlar; örneğin "haftalık etkinlik serisi, 5. sayı".
- Logoyu yeniden renklendirme, çerçeveleme, esnetme ya da yazısını değiştirme isteklerini nedenini söyleyerek reddeder. Palet dışı renk ve marka dışı font için bir kez uyarır, sonra yapar.
- Her şey Remotion ile üretilir; başka görsel araçlarla çizim yapılmaz.

Marka ve sanat yönetimi kuralları [`skills/ciu-design/brand/`](skills/ciu-design/brand) altındadır.

## ciu-slides

UKÜ'nün resmi sunum şablonuyla ([ciu.edu.tr/tr/uku-sablonu](https://ciu.edu.tr/tr/uku-sablonu)) marka uyumlu `.pptx` hazırlar. Konu, taslak ya da belge verebilirsiniz.

- Slaytları planlar (slayt başına tek fikir, kısa başlık ve maddeler, konuşmacı notları), sonra sunumu şablondan üretir.
- Şablonu **her çalıştırmada güncel haliyle indirir**. Üç resmi şablondan (resmi, tanıtım, akademik) birini seçer ya da kendi `.pptx` dosyanızı olduğu gibi kullanır.
- Logo, renk ve fontlar şablondan gelir; hiçbir zaman değiştirilmez.
- Teslimden önce denetler: boş kutu, kalan örnek metin, taşma, çok madde, uzun başlık, eksik konuşmacı notu.
- Sıralama, akreditasyon ya da istatistik uydurmaz; yalnızca sizin verdiğiniz bilgiyi kullanır.
- Şablon yapısı: [`skills/ciu-slides/templates.md`](skills/ciu-slides/templates.md).

Ağ notları:

- Şablon `share.ciu.edu.tr` adresinden iner; yerelde ilk kurulum ayrıca `pypi.org` gerektirir. Yöneticiden izin istenecekse `share.ciu.edu.tr` yeterlidir. İndirme olmazsa son kopya ya da sizin yüklediğiniz şablon kullanılır.
- TLS: sunucu ara sertifikayı göndermediği için GlobalSign GCC R46 OV TLS CA 2025 genel sertifikası skill'e gömülüdür ([`globalsign-gcc-r46-ov-tls-ca-2025.pem`](skills/ciu-slides/globalsign-gcc-r46-ov-tls-ca-2025.pem)) ve sistem kökleriyle birlikte kullanılır. Doğrulama hiçbir zaman kapatılmaz. Sertifika 2029'da biter; sunucu ara sertifikasını değiştirirse yenisini bu dosyaya koyun.
- Test: `pip install -r skills/ciu-slides/requirements.txt && python -m unittest discover -s skills/ciu-slides/scripts -p 'test_*.py'`. CI: [`.github/workflows/slides.yml`](.github/workflows/slides.yml).

## Eval'ler

`evals/` altında skill davranış testleri bulunur. Her case'te `prompt.md`, `scaffold.sh` ve `graders/*.md` vardır. Koşular başsız Claude Code ile yapılır; transcript'ler `/tmp/w4-runs/<koşu>/` altına yazılır ve repoya girmez.

```bash
node evals/run.mjs run ciu-design/01-etkinlik-post-tr ciu-slides/04-kullanici-sablonu --run 3 --parallel 2
node evals/run.mjs run ciu-design/01-etkinlik-post-tr --run 3 --grade-only   # yalnız yeniden notlandır
node evals/run.mjs report --run 3             # tablo; llm grader'lar için verdicts.json gerekir
```

Slides case'leri için `CIU_PYTHON` python-pptx'li bir Python'u göstermelidir. Son baseline (claude 2.1.286, `claude-sonnet-5-5`, 2026-10-01): 1. koşu 11/19; düzeltmelerden sonra 2. koşu 19/19. Ayrıntılar ve kök nedenler: [`evals/results-claude-code-sonnet.md`](evals/results-claude-code-sonnet.md). Grader testi: `node --test evals/run.test.mjs` (CI'da koşar; eval'lerin kendisi CI'da koşmaz).

## Katkı ve bakımcılar

- Test: `cd skills/ciu-design/remotion && npm ci && npm test && npm run typecheck`. Scriptler: `node --test skills/ciu-design/scripts/scripts.test.mjs`.
- CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (test, temiz dizinde setup ve render smoke testi, paketleme). Release: `v<sürüm>` tag'i (`.claude-plugin/marketplace.json` içindeki `metadata.version` ile aynı olmalı) [`release.yml`](.github/workflows/release.yml)'i çalıştırır ve `dist/*.zip` dosyalarını GitHub Release'e ekler.
- Remotion kuralları (`remotion-dev/skills`) `skills/ciu-design/scripts/remotion-rules.mjs` içinde tek commit'e sabitlenmiştir (setup ve build aynı dosyayı kullanır). Güncellemek için SHA'yı değiştirin.
- Doğrulayıcı `scripts/check.mjs`, logo seçici `scripts/logo.mjs` dosyasıdır (ikisi de `skills/ciu-design/` altında); kural mantığı `remotion/src/lib/rules.ts` içindedir.
- Tasarım kalitesi: [`brand/art-direction.md`](skills/ciu-design/brand/art-direction.md) (konsept ve iskelet kataloğu), [`brand/slop.md`](skills/ciu-design/brand/slop.md) (yapma listesi), [`brand/motion.md`](skills/ciu-design/brand/motion.md) (video hareket kuralları). Özel kompozisyonlar `remotion/src/custom/` altındadır; her export otomatik kaydedilir.
- Logolar değiştiyse: yeni dosyaları `raw/` altına koyun, sonra `python3 tools/make_logos.py` çalıştırın.
- claude.ai paketleri: `node tools/build.mjs` her skill için `dist/<skill>.zip` üretir.
- Sürümleme: Claude Code'a güncelleme yayımlamak için `.claude-plugin/marketplace.json` içindeki `metadata.version` değerini artırın. `npx skills update` doğrudan repodan çeker.
- Yeni skill eklemek: `skills/<ad>/SKILL.md` oluşturun, `marketplace.json`'a `<ad>` girişini ekleyin, `ciu-skills` girişinin `skills` dizisine `./skills/<ad>` yazın ve iki README'deki tabloyu güncelleyin. `build.mjs` ve `npx skills` yeni skill'i otomatik bulur.
- Tasarım notları: `ciu-design` için [spec](docs/superpowers/specs/2026-10-01-ciu-design.md) ve [plan](docs/superpowers/plans/2026-10-01-ciu-design.md).

## Lisans

Repoda kendi lisans dosyası yoktur. Üçüncü taraf bileşenler: [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) (kendi lisansı) ile Source Sans 3 ve Poppins fontları ([SIL OFL 1.1](skills/ciu-design/remotion/public/brand/fonts/OFL.txt)).
