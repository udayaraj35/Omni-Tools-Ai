import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Automatic checkout is currently disabled. Use manual payment methods." }, { status: 403 });
}