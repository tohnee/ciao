import Link from "next/link";
import { listIntents } from "@/lib/runtime-repository";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function IntentsPage() {
  const workspaceId = await getRequiredWorkspaceId();
  const result = await listIntents(workspaceId);

  if (result.length === 0) {
    return <EmptyState title="No intents yet" description="Intents appear when you submit a request to CIAO." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-900">Intents</h2>
      {result.map((intent) => (
        <Link
          key={intent.id}
          className="block rounded-card bg-white p-4 shadow-card transition hover:shadow-md"
          href={`/intents/${intent.id}`}
        >
          <p className="text-sm text-gray-500">{intent.mode} · {intent.state}</p>
          <p className="mt-1 text-sm text-accent">{intent.title}</p>
        </Link>
      ))}
    </div>
  );
}
