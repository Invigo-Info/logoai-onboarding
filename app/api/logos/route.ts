import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  const rows = payload.logos.map((logo) => ({
    user_id: userId,
    profile_id: payload.profileId,
    business_name: payload.businessName,
    logo_type: logo.type,
    svg_content: logo.svg,
    image_url: logo.imageUrl || null,
    colors: payload.colors || [],
    impression_words: payload.impressionWords || [],
    tagline: payload.tagline || null,
    is_selected: logo.isSelected || false,
  }));

  const { error } = await supabase
    .from("user_logos")
    .upsert(rows, { onConflict: "user_id,profile_id,logo_type" });

  if (error) {
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
