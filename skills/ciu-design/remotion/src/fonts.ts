import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fonts } from "./brand";

loadFont({ family: fonts.body, url: staticFile("brand/fonts/SourceSans3.ttf"), weight: "200 900" });
loadFont({ family: fonts.heading, url: staticFile("brand/fonts/Poppins-Bold.ttf"), weight: "700" });
