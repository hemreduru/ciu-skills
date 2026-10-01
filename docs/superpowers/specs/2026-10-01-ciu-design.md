# ciu-skills / ciu-design — Tasarım Spesifikasyonu

**Tarih:** 01.10.2026 · **Durum:** İncelemede · **Repo:** GitHub (public) `ciu-skills`, yerelde `~/ciu-skills`

## 1. Amaç

UKÜ (CIU) grafik tasarımcısının Claude ile kurumsal kimliğe uygun **statik görsel**, **motion graphic** ve **markalı video** üretmesini sağlayan tek bir skill. Tasarımcı prompt + fotoğraf/video/URL verir; skill UKÜ'nün kurumsal kimlik kılavuzunu ve herkese açık sosyal medya stilini bilerek tasarlar, render eder ve revize eder.

**Kullanıcı:** Teknik olmayan grafik tasarımcı. **Bakımcı:** Emre (repo, build, güncelleme).

### Kapsam dışı (v1)

- Üretken AI görsel/video (Veo, Kling, fal.ai vb.) — v2 adayı; v1 yalnızca tasarımcının kendi malzemesiyle kompozisyon yapar.
- Sabit format listesi — boyutu tasarımcı belirtir; belirtmezse skill sorar.
- Müzik kütüphanesi — lisans nedeniyle yok; ses dosyasını tasarımcı verir.
- Skill çalışırken canlı sosyal medya taraması — stil, build sırasında bir kez çıkarılır.

## 1b. Skill seti ve dağıtım modeli

`ciu-skills` bir **skill setidir** (superpowers / anthropics/skills mantığı). Agent Skills açık standardının düzenini kullanır: `skills/<ad>/SKILL.md`.

- **Claude Code:** `.claude-plugin/marketplace.json` → `ciu-skills` girişi setin tamamını, `ciu-design` girişi yalnızca o skill'i kurar (`strict: false` + `skills` dizisi).
- **Diğer ajanlar (Codex, Cursor, Gemini CLI, Copilot, Windsurf, OpenCode, …):** `npx skills add <owner>/ciu-skills` (seçerek), `--skill ciu-design` (tek), `--all` (hepsi), `npx skills update`.
- **claude.ai:** skill başına zip (`dist/<ad>.zip`).
- v1'de yalnızca `ciu-design` var. `ciu-coding`, `ciu-accounting` vb. ileride aynı kalıpla eklenir; şimdi eklenmez.
- Teknik adlar `ciu-` önekli (skill adlarında "ü" kullanılamaz); kurumsal metinlerde "UKÜ" aynen kalır.
- Sınır: hedef, dosya tabanlı skill destekleyen ajanlar + claude.ai. ChatGPT/Gemini web sohbetleri v1 hedefi değil. `ciu-design` ajanın shell + Node + görsel okuma yeteneğine ihtiyaç duyar.

## 2. Platformlar ve yetenekler

Aynı skill klasörü iki ortamda çalışır; skill açılışta ortamı ve yetenekleri kontrol eder, olmayan yeteneği denemez, tasarımcıya düz Türkçe açıklar.

| Yetenek | Claude Code (masaüstü Code sekmesi) | claude.ai (web/desktop chat) |
|---|---|---|
| Statik tasarım (PNG) | ✅ | ⚠️ yetenek testine bağlı |
| Motion graphic (Remotion) | ✅ | ⚠️ npm erişimi + Chromium'a bağlı |
| Yüklenen videoyu markalama | ✅ | ⚠️ yetenek testine bağlı |
| Otomatik altyazı (Whisper) | ✅ | ❌ — metin/SRT tasarımcıdan |

⚠️ satırları §8'deki yetenek testiyle kesinleşir. claude.ai'de Remotion kabul edilemez derecede yavaş/çalışmaz çıkarsa, statik işler için HTML → Chromium ekran görüntüsü yedek yolu eklenir; çıkmazsa eklenmez.

## 3. Mimari kararı

**Seçilen: A — Marka skill'i + resmi Remotion kurallarına bağımlılık** (skill setinin ilk üyesi).

- `ciu-design` yalnızca UKÜ'ye özgü bilgiyi taşır: marka kuralları, stil rehberi, asset'ler, markaya ayarlı Remotion projesi.
- Remotion kod yazım bilgisini resmi [remotion-dev/skills](https://github.com/remotion-dev/skills) sağlar; build sırasında `vendor/remotion/` altına kopyalanır (tasarımcı ikinci skill kurmaz).
- Statik görsel (`renderStill`), motion ve video markalama (`<OffthreadVideo>` + overlay) **tek motordan** çıkar; ayrı ffmpeg/Playwright hattı yoktur.

Reddedilen: B (her şey tek skill'de, Remotion bilgisi eskir), C (dört ayrı skill, kurulum/koordinasyon zahmeti).

**Lisans:** Remotion; bireyler, ≤3 çalışanlı şirketler ve kâr amacı gütmeyen kurumlar için ücretsiz. UKÜ'nün statüsü idari tarafça teyit edilmeli; değilse Company License alınır. `remotion-dev/skills` lisansı vendor etmeden önce kontrol edilir.

## 4. Kurulum ve dağıtım

Tek kaynak klasör (`skills/ciu-design/`), üç kurulum yolu (§1b):

1. **claude.ai — `dist/ciu-design.zip`:** `build` komutu vendor edilmiş Remotion kurallarıyla skill başına zip üretir.
   - Team/Enterprise plan varsa admin organizasyon geneline açar → tasarımcı hiçbir şey yapmaz.
   - Yoksa: Ayarlar → Yetenekler → Skill yükle → zip (tek adım).
2. **Claude Code — plugin marketplace:** GitHub reposu marketplace olarak eklenir; `ciu-design` ya da `ciu-skills` (set) kurulur; otomatik güncelleme marketplace ayarından açılır. İlk kurulum bakımcı tarafından tasarımcının makinesinde yapılabilir.
3. **Diğer ajanlar — `npx skills add <owner>/ciu-skills`.**

**İlk çalıştırma kontrolü (`scripts/check-env`):** Ortam (claude.ai / Code), Node sürümü, Remotion bağımlılıkları. Eksikse kurar ya da tasarımcıya tıklanacak adımı söyler. Code'da Remotion paketleri bir kez kurulup önbellekte tutulur.

**Güncelleme:** Bakımcı repoyu günceller → Code otomatik alır; claude.ai'ye yeni zip yüklenir.

## 5. Klasör yapısı

```
ciu-skills/
├── .claude-plugin/marketplace.json   # ciu-skills (set) + ciu-design (tek) girişleri
├── tools/                            # probe, make_logos, build
└── skills/
    └── ciu-design/       # (aşağısı bu klasörün içi; plan §"Spec'ten sapmalar"a bakınız)

ciu-design/
├── SKILL.md              # akış + kurallar; TR/EN tetikleyiciler
├── brand/
│   ├── brand.md          # kılavuz: logo varyantları + kullanım yeri, renkler, font, yanlış kullanımlar
│   ├── style.md          # sosyal medyadan çıkarılan stil: kompozisyon, tipografi hiyerarşisi, ton (TR/EN)
│   └── references/       # 15–25 seçilmiş örnek tasarım (sıkıştırılmış)
├── assets/
│   ├── logos/            # 8 varyant × renkli / beyaz / siyah (K:100) / gri (K:45)
│   ├── units/            # fakülte, yüksekokul, araştırma merkezi, kulüp logoları
│   └── fonts/            # yalnızca açık lisanslı (OFL) fontlar
├── remotion/
│   ├── package.json
│   └── src/
│       ├── brand.ts      # renk/font/boşluk token'ları — tek kaynak
│       ├── components/   # Logo, LowerThird, Intro, Outro, Captions, PhotoFrame
│       └── Root.tsx      # Still + Video kompozisyonları, boyut parametrik
├── vendor/remotion/      # resmi Remotion kuralları (build ile çekilir)
├── scripts/              # check-env, render, build
└── docs/
```

### Kaynaklar (build sırasında bir kez toplanır)

| Kaynak | İçerik |
|---|---|
| [Kurumsal kimlik kılavuzu](https://ciu.edu.tr/tr/hakkimizda/kurumsal-kimlik-kilavuzu) + [PDF](https://ciu.edu.tr/sites/default/files/2025-02/uku-kurumsal-kimlik-kilavuzu-TR.pdf) | Logo varyantları, renkler, font, yanlış kullanımlar |
| [UKÜ logoları](https://ciu.edu.tr/tr/uku-logolari) | Renkli + beyaz logo paketleri |
| [Fakülte/YO logoları](https://ciu.edu.tr/tr/uku-fakulte-ve-yuksekokul-logolari), [Araştırma merkezi](https://ciu.edu.tr/tr/uku-arastirma-merkezi-logolari), [Kulüp](https://ciu.edu.tr/tr/hakkimizda/kurumsal-kimlik-kilavuzu/kulup-logolari) | Birim logoları |
| [Şablonlar](https://ciu.edu.tr/tr/uku-sablonu) | Sunum + Zoom arka planı (stil referansı) |
| Instagram, Facebook, LinkedIn (herkese açık) | Stil analizi + `references/` |

Giriş duvarına takılan platformlar (özellikle LinkedIn) için bakımcıdan ekran görüntüsü istenir.

### Kılavuzdan bilinenler (PDF'ten)

- 8 logo varyantı (TR/EN üstte, yatay/dikey, sloganlı 7–8). Logotype: Myriad Pro Regular, büyük harf, CMYK K:100.
- Gri skala K:45; siyah zemin üzerine beyaz kullanım; özel kullanım ek yazısı Myriad Pro Italic, K:55.
- Yanlış kullanımlar: bütünlük bozulmaz, esnetilmez/sıkıştırılmaz, farklı font yok, isim kısaltılmaz, bold yok, kontür yok, renk değişmez, siyah-beyazda gri skalaya çevrilmez, özel alanlar dışında yazı eklenmez.
- Amblem renkleri (kılavuz s.11): Pantone Orange 021 C (CMYK 0/83/100/0, `#FE5000`), Pantone 202 C (29/94/67/33, `#862633`), Pantone 187 C (22/100/89/15, `#A6192E`); logotype K:100 (`#231F20`), gri K:45 (`#9D9FA2`). HEX = Pantone resmi sRGB karşılıkları.

### Önemli kararlar

- **Logo kuralları kodla uygulanır:** `<Logo>` yalnızca orijinal dosyayı kullanır; esnetme, renk/kontür, minimum boyut altı mümkün değildir.
- **Font:** Myriad Pro (Adobe lisanslı) zip'e konmaz; gövde metni için **Source Sans 3** (OFL). Başlık fontu stil analizinden sonra kesinleşir. Logotype logo dosyasının içinde olduğundan logo etkilenmez.
- **Birim logoları:** Hepsi zip'te, kayıpsız sıkıştırılmış; claude.ai zip limiti aşılırsa kulüp logoları ihtiyaç anında siteden çekilir.
- **`brand.ts` tek kaynak:** Statik ve video aynı token'ları ve bileşenleri kullanır.

## 6. İstek akışı

1. **Giriş:** prompt (zorunlu) + fotoğraf(lar) / video klip / ciu.edu.tr linki. Mod seçimi: statik, motion, video markalama.
2. **Brief adımı (düşünme):** Amaç, kitle, platform, malzeme analiz edilir; yüklenen fotoğrafa bakılır (çözünürlük, yüzler, odak noktası). Şu durumlarda kısa brief + en fazla 3 öneri/talep sunulur:
   - Malzeme yetersiz (düşük çözünürlük, eksik konuşmacı fotoğrafı vb.)
   - İstek belirsiz → 2–3 konsept yönü (fikir + metin + yerleşim)
   - Değer katacak ek (EN versiyon, carousel, Instagram açıklama metni + hashtag, alt metin)
   - Tasarımcı talep ederse ("ne önerirsin", "fikir ver", "düşün")

   Net isteklerde sessiz kalır. Öneriler işi bloklamaz; "direkt yap" adımı atlar. Zorunlu / isteğe bağlı açıkça ayrılır.
3. **Eksikleri sorma:** Yalnızca gerçekten eksik olan (boyut, dil, metin), en fazla 1–2 soru; gerisi varsayılan.
4. **İçerik:**
   - URL verildiyse başlık, tarih, kapak fotoğrafı, özet alınır → post metni taslağı.
   - Birim adı geçerse birim logosu kılavuza uygun eklenir.
   - Metin `style.md` tonunda yazılır; tarih varsayılanı `15.10.2026 14:00` (d.m.Y H:i).
   - Türkçe büyük harf dönüşümü locale-aware (`i → İ`).
5. **Önizleme:** Statikte 2 yerleşim varyantı (küçük PNG); videoda 3 karelik storyboard (açılış/orta/kapanış). Onay sonrası tam render.
6. **Öz-eleştiri:** Model render'ı tasarımcıya göstermeden önce inceler: logo bütünlüğü, okunabilirlik/kontrast, Türkçe karakterler, platform güvenli alanı, kesilen yüzler. Sorun varsa önce düzeltir.
7. **Revizyon döngüsü:** Doğal dil istekleri → parametre/kod değişikliği → yeniden render.
   - **Sert kurallar** (logo): kod düzeyinde engelli; model nedenini söyler, alternatif önerir.
   - **Yumuşak kurallar** (stil): uyararak uygular.
8. **Çıktı:** PNG (sRGB) / MP4 (H.264, 30fps). İsteğe bağlı şeffaf logo+metin katmanı PNG. Her tasarımın `design.json` parametreleri saklanır ("aynısını EN yap", "story boyutunda yap").

**Boyut eşlemesi:** Tasarımcı "story/reels" → 1080×1920, "post" → 1080×1350 gibi kısa adlar kullanabilir; küçük bir eşleme tablosu, sabit liste değil.

**Video markalama:** 2 sn logo intro, lower third (isim/unvan), köşe logosu, outro (logo + slogan + web/sosyal adresler), altyazı (Code'da Whisper ile otomatik; claude.ai'de metin/SRT).

## 7. Hata durumları

- Ortam eksik → düz Türkçe açıklama + ne yapılmalı + bu ortamda neyin yine çalıştığı. Stack trace gösterilmez.
- Render hatası → model okur, düzeltir, en fazla 2 yeniden deneme; sonra sade açıklamayla durur.
- Desteklenmeyen video codec'i → otomatik dönüştürme.
- claude.ai'de 3 dakikadan uzun video → süre uyarısı.
- Düşük çözünürlüklü fotoğraf (kısa kenar < 1080px) → uyarı.

## 8. Uygulama sırası ve doğrulama

1. **Yetenek testi (spike):** claude.ai'ye yapıştırılan tek prompt; Chromium, ffmpeg, npm erişimi, Remotion kurulum süresi, 1 still + 3 sn MP4 render, zip boyut limiti ölçülür. Sonuç §2 tablosunu ve yedek yolları kesinleştirir.
2. **Kaynak toplama:** PDF'ten renkler, logo paketleri, birim logoları, sosyal medya stil analizi → `brand/`, `assets/`.
3. **Remotion projesi:** `brand.ts`, bileşenler, kompozisyonlar.
4. **SKILL.md:** akış, kurallar, tetikleyiciler (`skill-creator` ile description optimizasyonu).
5. **Build + paketleme:** zip + plugin marketplace.
6. **Eval (`skill-creator` döngüsü), her iki platformda:**
   1. Fotoğraf + metinle 4:5 TR etkinlik duyurusu
   2. Aynısının EN + story versiyonu
   3. ciu.edu.tr haber linkinden post
   4. Fakülte logolu duyuru
   5. 3 fotoğraftan 15 sn Reels
   6. Klipten markalı video (intro + lower third + outro)
   7. "Logoyu kırmızı yap" → nedenle reddeder + alternatif
   8. "Bayram için bir şey yap" → konsept önerir
7. **Kod testi:** Logo koruma kuralları, boyut eşlemesi, Türkçe büyük harf — tek küçük test dosyası.
8. **Kabul:** Grafik tasarımcı çıktıları onaylar; "UKÜ'ye yakışmıyor" ise bitmiş sayılmaz.

## 9. Açık konular

- UKÜ'nün Remotion ücretsiz lisans uygunluğu (kâr amacı gütmeyen statüsü) — idari teyit.
- UKÜ'nün claude.ai planı (Team/Enterprise → org geneli skill) ve ağ çıkışı ayarı — yetenek testinde görülecek.
- Başlık fontu — stil analizi sonrası.
