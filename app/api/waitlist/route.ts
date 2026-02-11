import { NextResponse } from "next/server";
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

type ServiceClient = ReturnType<typeof createServiceClient>;

async function fetchWaitlistCount(client: ServiceClient) {
  const { count, error } = await client
    .from("waitlist")
    .select("*", { head: true, count: "exact" });

  return { count: count ?? 0, error };
}

export async function GET() {
  if (!supabaseUrl || !serviceRoleKey) {
    return missingCredsResponse;
  }

  const supabase = createServiceClient();
  const { count, error } = await fetchWaitlistCount(supabase);

  if (error) {
    return NextResponse.json(
      { error: "Unable to load waitlist count." },
      { status: 500 },
    );
  }

  return NextResponse.json({ count });
}

export async function POST(req: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return missingCredsResponse;
  }

  let payload: { email?: string; source?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const source =
    typeof payload.source === "string" && payload.source.trim().length > 0
      ? payload.source.trim()
      : "landing-page";

  const { error } = await supabase.from("waitlist").insert({
    email,
    source,
  });

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      {
        error: isDuplicate
          ? "Looks like you're already on the list!"
          : "We couldn't save your email. Please try again.",
        code: isDuplicate ? "duplicate" : error.code,
        details: error.message,
      },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  const { count, error: countError } = await fetchWaitlistCount(supabase);
  if (countError) {
    return NextResponse.json({ success: true, count: null });
  }

  return NextResponse.json({ success: true, count });
}
