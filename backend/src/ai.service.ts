import { GoogleGenerativeAI } from "@google/generative-ai";
import { knownVars } from "./dictionary";

export async function describeVarsWithGemini(vars: string[]): Promise<{ data: Record<string, any>, isFallback: boolean }> {
  const resultObj: Record<string, any> = {};
  const unknownVars: string[] = [];

  // 1. Try to find variables in the static dictionary first
  for (const v of vars) {
    if (knownVars[v]) {
      resultObj[v] = { ...knownVars[v], example: knownVars[v].example || "your_value_here" };
    } else {
      unknownVars.push(v);
    }
  }

  // 2. If all variables were known, return immediately and save AI quota
  if (unknownVars.length === 0) {
    return { data: resultObj, isFallback: false };
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert developer. You are analyzing a list of environment variables.
For each variable, provide a short, accurate description, the likely type (String, Number, Boolean, URL, Secret), and a realistic example value.
If you don't know the exact purpose, make an educated guess based on the name.
Respond ONLY with a valid JSON object where keys are the variable names, and values are objects with "description", "type", and "example".
Do not include markdown code blocks or any other text around the JSON.

Variables to analyze:
${JSON.stringify(unknownVars, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up potential markdown formatting (e.g. ```json ... ```)
    const cleanedResponse = response.replace(/^```json/im, "").replace(/```$/im, "").trim();
    const aiDescriptions = JSON.parse(cleanedResponse);
    
    // Merge AI results with known vars
    return { data: { ...resultObj, ...aiDescriptions }, isFallback: false };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Falling back to mock data due to API failure/rate limit...");
    
    // For unknown variables that failed, generate mock data
    for (const v of unknownVars) {
      let type = "String";
      let example = `your_${v.toLowerCase()}_value`;
      const vUpper = v.toUpperCase();
      
      if (vUpper.includes('PORT')) { type = 'Number'; example = '3000'; }
      else if (vUpper.includes('URL') || vUpper.includes('URI')) { type = 'URL'; example = 'https://example.com'; }
      else if (vUpper.includes('SECRET') || vUpper.includes('KEY') || vUpper.includes('PASS')) { type = 'Secret'; example = '***'; }
      else if (vUpper.includes('IS_') || vUpper.includes('ENABLE')) { type = 'Boolean'; example = 'true'; }

      resultObj[v] = {
         description: `Description for ${v}`,
         type,
         required: false,
         example
      };
    }
    return { data: resultObj, isFallback: true };
  }
}
