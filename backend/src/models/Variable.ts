import mongoose, { Schema, Document } from "mongoose";

export interface IVariable extends Document {
  key: string;
  description: string;
  type: string;
  example: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariableSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    example: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVariable>("Variable", VariableSchema);
