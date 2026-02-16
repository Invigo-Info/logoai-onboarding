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
  headline: "Privacy Policy",
  sub: "Last updated: January 2026",
};

type Block =
  | { type: "p"; text: string }
  | { type: "highlight"; text: string }
  | { type: "list"; items: string[] };

interface StorySection {
  tag: string;
  title: string;
  blocks: Block[];
}

const STORY_SECTIONS: StorySection[] = [
  {
    tag: "Who We Are",
    title: "Your privacy matters to us",
    blocks: [
      {
        type: "p",
        text: "Logo.ai is an AI-powered logo generator. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.",
      },
      {
        type: "p",
        text: "By using Logo.ai, you agree to this policy. If you don\u2019t agree, please don\u2019t use our services.",
      },
    ],
  },
  {
    tag: "What We Collect",
    title: "What info we gather",
    blocks: [
      {
        type: "p",
        text: "Right now, we\u2019re in pre-launch mode. Here\u2019s what we collect:",
      },
      {
        type: "list",
        items: [
          "<strong>Email address</strong> \u2014 When you join our waitlist or contact us",
          "<strong>Name</strong> \u2014 If you provide it through our contact form",
          "<strong>Usage data</strong> \u2014 Basic info like pages visited, browser type, and device (collected automatically)",
        ],
      },
      {
        type: "p",
        text: "When we launch, we may also collect:",
      },
      {
        type: "list",
        items: [
          "<strong>Account info</strong> \u2014 Name, email, password when you create an account",
          "<strong>Payment info</strong> \u2014 Processed securely through our payment provider (we don\u2019t store card numbers)",
          "<strong>Content you create</strong> \u2014 Logos and brand kits you generate",
        ],
      },
    ],
  },
  {
    tag: "How We Use It",
    title: "What we do with your info",
    blocks: [
      {
        type: "p",
        text: "We use your information to:",
      },
      {
        type: "list",
        items: [
          "Send you updates about our launch and early access",
          "Respond to your questions and messages",
          "Improve our website and services",
          "Process payments (when we launch)",
          "Provide customer support",
        ],
      },
      {
        type: "highlight",
        text: "We will never sell your personal information to third parties.",
      },
    ],
  },
  {
    tag: "Cookies",
    title: "How we use cookies",
    blocks: [
      {
        type: "p",
        text: "We use cookies to make our site work better. These small files help us:",
      },
      {
        type: "list",
        items: [
          "Remember your preferences",
          "Understand how people use our site",
          "Improve your experience",
        ],
      },
      {
        type: "p",
        text: "You can turn off cookies in your browser settings, but some features may not work properly.",
      },
    ],
  },
  {
    tag: "Third-Party Services",
    title: "Partners we work with",
    blocks: [
      {
        type: "p",
        text: "We work with trusted partners to run our service:",
      },
      {
        type: "list",
        items: [
          "<strong>Analytics</strong> \u2014 To understand how people use our site",
          "<strong>Email services</strong> \u2014 To send you updates",
          "<strong>Payment processors</strong> \u2014 To handle transactions securely (at launch)",
        ],
      },
      {
        type: "p",
        text: "These partners have their own privacy policies and only access what they need to do their job.",
      },
    ],
  },
  {
    tag: "Your Rights",
    title: "You\u2019re in control",
    blocks: [
      {
        type: "p",
        text: "You have control over your data. You can:",
      },
      {
        type: "list",
        items: [
          "<strong>Access</strong> \u2014 Ask what info we have about you",
          "<strong>Correct</strong> \u2014 Fix any incorrect information",
          "<strong>Delete</strong> \u2014 Request we delete your data",
          "<strong>Unsubscribe</strong> \u2014 Opt out of marketing emails anytime",
        ],
      },
      {
        type: "p",
        text: 'Just email us at <a href="mailto:privacy@logo.ai">privacy@logo.ai</a> and we\u2019ll help you out.',
      },
    ],
  },
  {
    tag: "Data Security",
    title: "How we protect your data",
    blocks: [
      {
        type: "p",
        text: "We take security seriously. We use industry-standard measures to protect your information, including encryption and secure servers.",
      },
      {
        type: "p",
        text: "That said, no system is 100% secure. We do our best to protect your data, but we can\u2019t guarantee absolute security.",
      },
    ],
  },
  {
    tag: "Children\u2019s Privacy",
    title: "A note about children",
    blocks: [
      {
        type: "p",
        text: "Logo.ai is not intended for children under 13. We don\u2019t knowingly collect information from children. If you believe a child has provided us with personal information, please contact us and we\u2019ll delete it.",
      },
    ],
  },
  {
    tag: "Changes",
    title: "Updates to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy from time to time. If we make big changes, we\u2019ll let you know by email or by posting a notice on our site.",
      },
      {
        type: "p",
        text: "Keep using Logo.ai after changes means you accept the new policy.",
      },
    ],
  },
  {
    tag: "Contact Us",
    title: "Questions about your privacy?",
    blocks: [
      {
        type: "p",
        text: "We\u2019re here to help.",
      },
      {
        type: "p",
        text: 'Email: <a href="mailto:privacy@logo.ai">privacy@logo.ai</a>',
      },
    ],
  },
];

const CTA = {
  headline: "Be first in line",
  sub: "We\u2019re launching in March 2026. Join the waitlist and lock in Founding Member pricing \u2014 before it\u2019s gone.",
  cta: "Get Early Access \u2192",
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

function PrivacySignupForm() {
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
          source: "privacy-page",
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        code?: string;
      } | null;

      if (!res.ok) {
        const duplicate = data?.code === "23505" || data?.code === "duplicate";
        if (duplicate) {
          setError("Looks like you\u2019re already on the list!");
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError("We couldn\u2019t save your email. Please try again.");
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
      <form className="ab-signup-form" onSubmit={handleSubmit}>
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

export default function PrivacyPage() {
  return (
    <div className={`privacy-page ${sora.variable} ${ibmPlexMono.variable}`}>
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
          <a href="#signup" className="ab-nav-cta">
            Get Early Access
          </a>
        </div>
      </nav>

      {/* Page Content */}
      <div className="ab-page-wrap">
        {/* Hero */}
        <section className="ab-hero">
          <h1>{HERO.headline}</h1>
          <p className="ab-hero-sub">
            <span className="pv-date-tag">{HERO.sub}</span>
          </p>
        </section>

        {/* Story Sections */}
        {STORY_SECTIONS.map((section, i) => (
          <RevealSection className="ab-story-section" key={i}>
            <div className="ab-story-tag">{section.tag}</div>
            <h2>{section.title}</h2>
            {section.blocks.map((block, j) => {
              if (block.type === "highlight") {
                return (
                  <div className="ab-story-highlight" key={j}>
                    <p dangerouslySetInnerHTML={{ __html: block.text }} />
                  </div>
                );
              }
              if (block.type === "list") {
                return (
                  <ul className="pv-policy-list" key={j}>
                    {block.items.map((item, k) => (
                      <li key={k} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                );
              }
              return (
                <p key={j} dangerouslySetInnerHTML={{ __html: block.text }} />
              );
            })}
          </RevealSection>
        ))}

        <hr className="ab-dashed-divider" />

        {/* CTA */}
        <RevealSection className="ab-final-cta" key="cta">
          <div id="signup">
            <h2>{CTA.headline}</h2>
            <p className="ab-cta-sub">{CTA.sub}</p>
            <PrivacySignupForm />
          </div>
        </RevealSection>
      </div>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-inner">
          <div className="ab-footer-tagline">{FOOTER.tagline}</div>
          <div className="ab-footer-links">
            {FOOTER.links.map((link) => (
              <a href={`/${link.toLowerCase()}`} key={link}>
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
