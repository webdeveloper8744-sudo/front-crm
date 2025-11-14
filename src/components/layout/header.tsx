"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "../theme-toggle"
import { toast } from "sonner"
import { FiMenu, FiLogOut, FiBell, FiPlus, FiDownload } from "react-icons/fi"
import { useEffect, useState } from "react"
import { getFileUrl } from "@/config/api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchNotificationCount } from "@/store/slices/notificationSlice"

type CurrentUser = {
  id: string
  email: string
  role: "admin" | "employee" | "staff" | "manager" | "guest"
  imageUrl?: string
}

export function Header({
  onToggleSidebar,
  currentUser,
  onLogout,
  onNewLead,
  onExport,
  onNavigate,
}: {
  onToggleSidebar: () => void
  currentUser?: CurrentUser
  onLogout: () => void
  onNewLead?: () => void
  onExport?: () => void
  onNavigate?: (page: string) => void
}) {
  const [, setResolvedImageUrl] = useState<string | undefined>(currentUser?.imageUrl)
  const dispatch = useAppDispatch()
  const { unreadCount } = useAppSelector((state) => state.notification)

  useEffect(() => {
    if (currentUser?.imageUrl) {
      const img = new Image()
      img.src = currentUser.imageUrl
      img.onload = () => setResolvedImageUrl(currentUser.imageUrl)
      img.onerror = () => setResolvedImageUrl(undefined)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotificationCount() as any)
      const interval = setInterval(() => {
        dispatch(fetchNotificationCount() as any)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [dispatch, currentUser])

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const isGuest = currentUser?.role === "guest"

  return (
    <header className="sticky top-0 z-40 border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-screen-2xl flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-primary/10 text-foreground"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <FiMenu className="size-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <rect width="36" height="36" rx="8" fill="currentColor" className="text-primary" />
                <path d="M18 6L9 11V21C9 26 18 29 18 29C18 29 27 26 27 21V11L18 6Z" fill="white" fillOpacity="0.2" />
                <path
                  d="M18 6L9 11V21C9 26 18 29 18 29C18 29 27 26 27 21V11L18 6Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="17" r="4" fill="white" />
                <path
                  d="M14 23C14 23 15.5 21.5 18 21.5C20.5 21.5 22 23 22 23"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-base font-bold shrink-0 text-primary hidden sm:inline">CRM Portal</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Quick Actions based on role */}
          {!isGuest && onNewLead && (
            <Button
              variant="default"
              size="sm"
              className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/20"
              onClick={onNewLead}
            >
              <FiPlus className="size-4" />
              <span>New Lead</span>
            </Button>
          )}

          {(isAdmin || isManager) && onExport && (
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 bg-transparent"
              onClick={onExport}
            >
              <FiDownload className="size-4" />
              <span>Export</span>
            </Button>
          )}

          {(isAdmin || isManager) && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
              onClick={() => onNavigate?.("/reports")}
            >
              {/* <FiBarChart3 className="size-4" /> */}
              <span>Reports</span>
            </Button>
          )}

          {/* Notifications Dropdown */}
          {!isGuest && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/10 border-2 border-transparent hover:border-primary/30"
                >
                  <FiBell className="size-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs font-bold animate-pulse"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 border-2 border-primary/20">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadCount > 0 ? (
                  <>
                    <DropdownMenuItem onClick={() => onNavigate?.("assignments")}>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">New lead assigned</p>
                        <p className="text-xs text-muted-foreground">
                          You have {unreadCount} new lead assignment{unreadCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-primary" onClick={() => onNavigate?.("assignments")}>
                      View all notifications
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeToggle />
          {currentUser && <UserMenu currentUser={currentUser} onLogout={onLogout} />}
        </div>
      </div>
    </header>
  )
}

function UserMenu({
  currentUser,
  onLogout,
}: {
  currentUser: CurrentUser
  onLogout: () => void
}) {
  const initials = currentUser.email.substring(0, 2).toUpperCase()
  const displayName = currentUser.email.split("@")[0]

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    let src = currentUser?.imageUrl

    if (!src) {
      try {
        const raw = localStorage.getItem("crm_current_user")
        if (raw) {
          const stored = JSON.parse(raw)
          if (stored?.imageUrl) {
            src = stored.imageUrl as string
          }
        }
      } catch {
        // ignore
      }
    }

    setImageSrc(getFileUrl(src))
  }, [currentUser?.imageUrl])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 hover:bg-primary/10 border-2 border-transparent hover:border-primary/30 transition-all"
        >
          <Avatar className="size-7 ring-2 ring-primary/30">
            {imageSrc ? (
              <AvatarImage src={imageSrc || "/placeholder.svg"} alt={currentUser.email} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
            )}
          </Avatar>
          <span className="hidden sm:inline capitalize font-medium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-2 border-primary/20">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info("Profile feature coming soon")}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Preferences feature coming soon")}>Preferences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
          <FiLogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Header
