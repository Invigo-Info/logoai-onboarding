"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sora, IBM_Plex_Mono } from "next/font/google";

/* ═══════════════════════════════════════════
   FONTS
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════════ */

const INITIAL_WAITLIST_COUNT = 63482;

const HERO = {
  headline: "Press kit",
  sub: "Everything you need to cover Logo.ai.",
};

const INTRO = {
  text: "Logo.ai is an AI logo generator that creates professional logos and complete brand kits in under 60 seconds. Original designs \u2014 not templates. Every time.",
};

const QUICK_FACTS = [
  { label: "Launch", value: "March 2026" },
  { label: "Product", value: "AI logo generator + complete brand kits" },
  { label: "Time", value: "Under 60 seconds" },
  { label: "Waitlist", value: "__WAITLIST__" },
  { label: "Status", value: "Pre-launch" },
  {
    label: "Founders",
    value:
      "<strong>Abhinav &amp; Ashwin Reddy</strong> \u2014 serial entrepreneurs and brothers with 30+ years building technology products across web, mobile, and AI. Multiple successful exits. Products used by millions.",
  },
  { label: "HQ", value: "San Francisco" },
  { label: "Offices", value: "Singapore, Tallinn, Dubai" },
];

const STORY = {
  title: "Why this matters",
  paragraphs: [
    "Everyone\u2019s building a brand now \u2014 startups, creators, freelancers, side projects. And the first thing every one of them needs is a logo. But getting one? That\u2019s where it breaks down.",
    "Hire a designer? <strong>$5,000+</strong> and weeks of back-and-forth. Use a logo maker? Cheap \u2014 but you end up with a generic template that looks like a million other brands.",
    "We paired our best AI engineers with top brand designers. Together, they spent thousands of hours training our AI to understand what actually makes a great logo \u2014 the balance, the spacing, the typography, the feel.",
    "The result: describe your brand, and in under 60 seconds you get stunning, original logos and a complete brand kit \u2014 colors, fonts, social media assets, business cards, and brand guidelines. Ready to use anywhere.",
    "<strong>Why now:</strong> AI has transformed writing, images, and code. Logo design is next. Logo.ai is the first tool built from the ground up to bring professional-grade branding to everyone.",
  ],
};

const FOUNDERS = {
  title: "Who\u2019s behind Logo.ai",
  paragraphs: [
    "<strong>Abhinav and Ashwin Reddy are the serial entrepreneurs and brothers behind Logo.ai.</strong> Over three decades, they\u2019ve built technology products across every major wave \u2014 web, mobile, and now AI \u2014 building products used by millions, with multiple successful exits along the way.",
    "Logo.ai is headquartered in San Francisco, with teams in Singapore, Tallinn, and Dubai.",
  ],
};

const COPY_BLOCKS = [
  {
    label: "Short Version",
    text: "Logo.ai is an AI-powered logo generator launching March 2026. Founded by serial entrepreneurs and brothers Abhinav and Ashwin Reddy, the platform creates professional logos and complete brand kits in under 60 seconds \u2014 original designs, not templates.",
  },
  {
    label: "Full Version",
    text: "Logo.ai is an AI logo generator launching March 2026. Founded by Abhinav and Ashwin Reddy \u2014 serial entrepreneurs and brothers who\u2019ve spent three decades building technology products across web, mobile, and AI, with multiple successful exits and products used by millions \u2014 the platform creates professional logos and complete brand kits in under 60 seconds. Unlike traditional logo makers that recycle templates, Logo.ai generates original designs tailored to each brand. The company is headquartered in San Francisco, with teams in Singapore, Tallinn, and Dubai. Over 63,482 founders, creators, and brand owners are on the waitlist ahead of launch.",
  },
];

const QUOTES = [
  {
    text: "Great logos shouldn\u2019t cost a fortune or take weeks. We built Logo.ai so anyone can get stunning branding in seconds.",
    attr: "Abhinav & Ashwin Reddy, Founders",
  },
  {
    text: "Most logo tools just swap names on old templates. Logo.ai actually designs \u2014 from scratch, every single time.",
    attr: "Abhinav & Ashwin Reddy, Founders",
  },
  {
    text: "We taught AI what makes logos work. The balance. The spacing. The typography. The feel. Now anyone can access that.",
    attr: "Abhinav & Ashwin Reddy, Founders",
  },
];

const NAME_CORRECT = ["Logo.ai"];
const NAME_WRONG = ["LogoAI", "logoai", "Logo AI", "LOGO.AI", "Logo.Ai"];

const BRAND_ASSETS = [
  "Wordmark (dark & light)",
  "Icon mark",
  "Brand colors (HEX, RGB)",
  "Product screenshots",
  "Founder headshots",
];

const FOOTER = {
  tagline: "Pro logos. Brand kits. Stunning results.",
  links: ["About", "Contact", "Press", "Privacy", "Terms"],
  copy: "\u00a9 2026 Logo.ai",
  disclaimer:
    "Logo.ai is an independent service. Not affiliated with any other company.",
};

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className={`pr-reveal ${className}`}>
      {children}
    </section>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const handleCopy = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    },
    [text],
  );

  return (
    <div className="pr-copy-block">
      <div className="pr-copy-block-header">
        <div className="pr-copy-block-label">{label}</div>
        <button className="pr-copy-btn" onClick={handleCopy}>
          Copy
        </button>
      </div>
      <p>{text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EMAIL HELPER
   ═══════════════════════════════════════════ */

function pressEmail() {
  return "press" + "@" + "logo.ai";
}

function pressMailto() {
  return "mai" + "lto:" + pressEmail();
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function PressPage() {
  const [waitlistDelta, setWaitlistDelta] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadCount = async () => {
      try {
        const res = await fetch("/api/waitlist");
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as {
          count?: number;
        } | null;
        if (isMounted && data && typeof data.count === "number") {
          setWaitlistDelta(Math.max(data.count, 0));
        }
      } catch {
        /* ignore */
      }
    };
    loadCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const waitlistDisplay = `${(INITIAL_WAITLIST_COUNT + waitlistDelta).toLocaleString()}+`;

  return (
    <div className={`press-page ${sora.variable} ${ibmPlexMono.variable}`}>
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
          <a href="/#signup" className="ab-nav-cta">
            Get Early Access
          </a>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pr-page-wrap">
        {/* Hero */}
        <section className="pr-hero">
          <h1>{HERO.headline}</h1>
          <p className="pr-hero-sub">{HERO.sub}</p>
        </section>

        {/* What We're Building */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">What We&apos;re Building</div>
          <p className="pr-intro-text">{INTRO.text}</p>
          <p className="pr-intro-stat">
            Launching March 2026. <strong>{waitlistDisplay}</strong> founders
            are already on the waitlist.
          </p>
        </RevealSection>

        {/* Quick Facts */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">Quick Facts</div>
          <table className="pr-facts-table">
            <tbody>
              {QUICK_FACTS.map((fact, i) => (
                <tr key={i}>
                  <td>{fact.label}</td>
                  {fact.value === "__WAITLIST__" ? (
                    <td>
                      <strong>
                        {waitlistDisplay} founders, creators, and brand owners
                      </strong>
                    </td>
                  ) : (
                    <td dangerouslySetInnerHTML={{ __html: fact.value }} />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </RevealSection>

        {/* The Story */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">The Story</div>
          <h2>{STORY.title}</h2>
          {STORY.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </RevealSection>

        {/* Founders */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">The Founders</div>
          <h2>{FOUNDERS.title}</h2>
          {FOUNDERS.paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </RevealSection>

        {/* For Journalists */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">For Journalists</div>
          <h2>Copy-paste descriptions</h2>
          {COPY_BLOCKS.map((block, i) => (
            <CopyBlock key={i} label={block.label} text={block.text} />
          ))}
        </RevealSection>

        {/* Quotable */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">Quotable</div>
          <h2>Pull quotes</h2>
          {QUOTES.map((q, i) => (
            <div className="pr-quote-card" key={i}>
              <p>{q.text}</p>
              <div className="pr-quote-attr">{q.attr}</div>
            </div>
          ))}
        </RevealSection>

        {/* Brand Guidelines */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">Brand Guidelines</div>
          <h2>How to write our name</h2>
          <p>
            Always write as <strong>&ldquo;Logo.ai&rdquo;</strong> &mdash;
            capital L, lowercase o-g-o, period, lowercase a-i.
          </p>
          <div className="pr-name-rules">
            {NAME_CORRECT.map((n) => (
              <div className="pr-name-correct" key={n}>
                {n}
              </div>
            ))}
            {NAME_WRONG.map((n) => (
              <div className="pr-name-wrong" key={n}>
                {n}
              </div>
            ))}
          </div>
          <p>
            In a sentence:{" "}
            <strong>
              &ldquo;Logo.ai creates professional logos and brand kits in
              seconds.&rdquo;
            </strong>
          </p>
          <p>Full brand guide and assets available at launch.</p>
        </RevealSection>

        {/* Brand Assets */}
        <RevealSection className="pr-section">
          <div className="pr-section-label">Brand Assets</div>
          <h2>Available at launch</h2>
          <div className="pr-assets-grid">
            {BRAND_ASSETS.map((asset, i) => (
              <div className="pr-asset-item" key={i}>
                <div className="pr-asset-dot" />
                <span>{asset}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28 }}>
            Need assets early?{" "}
            <a
              href={pressMailto()}
              style={{
                color: "#fff",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                paddingBottom: 1,
              }}
            >
              Email us
            </a>
          </p>
        </RevealSection>

        <hr className="ab-dashed-divider" />

        {/* Contact CTA */}
        <RevealSection className="pr-contact-section" key="contact">
          <h2>Want to cover us?</h2>
          <p className="pr-contact-sub">
            Early access, founder interviews, and assets available on request.
          </p>
          <a href={pressMailto()} className="pr-contact-btn">
            <svg
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {pressEmail()}
          </a>
        </RevealSection>
      </div>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-inner">
          <div className="ab-footer-tagline">{FOOTER.tagline}</div>
          <div className="ab-footer-links">
            {FOOTER.links.map((link) => (
              <a href={link.toLowerCase()} key={link}>
                {link}
              </a>
            ))}
          </div>
          <div className="ab-footer-copy">{FOOTER.copy}</div>
          <div className="ab-footer-disclaimer">{FOOTER.disclaimer}</div>
        </div>
      </footer>
    </div>
  );
}
