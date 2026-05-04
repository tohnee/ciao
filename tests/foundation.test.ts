import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const requiredPaths = [
  "apps/web/app/home/page.tsx",
  "apps/web/app/api/home/route.ts",
  "apps/web/prisma/schema.prisma",
  "packages/shared/src/index.ts",
  "packages/engine/src/governor.ts",
  "packages/providers/src/mock.ts",
  "workers/loop-worker.ts",
];

describe("CIAO foundation scaffold", () => {
  it("creates the required monorepo files for the MVP foundation", () => {
    for (const relativePath of requiredPaths) {
      expect(existsSync(join(root, relativePath)), `${relativePath} should exist`).toBe(true);
    }
  });
});
