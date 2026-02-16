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
   CONTENT CONFIG — edit text here, not in JSX
   ═══════════════════════════════════════════ */

const LAUNCH_DATE = "2026-03-20T00:00:00";

const HERO = {
  eyebrow: "Something big is coming in March 2026",
  headline: "The logo generator that changes everything",
  sub: "We built an AI that designs like the pros. You get stunning logos in under 60 seconds. No skills needed.",
  cta: "Get Early Access \u2192",
  micro: "No spam. Just early access.",
  waitlistCount: "63,482+",
};

const INITIAL_WAITLIST_COUNT =
  Number(HERO.waitlistCount.replace(/[^0-9]/g, "")) || 0;

const SOCIAL_PROOF = {
  avatars: [
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/75.jpg",
    "https://randomuser.me/api/portraits/women/90.jpg",
  ],
};

const LOGO_IMAGES = [
  "https://images.unsplash.com/photo-1586717799252-bd134f5c8a64?w=400&q=80",
  "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
  "https://images.unsplash.com/photo-1636955816868-fcb881e57954?w=400&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&q=80",
  "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400&q=80",
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
  "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&q=80",
  "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80",
];

const LOGO_GALLERY = {
  tag: "Preview",
  headline: "AI-designed logos. Totally unique to you.",
  sub: "Every logo is generated from scratch. No recycled templates. No duplicates.",
  footnote: "All logos above were designed by Logo.ai",
};

const KIT_ITEMS = [
  {
    title: "Logo Files",
    desc: "PNG, SVG, PDF \u2014 full color, black, white, and transparent versions.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Logo Variations",
    desc: "Primary, horizontal, vertical, icon, and favicon \u2014 every format you need.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Dark + Light Modes",
    desc: "Logos optimized for dark and light backgrounds.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    title: "Color Palette",
    desc: "HEX, RGB, CMYK codes \u2014 web and print ready.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "Font Pairing",
    desc: "Primary and secondary fonts \u2014 perfectly matched.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
  },
  {
    title: "Social Media Kit",
    desc: "Profile pics, covers, post templates \u2014 sized for all platforms.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    title: "Business Essentials",
    desc: "Business cards, letterhead, email signature, invoice template.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    title: "App Icons",
    desc: "iOS, Android, and web \u2014 every size you need.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    title: "Brand Guidelines",
    desc: "How to use everything \u2014 do\u2019s, don\u2019ts, and best practices.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

const HOW_STEPS = [
  {
    num: "1",
    title: "Tell us about your brand",
    desc: "Answer a few quick questions. Your business name. Your industry. Your style.",
  },
  {
    num: "2",
    title: "AI does the work",
    desc: "Our AI creates dozens of unique logo ideas \u2014 built around your brand, not from a template library.",
  },
  {
    num: "3",
    title: "Make it yours",
    desc: "Pick your favorite. Tweak it if you want. Download and own it forever.",
  },
];

const USE_CASES = [
  {
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    title: "Website & Apps",
    desc: "Build trust before the first click.",
  },
  {
    img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
    title: "Social Media",
    desc: "Stand out in every feed.",
  },
  {
    img: "https://images.unsplash.com/photo-1572502742907-46ab4e0e8552?w=600&q=80",
    title: "Business Cards",
    desc: "Make a memorable first impression.",
  },
  {
    img: "https://images.unsplash.com/photo-1636622433525-f6a10a161414?w=600&q=80",
    title: "Packaging & Products",
    desc: "Turn every box into a brand moment.",
  },
  {
    img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
    title: "Merch & Swag",
    desc: "Your brand, out in the world.",
  },
  {
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    title: "Invoices & Proposals",
    desc: "Look established on every document.",
  },
];

const AUDIENCE = [
  {
    label: "Startups & New Businesses",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: "E-commerce & Online Stores",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    label: "Restaurants & Cafes",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: "Consultants & Freelancers",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Fitness & Wellness",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    label: "Creatives & Agencies",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const PERKS = [
  {
    title: "Founding Member Pricing",
    desc: "Lock in the lowest price \u2014 forever. This rate disappears at launch.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Free Credits at Launch",
    desc: "Your first logos are on us. Create and download \u2014 no charge.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    title: "Shape the Product",
    desc: "Tell us what features matter most. Early members help us build what you need.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: "Skip the Line",
    desc: "First in when we go live. No waiting. No queues.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "I\u2019m just starting out. Is this worth it?",
    a: "Absolutely. A great logo helps you attract customers from day one \u2014 without blowing your startup budget.",
  },
  {
    q: "How is this different from other logo makers?",
    a: "Most logo tools just swap names on old templates. Logo.ai actually designs \u2014 from scratch, every single time. You get stunning logos and a complete brand kit, built just for you.",
  },
  {
    q: "Will my logo be unique?",
    a: "Yes. Every logo is created fresh for your brand \u2014 no recycled templates, no duplicates. It\u2019s 100% yours.",
  },
  {
    q: "Do I own what Logo.ai creates?",
    a: "Yes. Full commercial rights. Use your logo and brand kit anywhere \u2014 your website, products, merch, everywhere.",
  },
  {
    q: "What formats are included?",
    a: "PNG, SVG, and PDF \u2014 ready for web, print, and everything in between.",
  },
  {
    q: "When do you launch?",
    a: "March 2026. Sign up now to lock in Founding Member pricing and get free credits at launch.",
  },
];

const FINAL_CTA = {
  headline: "Ready to build a brand that stands out?",
  sub: "Join 63,482+ founders on the waitlist. Get early access, free credits, and the lowest price \u2014 forever.",
  cta: "Get Early Access \u2192",
  micro: "No credit card. No risk. Just a head start.",
};

const FOOTER = {
  tagline: "Pro logos. Brand kits. Stunning results.",
  links: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "/press" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  copy: "\u00a9 2026 Logo.ai",
  disclaimer:
    "Logo.ai is an independent service. Not affiliated with any other company.",
};

/* ═══════════════════════════════════════════
   INTERNAL COMPONENTS
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

  const units = [
    { key: "d", label: "Days" },
    { key: "h", label: "Hours" },
    { key: "m", label: "Min" },
    { key: "s", label: "Sec" },
  ] as const;

  return (
    <div className="countdown-wrap">
      <div className="countdown-label">Launch Countdown</div>
      <div className="countdown">
        {units.map((u) => (
          <div key={u.key} className="countdown-unit">
            <div className="countdown-num">{time[u.key]}</div>
            <div className="countdown-text">{u.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupForm({
  id,
  formClassName,
  ctaText,
  microText,
  microClassName,
  onSuccess,
}: {
  id: string;
  formClassName: string;
  ctaText: string;
  microText: string;
  microClassName: string;
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
      onSuccess?.(typeof data?.count === "number" ? data.count : undefined);
    } catch (err) {
      console.error("Waitlist signup failed", err);
      setError("Network error. Please try again in a moment.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="signup-success show">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.15" />
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
      <form className={formClassName} id={id} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@company.com"
          required
          aria-label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
        <div className="cta-wrap">
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Saving..." : ctaText}
          </button>
        </div>
      </form>
      {error && <p className="signup-error">{error}</p>}
      <p className={microClassName}>{microText}</p>
    </>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={`faq-item${openIdx === i ? " open" : ""}`}>
          <button
            className="faq-q"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            {item.q}
          </button>
          <div className="faq-a">
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RevealSection({
  children,
  className = "s",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`${className} animate`}>
      {children}
    </section>
  );
}

function MockupCollage() {
  return (
    <div className="mockup-wrap">
      <div className="mockup-glow"></div>
      <div className="mockup-collage">
        {/* Business Card */}
        <div
          className="m-item m-bcard"
          style={{ top: "6%", left: "3%", transform: "rotate(-5deg)" }}
        >
          <div className="m-bcard-logo">&#9670;</div>
          <div className="m-bcard-name">PRIAMO</div>
          <div className="m-bcard-sub">Brand Studio</div>
        </div>
        {/* Name Card */}
        <div
          className="m-item m-namecard"
          style={{ top: "28%", left: "1%", transform: "rotate(-2deg)" }}
        >
          <div className="m-nc-name">Sarah Chen</div>
          <div className="m-nc-role">Creative Director</div>
        </div>
        {/* Social Post */}
        <div className="m-item m-social" style={{ bottom: "2%", left: "6%" }}>
          <div className="m-social-head">
            <div className="m-social-av"></div>
            <div className="m-social-bar"></div>
          </div>
          <div className="m-social-img">
            <div className="m-social-img-icon">&#9670;</div>
          </div>
          <div className="m-social-actions">
            <div className="m-dot"></div>
            <div className="m-dot"></div>
            <div className="m-dot"></div>
          </div>
        </div>
        {/* Typography */}
        <div className="m-item m-typo" style={{ top: "40%", left: "26%" }}>
          Aa
        </div>
        {/* Hoodie */}
        <div
          className="m-item m-hoodie"
          style={{ top: "0", left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="m-hood"></div>
          <div className="m-hoodie-body">
            <div className="m-hoodie-logo">&#9670;</div>
          </div>
        </div>
        {/* Phone */}
        <div
          className="m-item m-phone"
          style={{ bottom: "0", left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="m-phone-notch"></div>
          <div className="m-phone-icon">&#9670;</div>
          <div className="m-phone-brand">Priamo</div>
          <div className="m-phone-tag">Brand Studio</div>
          <div className="m-phone-btns">
            <div className="m-phone-btn"></div>
            <div className="m-phone-btn"></div>
          </div>
        </div>
        {/* Logo Mark */}
        <div className="m-item m-logomark" style={{ top: "2%", right: "3%" }}>
          <div className="m-lm-sym">&#9670;</div>
          <div className="m-lm-txt">PRIAMO</div>
          <div className="m-lm-corner"></div>
        </div>
        {/* Color Swatches */}
        <div className="m-item m-swatches" style={{ top: "34%", right: "5%" }}>
          <div className="m-swatch" style={{ background: "#2D5A3D" }}></div>
          <div className="m-swatch" style={{ background: "#8B8B80" }}></div>
          <div className="m-swatch" style={{ background: "#C4C0B6" }}></div>
        </div>
        {/* ID Card 1 */}
        <div className="m-item m-id" style={{ bottom: "22%", right: "1%" }}>
          <div className="m-id-av"></div>
          <div className="m-id-info">
            <div className="m-id-n">Sarah Chen</div>
            <div className="m-id-r">Creative Director</div>
          </div>
        </div>
        {/* ID Card 2 */}
        <div
          className="m-item m-id"
          style={{ bottom: "6%", right: "3%", transform: "rotate(1deg)" }}
        >
          <div className="m-id-av"></div>
          <div className="m-id-info">
            <div className="m-id-n">James Park</div>
            <div className="m-id-r">Brand Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function Home() {
  const [waitlistDelta, setWaitlistDelta] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const el = heroRef.current;
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

  const handleSignupSuccess = (nextCount?: number) => {
    setWaitlistDelta((prev) => {
      if (typeof nextCount === "number" && Number.isFinite(nextCount)) {
        return Math.max(nextCount, 0);
      }
      return prev + 1;
    });
  };

  const waitlistDisplay = `${(INITIAL_WAITLIST_COUNT + waitlistDelta).toLocaleString()}+`;

  return (
    <>
      {/* <div className="page-atmosphere"></div>
      <div className="page-grain"></div> */}
      <div className={`home-page ${sora.variable} ${ibmPlexMono.variable}`}>
        <div className="ab-atmosphere" />

        {/* NAV */}
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

        <div className="page-wrap">
          {/* ═══ HERO ═══ */}
          <section className="hero" ref={heroRef}>
            <div className="hero-eyebrow">
              <div className="dot"></div>
              {HERO.eyebrow}
            </div>
            <h1>{HERO.headline}</h1>
            <p className="hero-sub">{HERO.sub}</p>

            <SignupForm
              id="hero-form"
              formClassName="hero-form"
              ctaText={HERO.cta}
              microText={HERO.micro}
              microClassName="hero-micro"
              onSuccess={handleSignupSuccess}
            />

            <div className="hero-social-proof">
              <div className="avatar-stack">
                {SOCIAL_PROOF.avatars.map((url, i) => (
                  <div
                    key={i}
                    className="avatar"
                    style={{ backgroundImage: `url('${url}')` }}
                  ></div>
                ))}
              </div>
              <span>Join</span> <span className="count">{waitlistDisplay}</span>{" "}
              <span>founders on the waitlist</span>
            </div>

            <div className="countdown-wrap">
              <Countdown />
            </div>
          </section>

          {/* ═══ LOGO SHOWCASE ═══ */}
          <RevealSection>
            <div className="container">
              <div className="s-label s-label--center">{LOGO_GALLERY.tag}</div>
              <h2 className="center">{LOGO_GALLERY.headline}</h2>
              <p className="sub center">{LOGO_GALLERY.sub}</p>

              <div className="logo-grid">
                {LOGO_IMAGES.map((url, i) => (
                  <div key={i} className="logo-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
              <p className="logo-footnote">{LOGO_GALLERY.footnote}</p>
            </div>
          </RevealSection>

          {/* ═══ WHAT YOU GET ═══ */}
          <RevealSection>
            <div className="container--narrow">
              <div className="s-label s-label--center">What You Get</div>
              <h2 className="center">
                Not just a logo &mdash; your complete brand kit
              </h2>
              <p className="sub center">
                Everything you need for a professional brand, all in one place.
              </p>
            </div>

            <div className="container">
              <MockupCollage />
              <p className="kit-caption">
                One logo becomes <strong>an entire brand</strong> &mdash; merch,
                cards, social, apps &amp; more
              </p>
            </div>

            <div className="container">
              <div className="kit-grid">
                {KIT_ITEMS.map((item, i) => (
                  <div key={i} className="kit-card">
                    <div className="kit-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* ═══ HOW IT WORKS ═══ */}
          <RevealSection>
            <div className="container--narrow">
              <div className="s-label s-label--center">How It Works</div>
              <h2 className="center">3 steps. 60 seconds. Done.</h2>
              <p className="sub center">It&apos;s that simple.</p>

              <div className="timeline">
                {HOW_STEPS.map((step, i) => (
                  <div key={i} className="tl-step">
                    <div className="tl-left">
                      <div className="tl-circle">{step.num}</div>
                      {i < HOW_STEPS.length - 1 && (
                        <div className="tl-line"></div>
                      )}
                    </div>
                    <div className="tl-right">
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* ═══ USE IT EVERYWHERE ═══ */}
          <RevealSection>
            <div className="container">
              <div className="s-label s-label--center">Use It Everywhere</div>
              <h2 className="center">Your logo, wherever you need it</h2>
              <p className="sub center">&nbsp;</p>

              <div className="use-grid">
                {USE_CASES.map((item, i) => (
                  <div key={i} className="use-card">
                    <div className="use-mock">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.img} alt="" loading="lazy" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* ═══ WHO IT'S FOR ═══ */}
          <RevealSection>
            <div className="container">
              <div className="s-label s-label--center">Who It&apos;s For</div>
              <h2 className="center">Built for businesses like yours</h2>
              <p className="sub center">&nbsp;</p>

              <div className="audience-grid">
                {AUDIENCE.map((item, i) => (
                  <div key={i} className="audience-card">
                    <div className="audience-icon">{item.icon}</div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* ═══ WHY JOIN NOW ═══ */}
          <RevealSection>
            <div className="container">
              <div className="s-label s-label--center">Why Join Now</div>
              <h2 className="center">Early access = best perks</h2>
              <p className="sub center">&nbsp;</p>

              <div className="perks">
                {PERKS.map((item, i) => (
                  <div key={i} className="perk-card">
                    <div className="perk-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="scarcity-note">
                Only <strong>100,000 spots</strong> available. Then they&apos;re
                gone.
              </div>
            </div>
          </RevealSection>

          {/* ═══ FAQ ═══ */}
          <RevealSection>
            <div className="container--narrow">
              <div className="s-label s-label--center">FAQ</div>
              <h2 className="center">Questions? Answers.</h2>
              <p className="sub center">&nbsp;</p>

              <FAQSection />
            </div>
          </RevealSection>

          <hr className="dashed-divider" />

          {/* ═══ FINAL CTA ═══ */}
          <RevealSection className="final-cta" id="final-cta">
            <div className="container--narrow" id="signup">
              <h2>{FINAL_CTA.headline}</h2>
              <p className="sub">{FINAL_CTA.sub}</p>

              <SignupForm
                id="final-form"
                formClassName="final-cta-form"
                ctaText={FINAL_CTA.cta}
                microText={FINAL_CTA.micro}
                microClassName="final-micro"
                onSuccess={handleSignupSuccess}
              />
            </div>
          </RevealSection>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <div className="footer-tagline">{FOOTER.tagline}</div>
            <div className="footer-links">
              {FOOTER.links.map((link) => (
                <a key={link.label} href={link.label.toLowerCase()}>
                  {link.label}
                </a>
              ))}
            </div>
            <div className="footer-copy">{FOOTER.copy}</div>
            <div className="footer-disclaimer">{FOOTER.disclaimer}</div>
          </div>
        </footer>
      </div>
    </>
  );
}
