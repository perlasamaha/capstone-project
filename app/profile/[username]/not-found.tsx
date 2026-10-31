import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProfileNotFound() {
  return (
    <EmptyState
      icon={UserX}
      title="Developer not found"
      description="There's no developer with this username. They may have changed it."
      action={<ButtonLink href="/">Back to explore</ButtonLink>}
    />
  );
}
