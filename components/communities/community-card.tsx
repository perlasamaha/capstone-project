import { Users } from "lucide-react";
import Link from "next/link";
import { CommunityIcon } from "@/components/communities/community-icon";
import { pluralize } from "@/lib/utils";
import type { CommunityCard as Community } from "@/types";

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-surface-2/60"
    >
      <div className="flex items-center gap-3">
        <CommunityIcon name={community.name} slug={community.slug} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold group-hover:text-link">{community.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Users className="size-3.5" aria-hidden />
            {pluralize(community.memberCount, "member")}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">{community.description}</p>

      {community.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {community.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
