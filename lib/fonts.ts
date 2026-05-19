import { Cairo, Plus_Jakarta_Sans } from "next/font/google";

export const fontLatin = Plus_Jakarta_Sans({
  variable: "--font-latin",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontArabic = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
