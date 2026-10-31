import Link from "next/link";
import { DeleteCommentButton } from "@/components/comments/delete-comment-button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { CommentItem } from "@/types";

export function CommentList({ comments }: { comments: CommentItem[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted">No comments yet. Start the discussion.</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-3">
          <Avatar name={comment.author.name} image={comment.author.image} size="sm" />
          <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-medium hover:text-link"
                >
                  {comment.author.name}
                </Link>
                <span className="text-muted">
                  {" · "}
                  <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                </span>
              </p>
              <DeleteCommentButton commentId={comment.id} authorId={comment.author.id} />
            </div>
            <p className="mt-1.5 text-sm whitespace-pre-wrap text-fg/90">{comment.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
