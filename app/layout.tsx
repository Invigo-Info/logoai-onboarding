import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  DM_Sans,
  Space_Mono,
  Playfair_Display,
  Oswald,
  Comfortaa,
  Bebas_Neue,
  Fredoka,
  Sora,
  IBM_Plex_Mono,
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

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AI Logo Generator | Pro Logos in 60 Seconds | Logo.ai",
  description:
    "Skip the $10,000 agency. Get a professional logo and brand kit in 60 seconds. Original AI designs, not templates. No design skills needed.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html
        lang="en"
        className={`${dmSans.variable} ${spaceMono.variable} ${playfair.variable} ${oswald.variable} ${comfortaa.variable} ${bebasNeue.variable} ${fredoka.variable} ${sora.variable} ${ibmPlexMono.variable}`}
      >
        <body>
          {children}
          {/* Floating mobile CTA — visible on all pages, mobile only */}
          <div className="mobile-float-cta">
            <a href="/#final-cta" className="mobile-float-btn">
              Get Early Access &rarr;
            </a>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
