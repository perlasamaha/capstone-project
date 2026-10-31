import { PenLine } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { UserMenu } from "@/components/layout/user-menu";
import { ButtonLink } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:px-8">
        <div className="md:hidden">
          <Logo />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ButtonLink href="/create" size="sm" className="hidden sm:inline-flex">
            <PenLine aria-hidden /> Write
          </ButtonLink>
          <UserMenu />
        </div>
      </div>
      {/* On small screens the sidebar is hidden, so the nav moves here. */}
      <div className="px-2 pb-2 md:hidden">
        <NavLinks orientation="horizontal" />
      </div>
    </header>
  );
}
