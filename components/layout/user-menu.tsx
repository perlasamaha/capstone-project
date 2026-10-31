"use client";

// Client Component: it reads the session in the browser (useSession) and owns
// the dropdown's open/closed state. Reading the session here, instead of
// calling auth() in the root layout, is what lets the public pages stay
// static/ISR — auth() reads cookies and would make every page dynamic.
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status === "loading") {
    return <div className="size-8 animate-pulse rounded-full bg-surface-2" />;
  }

  if (!session?.user) {
    return (
      <ButtonLink href="/signin" variant="secondary" size="sm">
        Sign in
      </ButtonLink>
    );
  }

  const { user } = session;
  const displayName = user.name ?? user.username;
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: `/profile/${user.username}`, label: "Public profile" },
    { href: "/bookmarks", label: "Bookmarks" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-0.5 pr-2 pl-0.5 transition-colors hover:bg-surface-2"
      >
        <Avatar name={displayName} image={user.image} size="sm" />
        <span className="hidden max-w-36 truncate text-sm sm:block">{displayName}</span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
        <span className="sr-only">Open account menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-line bg-surface p-1 shadow-xl shadow-black/40"
        >
          <div className="mb-1 border-b border-line px-3 py-2">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted">@{user.username}</p>
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ redirectTo: "/" })}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-fg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
