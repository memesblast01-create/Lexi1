import { AnalysisSummary, DocumentType } from "../types";

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    simpleSummary: { type: "string", description: "A simple summary of the document in plain language." },
    jurisdiction: {
      type: "object",
      properties: {
        detectedCountry: { type: "string", description: "The country/legal jurisdiction this document appears to be governed by, based on signals like addresses, currency, legal terminology, named courts, or an explicit governing-law clause. Use 'Unspecified' if no reliable signal exists." },
        confidence: { type: "string", enum: ["High", "Medium", "Low", "Unknown"] },
        evidence: { type: "string", description: "Brief explanation of what in the document indicated this jurisdiction (e.g. 'Governing law clause names UAE federal law', or 'Currency in AED and reference to Dubai courts'). Empty string if jurisdiction is Unspecified." },
        legalNote: { type: "string", description: "A short note on how the risk analysis below was adjusted for this jurisdiction's local laws (e.g. labor law caps, mandatory clauses, consumer protections specific to that country). Empty string if jurisdiction is Unspecified." }
      },
      required: ["detectedCountry", "confidence", "evidence", "legalNote"]
    },
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
    "jurisdiction",
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

export async function translateAnalysis(
  existingAnalysis: AnalysisSummary,
  language: string
): Promise<AnalysisSummary> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'translate',
      existingAnalysis,
      language,
      schema: ANALYSIS_SCHEMA
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to translate report.');
  }

  return response.json();
}
