// app/api/ai-suggest/route.ts
// AI-powered suggestion engine for Logo.ai onboarding
// Prompts follow LogoForge AI system prompt rules

import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let parsedField = "description";

  try {
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
    const maxTokens = isColorPalettes ? 1200 : field === "impressionWords" ? 800 : 1500;

    const response = await fetch(
      process.env.VERCEL_AI_GATEWAY_URL || "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VERCEL_AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          temperature: 0.85,
          max_tokens: maxTokens,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0].message.content;

    // Clean and parse
    const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
    const suggestions = JSON.parse(cleaned);

    if (isColorPalettes) {
      return NextResponse.json({
        suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [],
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
    console.error("AI Gateway error:", error);

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
    };

    return NextResponse.json({
      suggestions: fallbacks[parsedField] || fallbacks.description,
      fallback: true,
    });
  }
}
