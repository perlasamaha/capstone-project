import { ArrowRight, FileText, Hash, PenLine, Users } from "lucide-react";
import Link from "next/link";
import { CommunityCard } from "@/components/communities/community-card";
import { PostCard } from "@/components/posts/post-card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeaturedCommunities } from "@/lib/services/communities";
import { getLatestPosts, getPopularTopics } from "@/lib/services/posts";
import { getNewestDevelopers } from "@/lib/services/users";
import { pluralize } from "@/lib/utils";

// ISR. The explore page is public and the same for everyone. It pulls from
// several collections (communities, posts, topics, new users), so rather than
// tracking every write that could change it, it is regenerated at most every
// 5 minutes. Publishing or deleting a post also revalidates it right away.
export const revalidate = 300;

export default async function ExplorePage() {
  const [communities, posts, topics, developers] = await Promise.all([
    getFeaturedCommunities(6),
    getLatestPosts(6),
    getPopularTopics(8),
    getNewestDevelopers(5),
  ]);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-10">
        <section className="rounded-2xl border border-line bg-linear-to-br from-accent/25 via-surface to-surface p-8 sm:p-10">
          <p className="text-xs font-semibold tracking-widest text-link uppercase">
            Learn · Share · Build
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Explore developer communities
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Join communities around the technologies you use, read what other developers
            are building, and share what you&apos;ve learned.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/communities">
              Browse communities <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/create" variant="secondary">
              <PenLine aria-hidden /> Write a post
            </ButtonLink>
          </div>
        </section>

        <section>
          <SectionHeading title="Featured communities" href="/communities" />
          {communities.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No communities yet"
              description="Run `npm run seed` to add the starter communities."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading title="Latest posts" href="/blogs" />
          {posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description="Nothing has been published so far. Be the first to share something."
              action={<ButtonLink href="/create">Write a post</ButtonLink>}
            />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Hash className="size-4 text-link" aria-hidden /> Popular topics
          </h2>
          {topics.length === 0 ? (
            <p className="text-sm text-muted">Topics show up here once posts are published.</p>
          ) : (
            <ol className="space-y-1">
              {topics.map(({ topic, count }, index) => (
                <li key={topic}>
                  <Link
                    href={`/blogs?topic=${topic}`}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
                  >
                    <span className="w-4 text-xs text-subtle">{index + 1}</span>
                    <span className="flex-1 truncate">#{topic}</span>
                    <span className="text-xs text-muted">{pluralize(count, "post")}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4 text-link" aria-hidden /> New developers
          </h2>
          {developers.length === 0 ? (
            <p className="text-sm text-muted">No one has signed up yet.</p>
          ) : (
            <ul className="space-y-3">
              {developers.map((developer) => (
                <li key={developer.id}>
                  <Link
                    href={`/profile/${developer.username}`}
                    className="flex items-center gap-3 text-sm hover:text-link"
                  >
                    <Avatar name={developer.name} image={developer.image} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate">{developer.name}</span>
                      <span className="block truncate text-xs text-muted">
                        @{developer.username}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </aside>
    </div>
  );
}
