import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { BookmarkButton } from "@/components/posts/bookmark-button";
import { PostContent } from "@/components/posts/post-content";
import { PostOwnerActions } from "@/components/posts/post-owner-actions";
import { Avatar } from "@/components/ui/avatar";
import { TopicLink } from "@/components/ui/badge";
import { getCommentsForPost } from "@/lib/services/comments";
import { getPublishedPostBySlug } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils";

// ISR. Reading a post is the most common request and the content is the same
// for everyone, so the page is cached. Editing/deleting the post or adding a
// comment calls revalidatePath for this URL, so readers see changes right
// away; the hourly revalidate is only a fallback. Everything that depends on
// the visitor (bookmark state, edit/delete, comment form) is a small client
// island that asks the API after the page loads.
export const revalidate = 3600;

// Posts are rendered on their first visit and cached from then on, instead of
// all being built ahead of time.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const comments = await getCommentsForPost(post.id);

  return (
    <div className="mx-auto max-w-3xl">
      <article>
        <header className="mb-8 space-y-4 border-b border-line pb-6">
          <Link
            href={`/communities/${post.community.slug}`}
            className="text-sm font-medium text-link hover:underline"
          >
            {post.community.name}
          </Link>
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TopicLink key={tag} topic={tag} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-3 hover:text-link"
            >
              <Avatar name={post.author.name} image={post.author.image} />
              <span>
                <span className="block text-sm font-medium">{post.author.name}</span>
                <span className="block text-xs text-muted">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  )}
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap items-start gap-2">
              <BookmarkButton postId={post.id} showLabel />
              <PostOwnerActions postId={post.id} slug={post.slug} authorId={post.author.id} />
            </div>
          </div>
        </header>

        <PostContent content={post.content} />
      </article>

      <section id="comments" aria-labelledby="comments-heading" className="mt-12 space-y-5">
        <h2 id="comments-heading" className="text-lg font-semibold">
          Comments ({comments.length})
        </h2>
        <CommentForm postId={post.id} />
        <CommentList comments={comments} />
      </section>
    </div>
  );
}
