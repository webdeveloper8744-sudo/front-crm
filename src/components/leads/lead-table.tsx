"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiEdit2, FiTrash2, FiEye, FiUser } from "react-icons/fi"
import { getFileUrl } from "@/config/api"

type Row = any

export function LeadTable({
  items,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
}: {
  items: Row[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No leads yet. Create one to get started.</p>
  }

  const fmtPrice = (v: any) => {
    const n = Number(v ?? 0)
    return isNaN(n) ? "—" : `₹${n.toFixed(2)}`
  }

  const statusText = (s: string | undefined) => (s ? s.replaceAll("_", " ") : "—")

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Client</TableHead>
              <TableHead className="whitespace-nowrap">Order ID</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">Employee</TableHead>
              <TableHead className="hidden md:table-cell whitespace-nowrap">Source</TableHead>
              <TableHead className="hidden lg:table-cell whitespace-nowrap">Client Email</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap text-right">Price</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((l) => {
              const id = l.id || l._id
              const order = l.order || {}
              const employee = l.employee || {}
              const billing = l.billing || {}
              const client = l.client || {}

              const orderId = order.orderId ?? l.orderId ?? id
              const employeeName = employee.employeeName ?? l.employeeName ?? "—"
              const sourceRaw = employee.source ?? l.source
              const otherSource = employee.otherSource ?? l.otherSource
              const source = sourceRaw === "Other" ? otherSource?.toString().trim() || "Other" : sourceRaw || "—"
              const email = order.email ?? l.email ?? "—"
              const status = order.downloadStatus ?? l.downloadStatus
              const price = l.discountedPrice ?? billing.quotedPrice ?? l.quotedPrice
              const clientImage = client.clientImageUrl ?? l.clientImageUrl
              const clientName = client.clientName ?? l.clientName ?? "—"

              return (
                <TableRow key={id} className="align-top">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={getFileUrl(clientImage) || "/placeholder.svg"} />
                        <AvatarFallback>
                          <FiUser className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline font-medium">{clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{orderId}</TableCell>
                  <TableCell className="hidden sm:table-cell">{employeeName}</TableCell>
                  <TableCell className="hidden md:table-cell">{source}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{email}</TableCell>
                  <TableCell className="capitalize whitespace-nowrap">{statusText(status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right whitespace-nowrap">{fmtPrice(price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onView(id)}
                        aria-label="View lead details"
                        className="size-8 sm:size-9"
                      >
                        <FiEye className="size-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(id)}
                          aria-label="Edit lead"
                          className="size-8 sm:size-9"
                        >
                          <FiEdit2 className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(id)}
                          aria-label="Delete lead"
                          className="size-8 sm:size-9"
                        >
                          <FiTrash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
