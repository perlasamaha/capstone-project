import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { TopicLink } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { PostCard as Post } from "@/types";

export function PostCard({ post, action }: { post: Post; action?: ReactNode }) {
  return (
    <article className="flex gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-zinc-700">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <Link
            href={`/communities/${post.community.slug}`}
            className="font-medium text-link hover:underline"
          >
            {post.community.name}
          </Link>
          {post.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </>
          )}
        </div>

        <h3 className="mt-1.5 text-base leading-snug font-semibold">
          <Link href={`/blogs/${post.slug}`} className="hover:text-link">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{post.excerpt}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/profile/${post.author.username}`}
            className="flex items-center gap-2 text-sm text-muted hover:text-fg"
          >
            <Avatar name={post.author.name} image={post.author.image} size="xs" />
            {post.author.name}
          </Link>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <TopicLink key={tag} topic={tag} />
              ))}
            </div>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </article>
  );
}
