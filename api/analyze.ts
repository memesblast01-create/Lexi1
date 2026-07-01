import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

function isOverloadedError(err: any): boolean {
  const msg = err?.message || "";
  const status = err?.status || err?.statusCode || 0;
  return (
    status === 503 ||
    status === 429 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("overloaded") ||
    msg.includes("high demand")
  );
}

function getClients(): any[] {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];

  if (keys.length === 0) return [];
  return keys.map((key) => new GoogleGenAI({ apiKey: key }));
}

async function generateWithRetry(params: {
  contents: any;
  systemInstruction: string;
  schema: any;
}) {
  const clients = getClients();
  if (clients.length === 0) throw new Error("No API keys configured.");

  // Shuffle clients so load is spread across keys randomly each request
  const shuffled = [...clients].sort(() => Math.random() - 0.5);

  // Build attempt list: try each key with primary model first,
  // then each key with fallback model
  const attempts: { client: any; model: string }[] = [
    ...shuffled.map((c) => ({ client: c, model: PRIMARY_MODEL })),
    ...shuffled.map((c) => ({ client: c, model: FALLBACK_MODEL })),
  ];

  let lastError: any = null;

  for (const { client, model } of attempts) {
    try {
      const result = await client.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: params.schema,
        },
      });
      return result;
    } catch (err: any) {
      lastError = err;
      if (!isOverloadedError(err)) throw err;
      // overloaded on this key/model combo — try next
    }
  }

  throw lastError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const clients = getClients();
    if (clients.length === 0) {
      res.status(500).json({ error: "Gemini API key is not configured." });
      return;
    }

    const { content, docType, language, schema, mode, existingAnalysis } = req.body;

    let contents: any;
    let systemInstruction: string;

    if (mode === "translate" && existingAnalysis) {
      systemInstruction = `
        You are a precise translation engine for a legal document analysis tool called "LexiAnalyse".
        You will be given a JSON object containing an analysis result. Translate ALL human-readable text
        fields (summaries, descriptions, titles, questions, reasoning) into ${language}.
        IMPORTANT: The field "verdict.score" must remain exactly one of these three English values,
        unchanged: "Safe", "Moderate Risk", "High Risk". Do not translate that specific field's value.
        Keep the exact same JSON structure and all field names. Do not add or remove fields.
        Do NOT hallucinate or invent new content — only translate what is given.
      `;
      contents = [{ role: "user", parts: [{ text: JSON.stringify(existingAnalysis) }] }];
    } else {
      systemInstruction = `
        You are an advanced AI-powered document analysis engine "LexiAnalyse".
        Analyze the provided document which is a ${docType}.
        Respond in ${language}.
        Follow these rules:
        - First, determine the legal jurisdiction (country) this document is governed by. Look for signals
          such as an explicit "governing law" clause, named courts, currency, addresses, company registration
          references, or jurisdiction-specific legal terminology. If you find a clear signal, name the country
          and explain the evidence. If there is no reliable signal, set detectedCountry to "Unspecified" and
          leave evidence/legalNote empty.
        - If a jurisdiction is detected, tailor your risk analysis to that country's relevant laws.
          Mention in legalNote briefly how the analysis was adjusted.
        - Simplify complex documents into plain language.
        - Highlight risks (unfair terms, hidden conditions, penalties), with jurisdiction-specific context where relevant.
        - Provide structured output.
        - Disclaimer: This is AI-generated and not a substitute for professional legal advice. Local laws may
          have nuances a licensed local lawyer should confirm.
        - Be accurate and cautious.
        - Do NOT hallucinate.
      `;

      let userContent: any;
      if (typeof content === "string") {
        userContent = { text: content };
      } else {
        userContent = {
          inlineData: {
            data: content.data,
            mimeType: content.mimeType,
          },
        };
      }
      contents = [{ role: "user", parts: [userContent] }];
    }

    const result = await generateWithRetry({ contents, systemInstruction, schema });
    res.status(200).json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Analysis error:", error);
    const friendlyMessage = isOverloadedError(error)
      ? "The AI service is under very high load right now. Please wait 30 seconds and try again."
      : error.message || "Failed to analyze document.";
    res.status(500).json({ error: friendlyMessage });
  }
}
