import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { PostForm } from "@/components/posts/post-form";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCommunityOptions } from "@/lib/services/communities";
import { getPostForEditing } from "@/lib/services/posts";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit post" };

// Dynamic and protected: depends on who is signed in.
export default async function EditPostPage({ params }: PageProps<"/blogs/[slug]/edit">) {
  const { slug } = await params;
  const user = await requireUser(`/blogs/${slug}/edit`);

  const [result, communities] = await Promise.all([
    getPostForEditing(slug, user.id),
    getCommunityOptions(),
  ]);
  if (!result) notFound();

  // Signed in, but not the author. The API would reject the save anyway.
  if (!result.isOwner) {
    return (
      <EmptyState
        icon={Lock}
        title="You can't edit this post"
        description="Only the author of a post can edit or delete it."
        action={
          <ButtonLink href={`/blogs/${slug}`} variant="secondary">
            Back to the post
          </ButtonLink>
        }
      />
    );
  }

  const { post } = result;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit post"
        description={post.status === "draft" ? "This post is a draft." : "This post is published."}
      />
      <Card className="p-6">
        <PostForm communities={communities} post={post} />
      </Card>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 border-red-500/20 p-6">
        <div>
          <h2 className="text-sm font-semibold">Delete this post</h2>
          <p className="text-sm text-muted">This also removes its comments. It can&apos;t be undone.</p>
        </div>
        <DeletePostButton postId={post.id} />
      </Card>
    </div>
  );
}
