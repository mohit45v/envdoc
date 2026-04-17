import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { describeVarsWithGemini } from "./ai.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/describe", async (req, res) => {
  try {
    const { vars } = req.body;
    
    if (!vars || !Array.isArray(vars) || vars.length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'vars' array in request body." });
    }

    console.log(`Received request to describe ${vars.length} variables.`);
    
    const descriptions = await describeVarsWithGemini(vars);
    res.json(descriptions);
  } catch (error: any) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Internal server error while fetching AI descriptions.", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 envdoc backend API running on http://localhost:${PORT}`);
});
