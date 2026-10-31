import { Search, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { withParams } from "@/lib/utils";
import type { PostQuery } from "@/schemas/query";
import type { CommunityOption } from "@/types";

type Filters = Pick<PostQuery, "search" | "community" | "topic" | "author">;

/**
 * The filters are a plain GET form: submitting it just changes the URL
 * (/blogs?search=...&community=...), and the page reads the URL on the server
 * and queries MongoDB. No client state, works without JavaScript, and every
 * result set is shareable. next/form adds client-side navigation on top.
 */
export function BlogFilters({
  filters,
  communities,
  topics,
}: {
  filters: Filters;
  communities: CommunityOption[];
  topics: string[];
}) {
  const active = Object.entries(filters).filter(([, value]) => value) as [keyof Filters, string][];
  // Make sure a topic that came from a link is still selectable in the list.
  const topicOptions = filters.topic && !topics.includes(filters.topic) ? [filters.topic, ...topics] : topics;

  return (
    <div className="mb-6 space-y-3">
      <Form
        action="/blogs"
        // Remount when the URL changes so the inputs show the new filters
        // (defaultValue is only read on mount).
        key={JSON.stringify(filters)}
        className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
      >
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <Input
            type="search"
            name="search"
            defaultValue={filters.search}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="pl-9"
          />
        </div>
        <Select name="community" defaultValue={filters.community ?? ""} aria-label="Community">
          <option value="">All communities</option>
          {communities.map((community) => (
            <option key={community.id} value={community.slug}>
              {community.name}
            </option>
          ))}
        </Select>
        <Select name="topic" defaultValue={filters.topic ?? ""} aria-label="Topic">
          <option value="">All topics</option>
          {topicOptions.map((topic) => (
            <option key={topic} value={topic}>
              #{topic}
            </option>
          ))}
        </Select>
        {filters.author && <input type="hidden" name="author" value={filters.author} />}
        <Button type="submit" className="sm:col-span-2 lg:col-span-1">
          Apply
        </Button>
      </Form>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Filtered by</span>
          {active.map(([key, value]) => (
            <Link
              key={key}
              href={withParams("/blogs", filters, { [key]: undefined })}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs hover:border-accent/40"
              aria-label={`Remove ${key} filter`}
            >
              {labelFor(key, value)}
              <X className="size-3" aria-hidden />
            </Link>
          ))}
          <Link href="/blogs" className="text-xs text-link hover:underline">
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}

function labelFor(key: keyof Filters, value: string) {
  switch (key) {
    case "search":
      return `“${value}”`;
    case "topic":
      return `#${value}`;
    case "author":
      return `@${value}`;
    default:
      return value;
  }
}
