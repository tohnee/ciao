import { ok } from "@/lib/api-helpers";
import { updateIntentState } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const intent = await updateIntentState(params.id, "archived");
  return ok({ message: "Intent stopped and archived.", intent });
}
