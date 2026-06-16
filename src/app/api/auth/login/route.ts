import { NextResponse } from "next/server";

/** AuthController — POST /api/auth/login (CAKE-10) */
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
