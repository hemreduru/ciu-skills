import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fonts } from "./brand";

const POPPINS: [file: string, weight: string, style?: "italic"][] = [
  ["Light", "300"], ["Regular", "400"], ["SemiBold", "600"], ["Bold", "700"], ["Black", "900"], ["BlackItalic", "900", "italic"],
];

// Static files only: Chrome's PDF backend turns variable-font text into Type3 glyphs (not editable in Illustrator).
const SOURCE_SANS: [file: string, weight: string][] = [["Light", "300"], ["Regular", "400"], ["SemiBold", "600"], ["Bold", "700"]];

SOURCE_SANS.forEach(([file, weight]) =>
  loadFont({ family: fonts.body, url: staticFile(`brand/fonts/SourceSans3-${file}.ttf`), weight }),
);
POPPINS.forEach(([file, weight, style = "normal"]) =>
  loadFont({ family: fonts.heading, url: staticFile(`brand/fonts/Poppins-${file}.ttf`), weight, style }),
);
