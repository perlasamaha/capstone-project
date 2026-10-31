// Run with `npm run seed`. Creates/updates the curated communities and makes
// sure all indexes from the models exist (the text index is needed for
// search). Safe to run more than once.
//
// Node runs this TypeScript file directly (type stripping, Node 22.18+),
// which is why the imports below use relative paths with a .ts extension.
import mongoose from "mongoose";
import { seedCommunities } from "../constants/communities.ts";
import { Bookmark } from "../models/Bookmark.ts";
import { Comment } from "../models/Comment.ts";
import { Community } from "../models/Community.ts";
import { Membership } from "../models/Membership.ts";
import { Post } from "../models/Post.ts";
import { User } from "../models/User.ts";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local first.");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  for (const model of [User, Community, Membership, Post, Comment, Bookmark]) {
    await model.syncIndexes();
  }
  console.log("Indexes are in sync");

  for (const { slug, name, description, topics } of seedCommunities) {
    await Community.updateOne(
      { slug },
      { $set: { name, description, topics } },
      { upsert: true },
    );
  }
  console.log(`Seeded ${seedCommunities.length} communities`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
