import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

// Static: nothing on this page depends on the request. The only dynamic bits
// (?callbackUrl, ?error) are read in the browser by SignInButtons, which is
// why it sits in a Suspense boundary.
export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm py-10">
      <Card className="p-8">
        <h1 className="text-xl font-semibold">Sign in to DevCommunity</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Join communities, write posts, comment and bookmark what you want to read later.
        </p>
        <Suspense>
          <SignInButtons />
        </Suspense>
        <p className="mt-6 text-xs text-muted">
          We only use your name, email and avatar from the provider to create your profile.
        </p>
      </Card>
    </div>
  );
}
