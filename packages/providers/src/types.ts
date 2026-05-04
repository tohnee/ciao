export type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProviderPrompt = {
  system?: string;
  messages: ProviderMessage[];
};

export type ProviderResult = {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type ProviderAdapter = {
  name: string;
  generate: (prompt: ProviderPrompt) => Promise<ProviderResult>;
};
