/** Case- and diacritic-insensitive key (Turkish aware): "Başlık" -> "baslik". */
export const fold = (s) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
