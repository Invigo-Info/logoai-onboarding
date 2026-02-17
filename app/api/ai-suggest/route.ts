// app/api/ai-suggest/route.ts
// AI-powered suggestion engine for Logo.ai onboarding
// Uses Replicate (Claude Opus 4.6) — same API key as logo generation
// Prompts follow LogoForge AI system prompt rules

import { NextResponse, NextRequest } from "next/server";
import Replicate from "replicate";

const TEXT_MODEL = "anthropic/claude-opus-4.6" as const;

export async function POST(request: NextRequest) {
  let parsedField = "description";

  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      throw new Error("REPLICATE_API_TOKEN not set");
    }

    const { field, context } = await request.json() as {
      field: string;
      context: { businessName: string; description?: string; products?: string[]; impressionWords?: string[] };
    };
    parsedField = field;
    const { businessName, description, products, impressionWords } = context;

    const isColorPalettes = field === "colorPalettes";

    /* ═══════════════════════════════════════════
       PROMPTS — per LogoForge AI PDF rules
       ═══════════════════════════════════════════ */

    const prompts: Record<string, string> = {
      // STEP 2: Business Description
      // PDF: "Generate 10 AI suggestions based on the business name alone.
      // Analyze the brand name for linguistic cues (keywords, word roots,
      // compound words, emotional tone, industry associations)."
      description: `Generate exactly 10 unique, creative business descriptions for a company called "${businessName}".

Analyze the brand name for linguistic cues — keywords, word roots, compound words, emotional tone, and industry associations. Use naming patterns, industry inference, and common business types to predict likely descriptions.

Examples of how to analyze:
- If "Bloom" is in the name → suggest floral, beauty, growth businesses
- If "Tech" or "Logic" is in the name → suggest software, IT, SaaS businesses
- If the name is playful → suggest kid-friendly or casual businesses
- Cast a wide but intelligent net

Each description should be 4-8 words — a short, clear statement of what the business does. Not a marketing tagline — a factual description.

Return ONLY a JSON array of exactly 10 strings, no other text.`,

      // STEP 3: Products & Services
      // PDF: "Generate 10-15 individual services listed one per line based on
      // business name + description. Each line is a SINGLE service — not bundled."
      products: `Based on "${businessName}" — ${description || "a professional services business"}, suggest exactly 12 specific products or services this business might offer.

RULES:
- Each item is a SINGLE specific service — NOT a comma-separated group
- 1-4 words per service
- Include both core services and premium/niche offerings
- Order from most common to most specialized
- Use research-level knowledge of what businesses in this industry actually offer

CORRECT format: "Deep cleaning" (single service)
WRONG format: "Regular cleaning, deep cleaning, move-in/out" (bundled — never do this)

Return ONLY a JSON array of exactly 12 strings, no other text.`,

      // STEP 4: Tagline
      // PDF: "Generate 10 AI suggestions using brand name + description + services.
      // 2-7 words, punchy, rhythmic, and memorable."
      tagline: `Generate exactly 10 unique, memorable taglines for "${businessName}".
${description ? `Business: ${description}` : ""}
${products?.length ? `Core services: ${products.join(", ")}` : ""}

TAGLINE RULES:
- Each tagline must be 2-7 words
- Punchy, rhythmic, and memorable
- Use proven tagline structures:
  • Verb + Object ("Brewed for the Journey")
  • We/You parallel ("We Clean. You Shine.")
  • Adjective + Noun promise ("Fresh Paws. Happy Tails.")
  • Aspirational statement ("Big Adventures for Little Ones")
  • Rhyme or alliteration when natural
  • Industry-specific wordplay
  • Emotional benefit, not feature list

Return ONLY a JSON array of exactly 10 strings, no other text.`,

      // STEP 5: Impression Words
      // PDF: "Generate 15-20 individual impression words from two archetypes.
      // Archetype A: Pure/Reliable/Warm. Archetype B: Healthy/Modern/Caring."
      impressionWords: `Generate exactly 18 brand personality impression words for "${businessName}" — ${description || "a professional services business"}.
${products?.length ? `Services: ${products.join(", ")}` : ""}

CRITICAL RULES — follow this structure exactly:

Words 1-6: Draw from Archetype A (Pure, Reliable, Warm territory)
Word pool: Pure, Reliable, Warm, Clean, Trustworthy, Dependable, Honest, Steady, Genuine, Safe, Solid, Comforting, Grounded, Wholesome, Consistent, Faithful

Words 7-12: Draw from Archetype B (Healthy, Modern, Caring territory)
Word pool: Healthy, Modern, Caring, Fresh, Contemporary, Nurturing, Progressive, Attentive, Vibrant, Smart, Forward-thinking, Thoughtful, Energetic, Compassionate, Bright, Dynamic

Words 13-15: Blended words that bridge both archetypes

Words 16-18: Industry-specific words that still lean toward these territories
(e.g. tech: Streamlined, Innovative, Intuitive; food: Wholesome, Delicious, Inviting; cleaning: Spotless, Sparkling, Refreshing)

NEVER include these types of words:
- Aggressive: Disruptive, Edgy, Provocative, Fierce, Dominant
- Cold/Elitist: Luxurious, Exclusive, Elite, Premium, Opulent
- Unfocused: Quirky, Wacky, Offbeat, Random, Weird
- Devaluing: Cheap, Bargain, Budget, Discount, Basic

Each word is a SINGLE adjective — not grouped, not paired.

Return ONLY a JSON array of exactly 18 strings, no other text.`,

      // STEP 7: Logo Types (AI-ranked by industry)
      logoTypes: `You are a professional brand strategist. Analyze the business and determine the best logo layout options.

Business: "${businessName}" — ${description || "a professional services business"}
${products?.length ? `Services: ${products.join(", ")}` : ""}

Determine the industry category, then generate 7 logo type options ranked by how frequently they are used in that specific industry.

Use these exact logo type IDs and definitions:
- combination_mark: Combination Mark — Icon paired with brand name. Most versatile and widely adaptable.
- wordmark: Wordmark (Logotype) — Brand name only, styled typography. Clean and strong for name recognition.
- lettermark: Lettermark (Monogram) — Initials only. Professional and compact.
- brandmark: Brandmark (Symbol Only) — Icon only. Requires strong recognition.
- emblem: Emblem — Text inside a badge, seal, or crest. Traditional and bold.
- mascot: Mascot — Character-based logo. Friendly and memorable.
- abstract: Abstract Mark — Geometric, non-literal symbol. Modern and unique.

If the industry matches one of these, use these exact distributions:
- Restaurants/Food: emblem 30, combination_mark 25, wordmark 20, mascot 15, brandmark 5, abstract 3, lettermark 2
- Tech/SaaS: wordmark 35, abstract 20, combination_mark 20, lettermark 15, brandmark 5, emblem 3, mascot 2
- Children/Education: mascot 35, combination_mark 30, wordmark 15, emblem 10, brandmark 5, abstract 3, lettermark 2
- Cleaning/Home Services: combination_mark 40, wordmark 20, emblem 15, mascot 10, brandmark 8, abstract 5, lettermark 2
- Pet Services: combination_mark 35, mascot 25, emblem 15, wordmark 10, brandmark 8, abstract 5, lettermark 2
- Fitness/Gym: emblem 30, combination_mark 25, wordmark 20, abstract 10, brandmark 8, lettermark 5, mascot 2
- Law/Finance: wordmark 35, lettermark 25, combination_mark 20, emblem 10, abstract 5, brandmark 3, mascot 2
- Beauty/Wellness: wordmark 30, combination_mark 25, abstract 15, emblem 15, brandmark 8, lettermark 5, mascot 2
- Coffee/Café: emblem 35, combination_mark 30, wordmark 15, mascot 10, brandmark 5, abstract 3, lettermark 2

For industries not listed, use realistic market judgment. Percentages MUST add up to exactly 100.

For each type, write 1 clear sentence explaining what it is and why it works for this specific industry.

Return ONLY a JSON array of exactly 7 objects sorted by percent descending, each with:
- "id": the logo type ID from the list above
- "label": the display name
- "percent": integer percentage (all 7 must sum to exactly 100)
- "description": 1 sentence explaining why this type works for this industry

No markdown, no explanation, just the JSON array.`,

      // STEP 6: Color Palettes
      // PDF: "Generate 5 AI color combination suggestions. Each has exactly 3
      // brand colors. White is NOT in the palette — always the background."
      colorPalettes: `Generate 5 professional brand color palettes for "${businessName}" — ${description || "a professional services business"}.
${products?.length ? `Services: ${products.join(", ")}` : ""}
${impressionWords?.length ? `Brand personality: ${impressionWords.join(", ")}` : ""}

COLOR PALETTE RULES:
1. Every palette has EXACTLY 3 colors. No more, no less.
2. White #FFFFFF is NEVER one of the 3. It is always the background — separate, assumed, not part of the brand palette.
3. The 3 colors serve these roles:
   - Color 1 (Primary): The dominant brand color — main icon shape, primary text, largest visual elements. Carries the brand's core emotional weight.
   - Color 2 (Secondary): The supporting color — accent elements, secondary shapes, tagline, supporting details. Complements the primary.
   - Color 3 (Accent): The pop color — sparkles, highlights, small detail elements, energy moments. Creates contrast and visual interest.
4. All 3 colors must have strong contrast against a white background.
5. No two colors in a palette should be too similar (e.g., don't pair two shades of blue).
6. Every hex code must be a real, tested, usable color.

Color psychology mapping:
- Trust/corporate → blues, navy, deep teal
- Energy/youth → bright orange, electric yellow, coral
- Eco/health → greens, sage, earth tones
- Luxury/premium → deep purple, burgundy, gold, charcoal
- Playful/kids → primary brights, pastels
- Clean/medical → light blues, teal, mint, soft gray
- Food/warmth → warm reds, oranges, creams, browns
- Tech/modern → electric blue, slate, violet, neon accents

For each palette return a JSON object with:
- "name": creative palette name (e.g. "Ocean Trust", "Sunset Energy")
- "colors": array of exactly 3 hex strings [primary, secondary, accent]
- "rationale": 1 sentence explaining why this palette works for the brand — mention the color roles
- "industryMatch": 1-2 word industry category

Return ONLY a JSON array of exactly 5 objects, no other text.`,
    };

    /* ═══════════════════════════════════════════
       SYSTEM MESSAGES
       ═══════════════════════════════════════════ */

    let systemMessage: string;

    if (isColorPalettes) {
      systemMessage = "You are LogoForge AI, an expert brand identity consultant with deep knowledge of color psychology, industry trends, and visual identity systems. Always respond with ONLY a valid JSON array of exactly 5 objects. Each object has: name (string), colors (array of exactly 3 hex strings — never include white #FFFFFF as a brand color), rationale (string), industryMatch (string). No markdown, no explanation, just the JSON array.";
    } else if (field === "logoTypes") {
      systemMessage = "You are LogoForge AI, an expert brand strategist with deep knowledge of logo design trends across every industry. Analyze the business and determine the best logo layout options ranked by industry usage frequency. Always respond with ONLY a valid JSON array of exactly 7 objects sorted by percent descending. Each object has: id (string), label (string), percent (integer, all 7 must sum to 100), description (string). No markdown, no explanation, just the JSON array.";
    } else if (field === "impressionWords") {
      systemMessage = "You are LogoForge AI, an expert brand strategist. Generate brand personality words from two proven archetypes: Archetype A (Pure/Reliable/Warm) and Archetype B (Healthy/Modern/Caring). NEVER suggest aggressive, cold/elitist, unfocused, or devaluing words. Always respond with ONLY a valid JSON array of strings. No markdown, no explanation, just the JSON array.";
    } else if (field === "products") {
      systemMessage = "You are LogoForge AI, an expert brand consultant with research-level knowledge of what businesses in every industry actually offer. Each service you suggest is a SINGLE specific offering — never bundled or comma-separated. Always respond with ONLY a valid JSON array of strings. No markdown, no explanation, just the JSON array.";
    } else if (field === "tagline") {
      systemMessage = "You are LogoForge AI, an expert brand identity consultant who creates punchy, rhythmic, memorable taglines. Each tagline is 2-7 words using proven structures: Verb+Object, We/You parallel, Adjective+Noun promise, aspirational statements, alliteration, or industry wordplay. Focus on emotional benefit, not feature lists. Always respond with ONLY a valid JSON array of exactly 10 strings. No markdown, no explanation, just the JSON array.";
    } else {
      systemMessage = "You are LogoForge AI, an expert brand identity consultant. Analyze the brand name for linguistic cues — keywords, word roots, compound words, emotional tone, and industry associations. Use naming patterns and industry inference to predict likely business descriptions. Always respond with ONLY a valid JSON array of exactly 10 strings. No markdown, no explanation, just the JSON array.";
    }

    const prompt = prompts[field] || prompts.description;
    // Claude Opus 4.6 on Replicate requires min 1024 tokens
    const maxTokens = isColorPalettes ? 1200 : field === "logoTypes" ? 1500 : field === "impressionWords" ? 1024 : 1500;

    /* ═══════════════════════════════════════════
       REPLICATE (META LLAMA) CALL
       ═══════════════════════════════════════════ */

    const replicate = new Replicate({ auth: replicateToken });

    const output = await replicate.run(TEXT_MODEL, {
      input: {
        system_prompt: systemMessage,
        prompt,
        max_tokens: maxTokens,
        temperature: 0.85,
      },
    });

    // Replicate LLM models return an array of string tokens — join them
    const content = Array.isArray(output) ? output.join("") : String(output);

    // Clean and parse
    const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
    const suggestions = JSON.parse(cleaned);

    if (isColorPalettes) {
      return NextResponse.json({
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [],
      });
    }

    if (field === "logoTypes") {
      return NextResponse.json({
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 7) : [],
      });
    }

    if (field === "impressionWords") {
      return NextResponse.json({
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 18) : [],
      });
    }

    if (field === "products") {
      return NextResponse.json({
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 12) : [],
      });
    }

    return NextResponse.json({
      suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 10) : [],
    });
  } catch (error) {
    console.error("AI Suggest error:", error);

    // Fallback suggestions following PDF archetype rules
    const fallbacks: Record<string, unknown[]> = {
      description: [
        "Innovative solutions for modern businesses",
        "Transforming ideas into impactful results",
        "Your trusted partner in digital excellence",
        "Empowering brands with cutting-edge technology",
        "Building the future of creative entrepreneurship",
        "Delivering premium services with a personal touch",
        "Helping businesses scale with smart, efficient tools",
        "Redefining industry standards through bold innovation",
        "Where creativity meets strategy for lasting impact",
        "Crafting meaningful experiences that drive growth",
      ],
      tagline: [
        "Think Different, Build Better",
        "Where Vision Meets Reality",
        "Crafted for Excellence",
        "Innovation Without Limits",
        "Your Success, Our Mission",
        "Bold Ideas, Real Results",
        "Designed to Inspire",
        "Beyond Ordinary",
        "Elevate Everything",
        "Future-Ready Solutions",
      ],
      products: [
        "Digital Strategy",
        "Brand Identity",
        "Web Development",
        "Content Marketing",
        "Social Media Management",
        "UI/UX Design",
        "Mobile App Development",
        "SEO & Analytics",
        "Cloud Infrastructure",
        "Business Consulting",
        "Email Marketing",
        "Data Analytics",
      ],
      // Fallback follows Archetype A (1-6) + Archetype B (7-12) + Blended (13-15) + Industry (16-18)
      impressionWords: [
        "Pure", "Reliable", "Warm", "Trustworthy", "Genuine", "Dependable",
        "Modern", "Fresh", "Caring", "Vibrant", "Smart", "Progressive",
        "Grounded", "Bright", "Attentive",
        "Innovative", "Streamlined", "Intuitive",
      ],
      colorPalettes: [
        { name: "Professional Blue", colors: ["#1E3A5F", "#4A90D9", "#F5A623"], rationale: "Navy primary conveys trust, blue secondary supports clarity, amber accent adds energy", industryMatch: "Corporate" },
        { name: "Modern Mint", colors: ["#059669", "#34D399", "#1E293B"], rationale: "Emerald primary feels fresh and healthy, mint secondary is contemporary, dark accent grounds it", industryMatch: "Technology" },
        { name: "Bold Coral", colors: ["#DC2626", "#FB923C", "#1E293B"], rationale: "Red primary commands attention, orange secondary adds warmth, charcoal accent balances", industryMatch: "Creative" },
        { name: "Royal Violet", colors: ["#7C3AED", "#A855F7", "#D97706"], rationale: "Deep violet primary feels creative, lighter purple supports it, gold accent adds warmth", industryMatch: "Premium" },
        { name: "Earthy Warmth", colors: ["#B8860B", "#166534", "#2D1B00"], rationale: "Gold primary feels organic, forest green secondary is natural, dark brown accent grounds", industryMatch: "Lifestyle" },
      ],
      logoTypes: [
        { id: "combination_mark", label: "Combination Mark", percent: 35, description: "Icon paired with brand name — the most versatile and widely adaptable logo format." },
        { id: "wordmark", label: "Wordmark", percent: 25, description: "Brand name only with styled typography — clean and strong for name recognition." },
        { id: "emblem", label: "Emblem", percent: 15, description: "Text inside a badge, seal, or crest — traditional and bold for established brands." },
        { id: "lettermark", label: "Lettermark", percent: 10, description: "Initials or monogram — professional and compact for long business names." },
        { id: "brandmark", label: "Brandmark", percent: 7, description: "Standalone symbol without text — requires strong brand recognition." },
        { id: "abstract", label: "Abstract Mark", percent: 5, description: "Geometric or abstract symbol — modern and unique for differentiation." },
        { id: "mascot", label: "Mascot", percent: 3, description: "Character-based illustrated logo — friendly and memorable for approachable brands." },
      ],
    };

    return NextResponse.json({
      suggestions: fallbacks[parsedField] || fallbacks.description,
      fallback: true,
    });
  }
}
