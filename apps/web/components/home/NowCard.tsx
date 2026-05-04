import type { NowCard as NowCardType } from "@ciao/shared";
import { Badge } from "@/components/shared/Badge";
import { Card } from "@/components/shared/Card";

export function NowCard({ card }: { card: NowCardType }) {
  return (
    <Card className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_6px_rgba(13,124,107,0.4)]" />
        <h3 className="truncate text-sm font-medium text-stone-800">{card.title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-stone-600">{card.message}</p>
      <div className="flex gap-1.5">
        <Badge>{card.costMode}</Badge>
        <Badge tone="warning">{card.risk}</Badge>
        <Badge>{card.confidence}</Badge>
      </div>
    </Card>
  );
}
