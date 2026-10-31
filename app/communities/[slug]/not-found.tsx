import { Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CommunityNotFound() {
  return (
    <EmptyState
      icon={Users}
      title="Community not found"
      description="This community doesn't exist. It may have been renamed or the link is wrong."
      action={<ButtonLink href="/communities">Browse communities</ButtonLink>}
    />
  );
}
