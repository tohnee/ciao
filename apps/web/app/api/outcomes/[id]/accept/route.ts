import { ok } from "@/lib/api-helpers";
import { acceptOutcome } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const outcome = await acceptOutcome(params.id);
  return ok({ message: "Outcome accepted.", outcome });
}
