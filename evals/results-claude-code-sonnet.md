# Eval sonuçları — Claude Code + Sonnet

- Tarih: 2026-10-01
- Claude Code sürümü: 2.1.286
- Model: `claude-sonnet-5-5`
- Eklenti sürümü: 0.2.0
- Koşu: `node evals/run.mjs run <id'ler> --run N --parallel 2` (başsız `claude -p`, en fazla 2 paralel). llm grader'lar transcript okunarak/çıktı görselleri açılarak elle (tek cümle gerekçeyle) verildi; transcript'ler repoda tutulmuyor (`/tmp/w4-runs`).

## Toplam skor

| Aşama | Geçen / 19 |
|---|---|
| 1. koşu, orijinal grader'larla | 7 |
| 1. koşu, düzeltilmiş grader'larla (aynı transcript'ler yeniden notlandı) | 11 |
| 2. koşu (grader + skill düzeltmeleri sonrası; 12 case yeniden koşuldu, 7 case 1. koşudan taşındı) | **19** |

Taşınan 7 case (07, 11, 12, 13, slides 01–03) 1. koşuda geçmişti; SKILL.md değişikliklerinden sonra yeniden koşulmadı, yani bu 7 case yeniden doğrulanmadı.

## Tablo

"1. koşu" sütunu düzeltilmiş grader'larla yeniden notlandırılmış halidir; orijinal (katı) grader'lardaki hali notta.

| case | 1. koşu → 2. koşu | grader özetleri (2. koşu) | süre (2. koşu) | not |
|---|---|---|---|---|
| ciu-design/01-etkinlik-post-tr | kaldı → geçti | 14/14; tek `final.png`, 15.10.2026 14:00 doğru | 151 sn | 1. koşuda `final-a.png`; SKILL §7 düzeltildi |
| ciu-design/02-etkinlik-story-en | kaldı → geçti | 11/11; tarih tek satırda | 133 sn | 1. koşuda tarih bölünmüştü; §4 kuralı |
| ciu-design/03-haber-link-instagram | kaldı → geçti | 10/10; paylasim.md'de TR+EN caption, 7 hashtag | 156 sn | `caption-hashtags` artık paylasim.md dosyasına bakıyor, `reply-caption` ölçütü paylasim.md'ye göre güncellendi |
| ciu-design/04-fakulte-kare-duyuru | geçti → geçti | 11/11; tek fakülte logosu | 145 sn | orijinal grader'da logo id ve negate hatası vardı |
| ciu-design/05-reels-uc-fotograf | geçti → geçti | 10/10 | 352 sn | orijinal grader özel composition adlarında kalıyordu |
| ciu-design/06-video-intro-outro-isim-bandi | geçti → geçti | 13/13 | 206 sn | ara koşuda model `ls` çıktısını yanlış okuyup klibi yok saydı (model hatası, tekrarda düzeldi) |
| ciu-design/07-logo-kirmizi-reddet | geçti (taşındı) | 3/3 | 11 sn | |
| ciu-design/08-bayram-belirsiz-istek | kaldı → geçti | 4/4; kısa brief + 3 yön + hangi bayram sorusu | 55 sn | §3 güncellendi |
| ciu-design/09-muzik-cc0-reels | geçti → geçti | 9/9; paket içi CC0 parça | 281 sn | `no-own-music-key` grader'ı design json'a bakacak şekilde düzeltildi |
| ciu-design/10-altyazi-srt-ile | kaldı → geçti | 9/9; frame-75/150/240 basıldı, SRT teslim edildi | 833 sn | §9: kullanıcı SRT'si `captions.mjs import` ile |
| ciu-design/11-paylasim-paketi | geçti (taşındı) | 8/8 | 175 sn | |
| ciu-design/12-csv-toplu-uretim | geçti (taşındı) | 7/7 | 106 sn | |
| ciu-design/13-hafiza-seri-devam | geçti (taşındı) | 7/7 | 81 sn | |
| ciu-design/14-kullanici-fontu | kaldı → geçti | 6/6; serif font görünür, tek `final.png` | 128 sn | 1. koşuda `final-a.png` |
| ciu-design/15-genc-kitle-tonu | kaldı → geçti | 6/6; kancayla başlayan caption, 07.11.2026 10:00 satırı | 158 sn | 1. koşuda tarih bölünmüştü, `final.png` yoktu |
| ciu-slides/01-tanitim-8-slayt | geçti (taşındı) | 12/12 | 87 sn | |
| ciu-slides/02-akademik-madde-listesi | geçti (taşındı) | 12/12 | 78 sn | |
| ciu-slides/03-etkinlik-en | geçti (taşındı) | 11/11 | 74 sn | |
| ciu-slides/04-kullanici-sablonu | kaldı → geçti | 12/12; skill tetiklendi, build.py + check.py OK | 56 sn | 1. koşuda skill hiç tetiklenmedi; description genişletildi |

## Kök nedenler ve düzeltmeler

Grader tarafı (case başarısı modelden değil ölçütten kaynaklanıyordu):
- Model skill dosyalarını `Read` yerine Bash `cat` ile okuyor → `brand-read`/`style-read` `tool: Read|Bash`. Runner'da `tool` artık regex (tam eşleşme).
- Model özel Remotion composition'ı kullanıyor (`Post…`/`Motion` adları sabit değil) → composition adı eşleşmeleri `\w+`.
- Başsız modda model AskUserQuestion'a yanıt alamıyor → case prompt'larındaki `eval-final.png` dayatması kaldırıldı, görsel `**/ciktilar/*/final.png` üzerinden bakılıyor.
- 04 `faculty-logo-id` yanlış logo adı; `no-unit-logo-beside-faculty` `negate` eksikti.
- 03 `caption-hashtags` skill dosyalarındaki hashtag'lere takılıyordu, paylasim.md dosyasına bakacak şekilde düzeltildi; 09/10 grader'ları design json'a bakacak şekilde düzeltildi.

Skill tarafı (gerçek hatalar):
- `final.png` yerine `final-a/b.png` (§7: seçilen/önerilen varyant için tek `final.png`).
- Kullanıcının SRT'si elle yazılıyordu (§9: `captions.mjs import`, `altyazi.srt` teslim).
- Belirsiz istekte brief gösterilmiyordu (§3).
- Tarih/saat bölünüyordu (§4: dev rakam tarihi tekrarlayabilir ama `15.10.2026 14:00` satırının yerini almaz).
- ciu-slides kullanıcı şablonuyla tetiklenmiyordu (description).

## Açık konular

- Başsız koşuda model sorulara yanıt alamadığı için varsayımlarla ilerliyor; "soru sor, bekle" davranışı bu harness'le ölçülemiyor (08 yalnızca brief+konsept+soru metnine bakıyor).
- llm grader'lar elle notlandı; otomatik bir llm-hakem yok, bu yüzden koşular arası karşılaştırma öznel kalabilir.
- Case 06'daki model hatası (`head` ile kesilmiş çıktıyı yanlış okuma) skill'den değil modelden kaynaklı; tekrarlanırsa SKILL'e "klibi `ls` yerine ffprobe ile doğrula" eklenebilir.
- Her case tek koşu: modelin kararsızlığı (flake) için tekrar sayısı yok.
- Eval'ler CI'da koşmaz (yalnızca grader testi `evals/run.test.mjs` koşar).

## Tarz sorusu ve Sıra dışı mod (vaka 16–21, 3. koşu)

Claude Code + Sonnet 5.5, vaka başına tek koşu, ön planda sırayla koşuldu (`/tmp/w4-runs/3`). Mekanik grader'lar `run.mjs` ile, llm grader'lar transcript son mesajı ve `final.png`/önizlemeler gözle bakılarak notlandı.

| case | mekanik | llm (elle) | süre | not |
|---|---|---|---|---|
| ciu-design/16-tarz-sorusu-soruluyor | 4/4 | geçti | 19 sn | Brif + tek soru; Canlı (Önerilen) ilk, ardından Sıra dışı ve Kurumsal; render yok; "direkt yap" ipucu verildi |
| ciu-design/17-tarz-taziye-sorulmaz | 4/4 | geçti | 84 sn | Soru yok, sade beyaz zemin, döndürme/taşma yok; sırıtan gülen fotoğrafı kullanmadı |
| ciu-design/18-tarz-istemden-cilgin | 5/5 | geçti | 117 sn | "çılgın" → Sıra dışı kolaj, soru yok; A final, B önizleme |
| ciu-design/19-tarz-hafizadan | 6/6 | geçti | 114 sn | Hafızadan Sıra dışı + seri; 3. sayı görselde, taşan dev yazı; yanıtta hafızadan kullanıldığı söyleniyor |
| ciu-design/20-direkt-yap-varsayilan-cift | 6/6 | geçti | 118 sn | A Sıra dışı (final), B Canlı; iskeletler farklı, A belirgin daha cesur |
| ciu-design/21-sira-disi-iskelet-izleri | 8/8 | sınırda geçti | 207 sn | Sol kenardan taşan dikey dev "MÜZİK" (Bleed word); tarih tek satır; logo temiz düz zeminde ama tarih/mekânla aynı koyu blokta (ölçüt "kendi bloğu" diyor) |

Toplam 6/6 geçti (21 sınırda). Render yapan 17–21'de `check.mjs` hata ya da `UYARI` vermedi (hepsinde `OK`; 16'da render olmadığı için koşmadı), yani Sıra dışı iskeletleri (taşma, döndürme) doğrulayıcıyla çakışmıyor; skill ya da prompt değişikliği gerekmedi.

Notlar:
- Vaka 21'de model `final.png`'yi açıp görsel doğrulamadığını kendisi söyledi (yalnızca önizlemeleri gördü). Yanıtındaki "K'nin ucu tuvalden taşıyor" iddiası final.png'de doğrulanmadı: K tuval içinde, taşma yalnızca sol kenardan. Logo ayrı blok yerine paylaşılan koyu blokta; skill'e "logo için ayrı temiz blok" vurgusu eklemek istenirse bu vaka tekrar koşulmalı.
- Vaka başına tek koşu; kararsızlık (flake) ölçülmedi. llm notları elle verildi.
