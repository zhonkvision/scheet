import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCHEET˚ — Character Prompt Compiler",
  description:
    "Compile production-grade character model sheet prompts from anime character data. Search, parse, and assemble ready-to-use prompts for image generation.",
  keywords: [
    "character sheet",
    "model sheet",
    "anime",
    "prompt compiler",
    "reference sheet",
    "character design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
