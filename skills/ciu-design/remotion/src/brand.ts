export const colors = {
  orange: "#FE5000",
  wine: "#862633",
  red: "#A6192E",
  ink: "#231F20",
  gray: "#9D9FA2",
  white: "#FFFFFF",
} as const;

export type Accent = "orange" | "wine" | "red";

// Deep event-panel colors observed on ciu.edu.tr; pick the one that matches the photo.
export const panels = {
  navy: "#0B274E",
  royal: "#12318E",
  slate: "#425D70",
  forest: "#21482B",
  sage: "#548D60",
  olive: "#3B4500",
  teal: "#0B3F4A",
  ochre: "#AB884E",
  terracotta: "#BA410A",
  maroon: "#5E0E19",
} as const;

export const fonts = { heading: "Poppins", body: "Source Sans 3" } as const;

export const fontCss = { heading: `"${fonts.heading}", sans-serif`, body: `"${fonts.body}", sans-serif` } as const;

export const typography = { titleUpper: false } as const;

export const contact = { web: "www.ciu.edu.tr", instagram: "@ciu.official" } as const;

export const FPS = 30;
