import { ok } from "@/lib/api-helpers";
import { revertOutcome } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const outcome = await revertOutcome(params.id);
  return ok({ message: "Outcome reverted.", outcome });
}
