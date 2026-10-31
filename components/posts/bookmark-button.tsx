"use client";

// Client Component: toggles instantly when clicked and, on cached pages,
// fetches the current user's bookmark state after load. Lists that are
// rendered per request pass `initialBookmarked` so no extra request is made.
import { Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";

export function BookmarkButton({
  postId,
  initialBookmarked,
  showLabel = false,
}: {
  postId: string;
  initialBookmarked?: boolean;
  showLabel?: boolean;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [bookmarked, setBookmarked] = useState<boolean | null>(initialBookmarked ?? null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || initialBookmarked !== undefined) return;
    let ignore = false;

    apiRequest<{ bookmarked: boolean }>(`/api/posts/${postId}/bookmark`, {
      method: "GET",
    }).then((result) => {
      if (!ignore && result.ok) setBookmarked(result.data.bookmarked);
    });

    return () => {
      ignore = true;
    };
  }, [postId, status, initialBookmarked]);

  const label = bookmarked ? "Bookmarked" : "Bookmark";
  const Icon = bookmarked ? BookmarkCheck : Bookmark;

  if (status === "unauthenticated") {
    return (
      <ButtonLink
        href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
        variant="secondary"
        size={showLabel ? "md" : "icon"}
        aria-label={showLabel ? undefined : "Sign in to bookmark"}
      >
        <Bookmark aria-hidden />
        {showLabel && "Bookmark"}
      </ButtonLink>
    );
  }

  async function toggle() {
    const next = !bookmarked;
    // Optimistic: flip right away, roll back if the server says no.
    setBookmarked(next);
    setPending(true);

    const result = await apiRequest(`/api/posts/${postId}/bookmark`, {
      method: next ? "POST" : "DELETE",
    });

    setPending(false);
    if (!result.ok) setBookmarked(!next);
  }

  return (
    <Button
      variant="secondary"
      size={showLabel ? "md" : "icon"}
      onClick={toggle}
      disabled={bookmarked === null || pending}
      aria-pressed={bookmarked ?? undefined}
      aria-label={showLabel ? undefined : label}
      title={label}
      className={bookmarked ? "text-link" : undefined}
    >
      <Icon aria-hidden />
      {showLabel && label}
    </Button>
  );
}
