import { ok } from "@/lib/api-helpers";
import { getAgentRuns } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const runs = await getAgentRuns(params.id);
  return ok({ runs });
}
