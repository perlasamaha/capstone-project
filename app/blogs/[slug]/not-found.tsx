import { FileX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function PostNotFound() {
  return (
    <EmptyState
      icon={FileX}
      title="Post not found"
      description="This post doesn't exist, was deleted, or hasn't been published."
      action={<ButtonLink href="/blogs">Browse posts</ButtonLink>}
    />
  );
}
