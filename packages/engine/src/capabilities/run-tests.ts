import { execSync } from "node:child_process";

export type TestResult = {
  passed: boolean;
  summary: string;
  verified: string[];
  failed: string[];
};

const DEFAULT_TEST_CMD = "npm test 2>&1 | tail -25";

export function runTests(): TestResult {
  try {
    const output = execSync(DEFAULT_TEST_CMD, {
      encoding: "utf-8",
      timeout: 120_000,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const lines = output.split("\n");
    const passMatch = output.match(/(\d+)\s+passed?/);
    const failMatch = output.match(/(\d+)\s+failed?/);

    const passed = !failMatch || failMatch[1] === "0";
    return {
      passed,
      summary: lines.filter((l) => l.includes("Tests") || l.includes("passed") || l.includes("failed")).slice(0, 5).join("; "),
      verified: passMatch ? [`${passMatch[1]} tests passing`] : [],
      failed: failMatch && failMatch[1] !== "0" ? [`${failMatch[1]} tests failing`] : [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      passed: false,
      summary: `Tests failed to run: ${message}`,
      verified: [],
      failed: [message],
    };
  }
}
