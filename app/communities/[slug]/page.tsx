import { FileText, PenLine, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityIcon } from "@/components/communities/community-icon";
import { JoinCommunityButton } from "@/components/communities/join-community-button";
import { PostCard } from "@/components/posts/post-card";
import { Avatar } from "@/components/ui/avatar";
import { TopicLink } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCommunityBySlug,
  getCommunitySlugs,
  getRecentMembers,
} from "@/lib/services/communities";
import { getCommunityPosts } from "@/lib/services/posts";
import { pluralize } from "@/lib/utils";

// ISR. The page is the same for every visitor, so it is cached and served
// statically. Writes that change it (new post, join/leave) call
// revalidatePath for this URL; the hourly revalidate is only a safety net.
export const revalidate = 3600;

// There are only a handful of curated communities, so all of them are
// pre-rendered at build time. A community added later is rendered on its
// first visit and cached from then on.
export async function generateStaticParams() {
  const slugs = await getCommunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/communities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) return { title: "Community not found" };
  return { title: community.name, description: community.description };
}

export default async function CommunityPage({ params }: PageProps<"/communities/[slug]">) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  const [posts, members] = await Promise.all([
    getCommunityPosts(community.id, 10),
    getRecentMembers(community.id, 12),
  ]);

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-start gap-5 p-6">
        <CommunityIcon name={community.name} slug={community.slug} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{community.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{community.description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Users className="size-4" aria-hidden />
            {pluralize(community.memberCount, "member")}
          </p>
        </div>
        <JoinCommunityButton slug={community.slug} />
      </Card>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <SectionHeading
            title="Latest posts"
            href={`/blogs?community=${community.slug}`}
            linkLabel="All posts"
          />
          {posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description={`Be the first to write something for the ${community.name} community.`}
              action={
                <ButtonLink href="/create">
                  <PenLine aria-hidden /> Write a post
                </ButtonLink>
              }
            />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Topics</h2>
            {community.topics.length === 0 ? (
              <p className="text-sm text-muted">No topics yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {community.topics.map((topic) => (
                  <TopicLink key={topic} topic={topic} community={community.slug} />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Newest members</h2>
            {members.length === 0 ? (
              <p className="text-sm text-muted">Nobody has joined yet.</p>
            ) : (
              <ul className="space-y-3">
                {members.map((member) => (
                  <li key={member.id}>
                    <Link
                      href={`/profile/${member.username}`}
                      className="flex items-center gap-3 text-sm hover:text-link"
                    >
                      <Avatar name={member.name} image={member.image} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate">{member.name}</span>
                        <span className="block truncate text-xs text-muted">
                          @{member.username}
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
    </div>
  );
}
