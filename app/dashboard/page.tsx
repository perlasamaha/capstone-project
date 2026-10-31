import { FileText, PenLine, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CommunityIcon } from "@/components/communities/community-icon";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { countBookmarks } from "@/lib/services/bookmarks";
import { getUserCommunities } from "@/lib/services/communities";
import { getOwnPosts } from "@/lib/services/posts";
import { getProfileById } from "@/lib/services/users";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

// Dynamic: everything here belongs to the signed-in user (including drafts),
// so it is rendered per request and never cached.
export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  const [profile, posts, communities, bookmarkCount] = await Promise.all([
    getProfileById(user.id),
    getOwnPosts(user.id),
    getUserCommunities(user.id),
    countBookmarks(user.id),
  ]);
  // The session points to a user that no longer exists (e.g. database reset).
  if (!profile) redirect("/signin");

  const published = posts.filter((post) => post.status === "published").length;
  const stats = [
    { label: "Published", value: published },
    { label: "Drafts", value: posts.length - published },
    { label: "Communities", value: communities.length },
    { label: "Bookmarks", value: bookmarkCount },
  ];
  const profileIncomplete = !profile.bio || profile.skills.length === 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.name.split(" ")[0]}`}
        description="Your posts, drafts and communities in one place."
        actions={
          <>
            <ButtonLink href={`/profile/${profile.username}`} variant="secondary">
              View profile
            </ButtonLink>
            <ButtonLink href="/create">
              <PenLine aria-hidden /> New post
            </ButtonLink>
          </>
        }
      />

      {profileIncomplete && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 border-accent/30 bg-accent/5 p-5">
          <Sparkles className="size-5 text-link" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Complete your profile</p>
            <p className="text-sm text-muted">
              Add a short bio and your skills so other developers know who you are.
            </p>
          </div>
          <ButtonLink href="/settings" size="sm">
            Edit profile
          </ButtonLink>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <SectionHeading title="Your posts" />
          {posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="You haven't written anything yet"
              description="Share something you learned recently. Drafts are only visible to you."
              action={<ButtonLink href="/create">Write your first post</ButtonLink>}
            />
          ) : (
            <Card className="divide-y divide-line">
              {posts.map((post) => (
                <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    {post.status === "published" ? (
                      <Link href={`/blogs/${post.slug}`} className="font-medium hover:text-link">
                        {post.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{post.title}</span>
                    )}
                    <p className="text-xs text-muted">
                      {post.community.name} · Updated {formatDate(post.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={post.status === "published" ? "success" : "warning"}>
                    {post.status === "published" ? "Published" : "Draft"}
                  </Badge>
                  <ButtonLink href={`/blogs/${post.slug}/edit`} variant="secondary" size="sm">
                    Edit
                  </ButtonLink>
                </div>
              ))}
            </Card>
          )}
        </section>

        <section>
          <SectionHeading title="Your communities" />
          {communities.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No communities yet"
              description="Join communities to follow the topics you care about."
              action={
                <ButtonLink href="/communities" variant="secondary">
                  Browse communities
                </ButtonLink>
              }
            />
          ) : (
            <Card className="p-2">
              <ul>
                {communities.map((community) => (
                  <li key={community.id}>
                    <Link
                      href={`/communities/${community.slug}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                    >
                      <CommunityIcon name={community.name} slug={community.slug} size="sm" />
                      {community.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
