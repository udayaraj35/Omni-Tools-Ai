import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ error: "Endpoint deprecated. Use direct Genkit flows." }, { status: 410 });
}