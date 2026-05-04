// Load .env from project root for vitest (Node 21+ built-in)
try {
  process.loadEnvFile(".env");
} catch {
  // .env may not exist in CI — that's fine
}
