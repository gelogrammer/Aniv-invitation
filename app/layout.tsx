import type { Metadata, Viewport } from "next";
import { Great_Vibes, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-script" });
const serif = Playfair_Display({
  weight: ["500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});
const sans = Inter({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Our First Anniversary",
  description: "You're invited to our first anniversary date — December 7.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7a1f3d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
