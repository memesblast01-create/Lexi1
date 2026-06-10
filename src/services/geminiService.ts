import { AnalysisSummary, DocumentType } from "../types";

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    simpleSummary: { type: "string", description: "A simple summary of the document in plain language." },
    keyInformation: {
      type: "object",
      properties: {
        parties: { type: "string" },
        dates: { type: "string" },
        paymentTerms: { type: "string" },
        responsibilities: { type: "string" },
      },
      required: ["parties", "dates", "paymentTerms", "responsibilities"]
    },
    clauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          section: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "section", "description"]
      }
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"]
      }
    },
    benefits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"]
      }
    },
    checkCarefully: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"]
      }
    },
    questions: {
      type: "array",
      items: { type: "string" }
    },
    verdict: {
      type: "object",
      properties: {
        score: { type: "string", enum: ["Safe", "Moderate Risk", "High Risk"] },
        reasoning: { type: "string" },
        confidence: { type: "number" },
      },
      required: ["score", "reasoning", "confidence"]
    }
  },
  required: [
    "simpleSummary", 
    "keyInformation", 
    "clauses", 
    "risks", 
    "benefits", 
    "checkCarefully", 
    "questions", 
    "verdict"
  ]
};

export async function analyzeDocument(
  content: string | { data: string; mimeType: string },
  docType: DocumentType,
  language: string = "English"
): Promise<AnalysisSummary> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      docType,
      language,
      schema: ANALYSIS_SCHEMA
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze document.');
  }

  return response.json();
}
