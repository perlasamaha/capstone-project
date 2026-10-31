// Plain, serializable shapes that leave the data layer. Mongoose documents
// (ObjectIds, Dates, methods) stay inside lib/services; pages, components and
// API responses only ever see these.

export type Author = {
  id: string;
  name: string;
  username: string;
  image: string | null;
};

export type CommunityCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  topics: string[];
  memberCount: number;
};

export type CommunityOption = Pick<CommunityCard, "id" | "slug" | "name" | "topics">;

export type PostStatus = "draft" | "published";

export type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  author: Author;
  community: { id: string; slug: string; name: string };
};

export type PostDetail = PostCard & { content: string };

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
};

export type Profile = Author & {
  bio: string;
  skills: string[];
  joinedAt: string;
};

export type TopicCount = { topic: string; count: number };

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
};
