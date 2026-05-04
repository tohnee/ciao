import { ok } from "@/lib/api-helpers";
import { updateIntentState } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const intent = await updateIntentState(params.id, "paused");
  return ok({ message: "Intent paused.", intent });
}
