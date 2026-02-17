"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";

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

interface SavedLogo {
  id: number;
  user_id: string;
  profile_id: number;
  business_name: string;
  logo_type: string;
  svg_content: string;
  colors: string[];
  impression_words: string[];
  tagline: string | null;
  image_url: string | null;
  is_selected: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [logos, setLogos] = useState<SavedLogo[]>([]);
  const [logosLoading, setLogosLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logos")
      .then((res) => res.json())
      .then((data) => {
        setLogos(data.logos || []);
      })
      .catch((err) => {
        console.error("Failed to fetch logos:", err);
      })
      .finally(() => {
        setLogosLoading(false);
      });
  }, []);

  const downloadLogo = useCallback((logo: SavedLogo, format: "svg" | "png") => {
    const filename = `${logo.business_name.replace(/\s+/g, "-").toLowerCase()}-${logo.logo_type}`;

    // For AI-generated image logos, download the PNG directly
    if (logo.image_url && format === "png") {
      fetch(logo.image_url)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => console.error("Download failed:", err));
      return;
    }

    // SVG template downloads
    if (format === "svg") {
      const blob = new Blob([logo.svg_content], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 800, 400);
        ctx.drawImage(img, 0, 0, 800, 400);
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(logo.svg_content)));
    }
  }, []);

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
          <UserButton
            appearance={{
              baseTheme: dark,
              elements: {
                avatarBox: {
                  width: "32px",
                  height: "32px",
                },
              },
            }}
          />
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="db-page-wrap">
        <div className="db-welcome">
          <h1>
            Welcome back{isLoaded && user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="db-welcome-sub">Your Logo.ai workspace</p>
        </div>

        {/* My Logos Section */}
        {logosLoading ? (
          <div className="db-logos-section">
            <div className="db-logos-loading">
              <div className="db-logos-spinner" />
              <p>Loading your logos&hellip;</p>
            </div>
          </div>
        ) : logos.length > 0 ? (
          <div className="db-logos-section">
            <div className="db-logos-header">
              <h2 className="db-logos-title">My Logos</h2>
              <Link href="/onboarding" className="db-logos-new-btn">
                + Create New
              </Link>
            </div>
            <div className="db-logos-grid">
              {logos.map((logo) => (
                <div key={logo.id} className="db-logo-card">
                  <div className="db-logo-preview">
                    {logo.image_url ? (
                      <img
                        src={logo.image_url}
                        alt={`${logo.business_name} logo`}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: logo.svg_content }} />
                    )}
                  </div>
                  <div className="db-logo-meta">
                    <div className="db-logo-name">{logo.business_name}</div>
                    <div className="db-logo-type">
                      {logo.logo_type.replace(/_v\d+$/, "").replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="db-logo-actions">
                    {logo.image_url ? (
                      <button
                        className="db-logo-dl-png"
                        onClick={() => downloadLogo(logo, "png")}
                      >
                        {"\u2193"} PNG
                      </button>
                    ) : (
                      <>
                        <button
                          className="db-logo-dl-svg"
                          onClick={() => downloadLogo(logo, "svg")}
                        >
                          {"\u2193"} SVG
                        </button>
                        <button
                          className="db-logo-dl-png"
                          onClick={() => downloadLogo(logo, "png")}
                        >
                          {"\u2193"} PNG
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="db-card">
            <div className="db-card-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="db-card-title">Create Your Logo</h2>
            <p className="db-card-desc">
              Answer a few quick questions about your brand and we&apos;ll generate
              a professional logo and brand kit in seconds.
            </p>
            <Link href="/onboarding" className="db-btn-start">
              Getting Started &rarr;
            </Link>
          </div>
        )}

        <p className="db-coming-soon">More tools coming soon</p>
      </div>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-inner">
          <div className="ab-footer-tagline">
            Pro logos. Brand kits. Stunning results.
          </div>
          <div className="ab-footer-links">
            <a href="/about">About</a>
            <a href="/press">Press</a>
            <a href="/privacy">Privacy</a>
          </div>
          <div className="ab-footer-copy">&copy; 2026 Logo.ai</div>
          <div className="ab-footer-disclaimer">
            Logo.ai is an independent service. Not affiliated with any other
            company.
          </div>
        </div>
      </footer>
    </div>
  );
}
