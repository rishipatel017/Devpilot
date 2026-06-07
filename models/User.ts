import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;   // bcrypt hash; null for OAuth users
  image?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:       { type: String },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String },
    image:      { type: String },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
