import { NextResponse } from "next/server";
import { accountRecoveryService } from "@/server/services/accountRecoveryService";

/** Publicly exposes only masked, configured password-recovery options. */
export async function GET() {
  const options = await accountRecoveryService.getPublicOptions();
  return NextResponse.json(options);
}
