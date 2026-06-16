import { NextResponse } from "next/server";

/** AuthMiddleware — gate admin write routes (CAKE-10) */
export function requireAdmin() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
