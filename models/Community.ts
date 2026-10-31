import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const communitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    // A short curated list of hashtags. It's small, bounded and always read
    // together with the community, so it is embedded instead of being its
    // own collection.
    topics: { type: [String], default: [] },
    // Members live in the Membership collection. We keep a counter here so the
    // explore page doesn't have to count memberships for every card.
    memberCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export type CommunityDoc = InferSchemaType<typeof communitySchema>;

export const Community =
  (mongoose.models.Community as Model<CommunityDoc>) ??
  mongoose.model<CommunityDoc>("Community", communitySchema);
