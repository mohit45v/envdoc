import { EnvEntry } from "./parser.js";
import { knownVars } from "./dictionary/vars.js";

export interface MatchedVar extends EnvEntry {
  dictionaryMatch: boolean;
  needsAI: boolean;
  description?: string;
  type?: string;
  required?: boolean;
  category?: string;
  example?: string;
}

export function matchVars(entries: EnvEntry[], rootDir: string): MatchedVar[] {
  // In a real implementation we would also scan rootDir for usage.
  // For now, we'll just match against the dictionary.
  return entries.map((entry) => {
    const known = knownVars[entry.key];
    if (known) {
      return {
        ...entry,
        dictionaryMatch: true,
        needsAI: false,
        description: known.description,
        type: known.type,
        required: known.required,
        category: known.category,
        example: entry.value,
      };
    }
    
    // If not in dictionary and no existing comment, we need AI to describe it
    return {
      ...entry,
      dictionaryMatch: false,
      needsAI: true,
      description: entry.existingComment,
      example: entry.value,
      category: "Other", // fallback category
    };
  });
}
