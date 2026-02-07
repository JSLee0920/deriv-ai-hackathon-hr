"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  MessageSquare,
  Shield,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItem = [
  { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  {
    label: "Generate Contract",
    href: "/dashboard/generate-contracts",
    icon: FileText,
  },
  { label: "Requests", href: "/dashboard/requests", icon: CheckSquare },
  {
    label: "AI Assistant",
    href: "/dashboard/ai-assistant",
    icon: MessageSquare,
  },
  { label: "Compliance", href: "/dashboard/compliance", icon: Shield },
  { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sticky flex h-screen flex-col justify-between border-r border-sidebar-border bg-sidebar transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              DerivHR
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3">
          {navItem.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Toggle Button */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />

            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
