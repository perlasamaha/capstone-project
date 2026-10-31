"use client";

// Client Component: the community page is cached and the same for everyone,
// but "Join" vs "Leave" depends on who is looking. This button asks the API
// for the current user's membership after the page loads and gives instant
// feedback when clicked.
import { Check, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";

export function JoinCommunityButton({ slug }: { slug: string }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [joined, setJoined] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let ignore = false;

    apiRequest<{ joined: boolean }>(`/api/communities/${slug}/membership`, {
      method: "GET",
    }).then((result) => {
      if (!ignore && result.ok) setJoined(result.data.joined);
    });

    return () => {
      ignore = true;
    };
  }, [slug, status]);

  if (status === "unauthenticated") {
    return (
      <ButtonLink href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}>
        <Plus aria-hidden /> Join community
      </ButtonLink>
    );
  }

  async function toggle() {
    const next = !joined;
    setPending(true);
    setError(null);

    const result = await apiRequest(`/api/communities/${slug}/membership`, {
      method: next ? "POST" : "DELETE",
    });

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setJoined(next);
    // Re-render the server parts of the page (member count and list).
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {joined && (
          <Badge tone="success" className="gap-1">
            <Check className="size-3.5" aria-hidden /> Member
          </Badge>
        )}
        <Button
          variant={joined ? "secondary" : "primary"}
          onClick={toggle}
          disabled={joined === null || pending}
        >
          {joined ? (
            "Leave"
          ) : (
            <>
              <Plus aria-hidden /> Join community
            </>
          )}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
