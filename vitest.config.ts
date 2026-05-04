import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "apps/web"),
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    setupFiles: ["./vitest.setup.ts"],
  },
});
