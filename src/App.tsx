"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { initializeAuth, clearAuth, checkTokenValidity } from "@/store/slices/authSlice"
import { AppShell, type RouteKey } from "@/components/layout/app-shell"
import { LeadsPage } from "@/components/leads/leads-page"
import { UsersRolesPage } from "@/components/users/users-roles-page"
import { ProductsPage } from "@/components/mgmt/products-page"
import { ReportsPage } from "@/components/reports/reports-page"
import LoginPage from "@/components/auth/login-page"
import DashboardPage from "./components/pages/dashboard-page"
import { LeadAssignmentsPage } from "./components/lead-assignments/lead-assignments-page"
import { toast } from "sonner"

const isValidRoute = (route: string): route is RouteKey => {
  return ["dashboard", "leads", "assignments", "users", "products", "settings", "reports"].includes(route)
}

export default function App() {
  const dispatch = useAppDispatch()
  const { user: currentUser, isInitialized } = useAppSelector((state) => state.auth)
  const [route, setRoute] = useState<RouteKey>("dashboard")

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (!currentUser) return

    const checkToken = () => {
      dispatch(checkTokenValidity() as any).catch(() => {
        toast.error("Your session has expired. Please login again.")
        setRoute("dashboard")
        window.location.hash = ""
      })
    }

    checkToken()

    const interval = setInterval(checkToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [currentUser, dispatch])

  useEffect(() => {
    const hash = window.location.hash.slice(1) as RouteKey
    if (isValidRoute(hash)) {
      setRoute(hash)
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) as RouteKey
      if (isValidRoute(newHash)) {
        setRoute(newHash)
      } else {
        setRoute("dashboard")
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleRouteChange = (newRoute: RouteKey) => {
    setRoute(newRoute)
    window.location.hash = newRoute
  }

  const handleLogin = () => {
    setRoute("dashboard")
    window.location.hash = "dashboard"
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    setRoute("dashboard")
    window.location.hash = ""
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLogin} />
  }

  return (
    <AppShell route={route} onRouteChange={handleRouteChange} currentUser={currentUser} onLogout={handleLogout}>
      {route === "dashboard" && <DashboardPage />}
      {route === "leads" && <LeadsPage />}
      {route === "assignments" && <LeadAssignmentsPage />}
      {route === "users" && <UsersRolesPage />}
      {route === "products" && <ProductsPage />}
      {route === "reports" && <ReportsPage />}
    </AppShell>
  )
}
