import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("A.2 schema", () => {
  it("includes Signal, Memory and EventLog models", () => {
    const schema = readFileSync("apps/web/prisma/schema.prisma", "utf8");
    expect(schema).toContain("model Signal");
    expect(schema).toContain("model Memory");
    expect(schema).toContain("model EventLog");
  });
});
