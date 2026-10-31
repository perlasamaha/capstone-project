import "server-only";
import { cache } from "react";
import { isValidObjectId, type QueryFilter, type Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import {
  AUTHOR_FIELDS,
  COMMUNITY_REF_FIELDS,
  toPostCard,
  toPostDetail,
  type LeanPost,
} from "@/lib/mappers";
import { createPostSlug, toExcerpt } from "@/lib/text";
import { Bookmark } from "@/models/Bookmark";
import { Comment } from "@/models/Comment";
import { Community } from "@/models/Community";
import { Post, type PostDoc } from "@/models/Post";
import { User } from "@/models/User";
import type { PostInput, PostUpdate } from "@/schemas/post";
import type { PostQuery } from "@/schemas/query";
import type { Paginated, PostCard, PostStatus, TopicCount } from "@/types";

/** What a Route Handler needs to know to refresh the pages a write affected. */
export type PostChange = {
  id: string;
  slug: string;
  status: PostStatus;
  authorUsername: string;
  communitySlugs: string[];
};

type PostFilter = QueryFilter<PostDoc>;

function findCards(filter: PostFilter, { skip = 0, limit }: { skip?: number; limit: number }) {
  return Post.find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-content")
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost[]>();
}

function emptyPage(page: number): Paginated<PostCard> {
  return { items: [], page, total: 0, totalPages: 1 };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listPublishedPosts(query: PostQuery): Promise<Paginated<PostCard>> {
  await connectDB();
  const filter: PostFilter = { status: "published" };

  // Filters arrive as slugs/usernames (readable URLs), so resolve them to ids.
  // An unknown community or author simply means "no results".
  if (query.community) {
    const community = await Community.findOne({ slug: query.community })
      .select("_id")
      .lean<{ _id: Types.ObjectId }>();
    if (!community) return emptyPage(query.page);
    filter.community = community._id;
  }

  if (query.author) {
    const author = await User.findOne({ username: query.author })
      .select("_id")
      .lean<{ _id: Types.ObjectId }>();
    if (!author) return emptyPage(query.page);
    filter.author = author._id;
  }

  if (query.topic) filter.tags = query.topic;
  if (query.search) filter.$text = { $search: query.search };

  const [docs, total] = await Promise.all([
    findCards(filter, { skip: (query.page - 1) * query.limit, limit: query.limit }),
    Post.countDocuments(filter),
  ]);

  return {
    items: docs.map(toPostCard),
    page: query.page,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getLatestPosts(limit: number) {
  await connectDB();
  const docs = await findCards({ status: "published" }, { limit });
  return docs.map(toPostCard);
}

export async function getCommunityPosts(communityId: string, limit: number) {
  await connectDB();
  const docs = await findCards({ community: communityId, status: "published" }, { limit });
  return docs.map(toPostCard);
}

export async function getPublishedPostsByAuthor(authorId: string, limit: number) {
  await connectDB();
  const docs = await findCards({ author: authorId, status: "published" }, { limit });
  return docs.map(toPostCard);
}

/** Every post of the user, drafts included. Only used on their own dashboard. */
export async function getOwnPosts(userId: string) {
  await connectDB();
  const docs = await Post.find({ author: userId })
    .sort({ updatedAt: -1 })
    .select("-content")
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost[]>();
  return docs.map(toPostCard);
}

export const getPublishedPostBySlug = cache(async (slug: string) => {
  await connectDB();
  const doc = await Post.findOne({ slug, status: "published" })
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost>();
  return doc ? toPostDetail(doc) : null;
});

/** For GET /api/posts/[id]. Drafts only exist for their author. */
export async function getPostForViewer(postId: string, viewerId?: string) {
  if (!isValidObjectId(postId)) return null;
  await connectDB();

  const doc = await Post.findById(postId)
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost>();
  if (!doc) return null;

  const isAuthor = viewerId ? doc.author._id.equals(viewerId) : false;
  if (doc.status !== "published" && !isAuthor) return null;

  return toPostDetail(doc);
}

/** For the edit page: the post plus whether the current user may edit it. */
export async function getPostForEditing(slug: string, userId: string) {
  await connectDB();
  const doc = await Post.findOne({ slug })
    .populate("author", AUTHOR_FIELDS)
    .populate("community", COMMUNITY_REF_FIELDS)
    .lean<LeanPost>();
  if (!doc) return null;
  return { post: toPostDetail(doc), isOwner: doc.author._id.equals(userId) };
}

export async function getPopularTopics(limit: number): Promise<TopicCount[]> {
  await connectDB();
  const rows = await Post.aggregate<{ _id: string; count: number }>([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
  ]);
  return rows.map((row) => ({ topic: row._id, count: row.count }));
}

// ---------------------------------------------------------------------------
// Writes. Every write re-checks ownership here, right next to the database
// call, no matter what the UI shows or hides.
// ---------------------------------------------------------------------------

async function loadCommunityForPost(communityId: string, tags: string[]) {
  const community = await Community.findById(communityId)
    .select("slug topics")
    .lean<{ _id: Types.ObjectId; slug: string; topics: string[] }>();

  if (!community) {
    throw new HttpError(400, "Invalid input", {
      communityId: ["That community doesn't exist"],
    });
  }

  const unknown = tags.filter((tag) => !community.topics.includes(tag));
  if (unknown.length > 0) {
    throw new HttpError(400, "Invalid input", {
      tags: [`Not a topic of this community: ${unknown.join(", ")}`],
    });
  }

  return community;
}

async function findOwnedPost(userId: string, postId: string) {
  if (!isValidObjectId(postId)) throw new HttpError(404, "Post not found");

  const post = await Post.findById(postId);
  if (!post) throw new HttpError(404, "Post not found");

  if (!post.author.equals(userId)) {
    throw new HttpError(403, "You can only change your own posts");
  }
  return post;
}

async function describeChange(
  post: {
    _id: Types.ObjectId;
    slug: string;
    status: string;
    author: Types.ObjectId;
    community: Types.ObjectId;
  },
  previousCommunity?: Types.ObjectId,
): Promise<PostChange> {
  const communityIds = previousCommunity ? [post.community, previousCommunity] : [post.community];
  const [author, communities] = await Promise.all([
    User.findById(post.author).select("username").lean<{ username: string }>(),
    Community.find({ _id: { $in: communityIds } })
      .select("slug")
      .lean<{ slug: string }[]>(),
  ]);

  return {
    id: post._id.toString(),
    slug: post.slug,
    status: post.status as PostStatus,
    authorUsername: author?.username ?? "",
    communitySlugs: communities.map((community) => community.slug),
  };
}

export async function createPost(authorId: string, input: PostInput) {
  await connectDB();
  const tags = Array.from(new Set(input.tags));
  const community = await loadCommunityForPost(input.communityId, tags);

  const post = await Post.create({
    title: input.title,
    slug: createPostSlug(input.title),
    content: input.content,
    excerpt: toExcerpt(input.content),
    author: authorId,
    community: community._id,
    tags,
    status: input.status,
    publishedAt: input.status === "published" ? new Date() : null,
  });

  return describeChange(post);
}

export async function updatePost(userId: string, postId: string, input: PostUpdate) {
  await connectDB();
  const post = await findOwnedPost(userId, postId);
  const previousCommunity = post.community;

  if (input.communityId !== undefined || input.tags !== undefined) {
    const tags = Array.from(new Set(input.tags ?? post.tags));
    const community = await loadCommunityForPost(
      input.communityId ?? post.community.toString(),
      tags,
    );
    post.community = community._id;
    post.tags = tags;
  }

  if (input.title !== undefined) post.title = input.title;

  if (input.content !== undefined) {
    post.content = input.content;
    post.excerpt = toExcerpt(input.content);
  }

  if (input.status !== undefined) {
    // Keep the original publish date if the post is unpublished and
    // published again.
    if (input.status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    post.status = input.status;
  }

  await post.save();

  const moved = !previousCommunity.equals(post.community);
  return describeChange(post, moved ? previousCommunity : undefined);
}

export async function deletePost(userId: string, postId: string) {
  await connectDB();
  const post = await findOwnedPost(userId, postId);
  const change = await describeChange(post);

  await post.deleteOne();
  // Comments and bookmarks are only meaningful together with the post.
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    Bookmark.deleteMany({ post: post._id }),
  ]);

  return change;
}
