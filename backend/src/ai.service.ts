import { GoogleGenerativeAI } from "@google/generative-ai";
import { knownVars } from "./dictionary.js";
import Variable from "./models/Variable.js";

export const describeVarsWithGemini = async (vars: string[]): Promise<{ data: Record<string, any>, isFallback: boolean }> => {
  const resultObj: Record<string, any> = {};
  let unknownVars: string[] = [];

  // 1. Try to find variables in static dictionary first
  for (const v of vars) {
    if (knownVars[v]) {
      resultObj[v] = { ...knownVars[v], example: knownVars[v].example || "your_value_here" };
    } else {
      unknownVars.push(v);
    }
  }

  // 2. Try to find remaining variables in MongoDB (Shared Brain)
  if (unknownVars.length > 0) {
    try {
      const dbVars = await Variable.find({ key: { $in: unknownVars } });
      for (const dbVar of dbVars) {
        resultObj[dbVar.key] = {
          description: dbVar.description,
          type: dbVar.type,
          example: dbVar.example,
          category: dbVar.category,
          required: false
        };
        // Remove from unknown list
        unknownVars = unknownVars.filter(uv => uv !== dbVar.key);
      }
    } catch (err) {
      console.error("Error querying MongoDB:", err);
    }
  }

  // 3. If all variables were known, return immediately and save AI quota
  if (unknownVars.length === 0) {
    return { data: resultObj, isFallback: false };
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Falling back to mock data.");
    return fallbackToMock(unknownVars, resultObj);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert developer. You are analyzing a list of environment variables.
For each variable, provide a short, accurate description, the likely type (String, Number, Boolean, URL, Secret), a realistic example value, and a category (e.g., Auth, Database, API, etc.).
If you don't know the exact purpose, make an educated guess based on the name.
Respond ONLY with a valid JSON object where keys are the variable names, and values are objects with "description", "type", "example", and "category".
Do not include markdown code blocks or any other text around the JSON.

Variables to analyze:
${JSON.stringify(unknownVars, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const cleanedResponse = response.replace(/^```json/im, "").replace(/```$/im, "").trim();
    const aiDescriptions = JSON.parse(cleanedResponse);

    // 4. Save the newly learned variables to MongoDB
    const toSave = Object.entries(aiDescriptions).map(([key, details]: [string, any]) => ({
      key,
      ...details
    }));

    if (toSave.length > 0) {
      // Use upsert to avoid duplicate key errors
      for (const doc of toSave) {
        await Variable.findOneAndUpdate({ key: doc.key }, doc, { upsert: true });
      }
      console.log(`Successfully learned and saved ${toSave.length} new variables to MongoDB.`);
    }

    return { data: { ...resultObj, ...aiDescriptions }, isFallback: false };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return fallbackToMock(unknownVars, resultObj);
  }
}

function fallbackToMock(unknownVars: string[], resultObj: Record<string, any>) {
  console.log("Falling back to mock data due to API failure/rate limit...");

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
      example,
      category: "Unknown"
    };
  }
  return { data: resultObj, isFallback: true };
}

// export default { describeVarsWithGemini };