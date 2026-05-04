import { ok } from "@/lib/api-helpers";
import { getOutcome } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const outcome = await getOutcome(params.id);
  if (!outcome) {
    return ok({ error: "Outcome not found" }, { status: 404 });
  }
  return ok({ outcome });
}
