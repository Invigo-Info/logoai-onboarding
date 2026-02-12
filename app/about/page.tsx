"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
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

const HERO = {
  headline: "Why we built this",
  sub: "The story behind Logo.ai — and why it had to exist.",
};

const STORY_SECTIONS = [
  {
    tag: "The Problem",
    title: "Great branding shouldn't cost a fortune",
    blocks: [
      {
        type: "p" as const,
        text: "Everyone's building a brand now — startups, creators, freelancers, side projects. And the first thing every one of them needs is a logo. But getting one? That's where it breaks down.",
      },
      {
        type: "p" as const,
        text: "Hire a designer? <strong>$5,000+</strong> and weeks of back-and-forth. Use a logo maker? Cheap — but you end up with a generic template that looks like a million other brands.",
      },
      { type: "p" as const, text: "That gap shouldn't exist." },
    ],
  },
  {
    tag: "The Turning Point",
    title: "Then AI changed the game",
    blocks: [
      {
        type: "p" as const,
        text: "When AI started transforming how things are made, we saw the opening we'd been waiting for.",
      },
      {
        type: "highlight" as const,
        text: "What if getting a world-class logo was as simple as describing your brand? No designers. No templates. No waiting.",
      },
      { type: "p" as const, text: "That question became Logo.ai." },
    ],
  },
  {
    tag: "The Team",
    title: "Built by people who've done this before",
    blocks: [
      {
        type: "p" as const,
        text: "<strong>Abhinav and Ashwin Reddy are the serial entrepreneurs and brothers behind Logo.ai.</strong> Over three decades, they've built technology products across every major wave — web, mobile, and now AI — building products used by millions, with multiple successful exits along the way.",
      },
      {
        type: "p" as const,
        text: "Logo.ai is headquartered in San Francisco, with teams in Singapore, Tallinn, and Dubai.",
      },
    ],
  },
  {
    tag: "How We Built It",
    title: "Two years. Thousands of hours. One obsession.",
    blocks: [
      {
        type: "p" as const,
        text: "We paired our best AI engineers with top brand designers. Together, they spent thousands of hours training our AI to understand what actually makes a great logo — the balance, the spacing, the typography, the feel.",
      },
    ],
  },
  {
    tag: "What We Built",
    title: "The world's most advanced logo generator",
    blocks: [
      {
        type: "p" as const,
        text: "Logo.ai doesn't recycle templates. It actually <strong>designs</strong> — from scratch, every single time.",
      },
      {
        type: "p" as const,
        text: "Describe your brand. In under 60 seconds, our AI generates stunning, original logos and a complete brand kit — colors, fonts, social media assets, business cards, and brand guidelines. Ready to use anywhere.",
      },
      {
        type: "p" as const,
        text: 'We showed early demos to founders. Their first reaction? <strong>"This can\'t be real."</strong>',
      },
      { type: "p" as const, text: "It is." },
    ],
  },
  {
    tag: "The Name",
    title: "A product that earned its name",
    blocks: [
      {
        type: "p" as const,
        text: "When we knew we had something special, we wanted a name that matched.",
      },
      {
        type: "p" as const,
        text: "<strong>Logo.ai</strong> — one of the most sought-after domains in the space. We acquired it because the product deserved nothing less. Simple. Direct. Unforgettable.",
      },
    ],
  },
];

const CTA = {
  headline: "Be first in line",
  sub: "We're launching in March 2026. Join 63,482+ founders on the waitlist and lock in founding member pricing — before it's gone.",
  cta: "Get Early Access →",
  fud: "No spam. Just early access.",
};

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

function AboutSignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    const formData = new FormData(e.currentTarget);
    const rawEmail = (formData.get("email") as string | null)?.trim();
    if (!rawEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: rawEmail.toLowerCase(),
          source: "about-page",
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        code?: string;
      } | null;

      if (!res.ok) {
        const duplicate = data?.code === "23505" || data?.code === "duplicate";
        if (duplicate) {
          setError("Looks like you're already on the list!");
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError("We couldn't save your email. Please try again.");
        }
        setStatus("idle");
        return;
      }

      setEmail("");
      setStatus("success");
    } catch {
      setError("Network error. Please try again in a moment.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="ab-signup-success" style={{ display: "flex" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="currentColor" opacity=".15" />
          <path
            d="M5.5 9.5l2 2 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        You&apos;re in! We&apos;ll email you before launch day.
      </div>
    );
  }

  return (
    <>
      <form className="ab-signup-form" id="ctaForm" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          aria-label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
        <div className="ab-cta-btn-wrap">
          <button
            type="submit"
            className="ab-btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Saving..." : CTA.cta}
          </button>
        </div>
      </form>
      {error && <p className="ab-signup-error">{error}</p>}
      <p className="ab-signup-note">{CTA.fud}</p>
    </>
  );
}

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
    <section ref={ref} className={`ab-reveal ${className}`}>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function AboutPage() {
  return (
    <div className={`about-page ${sora.variable} ${ibmPlexMono.variable}`}>
      {/* Atmosphere */}
      <div className="ab-atmosphere" />

      {/* Nav */}
      <nav className="ab-nav">
        <a href="/" className="ab-nav-logo">
          <svg className="ab-nav-logo-icon" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#050010" />
            <path d="M10 7v18h12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="24" cy="9" r="2.5" fill="white" />
          </svg>
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
      <div className="ab-page-wrap">
        {/* Hero */}
        <section className="ab-hero">
          <h1>{HERO.headline}</h1>
          <p className="ab-hero-sub">{HERO.sub}</p>
        </section>

        {/* Story Sections */}
        {STORY_SECTIONS.map((section, i) => (
          <RevealSection className="ab-story-section" key={i}>
            <div className="ab-story-tag">{section.tag}</div>
            <h2>{section.title}</h2>
            {section.blocks.map((block, j) =>
              block.type === "highlight" ? (
                <div className="ab-story-highlight" key={j}>
                  <p dangerouslySetInnerHTML={{ __html: block.text }} />
                </div>
              ) : (
                <p key={j} dangerouslySetInnerHTML={{ __html: block.text }} />
              ),
            )}
          </RevealSection>
        ))}

        <hr className="ab-dashed-divider" />

        {/* CTA */}
        <RevealSection className="ab-final-cta" key="cta">
          <div id="signup">
            <h2>{CTA.headline}</h2>
            <p className="ab-cta-sub">{CTA.sub}</p>
            <AboutSignupForm />
          </div>
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
