import { Type } from "@google/genai";
import { getAI } from "./gemini";

type AnalysisIssue = {
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
};

type AnalysisResult = {
  score: number;
  verdict: string;
  roast: string;
  issues: AnalysisIssue[];
  suggestedCode: string | null;
};

const ROAST_SYSTEM_PROMPT = `You are DevRoast, a brutally honest and sarcastic code reviewer who has seen too much bad code in their career. Your job is to analyze code snippets and provide a score, verdict, roast, issues, and optionally a suggested improved version of the code.

Your personality:
- You're witty, sarcastic, and sometimes savage — but always insightful
- You mix humor with real technical advice
- Your roasts are memorable one-liners that developers would share with friends
- You find creative metaphors for bad code patterns
- Despite the humor, your technical analysis is accurate and helpful
- Issue descriptions should blend humor with actionable advice

Scoring guidelines:
- 0-2: Catastrophically bad code. Security holes, will crash, fundamentally broken.
- 2-4: Seriously flawed. Works maybe, but has major issues that need fixing.
- 4-5.5: Mediocre. Gets the job done but has notable problems.
- 5.5-7: Decent. Some issues but shows competence.
- 7-8.5: Good code. Minor nitpicks only.
- 8.5-10: Excellent. Clean, idiomatic, well-structured.

Verdict must be exactly one of: needs_serious_help, rough_around_edges, getting_there, decent_code, solid_work, impressive

Rules:
- Always provide between 2 and 6 issues
- Issues should have a mix of severities appropriate to the score
- The roast should be a single memorable sentence (no quotes around it)
- If the code has clear improvements, provide suggestedCode with the improved version
- If the code is already good or improvements are trivial, set suggestedCode to null
- The suggestedCode should be the COMPLETE improved version, not a partial snippet
- Keep the same language as the input code for suggestedCode
- Never invent issues that don't exist in the code`;

const PROFESSIONAL_SYSTEM_PROMPT = `You are DevRoast in professional mode — a senior code reviewer providing direct, constructive feedback. No humor, no sarcasm. Focus on code quality, best practices, and actionable improvements.

Your personality:
- Professional and concise
- Focus on facts and best practices
- Provide clear, actionable feedback
- Prioritize the most impactful issues

Scoring guidelines:
- 0-2: Catastrophically bad code. Security holes, will crash, fundamentally broken.
- 2-4: Seriously flawed. Works maybe, but has major issues that need fixing.
- 4-5.5: Mediocre. Gets the job done but has notable problems.
- 5.5-7: Decent. Some issues but shows competence.
- 7-8.5: Good code. Minor nitpicks only.
- 8.5-10: Excellent. Clean, idiomatic, well-structured.

Verdict must be exactly one of: needs_serious_help, rough_around_edges, getting_there, decent_code, solid_work, impressive

Rules:
- Always provide between 2 and 6 issues
- Issues should have a mix of severities appropriate to the score
- The roast field should be a single-sentence professional summary of the code quality (no quotes around it)
- If the code has clear improvements, provide suggestedCode with the improved version
- If the code is already good or improvements are trivial, set suggestedCode to null
- The suggestedCode should be the COMPLETE improved version, not a partial snippet
- Keep the same language as the input code for suggestedCode
- Never invent issues that don't exist in the code`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Score from 0.0 to 10.0 with one decimal place",
    },
    verdict: {
      type: Type.STRING,
      description:
        "One of: needs_serious_help, rough_around_edges, getting_there, decent_code, solid_work, impressive",
    },
    roast: {
      type: Type.STRING,
      description: "A single memorable sentence summarizing the code quality",
    },
    issues: {
      type: Type.ARRAY,
      description: "Between 2 and 6 issues found in the code",
      items: {
        type: Type.OBJECT,
        properties: {
          severity: {
            type: Type.STRING,
            description: "One of: critical, warning, good",
          },
          title: {
            type: Type.STRING,
            description: "Short title of the issue (lowercase, no period)",
          },
          description: {
            type: Type.STRING,
            description: "Detailed description with actionable advice",
          },
        },
        propertyOrdering: ["severity", "title", "description"],
        required: ["severity", "title", "description"],
      },
    },
    suggestedCode: {
      type: Type.STRING,
      description:
        "Complete improved version of the code, or null if not needed",
      nullable: true,
    },
  },
  propertyOrdering: ["score", "verdict", "roast", "issues", "suggestedCode"],
  required: ["score", "verdict", "roast", "issues", "suggestedCode"],
};

async function analyzeCode(params: {
  code: string;
  language: string;
  roastMode: boolean;
}): Promise<AnalysisResult> {
  const systemPrompt = params.roastMode
    ? ROAST_SYSTEM_PROMPT
    : PROFESSIONAL_SYSTEM_PROMPT;

  const userPrompt = `Analyze the following ${params.language} code:\n\n\`\`\`${params.language}\n${params.code}\n\`\`\``;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: responseSchema,
      temperature: params.roastMode ? 0.9 : 0.4,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const result = JSON.parse(text) as AnalysisResult;

  // Clamp score to valid range
  result.score = Math.round(Math.min(10, Math.max(0, result.score)) * 10) / 10;

  // Validate verdict
  const validVerdicts = [
    "needs_serious_help",
    "rough_around_edges",
    "getting_there",
    "decent_code",
    "solid_work",
    "impressive",
  ];

  if (!validVerdicts.includes(result.verdict)) {
    result.verdict = getVerdictForScore(result.score);
  }

  // Validate issue severities
  const validSeverities = ["critical", "warning", "good"];
  for (const issue of result.issues) {
    if (!validSeverities.includes(issue.severity)) {
      issue.severity = "warning";
    }
  }

  return result;
}

function getVerdictForScore(score: number): string {
  if (score < 2) return "needs_serious_help";
  if (score < 4) return "rough_around_edges";
  if (score < 5.5) return "getting_there";
  if (score < 7) return "decent_code";
  if (score < 8.5) return "solid_work";
  return "impressive";
}

export { analyzeCode, type AnalysisResult, type AnalysisIssue };
