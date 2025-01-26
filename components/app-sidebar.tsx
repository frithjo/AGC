"use client";

import { Home, MessageSquare, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/sidebar-toggle";
const sidebarItems = [
  { icon: Home, label: "Home" },
  { icon: MessageSquare, label: "Chat" },
  { icon: FileText, label: "Notes" },
  { icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  return (
    <Sidebar className="font-sans">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between gap-2">
        <h2 className="text-xl font-bold">My App</h2>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton>
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
