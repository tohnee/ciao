export type RiskAssessment = {
  level: "low" | "medium" | "high";
  domain: string | null;
  requiresDecision: boolean;
};

const highRiskPatterns = [/auth/i, /oauth/i, /billing/i, /payment/i, /secret/i, /public.?api/i, /delete/i];
const mediumRiskPatterns = [/database/i, /schema/i, /deploy/i, /config/i];

export function assessRisk(text: string): RiskAssessment {
  for (const pattern of highRiskPatterns) {
    if (pattern.test(text)) {
      return { level: "high", domain: pattern.source, requiresDecision: true };
    }
  }

  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(text)) {
      return { level: "medium", domain: pattern.source, requiresDecision: false };
    }
  }

  return { level: "low", domain: null, requiresDecision: false };
}
