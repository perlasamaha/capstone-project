import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import { z } from "zod";
import { BookmarkButton } from "@/components/posts/bookmark-button";
import { PostCard } from "@/components/posts/post-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { listBookmarks } from "@/lib/services/bookmarks";
import { requireUser } from "@/lib/session";
import { firstValues } from "@/schemas/query";

export const metadata: Metadata = { title: "Bookmarks" };

const PAGE_SIZE = 10;
const pageSchema = z.object({ page: z.coerce.number().int().min(1).catch(1) });

// Dynamic: a private list that only exists for the signed-in user.
export default async function BookmarksPage({ searchParams }: PageProps<"/bookmarks">) {
  const user = await requireUser("/bookmarks");
  const { page } = pageSchema.parse(firstValues(await searchParams));
  const result = await listBookmarks(user.id, page, PAGE_SIZE);

  return (
    <>
      <PageHeader title="Bookmarks" description="Posts you saved to read later." />

      {result.items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Use the bookmark button on any post to save it here."
          action={<ButtonLink href="/blogs">Find something to read</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {result.items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              // Un-bookmarking leaves the card in place until the next visit,
              // so a mis-click can be undone right away.
              action={<BookmarkButton postId={post.id} initialBookmarked />}
            />
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} pathname="/bookmarks" />
    </>
  );
}
