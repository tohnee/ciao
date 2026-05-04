import { getOutcome } from "@/lib/runtime-repository";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { notFound } from "next/navigation";
import { CheckCircle2, FileCode, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function OutcomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outcome = await getOutcome(id);
  if (!outcome) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">{outcome.title}</h1>
              <Badge
                tone={
                  outcome.state === "accepted"
                    ? "success"
                    : outcome.state === "reverted"
                      ? "danger"
                      : "neutral"
                }
              >
                {outcome.state}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{outcome.summary}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {outcome.changed.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-gray-900">Changed Files</h2>
            </div>
            <ul className="space-y-1">
              {outcome.changed.map((file, i) => (
                <li key={i} className="text-sm text-gray-700 font-mono">{file}</li>
              ))}
            </ul>
          </Card>
        )}

        {outcome.verified.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h2 className="text-sm font-semibold text-gray-900">Verified</h2>
            </div>
            <ul className="space-y-1">
              {outcome.verified.map((item, i) => (
                <li key={i} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {outcome.risks.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold text-gray-900">Risks</h2>
          </div>
          <ul className="space-y-1">
            {outcome.risks.map((risk, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
