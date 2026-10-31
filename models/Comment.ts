import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// Comments are referenced, not embedded in the post: a busy post could collect
// thousands of them (16MB document limit), each one has its own author, and
// they are written by many users at the same time.
const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

// Comments of a post, oldest first. Also used to clean up when a post is deleted.
commentSchema.index({ post: 1, createdAt: 1 });

export type CommentDoc = InferSchemaType<typeof commentSchema>;

export const Comment =
  (mongoose.models.Comment as Model<CommentDoc>) ??
  mongoose.model<CommentDoc>("Comment", commentSchema);
