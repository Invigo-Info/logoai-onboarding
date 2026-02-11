import type { Metadata } from "next";
import {
  DM_Sans,
  Space_Mono,
  Playfair_Display,
  Oswald,
  Comfortaa,
  Bebas_Neue,
  Fredoka,
} from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700"],
  style: ["normal", "italic"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["600", "700"],
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  weight: ["700"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Logo.ai — The Logo Generator That Changes Everything",
  description:
    "AI-powered logo design that creates stunning, original logos and complete brand kits in under 60 seconds. Launching March 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable} ${playfair.variable} ${oswald.variable} ${comfortaa.variable} ${bebasNeue.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
