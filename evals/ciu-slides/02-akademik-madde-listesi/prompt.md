---
max_turns: 60
timeout_seconds: 1800
runs: 1
plugins: ["../../.."]
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, WebFetch]
---

Aşağıdaki maddelerden akademik bir sunum yap (Şablon 3 olsun), 7 slayt kadar:

- Başlık: Yapay Zekâ Destekli Öğrenme Analitiği
- Sunucu: Dr. Öğr. Üyesi Ayşe Yılmaz, Eğitim Fakültesi
- Problem: Öğrenci başarısının erken tespiti zor
- Yöntem: 3 dönemlik not ve devam verisi, karar ağacı ve lojistik regresyon
- Bulgular: Model riskli öğrencileri dönem ortasında yakalıyor; devamsızlık en güçlü gösterge
- Sınırlılıklar: Tek fakülte, küçük örneklem
- Sonuç: Erken uyarı sistemi pilotu önerilir
