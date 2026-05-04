import type { SSEEvent } from "@ciao/shared";
import { prisma } from "./prisma";

type AppendEventInput = {
  workspaceId: string;
  stream: string;
  type: SSEEvent["type"];
  intentId?: string;
  payload: Record<string, unknown>;
};

type ListEventsAfterInput = {
  workspaceId: string;
  stream: string;
  lastEventId?: string;
};

type PersistedEvent = SSEEvent & {
  id: string;
  createdAt: string;
};

function parseEvent(record: {
  id: string;
  type: string;
  payload: string;
  createdAt: Date;
}): PersistedEvent {
  const payload = JSON.parse(record.payload) as { data: PersistedEvent["data"] };

  return {
    id: record.id,
    type: record.type as SSEEvent["type"],
    createdAt: record.createdAt.toISOString(),
    data: payload.data,
  } as PersistedEvent;
}

export async function resetEventLog() {
  await prisma.eventLog.deleteMany();
}

export async function appendEvent(input: AppendEventInput) {
  const record = await prisma.eventLog.create({
    data: {
      workspaceId: input.workspaceId,
      stream: input.stream,
      type: input.type,
      intentId: input.intentId,
      payload: JSON.stringify({
        data: input.payload,
      }),
    },
  });

  return parseEvent(record);
}

export async function listEventsAfter(input: ListEventsAfterInput) {
  const cursor = input.lastEventId
    ? await prisma.eventLog.findUnique({
        where: { id: input.lastEventId },
      })
    : null;

  const records = await prisma.eventLog.findMany({
    where: {
      workspaceId: input.workspaceId,
      stream: input.stream,
      ...(cursor
        ? {
            OR: [
              { createdAt: { gt: cursor.createdAt } },
              {
                createdAt: cursor.createdAt,
                id: { gt: cursor.id },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  return records.map(parseEvent);
}
