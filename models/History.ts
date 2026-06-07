import mongoose, { Schema, Document, Model } from 'mongoose';

export type ToolType = 'resume' | 'github' | 'debug' | 'docs' | 'sql';

export interface IHistory extends Document {
  userId: mongoose.Types.ObjectId;
  tool: ToolType;
  input: Record<string, unknown>;   // flexible — each tool has different inputs
  output: string;                   // full AI response text
  createdAt: Date;
}

const HistorySchema = new Schema<IHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tool:   { type: String, enum: ['resume', 'github', 'debug', 'docs', 'sql'], required: true },
    input:  { type: Schema.Types.Mixed, required: true },
    output: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound indexes for dashboard history queries
HistorySchema.index({ userId: 1, tool: 1 });
HistorySchema.index({ userId: 1, createdAt: -1 });

export const History: Model<IHistory> =
  mongoose.models.History || mongoose.model<IHistory>('History', HistorySchema);
