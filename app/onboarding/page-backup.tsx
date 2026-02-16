"use client";

import { useState, useCallback } from "react";
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
   CONTENT CONFIG
   ═══════════════════════════════════════════ */

const INDUSTRIES = [
  { label: "Technology", icon: "💻" },
  { label: "Food & Beverage", icon: "🍽️" },
  { label: "Health", icon: "🏥" },
  { label: "Fashion", icon: "👗" },
  { label: "Education", icon: "📚" },
  { label: "Finance", icon: "💰" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Sports", icon: "⚽" },
  { label: "Travel", icon: "✈️" },
  { label: "Consulting", icon: "📊" },
  { label: "Other", icon: "✨" },
];

const LOGO_STYLES = [
  { label: "Modern", desc: "Clean lines, geometric shapes" },
  { label: "Classic", desc: "Timeless, refined elegance" },
  { label: "Playful", desc: "Fun, colorful, approachable" },
  { label: "Bold", desc: "Strong, impactful, confident" },
  { label: "Minimal", desc: "Simple, understated, sleek" },
  { label: "Elegant", desc: "Luxurious, sophisticated feel" },
];

const COLOR_PALETTES = [
  { name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Sunset", colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89"] },
  { name: "Forest", colors: ["#2D6A4F", "#52B788", "#95D5B2", "#D8F3DC"] },
  { name: "Midnight", colors: ["#10002B", "#240046", "#5A189A", "#9D4EDD"] },
  { name: "Monochrome", colors: ["#000000", "#333333", "#888888", "#FFFFFF"] },
  { name: "Coral", colors: ["#FF6B6B", "#EE6C4D", "#F4845F", "#F7B267"] },
  { name: "Earth", colors: ["#6B4226", "#A67C52", "#C4A77D", "#E8D5B7"] },
  { name: "Neon", colors: ["#08F7FE", "#09FBD3", "#FE53BB", "#F5D300"] },
];

const USE_CASES = [
  { label: "Website", icon: "🌐" },
  { label: "Social Media", icon: "📱" },
  { label: "Business Cards", icon: "🪪" },
  { label: "Merchandise", icon: "👕" },
  { label: "App Icon", icon: "📲" },
  { label: "Packaging", icon: "📦" },
  { label: "Email Signature", icon: "✉️" },
  { label: "Presentations", icon: "📊" },
  { label: "Signage", icon: "🪧" },
];

const WELCOME = {
  headline: "Let's create your logo",
  sub: "Answer a few quick questions so we can design a logo that's uniquely yours.",
  cta: "Get Started →",
};

const FOOTER = {
  tagline: "Pro logos. Brand kits. Stunning results.",
  links: ["About", "Contact", "Press", "Privacy", "Terms"],
  copy: "\u00a9 2026 Logo.ai",
  disclaimer:
    "Logo.ai is an independent service. Not affiliated with any other company.",
};

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface FormData {
  businessName: string;
  industry: string;
  logoStyles: string[];
  colorPalette: string;
  useCases: string[];
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

/* ═══════════════════════════════════════════
   STEP COMPONENTS
   ═══════════════════════════════════════════ */

function StepWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="ob-welcome">
      <h1>{WELCOME.headline}</h1>
      <p className="ob-welcome-sub">{WELCOME.sub}</p>
      <button type="button" className="ob-btn-next" onClick={onStart}>
        {WELCOME.cta}
      </button>
    </div>
  );
}

function StepBusinessInfo({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}) {
  return (
    <div>
      <div className="ob-step-tag">Step 1 of 4</div>
      <h2 className="ob-step-title">Tell us about your business</h2>

      <input
        className="ob-input"
        type="text"
        placeholder="Your business name"
        value={formData.businessName}
        onChange={(e) => onChange({ businessName: e.target.value })}
        autoFocus
      />

      <div className="ob-grid-label">Industry</div>
      <div className="ob-select-grid cols-4">
        {INDUSTRIES.map((item) => (
          <div
            key={item.label}
            className={`ob-select-card${formData.industry === item.label ? " selected" : ""}`}
            onClick={() => onChange({ industry: item.label })}
          >
            <div className="ob-select-card-icon">{item.icon}</div>
            <div className="ob-select-card-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepStylePrefs({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}) {
  const toggleStyle = (style: string) => {
    const current = formData.logoStyles;
    if (current.includes(style)) {
      onChange({ logoStyles: current.filter((s) => s !== style) });
    } else {
      onChange({ logoStyles: [...current, style] });
    }
  };

  return (
    <div>
      <div className="ob-step-tag">Step 2 of 4</div>
      <h2 className="ob-step-title">Choose your style</h2>

      <div className="ob-grid-label">Logo Style (select one or more)</div>
      <div className="ob-select-grid cols-3">
        {LOGO_STYLES.map((item) => (
          <div
            key={item.label}
            className={`ob-select-card${formData.logoStyles.includes(item.label) ? " selected" : ""}`}
            onClick={() => toggleStyle(item.label)}
          >
            <span className="ob-checkmark">✓</span>
            <div className="ob-select-card-label">{item.label}</div>
            <div className="ob-select-card-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="ob-grid-label" style={{ marginTop: 32 }}>
        Color Palette
      </div>
      <div className="ob-palette-grid">
        {COLOR_PALETTES.map((palette) => (
          <div
            key={palette.name}
            className={`ob-palette-option${formData.colorPalette === palette.name ? " selected" : ""}`}
            onClick={() => onChange({ colorPalette: palette.name })}
          >
            <div className="ob-palette-swatches">
              {palette.colors.map((color) => (
                <div
                  key={color}
                  className="ob-palette-swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="ob-palette-name">{palette.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepUseCase({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}) {
  const toggleUseCase = (useCase: string) => {
    const current = formData.useCases;
    if (current.includes(useCase)) {
      onChange({ useCases: current.filter((u) => u !== useCase) });
    } else {
      onChange({ useCases: [...current, useCase] });
    }
  };

  return (
    <div>
      <div className="ob-step-tag">Step 3 of 4</div>
      <h2 className="ob-step-title">Where will you use your logo?</h2>

      <div className="ob-grid-label">Select all that apply</div>
      <div className="ob-select-grid cols-3">
        {USE_CASES.map((item) => (
          <div
            key={item.label}
            className={`ob-select-card${formData.useCases.includes(item.label) ? " selected" : ""}`}
            onClick={() => toggleUseCase(item.label)}
          >
            <span className="ob-checkmark">✓</span>
            <div className="ob-select-card-icon">{item.icon}</div>
            <div className="ob-select-card-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCompletion({ formData }: { formData: FormData }) {
  return (
    <div className="ob-completion">
      <div className="ob-success-icon">
        <svg viewBox="0 0 32 32">
          <path d="M8 16l6 6 10-12" />
        </svg>
      </div>
      <h1>You&apos;re all set!</h1>
      <p className="ob-completion-sub">
        We&apos;ve saved your preferences. Your custom logo experience is being
        prepared.
      </p>

      <div className="ob-summary">
        <div className="ob-summary-title">Your Profile</div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Business</span>
          <span className="ob-summary-value">{formData.businessName}</span>
        </div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Industry</span>
          <span className="ob-summary-value">{formData.industry}</span>
        </div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Styles</span>
          <span className="ob-summary-value">
            {formData.logoStyles.join(", ")}
          </span>
        </div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Palette</span>
          <span className="ob-summary-value">{formData.colorPalette}</span>
        </div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Use Cases</span>
          <span className="ob-summary-value">
            {formData.useCases.join(", ")}
          </span>
        </div>
      </div>

      <p className="ob-dashboard-note">
        Your dashboard is coming soon. We&apos;ll notify you when it&apos;s
        ready.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════ */

function ProgressBar({ currentStep }: { currentStep: number }) {
  const totalSteps = 5;

  return (
    <div className="ob-progress">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`ob-progress-dot${i === currentStep ? " active" : ""}${i < currentStep ? " completed" : ""}`}
          />
          {i < totalSteps - 1 && (
            <div
              className={`ob-progress-line${i < currentStep ? " completed" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    industry: "",
    logoStyles: [],
    colorPalette: "",
    useCases: [],
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return formData.businessName.trim().length > 0 && formData.industry.length > 0;
      case 2:
        return formData.logoStyles.length > 0 && formData.colorPalette.length > 0;
      case 3:
        return formData.useCases.length > 0;
      default:
        return true;
    }
  };

  const submitProfile = async () => {
    setSubmitStatus("loading");
    setSubmitError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setSubmitError(data?.error || "Something went wrong. Please try again.");
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setDirection("forward");
      setCurrentStep(4);
    } catch {
      setSubmitError("Network error. Please try again in a moment.");
      setSubmitStatus("error");
    }
  };

  const goNext = () => {
    if (!isStepValid(currentStep)) return;

    if (currentStep === 3) {
      submitProfile();
      return;
    }

    setDirection("forward");
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep <= 0) return;
    setDirection("back");
    setSubmitStatus("idle");
    setSubmitError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const stepAnimClass = direction === "back" ? "ob-step ob-step-back" : "ob-step";

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
          <ProgressBar currentStep={currentStep} />

          {/* Step Content */}
          <div className="ob-step-wrapper">
            <div className={stepAnimClass} key={currentStep}>
              {currentStep === 0 && <StepWelcome onStart={goNext} />}
              {currentStep === 1 && (
                <StepBusinessInfo formData={formData} onChange={updateFormData} />
              )}
              {currentStep === 2 && (
                <StepStylePrefs formData={formData} onChange={updateFormData} />
              )}
              {currentStep === 3 && (
                <StepUseCase formData={formData} onChange={updateFormData} />
              )}
              {currentStep === 4 && <StepCompletion formData={formData} />}
            </div>
          </div>

          {/* Nav Buttons */}
          {currentStep > 0 && currentStep < 4 && (
            <div className="ob-nav-buttons">
              <button type="button" className="ob-btn-back" onClick={goBack}>
                ← Back
              </button>
              <button
                type="button"
                className="ob-btn-next"
                onClick={goNext}
                disabled={!isStepValid(currentStep) || submitStatus === "loading"}
              >
                {submitStatus === "loading" ? (
                  <>
                    <span className="ob-loading-spinner" />
                    Saving...
                  </>
                ) : currentStep === 3 ? (
                  "Complete →"
                ) : (
                  "Next →"
                )}
              </button>
            </div>
          )}

          {/* Error from submission */}
          {submitStatus === "error" && submitError && (
            <div className="ob-error">{submitError}</div>
          )}
        </div>
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
