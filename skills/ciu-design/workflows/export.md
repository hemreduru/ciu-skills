# Katmanlı Export (`export.mjs`) — PSD ve AI

Tasarım bitip `final.png` teslim edildikten sonra kullanıcıya Photoshop (PSD) veya Illustrator (AI) düzenlenebilir çıktıları sunulur.

## Komutlar

```bash
# PSD (Photoshop katmanlı dosya)
node <skill>/scripts/export.mjs psd <D>/design.json --id <Id> --work $WORK --out $D

# AI (Illustrator için düzenlenebilir metin ve vektör şekiller)
node <skill>/scripts/export.mjs ai <D>/design.json --id <Id> --work $WORK --out $D

# İkisi birden (PSD + AI)
node <skill>/scripts/export.mjs both <D>/design.json --id <Id> --work $WORK --out $D
```

## Format Özellikleri

1. **PSD (`final.psd`):**
   - Her obje ayrı, adlandırılmış şeffaf bir katmandır (`arka-plan`, `foto`, `panel`, `logo`, `baslik`, `metin`).
   - Katman sırası = çizim sırası (en altta arka plan).
   - Photoshop'ta açıldığında her katman bağımsız taşınabilir ve düzenlenebilir.
   - Dosya içinde tam çözünürlüklü birleşik kompozit önizleme gömülüdür.
   - Kompozisyonda `<Layer>` bulunmazsa tek katmanlı PSD üretilir ve `UYARI` verilir.

2. **Illustrator AI (`final.ai`):**
   - Illustrator'ın "PDF uyumlu dosya" biçimidir; Illustrator doğrudan açar.
   - Metinler gerçek metin olarak yer alır; seçilebilir ve düzenlenebilirdir.
   - Marka fontları (Poppins başlık, Source Sans 3 gövde) gerçek font olarak (Type3 değil) ve Türkçe karakter eşlemeleri (ToUnicode CMap: İ, ı, ğ, ş, ç, ö, ü) dosyaya gömülüdür; Illustrator'da canlı metin olarak açılır.
   - Sayfa boyutu tasarım px boyutuyla aynı orandadır (sıfır kenar boşluğu, arka plan baskılı).

## Notlar ve Kısıtlar
- **Logolar:** Repodaki logolar PNG raster formatındadır ve PSD/AI içine raster olarak gömülür (tam vektör logo için SVG/AI asılları gerekir).
- **Carousel:** Her slayt için (`design-1.json`, `design-2.json`, ...) `export.mjs` ayrı ayrı çalıştırılarak her slaytın katmanlı dosyası üretilir.
- **Videolar:** Katmanlı export yalnızca still (hareketsiz) tasarımlar içindir; videolarda sunulmaz.
