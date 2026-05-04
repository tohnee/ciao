export function createSSEMessage(event: { id?: string } & Record<string, unknown>) {
  const idLine = event.id ? `id: ${event.id}\n` : "";
  return `${idLine}data: ${JSON.stringify(event)}\n\n`;
}
