"use client";

// SessionProvider shares the session through React context, and context only
// exists in Client Components. It wraps the app so small islands like the
// user menu or the join button can call useSession().
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
