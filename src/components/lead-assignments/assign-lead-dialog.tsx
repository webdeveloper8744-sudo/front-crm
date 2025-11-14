"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createAssignment } from "@/store/slices/leadAssignmentSlice"
import { fetchLeads } from "@/store/slices/leadSlice"
import { fetchUsers } from "@/store/slices/userSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AssignLeadDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const dispatch = useAppDispatch()
  const { items: leads } = useAppSelector((s) => s.lead)
  const { users } = useAppSelector((s) => s.user)
  const { user: currentUser } = useAppSelector((s) => s.auth)

  const [leadId, setLeadId] = useState("")
  const [assignedToId, setAssignedToId] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch leads and users when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchLeads() as any)
      dispatch(fetchUsers() as any)
    }
  }, [open, dispatch])

  function validate() {
    const errs: Record<string, string> = {}
    if (!leadId) errs.leadId = "Please select a lead"
    if (!assignedToId) errs.assignedToId = "Please select an employee"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    try {
      await dispatch(
        createAssignment({
          leadId,
          assignedToId,
          priority,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }) as any,
      ).unwrap()

      // Reset form
      setLeadId("")
      setAssignedToId("")
      setPriority("medium")
      setDueDate("")
      setNotes("")
      setErrors({})

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      // Error handled in slice
    }
  }

  const isEmployee = currentUser?.role === "employee"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead to Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead: any) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.clientName} - {lead.clientCompanyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-xs text-destructive">{errors.leadId}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assign To *</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedToId && <p className="text-xs text-destructive">{errors.assignedToId}</p>}
          </div>

          {!isEmployee && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or instructions..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Assign Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
