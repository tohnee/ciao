export function compileContext(refs: string[]) {
  return {
    compactPrompt: refs.join("\n"),
    refs,
    estimatedTokens: refs.length * 120,
  };
}
