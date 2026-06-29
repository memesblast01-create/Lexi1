import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const PRIMARY_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODEL = "gemini-2.5-flash";

function isOverloadedError(err: any): boolean {
  const msg = err?.message || "";
  return err?.status === 503 || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("overloaded");
}

async function generateWithRetry(params: { contents: any; systemInstruction: string; schema: any }) {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const result = await ai.models.generateContent({
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
      if (!isOverloadedError(err)) {
        throw err; // not a capacity issue, no point trying the other model
      }
      // otherwise try the next model in the list
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
    if (!ai) {
      res.status(500).json({ error: "Gemini API key is not configured." });
      return;
    }

    const { content, docType, language, schema, mode, existingAnalysis } = req.body;

    let contents;
    let systemInstruction;

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
        - If a jurisdiction is detected, tailor your risk analysis, "checkCarefully" items, and legal reasoning
          to that specific country's relevant laws (e.g. labor law caps and entitlements, consumer protection
          rules, contract enforceability standards, mandatory disclosure requirements). Mention in legalNote
          briefly how the analysis was adjusted (e.g. "Adjusted for UAE Labour Law end-of-service gratuity rules").
        - If no jurisdiction is detected, analyze using general/common legal principles and say so plainly —
          do not guess a country without evidence.
        - Simplify complex documents into plain language.
        - Highlight risks (unfair terms, hidden conditions, penalties), with jurisdiction-specific context where relevant.
        - Provide structured output.
        - Disclaimer: Include that this is an AI-generated explanation and not a substitute for professional legal advice,
          and that local laws may have changed or have nuances a licensed local lawyer should confirm.
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
      ? "The AI service is experiencing high demand right now. Please try again in a minute."
      : error.message || "Failed to analyze document.";
    res.status(500).json({ error: friendlyMessage });
  }
}
