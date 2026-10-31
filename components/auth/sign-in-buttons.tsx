"use client";

// Client Component: reads ?callbackUrl and ?error in the browser
// (useSearchParams), which lets the sign-in page itself be fully static.
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form";

type Provider = "github" | "google";

// Error codes Auth.js puts in the URL when a sign-in fails.
const errorMessages: Record<string, string> = {
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Sign-in is not configured correctly on the server.",
  OAuthCallbackError: "The provider returned an error. Please try again.",
};

function safeCallbackUrl(value: string | null) {
  // Only allow paths on this site, never "//evil.com" or full URLs.
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function SignInButtons() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");
  const [pending, setPending] = useState<Provider | null>(null);

  function handleSignIn(provider: Provider) {
    setPending(provider);
    signIn(provider, { redirectTo: callbackUrl });
  }

  return (
    <div className="space-y-3">
      {error && (
        <FormAlert>{errorMessages[error] ?? "Couldn't sign you in. Please try again."}</FormAlert>
      )}
      <Button
        variant="secondary"
        className="h-11 w-full"
        onClick={() => handleSignIn("github")}
        disabled={pending !== null}
      >
        <GitHubIcon />
        {pending === "github" ? "Redirecting…" : "Continue with GitHub"}
      </Button>
      <Button
        variant="secondary"
        className="h-11 w-full"
        onClick={() => handleSignIn("google")}
        disabled={pending !== null}
      >
        <GoogleIcon />
        {pending === "google" ? "Redirecting…" : "Continue with Google"}
      </Button>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.8-.07-1.57-.2-2.31H12v4.37h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.68Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3a7.2 7.2 0 0 1-10.72-3.78H1.33v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.34 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.33a12 12 0 0 0 0 10.84l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.33 6.58l4.01 3.1A7.15 7.15 0 0 1 12 4.75Z" />
    </svg>
  );
}
