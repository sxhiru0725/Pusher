"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, FileText, Settings, Plus } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Drop2Repo",
    href: "/dashboard/drop2repo",
    icon: Upload,
  },
  {
    title: "README Helper",
    href: "/dashboard/readme-helper",
    icon: FileText,
  },
  {
    title: "New Repo",
    href: "/dashboard/new-repo",
    icon: Plus,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Upload className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Drop2Git Hub
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

