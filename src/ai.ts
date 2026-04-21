// CLI ai.ts module
// This file makes an HTTP POST request to our backend API to describe unknown environment variables.

export async function describeWithAI(needAI: any[]): Promise<Map<string, any>> {
  const aiDescriptions = new Map<string, any>();
  const varNames = needAI.map((v) => v.key || v.name || v);

  // You can change this to your deployed API URL later (e.g. https://api.envdoc.site/api/describe)
  const API_URL = process.env.ENVDOC_API_URL || "https://api.envdoc.site/api/describe";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vars: varNames }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const responseData = await response.json();
    
    // Handle the new { data, isFallback } format vs the old direct object format
    const data = responseData.data || responseData;
    
    for (const [key, details] of Object.entries(data)) {
      if (key === 'isFallback') continue; // Skip the metadata flag
      aiDescriptions.set(key, details);
    }
  } catch (error) {
    console.error("Error fetching AI descriptions from backend:", error);
    throw error;
  }

  return aiDescriptions;
}
