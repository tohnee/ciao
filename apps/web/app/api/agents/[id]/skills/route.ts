import { ok } from "@/lib/api-helpers";
import {
  getAgentSkills,
  enableSkill,
  disableSkill,
} from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const skills = await getAgentSkills(params.id);
  return ok({ skills });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { skillId } = (await request.json()) as { skillId: string };
  const result = await enableSkill(params.id, skillId);
  return ok({ result }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { skillId } = (await request.json()) as { skillId: string };
  await disableSkill(params.id, skillId);
  return ok({ success: true });
}
