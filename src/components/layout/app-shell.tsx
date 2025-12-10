"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Footer } from "./footer"
import React from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export type RouteKey =
  | "dashboard"
  | "leads"
  | "assignments"
  | "users"
  | "products"
  | "reports"
  | "purchase-orders"
  | "mtoken-tracking"
  | "stores"
  | "manage-company"

type CurrentUser = {
  id: string
  email: string
  role: "admin" | "employee" | "manager" | "guest"
  imageUrl?: string
}

type AppShellProps = {
  route: RouteKey
  onRouteChange: (r: RouteKey) => void
  currentUser: CurrentUser
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({ route, onRouteChange, currentUser, onLogout, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="h-dvh bg-background text-foreground grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        onToggleSidebar={() => {
          setMobileOpen((s) => !s)
        }}
      />
      <div className="flex min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:block border-r border-border bg-sidebar text-sidebar-foreground shrink-0 transition-[width] duration-200 ease-in-out",
            sidebarOpen ? "md:w-64" : "md:w-16",
          )}
        >
          <div className="h-full overflow-y-auto">
            <Sidebar
              compact={!sidebarOpen}
              active={route}
              onNavigate={(r) => onRouteChange(r)}
              onToggleCollapse={() => setSidebarOpen((v) => !v)}
            />
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="mx-auto max-w-screen-2xl h-full">{children}</div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            active={route}
            onNavigate={(r) => {
              onRouteChange(r)
              setMobileOpen(false)
            }}
            compact={false}
            onToggleCollapse={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
