import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    // Generated once from the title. It doesn't change when the title is
    // edited, so links people shared keep working.
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    // Plain-text preview stored on save, so list queries can skip `content`.
    excerpt: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    // Must be topics of the post's community (checked in the service layer).
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Each index below matches a query in lib/services/posts.ts.
// Latest published posts (explore page, /blogs without filters).
postSchema.index({ status: 1, publishedAt: -1 });
// Posts of a community (community page, ?community= filter).
postSchema.index({ community: 1, status: 1, publishedAt: -1 });
// Posts of an author (profile, dashboard, ?author= filter).
postSchema.index({ author: 1, status: 1, publishedAt: -1 });
// Posts with a topic (?topic= filter). Multikey because tags is an array.
postSchema.index({ tags: 1, status: 1, publishedAt: -1 });
// ?search= uses MongoDB text search. A title match counts more than a body match.
postSchema.index(
  { title: "text", tags: "text", content: "text" },
  { name: "post_text_search", weights: { title: 5, tags: 3, content: 1 } },
);

export type PostDoc = InferSchemaType<typeof postSchema>;

export const Post =
  (mongoose.models.Post as Model<PostDoc>) ?? mongoose.model<PostDoc>("Post", postSchema);
