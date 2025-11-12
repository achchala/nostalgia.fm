import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Nostalgia.fm",
  description: "Every song has a story. Pick a track, write a memory, and receive one back.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${merriweather.variable} antialiased bg-white text-black font-serif`}>
        <main className="max-w-2xl mx-auto p-8">{children}</main>
      </body>
    </html>
  );
}
