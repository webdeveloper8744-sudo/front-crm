"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  fetchMTokenSerialNumbers,
  deletePurchaseOrder,
} from "@/store/slices/purchaseOrderSlice"
import { fetchStores, type StoreData } from "@/store/slices/storeSlice"

export function PurchaseOrderPage() {
  const dispatch = useAppDispatch()
  const { orders, isLoading } = useAppSelector((s) => s.purchaseOrder)
  const { stores } = useAppSelector((s) => s.store || { stores: [] })
  const { user } = useAppSelector((s) => s.auth)

  const [open, setOpen] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [orderToDelete, setOrderToDelete] = React.useState<any>(null)
  const [formData, setFormData] = React.useState({
    storeId: "",
    quantity: 1,
    amount: 0,
    purchaseDate: new Date().toISOString().slice(0, 10),
    serialNumbers: [""],
  })

  React.useEffect(() => {
    dispatch(fetchPurchaseOrders())
    dispatch(fetchStores())
    dispatch(fetchMTokenSerialNumbers())
  }, [dispatch])

  const handleDeleteClick = (order: any) => {
    const canDelete = user?.role === "admin" || user?.role === "manager"
    if (!canDelete) {
      toast.error("You don't have permission to delete purchase orders")
      return
    }
    setOrderToDelete(order)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await dispatch(deletePurchaseOrder(orderToDelete.id)).unwrap()
        setOrderToDelete(null)
      } catch (error: any) {
        console.error("[v0] Failed to delete purchase order:", error)
      }
    }
    setDeleteConfirmOpen(false)
  }

  const handleAddSerialNumber = () => {
    setFormData((prev) => ({
      ...prev,
      serialNumbers: [...prev.serialNumbers, ""],
      quantity: prev.serialNumbers.length + 1,
    }))
  }

  const handleRemoveSerialNumber = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      serialNumbers: prev.serialNumbers.filter((_, i) => i !== index),
      quantity: prev.serialNumbers.length - 1,
    }))
  }

  const handleSerialNumberChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      serialNumbers: prev.serialNumbers.map((s, i) => (i === index ? value : s)),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.storeId || formData.quantity === 0 || formData.amount === 0) {
      toast.error("Please fill all required fields")
      return
    }

    if (formData.serialNumbers.some((s) => !s.trim())) {
      toast.error("All serial numbers are required")
      return
    }

    await dispatch(
      createPurchaseOrder({
        storeId: formData.storeId,
        quantity: formData.quantity,
        amount: formData.amount,
        purchaseDate: formData.purchaseDate,
        serialNumbers: formData.serialNumbers,
      }),
    )

    setOpen(false)
    setFormData({
      storeId: "",
      quantity: 1,
      amount: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      serialNumbers: [""],
    })
  }

  const storeName = (storeId: string) => {
    return stores.find((s: StoreData) => s.id === storeId)?.name || "Unknown Store"
  }

  const canDelete = user?.role === "admin" || user?.role === "manager"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">MToken Purchase Orders</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Product *</Label>
                  <Input value="MToken" disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Store *</Label>
                  <Select value={formData.storeId} onValueChange={(v) => setFormData((p) => ({ ...p, storeId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.length ? (
                        stores.map((store: StoreData) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-stores">No stores available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Amount (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData((p) => ({ ...p, amount: Number.parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Purchase Date *</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData((p) => ({ ...p, purchaseDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Serial Numbers *</Label>
                  <Button variant="outline" size="sm" onClick={handleAddSerialNumber}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.serialNumbers.map((serial, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={serial}
                        onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                        placeholder={`Serial #${index + 1}`}
                        className="uppercase"
                      />
                      {formData.serialNumbers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSerialNumber(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  Total: {formData.serialNumbers.length} serial numbers
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/70 hover:bg-muted/70">
                  <TableHead>Store</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Created At</TableHead>
                  {canDelete && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canDelete ? 6 : 5} className="text-center text-muted-foreground py-8">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{storeName(order.storeId)}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>₹{Number(order.amount).toFixed(2)}</TableCell>
                      <TableCell>{order.purchaseDate}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString("en-IN")}</TableCell>
                      {canDelete && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(order)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete purchase order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase order from{" "}
              <span className="font-semibold">{orderToDelete ? storeName(orderToDelete.storeId) : ""}</span> with{" "}
              <span className="font-semibold">{orderToDelete?.quantity} serial numbers</span>? This action cannot be
              undone and will also delete all associated serial numbers and their records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
