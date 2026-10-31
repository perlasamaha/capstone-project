import "server-only";
import type { Types } from "mongoose";
import type {
  Author,
  CommentItem,
  CommunityCard,
  PostCard,
  PostDetail,
  PostStatus,
  Profile,
} from "@/types";

// Fields we populate on references. Kept in one place so every query returns
// the same author/community shape.
export const AUTHOR_FIELDS = "name username image";
export const COMMUNITY_REF_FIELDS = "name slug";

type Id = Types.ObjectId;

export type LeanAuthor = {
  _id: Id;
  name: string;
  username: string;
  image?: string | null;
};

export type LeanCommunity = {
  _id: Id;
  slug: string;
  name: string;
  description: string;
  topics: string[];
  memberCount: number;
};

export type LeanPost = {
  _id: Id;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  tags: string[];
  status: PostStatus;
  publishedAt?: Date | null;
  updatedAt: Date;
  author: LeanAuthor;
  community: Pick<LeanCommunity, "_id" | "slug" | "name">;
};

export type LeanComment = {
  _id: Id;
  body: string;
  createdAt: Date;
  author: LeanAuthor;
};

export type LeanProfile = LeanAuthor & {
  bio?: string;
  skills?: string[];
  createdAt: Date;
};

export function toAuthor(user: LeanAuthor): Author {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    image: user.image ?? null,
  };
}

export function toCommunityCard(community: LeanCommunity): CommunityCard {
  return {
    id: community._id.toString(),
    slug: community.slug,
    name: community.name,
    description: community.description,
    topics: community.topics ?? [],
    memberCount: community.memberCount ?? 0,
  };
}

export function toPostCard(post: LeanPost): PostCard {
  return {
    id: post._id.toString(),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    tags: post.tags ?? [],
    status: post.status,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    updatedAt: post.updatedAt.toISOString(),
    author: toAuthor(post.author),
    community: {
      id: post.community._id.toString(),
      slug: post.community.slug,
      name: post.community.name,
    },
  };
}

export function toPostDetail(post: LeanPost): PostDetail {
  return { ...toPostCard(post), content: post.content ?? "" };
}

export function toComment(comment: LeanComment): CommentItem {
  return {
    id: comment._id.toString(),
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: toAuthor(comment.author),
  };
}

export function toProfile(user: LeanProfile): Profile {
  return {
    ...toAuthor(user),
    bio: user.bio ?? "",
    skills: user.skills ?? [],
    joinedAt: user.createdAt.toISOString(),
  };
}
