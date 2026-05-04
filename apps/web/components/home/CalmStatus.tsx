export function CalmStatus({ summary }: { summary: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
      </span>
      <h1 className="text-xl font-medium tracking-tight text-stone-800">
        {summary}
      </h1>
    </div>
  );
}
