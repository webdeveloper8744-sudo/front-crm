"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAssignedLeads, updateAssignmentStatus, deleteLead, type AssignedLead } from "@/store/slices/leadSlice"
import { markAllNotificationsAsViewed, fetchNotificationCount } from "@/store/slices/notificationSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiEdit2, FiFilter, FiDownload } from "react-icons/fi"
import { toast } from "sonner"
import { exportToCSV, formatAssignedLeadsForExport } from "@/utils/csvExport"

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  in_progress: "bg-purple-500",
  contacted: "bg-indigo-500",
  qualified: "bg-green-500",
  proposal_sent: "bg-cyan-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
  on_hold: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
  on_hold: "On Hold",
}

export function LeadAssignmentsPage() {
  const dispatch = useAppDispatch()
  const { assignedLeads, isLoading } = useAppSelector((s) => s.lead)
  const { user: currentUser, isInitialized } = useAppSelector((state) => state.auth)

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<AssignedLead | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updateStatus, setUpdateStatus] = useState("")

  useEffect(() => {
    if (isInitialized && currentUser) {
      dispatch(fetchAssignedLeads() as any)

      // Mark notifications as viewed
      dispatch(markAllNotificationsAsViewed() as any)
        .unwrap()
        .then(() => {
          dispatch(fetchNotificationCount() as any)
        })
        .catch(() => {
          // Silently fail
        })
    }
  }, [dispatch, isInitialized, currentUser])

  const filteredLeads = assignedLeads.filter((lead) => {
    if (statusFilter !== "all" && lead.assignmentStatus !== statusFilter) return false
    return true
  })

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const isGuest = currentUser?.role === "guest"

  const canEdit = !isGuest // All except guest can edit
  const canDelete = isAdmin || isManager // Only admin and manager can delete

  function handleUpdateClick(lead: AssignedLead) {
    if (!canEdit) {
      toast.error("You don't have permission to update lead status")
      return
    }
    setSelectedLead(lead)
    setUpdateStatus(lead.assignmentStatus || "new")
    setUpdateDialogOpen(true)
  }

  async function handleUpdateSubmit() {
    if (!selectedLead) return

    if (updateStatus === selectedLead.assignmentStatus) {
      toast.info("No changes to update")
      return
    }

    try {
      await dispatch(
        updateAssignmentStatus({
          id: selectedLead.id,
          assignmentStatus: updateStatus,
        }) as any,
      ).unwrap()

      setUpdateDialogOpen(false)
      dispatch(fetchAssignedLeads() as any)
    } catch (error) {
      // Error handled in slice
    }
  }

  async function handleDelete(leadId: string) {
    if (!canDelete) {
      toast.error("You don't have permission to delete leads")
      return
    }

    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      await dispatch(deleteLead(leadId) as any).unwrap()
      dispatch(fetchAssignedLeads() as any)
    } catch (error) {
      // Error handled in slice
    }
  }

  function handleExportCSV() {
    if (!filteredLeads || filteredLeads.length === 0) {
      toast.error("No assigned leads to export")
      return
    }

    try {
      const formattedData = formatAssignedLeadsForExport(filteredLeads)
      exportToCSV(formattedData, "assigned_leads_report")
      toast.success("Assigned leads exported successfully")
    } catch (error) {
      toast.error("Failed to export assigned leads")
      console.error("Export error:", error)
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: filteredLeads.length,
    new: filteredLeads.filter((l) => l.assignmentStatus === "new").length,
    inProgress: filteredLeads.filter((l) => l.assignmentStatus === "in_progress").length,
    won: filteredLeads.filter((l) => l.assignmentStatus === "won").length,
    lost: filteredLeads.filter((l) => l.assignmentStatus === "lost").length,
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            {currentUser.role === "employee" ? "My Assigned Leads" : "All Assigned Leads"}
          </h1>
          {isGuest && <p className="text-sm text-muted-foreground mt-1">View only access</p>}
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2 w-full sm:w-auto bg-transparent"
          disabled={isLoading || filteredLeads.length === 0}
        >
          <FiDownload className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Assigned" value={stats.total} />
        <StatCard title="New" value={stats.new} color="text-blue-500" />
        <StatCard title="In Progress" value={stats.inProgress} color="text-purple-500" />
        <StatCard title="Won" value={stats.won} color="text-green-500" />
        <StatCard title="Lost" value={stats.lost} color="text-red-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FiFilter className="size-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Assigned Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <AssignmentsTable
                  leads={filteredLeads}
                  isLoading={isLoading}
                  onUpdate={handleUpdateClick}
                  onDelete={handleDelete}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color || ""}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function AssignmentsTable({
  leads,
  isLoading,
  onUpdate,
  canEdit = true,
}: {
  leads: AssignedLead[]
  isLoading: boolean
  onUpdate: (lead: AssignedLead) => void
  onDelete: (leadId: string) => void
  canEdit?: boolean
  canDelete?: boolean
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading assigned leads...</p>
  }

  if (leads.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No assigned leads found.</p>
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Client Image</TableHead>
              <TableHead className="whitespace-nowrap">Client Name</TableHead>
              <TableHead className="whitespace-nowrap">Company Name</TableHead>
              <TableHead className="hidden lg:table-cell whitespace-nowrap">Product Name</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="hidden xl:table-cell whitespace-nowrap">Assigned To</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Avatar className="size-10">
                    <AvatarImage src={lead.clientImageUrl || "/placeholder.svg"} alt={lead.clientName} />
                    <AvatarFallback>{lead.clientName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{lead.clientName}</TableCell>
                <TableCell>{lead.clientCompanyName}</TableCell>
                <TableCell className="hidden lg:table-cell">{lead.productName}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.assignmentStatus || "new"]}>
                    {statusLabels[lead.assignmentStatus || "new"]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">{lead.assignTeamMember}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <Button size="icon" variant="ghost" onClick={() => onUpdate(lead)} className="size-8">
                        <FiEdit2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
