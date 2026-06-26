import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini only if key is present
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json({ limit: '20mb' }));

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
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
      if (typeof content === 'string') {
        userContent = { text: content };
      } else {
        userContent = {
          inlineData: {
            data: content.data,
            mimeType: content.mimeType
          }
        };
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [userContent] }],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze document." });
    }
  });

  // Stripe Checkout Skeleton
  app.post("/api/create-checkout-session", async (req, res) => {
    const { userId, plan } = req.body;
    
    // In a real app, you'd use safe initialization as per guidelines:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log(`Creating ${plan} session for user ${userId}`);
    
    // Mock response for now as we don't have a real key
    res.json({ 
      url: "https://checkout.stripe.com/mock-session",
      message: "In a production environment, this would redirect to Stripe Checkout."
    });
  });

  // Example API route for analysis (placeholder - Gemini should be client-side as per skill guidelines if possible, but large docs might benefit from server proxies if needed. However, the skill explicitly says 'Always call Gemini API from the frontend')
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
