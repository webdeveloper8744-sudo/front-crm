"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LeadWizard } from "./lead-wizard"
import { LeadViewDialog } from "./lead-view-dialog"
import { useEffect, useMemo, useState } from "react"
import { LeadTable } from "./lead-table"
import { FiPlus, FiDownload } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchLeads, fetchLeadById, deleteLead } from "@/store/slices/leadSlice"
import { exportToCSV, formatLeadsForExport } from "@/utils/csvExport"

export function LeadsPage() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((s) => s.lead || { items: [], isLoading: false })
  const { user: currentUser } = useAppSelector((state) => state.auth)

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [viewingLead, setViewingLead] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchLeads() as any)
  }, [dispatch])

  const title = useMemo(() => (editing ? "Edit Lead" : "New Lead"), [editing])

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const isGuest = currentUser?.role === "guest"

  const canCreate = !isGuest // All except guest can create
  const canEdit = !isGuest // All except guest can edit
  const canDelete = isAdmin || isManager // Only admin and manager can delete

  function handleDeleteClick(id: string) {
    if (!canDelete) {
      toast.error("You don't have permission to delete leads")
      return
    }
    setLeadToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (leadToDelete) {
      try {
        await dispatch(deleteLead(leadToDelete) as any).unwrap()
        toast.success("Lead deleted successfully")
      } catch {
        /* toast already handled in slice */
      }
      setLeadToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  async function handleViewLeadById(id: string) {
    try {
      const data = await dispatch(fetchLeadById(id) as any).unwrap()
      setViewingLead(data)
      setViewDialogOpen(true)
    } catch {
      /* toast already handled */
    }
  }

  async function handleViewReferredClient(clientId: string) {
    try {
      const data = await dispatch(fetchLeadById(clientId) as any).unwrap()
      setViewingLead(data)
      setViewDialogOpen(true)
    } catch {
      /* toast already handled */
    }
  }

  async function handleEditLeadById(id: string) {
    if (!canEdit) {
      toast.error("You don't have permission to edit leads")
      return
    }
    try {
      const data = await dispatch(fetchLeadById(id) as any).unwrap()
      setEditing(data)
      setWizardOpen(true)
    } catch {
      /* toast already handled */
    }
  }

  function handleExportCSV() {
    if (!items || items.length === 0) {
      toast.error("No leads to export")
      return
    }

    try {
      const formattedData = formatLeadsForExport(items)
      exportToCSV(formattedData, "leads_report")
      toast.success("Leads exported successfully")
    } catch (error) {
      toast.error("Failed to export leads")
      console.error("Export error:", error)
    }
  }

  function handleNewLead() {
    if (!canCreate) {
      toast.error("You don't have permission to create leads")
      return
    }
    setEditing(null)
    setWizardOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-balance">Leads</h1>
          {isGuest && <p className="text-sm text-muted-foreground mt-1">View only access</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2 w-full sm:w-auto bg-transparent"
            disabled={isLoading || !items || items.length === 0}
          >
            <FiDownload className="size-4" />
            Export CSV
          </Button>
          {canCreate && (
            <Button onClick={handleNewLead} className="gap-2 w-full sm:w-auto" disabled={isLoading}>
              <FiPlus className="size-4" />
              New Lead
            </Button>
          )}
        </div>
      </div>

      {!wizardOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">All Leads</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <LeadTable
              items={items as any[]}
              onEdit={handleEditLeadById}
              onDelete={handleDeleteClick}
              onView={handleViewLeadById}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </CardContent>
        </Card>
      )}

      {wizardOpen && (
        <LeadWizard
          open={wizardOpen}
          onOpenChange={(o) => {
            setWizardOpen(o)
            if (!o) setEditing(null)
          }}
          initialLead={editing || undefined}
          onSaved={() => {
            dispatch(fetchLeads() as any)
            setWizardOpen(false)
          }}
          title={title}
        />
      )}

      <LeadViewDialog
        lead={viewingLead}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onViewReferredClient={handleViewReferredClient}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
