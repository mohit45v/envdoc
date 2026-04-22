import { describeVarsWithGemini } from "./ai.service.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as path from "path";

// Load backend env
dotenv.config();

async function testPersistence() {
  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error("❌ MONGODB_URI not found in backend/.env");
    return;
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(URI);
  console.log("✅ Connected.");

  const testKey = "TEST_VAR_" + Math.floor(Math.random() * 1000);
  const testVars = [testKey];

  console.log(`\n--- Test 1: First request for ${testKey} (should call AI and save) ---`);
  const result1 = await describeVarsWithGemini(testVars);
  console.log("Result 1 Category:", result1.data[testKey]?.category);
  console.log("Result 1 IsFallback:", result1.isFallback);

  console.log(`\n--- Test 2: Second request for ${testKey} (should use MongoDB) ---`);
  // If the first one saved correctly, this should return the same data
  const result2 = await describeVarsWithGemini(testVars);
  console.log("Result 2 Description:", result2.data[testKey]?.description);
  console.log("Result 2 IsFallback:", result2.isFallback);

  await mongoose.disconnect();
  console.log("\n✅ Test complete. Connection closed.");
}

testPersistence().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
