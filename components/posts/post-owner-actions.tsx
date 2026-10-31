"use client";

// Client Component: the blog page is cached and identical for every visitor,
// so whether to show Edit/Delete is decided in the browser from the session.
// This is only about what we display — the API enforces ownership.
import { Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { ButtonLink } from "@/components/ui/button";

export function PostOwnerActions({
  postId,
  slug,
  authorId,
}: {
  postId: string;
  slug: string;
  authorId: string;
}) {
  const { data: session } = useSession();
  if (session?.user?.id !== authorId) return null;

  return (
    <>
      <ButtonLink href={`/blogs/${slug}/edit`} variant="secondary">
        <Pencil aria-hidden /> Edit
      </ButtonLink>
      <DeletePostButton postId={postId} />
    </>
  );
}
