import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

    const { content, docType, language, schema } = req.body;
    const modelName = "gemini-2.5-flash-lite"; // gemini-1.5-flash is retired (404s on every call)

    const systemInstruction = `
      You are an advanced AI-powered document analysis engine "LexiAnalyse".
      Analyze the provided document which is a ${docType}.
      Respond in ${language}.
      Follow these rules:
      - Simplify complex documents into plain language.
      - Highlight risks (unfair terms, hidden conditions, penalties).
      - Provide structured output.
      - Disclaimer: Include that this is an AI-generated explanation and not a substitute for professional legal advice.
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

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [userContent] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    res.status(200).json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze document." });
  }
}
