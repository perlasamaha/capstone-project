import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HttpError } from "@/lib/errors";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/** For protected pages: no session -> go sign in, then come back here. */
export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=${encodeURIComponent(returnTo)}`);
  return user;
}

/** For Route Handlers: no session -> 401. */
export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "You need to be signed in to do that");
  return user;
}
