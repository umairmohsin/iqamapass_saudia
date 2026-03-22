import type { Metadata } from "next";
import { DM_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "IqamaPass",
  description: "Residency and travel compliance tracker for Pakistani expats in Saudi Arabia."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${urdu.variable}`}>{children}</body>
    </html>
  );
}
