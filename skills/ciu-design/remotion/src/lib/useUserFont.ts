import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { fontCss } from "../brand";
import type { FontChoice } from "../schema";

/** Loads the user's font (public/input/) and returns CSS families (`loaded`: the font is usable and rendered); brand fonts when none. */
export const useUserFont = (font?: FontChoice): { heading: string; body: string; loaded: boolean } => {
  const [loaded, setLoaded] = useState(!font);
  const [handle] = useState(() => (font ? delayRender(`font ${font.file}`) : null));
  useEffect(() => {
    if (!font || handle === null) return;
    loadFont({ family: "UserFont", url: staticFile(`input/${font.file}`), weight: "100 900" }).then(() => setLoaded(true), cancelRender);
  }, [font, handle]);
  useEffect(() => {
    if (loaded && handle !== null) continueRender(handle);
  }, [loaded, handle]);
  if (!font) return { ...fontCss, loaded };
  const user = `"UserFont", ${fontCss.heading}`;
  return { heading: user, body: font.use === "all" ? user : fontCss.body, loaded };
};
