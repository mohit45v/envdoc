import { GoogleGenerativeAI } from "@google/generative-ai";

export async function describeVarsWithGemini(vars: any[]): Promise<{ data: Record<string, any>, isFallback: boolean }> {
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
    
    return { data: JSON.parse(cleanedResponse), isFallback: false };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Falling back to mock data due to API failure/rate limit...");
    const mockObj: Record<string, any> = {};
    for (const v of vars) {
      let type = "String";
      let example = `your_${v.toLowerCase()}_value`;
      const vUpper = v.toUpperCase();
      
      if (vUpper.includes('PORT')) { type = 'Number'; example = '3000'; }
      else if (vUpper.includes('URL') || vUpper.includes('URI')) { type = 'URL'; example = 'https://example.com'; }
      else if (vUpper.includes('SECRET') || vUpper.includes('KEY') || vUpper.includes('PASS')) { type = 'Secret'; example = '***'; }
      else if (vUpper.includes('IS_') || vUpper.includes('ENABLE')) { type = 'Boolean'; example = 'true'; }

      mockObj[v] = {
         description: `Configuration value for ${v}.`,
         type,
         required: false,
         example
      };
    }
    return { data: mockObj, isFallback: true };
  }
}
