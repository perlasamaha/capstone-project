import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    // Identity that comes from the OAuth provider. A user is looked up by
    // provider + account id (not by email), so a GitHub and a Google account
    // that happen to share an email are never merged silently.
    provider: { type: String, enum: ["github", "google"], required: true },
    providerAccountId: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    image: { type: String },

    // Public profile. These are the fields the user can edit in /settings.
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    bio: { type: String, default: "", maxlength: 280 },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Sign-in lookup: "do we already have a user for this GitHub/Google account?"
userSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User =
  (mongoose.models.User as Model<UserDoc>) ?? mongoose.model<UserDoc>("User", userSchema);
