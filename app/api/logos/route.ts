import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME = "logos";

const missingCredsResponse = NextResponse.json(
  {
    error:
      "Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  },
  { status: 500 },
);

const createServiceClient = () => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase credentials are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

/* ═══════════════════════════════════════════
   ENSURE STORAGE BUCKET EXISTS
   ═══════════════════════════════════════════ */

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase.storage.getBucket(BUCKET_NAME);
  if (data) return; // bucket exists

  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  });

  if (error && !error.message.includes("already exists")) {
    console.error("Logos: Failed to create storage bucket:", error.message);
  }
}

/* ═══════════════════════════════════════════
   UPLOAD LOGO TO STORAGE
   ═══════════════════════════════════════════ */

async function uploadLogoToStorage(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  logoType: string,
  index: number,
  svg: string | null,
  imageUrl: string | null,
): Promise<string | null> {
  const timestamp = Date.now();

  try {
    // Case 1: Already have a permanent Supabase URL — skip re-upload
    if (imageUrl && supabaseUrl && imageUrl.includes(supabaseUrl)) {
      return imageUrl;
    }

    // Case 2: External image URL (e.g. from Replicate) — download and upload as PNG
    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buffer = new Uint8Array(await imgRes.arrayBuffer());
        const filePath = `${userId}/${logoType}-v${index}-${timestamp}.png`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, buffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
          return urlData.publicUrl;
        }
        console.error("Logos: PNG upload failed:", error.message);
      }
    }

    // Case 3: SVG content — upload as SVG file
    if (svg) {
      const filePath = `${userId}/${logoType}-v${index}-${timestamp}.svg`;
      const svgBuffer = new TextEncoder().encode(svg);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, svgBuffer, {
          contentType: "image/svg+xml",
          upsert: true,
        });

      if (!error) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        return urlData.publicUrl;
      }
      console.error("Logos: SVG upload failed:", error.message);
    }
  } catch (err) {
    console.error("Logos: Storage upload error:", err);
  }

  return null;
}

/* ═══════════════════════════════════════════
   POST — SAVE LOGOS
   ═══════════════════════════════════════════ */

interface LogoPayload {
  profileId: number;
  businessName: string;
  tagline?: string;
  colors?: string[];
  impressionWords?: string[];
  logos: { type: string; svg: string; imageUrl?: string | null; isSelected?: boolean }[];
}

export async function POST(req: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return missingCredsResponse;
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  let payload: LogoPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!payload.profileId || !payload.logos?.length) {
    return NextResponse.json(
      { error: "profileId and logos are required." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Ensure the storage bucket exists
  await ensureBucket(supabase);

  // Upload each logo to storage and collect permanent URLs
  const storageUrls = await Promise.all(
    payload.logos.map((logo, i) =>
      uploadLogoToStorage(supabase, userId, logo.type, i, logo.svg, logo.imageUrl || null),
    ),
  );

  const rows = payload.logos.map((logo, i) => ({
    user_id: userId,
    profile_id: payload.profileId,
    business_name: payload.businessName,
    logo_type: `${logo.type}_v${i}`,
    svg_content: logo.svg,
    image_url: storageUrls[i] || logo.imageUrl || null,
    colors: payload.colors || [],
    impression_words: payload.impressionWords || [],
    tagline: payload.tagline || null,
    is_selected: logo.isSelected || false,
  }));

  // Delete existing logos for this profile, then insert fresh set
  const { error: deleteError } = await supabase
    .from("user_logos")
    .delete()
    .eq("user_id", userId)
    .eq("profile_id", payload.profileId);

  if (deleteError) {
    console.error("Logos: Delete failed:", deleteError.message, deleteError.details, deleteError.hint);
  }

  const { error } = await supabase
    .from("user_logos")
    .insert(rows);

  if (error) {
    console.error("Logos: Insert failed:", error.message, error.details, error.hint);
    return NextResponse.json(
      {
        error: "Failed to save logos. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, count: rows.length });
}

export async function GET() {
  if (!supabaseUrl || !serviceRoleKey) {
    return missingCredsResponse;
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("user_logos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch logos.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ logos: data || [] });
}
