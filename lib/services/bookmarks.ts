import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB, isDuplicateKeyError } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import {
  AUTHOR_FIELDS,
  COMMUNITY_REF_FIELDS,
  toPostCard,
  type LeanPost,
} from "@/lib/mappers";
import { Bookmark } from "@/models/Bookmark";
import { Post } from "@/models/Post";
import type { Paginated, PostCard } from "@/types";

function assertPostId(postId: string) {
  if (!isValidObjectId(postId)) throw new HttpError(404, "Post not found");
}

export async function isBookmarked(userId: string, postId: string) {
  assertPostId(postId);
  await connectDB();
  return Boolean(await Bookmark.exists({ user: userId, post: postId }));
}

/** Which of these posts did the user bookmark? One query for a whole list. */
export async function getBookmarkedPostIds(userId: string, postIds: string[]) {
  if (postIds.length === 0) return new Set<string>();
  await connectDB();
  const docs = await Bookmark.find({ user: userId, post: { $in: postIds } })
    .select("post")
    .lean();
  return new Set(docs.map((doc) => doc.post.toString()));
}

export async function addBookmark(userId: string, postId: string) {
  assertPostId(postId);
  await connectDB();

  const post = await Post.exists({ _id: postId, status: "published" });
  if (!post) throw new HttpError(404, "Post not found");

  try {
    await Bookmark.create({ user: userId, post: postId });
    return { created: true };
  } catch (error) {
    if (isDuplicateKeyError(error)) return { created: false };
    throw error;
  }
}

export async function removeBookmark(userId: string, postId: string) {
  assertPostId(postId);
  await connectDB();
  await Bookmark.deleteOne({ user: userId, post: postId });
}

export async function countBookmarks(userId: string) {
  await connectDB();
  return Bookmark.countDocuments({ user: userId });
}

export async function listBookmarks(
  userId: string,
  page: number,
  limit: number,
): Promise<Paginated<PostCard>> {
  await connectDB();
  const filter = { user: userId };

  const [docs, total] = await Promise.all([
    Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "post",
        select: "-content",
        // A bookmarked post that went back to draft disappears from the list.
        match: { status: "published" },
        populate: [
          { path: "author", select: AUTHOR_FIELDS },
          { path: "community", select: COMMUNITY_REF_FIELDS },
        ],
      })
      .lean<{ post: LeanPost | null }[]>(),
    Bookmark.countDocuments(filter),
  ]);

  return {
    items: docs.flatMap((doc) => (doc.post ? [toPostCard(doc.post)] : [])),
    page,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
