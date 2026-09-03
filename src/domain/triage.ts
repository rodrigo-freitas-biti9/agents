import {
  fiscalProblems,
  type FiscalProblem,
  type FiscalSpecialistId,
} from "../knowledge/fiscal-problems.js";

export interface FiscalTriageMatch {
  problem: FiscalProblem;
  score: number;
}

export interface FiscalTriage {
  specialist: FiscalSpecialistId;
  confidence: number;
  reason: string;
  matches: readonly FiscalTriageMatch[];
}

const DEFAULT_SPECIALIST: FiscalSpecialistId = "monitoring_insights";
const STOP_WORDS = new Set([
  "a", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "esta", "me", "na", "nas",
  "no", "nos", "o", "os", "para", "por", "que", "um", "uma",
]);

export function normalizeFiscalText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function meaningfulTokens(value: string): string[] {
  return normalizeFiscalText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreProblem(question: string, problem: FiscalProblem): number {
  const normalizedQuestion = normalizeFiscalText(question);
  const questionTokens = new Set(meaningfulTokens(question));
  let score = 0;

  for (const keyword of problem.keywords) {
    const normalizedKeyword = normalizeFiscalText(keyword);
    const keywordTokens = meaningfulTokens(keyword);
    if (normalizedQuestion.includes(normalizedKeyword)) {
      score += 12 + Math.min(keywordTokens.length, 5);
      continue;
    }

    if (keywordTokens.length > 0 && keywordTokens.every((token) => questionTokens.has(token))) {
      score += 6 + keywordTokens.length;
    }
  }

  const titleTokens = meaningfulTokens(problem.title);
  const titleHits = titleTokens.filter((token) => questionTokens.has(token)).length;
  if (titleHits >= 2) score += titleHits * 2;

  // Desempate previsível: problemas mais priorizados recebem apenas um bônus pequeno.
  if (score > 0) score += (101 - problem.rank) / 1_000;
  return score;
}

export function routeFiscalQuestion(question: string, limit = 3): FiscalTriage {
  const matches = fiscalProblems
    .map((problem) => ({ problem, score: scoreProblem(question, problem) }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.problem.rank - right.problem.rank)
    .slice(0, Math.max(1, limit));

  const first = matches[0];
  if (!first) {
    return {
      specialist: DEFAULT_SPECIALIST,
      confidence: 0,
      reason: "Nenhuma dor específica reconhecida; encaminhado ao monitoramento geral.",
      matches: [],
    };
  }

  const secondScore = matches[1]?.score ?? 0;
  const separation = Math.max(0, first.score - secondScore);
  const confidence = Math.min(0.99, 0.55 + first.score / 100 + separation / 80);

  return {
    specialist: first.problem.specialist,
    confidence: Number(confidence.toFixed(2)),
    reason: `${first.problem.id}: ${first.problem.title}`,
    matches,
  };
}

