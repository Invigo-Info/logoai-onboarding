import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/* ═══════════════════════════════════════════
   PROMPT BUILDER
   ═══════════════════════════════════════════ */

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

const NAME_STYLE_LABELS: Record<string, string> = {
  modern: "clean sans-serif, contemporary and minimal",
  classic: "serif typeface, traditional and elegant",
  playful: "rounded letterforms, friendly and approachable",
  bold: "heavy weight, high-impact and commanding",
};

const VARIANT_MOODS = [
  "clean, balanced, and professional",
  "alternative layout, experimental composition",
  "bold, impactful, strong visual weight",
  "minimal, refined, lots of whitespace",
];

function buildFluxPrompt(
  businessName: string,
  tagline: string,
  colors: string[],
  impressionWords: string[],
  logoType: string,
  variantIndex: number,
  description?: string,
  businessNameStyle?: string,
): string {
  const typeLabel = LOGO_TYPE_LABELS[logoType] || LOGO_TYPE_LABELS.icon_text;
  const mood = VARIANT_MOODS[variantIndex] || VARIANT_MOODS[0];
  const c1 = colors[0] || "#4F46E5";
  const c2 = colors[1] || "#7C3AED";
  const c3 = colors[2] || "#1E293B";
  const personality = impressionWords.length ? impressionWords.join(", ") : "professional, modern";
  const nameStyle = businessNameStyle ? (NAME_STYLE_LABELS[businessNameStyle] || "clean sans-serif") : "clean sans-serif";

  // LogoForge AI prompt format: flowing prose, exhaustive color bullets,
  // ALL CAPS for visual elements, white background hardcoded
  const lines = [
    `Design a ${mood.split(",")[0].trim()} ${typeLabel} logo for "${businessName}"${description ? ` in the ${description} industry` : ""}.`,
  ];

  // Logo type-specific icon description
  if (logoType === "combination_mark" || logoType === "icon_text") {
    lines.push(`Include an icon on the left — a meaningful symbol representing the brand's core identity. Brand name "${businessName}" on the right in a ${nameStyle} typeface.`);
  } else if (logoType === "wordmark") {
    lines.push(`Focus entirely on typography — custom letterforms with ${nameStyle} styling. The TYPE is the design — no separate icon.`);
  } else if (logoType === "lettermark") {
    const initials = businessName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    lines.push(`Feature the initials "${initials}" — focus on how letters interact, overlap, nest, or integrate in a ${nameStyle} style.`);
  } else if (logoType === "emblem") {
    lines.push(`Text integrated inside a circular badge shape. All elements sit INSIDE the shape. Brand name "${businessName}" curves along the shape in a ${nameStyle} typeface.`);
  } else if (logoType === "brandmark") {
    lines.push(`Standalone symbolic icon with NO text — must work without any brand name visible. A memorable shape that evokes the brand identity.`);
  } else if (logoType === "abstract") {
    lines.push(`Non-representational geometric form — unique, ownable, modern. Describe shapes, intersections, and negative space that evoke ${personality}. Brand name "${businessName}" alongside in ${nameStyle}.`);
  } else if (logoType === "mascot") {
    lines.push(`Character-based logo — friendly, approachable mascot that embodies ${personality}. Brand name "${businessName}" to the right in a ${nameStyle} typeface.`);
  }

  if (tagline) {
    lines.push(`Tagline "${tagline}" in smaller text below the brand name.`);
  }

  // Exhaustive color bullets per PDF rules
  lines.push("Colors:");
  lines.push(`- Primary element: ${c1} (dominant brand color, main icon shape, primary text)`);
  lines.push(`- Secondary element: ${c2} (supporting color, accent shapes, tagline text)`);
  lines.push(`- Accent detail: ${c3} (pop color, highlights, small detail elements)`);
  lines.push("- Background: White #FFFFFF");

  lines.push(`Style: ${personality} — the design is ${mood}. A brand that communicates trust and quality at first glance.`);
  lines.push("Output: Vector-quality horizontal logo on white background.");

  return lines.join(" ");
}

/* ═══════════════════════════════════════════
   SUPABASE STORAGE UPLOAD
   ═══════════════════════════════════════════ */

async function uploadToSupabaseStorage(
  imageUrl: string,
  userId: string,
  logoType: string,
  variantIndex: number,
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

  // Download image from Replicate temp URL
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) {
    console.error(`AI Logo: Failed to download image from Replicate (${imgResponse.status})`);
    return null;
  }

  const arrayBuffer = await imgResponse.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const timestamp = Date.now();
  const filePath = `${userId}/${logoType}-v${variantIndex}-${timestamp}.png`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(filePath, buffer, {
      contentType: "image/png",
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
   REPLICATE (FLUX 2 PRO)
   ═══════════════════════════════════════════ */

async function generateWithReplicate(prompt: string): Promise<string | null> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) return null;

  const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${replicateToken}`,
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        width: 1024,
        height: 512,
        num_outputs: 1,
        output_format: "png",
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error(`AI Logo [Replicate]: API responded with ${response.status}`, errBody);
    return null;
  }

  let prediction = await response.json() as {
    id: string;
    status: string;
    output: string | string[] | null;
    urls?: { get: string };
  };

  // Polling safety net: if Prefer: wait returned before completion
  if (prediction.status !== "succeeded" && prediction.status !== "failed") {
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${replicateToken}` },
      });

      if (!pollRes.ok) {
        console.error(`AI Logo [Replicate]: Polling failed (${pollRes.status})`);
        return null;
      }

      prediction = await pollRes.json();
      if (prediction.status === "succeeded" || prediction.status === "failed") break;
    }
  }

  if (prediction.status !== "succeeded" || !prediction.output) return null;

  const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  return url || null;
}

/* ═══════════════════════════════════════════
   CLAUDE SVG FALLBACK (ANTHROPIC API)
   ═══════════════════════════════════════════ */

function extractAndValidateSVG(raw: string): string | null {
  let cleaned = raw.replace(/```(?:svg|xml|html)?\n?/g, "").replace(/```\n?/g, "").trim();
  const svgMatch = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  if (!svgMatch) return null;

  let svg = svgMatch[0];

  // Security: remove dangerous elements and attributes
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  svg = svg.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  svg = svg.replace(/<style[\s\S]*?<\/style>/gi, "");

  if (!/xmlns\s*=/.test(svg)) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/viewBox\s*=/.test(svg)) {
    svg = svg.replace("<svg", '<svg viewBox="0 0 400 200"');
  }
  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) return null;
  if (svg.length > 5000) return null;

  return svg;
}

async function generateWithClaude(
  businessName: string,
  tagline: string,
  colors: string[],
  impressionWords: string[],
  logoType: string,
  variantIndex: number,
  businessNameStyle?: string,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const typeLabel = LOGO_TYPE_LABELS[logoType] || LOGO_TYPE_LABELS.icon_text;
  const mood = VARIANT_MOODS[variantIndex] || VARIANT_MOODS[0];
  const colorStr = colors.length ? colors.join(", ") : "#4F46E5, #7C3AED";
  const personality = impressionWords.length ? impressionWords.join(", ") : "professional, modern";

  const nameStyleHint = businessNameStyle
    ? `Name styling: ${NAME_STYLE_LABELS[businessNameStyle] || "clean sans-serif"}. Use appropriate font-family and font-weight to reflect this style.`
    : "";

  const c1 = colors[0] || "#4F46E5";
  const c2 = colors[1] || "#7C3AED";
  const c3 = colors[2] || "#1E293B";

  const systemPrompt = `You are LogoForge AI, an expert logo designer that outputs ONLY valid SVG code. No markdown, no explanation, no commentary — just the raw SVG.

Rules:
- Output a single <svg> element with viewBox="0 0 400 200"
- Include a white rounded-rectangle background: <rect width="400" height="200" fill="white" rx="16"/>
- Use ONLY these safe SVG elements: svg, rect, circle, ellipse, line, polyline, polygon, path, text, tspan, g, defs, linearGradient, radialGradient, stop, clipPath, mask, use, symbol
- Do NOT use: <script>, <style>, <foreignObject>, <image>, <animate>, or any on* event attributes
- Use web-safe fonts only: 'Segoe UI', 'Georgia', 'Trebuchet MS', Arial, Helvetica, sans-serif, serif
- Keep total SVG under 3000 characters
- All text must use the text element with appropriate font-family, font-size, font-weight attributes
- ONLY 4 colors exist: the 3 brand colors provided + White #FFFFFF for background/negative space. No other colors.
- No opacity values — use descriptive fills only, solid colors
- Make the logo creative, unique, and professional
- For brandmark type: create a standalone symbol with NO text at all
- For combination_mark/icon_text type: icon on the left, text on the right — they should work independently
- For emblem type: all elements sit INSIDE a containing shape (circle, shield, badge)
- For wordmark type: focus entirely on typography, the TYPE is the design
${nameStyleHint}`;

  const userPrompt = `Design a ${mood.split(",")[0].trim()} ${typeLabel} logo for "${businessName}"${tagline ? ` with tagline "${tagline}"` : ""}.
Colors:
- Primary element: ${c1} (dominant brand color, main icon shape, primary text)
- Secondary element: ${c2} (supporting color, accent shapes, tagline text)
- Accent detail: ${c3} (pop color, highlights, small detail elements)
- Background: White #FFFFFF
Brand personality: ${personality}. This variant is ${mood}.
Output ONLY the SVG code, nothing else.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      temperature: 0.9,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error(`AI Logo [Claude]: API responded with ${response.status}`, errBody);
    return null;
  }

  const data = await response.json() as {
    content: { type: string; text: string }[];
  };

  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) return null;

  return extractAndValidateSVG(text);
}

/* ═══════════════════════════════════════════
   POST HANDLER
   ═══════════════════════════════════════════ */

interface AILogoPayload {
  businessName?: string;
  businessNameStyle?: string;
  tagline?: string;
  colors?: string[];
  impressionWords?: string[];
  logoType?: string;
  variantIndex?: number;
  description?: string;
  products?: string[];
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
    businessNameStyle = "",
    tagline = "",
    colors = ["#4F46E5", "#7C3AED"],
    impressionWords = [],
    logoType = "icon_text",
    variantIndex = 0,
    description = "",
  } = payload;

  const prompt = buildFluxPrompt(businessName, tagline, colors, impressionWords, logoType, variantIndex, description, businessNameStyle);

  try {
    // Layer 1: Try Replicate (Flux 2 Pro) — returns image URL
    const tempImageUrl = await generateWithReplicate(prompt).catch((err) => {
      console.error("AI Logo [Replicate]: Unexpected error:", err);
      return null;
    });

    if (tempImageUrl) {
      // Upload to Supabase Storage for permanent URL
      const permanentUrl = await uploadToSupabaseStorage(tempImageUrl, userId, logoType, variantIndex);

      if (permanentUrl) {
        return NextResponse.json({ svg: null, imageUrl: permanentUrl, logoType, fallback: false });
      }

      // Storage failed — return temp URL (expires in ~1 hour)
      console.error("AI Logo: Storage upload failed, returning temp URL");
      return NextResponse.json({ svg: null, imageUrl: tempImageUrl, logoType, fallback: false });
    }

    // Layer 2: Fall back to Claude (Anthropic) — returns SVG code
    console.log("AI Logo: Replicate failed, trying Claude SVG fallback");
    const claudeSvg = await generateWithClaude(
      businessName, tagline, colors, impressionWords, logoType, variantIndex, businessNameStyle,
    ).catch((err) => {
      console.error("AI Logo [Claude]: Unexpected error:", err);
      return null;
    });

    if (claudeSvg) {
      return NextResponse.json({ svg: claudeSvg, imageUrl: null, logoType, fallback: false });
    }

    // Layer 3: Both failed — return SVG template fallback signal
    console.error("AI Logo: Both Replicate and Claude failed");
    return NextResponse.json({ svg: null, imageUrl: null, logoType, fallback: true });
  } catch (error) {
    console.error("AI Logo: Unexpected error:", error);
    return NextResponse.json({ svg: null, imageUrl: null, logoType, fallback: true });
  }
}
