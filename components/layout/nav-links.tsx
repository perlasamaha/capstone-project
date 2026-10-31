"use client";

// Client Component only because the active link depends on the current URL
// (usePathname). Everything else in the sidebar/header is a Server Component.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/constants/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";

  return (
    <nav aria-label="Main">
      <ul className={cn(vertical ? "space-y-1" : "flex gap-1 overflow-x-auto")}>
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm transition-colors",
                  vertical ? "px-3 py-2" : "px-3 py-1.5 whitespace-nowrap",
                  active
                    ? "bg-accent/15 font-medium text-link"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {vertical && <Icon className="size-4" aria-hidden />}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
