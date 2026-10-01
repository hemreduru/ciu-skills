export const colors = {
  orange: "#FE5000",
  wine: "#862633",
  red: "#A6192E",
  ink: "#231F20",
  gray: "#9D9FA2",
  white: "#FFFFFF",
} as const;

export type Accent = "orange" | "wine" | "red";

export const fonts = { heading: "Poppins", body: "Source Sans 3" } as const;

export const fontCss = { heading: `"${fonts.heading}", sans-serif`, body: `"${fonts.body}", sans-serif` } as const;

export const typography = { titleUpper: false } as const;

export const contact = { web: "www.ciu.edu.tr", instagram: "@ciu.official" } as const;

export const FPS = 30;
