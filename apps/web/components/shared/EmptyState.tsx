import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white/50 px-8 py-16">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Inbox className="h-5 w-5 text-muted-light" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
