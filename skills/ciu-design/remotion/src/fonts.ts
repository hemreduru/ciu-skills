import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fonts } from "./brand";

const POPPINS: [file: string, weight: string, style?: "italic"][] = [
  ["Light", "300"], ["Regular", "400"], ["SemiBold", "600"], ["Bold", "700"], ["Black", "900"], ["BlackItalic", "900", "italic"],
];

loadFont({ family: fonts.body, url: staticFile("brand/fonts/SourceSans3.ttf"), weight: "200 900" });
POPPINS.forEach(([file, weight, style = "normal"]) =>
  loadFont({ family: fonts.heading, url: staticFile(`brand/fonts/Poppins-${file}.ttf`), weight, style }),
);
