import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIResponse = async (messages, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

      const prompt = messages.find(m => m.role === "user")?.content || "";
      const systemPrompt = messages.find(m => m.role === "system")?.content || "";

      const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
      return result.response.text();

    } catch (error) {
      const isRateLimit = error.message?.includes("429") || error.status === 429;

      if (isRateLimit && i < retries - 1) {
        console.warn(`[Gemini] Rate limited (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }

      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
};

export const generateWebsiteCode = async (userPrompt) => {
  return generateAIResponse([
    {
      role: "system",
      content:
        "You are a senior frontend web developer. Generate a complete production-ready website using: HTML, CSS and JavaScript. Requirements: Responsive, Modern UI, Clean design, Include navbar, hero section and contact form and all pages Accoridng to Requirements. Return only code in Seperate Files index.html for html, style.css for css and script.js for javascript.",
    },
    {
      role: "user",
      content: userPrompt,
    },
  ]);
};
