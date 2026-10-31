import { PenLine } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { ButtonLink } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line px-4 py-5 md:flex">
      <Logo />
      <div className="mt-8">
        <NavLinks />
      </div>

      <div className="mt-auto rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-medium">Learned something new?</p>
        <p className="mt-1 text-xs text-muted">
          Write it down and share it with a community.
        </p>
        <ButtonLink href="/create" size="sm" className="mt-3 w-full">
          <PenLine aria-hidden /> Write a post
        </ButtonLink>
      </div>
    </aside>
  );
}
