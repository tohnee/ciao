import { ok } from "@/lib/api-helpers";
import { getIntentDetail } from "@/hooks/useIntent";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const detail = await getIntentDetail(context.params.id);

  if (!detail) {
    return ok({ error: "Intent not found" }, { status: 404 });
  }

  return ok(detail);
}
