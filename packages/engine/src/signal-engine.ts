export function summarizeSignal(message: string) {
  return {
    kind: "progress",
    level: "medium",
    message,
    detailsHidden: true,
  };
}
