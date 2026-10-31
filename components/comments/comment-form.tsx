"use client";

// Client Component: form state, validation feedback and the session check
// (the blog page around it is cached, so it can't know who is signed in).
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { apiRequest } from "@/lib/client-api";
import { commentInputSchema } from "@/schemas/comment";

export function CommentForm({ postId }: { postId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
        <Link
          href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
          className="font-medium text-link hover:underline"
        >
          Sign in
        </Link>{" "}
        to join the discussion.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = commentInputSchema.safeParse({ body });
    if (!parsed.success) {
      setError(z.flattenError(parsed.error).fieldErrors.body?.[0] ?? "Invalid comment");
      return;
    }

    setError(null);
    setPending(true);
    const result = await apiRequest(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: parsed.data,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.fieldErrors?.body?.[0] ?? result.error);
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <Textarea
        id="comment"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder="Add to the discussion…"
        maxLength={2000}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "comment-error" : undefined}
      />
      <div className="flex items-center justify-between gap-3">
        <p id="comment-error" role="alert" className="text-xs text-danger">
          {error}
        </p>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
