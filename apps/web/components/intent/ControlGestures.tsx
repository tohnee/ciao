import { Button } from "@/components/shared/Button";

const actions = ["Pause", "Tighten", "Explore", "Go deeper", "Stop"];

export function ControlGestures() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action}>{action}</Button>
      ))}
    </div>
  );
}
