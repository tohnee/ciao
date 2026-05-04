import { describe, expect, it } from "vitest";

describe("prisma client", () => {
  it("exports a client-like object with workspace access", async () => {
    const mod = await import("../apps/web/lib/prisma");
    expect(typeof mod.prisma.workspace).toBe("object");
  });
});
