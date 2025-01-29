import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minimal Clean UI",
  description: "A minimal and clean UI with sidebar, chat, and notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {/* <SidebarProvider> */}
        <div className="flex h-screen overflow-hidden">
          {/* <AppSidebar /> */}
          <main className="flex-1 relative">{children}</main>
        </div>
        {/* </SidebarProvider> */}
      </body>
    </html>
  );
}
