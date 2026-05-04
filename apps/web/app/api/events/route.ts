import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listEventsAfter } from "@/lib/event-repository";
import { createSSEMessage } from "@/lib/sse";

const DEFAULT_STREAM = "home";

export async function GET(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const { searchParams } = new URL(request.url);
  const streamName = searchParams.get("stream") ?? DEFAULT_STREAM;
  const lastEventId = searchParams.get("lastEventId") ?? undefined;

  const events = await listEventsAfter({
    workspaceId,
    stream: streamName,
    lastEventId,
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      for (const event of events) {
        controller.enqueue(encoder.encode(createSSEMessage(event)));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
