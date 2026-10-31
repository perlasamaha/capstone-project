import { FileSearch, PenLine } from "lucide-react";
import type { Metadata } from "next";
import { BlogFilters } from "@/components/posts/blog-filters";
import { BookmarkButton } from "@/components/posts/bookmark-button";
import { PostCard } from "@/components/posts/post-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { getBookmarkedPostIds } from "@/lib/services/bookmarks";
import { getAllTopics, getCommunityOptions } from "@/lib/services/communities";
import { listPublishedPosts } from "@/lib/services/posts";
import { getCurrentUser } from "@/lib/session";
import { pluralize } from "@/lib/utils";
import { firstValues, parseLenient, postQuerySchema } from "@/schemas/query";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Search and filter technical posts by community, topic and author.",
};

// Dynamic: every combination of search/filters/page is a different query, so
// this page is rendered per request and filtering/pagination happen in
// MongoDB, not in the browser. Because it's dynamic anyway, it can also read
// the session and show each user's bookmarks without extra requests.
export default async function BlogsPage({ searchParams }: PageProps<"/blogs">) {
  const query = parseLenient(postQuerySchema, firstValues(await searchParams));

  const [result, communities, allTopics, user] = await Promise.all([
    listPublishedPosts(query),
    getCommunityOptions(),
    getAllTopics(),
    getCurrentUser(),
  ]);

  const bookmarked = user
    ? await getBookmarkedPostIds(user.id, result.items.map((post) => post.id))
    : new Set<string>();

  // With a community selected, only offer that community's topics.
  const topics = query.community
    ? (communities.find((c) => c.slug === query.community)?.topics ?? [])
    : allTopics;

  const filters = {
    search: query.search,
    community: query.community,
    topic: query.topic,
    author: query.author,
  };
  const isFiltered = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Technical posts from the community, newest first."
        actions={
          <ButtonLink href="/create">
            <PenLine aria-hidden /> Write a post
          </ButtonLink>
        }
      />

      <BlogFilters filters={filters} communities={communities} topics={topics} />

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {pluralize(result.total, "post")}
        {isFiltered ? " found" : ""}
      </p>

      {result.items.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title={isFiltered ? "No posts match these filters" : "No posts yet"}
          description={
            isFiltered
              ? "Try a different search term or remove a filter."
              : "Nobody has published anything yet. Be the first!"
          }
          action={
            isFiltered ? (
              <ButtonLink href="/blogs" variant="secondary">
                Clear filters
              </ButtonLink>
            ) : (
              <ButtonLink href="/create">Write a post</ButtonLink>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {result.items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              action={
                <BookmarkButton
                  postId={post.id}
                  initialBookmarked={user ? bookmarked.has(post.id) : undefined}
                />
              }
            />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/blogs"
        params={filters}
      />
    </>
  );
}
