import { GoogleGenerativeAI } from "@google/generative-ai";

export async function describeVarsWithGemini(vars: any[]): Promise<Record<string, any>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash" });

  const prompt = `You are an expert developer. You are analyzing a list of environment variables.
For each variable, provide a short, accurate description, the likely type (String, Number, Boolean, URL, Secret), and a realistic example value.
If you don't know the exact purpose, make an educated guess based on the name.
Respond ONLY with a valid JSON object where keys are the variable names, and values are objects with "description", "type", and "example".
Do not include markdown code blocks or any other text around the JSON.

Variables to analyze:
${JSON.stringify(vars, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up potential markdown formatting (e.g. ```json ... ```)
    const cleanedResponse = response.replace(/^```json/im, "").replace(/```$/im, "").trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Falling back to mock data due to API failure/rate limit...");
    const mockObj: Record<string, any> = {};
    for (const v of vars) {
      mockObj[v] = {
         description: `Environment configuration for ${v}.`,
         type: "String",
         required: true,
         example: "your_value_here"
      };
    }
    return mockObj;
  }
}
