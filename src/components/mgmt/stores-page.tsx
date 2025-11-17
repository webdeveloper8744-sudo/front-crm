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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStores, addStore, updateStore, deleteStore, type StoreData } from "@/store/slices/storeSlice"

function StoreForm({
  store,
  onClose,
  onSave,
}: {
  store: StoreData | null
  onClose: () => void
  onSave: () => void
}) {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.store)

  const [name, setName] = useState(store?.name || "")
  const [description, setDescription] = useState(store?.description || "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}

    if (!name.trim()) errs.name = "Store name is required"
    if (!description.trim()) errs.description = "Store description is required"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors")
      return
    }

    try {
      if (store) {
        await dispatch(updateStore({ id: store.id, name, description })).unwrap()
      } else {
        await dispatch(addStore({ name, description })).unwrap()
      }
      onSave()
    } catch (error) {
      console.error("[v0] Failed to save store:", error)
    }
  }

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{store ? "Edit Store" : "Add New Store"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">
              Store Name *
            </Label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-9 border-2 focus:border-primary bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Store Description *
            </Label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Textarea
                id="description"
                className="pl-9 min-h-[120px] border-2 focus:border-primary bg-background"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your store..."
              />
            </div>
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : store ? "Update Store" : "Add Store"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StoresTable({
  stores,
  isLoading,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  stores: StoreData[]
  isLoading: boolean
  onEdit: (store: StoreData) => void
  onDelete: (store: StoreData) => void
  canEdit?: boolean
  canDelete?: boolean
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Loading stores...</p>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiFileText className="size-12 mx-auto mb-3 opacity-20" />
        <p>No stores yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Store Name</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Created At</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="border rounded-b-lg divide-y">
            {stores.map((store) => (
              <div
                key={store.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-3">
                  <div className="font-medium flex items-center gap-2">
                    <FiFileText className="size-4 text-primary" />
                    {store.name}
                  </div>
                </div>
                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(store.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(store)} aria-label="Edit store">
                      <FiEdit2 className="size-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(store)}
                      aria-label="Delete store"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <FiTrash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {stores.map((store) => (
          <Card key={store.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="font-medium text-base flex items-center gap-2">
                  <FiFileText className="size-4 text-primary" />
                  {store.name}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{store.description}</p>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(store.createdAt).toLocaleString()}
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2 pt-2">
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(store)} className="flex-1 gap-2">
                        <FiEdit2 className="size-3" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(store)}
                        className="flex-1 gap-2 text-destructive hover:text-destructive border-destructive/30"
                      >
                        <FiTrash2 className="size-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function StoresPage() {
  const dispatch = useAppDispatch()
  const storeState = useAppSelector((state) => state.store)
  const authState = useAppSelector((state) => state.auth)
  
  const stores = storeState?.stores || []
  const isLoading = storeState?.isLoading || false
  const currentUser = authState?.user

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StoreData | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<StoreData | null>(null)

  useEffect(() => {
    console.log("[v0] Stores page mounted, dispatching fetchStores")
    dispatch(fetchStores())
  }, [dispatch])

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const isGuest = currentUser?.role === "guest"

  const canCreate = !isGuest
  const canEdit = !isGuest
  const canDelete = isAdmin || isManager

  function handleDeleteClick(store: StoreData) {
    if (!canDelete) {
      toast.error("You don't have permission to delete stores")
      return
    }
    setStoreToDelete(store)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (storeToDelete) {
      try {
        await dispatch(deleteStore(storeToDelete.id)).unwrap()
        toast.success(`Store "${storeToDelete.name}" deleted successfully.`)
        setStoreToDelete(null)
      } catch (error: any) {
        console.error("[v0] Failed to delete store:", error)
        // Display the specific error message from the backend, or a generic one as a fallback.
        const errorMessage = error?.details || "Failed to delete the store. Please try again."
        toast.error(errorMessage)
      }
    }
    setDeleteConfirmOpen(false)
  }

  function handleEdit(store: StoreData) {
    if (!canEdit) {
      toast.error("You don't have permission to edit stores")
      return
    }
    setEditing(store)
    setFormOpen(true)
  }

  function handleAdd() {
    if (!canCreate) {
      toast.error("You don't have permission to create stores")
      return
    }
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Stores</h1>
          {isGuest && <p className="text-sm text-muted-foreground mt-1">View only access</p>}
        </div>
        {canCreate && (
          <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
            <FiPlus className="size-4" />
            Add Store
          </Button>
        )}
      </div>

      {formOpen && (
        <StoreForm
          store={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSave={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {!formOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">All Stores</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <StoresTable
              stores={stores}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the store "{storeToDelete?.name}"? This action cannot be undone and will
              permanently remove this store from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStoreToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
