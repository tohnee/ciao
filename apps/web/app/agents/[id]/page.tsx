import { getAgent } from "@/lib/runtime-repository";
import { AgentDetail } from "@/components/agent/AgentDetail";
import { notFound } from "next/navigation";

export default async function AgentPage({
  params,
}: {
  params: { id: string };
}) {
  const agent = await getAgent(params.id);
  if (!agent) notFound();

  return <AgentDetail agent={agent} />;
}
