import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const TEXT_MODEL = "anthropic/claude-opus-4.6" as const;

const LOGO_TYPE_LABELS: Record<string, string> = {
  wordmark: "wordmark (text-only, stylized typography, no icons)",
  lettermark: "lettermark (initials/monogram inside a geometric shape)",
  icon_text: "icon + text (meaningful symbol on the left, brand name on the right)",
  combination_mark: "combination mark (icon and brand name that function together and separately)",
  brandmark: "brandmark (standalone symbolic icon with no text, instantly recognizable)",
  emblem: "emblem (brand name inside a decorative badge or seal)",
  abstract: "abstract mark (unique geometric or abstract shape with brand name)",
  mascot: "mascot (friendly character or creature with brand name)",
};

/* ═══════════════════════════════════════════
   STEP 1: GENERATE N UNIQUE PROMPTS (Claude Opus 4.6)
   ═══════════════════════════════════════════ */

async function generatePrompts(
  replicate: Replicate,
  businessName: string,
  description: string,
  tagline: string,
  colors: string[],
  impressionWords: string[],
  logoTypes: string[],
  products: string[],
  count: number,
): Promise<string[]> {
  const c1 = colors[0] || "#4F46E5";
  const c2 = colors[1] || "#7C3AED";
  const c3 = colors[2] || "#1E293B";
  const personality = impressionWords.length ? impressionWords.join(", ") : "professional, modern";

  const typeDescriptions = logoTypes.map((t, i) => {
    const label = LOGO_TYPE_LABELS[t] || LOGO_TYPE_LABELS.combination_mark;
    return `Prompt ${i + 1}: ${label}`;
  }).join("\n");

  const systemPrompt = `You are LogoForge AI, an expert logo prompt engineer. You generate image generation prompts for creating professional brand logos. Each prompt must be unique, creative, and highly detailed — describing specific visual elements, shapes, composition, and styling. Output ONLY a JSON array of exactly ${count} strings. No markdown, no explanation, just the JSON array.`;

  const userPrompt = `Generate ${count} unique, detailed image-generation prompts for logo designs for "${businessName}".

BRAND DATA:
- Business: ${description || "A professional business"}
- Tagline: ${tagline || "none"}
- Products/Services: ${products.length ? products.join(", ") : "general services"}
- Brand personality: ${personality}
COLORS (use these EXACT hex codes in every prompt):
- Primary: ${c1} (dominant brand color — main icon, primary text)
- Secondary: ${c2} (supporting color — accent shapes, tagline)
- Accent: ${c3} (pop color — highlights, small details)
- Background: White #FFFFFF (always)

LOGO TYPES — assign each prompt one of these types:
${typeDescriptions}

PROMPT RULES:
1. Each prompt must be 80-150 words of flowing, descriptive prose
2. Describe SPECIFIC visual elements: exact shapes, icon concepts, typography choices, spatial layout
3. Each prompt must feel completely different — different icon concepts, different compositions, different creative directions
4. Include the brand name "${businessName}" and specify where it appears
5. Reference ALL 3 brand colors by hex code + white background
6. End each prompt with: "Flat design, no gradients, no 3D effects, no shadows, clean white background, vector-quality, sharp crisp edges."
7. Make each prompt CREATIVE and UNIQUE — don't just swap adjectives, design genuinely different logo concepts
8. For brandmark: NO text at all, standalone symbol only
9. For wordmark: NO icon, typography IS the design
10. For emblem: everything sits INSIDE a containing shape

Return ONLY a JSON array of exactly ${count} prompt strings.`;

  const output = await replicate.run(TEXT_MODEL, {
    input: {
      system_prompt: systemPrompt,
      prompt: userPrompt,
      max_tokens: count * 600,
      temperature: 0.9,
    },
  });

  const content = Array.isArray(output) ? output.join("") : String(output);
  const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
  const prompts = JSON.parse(cleaned);

  if (!Array.isArray(prompts) || prompts.length < count) {
    throw new Error(`Claude returned ${Array.isArray(prompts) ? prompts.length : 0} prompts, expected ${count}`);
  }

  return prompts.slice(0, count);
}

/* ═══════════════════════════════════════════
   SUPABASE STORAGE UPLOAD
   ═══════════════════════════════════════════ */

async function uploadToSupabaseStorage(
  imageBuffer: Uint8Array,
  userId: string,
  logoType: string,
  variantIndex: number,
  contentType: string,
  extension: string,
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("AI Logo: Supabase credentials missing for storage upload");
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const timestamp = Date.now();
  const filePath = `${userId}/${logoType}-v${variantIndex}-${timestamp}.${extension}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(filePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("AI Logo: Supabase storage upload failed:", error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* ═══════════════════════════════════════════
   REPLICATE (GOOGLE NANO-BANANA)
   ═══════════════════════════════════════════ */

async function generateWithNanoBanana(replicate: Replicate, prompt: string): Promise<string | null> {
  try {
    console.log("AI Logo [Nano-Banana]: Starting generation...");

    const output = await replicate.run("google/nano-banana", {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "png",
      },
    });

    if (!output) {
      console.error("AI Logo [Nano-Banana]: Output is null/undefined");
      return null;
    }

    // FileOutput.toString() returns the URL href string
    let imageUrl: string | null = null;

    if (output && typeof (output as any).toString === "function" && String(output).startsWith("http")) {
      imageUrl = String(output);
    } else if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === "string") {
        imageUrl = first;
      } else if (first && String(first).startsWith("http")) {
        imageUrl = String(first);
      }
    } else if (typeof output === "string") {
      imageUrl = output;
    }

    if (!imageUrl) {
      console.error("AI Logo [Nano-Banana]: Could not extract image URL from output");
      return null;
    }

    return imageUrl;
  } catch (err) {
    console.error("AI Logo [Nano-Banana]: Error:", err);
    return null;
  }
}

/* ═══════════════════════════════════════════
   IMAGE → SVG CONVERTER
   ═══════════════════════════════════════════ */

async function convertImageToSvg(imageUrl: string): Promise<{ svgString: string; pngBuffer: Uint8Array } | null> {
  try {
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      console.error(`AI Logo: Failed to download image (${imgResponse.status})`);
      return null;
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const pngBuffer = new Uint8Array(arrayBuffer);

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="white" rx="16"/>
  <image href="${dataUri}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

    return { svgString, pngBuffer };
  } catch (err) {
    console.error("AI Logo: Image to SVG conversion failed:", err);
    return null;
  }
}

/* ═══════════════════════════════════════════
   POST HANDLER
   Mode 1 (promptsOnly): Generate N prompts only
   Mode 2 (default): Generate images from prompts
   ═══════════════════════════════════════════ */

interface AILogoPayload {
  businessName?: string;
  tagline?: string;
  colors?: string[];
  impressionWords?: string[];
  logoTypes?: string[];
  description?: string;
  products?: string[];
  promptCount?: number;
  promptsOnly?: boolean;
  existingPrompts?: string[];
}

interface LogoResult {
  type: string;
  svg: string | null;
  imageUrl: string | null;
  prompt: string;
  fallback: boolean;
}

export async function POST(request: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  let payload: AILogoPayload = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const {
    businessName = "Brand",
    tagline = "",
    colors = ["#4F46E5", "#7C3AED"],
    impressionWords = [],
    logoTypes = ["combination_mark", "wordmark", "lettermark", "emblem", "abstract"],
    description = "",
    products = [],
    promptCount = 5,
    promptsOnly = false,
    existingPrompts,
  } = payload;

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN not configured." },
      { status: 500 },
    );
  }

  const replicate = new Replicate({ auth: replicateToken });

  try {
    // ── MODE 1: Prompts only (no image generation) ──
    if (promptsOnly) {
      const count = Math.min(Math.max(promptCount, 1), 20);
      console.log(`AI Logo: Generating ${count} prompts via Claude Opus 4.6...`);
      const prompts = await generatePrompts(
        replicate, businessName, description, tagline, colors,
        impressionWords, logoTypes, products, count,
      );
      console.log(`AI Logo: ${prompts.length} prompts generated successfully`);

      return NextResponse.json({
        prompts: prompts.map((prompt, i) => ({
          type: logoTypes[i] || "combination_mark",
          prompt,
        })),
      });
    }

    // ── MODE 2: Generate images (use existing prompts or generate new ones) ──
    let prompts: string[];
    if (existingPrompts && existingPrompts.length > 0) {
      prompts = existingPrompts;
      console.log(`AI Logo: Using ${prompts.length} existing prompts for image generation`);
    } else {
      const count = Math.min(Math.max(logoTypes.length, 1), 20);
      console.log(`AI Logo: Generating ${count} prompts via Claude Opus 4.6...`);
      prompts = await generatePrompts(
        replicate, businessName, description, tagline, colors,
        impressionWords, logoTypes, products, count,
      );
      console.log(`AI Logo: ${prompts.length} prompts generated successfully`);
    }

    console.log(`AI Logo: Starting ${prompts.length} parallel Nano-Banana generations...`);
    const results: LogoResult[] = await Promise.all(
      prompts.map(async (prompt, i) => {
        const type = logoTypes[i] || "combination_mark";

        try {
          const tempImageUrl = await generateWithNanoBanana(replicate, prompt);

          if (tempImageUrl) {
            const converted = await convertImageToSvg(tempImageUrl);

            if (converted) {
              const permanentPngUrl = await uploadToSupabaseStorage(
                converted.pngBuffer, userId, type, i, "image/png", "png",
              );

              const svgBuffer = new TextEncoder().encode(converted.svgString);
              const permanentSvgUrl = await uploadToSupabaseStorage(
                svgBuffer, userId, type, i, "image/svg+xml", "svg",
              );

              return {
                type,
                svg: converted.svgString,
                imageUrl: permanentPngUrl || permanentSvgUrl || null,
                prompt,
                fallback: false,
              };
            }
          }
        } catch (err) {
          console.error(`AI Logo: Variant ${i} (${type}) failed:`, err);
        }

        // Fallback for this variant
        return { type, svg: null, imageUrl: null, prompt, fallback: true };
      }),
    );

    console.log(`AI Logo: All ${results.length} variants complete`);
    return NextResponse.json({ logos: results });
  } catch (error) {
    console.error("AI Logo: Generation failed:", error);

    if (promptsOnly) {
      return NextResponse.json(
        { error: "Failed to generate prompts. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      logos: logoTypes.map((type) => ({
        type,
        svg: null,
        imageUrl: null,
        prompt: "",
        fallback: true,
      })),
    });
  }
}
