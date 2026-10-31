import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { withParams } from "@/lib/utils";

/**
 * Plain links, so every page of results has its own URL and works without
 * JavaScript. `params` are the active filters that must survive paging.
 */
export function Pagination({
  page,
  totalPages,
  pathname,
  params = {},
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    withParams(pathname, params, { page: target > 1 ? target : undefined });

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
      {page > 1 ? (
        <ButtonLink variant="secondary" href={hrefFor(page - 1)}>
          <ChevronLeft aria-hidden /> Previous
        </ButtonLink>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <ButtonLink variant="secondary" href={hrefFor(page + 1)}>
          Next <ChevronRight aria-hidden />
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
