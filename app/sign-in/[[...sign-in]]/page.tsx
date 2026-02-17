"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Sora, IBM_Plex_Mono } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500"],
});

export default function SignInPage() {
  return (
    <div className={`auth-page ${sora.variable} ${ibmPlexMono.variable}`}>
      {/* Atmosphere */}
      <div className="ab-atmosphere" />

      {/* Nav */}
      <nav className="ab-nav">
        <a href="/" className="ab-nav-logo">
          <div className="ab-nav-logo-text">
            Logo<span>.</span>ai
          </div>
        </a>
        <div className="ab-nav-right">
          <div className="ab-nav-badge">
            <div className="ab-nav-badge-dot" />
            Coming Soon
          </div>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="auth-page-wrap">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/onboarding"
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#ffffff",
              colorBackground: "rgba(255,255,255,0.03)",
              colorInputBackground: "rgba(255,255,255,0.04)",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#888888",
              borderRadius: "12px",
              fontFamily: "var(--font-sora), -apple-system, sans-serif",
            },
            elements: {
              card: {
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              },
              formButtonPrimary: {
                background: "#ffffff",
                color: "#050010",
                fontWeight: "600",
                borderRadius: "100px",
                boxShadow: "0 0 15px rgba(255,255,255,0.10)",
              },
              formFieldInput: {
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              },
              footerActionLink: {
                color: "#ffffff",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
