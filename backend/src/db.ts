import mongoose from "mongoose";

export async function connectDB() {
  const URI = process.env.MONGODB_URI;

  if (!URI) {
    console.warn("⚠️ MONGODB_URI is not defined in .env. Skipping DB connection.");
    return;
  }

  try {
    await mongoose.connect(URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}
