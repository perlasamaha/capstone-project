import { Search, Users } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import { CommunityCard } from "@/components/communities/community-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { listCommunities } from "@/lib/services/communities";
import { pluralize } from "@/lib/utils";
import { communityQuerySchema, firstValues, parseLenient } from "@/schemas/query";

export const metadata: Metadata = {
  title: "Communities",
  description: "Find communities for the technologies you use and care about.",
};

// Dynamic: the result depends on ?search and ?page, so it is rendered per
// request. The search box is a plain GET form, not client state.
export default async function CommunitiesPage({ searchParams }: PageProps<"/communities">) {
  const query = parseLenient(communityQuerySchema, firstValues(await searchParams));
  const result = await listCommunities(query);

  return (
    <>
      <PageHeader
        title="Communities"
        description="Join the communities you care about to follow their topics and posts."
      />

      <Form action="/communities" key={query.search ?? ""} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <Input
            type="search"
            name="search"
            defaultValue={query.search}
            placeholder="Search by name, description or topic…"
            aria-label="Search communities"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </Form>

      {query.search && (
        <p className="mb-4 text-sm text-muted">
          {pluralize(result.total, "community", "communities")} matching “{query.search}”
        </p>
      )}

      {result.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query.search ? "No communities found" : "No communities yet"}
          description={
            query.search
              ? "Try a shorter or different search term."
              : "Communities are added by running the seed script (see README)."
          }
          action={
            query.search && (
              <ButtonLink href="/communities" variant="secondary">
                Show all communities
              </ButtonLink>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/communities"
        params={{ search: query.search }}
      />
    </>
  );
}
