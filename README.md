# ciu-skills

Uluslararası Kıbrıs Üniversitesi (UKÜ / CIU) için skill seti. Agent Skills açık standardını kullanır; Claude Code, claude.ai, Codex, Cursor, Gemini CLI, GitHub Copilot ve diğer uyumlu ajanlarda çalışır.

| Skill | Ne yapar | Durum |
|---|---|---|
| `ciu-design` | Kurumsal kimliğe uygun görsel ve video | geliştiriliyor |

- Tasarım: `docs/superpowers/specs/2026-10-01-ciu-design.md`
- Plan: `docs/superpowers/plans/2026-10-01-ciu-design.md`

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

## Bakımcı için

- Test: `cd skills/ciu-design/remotion && npm test && npm run typecheck`
- Logolar değişti: yeni dosyaları `raw/` altına koy → `python3 tools/make_logos.py`
- claude.ai paketleri: `node tools/build.mjs` → her skill için `dist/<skill>.zip`
- Sürüm: `.claude-plugin/marketplace.json` → `metadata.version`'ı artır (Claude Code güncellemeleri); `npx skills update` doğrudan repodan çeker.
- Yeni skill eklemek: `skills/<ad>/SKILL.md` oluştur; marketplace.json'a `<ad>` girişi ekle ve `ciu-skills` girişinin `skills` dizisine `./skills/<ad>` yaz; README tablosunu güncelle. `build.mjs` ve `npx skills` yeni skill'i otomatik bulur.
- Lisans: Remotion (https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) — UKÜ'nün kâr amacı gütmeyen statüsü teyit edilmeli. Source Sans 3: SIL OFL 1.1.
