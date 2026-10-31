import "server-only";
import { isValidObjectId, Types } from "mongoose";
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

// A bookmarked post can go back to draft. Those bookmarks are kept (the post
// may be published again) but they are skipped *before* paginating and
// counting, so page sizes and totals match what the user actually sees.
const onlyPublishedPosts = [
  {
    $lookup: {
      from: Post.collection.name,
      localField: "post",
      foreignField: "_id",
      pipeline: [{ $match: { status: "published" } }, { $project: { _id: 1 } }],
      as: "published",
    },
  },
  { $match: { "published.0": { $exists: true } } },
];

export async function countBookmarks(userId: string) {
  await connectDB();
  const [row] = await Bookmark.aggregate<{ total: number }>([
    { $match: { user: new Types.ObjectId(userId) } },
    ...onlyPublishedPosts,
    { $count: "total" },
  ]);
  return row?.total ?? 0;
}

export async function listBookmarks(
  userId: string,
  page: number,
  limit: number,
): Promise<Paginated<PostCard>> {
  await connectDB();

  const [result] = await Bookmark.aggregate<{
    page: { post: Types.ObjectId }[];
    total: { count: number }[];
  }>([
    // Uses the { user, createdAt } index.
    { $match: { user: new Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    ...onlyPublishedPosts,
    {
      $facet: {
        page: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $project: { _id: 0, post: 1 } }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const ids = result.page.map((bookmark) => bookmark.post);
  const total = result.total[0]?.count ?? 0;

  const docs = await Post.find({ _id: { $in: ids } })
    .select("-content")
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost[]>();

  // $in doesn't keep the order, so put the posts back in bookmark order.
  const byId = new Map(docs.map((doc) => [doc._id.toString(), doc]));
  const items = ids.flatMap((id) => {
    const doc = byId.get(id.toString());
    return doc ? [toPostCard(doc)] : [];
  });

  return { items, page, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
