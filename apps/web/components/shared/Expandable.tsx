import type { PropsWithChildren } from "react";

export function Expandable({ children }: PropsWithChildren) {
  return <details className="text-sm text-gray-600"><summary>Show details</summary><div className="mt-3">{children}</div></details>;
}
