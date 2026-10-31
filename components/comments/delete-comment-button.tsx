"use client";

// Client Component: only the comment's author sees this (decided from the
// browser session, because the comment list is part of a cached page). The
// API checks ownership again before deleting anything.
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { apiRequest } from "@/lib/client-api";

export function DeleteCommentButton({
  commentId,
  authorId,
}: {
  commentId: string;
  authorId: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (session?.user?.id !== authorId) return null;

  async function handleDelete() {
    if (!window.confirm("Delete this comment?")) return;
    setPending(true);
    const result = await apiRequest(`/api/comments/${commentId}`, { method: "DELETE" });
    setPending(false);
    if (result.ok) router.refresh();
    else window.alert(result.error);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded p-1 text-muted transition-colors hover:text-danger disabled:opacity-50"
      aria-label="Delete comment"
      title="Delete comment"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
