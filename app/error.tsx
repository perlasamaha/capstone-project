"use client";

// Error boundaries must be Client Components: they catch errors while
// rendering and offer a retry in the browser.
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description="We couldn't load this page. This is usually temporary — for example the database didn't respond in time."
      action={
        <div className="flex gap-2">
          {/* retry() fetches the segment again from the server and re-renders it. */}
          <Button onClick={retry}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Go to explore
          </ButtonLink>
        </div>
      }
    />
  );
}
