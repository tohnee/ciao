import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listEventsAfter } from "@/lib/event-repository";
import { createSSEMessage } from "@/lib/sse";

const DEFAULT_STREAM = "home";
const POLL_INTERVAL_MS = 2000;

export async function GET(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const { searchParams } = new URL(request.url);
  const streamName = searchParams.get("stream") ?? DEFAULT_STREAM;
  let cursor = searchParams.get("lastEventId") ?? undefined;

  let polling = true;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const buffered = await listEventsAfter({
        workspaceId,
        stream: streamName,
        lastEventId: cursor,
      });

      for (const event of buffered) {
        controller.enqueue(encoder.encode(createSSEMessage(event)));
        cursor = event.id;
      }

      const poll = async () => {
        if (!polling) return;
        try {
          const newEvents = await listEventsAfter({
            workspaceId,
            stream: streamName,
            lastEventId: cursor,
          });
          for (const event of newEvents) {
            try {
              controller.enqueue(encoder.encode(createSSEMessage(event)));
            } catch {
              polling = false;
              return;
            }
            cursor = event.id;
          }
        } catch (err) {
          console.error("SSE poll error:", err);
        }
        if (polling) setTimeout(poll, POLL_INTERVAL_MS);
      };

      setTimeout(poll, POLL_INTERVAL_MS);
    },
    cancel() {
      polling = false;
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
