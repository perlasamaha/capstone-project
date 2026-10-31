import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/profile/settings-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getProfileById } from "@/lib/services/users";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

// Dynamic and protected: shows and edits the signed-in user's own profile.
export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const profile = await getProfileById(user.id);
  if (!profile) redirect("/signin");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="This is what other developers see on your profile." />
      <Card className="p-6">
        <SettingsForm profile={profile} />
      </Card>
    </div>
  );
}
