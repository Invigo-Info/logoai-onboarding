import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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

interface OnboardingPayload {
  businessName?: string;
  description?: string;
  products?: string[];
  tagline?: string;
  impressionWords?: string[];
  colors?: string[];
  logoType?: string;
}

export async function POST(req: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return missingCredsResponse;
  }

  // Authenticate via Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  // Get user email from Clerk
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;

  let payload: OnboardingPayload = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const businessName = payload.businessName?.trim();
  if (!businessName) {
    return NextResponse.json(
      { error: "Business name is required." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("onboarding_profiles")
    .upsert(
      {
        user_id: userId,
        email,
        business_name: businessName,
        description: payload.description?.trim() || null,
        products: payload.products || [],
        tagline: payload.tagline?.trim() || null,
        impression_words: payload.impressionWords || [],
        colors: payload.colors || [],
        logo_type: payload.logoType || null,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "We couldn't save your profile. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, profileId: data.id });
}
