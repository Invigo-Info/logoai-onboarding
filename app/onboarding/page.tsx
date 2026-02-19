"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
   TYPES
   ═══════════════════════════════════════════ */

interface FormData {
  businessName: string;
  description: string;
  products: string[];
  tagline: string;
  impressionWords: string[];
  colors: string[];
  logoType: string;
  selectedPaletteIndex: number;
}

interface ColorOption {
  name: string;
  hex: string;
}

interface LogoTypeInfo {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

interface AILogoTypeData {
  id: string;
  label: string;
  percent: number;
  description: string;
}

interface LogoVariant {
  type: string;
  svg: string;
  imageUrl?: string;
  prompt?: string;
  model?: string;
}

interface GeneratedPrompt {
  type: string;
  prompt: string;
}

interface LogoConfig {
  businessName: string;
  colors: string[];
  logoType: string;
  impressionWords: string[];
  tagline: string;
}

interface AISuggestionDropdownProps {
  suggestions: string[];
  loading: boolean;
  onSelect: (s: string) => void;
  visible: boolean;
}

interface StepProgressProps {
  current: number;
  total: number;
}

/* ═══════════════════════════════════════════
   CONTENT CONFIG
   ═══════════════════════════════════════════ */

const PRODUCTS_SERVICES: string[] = [
  "Consulting", "E-commerce", "SaaS", "Marketing", "Design",
  "Photography", "Real Estate", "Food & Beverage", "Education",
  "Healthcare", "Fitness", "Technology", "Fashion", "Finance",
  "Entertainment", "Travel", "Automotive", "Construction",
  "Legal Services", "Non-Profit", "Agriculture",
  "Beauty & Wellness", "Music", "Publishing", "Logistics",
];

const BRAND_ARCHETYPES: Record<string, { icon: string; words: string[] }> = {
  "Pure, Reliable, Warm": {
    icon: "\u{1F91D}",
    words: ["Pure", "Reliable", "Warm", "Clean", "Trustworthy", "Dependable", "Honest", "Steady", "Genuine", "Safe", "Solid", "Comforting", "Grounded", "Wholesome", "Consistent", "Faithful"],
  },
  "Healthy, Modern, Caring": {
    icon: "\u{2728}",
    words: ["Healthy", "Modern", "Caring", "Fresh", "Contemporary", "Nurturing", "Progressive", "Attentive", "Vibrant", "Smart", "Forward-thinking", "Thoughtful", "Energetic", "Compassionate", "Bright", "Dynamic"],
  },
};

const ALL_ARCHETYPE_WORDS = Object.values(BRAND_ARCHETYPES).flatMap((a) => a.words);

const COLOR_PALETTE: ColorOption[] = [
  { name: "Crimson", hex: "#DC2626" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Amber", hex: "#D97706" },
  { name: "Emerald", hex: "#059669" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Sky Blue", hex: "#0284C7" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Fuchsia", hex: "#C026D3" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Slate", hex: "#475569" },
  { name: "Charcoal", hex: "#1E293B" },
  { name: "Gold", hex: "#B8860B" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Forest", hex: "#166534" },
  { name: "Coral", hex: "#FF6B6B" },
  { name: "Mint", hex: "#34D399" },
  { name: "Peach", hex: "#FBBF24" },
];

const LOGO_TYPES: LogoTypeInfo[] = [
  { id: "combination_mark", label: "Combination Mark", desc: "Icon paired with brand name", icon: "\u25C6|Aa" },
  { id: "wordmark", label: "Wordmark", desc: "Brand name only, styled typography", icon: "Aa" },
  { id: "lettermark", label: "Lettermark", desc: "Initials or monogram", icon: "AB" },
  { id: "brandmark", label: "Brandmark", desc: "Standalone symbol without text", icon: "\u25C8" },
  { id: "emblem", label: "Emblem", desc: "Text inside a badge or seal", icon: "\u2B21" },
  { id: "abstract", label: "Abstract Mark", desc: "Geometric or abstract symbol", icon: "\u25C7" },
  { id: "mascot", label: "Mascot", desc: "Character-based illustrated logo", icon: "\u263A" },
];

interface AIPaletteData {
  name: string;
  colors: string[];
  rationale: string;
  industryMatch: string;
}

const STEP_CONFIG = [
  { tag: "Step 1 of 7", title: "What\u2019s your business name?" },
  { tag: "Step 2 of 7", title: "Describe your business" },
  { tag: "Step 3 of 7", title: "What do you offer?" },
  { tag: "Step 4 of 7", title: "Add a tagline" },
  { tag: "Step 5 of 7", title: "Define your brand personality" },
  { tag: "Step 6 of 7", title: "Choose your brand palette" },
  { tag: "Step 7 of 7", title: "Choose your logo style" },
  { tag: "Review", title: "Your Brand Brief" },
];

const FOOTER = {
  tagline: "Pro logos. Brand kits. Stunning results.",
  links: ["About", "Contact", "Press", "Privacy", "Terms"],
  copy: "\u00a9 2026 Logo.ai",
  disclaimer: "Logo.ai is an independent service. Not affiliated with any other company.",
};

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

function getColorName(hex: string): string {
  const match = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.name : hex;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ═══════════════════════════════════════════
   AI SUGGESTION ENGINE
   ═══════════════════════════════════════════ */

const generateAISuggestions = async (
  context: { businessName: string; description: string; products: string[]; impressionWords?: string[] },
  field: "description" | "tagline" | "products" | "impressionWords" | "colorPalettes" | "logoTypes",
): Promise<string[]> => {
  const res = await fetch("/api/ai-suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, context }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.suggestions || [];
};

const fetchColorPalettes = async (
  context: { businessName: string; description: string; products: string[]; impressionWords?: string[] },
): Promise<AIPaletteData[]> => {
  try {
    const res = await fetch("/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "colorPalettes", context }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [
      { name: "Professional Blue", colors: ["#1E3A5F", "#4A90D9", "#F5A623"], rationale: "Classic business palette conveying trust and energy", industryMatch: "Corporate" },
      { name: "Modern Mint", colors: ["#059669", "#34D399", "#1E293B"], rationale: "Fresh and contemporary with strong contrast", industryMatch: "Technology" },
      { name: "Bold Coral", colors: ["#DC2626", "#FB923C", "#1E293B"], rationale: "Energetic and attention-grabbing palette", industryMatch: "Creative" },
      { name: "Royal Purple", colors: ["#7C3AED", "#A855F7", "#1E293B"], rationale: "Luxurious and creative with modern depth", industryMatch: "Premium" },
      { name: "Earthy Warmth", colors: ["#B8860B", "#D97706", "#2D1B00"], rationale: "Organic and grounded with natural warmth", industryMatch: "Lifestyle" },
    ];
  }
};

const fetchAILogoTypes = async (
  context: { businessName: string; description: string; products: string[]; impressionWords?: string[] },
): Promise<AILogoTypeData[]> => {
  try {
    const res = await fetch("/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "logoTypes", context }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [
      { id: "combination_mark", label: "Combination Mark", percent: 35, description: "Icon paired with brand name — the most versatile and widely adaptable logo format." },
      { id: "wordmark", label: "Wordmark", percent: 25, description: "Brand name only with styled typography — clean and strong for name recognition." },
      { id: "emblem", label: "Emblem", percent: 15, description: "Text inside a badge, seal, or crest — traditional and bold for established brands." },
      { id: "lettermark", label: "Lettermark", percent: 10, description: "Initials or monogram — professional and compact for long business names." },
      { id: "brandmark", label: "Brandmark", percent: 7, description: "Standalone symbol without text — requires strong brand recognition." },
      { id: "abstract", label: "Abstract Mark", percent: 5, description: "Geometric or abstract symbol — modern and unique for differentiation." },
      { id: "mascot", label: "Mascot", percent: 3, description: "Character-based illustrated logo — friendly and memorable for approachable brands." },
    ];
  }
};

/* ═══════════════════════════════════════════
   AI PROMPT GENERATION (Step 1)
   Claude Opus 4.6 generates N unique prompts
   ═══════════════════════════════════════════ */

const fetchAIPrompts = async (
  form: FormData,
  logoTypes: string[],
  count: number,
): Promise<GeneratedPrompt[]> => {
  const res = await fetch("/api/ai-logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessName: form.businessName,
      tagline: form.tagline,
      colors: form.colors,
      impressionWords: form.impressionWords,
      logoTypes,
      description: form.description,
      products: form.products,
      promptCount: count,
      promptsOnly: true,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { prompts: { type: string; prompt: string }[] };
  return data.prompts;
};

/* ═══════════════════════════════════════════
   AI IMAGE GENERATION (Step 2)
   Both models generate images from the SAME prompts in parallel
   ═══════════════════════════════════════════ */

const AI_IMAGE_MODELS = ["google/nano-banana", "black-forest-labs/flux-2-dev"] as const;

const generateAILogosFromPrompts = async (
  form: FormData,
  prompts: GeneratedPrompt[],
): Promise<LogoVariant[]> => {
  const AI_TIMEOUT_MS = 300000;

  const callModel = async (model: string): Promise<LogoVariant[]> => {
    const res = await fetch("/api/ai-logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: form.businessName,
        tagline: form.tagline,
        colors: form.colors,
        impressionWords: form.impressionWords,
        logoTypes: prompts.map((p) => p.type),
        description: form.description,
        products: form.products,
        existingPrompts: prompts.map((p) => p.prompt),
        model,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} from ${model}`);

    const data = await res.json() as {
      logos: { type: string; svg: string | null; imageUrl: string | null; prompt: string; fallback: boolean; model: string }[];
    };

    return data.logos.map((logo) => {
      if (logo.imageUrl) {
        return { type: logo.type, svg: generateLogoSVG({ ...form, logoType: logo.type }), imageUrl: logo.imageUrl, prompt: logo.prompt, model: logo.model };
      }
      if (logo.svg) {
        return { type: logo.type, svg: logo.svg, prompt: logo.prompt, model: logo.model };
      }
      return { type: logo.type, svg: generateLogoSVG({ ...form, logoType: logo.type }), prompt: logo.prompt, model: logo.model };
    });
  };

  try {
    const result = await Promise.race([
      Promise.all(AI_IMAGE_MODELS.map((model) => callModel(model))).then((batches) => batches.flat()),
      new Promise<LogoVariant[]>((_, reject) =>
        setTimeout(() => reject(new Error("AI logo timeout")), AI_TIMEOUT_MS),
      ),
    ]);
    return result;
  } catch (err) {
    console.error("AI logo generation failed, using templates:", err);
    return prompts.map((p) => ({
      type: p.type,
      svg: generateLogoSVG({ ...form, logoType: p.type }),
      prompt: p.prompt,
    }));
  }
};

/* ═══════════════════════════════════════════
   SVG LOGO GENERATOR
   ═══════════════════════════════════════════ */

const generateLogoSVG = (config: LogoConfig): string => {
  const { businessName, colors, logoType, impressionWords, tagline } = config;
  const c1 = colors[0] || "#4F46E5";
  const c2 = colors[1] || "#7C3AED";
  const c3 = colors[2] || "#1E293B";
  const safeName = escapeHtml(businessName);
  const safeTagline = tagline ? escapeHtml(tagline) : "";
  const initials = escapeHtml(
    businessName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  );

  const isBold = impressionWords?.includes("Bold");
  const isElegant = impressionWords?.includes("Elegant") || impressionWords?.includes("Luxurious");
  const isPlayful = impressionWords?.includes("Playful") || impressionWords?.includes("Friendly");
  const isMinimal = impressionWords?.includes("Minimal") || impressionWords?.includes("Modern");

  const fontFamily = isElegant
    ? "'Georgia', serif"
    : isPlayful
      ? "'Trebuchet MS', sans-serif"
      : "'Segoe UI', sans-serif";
  const fontWeight = isBold ? "800" : isElegant ? "300" : "600";

  if (logoType === "wordmark") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <text x="200" y="105" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${businessName.length > 12 ? 32 : 42}" font-weight="${fontWeight}" fill="url(#wg)" letter-spacing="${isElegant ? "6" : isMinimal ? "2" : "1"}">${safeName}</text>
      ${safeTagline ? `<text x="200" y="140" text-anchor="middle" font-family="${fontFamily}" font-size="12" fill="${c3}" letter-spacing="3" opacity="0.7">${safeTagline.toUpperCase()}</text>` : ""}
      <line x1="120" y1="155" x2="280" y2="155" stroke="${c1}" stroke-width="1.5" opacity="0.3"/>
    </svg>`;
  }

  if (logoType === "lettermark") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <rect x="140" y="40" width="120" height="120" rx="${isPlayful ? 60 : isMinimal ? 8 : 20}" fill="url(#lg)"/>
      <text x="200" y="108" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="52" font-weight="700" fill="white" letter-spacing="4">${initials}</text>
      <text x="200" y="180" text-anchor="middle" font-family="${fontFamily}" font-size="11" fill="${c3}" letter-spacing="4" opacity="0.6">${safeName.toUpperCase()}</text>
    </svg>`;
  }

  if (logoType === "emblem") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <circle cx="200" cy="95" r="70" fill="none" stroke="url(#eg)" stroke-width="3"/>
      <circle cx="200" cy="95" r="60" fill="none" stroke="${c1}" stroke-width="1" opacity="0.3"/>
      <text x="200" y="90" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${businessName.length > 10 ? 18 : 24}" font-weight="${fontWeight}" fill="${c3}" letter-spacing="2">${safeName.toUpperCase()}</text>
      <text x="200" y="112" text-anchor="middle" font-family="${fontFamily}" font-size="9" fill="${c1}" letter-spacing="4">EST. 2026</text>
      <line x1="160" y1="100" x2="172" y2="100" stroke="${c2}" stroke-width="1"/>
      <line x1="228" y1="100" x2="240" y2="100" stroke="${c2}" stroke-width="1"/>
    </svg>`;
  }

  if (logoType === "abstract") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient><linearGradient id="ag2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:${c2}"/><stop offset="100%" style="stop-color:${c3}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <g transform="translate(130, 30)"><polygon points="35,0 70,60 0,60" fill="url(#ag1)" opacity="0.9"/><polygon points="55,20 90,80 20,80" fill="url(#ag2)" opacity="0.7"/><circle cx="45" cy="45" r="12" fill="${c1}" opacity="0.5"/></g>
      <text x="265" y="80" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="28" font-weight="${fontWeight}" fill="${c3}">${safeName}</text>
      ${safeTagline ? `<text x="265" y="105" text-anchor="middle" font-family="${fontFamily}" font-size="10" fill="${c1}" letter-spacing="2">${safeTagline}</text>` : ""}
    </svg>`;
  }

  if (logoType === "combination_mark") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="cmg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <g transform="translate(60, 50)">
        <rect width="80" height="80" rx="${isPlayful ? 40 : 14}" fill="url(#cmg)" transform="rotate(${isPlayful ? 10 : 0}, 40, 40)"/>
        <text x="40" y="48" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="32" font-weight="700" fill="white">${initials}</text>
      </g>
      <line x1="160" y1="60" x2="160" y2="140" stroke="${c1}" stroke-width="1" opacity="0.2"/>
      <text x="280" y="90" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${businessName.length > 12 ? 22 : 28}" font-weight="${fontWeight}" fill="${c3}">${safeName}</text>
      ${safeTagline ? `<text x="280" y="118" text-anchor="middle" font-family="${fontFamily}" font-size="10" fill="${c1}" letter-spacing="2">${safeTagline}</text>` : ""}
    </svg>`;
  }

  if (logoType === "brandmark") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs>
        <linearGradient id="bmg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient>
        <linearGradient id="bmg2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:${c2}"/><stop offset="50%" style="stop-color:${c3}"/></linearGradient>
      </defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <g transform="translate(200, 100)">
        <circle cx="0" cy="0" r="55" fill="url(#bmg1)" opacity="0.9"/>
        <circle cx="-18" cy="-10" r="22" fill="white" opacity="0.2"/>
        <polygon points="0,-30 26,15 -26,15" fill="url(#bmg2)" opacity="0.6"/>
        ${isMinimal ? `<circle cx="0" cy="0" r="12" fill="white" opacity="0.3"/>` : ""}
        ${isElegant ? `<circle cx="0" cy="0" r="55" fill="none" stroke="${c1}" stroke-width="1" opacity="0.4"/>` : ""}
      </g>
    </svg>`;
  }

  if (logoType === "mascot") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
      <defs><linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
      <rect width="400" height="200" fill="white" rx="16"/>
      <circle cx="140" cy="85" r="45" fill="url(#mg)"/>
      <circle cx="128" cy="76" r="6" fill="white"/><circle cx="152" cy="76" r="6" fill="white"/>
      <circle cx="129" cy="77" r="3" fill="${c3}"/><circle cx="153" cy="77" r="3" fill="${c3}"/>
      <path d="M 130 94 Q 140 104 150 94" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="120" cy="55" r="12" fill="${c1}" opacity="0.8"/><circle cx="160" cy="55" r="12" fill="${c2}" opacity="0.8"/>
      <text x="280" y="78" text-anchor="middle" font-family="${fontFamily}" font-size="28" font-weight="700" fill="${c3}">${safeName}</text>
      ${safeTagline ? `<text x="280" y="105" text-anchor="middle" font-family="${fontFamily}" font-size="11" fill="${c1}" letter-spacing="1">${safeTagline}</text>` : ""}
    </svg>`;
  }

  // Default: icon_text
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
    <defs><linearGradient id="itg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
    <rect width="400" height="200" fill="white" rx="16"/>
    <rect x="70" y="55" width="70" height="70" rx="${isPlayful ? 35 : 12}" fill="url(#itg)" transform="rotate(${isPlayful ? 15 : 0}, 105, 90)"/>
    <text x="105" y="97" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="30" font-weight="700" fill="white">${initials}</text>
    <text x="270" y="85" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${businessName.length > 12 ? 24 : 30}" font-weight="${fontWeight}" fill="${c3}">${safeName}</text>
    ${safeTagline ? `<text x="270" y="115" text-anchor="middle" font-family="${fontFamily}" font-size="10" fill="${c1}" letter-spacing="2">${safeTagline}</text>` : ""}
  </svg>`;
};

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="ob-progress">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "contents" }}>
          <div
            className={`ob-progress-dot ${
              i === current ? "active" : i < current ? "completed" : ""
            }`}
          />
          {i < total - 1 && (
            <div
              className={`ob-progress-line ${i < current ? "completed" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AISuggestionDropdown({
  suggestions,
  loading,
  onSelect,
  visible,
}: AISuggestionDropdownProps) {
  if (!visible) return null;

  return (
    <div className="ob-ai-dropdown">
      <div className="ob-ai-dropdown-header">
        {loading ? "AI is thinking\u2026" : "AI Suggestions"}
      </div>
      {loading ? (
        <div className="ob-ai-dropdown-loading">
          <div className="ob-ai-dropdown-spinner" />
          <p>Generating personalized suggestions\u2026</p>
        </div>
      ) : (
        suggestions.map((s, i) => (
          <button
            key={i}
            className="ob-ai-dropdown-item"
            onClick={() => onSelect(s)}
          >
            <span className="ob-ai-dot">{"\u25CF"}</span>
            {s}
          </button>
        ))
      )}
    </div>
  );
}

function InlineSuggestions({
  suggestions,
  loading,
  onSelect,
  label,
  variant = "chips",
}: {
  suggestions: string[];
  loading: boolean;
  onSelect: (s: string) => void;
  label: string;
  variant?: "chips" | "rows";
}) {
  return (
    <div className="ob-inline-suggestions">
      <div className="ob-inline-suggestions-header">
        <span>{label}</span>
        <span className="ob-ai-tag">AI</span>
      </div>
      {loading ? (
        <div className="ob-inline-suggestions-loading">
          <div className="ob-ai-dropdown-spinner" />
          <p>Generating suggestions&hellip;</p>
        </div>
      ) : (
        <div className={`ob-inline-suggestions-list ${variant === "rows" ? "rows" : ""}`}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`ob-inline-suggestion-item ${variant === "rows" ? "row" : "chip"}`}
              onClick={() => onSelect(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function OnboardingPage() {
  const [view, setView] = useState<"onboarding" | "generating-prompts" | "prompts" | "generating-images" | "dashboard">("onboarding");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [logoVariants, setLogoVariants] = useState<LogoVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    businessName: "",
    description: "",
    products: [],
    tagline: "",
    impressionWords: [],
    colors: [],
    logoType: "combination_mark",
    selectedPaletteIndex: -1,
  });

  const [aiPalettes, setAiPalettes] = useState<AIPaletteData[]>([]);
  const [palettesLoading, setPalettesLoading] = useState(false);
  const [manualColorOpen, setManualColorOpen] = useState(false);

  const [aiLogoTypes, setAiLogoTypes] = useState<AILogoTypeData[]>([]);
  const [logoTypesLoading, setLogoTypesLoading] = useState(false);
  const [logoTypesFetched, setLogoTypesFetched] = useState(false);

  const [customProduct, setCustomProduct] = useState("");
  const [customImpression, setCustomImpression] = useState("");
  const [promptCount, setPromptCount] = useState(5);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [savedProfileId, setSavedProfileId] = useState<number | null>(null);

  // Inline auto-fetch suggestion state
  const [inlineDescSuggestions, setInlineDescSuggestions] = useState<string[]>([]);
  const [inlineDescLoading, setInlineDescLoading] = useState(false);
  const [inlineDescFetched, setInlineDescFetched] = useState(false);
  const [inlineProdSuggestions, setInlineProdSuggestions] = useState<string[]>([]);
  const [inlineProdLoading, setInlineProdLoading] = useState(false);
  const [inlineProdFetched, setInlineProdFetched] = useState(false);
  const [inlineTaglineSuggestions, setInlineTaglineSuggestions] = useState<string[]>([]);
  const [inlineTaglineLoading, setInlineTaglineLoading] = useState(false);
  const [inlineTaglineFetched, setInlineTaglineFetched] = useState(false);
  const [aiImpressionWords, setAiImpressionWords] = useState<string[]>([]);
  const [impressionWordsLoading, setImpressionWordsLoading] = useState(false);
  const [impressionWordsFetched, setImpressionWordsFetched] = useState(false);

  const brandName = form.businessName || "Your Brand";
  const TOTAL_STEPS = 8;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goNext = useCallback(() => {
    setDropdownOpen(false);
    setDirection("forward");
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }, [step]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setDropdownOpen(false);
    setDirection("back");
    setStep((s) => s - 1);
  }, [step]);

  const fetchSuggestions = async (field: "description" | "tagline" | "products" | "impressionWords" | "colorPalettes") => {
    setAiLoading(true);
    setDropdownOpen(true);
    try {
      const results = await generateAISuggestions(form, field);
      setAiSuggestions(results);
      // Sync to inline state
      if (field === "description") { setInlineDescSuggestions(results); setInlineDescFetched(true); }
      if (field === "products") { setInlineProdSuggestions(results); setInlineProdFetched(true); }
      if (field === "tagline") { setInlineTaglineSuggestions(results); setInlineTaglineFetched(true); }
    } catch {
      setAiSuggestions(["Unable to generate suggestions. Please type manually."]);
    }
    setAiLoading(false);
  };

  const saveOnboardingProfile = useCallback(async (formData: FormData): Promise<number | null> => {
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          products: formData.products,
          tagline: formData.tagline,
          impressionWords: formData.impressionWords,
          colors: formData.colors,
          logoType: formData.logoType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Onboarding save failed:", res.status, body);
        setSaveError(body.error || `Save failed (${res.status}). Please try again.`);
        return null;
      }

      const body = await res.json();
      setSaveError(null);
      return body.profileId ?? null;
    } catch (err) {
      console.error("Onboarding save network error:", err);
      setSaveError("Network error. Please check your connection and try again.");
      return null;
    }
  }, []);

  // Phase 1: Generate prompts only
  const handleFinish = async () => {
    setView("generating-prompts");
    setSaveError(null);

    // Save onboarding data to Supabase
    const profileId = await saveOnboardingProfile(form);

    if (profileId === null) {
      setView("onboarding");
      return;
    }
    setSavedProfileId(profileId);

    const allTypes = [form.logoType, "combination_mark", "wordmark", "lettermark", "emblem", "abstract", "brandmark", "mascot"];
    const uniqueTypes = Array.from(new Set(allTypes));
    const logoTypesForPrompts: string[] = [];
    for (let i = 0; i < promptCount; i++) {
      logoTypesForPrompts.push(uniqueTypes[i % uniqueTypes.length]);
    }

    try {
      const prompts = await fetchAIPrompts(form, logoTypesForPrompts, promptCount);
      setGeneratedPrompts(prompts);
      setView("prompts");
    } catch (err) {
      console.error("Prompt generation failed:", err);
      setSaveError("Failed to generate prompts. Please try again.");
      setView("onboarding");
    }
  };

  // Phase 2: Generate images from the prompts
  const handleGenerateImages = async () => {
    setView("generating-images");

    const variants: LogoVariant[] = await generateAILogosFromPrompts(form, generatedPrompts);
    setLogoVariants(variants);
    setSelectedVariant(0);
    setView("dashboard");

    // Save logos to database
    if (savedProfileId) {
      try {
        const saveRes = await fetch("/api/logos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: savedProfileId,
            businessName: form.businessName,
            tagline: form.tagline,
            colors: form.colors,
            impressionWords: form.impressionWords,
            logos: variants.map((v, i) => ({
              type: v.type,
              svg: v.svg,
              imageUrl: v.imageUrl || null,
              isSelected: i === 0,
            })),
          }),
        });
        if (!saveRes.ok) {
          const body = await saveRes.json().catch(() => ({}));
          console.error("Logo save failed:", saveRes.status, body);
        }
      } catch (err) {
        console.error("Logo save network error:", err);
      }
    }
  };

  const downloadLogo = (variant: LogoVariant, format: "svg" | "png" = "svg") => {
    const filename = form.businessName.replace(/\s+/g, "-").toLowerCase();

    // For AI-generated image logos, download the PNG directly
    if (variant.imageUrl && format === "png") {
      fetch(variant.imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}-logo.png`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => console.error("Download failed:", err));
      return;
    }

    // SVG template downloads
    if (format === "svg") {
      const blob = new Blob([variant.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-logo.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "png") {
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
        link.download = `${filename}-logo.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(variant.svg)));
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return form.businessName.trim().length >= 2;
      case 1: return form.description.trim().length >= 5;
      case 2: return form.products.length >= 1;
      case 3: return true;
      case 4: return form.impressionWords.length === 3;
      case 5: return form.colors.length >= 1;
      case 6: return !!form.logoType;
      case 7: return true;
      default: return false;
    }
  };

  const handleStartOver = () => {
    setView("onboarding");
    setStep(0);
    setDirection("forward");
    setForm({
      businessName: "",
      description: "",
      products: [],
      tagline: "",
      impressionWords: [],
      colors: [],
      logoType: "combination_mark",
      selectedPaletteIndex: -1,
    });
    setLogoVariants([]);
    setSelectedVariant(0);
    setAiPalettes([]);
    setManualColorOpen(false);
    setInlineDescSuggestions([]);
    setInlineDescLoading(false);
    setInlineDescFetched(false);
    setInlineProdSuggestions([]);
    setInlineProdLoading(false);
    setInlineProdFetched(false);
    setInlineTaglineSuggestions([]);
    setInlineTaglineLoading(false);
    setInlineTaglineFetched(false);
    setAiImpressionWords([]);
    setImpressionWordsLoading(false);
    setImpressionWordsFetched(false);
    setPromptCount(10);
    setGeneratedPrompts([]);
    setSavedProfileId(null);
    setAiLogoTypes([]);
    setLogoTypesLoading(false);
    setLogoTypesFetched(false);
  };

  // ─── Generating Prompts Screen ──────────────────────────────
  if (view === "generating-prompts") {
    return (
      <div className={`onboarding-page ${sora.variable} ${ibmPlexMono.variable}`}>
        <div className="ab-atmosphere" />
        <div className="ob-generating">
          <div>
            <div
              className="ob-generating-morph"
              style={{
                background: `linear-gradient(135deg, ${form.colors[0] || "#7C3AED"}, ${form.colors[1] || "#A855F7"})`,
              }}
            />
            <h2>Writing Your Prompts</h2>
            <p>
              AI is crafting {promptCount} unique logo prompts for{" "}
              <strong>{brandName}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Prompts Review Screen ─────────────────────────────────
  if (view === "prompts") {
    return (
      <div className={`onboarding-page ${sora.variable} ${ibmPlexMono.variable}`}>
        <div className="ab-atmosphere" />

        <nav className="ab-nav">
          <a href="/" className="ab-nav-logo">
            <div className="ab-nav-logo-text">
              Logo<span>.</span>ai
            </div>
          </a>
          <div className="ab-nav-right">
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: { avatarBox: { width: "32px", height: "32px" } },
              }}
            />
          </div>
        </nav>

        <div className="ob-prompts-page">
          <div className="ob-prompts-header">
            <h2>{generatedPrompts.length} Prompts for <strong>{brandName}</strong></h2>
            <p>Review your AI-generated logo prompts below. Each will produce a unique logo design.</p>
          </div>

          <div className="ob-prompts-list">
            {generatedPrompts.map((p, i) => {
              const typeLabel = LOGO_TYPES.find((t) => t.id === p.type)?.label || p.type;
              return (
                <div key={i} className="ob-prompt-card">
                  <div className="ob-prompt-card-header">
                    <span className="ob-prompt-card-number">#{i + 1}</span>
                    <span className="ob-prompt-card-type">{typeLabel}</span>
                  </div>
                  <p className="ob-prompt-card-text">{p.prompt}</p>
                </div>
              );
            })}
          </div>

          <div className="ob-prompts-actions">
            <button
              className="ob-btn-back"
              onClick={() => {
                setView("onboarding");
                setGeneratedPrompts([]);
              }}
            >
              {"\u2190"} Back to Brief
            </button>
            <button
              className="ob-btn-next"
              onClick={handleGenerateImages}
            >
              Generate {generatedPrompts.length} Logos {"\u2192"}
            </button>
          </div>
        </div>

        <footer className="ab-footer">
          <div className="ab-footer-inner">
            <div className="ab-footer-tagline">{FOOTER.tagline}</div>
            <div className="ab-footer-links">
              {FOOTER.links.map((link) => (
                <a href={`/${link.toLowerCase()}`} key={link}>{link}</a>
              ))}
            </div>
            <div className="ab-footer-copy">{FOOTER.copy}</div>
            <div className="ab-footer-disclaimer">{FOOTER.disclaimer}</div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── Generating Images Screen ──────────────────────────────
  if (view === "generating-images") {
    return (
      <div className={`onboarding-page ${sora.variable} ${ibmPlexMono.variable}`}>
        <div className="ab-atmosphere" />
        <div className="ob-generating">
          <div>
            <div
              className="ob-generating-morph"
              style={{
                background: `linear-gradient(135deg, ${form.colors[0] || "#7C3AED"}, ${form.colors[1] || "#A855F7"})`,
              }}
            />
            <h2>Generating Your Logos</h2>
            <p>
              AI is rendering {generatedPrompts.length * 2} logo images across 2 models for{" "}
              <strong>{brandName}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard View ─────────────────────────────────────────
  if (view === "dashboard") {
    const currentLogo = logoVariants[selectedVariant];
    return (
      <div className={`onboarding-page ${sora.variable} ${ibmPlexMono.variable}`}>
        <div className="ab-atmosphere" />

        {/* Dashboard Header */}
        <header className="ob-dash-header">
          <a href="/" className="ob-dash-header-logo">
            <div className="ob-dash-header-logo-icon">L</div>
            <div className="ob-dash-header-logo-text">
              Logo<span>.</span>ai
            </div>
          </a>
          <div className="ob-dash-header-right">
            <button
              className="ob-dash-start-over"
              onClick={handleStartOver}
            >
              {"\u2190"} Start Over
            </button>
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
        </header>

        <div className="ob-dash-wrap">
          {/* Welcome */}
          <div className="ob-dash-welcome">
            <h1>
              Your Logo is Ready, <strong>{brandName}</strong>
            </h1>
            <p>
              We&apos;ve generated {logoVariants.length} unique variants based on
              your preferences. Select and download your favorite.
            </p>
          </div>

          {/* Main Logo Card */}
          <div className="ob-dash-main-card">
            <div className="ob-dash-svg-wrap">
              {currentLogo?.imageUrl ? (
                <img
                  src={currentLogo.imageUrl}
                  alt={`${brandName} logo`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div
                  className="ob-dash-svg-inner"
                  dangerouslySetInnerHTML={{ __html: currentLogo?.svg || "" }}
                />
              )}
            </div>

            {/* Variant selector */}
            <div className="ob-dash-variants">
              {logoVariants.map((v, i) => (
                <button
                  key={i}
                  className={`ob-dash-variant-btn ${selectedVariant === i ? "selected" : ""}`}
                  onClick={() => setSelectedVariant(i)}
                >
                  {v.imageUrl ? (
                    <img
                      src={v.imageUrl}
                      alt={`${brandName} variant ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: v.svg }} />
                  )}
                </button>
              ))}
            </div>

            <div className="ob-dash-style-label">
              Style: <strong>{currentLogo?.type?.replace(/_v\d+$/, "").replace(/_/g, " ")}</strong>
            </div>

            {/* Download Buttons */}
            <div className="ob-dash-download-row">
              {currentLogo?.imageUrl ? (
                <button
                  className="ob-dash-download-primary"
                  onClick={() => downloadLogo(currentLogo, "png")}
                >
                  {"\u2193"} Download PNG
                </button>
              ) : (
                <>
                  <button
                    className="ob-dash-download-primary"
                    onClick={() => downloadLogo(currentLogo, "svg")}
                  >
                    {"\u2193"} Download SVG
                  </button>
                  <button
                    className="ob-dash-download-secondary"
                    onClick={() => downloadLogo(currentLogo, "png")}
                  >
                    {"\u2193"} Download PNG
                  </button>
                </>
              )}
            </div>

            {/* Go to Dashboard */}
            <div className="ob-dash-goto-row">
              <a href="/dashboard" className="ob-dash-goto-btn">
                Go to My Dashboard {"\u2192"}
              </a>
            </div>
          </div>

          {/* Brand Summary Grid */}
          <div className="ob-dash-grid">
            <div className="ob-dash-info-card">
              <h3>Brand Profile</h3>
              <div className="ob-dash-info-label">Business Name</div>
              <div className="ob-dash-info-value">{form.businessName}</div>
              <div className="ob-dash-info-label">Description</div>
              <div className="ob-dash-info-value">{form.description}</div>
              {form.tagline && (
                <>
                  <div className="ob-dash-info-label">Tagline</div>
                  <div className="ob-dash-info-value">
                    <em>&ldquo;{form.tagline}&rdquo;</em>
                  </div>
                </>
              )}
            </div>

            <div className="ob-dash-info-card">
              <h3>Brand Identity</h3>
              <div className="ob-dash-info-label">Colors</div>
              <div className="ob-dash-info-value">
                <div className="ob-dash-color-row">
                  {form.colors.map((c, i) => (
                    <div
                      key={i}
                      className="ob-dash-color-swatch"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="ob-dash-info-label">Impression</div>
              <div className="ob-dash-info-value">
                <div className="ob-dash-tag-row">
                  {form.impressionWords.map((w, i) => (
                    <span key={i} className="ob-dash-tag">{w}</span>
                  ))}
                </div>
              </div>
              <div className="ob-dash-info-label">Services</div>
              <div className="ob-dash-info-value">
                <div className="ob-dash-tag-row">
                  {form.products.slice(0, 3).map((p, i) => (
                    <span key={i} className="ob-dash-tag">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="ab-footer">
          <div className="ab-footer-inner">
            <div className="ab-footer-tagline">{FOOTER.tagline}</div>
            <div className="ab-footer-links">
              {FOOTER.links.map((link) => (
                <a href={`/${link.toLowerCase()}`} key={link}>{link}</a>
              ))}
            </div>
            <div className="ab-footer-copy">{FOOTER.copy}</div>
            <div className="ab-footer-disclaimer">{FOOTER.disclaimer}</div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── Onboarding View ────────────────────────────────────────
  const renderStep = () => {
    const stepCfg = STEP_CONFIG[step];

    switch (step) {
      case 0:
        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">{stepCfg.title}</h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 24 }}>
              This will be the foundation of your logo design.
            </p>
            <input
              type="text"
              className="ob-input"
              placeholder="e.g. Quantum Labs"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              autoFocus
            />
          </div>
        );

      case 1: {
        // Auto-fetch description suggestions on first render of this step
        if (!inlineDescFetched && !inlineDescLoading && form.businessName.trim()) {
          setInlineDescLoading(true);
          generateAISuggestions(form, "description").then((results) => {
            setInlineDescSuggestions(results);
            setInlineDescLoading(false);
            setInlineDescFetched(true);
          }).catch(() => {
            setInlineDescLoading(false);
            setInlineDescFetched(true);
          });
        }

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">
              Describe <strong>{brandName}</strong>
            </h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 24 }}>
              In a few words, what does your business do?
            </p>
            <div className="ob-ai-suggest-wrap" ref={dropdownRef}>
              <textarea
                className="ob-textarea"
                placeholder="e.g. We build AI-powered tools for small businesses..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
              <button
                className="ob-ai-suggest-btn"
                onClick={() => fetchSuggestions("description")}
              >
                Regenerate
              </button>
              <AISuggestionDropdown
                suggestions={aiSuggestions}
                loading={aiLoading}
                visible={dropdownOpen}
                onSelect={(s) => {
                  setForm({ ...form, description: s });
                  setDropdownOpen(false);
                }}
              />
            </div>
            <InlineSuggestions
              suggestions={inlineDescSuggestions}
              loading={inlineDescLoading}
              label="Suggested descriptions"
              variant="rows"
              onSelect={(s) => setForm({ ...form, description: s })}
            />
          </div>
        );
      }

      case 2: {
        // Auto-fetch product suggestions on first render of this step
        if (!inlineProdFetched && !inlineProdLoading && form.businessName.trim()) {
          setInlineProdLoading(true);
          generateAISuggestions(form, "products").then((results) => {
            setInlineProdSuggestions(results);
            setInlineProdLoading(false);
            setInlineProdFetched(true);
          }).catch(() => {
            setInlineProdLoading(false);
            setInlineProdFetched(true);
          });
        }

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">
              What does <strong>{brandName}</strong> offer?
            </h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 8 }}>
              Add up to 3 products or services.
            </p>
            <div className="ob-select-count">
              Added: <strong>{form.products.length}/3</strong>
            </div>
            <div className="ob-custom-input-row" ref={dropdownRef}>
              <input
                type="text"
                className="ob-input"
                style={{ marginBottom: 0 }}
                placeholder="Type a product or service\u2026"
                value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customProduct.trim() && form.products.length < 3) {
                    if (!form.products.includes(customProduct.trim())) {
                      setForm({ ...form, products: [...form.products, customProduct.trim()] });
                    }
                    setCustomProduct("");
                  }
                }}
              />
              <button
                className="ob-custom-add-btn"
                disabled={!customProduct.trim() || form.products.length >= 3}
                onClick={() => {
                  if (customProduct.trim() && form.products.length < 3) {
                    if (!form.products.includes(customProduct.trim())) {
                      setForm({ ...form, products: [...form.products, customProduct.trim()] });
                    }
                    setCustomProduct("");
                  }
                }}
              >
                Add
              </button>
              <button
                className="ob-custom-add-btn ob-ai-suggest-inline"
                onClick={() => fetchSuggestions("products")}
              >
                Regenerate
              </button>
              <AISuggestionDropdown
                suggestions={aiSuggestions}
                loading={aiLoading}
                visible={dropdownOpen}
                onSelect={(s) => {
                  if (form.products.length < 3 && !form.products.includes(s)) {
                    setForm({ ...form, products: [...form.products, s] });
                  }
                  setDropdownOpen(false);
                }}
              />
            </div>
            {form.products.length > 0 && (
              <div className="ob-custom-tags" style={{ marginTop: 16 }}>
                {form.products.map((p) => (
                  <span key={p} className="ob-custom-tag">
                    {p}
                    <button
                      onClick={() =>
                        setForm({ ...form, products: form.products.filter((x) => x !== p) })
                      }
                    >
                      {"\u00D7"}
                    </button>
                  </span>
                ))}
              </div>
            )}
            <InlineSuggestions
              suggestions={inlineProdSuggestions}
              loading={inlineProdLoading}
              label="Suggested products & services"
              variant="chips"
              onSelect={(s) => {
                if (form.products.length < 3 && !form.products.includes(s)) {
                  setForm({ ...form, products: [...form.products, s] });
                }
              }}
            />
          </div>
        );
      }

      case 3: {
        // Auto-fetch tagline suggestions on first render of this step
        if (!inlineTaglineFetched && !inlineTaglineLoading && form.businessName.trim()) {
          setInlineTaglineLoading(true);
          generateAISuggestions(form, "tagline").then((results) => {
            setInlineTaglineSuggestions(results);
            setInlineTaglineLoading(false);
            setInlineTaglineFetched(true);
          }).catch(() => {
            setInlineTaglineLoading(false);
            setInlineTaglineFetched(true);
          });
        }

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">{stepCfg.title}</h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 24 }}>
              Optional \u2014 a slogan or tagline to appear with your logo.
            </p>
            <div className="ob-ai-suggest-wrap" ref={dropdownRef}>
              <input
                type="text"
                className="ob-input"
                placeholder="e.g. Innovate. Create. Elevate."
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
              <button
                className="ob-ai-suggest-btn ob-ai-suggest-btn-input"
                onClick={() => fetchSuggestions("tagline")}
              >
                Regenerate
              </button>
              <AISuggestionDropdown
                suggestions={aiSuggestions}
                loading={aiLoading}
                visible={dropdownOpen}
                onSelect={(s) => {
                  setForm({ ...form, tagline: s });
                  setDropdownOpen(false);
                }}
              />
            </div>
            <InlineSuggestions
              suggestions={inlineTaglineSuggestions}
              loading={inlineTaglineLoading}
              label="Suggested taglines"
              variant="chips"
              onSelect={(s) => setForm({ ...form, tagline: s })}
            />
            <p className="ob-dashboard-note" style={{ marginTop: 16 }}>
              You can skip this step if you prefer.
            </p>
          </div>
        );
      }

      case 4: {
        // Auto-fetch AI impression words on first render of this step
        if (!impressionWordsFetched && !impressionWordsLoading && form.businessName.trim()) {
          setImpressionWordsLoading(true);
          generateAISuggestions(form, "impressionWords").then((results) => {
            setAiImpressionWords(results);
            setImpressionWordsLoading(false);
            setImpressionWordsFetched(true);
          }).catch(() => {
            setImpressionWordsLoading(false);
            setImpressionWordsFetched(true);
          });
        }

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">
              Define <strong>{brandName}</strong>&apos;s personality
            </h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 8 }}>
              Pick exactly 3 words that define your brand personality.
            </p>
            <div className="ob-select-count">
              Selected: <strong>{form.impressionWords.length}/3</strong>
            </div>
            <div className="ob-custom-input-row">
              <input
                type="text"
                className="ob-input"
                style={{ marginBottom: 0 }}
                placeholder="Add a custom impression word\u2026"
                value={customImpression}
                onChange={(e) => setCustomImpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customImpression.trim() && form.impressionWords.length < 3) {
                    setForm({ ...form, impressionWords: [...form.impressionWords, customImpression.trim()] });
                    setCustomImpression("");
                  }
                }}
              />
              <button
                className="ob-custom-add-btn"
                disabled={!customImpression.trim() || form.impressionWords.length >= 3}
                onClick={() => {
                  if (customImpression.trim() && form.impressionWords.length < 3) {
                    setForm({ ...form, impressionWords: [...form.impressionWords, customImpression.trim()] });
                    setCustomImpression("");
                  }
                }}
              >
                Add
              </button>
            </div>
            {form.impressionWords.filter((w) => !ALL_ARCHETYPE_WORDS.includes(w) && !aiImpressionWords.includes(w)).length > 0 && (
              <div className="ob-custom-tags" style={{ marginTop: 12 }}>
                {form.impressionWords
                  .filter((w) => !ALL_ARCHETYPE_WORDS.includes(w) && !aiImpressionWords.includes(w))
                  .map((w) => (
                    <span key={w} className="ob-custom-tag">
                      {w}
                      <button
                        onClick={() =>
                          setForm({ ...form, impressionWords: form.impressionWords.filter((x) => x !== w) })
                        }
                      >
                        {"\u00D7"}
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* AI Recommended Words */}
            <div className="ob-ai-impression-section">
              <div className="ob-inline-suggestions-header">
                <span>AI Recommended Words</span>
                <span className="ob-ai-tag">AI</span>
              </div>
              {impressionWordsLoading ? (
                <div className="ob-inline-suggestions-loading">
                  <div className="ob-ai-dropdown-spinner" />
                  <p>Analyzing your brand&hellip;</p>
                </div>
              ) : (
                <div className="ob-archetype-chips">
                  {aiImpressionWords.map((w) => {
                    const selected = form.impressionWords.includes(w);
                    const disabled = form.impressionWords.length >= 3 && !selected;
                    return (
                      <button
                        key={w}
                        className={`ob-chip ob-chip-ai ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                        onClick={() => {
                          if (disabled) return;
                          if (selected) {
                            setForm({ ...form, impressionWords: form.impressionWords.filter((x) => x !== w) });
                          } else {
                            setForm({ ...form, impressionWords: [...form.impressionWords, w] });
                          }
                        }}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="ob-archetype-divider">
              <span>Or browse by archetype</span>
            </div>

            {Object.entries(BRAND_ARCHETYPES).map(([archetype, { icon, words }]) => (
              <div key={archetype} className="ob-archetype-section">
                <div className="ob-archetype-header">
                  <span className="ob-archetype-icon">{icon}</span>
                  {archetype}
                </div>
                <div className="ob-archetype-chips">
                  {words.map((w) => {
                    const selected = form.impressionWords.includes(w);
                    const disabled = form.impressionWords.length >= 3 && !selected;
                    return (
                      <button
                        key={w}
                        className={`ob-chip ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                        onClick={() => {
                          if (disabled) return;
                          if (selected) {
                            setForm({ ...form, impressionWords: form.impressionWords.filter((x) => x !== w) });
                          } else {
                            setForm({ ...form, impressionWords: [...form.impressionWords, w] });
                          }
                        }}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 5: {
        // Fetch AI palettes on first render of this step
        if (aiPalettes.length === 0 && !palettesLoading) {
          setPalettesLoading(true);
          fetchColorPalettes(form).then((palettes) => {
            setAiPalettes(palettes);
            setPalettesLoading(false);
          });
        }

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">
              Choose a palette for <strong>{brandName}</strong>
            </h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 16 }}>
              Select an AI-generated palette or pick colors manually.
            </p>

            {/* AI Palette Cards */}
            <div className="ob-palette-label">
              AI Recommended Palettes <span className="ob-ai-tag">AI</span>
            </div>
            {palettesLoading ? (
              <div className="ob-ai-palette-loading">
                <div className="ob-ai-palette-loading-spinner" />
                <p>Generating palettes for {brandName}&hellip;</p>
              </div>
            ) : (
              <div className="ob-ai-palette-grid">
                {aiPalettes.map((palette, idx) => {
                  const isSelected = form.selectedPaletteIndex === idx;
                  return (
                    <button
                      key={idx}
                      className={`ob-ai-palette-card ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setForm({
                          ...form,
                          colors: palette.colors.slice(0, 3),
                          selectedPaletteIndex: idx,
                        });
                        setManualColorOpen(false);
                      }}
                    >
                      <div className="ob-ai-palette-bar">
                        {palette.colors.slice(0, 3).map((color, ci) => (
                          <div
                            key={ci}
                            className="ob-ai-palette-block"
                            style={{ background: color }}
                          >
                            <span className="ob-ai-palette-hex">{color.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="ob-ai-palette-info">
                        <span className="ob-ai-palette-name">{palette.name}</span>
                        <span className="ob-ai-palette-tag">{palette.industryMatch}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manual Color Picker Fallback */}
            <div className="ob-manual-color-toggle">
              <button
                className="ob-manual-color-toggle-btn"
                onClick={() => setManualColorOpen(!manualColorOpen)}
              >
                <span className={`ob-manual-color-toggle-arrow ${manualColorOpen ? "open" : ""}`}>{"\u25BC"}</span>
                Pick colors manually
              </button>
              <div className={`ob-manual-color-content ${manualColorOpen ? "open" : ""}`}>
                <div className="ob-manual-color-inner">
                  <div className="ob-select-count">
                    Selected: <strong>{form.colors.length}/3</strong>
                  </div>
                  <div className="ob-color-grid">
                    {COLOR_PALETTE.map((c) => {
                      const selected = form.colors.includes(c.hex);
                      const disabled = form.colors.length >= 3 && !selected;
                      return (
                        <button
                          key={c.hex}
                          className={`ob-color-option ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                          onClick={() => {
                            if (disabled) return;
                            if (selected) {
                              setForm({ ...form, colors: form.colors.filter((x) => x !== c.hex), selectedPaletteIndex: -1 });
                            } else {
                              setForm({ ...form, colors: [...form.colors, c.hex], selectedPaletteIndex: -1 });
                            }
                          }}
                        >
                          <div
                            className="ob-color-swatch"
                            style={{ background: c.hex }}
                          />
                          <span className="ob-color-name">{c.name}</span>
                          <span className="ob-color-check">{"\u2713"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 6: {
        // Auto-fetch AI logo types on first render of this step
        if (!logoTypesFetched && !logoTypesLoading && form.businessName.trim()) {
          setLogoTypesLoading(true);
          fetchAILogoTypes(form).then((results) => {
            setAiLogoTypes(results);
            setLogoTypesLoading(false);
            setLogoTypesFetched(true);
          }).catch(() => {
            setLogoTypesLoading(false);
            setLogoTypesFetched(true);
          });
        }

        // Map AI data to display rows, falling back to icon from LOGO_TYPES
        const displayTypes = aiLogoTypes.length > 0
          ? aiLogoTypes.map((ai) => {
              const info = LOGO_TYPES.find((t) => t.id === ai.id);
              return {
                id: ai.id,
                label: ai.label,
                icon: info?.icon || "\u25C6",
                percent: ai.percent,
                description: ai.description,
              };
            })
          : LOGO_TYPES.map((t, i) => ({
              id: t.id,
              label: t.label,
              icon: t.icon,
              percent: [35, 25, 15, 10, 7, 5, 3][i] || 5,
              description: t.desc,
            }));

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">{stepCfg.title}</h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 8 }}>
              Ranked by industry usage for {brandName}.
            </p>
            <div className="ob-logo-type-ai-label">
              AI Ranked for your industry <span className="ob-ai-tag">AI</span>
            </div>

            {logoTypesLoading ? (
              <div className="ob-ai-palette-loading">
                <div className="ob-ai-palette-loading-spinner" />
                <p>Analyzing your industry&hellip;</p>
              </div>
            ) : (
              <div className="ob-logo-type-list">
                {displayTypes.map((t, idx) => {
                  const selected = form.logoType === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`ob-logo-type-row ${selected ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, logoType: t.id })}
                    >
                      <div className="ob-logo-type-rank">#{idx + 1}</div>
                      <div className="ob-logo-type-icon">{t.icon}</div>
                      <div className="ob-logo-type-info">
                        <div className="ob-logo-type-name">{t.label}</div>
                        <div className="ob-logo-type-desc">{t.description}</div>
                      </div>
                      <div className="ob-logo-type-bar-wrap">
                        <div className="ob-logo-type-percent">{t.percent}%</div>
                        <div className="ob-logo-type-bar">
                          <div
                            className="ob-logo-type-bar-fill"
                            style={{ width: `${t.percent}%` }}
                          />
                        </div>
                      </div>
                      <div className={`ob-logo-type-check ${selected ? "visible" : ""}`}>
                        {"\u2713"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 7: {
        const logoTypeLabel = LOGO_TYPES.find((t) => t.id === form.logoType)?.label || form.logoType;
        const colorsLine = form.colors
          .map((c) => `${getColorName(c)} ${c.toUpperCase()}`)
          .join(" + ");

        return (
          <div className={direction === "forward" ? "ob-step" : "ob-step-back"} key={step}>
            <div className="ob-step-tag">{stepCfg.tag}</div>
            <h2 className="ob-step-title">{stepCfg.title}</h2>
            <p className="ob-dashboard-note" style={{ marginBottom: 24 }}>
              Review everything before we generate your logo.
            </p>

            <div className="ob-brief-card">
              <div className="ob-brief-mono">
                <div className="ob-brief-mono-divider">{"\u2501\u2501\u2501"} YOUR BRAND BRIEF {"\u2501\u2501\u2501"}</div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Name:</span> {form.businessName}
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Business:</span> {form.description}
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Services:</span> {form.products.length > 0 ? form.products.join(", ") : "None"}
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Tagline:</span> {form.tagline ? `\u201C${form.tagline}\u201D` : "None"}
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Impression:</span> {form.impressionWords.join(", ")}
                </div>
                <div className="ob-brief-mono-row ob-brief-mono-colors">
                  <span className="ob-brief-mono-label">Colors:</span>
                  <span className="ob-brief-mono-color-text">
                    {colorsLine}
                    {form.colors.map((c, i) => (
                      <span
                        key={i}
                        className="ob-brief-mono-swatch"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Background:</span> White #FFFFFF <span className="ob-brief-mono-default">(default)</span>
                </div>
                <div className="ob-brief-mono-row">
                  <span className="ob-brief-mono-label">Logo Type:</span> {logoTypeLabel}
                </div>
              </div>

              {/* Prompt Count Selector */}
              <div className="ob-brief-prompt-count">
                <div className="ob-brief-prompt-count-label">
                  How many prompts would you like?
                </div>
                <p className="ob-brief-prompt-count-hint">
                  Each prompt generates <strong>2 logo variants</strong> — one per AI model (<strong>10 logos</strong> total).
                </p>
                <div className="ob-brief-prompt-count-options">
                  {[5].map((n) => (
                    <button
                      key={n}
                      className={`ob-brief-prompt-count-btn ${promptCount === n ? "selected" : ""}`}
                      onClick={() => setPromptCount(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`onboarding-page ${sora.variable} ${ibmPlexMono.variable}`}>
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
      <div className="ob-page-wrap">
        <div className="ob-container">
          <StepProgress current={step} total={TOTAL_STEPS} />

          <div className="ob-step-wrapper">
            {renderStep()}
          </div>

          {/* Save Error */}
          {saveError && (
            <div className="ob-save-error">
              <span className="ob-save-error-icon">{"\u26A0"}</span>
              {saveError}
            </div>
          )}

          {/* Navigation */}
          <div className="ob-nav-buttons">
            <button
              className="ob-btn-back"
              onClick={goBack}
              disabled={step === 0}
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              {"\u2190"} Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                className="ob-btn-next"
                onClick={goNext}
                disabled={!canProceed()}
              >
                Continue {"\u2192"}
              </button>
            ) : (
              <button
                className="ob-btn-next"
                onClick={handleFinish}
                disabled={!canProceed()}
              >
                Generate My Logo {"\u2192"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-inner">
          <div className="ab-footer-tagline">{FOOTER.tagline}</div>
          <div className="ab-footer-links">
            {FOOTER.links.map((link) => (
              <a href={`/${link.toLowerCase()}`} key={link}>{link}</a>
            ))}
          </div>
          <div className="ab-footer-copy">{FOOTER.copy}</div>
          <div className="ab-footer-disclaimer">{FOOTER.disclaimer}</div>
        </div>
      </footer>
    </div>
  );
}
