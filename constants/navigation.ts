import {
  Bookmark,
  Compass,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const mainNav: NavItem[] = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/blogs", label: "Blogs", icon: FileText },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];
