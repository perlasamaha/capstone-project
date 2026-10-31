import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// One document per (user, community). Storing members as an array on the
// community would grow without limit for popular communities, so the
// relationship gets its own collection.
const membershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  },
  { timestamps: true },
);

// "Is this user a member?" + "which communities did this user join?".
// Unique so a double click can't create two memberships.
membershipSchema.index({ user: 1, community: 1 }, { unique: true });
// "Newest members of this community" on the community page.
membershipSchema.index({ community: 1, createdAt: -1 });

export type MembershipDoc = InferSchemaType<typeof membershipSchema>;

export const Membership =
  (mongoose.models.Membership as Model<MembershipDoc>) ??
  mongoose.model<MembershipDoc>("Membership", membershipSchema);
