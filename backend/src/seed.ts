import mongoose from "mongoose";
import dotenv from "dotenv";
import { knownVars } from "./dictionary.js";
import Variable from "./models/Variable.js";

dotenv.config();

async function seedDatabase() {
  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(URI);
    console.log("✅ Connected.");

    console.log(`Seeding ${Object.keys(knownVars).length} variables...`);

    const operations = Object.entries(knownVars).map(([key, details]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            ...details,
            category: "General", // Default category for seeds
          }
        },
        upsert: true
      }
    }));

    const result = await Variable.bulkWrite(operations);
    
    console.log("-----------------------------------------");
    console.log(`✅ Seeding Complete!`);
    console.log(`- Inserted: ${result.upsertedCount}`);
    console.log(`- Updated: ${result.modifiedCount}`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected.");
    process.exit(0);
  }
}

seedDatabase();
