import type { Signal } from "@ciao/shared";

export function SignalFeed({ signals }: { signals: Signal[] }) {
  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <div key={signal.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="text-sm font-medium text-gray-900">{signal.kind}</p>
          <p className="mt-1 text-sm text-gray-600">{signal.message}</p>
        </div>
      ))}
    </div>
  );
}
