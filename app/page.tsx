"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════
   CONTENT — edit text here, not in JSX
   ═══════════════════════════════════════════ */

const LAUNCH_DATE = "2026-03-20T09:00:00-08:00";

const HERO = {
  badge: "Something Big Is Coming in March 2026",
  headline: "The logo generator that",
  headlineHighlight: "changes everything",
  sub: "We built an AI that designs like the pros. You get stunning logos in under 60 seconds. No skills needed.",
  cta: "Get Early Access →",
  fud: "No spam. Just early access.",
  waitlistCount: "63,482+",
};
const INITIAL_WAITLIST_COUNT =
  Number(HERO.waitlistCount.replace(/[^0-9]/g, "")) || 0;

const LOGO_GALLERY = {
  tag: "Preview",
  headline: "AI-designed logos. Totally unique to you.",
  sub: "Every logo is generated from scratch. No recycled templates. No duplicates.",
  footnote: "All logos above were designed by Logo.ai",
};

const WHAT_YOU_GET = {
  tag: "What You Get",
  headline: "Not just a logo — your complete brand kit",
  sub: "Everything you need to launch a professional brand, all in one place.",
  caption: {
    text: "One logo becomes ",
    highlight: "an entire brand",
    suffix: " — merch, cards, social, apps & more",
  },
  items: [
    {
      title: "Logo Files",
      desc: "PNG, SVG, PDF — full color, black, white, and transparent versions.",
      icon: "layers",
    },
    {
      title: "Logo Variations",
      desc: "Primary, horizontal, vertical, icon, and favicon — every format you need.",
      icon: "grid",
    },
    {
      title: "Dark + Light Modes",
      desc: "Logos optimized for dark and light backgrounds.",
      icon: "moon",
    },
    {
      title: "Color Palette",
      desc: "HEX, RGB, CMYK codes — web and print ready.",
      icon: "target",
    },
    {
      title: "Font Pairing",
      desc: "Primary and secondary fonts — perfectly matched.",
      icon: "pen",
    },
    {
      title: "Social Media Kit",
      desc: "Profile pics, covers, post templates — sized for all platforms.",
      icon: "share",
    },
    {
      title: "Business Essentials",
      desc: "Business cards, letterhead, email signature, invoice template.",
      icon: "briefcase",
    },
    {
      title: "App Icons",
      desc: "iOS, Android, and web — every size you need.",
      icon: "phone",
    },
    {
      title: "Brand Guidelines",
      desc: "How to use everything — do's, don'ts, and best practices.",
      icon: "doc",
    },
  ],
};

const HOW_IT_WORKS = {
  tag: "How It Works",
  headline: "3 steps. 60 seconds. Done.",
  sub: "It's that simple.",
  steps: [
    {
      title: "Tell us about your brand",
      desc: "Answer a few quick questions. Your business name. Your industry. Your style.",
    },
    {
      title: "AI does the work",
      desc: "Our AI creates dozens of unique logo ideas — built around your brand, not from a template library.",
    },
    {
      title: "Make it yours",
      desc: "Pick your favorite. Tweak it if you want. Download and own it forever.",
    },
  ],
};

const USE_EVERYWHERE = {
  tag: "Use It Everywhere",
  headline: "Your logo, wherever you need it",
  items: [
    { title: "Website & Apps", desc: "Build trust before the first click." },
    { title: "Social Media", desc: "Stand out in every feed." },
    { title: "Business Cards", desc: "Make a memorable first impression." },
    {
      title: "Packaging & Products",
      desc: "Turn every box into a brand moment.",
    },
    { title: "Merch & Swag", desc: "Your brand, out in the world." },
    {
      title: "Invoices & Proposals",
      desc: "Look established on every document.",
    },
  ],
};

const WHO_ITS_FOR = {
  tag: "Who It's For",
  headline: "Built for businesses like yours",
  items: [
    "Startups & New Businesses",
    "E-commerce & Online Stores",
    "Restaurants & Cafes",
    "Consultants & Freelancers",
    "Fitness & Wellness",
    "Creatives & Agencies",
  ],
};

const WHY_JOIN = {
  tag: "Why Join Now",
  headline: "Early access = best perks",
  items: [
    {
      title: "Founding Member Pricing",
      desc: "Lock in the lowest price — forever. This rate disappears at launch.",
    },
    {
      title: "Free Credits at Launch",
      desc: "Your first logos are on us. Create and download — no charge.",
    },
    {
      title: "Shape the Product",
      desc: "Tell us what features matter most. Early members help us build what you need.",
    },
    {
      title: "Skip the Line",
      desc: "First in when we go live. No waiting. No queues.",
    },
  ],
  scarcity: {
    prefix: "Only ",
    count: "100,000 spots",
    suffix: " available. Then they're gone.",
  },
};

const FAQ_ITEMS = [
  {
    q: "I'm just starting out. Is this worth it?",
    a: "Absolutely. A great logo helps you attract customers from day one — without blowing your startup budget.",
  },
  {
    q: "How is this different from other logo makers?",
    a: "Most tools recycle the same templates. Logo.ai actually designs — from scratch. You get stunning logos and a complete brand kit, built just for you.",
  },
  {
    q: "Will my logo be unique?",
    a: "Yes. Every logo is created fresh for your brand — no recycled templates, no duplicates. It's 100% yours.",
  },
  {
    q: "Do I own what Logo.ai creates?",
    a: "Yes. Full commercial rights. Use your logo and brand kit anywhere — your website, products, merch, everywhere.",
  },
  {
    q: "What formats are included?",
    a: "PNG, SVG, and PDF — ready for web, print, and everything in between.",
  },
  {
    q: "When do you launch?",
    a: "March 2026. Sign up now to lock in Founding Member pricing and get free credits at launch.",
  },
];

const FINAL_CTA = {
  headline: "Ready to build a brand",
  headlineHighlight: "stands out?",
  sub: "Join 100,000+ founders waiting for launch. Get early access, free credits, and the lowest price — forever.",
  cta: "Get Early Access →",
  fud: "No credit card. No risk. Just a head start.",
};

const FOOTER = {
  tagline: "Pro logos. Brand kits. Stunning results.",
  links: ["About", "Contact", "Press", "Privacy", "Terms"],
  copy: "© 2026 logo.ai",
  disclaimer:
    "Logo.ai is an independent service. Not affiliated with any other company.",
};

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const icons: Record<string, React.ReactNode> = {
  layers: (
    <svg viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24">
      <path d="M22 2L11 13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 24 24">
      <path d="M18 8h1a4 4 0 010 8h-1" />
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24">
      <path d="M20 12v10H4V12" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 16 16" fill="none">
      <path
        d="M4 6l4 4 4-4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const whoIcons = ["rocket", "cart", "coffee", "briefcase", "chart", "star"];
const whyIcons = ["lock", "gift", "wrench", "bolt"];

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function Countdown() {
  const [time, setTime] = useState({ d: "--", h: "--", m: "--", s: "--" });

  useEffect(() => {
    const launch = new Date(LAUNCH_DATE).getTime();
    const tick = () => {
      const diff = launch - Date.now();
      if (diff <= 0) {
        setTime({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
      setTime({
        d: pad(diff / 864e5),
        h: pad((diff / 36e5) % 24),
        m: pad((diff / 6e4) % 60),
        s: pad((diff / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown-wrap">
      <div className="countdown-label">Launch Countdown</div>
      <div className="countdown">
        {(["d", "h", "m", "s"] as const).map((k, i) => (
          <div className="cd-unit" key={k}>
            <div className="cd-num">{time[k]}</div>
            <div className="cd-lbl">
              {["Days", "Hours", "Minutes", "Seconds"][i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupForm({
  id,
  ctaText,
  fudText,
  onSuccess,
}: {
  id: string;
  ctaText: string;
  fudText: string;
  onSuccess?: (nextCount?: number) => void;
}) {
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

    const normalizedEmail = rawEmail.toLowerCase();
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        code?: string;
        count?: number;
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
      onSuccess?.(typeof data?.count === "number" ? data.count : undefined);
    } catch (err) {
      console.error("Waitlist signup failed", err);
      setError("Network error. Please try again in a moment.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <>
        <div className="signup-success" style={{ display: "flex" }}>
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
      </>
    );
  }

  return (
    <>
      <form className="signup-form" id={id} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@company.com"
          required
          aria-label="Email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving..." : ctaText}
        </button>
      </form>
      {error && <p className="signup-error">{error}</p>}
      <p className="signup-note">{fudText}</p>
    </>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="faq-section">
      <div className="section-header">
        <div className="section-tag">FAQ</div>
        <h2>Got questions?</h2>
      </div>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <div className={`faq-item${openIdx === i ? " open" : ""}`} key={i}>
            <button
              className="faq-q"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              {item.q}
              <span className="faq-arrow">{icons.chevron}</span>
            </button>
            <div className="faq-a">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
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
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className={`reveal ${className}`}>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════
   LOGO GALLERY DATA
   ═══════════════════════════════════════════ */

const logoCards = [
  {
    cls: "lc-caseys",
    name: (
      <>
        Casey&apos;s
        <br />
        Corner
      </>
    ),
  },
  {
    cls: "lc-surefire",
    name: (
      <>
        Sure <span>Fire</span>
      </>
    ),
    sub: "Recording Studio",
  },
  { cls: "lc-balibelle", name: "Bali Belle", sub: "Resort & Spa" },
  {
    cls: "lc-tappt",
    name: (
      <>
        tappt<span>°</span>
      </>
    ),
  },
  { cls: "lc-oneplanet", name: "OnePlanet" },
  { cls: "lc-powerpacks", name: "Power Packs" },
  { cls: "lc-homespace", name: "Homespace", sub: "Real Estate" },
  { cls: "lc-caroma", name: "✦ Caroma" },
  {
    cls: "lc-dreamery",
    name: (
      <>
        <span>◐</span> dreamery
      </>
    ),
  },
  {
    cls: "lc-heartly",
    name: (
      <>
        Heartly <span>♥</span> Organic
      </>
    ),
  },
  { cls: "lc-sandra", name: "Sandra Harvey" },
  {
    cls: "lc-circleflow",
    name: (
      <>
        ○ <span>Circle</span> Flow
      </>
    ),
  },
  { cls: "lc-aredian", name: "aredian", sub: "Self Care Studio" },
  { cls: "lc-headlines", name: "Headlines", sub: "Hair Salon" },
  { cls: "lc-petescoffee", name: "Pete's Coffee" },
  {
    cls: "lc-chilltea",
    name: (
      <>
        <span>☘</span> Chill Tea
      </>
    ),
  },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function Home() {
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
      } catch (err) {
        console.error("Failed to load waitlist count", err);
      }
    };
    loadCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignupSuccess = (nextCount?: number) => {
    setWaitlistDelta((prev) => {
      if (typeof nextCount === "number" && Number.isFinite(nextCount)) {
        return Math.max(nextCount, 0);
      }
      return prev + 1;
    });
  };

  const waitlistDisplay = `${(
    INITIAL_WAITLIST_COUNT + waitlistDelta
  ).toLocaleString()}+`;

  return (
    <>
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grain" />

      {/* Nav */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          <svg
            className="nav-logo-svg"
            width="108"
            height="28"
            viewBox="0 0 108 28"
            fill="none"
          >
            <rect
              x="0"
              y="0"
              width="28"
              height="28"
              rx="7"
              fill="rgba(255,255,255,0.08)"
            />
            <path
              d="M9 7v14h10"
              stroke="url(#logoGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="21" cy="9" r="2" fill="url(#logoGrad)" />
            <text
              x="36"
              y="19.5"
              fontFamily="var(--font-dm-sans), sans-serif"
              fontSize="16"
              fontWeight="600"
              fill="#f0f0f5"
              letterSpacing="-0.5"
            >
              logo<tspan fill="#4df0c8">.ai</tspan>
            </text>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stopColor="#4df0c8" />
                <stop offset="100%" stopColor="#6c63ff" />
              </linearGradient>
            </defs>
          </svg>
        </a>
        <div className="nav-right">
          <div className="nav-tag">
            <span
              className="live-dot"
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                marginRight: 6,
              }}
            />
            Coming Soon
          </div>
          <a href="#signup" className="nav-cta">
            Get Early Access
          </a>
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-wrap">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-badge">
            <span className="live-dot" />
            {HERO.badge}
          </div>
          <h1>
            {HERO.headline}
            <br />
            <span className="gradient-text">{HERO.headlineHighlight}</span>
          </h1>
          <p className="hero-sub">{HERO.sub}</p>

          <SignupForm
            id="heroForm"
            ctaText={HERO.cta}
            fudText={HERO.fud}
            onSuccess={handleSignupSuccess}
          />

          <div className="wl-inline">
            <div className="wl-avatars">
              {[32, 47, 12, 26, 5].map((n) => (
                <img
                  key={n}
                  className="wl-face"
                  src={`https://i.pravatar.cc/56?img=${n}`}
                  alt=""
                />
              ))}
            </div>
            <span className="wl-label">
              Join <strong>{waitlistDisplay}</strong> founders on the waitlist
            </span>
          </div>

          <Countdown />
        </section>

        {/* ── LOGO SHOWCASE ── */}
        <RevealSection className="showcase">
          <div className="section-header">
            <div className="section-tag">{LOGO_GALLERY.tag}</div>
            <h2>{LOGO_GALLERY.headline}</h2>
            <p>{LOGO_GALLERY.sub}</p>
          </div>
          <div className="logo-gallery">
            {logoCards.map((card, i) => (
              <div className={`logo-card ${card.cls}`} key={i}>
                <div className="logo-name">{card.name}</div>
                {card.sub && <div className="logo-sub">{card.sub}</div>}
              </div>
            ))}
          </div>
          <p className="logo-made-tag">{LOGO_GALLERY.footnote}</p>
        </RevealSection>

        {/* ── WHAT YOU GET ── */}
        <RevealSection className="what-you-get">
          <div className="section-header">
            <div className="section-tag">{WHAT_YOU_GET.tag}</div>
            <h2>{WHAT_YOU_GET.headline}</h2>
            <p>{WHAT_YOU_GET.sub}</p>
          </div>
          <div className="wyg-showcase">
            <Image
              src="/brand-kit.png"
              alt="Complete brand kit"
              width={580}
              height={400}
              style={{ width: "100%", height: "auto" }}
            />
            <div className="wyg-showcase-caption">
              <p>
                {WHAT_YOU_GET.caption.text}
                <strong>{WHAT_YOU_GET.caption.highlight}</strong>
                {WHAT_YOU_GET.caption.suffix}
              </p>
            </div>
          </div>
          <div className="wyg-grid">
            {WHAT_YOU_GET.items.map((item, i) => (
              <div className="wyg-card" key={i}>
                <div className="wyg-icon">{icons[item.icon]}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── HOW IT WORKS ── */}
        <RevealSection className="how-section">
          <div className="section-header">
            <div className="section-tag">{HOW_IT_WORKS.tag}</div>
            <h2>{HOW_IT_WORKS.headline}</h2>
            <p>{HOW_IT_WORKS.sub}</p>
          </div>
          <div className="steps-container">
            {HOW_IT_WORKS.steps.map((step, i) => (
              <div className="step-item" key={i}>
                <div className="step-number">{i + 1}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── USE IT EVERYWHERE ── */}
        <RevealSection className="use-section">
          <div className="section-header">
            <div className="section-tag">{USE_EVERYWHERE.tag}</div>
            <h2>{USE_EVERYWHERE.headline}</h2>
          </div>
          <div className="use-grid">
            {/* Website */}
            <div className="use-card">
              <div className="use-mockup um-website">
                <div className="um-website-inner">
                  <div className="um-browser-bar">
                    <div className="um-browser-dot" />
                    <div className="um-browser-dot" />
                    <div className="um-browser-dot" />
                    <div className="um-browser-url" />
                  </div>
                  <div className="um-site-content">
                    <div className="um-site-logo">✦ CASEY&apos;S CORNER</div>
                    <div className="um-site-nav">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="um-site-hero">
                      <div className="um-site-hero-text" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Website &amp; Apps</h4>
                <p>Build trust before the first click.</p>
              </div>
            </div>
            {/* Social */}
            <div className="use-card">
              <div className="use-mockup um-social">
                <div className="um-social-inner">
                  <span>SF</span>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Social Media</h4>
                <p>Stand out in every feed.</p>
              </div>
            </div>
            {/* Biz Card */}
            <div className="use-card">
              <div className="use-mockup um-bizcard">
                <div className="um-bizcard-inner">
                  <div className="um-bc-logo">✦ Caroma</div>
                  <div>
                    <div className="um-bc-name">Jane Watkins</div>
                    <div className="um-bc-detail">hello@caroma.com</div>
                  </div>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Business Cards</h4>
                <p>Make a memorable first impression.</p>
              </div>
            </div>
            {/* Packaging */}
            <div className="use-card">
              <div className="use-mockup um-packaging">
                <div className="um-package-box">
                  <div className="um-package-logo">Sandra Harvey</div>
                  <div className="um-package-lines">
                    <div className="um-package-line" style={{ width: 60 }} />
                    <div className="um-package-line" style={{ width: 40 }} />
                  </div>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Packaging &amp; Products</h4>
                <p>Turn every box into a brand moment.</p>
              </div>
            </div>
            {/* Merch */}
            <div className="use-card">
              <div className="use-mockup um-merch">
                <div className="um-tshirt">
                  <div className="um-tshirt-logo">HEADLINES</div>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Merch &amp; Swag</h4>
                <p>Your brand, out in the world.</p>
              </div>
            </div>
            {/* Invoice */}
            <div className="use-card">
              <div className="use-mockup um-invoice">
                <div className="um-invoice-inner">
                  <div className="um-inv-header">
                    <div className="um-inv-logo">
                      tappt<span>°</span>
                    </div>
                    <div className="um-inv-tag">Invoice</div>
                  </div>
                  <div className="um-inv-lines">
                    <div className="um-inv-line" style={{ width: "100%" }} />
                    <div className="um-inv-line" style={{ width: "80%" }} />
                    <div className="um-inv-line" style={{ width: "90%" }} />
                    <div className="um-inv-line" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
              <div className="use-card-text">
                <h4>Invoices &amp; Proposals</h4>
                <p>Look established on every document.</p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── WHO IT'S FOR ── */}
        <RevealSection className="who-section">
          <div className="section-header">
            <div className="section-tag">{WHO_ITS_FOR.tag}</div>
            <h2>{WHO_ITS_FOR.headline}</h2>
          </div>
          <div className="who-grid">
            {WHO_ITS_FOR.items.map((item, i) => (
              <div className="who-card" key={i}>
                <div className="who-icon">{icons[whoIcons[i]]}</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── WHY JOIN NOW ── */}
        <RevealSection className="why-section">
          <div className="section-header">
            <div className="section-tag">{WHY_JOIN.tag}</div>
            <h2>{WHY_JOIN.headline}</h2>
          </div>
          <div className="why-grid">
            {WHY_JOIN.items.map((item, i) => (
              <div className="why-card" key={i}>
                <div className="why-icon">{icons[whyIcons[i]]}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="scarcity-banner">
            <p>
              {WHY_JOIN.scarcity.prefix}
              <em>{WHY_JOIN.scarcity.count}</em>
              {WHY_JOIN.scarcity.suffix}
            </p>
          </div>
        </RevealSection>

        {/* ── FAQ ── */}
        <RevealSection>
          <FAQSection />
        </RevealSection>

        {/* ── FINAL CTA ── */}
        <RevealSection className="final-cta">
          <div className="cta-card" id="signup">
            <h2>
              {FINAL_CTA.headline}
              <br />
              that{" "}
              <span className="gradient-text">
                {FINAL_CTA.headlineHighlight}
              </span>
            </h2>
            <p>{FINAL_CTA.sub}</p>
            <SignupForm
              id="ctaForm"
              ctaText={FINAL_CTA.cta}
              fudText={FINAL_CTA.fud}
              onSuccess={handleSignupSuccess}
            />
          </div>
        </RevealSection>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p className="footer-tagline">{FOOTER.tagline}</p>
          <div className="footer-links">
            {FOOTER.links.map((link) => (
              <a href={link.toLowerCase()} key={link}>
                {link}
              </a>
            ))}
          </div>
          <p className="footer-copy">{FOOTER.copy}</p>
          <p className="footer-disclaimer">{FOOTER.disclaimer}</p>
        </div>
      </footer>
    </>
  );
}
