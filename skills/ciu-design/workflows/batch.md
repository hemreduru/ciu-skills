# Batch from CSV / Excel

`B=<skill>/scripts/batch.mjs`. Columns (TR or EN, any case/diacritics): Başlık/Title, Alt Başlık/Subtitle, Tarih/Date, Saat/Time, Yer/Place, Foto/Photo, Boyut/Size, Dil/Lang, Düzen/Layout, Vurgu/Accent. Delimiter `,` `;` or tab; UTF-8 BOM and quoted fields are fine. Example: `examples/toplu-ornek.csv`.

1. Photos named in the Foto column must be in `$IN`. `node $B <list.csv|xlsx> --work $WORK --in $IN --out $OUT` (no `--render`) validates every row with `check.mjs` and prints `GORSEL=<n>`, warnings and a `ONIZLEME` of the first row.
2. Any `HATALI_SATIR` → show the whole report to the user, get corrected rows. Rows are never skipped silently.
3. Show the user the image count and the first row (render that one still with `npx remotion still`, look at it). Wait for a yes.
4. `node $B … --chrome $CHROME --render` renders every row to `$OUT/NN-slug.png` and writes `$OUT/paylasim.json` with empty captions/alt.
5. Fill each section's TR/EN caption, topic tags and alt text (rules: `brand/paylasim.md`), then `node <skill>/scripts/paylasim.mjs $OUT/paylasim.json --out $OUT/paylasim.md`; fix every `-` line.
