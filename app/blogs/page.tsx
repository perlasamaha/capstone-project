import { FileSearch, PenLine } from "lucide-react";
import type { Metadata } from "next";
import { PostCard } from "@/components/posts/post-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { listPublishedPosts } from "@/lib/services/posts";
import { pluralize } from "@/lib/utils";
import { firstValues, postQuerySchema } from "@/schemas/query";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Technical posts from the community.",
};

// Dynamic: the page number and filters come from the URL, so this page is
// rendered per request and the query runs in MongoDB.
export default async function BlogsPage({ searchParams }: PageProps<"/blogs">) {
  const parsed = postQuerySchema.safeParse(firstValues(await searchParams));
  const query = parsed.success ? parsed.data : postQuerySchema.parse({});
  const result = await listPublishedPosts(query);
  const filters = { community: query.community, topic: query.topic, author: query.author };

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

      <p className="mb-3 text-sm text-muted">{pluralize(result.total, "post")}</p>

      {result.items.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No posts yet"
          description="Nobody has published anything yet. Be the first!"
          action={<ButtonLink href="/create">Write a post</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {result.items.map((post) => (
            <PostCard key={post.id} post={post} />
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
