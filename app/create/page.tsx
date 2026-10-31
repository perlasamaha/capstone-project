import type { Metadata } from "next";
import { PostForm } from "@/components/posts/post-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCommunityOptions } from "@/lib/services/communities";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Write a post" };

// Protected: guests are sent to sign in first and brought back here after.
export default async function CreatePostPage() {
  await requireUser("/create");
  const communities = await getCommunityOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Write a post"
        description="Save it as a draft while you work on it, publish when it's ready."
      />
      <Card className="p-6">
        <PostForm communities={communities} />
      </Card>
    </div>
  );
}
