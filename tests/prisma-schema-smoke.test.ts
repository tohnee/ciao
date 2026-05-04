import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("prisma schema", () => {
  it("targets sqlite for the local MVP persistence flow", () => {
    const schema = readFileSync("apps/web/prisma/schema.prisma", "utf8");
    expect(schema).toContain('provider = "sqlite"');
  });
});
