import { mkdir, appendFile, stat } from "fs/promises";
import { dirname, join } from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const waitlistPath = join(process.cwd(), "data", "waitlist.csv");
const header = "created_at,email,ip,user_agent\n";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function saveToSupabase(record: {
  created_at: string;
  email: string;
  ip: string;
  user_agent: string;
}) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    body: JSON.stringify(record),
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    method: "POST"
  });

  if (response.ok || response.status === 409) {
    return true;
  }

  throw new Error(`Supabase waitlist write failed: ${response.status}`);
}

async function saveToCsv(record: {
  created_at: string;
  email: string;
  ip: string;
  user_agent: string;
}) {
  const row =
    [record.created_at, record.email, record.ip, record.user_agent].map(csvCell).join(",") + "\n";
  const fileExists = await stat(waitlistPath)
    .then(() => true)
    .catch(() => false);

  await mkdir(dirname(waitlistPath), { recursive: true });
  if (!fileExists) {
    await appendFile(waitlistPath, header, "utf8");
  }
  await appendFile(waitlistPath, row, "utf8");
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isEmail(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const createdAt = new Date().toISOString();
  const record = {
    created_at: createdAt,
    email,
    ip,
    user_agent: userAgent
  };

  try {
    if (!(await saveToSupabase(record))) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "waitlist storage is not configured" },
          { status: 503 }
        );
      }

      await saveToCsv(record);
    }
  } catch {
    return NextResponse.json(
      { error: "could not save your email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
