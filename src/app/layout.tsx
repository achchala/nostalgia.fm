import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "nostalgia.fm",
  description: "every song has a story. pick a song, write your memory associated with it, and get one back.",
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
        <Footer />
      </body>
    </html>
  );
}
