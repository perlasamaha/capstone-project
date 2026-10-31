import { CalendarDays, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityIcon } from "@/components/communities/community-icon";
import { PostCard } from "@/components/posts/post-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeading } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUserCommunities } from "@/lib/services/communities";
import { getPublishedPostsByAuthor } from "@/lib/services/posts";
import { getProfileByUsername } from "@/lib/services/users";
import { formatMonth } from "@/lib/utils";

// ISR. A public profile looks the same to everyone and changes rarely: when
// the user edits their profile, publishes a post or joins a community. Those
// writes revalidate this path, so the cached page stays correct.
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/profile/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Developer not found" };
  return { title: `${profile.name} (@${profile.username})`, description: profile.bio || undefined };
}

export default async function ProfilePage({ params }: PageProps<"/profile/[username]">) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [posts, communities] = await Promise.all([
    getPublishedPostsByAuthor(profile.id, 10),
    getUserCommunities(profile.id),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <Card className="p-6">
          <Avatar name={profile.name} image={profile.image} size="xl" />
          <h1 className="mt-4 text-xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays className="size-3.5" aria-hidden />
            Joined {formatMonth(profile.joinedAt)}
          </p>

          {profile.skills.length > 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-semibold">Communities</h2>
          {communities.length === 0 ? (
            <p className="text-sm text-muted">Hasn&apos;t joined any communities yet.</p>
          ) : (
            <ul className="space-y-3">
              {communities.map((community) => (
                <li key={community.id}>
                  <Link
                    href={`/communities/${community.slug}`}
                    className="flex items-center gap-3 text-sm hover:text-link"
                  >
                    <CommunityIcon name={community.name} slug={community.slug} size="sm" />
                    {community.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </aside>

      <section>
        <SectionHeading
          title="Published posts"
          href={posts.length > 0 ? `/blogs?author=${profile.username}` : undefined}
          linkLabel="All posts"
        />
        {posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No posts yet"
            description={`${profile.name} hasn't published anything yet.`}
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
  );
}
