import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { describeVarsWithGemini } from "./ai.service.js";
import { connectDB } from "./db.js";
import Variable from "./models/Variable.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware: Set robust HTTP headers
app.use(helmet());

// Strict CORS: Only allow your local environment and production Vercel domains
const allowedOrigins = [
  'http://localhost:5173', 
  'https://envdoc.site',
  'https://www.envdoc.site'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Unauthorized Domain'));
    }
  }
}));

// Rate Limiting: Max 50 requests per IP every 15 minutes to protect your Gemini quota
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});
app.use("/api/describe", apiLimiter);

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

// GET /api/variables: Fetch all learned variables from the Shared Brain
app.get("/api/variables", async (req, res) => {
  try {
    const vars = await Variable.find({}).sort({ category: 1, key: 1 });
    res.json(vars);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch variables", details: error.message });
  }
});

// GET /api/stats: Get the total count of variables learned
app.get("/api/stats", async (req, res) => {
  try {
    const count = await Variable.countDocuments();
    res.json({ total: count });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 envdoc backend API running on http://localhost:${PORT}`);
});
