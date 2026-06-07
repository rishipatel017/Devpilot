import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token:     { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired sessions via MongoDB TTL index
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
