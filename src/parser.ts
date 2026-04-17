import * as fs from "fs";

export interface EnvEntry {
  key: string;
  value: string;
  existingComment?: string;
}

export function parseEnvFile(filePath: string): EnvEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const entries: EnvEntry[] = [];
  
  let currentComment = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      currentComment += (currentComment ? " " : "") + trimmed.replace(/^#\s*/, "");
      continue;
    }

    if (trimmed && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      // Also look for inline comments
      const rawValue = rest.join("=");
      const valParts = rawValue.split(" #");
      let inlineComment = "";
      let val = rawValue;
      if (valParts.length > 1) {
        inlineComment = valParts.slice(1).join(" #").trim();
        val = valParts[0].trim();
      }

      entries.push({
        key: key.trim(),
        value: val,
        existingComment: currentComment || inlineComment || undefined,
      });
      currentComment = ""; // reset
    } else if (!trimmed) {
      currentComment = ""; // reset on blank lines
    }
  }

  return entries;
}
