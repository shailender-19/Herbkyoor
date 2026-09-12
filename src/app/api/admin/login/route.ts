import { NextResponse } from "next/server";
import { startSession, verifyCredentials } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }
  await startSession();
  return NextResponse.json({ ok: true });
}
