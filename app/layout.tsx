import type { Metadata } from "next";
import { Lora, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Display/heading typeface — a book-y serif for the "study desk" feel.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

// UI/body typeface — clean and highly legible for notes, cards and quiz text.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studyfold — turn any PDF into notes, flashcards & a quiz",
  description:
    "Upload a PDF and get AI-generated study notes, flashcards, and a multiple-choice quiz in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${plexSans.variable}`}>{children}</body>
    </html>
  );
}
