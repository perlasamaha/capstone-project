import "server-only";
import { isValidObjectId, type Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import {
  AUTHOR_FIELDS,
  toComment,
  type LeanAuthor,
  type LeanComment,
} from "@/lib/mappers";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import type { CommentInput } from "@/schemas/comment";

export async function getCommentsForPost(postId: string) {
  await connectDB();
  const docs = await Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate("author", AUTHOR_FIELDS)
    .lean<LeanComment[]>();
  return docs.map(toComment);
}

export async function createComment(userId: string, postId: string, input: CommentInput) {
  if (!isValidObjectId(postId)) throw new HttpError(404, "Post not found");
  await connectDB();

  // You can only comment on posts that are actually public.
  const post = await Post.findOne({ _id: postId, status: "published" })
    .select("slug")
    .lean<{ _id: Types.ObjectId; slug: string }>();
  if (!post) throw new HttpError(404, "Post not found");

  // The session is a signed cookie, so it can outlive the user document
  // (e.g. after a database reset). Never save a comment without an author.
  const author = await User.findById(userId).select(AUTHOR_FIELDS).lean<LeanAuthor>();
  if (!author) throw new HttpError(401, "Your account no longer exists. Please sign in again.");

  const comment = await Comment.create({ post: post._id, author: userId, body: input.body });

  return {
    postSlug: post.slug,
    comment: toComment({
      _id: comment._id,
      body: comment.body,
      createdAt: comment.createdAt,
      author,
    }),
  };
}

export async function deleteComment(userId: string, commentId: string) {
  if (!isValidObjectId(commentId)) throw new HttpError(404, "Comment not found");
  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new HttpError(404, "Comment not found");

  if (!comment.author.equals(userId)) {
    throw new HttpError(403, "You can only delete your own comments");
  }

  await comment.deleteOne();

  const post = await Post.findById(comment.post).select("slug").lean<{ slug: string }>();
  return { postSlug: post?.slug ?? null };
}
