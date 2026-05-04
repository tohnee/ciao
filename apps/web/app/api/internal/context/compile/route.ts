import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";
import { compileContext } from "@ciao/engine";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { refs } = body as { refs?: string[] };

  if (!refs || !Array.isArray(refs)) {
    return ok({ ok: false, error: "refs array is required" }, { status: 400 });
  }

  const compiled = compileContext(refs);

  return ok({ ok: true, context: compiled });
}
