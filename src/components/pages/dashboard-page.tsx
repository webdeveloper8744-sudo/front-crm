"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchLeads } from "@/store/slices/leadSlice"
import { fetchUsers } from "@/store/slices/userSlice"
import { fetchNotifications, markAllNotificationsAsViewed } from "@/store/slices/notificationSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
} from "recharts"
import {
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Bell,
  Download,
  Filter,
  Calendar,
} from "lucide-react"
import { exportToCSV } from "@/utils/csvExport"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LeadRow = any

function getEmployeeName(l: LeadRow) {
  return l.employee?.employeeName ?? l.employeeName ?? "—"
}
function getProductName(l: LeadRow) {
  return l.order?.productName ?? l.productName ?? "—"
}
function getStatus(l: LeadRow) {
  return l.order?.downloadStatus ?? l.downloadStatus ?? "—"
}
function getQuotedPrice(l: LeadRow) {
  const v = l.billing?.quotedPrice ?? l.quotedPrice
  const n = Number(v ?? 0)
  return isNaN(n) ? 0 : n
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const leadState = useAppSelector((s) => s.lead || { items: [], isLoading: false })
  const userState = useAppSelector((s) => s.user || { users: [], isLoading: false })
  const notificationState = useAppSelector((s) => s.notification || { notifications: [], unreadCount: 0 })
  const authState = useAppSelector((s) => s.auth)

  const leads = leadState.items as any[]
  const users = userState.users as any[]
  const notifications = notificationState.notifications
  const currentUser = authState.user
  const userRole = currentUser?.role || "employee"

  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchLeads() as any)
    dispatch(fetchUsers() as any)
    dispatch(fetchNotifications({ limit: 10 }) as any)
  }, [dispatch])

  const filteredLeads = useMemo(() => {
    let filtered = leads

    // Apply role-based filtering
    if (userRole === "admin" || userRole === "manager") {
      filtered = leads
    } else {
      // Employees see only their assigned leads
      filtered = leads.filter(
        (l) =>
          l.employeeName === currentUser?.fullName ||
          l.assignTeamMember === currentUser?.fullName ||
          l.processedBy === currentUser?.fullName,
      )
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()
      if (dateFilter === "today") {
        filterDate.setHours(0, 0, 0, 0)
      } else if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7)
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1)
      } else if (dateFilter === "year") {
        filterDate.setFullYear(now.getFullYear() - 1)
      }

      filtered = filtered.filter((l) => {
        const leadDate = new Date(l.createdAt || l.orderDate || 0)
        return leadDate >= filterDate
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => getStatus(l) === statusFilter)
    }

    return filtered
  }, [leads, userRole, currentUser, dateFilter, statusFilter])

  const kpis = useMemo(() => {
    const total = filteredLeads.length
    const newLeads = filteredLeads.filter((l) => getStatus(l) === "Lead" || !getStatus(l)).length
    const inProgress = filteredLeads.filter((l) => {
      const status = getStatus(l)
      return status === "Contacted" || status === "Qualified" || status === "Proposal Made"
    }).length
    const won = filteredLeads.filter((l) => getStatus(l) === "Won").length
    const lost = filteredLeads.filter((l) => getStatus(l) === "Lost").length
    const completed = filteredLeads.filter((l) => l.downloadStatus === "completed").length
    const process = filteredLeads.filter((l) => l.downloadStatus === "process").length

    let totalRevenue = 0
    let wonRevenue = 0
    let pendingRevenue = 0

    filteredLeads.forEach((l) => {
      const price = getQuotedPrice(l)
      totalRevenue += price
      if (getStatus(l) === "Won") wonRevenue += price
      else if (getStatus(l) !== "Lost") pendingRevenue += price
    })

    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : "0.0"

    return {
      total,
      newLeads,
      inProgress,
      won,
      lost,
      completed,
      process,
      totalRevenue,
      wonRevenue,
      pendingRevenue,
      conversionRate,
    }
  }, [filteredLeads])

  const statusDistribution = useMemo(() => {
    const statusMap = new Map<string, number>()
    filteredLeads.forEach((l) => {
      const status = getStatus(l) || "Lead"
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredLeads])

  const monthlyTrend = useMemo(() => {
    const monthMap = new Map<string, { leads: number; revenue: number }>()
    filteredLeads.forEach((l) => {
      const date = new Date(l.createdAt || l.orderDate || Date.now())
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const current = monthMap.get(monthKey) || { leads: 0, revenue: 0 }
      current.leads += 1
      current.revenue += getQuotedPrice(l)
      monthMap.set(monthKey, current)
    })

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        leads: data.leads,
        revenue: data.revenue,
      }))
  }, [filteredLeads])

  const topPerformers = useMemo(() => {
    if (userRole === "employee") return []

    const performerMap = new Map<string, { leads: number; won: number; revenue: number }>()
    filteredLeads.forEach((l) => {
      const emp = getEmployeeName(l)
      if (!emp || emp === "—") return
      const current = performerMap.get(emp) || { leads: 0, won: 0, revenue: 0 }
      current.leads += 1
      if (getStatus(l) === "Won") {
        current.won += 1
        current.revenue += getQuotedPrice(l)
      }
      performerMap.set(emp, current)
    })

    return Array.from(performerMap.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        conversionRate: data.leads > 0 ? ((data.won / data.leads) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredLeads, userRole])

  const productPerformance = useMemo(() => {
    const productMap = new Map<string, { leads: number; won: number; revenue: number }>()
    filteredLeads.forEach((l) => {
      const prod = getProductName(l)
      if (!prod || prod === "—") return
      const current = productMap.get(prod) || { leads: 0, won: 0, revenue: 0 }
      current.leads += 1
      if (getStatus(l) === "Won") {
        current.won += 1
        current.revenue += getQuotedPrice(l)
      }
      productMap.set(prod, current)
    })

    return Array.from(productMap.entries())
      .map(([product, data]) => ({ product, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [filteredLeads])

  const recentActivities = useMemo(() => {
    return [...filteredLeads]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 10)
  }, [filteredLeads])

  const handleExport = () => {
    exportToCSV(filteredLeads, `dashboard-report-${new Date().toISOString().split("T")[0]}`)
  }

  const fmtCurrency = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  const COLORS = ["#92400e", "#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"]

  return (
    <main className="space-y-6 pb-1 px-1 sm:px-2">
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold md:text-3xl">
            Welcome back, {currentUser?.fullName || "User"}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === "admin"
              ? "Complete system overview and analytics"
              : userRole === "manager"
                ? "Team performance and lead management"
                : "Your assigned leads and performance"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Lead">New Lead</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Proposal Made">Proposal Made</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={kpis.total}
          icon={<FileText className="h-5 w-5" />}
          trend={kpis.newLeads}
          trendLabel="new this period"
          color="blue"
        />
        <KPICard
          title="Won Deals"
          value={kpis.won}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={Number(kpis.conversionRate)}
          trendLabel="conversion rate"
          color="green"
          suffix="%"
        />
        <KPICard
          title="In Progress"
          value={kpis.inProgress}
          icon={<Clock className="h-5 w-5" />}
          trend={kpis.process}
          trendLabel="processing"
          color="yellow"
        />
        <KPICard
          title="Revenue (Won)"
          value={fmtCurrency(kpis.wonRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={kpis.pendingRevenue}
          trendLabel="pending"
          color="purple"
          isCurrency
        />
      </section>

      {notifications.length > 0 && (
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:border-amber-900 dark:from-amber-950/20 dark:to-amber-900/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              <CardTitle className="text-base">Recent Notifications</CardTitle>
              {notificationState.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notificationState.unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(markAllNotificationsAsViewed() as any)}
              disabled={notificationState.unreadCount === 0}
            >
              Mark all read
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    notif.isViewed ? "bg-background" : "bg-amber-100 dark:bg-amber-900/30"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notif.leadClientName}</p>
                    <p className="text-xs text-muted-foreground">{notif.message || "New lead assigned"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4 bg-muted/50 p-1 border-2 border-border">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Trends
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Lead Status Distribution */}
            <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Lead Status Distribution</CardTitle>
                <CardDescription>Current pipeline breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Overview */}
            <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Total quoted vs won revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Quoted</span>
                    <span className="text-lg font-semibold">{fmtCurrency(kpis.totalRevenue)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-600" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Won Revenue</span>
                    <span className="text-lg font-semibold text-green-600">{fmtCurrency(kpis.wonRevenue)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${kpis.totalRevenue > 0 ? (kpis.wonRevenue / kpis.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Revenue</span>
                    <span className="text-lg font-semibold text-yellow-600">{fmtCurrency(kpis.pendingRevenue)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-yellow-500"
                      style={{
                        width: `${kpis.totalRevenue > 0 ? (kpis.pendingRevenue / kpis.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                      {kpis.conversionRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead & Revenue Trends</CardTitle>
              <CardDescription>Last 6 months performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#92400e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#92400e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    stroke="#d97706"
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#92400e"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {userRole !== "employee" && topPerformers.length > 0 && (
            <>
              {/* Employee Performance Analysis */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Employee Performance Analysis</CardTitle>
                  <CardDescription>
                    Leads handled vs Revenue generated - bubble size shows conversion rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="leads"
                        name="Leads Handled"
                        label={{ value: "Total Leads Handled", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="revenue"
                        name="Revenue"
                        label={{ value: "Revenue Generated (₹)", angle: -90, position: "insideLeft" }}
                      />
                      <ZAxis type="number" dataKey="won" range={[100, 1000]} name="Won Deals" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-sm mb-2">{data.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Leads: <span className="font-medium text-foreground">{data.leads}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Won: <span className="font-medium text-green-600">{data.won}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Revenue:{" "}
                                  <span className="font-medium text-amber-600">
                                    ₹{data.revenue.toLocaleString("en-IN")}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Conversion: <span className="font-medium text-blue-600">{data.conversionRate}%</span>
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Scatter name="Employee Performance" data={topPerformers} fill="#d97706" shape="circle" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers - Revenue & Conversion */}
              <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Top Performers - Revenue & Conversion</CardTitle>
                  <CardDescription>Revenue bars with conversion rate trend line</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                      <YAxis yAxisId="left" label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft" }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: "Conversion Rate (%)", angle: 90, position: "insideRight" }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-sm mb-2">{data.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Total Leads: <span className="font-medium text-foreground">{data.leads}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Won Deals: <span className="font-medium text-green-600">{data.won}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Revenue:{" "}
                                  <span className="font-medium text-amber-600">
                                    ₹{data.revenue.toLocaleString("en-IN")}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Conversion: <span className="font-medium text-blue-600">{data.conversionRate}%</span>
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#d97706" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversionRate"
                        stroke="#92400e"
                        strokeWidth={3}
                        name="Conversion Rate (%)"
                        dot={{ fill: "#92400e", r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Lead by Employee */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {userRole === "employee" ? "Your Performance" : "Team Performance"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Won</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPerformers.slice(0, 8).map((p) => (
                        <TableRow key={p.name}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">{p.leads}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell">{p.won}</TableCell>
                          <TableCell className="text-right hidden md:table-cell">{p.conversionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-2xl font-bold">{kpis.completed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm">In Process</span>
                  </div>
                  <span className="text-2xl font-bold">{kpis.process}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm">Lost</span>
                  </div>
                  <span className="text-2xl font-bold">{kpis.lost}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm">Active Users</span>
                  </div>
                  <span className="text-2xl font-bold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Performance</CardTitle>
              <CardDescription>Revenue and conversion by product</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#d97706" name="Total Leads" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="won" fill="#92400e" name="Won Deals" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="text-right font-semibold">Leads</TableHead>
                        <TableHead className="hidden sm:table-cell text-right font-semibold">Won</TableHead>
                        <TableHead className="text-right font-semibold">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productPerformance.map((p) => (
                        <TableRow key={p.product}>
                          <TableCell className="font-medium whitespace-nowrap">{p.product}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{p.leads}</TableCell>
                          <TableCell className="hidden sm:table-cell text-right whitespace-nowrap font-medium">
                            {p.won}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap font-medium">
                            {fmtCurrency(p.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Recent Activities</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="hidden sm:table-cell text-right font-semibold">Amount</TableHead>
                    <TableHead className="text-right font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap">{l.clientName || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap">{getProductName(l)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={
                            getStatus(l) === "Won" ? "default" : getStatus(l) === "Lost" ? "destructive" : "secondary"
                          }
                          className="shadow-sm"
                        >
                          {getStatus(l) || "Lead"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right whitespace-nowrap font-medium">
                        {fmtCurrency(getQuotedPrice(l))}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(l.updatedAt || l.createdAt || Date.now()).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function KPICard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color,
  suffix,
  isCurrency,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color: "blue" | "green" | "yellow" | "purple"
  suffix?: string
  isCurrency?: boolean
}) {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30",
      icon: "bg-amber-700 text-white",
      text: "text-amber-700 dark:text-amber-400",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30",
      icon: "bg-green-700 text-white",
      text: "text-green-700 dark:text-green-400",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/30",
      icon: "bg-yellow-600 text-white",
      text: "text-yellow-700 dark:text-yellow-400",
    },
    purple: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30",
      icon: "bg-orange-700 text-white",
      text: "text-orange-700 dark:text-orange-400",
    },
  }

  return (
    <Card
      className={`border-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${colorClasses[color].bg}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-foreground/80">{title}</CardTitle>
        <div className={`rounded-xl p-2.5 ${colorClasses[color].icon}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">
          {typeof value === "string" ? value : isCurrency ? value : `${value}${suffix || ""}`}
        </div>
        {trend !== undefined && trendLabel && (
          <p className={`text-xs font-medium mt-2 ${colorClasses[color].text}`}>
            {isCurrency ? `₹${trend.toLocaleString("en-IN")}` : trend} {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
