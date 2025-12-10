"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FiHome,
  FiUserCheck,
  FiPackage,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
  FiX,
  FiBarChart,
  FiBox,
  FiTag,
  FiShoppingCart,
} from "react-icons/fi"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchNotificationCount } from "@/store/slices/notificationSlice"

import type { RouteKey } from "./app-shell"

const items: Array<{
  key: RouteKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: Array<"admin" | "manager" | "employee" | "guest">
}> = [
  { key: "dashboard", label: "Dashboard", icon: FiHome },
  { key: "leads", label: "Leads", icon: FiUserCheck, roles: ["admin", "manager", "employee"] },
  { key: "assignments", label: "Assignments", icon: FiUserPlus, roles: ["admin", "manager", "employee"] },
  { key: "users", label: "Users & Roles", icon: FiShield, roles: ["admin", "manager"] },
  { key: "manage-company", label: "Manage Company", icon: FiBox, roles: ["admin", "manager"] },
  { key: "products", label: "Products & Services", icon: FiPackage, roles: ["admin", "manager", "employee"] },
  { key: "stores", label: "Stores", icon: FiShoppingCart, roles: ["admin", "manager"] },
  { key: "purchase-orders", label: "Purchase Orders", icon: FiBox, roles: ["admin", "manager"] },
  { key: "mtoken-tracking", label: "MToken Tracking", icon: FiTag, roles: ["admin", "manager"] },
  { key: "reports", label: "Reports", icon: FiBarChart, roles: ["admin", "manager"] },
]

export function Sidebar({
  active,
  compact,
  onNavigate,
  onToggleCollapse,
  onClose,
}: {
  active: RouteKey
  compact?: boolean
  onNavigate: (key: RouteKey) => void
  onToggleCollapse?: () => void
  onClose?: () => void
}) {
  const dispatch = useAppDispatch()
  const { unreadCount } = useAppSelector((state) => state.notification)
  const { user, isInitialized } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isInitialized && user) {
      dispatch(fetchNotificationCount() as any)

      const interval = setInterval(() => {
        dispatch(fetchNotificationCount() as any)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [dispatch, isInitialized, user])

  const visibleItems = items.filter((item) => {
    if (!item.roles) return true
    if (!user) return false
    return item.roles.includes(user.role)
  })

  return (
    <nav className="h-full flex flex-col bg-sidebar shadow-xl border-r-2 border-sidebar-border">
      <div className="px-4 py-4 border-b-2 border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className={cn("text-base font-bold text-sidebar-foreground", compact && "sr-only")}>CRM Portal</div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <FiX className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Collapse sidebar"
            onClick={onToggleCollapse}
          >
            {compact ? <FiChevronRight className="size-4" /> : <FiChevronLeft className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="px-3 py-4 flex-1">
        <div className="flex flex-col gap-2">
          {visibleItems.map((it) => {
            const Icon = it.icon
            const isActive = it.key === active
            const showBadge = it.key === "assignments" && unreadCount > 0

            return (
              <Button
                key={it.key}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "justify-start gap-3 w-full relative transition-all duration-200 border-2",
                  compact && "justify-center",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-md hover:bg-sidebar-primary/90"
                    : "text-sidebar-foreground border-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-sidebar-accent",
                )}
                onClick={() => onNavigate(it.key)}
              >
                <Icon className="size-5 shrink-0" />
                <span className={cn("font-medium", compact && "sr-only")}>{it.label}</span>
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs font-bold shadow-lg animate-pulse",
                      compact && "top-0 right-0",
                    )}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="px-3 py-3 border-t-2 border-sidebar-border">
        <div className={cn("text-xs text-sidebar-foreground/70 text-center", compact && "sr-only")}>
          Powered by VIPL
        </div>
      </div>
    </nav>
  )
}
