"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiDownload, FiTrendingUp, FiUsers, FiUserCheck, FiDollarSign } from "react-icons/fi"
import { useAppSelector } from "@/store/hooks"
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
} from "recharts"

interface EmployeeStats {
  employeeName: string
  totalLeads: number
  referredLeads: number
  leadsWithDiscount: number
  totalDiscountGiven: number
  totalQuotedPrice: number
  totalDiscountedPrice: number
}



export function ReportsPage() {
  const { items: allLeads } = useAppSelector((s) => s.lead || { items: [] })
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")

  // Employee Statistics
  const employeeStats = useMemo(() => {
    const statsMap = new Map<string, EmployeeStats>()

    allLeads.forEach((lead: any) => {
      const employeeName = lead.employeeName || "Unknown"

      if (!statsMap.has(employeeName)) {
        statsMap.set(employeeName, {
          employeeName,
          totalLeads: 0,
          referredLeads: 0,
          leadsWithDiscount: 0,
          totalDiscountGiven: 0,
          totalQuotedPrice: 0,
          totalDiscountedPrice: 0,
        })
      }

      const stats = statsMap.get(employeeName)!
      stats.totalLeads += 1
      stats.totalQuotedPrice += Number(lead.quotedPrice || 0)
      stats.totalDiscountedPrice += Number(lead.discountedPrice || 0)

      if (lead.referredBy) {
        stats.referredLeads += 1
      }

      if (lead.discountAmount && Number(lead.discountAmount) > 0) {
        stats.leadsWithDiscount += 1
        stats.totalDiscountGiven += Number(lead.discountAmount)
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.totalLeads - a.totalLeads)
  }, [allLeads])

  // Stage Statistics
  const stageStats = useMemo(() => {
    const stageMap = new Map<string, number>()

    allLeads.forEach((lead: any) => {
      const stage = lead.stage || "Unknown"
      stageMap.set(stage, (stageMap.get(stage) || 0) + 1)
    })

    const total = allLeads.length
    return Array.from(stageMap.entries())
      .map(([stage, count]) => ({
        stage,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [allLeads])

  // Source Statistics
  const sourceStats = useMemo(() => {
    const sourceMap = new Map<string, number>()

    allLeads.forEach((lead: any) => {
      const source = lead.source === "Other" ? lead.otherSource || "Other" : lead.source || "Unknown"
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
    })

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
  }, [allLeads])

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalLeads = allLeads.length
    const totalRevenue = allLeads.reduce((sum, lead) => sum + Number(lead.discountedPrice || 0), 0)
    const totalQuoted = allLeads.reduce((sum, lead) => sum + Number(lead.quotedPrice || 0), 0)
    const totalDiscount = totalQuoted - totalRevenue
    const referredLeads = allLeads.filter((lead) => lead.referredBy).length
    const paidLeads = allLeads.filter((lead) => lead.paymentStatus === "paid").length

    return {
      totalLeads,
      totalRevenue,
      totalQuoted,
      totalDiscount,
      referredLeads,
      paidLeads,
      conversionRate: totalLeads > 0 ? ((paidLeads / totalLeads) * 100).toFixed(1) : 0,
    }
  }, [allLeads])

  const handleExportData = () => {
    let content = ""
    let filename = ""

    if (exportFormat === "csv") {
      // Employee Report CSV
      const employeeHeaders = [
        "Employee Name",
        "Total Leads",
        "Referred Leads",
        "Leads with Discount",
        "Total Discount Given",
        "Total Quoted Price",
        "Total Discounted Price",
      ]
      const employeeRows = employeeStats.map((stat) => [
        stat.employeeName,
        stat.totalLeads,
        stat.referredLeads,
        stat.leadsWithDiscount,
        stat.totalDiscountGiven.toFixed(2),
        stat.totalQuotedPrice.toFixed(2),
        stat.totalDiscountedPrice.toFixed(2),
      ])

      content = [
        employeeHeaders.join(","),
        ...employeeRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")
      filename = `crm-reports-${new Date().toISOString().slice(0, 10)}.csv`
    } else {
      content = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          overallStats,
          employeeStats,
          stageStats,
          sourceStats,
        },
        null,
        2,
      )
      filename = `crm-reports-${new Date().toISOString().slice(0, 10)}.json`
    }

    const blob = new Blob([content], { type: exportFormat === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Comprehensive lead and performance analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "csv" | "json")}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <Button onClick={handleExportData} className="gap-2">
            <FiDownload className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUserCheck className="size-6" />}
          label="Total Leads"
          value={overallStats.totalLeads}
          color="text-blue-500"
        />
        <StatCard
          icon={<FiDollarSign className="size-6" />}
          label="Total Revenue"
          value={`₹${overallStats.totalRevenue.toFixed(0)}`}
          color="text-green-500"
        />
        <StatCard
          icon={<FiTrendingUp className="size-6" />}
          label="Total Discount"
          value={`₹${overallStats.totalDiscount.toFixed(0)}`}
          color="text-orange-500"
        />
        <StatCard
          icon={<FiUsers className="size-6" />}
          label="Conversion Rate"
          value={`${overallStats.conversionRate}%`}
          color="text-purple-500"
        />
      </div>

      {/* Tabs for Different Reports */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-muted/50 p-2 rounded-lg">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs sm:text-sm">
            Employees
          </TabsTrigger>
          <TabsTrigger value="stages" className="text-xs sm:text-sm">
            Stages
          </TabsTrigger>
          <TabsTrigger value="sources" className="text-xs sm:text-sm">
            Sources
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lead Distribution by Stage */}
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Lead Distribution by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                {stageStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stageStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ stage, percentage }) => `${stage}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stageStats.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Lead Source Distribution */}
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Leads by Source</CardTitle>
              </CardHeader>
              <CardContent>
                {sourceStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sourceStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4 mt-4">
          {employeeStats.length === 0 ? (
            <Card className="border-2 border-border">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No employee data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Employee Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeeStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="employeeName" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalLeads" fill="#8b5cf6" name="Total Leads" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="leadsWithDiscount" fill="#06b6d4" name="Discounted Leads" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                {employeeStats.map((stat) => (
                  <Card key={stat.employeeName} className="border-2 border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{stat.employeeName}</CardTitle>
                        <Badge variant="default">{stat.totalLeads} Leads</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <StatBox label="Total Leads" value={stat.totalLeads} />
                        <StatBox label="Referred" value={stat.referredLeads} />
                        <StatBox label="Discounted" value={stat.leadsWithDiscount} />
                        <StatBox label="Discount Given" value={`₹${stat.totalDiscountGiven.toFixed(0)}`} highlight />
                        <StatBox label="Quoted Price" value={`₹${stat.totalQuotedPrice.toFixed(0)}`} />
                        <StatBox
                          label="Discounted Price"
                          value={`₹${stat.totalDiscountedPrice.toFixed(0)}`}
                          highlight
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Stages Tab */}
        <TabsContent value="stages" className="space-y-4 mt-4">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Lead Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stageStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No stage data available</p>
              ) : (
                <div className="space-y-3">
                  {stageStats.map((stat, index) => (
                    <div key={stat.stage} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{stat.stage}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{stat.count} leads</span>
                        <Badge variant="secondary">{stat.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4 mt-4">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Lead Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No source data available</p>
              ) : (
                <div className="space-y-3">
                  {sourceStats.map((stat, index) => (
                    <div key={stat.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{stat.source}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(stat.count / Math.max(...sourceStats.map((s) => s.count))) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold min-w-12 text-right">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card className="border-2 border-border hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          </div>
          <div className={`${color} opacity-80`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className={`p-3 rounded-lg border-2 ${highlight ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}
