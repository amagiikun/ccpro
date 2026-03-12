"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ImageIcon,
  LayoutGridIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/workspace", label: "工作台", icon: SparklesIcon },
  { href: "/gallery", label: "画廊", icon: LayoutGridIcon },
  {
    href: "/settings/providers",
    label: "Provider 设置",
    icon: SettingsIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <SparklesIcon className="h-5 w-5 text-primary" />
          CCPro
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname?.startsWith(item.href)
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          当前为纯图片模式
        </div>
      </div>
    </aside>
  );
}
