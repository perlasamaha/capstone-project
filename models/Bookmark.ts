import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// Own collection instead of an array on the user: the list is unbounded, it's
// paginated newest-first on /bookmarks, and we often only need to know whether
// one specific post is bookmarked.
const bookmarkSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true },
);

// "Did I bookmark this post?" and no duplicate bookmarks.
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
// The /bookmarks page, newest first.
bookmarkSchema.index({ user: 1, createdAt: -1 });

export type BookmarkDoc = InferSchemaType<typeof bookmarkSchema>;

export const Bookmark =
  (mongoose.models.Bookmark as Model<BookmarkDoc>) ??
  mongoose.model<BookmarkDoc>("Bookmark", bookmarkSchema);
