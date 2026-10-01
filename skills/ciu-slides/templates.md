# UKÜ sunum şablonları — analiz

Kaynak: https://ciu.edu.tr/tr/uku-sablonu (zip içinde `SUNUM-ŞABLONU/Sunum Template 1|2|3.pptx`; setup bunları `sablon-1|2|3.pptx` olarak önbelleğe alır). Çözümleme 2026-10-01 tarihli indirmeden; makine tarafından okunan karşılığı `scripts/templates.json`.

## Önemli bulgu
- Üç dosyada da **tek master ve 11 standart Office düzeni** (Title Slide, Title and Content, Section Header, Two Content, Comparison, Title Only, Blank, Content with Caption, Picture with Caption, 2 dikey metin düzeni) var. Düzenler markalı değil: placeholder'lar standart 16:9 (12192000×6858000 EMU) konumlarında, tema Office (Calibri Light/Calibri, mavi vurgular).
- **Marka, slaytların arka plan görsellerinde:** her dosyada 3 örnek slayt var, hepsi `Title Slide` düzeninde, tam sayfa 8000×4500 JPEG arka plan + serbest metin kutusu (`Myriad Pro`). Logo, THE sıralama rozeti ve sosyal medya satırı bu görsellerin içinde.
- Bu yüzden skill, örnek slaytların **arka planını** kopyalar (kapak / içerik / kapanış), standart düzenlerin placeholder'larını kullanır, konumlarını arka plandaki logo ve rozetlerden kaçacak şekilde ayarlar ve örnek slaytları siler.
- Örnek metinler: `PRESENTATION TITLE` (45 pt, ortalı), `TEXT ` (18 pt), `THANK YOU` (45 pt). Denetleyici bunları ve Office'in "Click to add…" gibi öntanımlı metinlerini yakalar.
- Font: `Myriad Pro` (şablondaki metin kutularında açıkça yazılı; Adobe lisanslı, çoğu bilgisayarda yok — yoksa PowerPoint/LibreOffice yedek font gösterir, ölçüm yine de Myriad'a göre yapılır). Renkler: arka plan görsellerinden gelen turuncu `#FE5000` ve bordo `#862633` şeridi; metin `#231F20` (mürekkep) ya da koyu zeminde beyaz; başlıklar bordo. Renk değerleri ciu-design `brand.md` ile aynı.

## Hangi şablon hangi iş için
| Şablon | Görünüm | Ne zaman |
|---|---|---|
| 1 | Beyaz zemin, solda turuncu→bordo dikey şerit; sol üstte logo, sağ altta THE rozeti | Resmi / kurumsal: yönetim sunumları, raporlar, toplantılar, idari sunumlar. En sade; en çok metin taşır. |
| 2 | Kapak ve kapanış: koyulaştırılmış kampüs binası fotoğrafı, beyaz yazı. İçerik: beyaz zemin, yalnız logo ve rozet | Tanıtım ve etkinlik: aday öğrenci tanıtımı, fakülte/birim tanıtımı, konferans ve etkinlik açılışları. |
| 3 | Kapak ve kapanış: kampüs kuş bakışı render'ı, ortada yarı saydam beyaz çerçeve (yazı çerçevenin içinde). İçerik: beyaz zemin, logo sol altta | Akademik / bilgilendirme: ders ve seminer sunumları, bilimsel sunumlar, araştırma tanıtımı. İçerik sayfasında üst kısım tamamen boş (daha çok yer). |

Şablon 1'in kapanış arka planı ile 2 ve 3'ün kapanış arka planı sağ üstte `@ciuofficial` sosyal medya satırı ve `www.ciu.edu.tr` içerir; kapanış slaytına ayrıca iletişim bilgisi yazmak çoğu zaman gerekmez.

## Skill'in kullandığı düzenler (rol → düzen)
Deck JSON'daki `layout` değeri bir rol seçer. Alt satırlar placeholder idx'leridir (standart Office düzeninden).

| Rol | Standart düzen | Placeholder idx | Arka plan (örnek slayt) | İş |
|---|---|---|---|---|
| `title` | Title Slide | 0 başlık (ctrTitle), 1 alt başlık | kapak (0) | Açılış: başlık + sunucu/birim/tarih |
| `section` | Section Header | 0 başlık, 1 alt başlık | kapak (0) | Bölüm geçişi; sola hizalı |
| `content` | Title and Content | 0 başlık, 1 madde listesi | içerik (1) | Tek fikir + en çok 6 madde |
| `two` | Two Content | 0 başlık, 1 sol, 2 sağ | içerik (1) | İki sütun liste |
| `comparison` | Comparison | 0 başlık, 1 sol başlık, 2 sol liste, 3 sağ başlık, 4 sağ liste | içerik (1) | Karşılaştırma |
| `picture` | Title and Content (gövde daraltılır, görsel sağa konur) | 0 başlık, 1 madde listesi (+ eklenen görsel) | içerik (1) | Görsel + kısa açıklama |
| `title_only` | Title Only | 0 başlık (+ isteğe bağlı görsel) | içerik (1) | Tam genişlik görsel ya da grafik |
| `closing` | Title Slide | 0 başlık, 1 alt başlık | kapanış (2) | Teşekkür / iletişim |

Kullanılmayan standart düzenler: Blank, Content with Caption, Picture with Caption (kullanıcının kendi şablonunda `picture` rolü için bu düzen aranır), dikey metin düzenleri. Date / Footer / Slide Number placeholder'ları (idx 10, 11, 12) slayta eklenmez.

## Yazı alanları (slayt genişlik/yüksekliğinin oranı)
| Şablon | İçerik güvenli alanı (x0, y0, x1, y1) | Kapak/kapanış yazı alanı |
|---|---|---|
| 1 | 0.09, 0.20, 0.91, 0.78 | 0.12, 0.30, 0.88, 0.72 |
| 2 | 0.09, 0.20, 0.91, 0.78 | 0.12, 0.30, 0.88, 0.72 (beyaz yazı) |
| 3 | 0.09, 0.08, 0.91, 0.84 | 0.17, 0.29, 0.83, 0.67 (çerçeve içi) |
Üstte logo (ve kapanışta sosyal satır), sağ altta THE rozeti, 1'de solda şerit, 3'te içerik sayfasında altta logo+rozet bulunur; metin bu bölgelere girmez.

## Kullanıcının kendi şablonu
`"template": "<dosya.pptx>"` verilirse o dosya olduğu gibi kullanılır: düzenler adıyla aranır (`Title Slide`, `Title and Content`, …; `picture` için `Picture with Caption`), placeholder konumları, font ve renkler şablondan gelir, skill hiçbir stil dayatmaz. Şablonun örnek slaytları yine silinir.
