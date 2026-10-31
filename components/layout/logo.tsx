import { CodeXml } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-white">
        <CodeXml className="size-4" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">DevCommunity</span>
        <span className="block text-[11px] text-muted">Learn. Share. Build.</span>
      </span>
    </Link>
  );
}
