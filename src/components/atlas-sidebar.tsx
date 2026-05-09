import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Globe2, Cpu, Landmark, BarChart3, Radio, Bell, ScrollText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAtlasStore } from "@/lib/store";

const items = [
  { title: "Command", url: "/", icon: Globe2 },
  { title: "Agent Console", url: "/agents", icon: Cpu },
  { title: "Governance", url: "/governance", icon: Landmark },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Audit", url: "/audit", icon: ScrollText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AtlasSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/40">
            <Activity className="h-4 w-4 text-primary" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary pulse-dot" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Atlas</span>
              <span className="text-sm font-semibold text-foreground">SANCTUM // MVP</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em]">Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="text-xs uppercase tracking-wider">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3 text-primary pulse-dot" />
          {!collapsed && <span>Link · Stable</span>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
