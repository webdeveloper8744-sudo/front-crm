"use client"

import type React from "react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiCalendar, FiFileText } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProducts, addProduct, updateProduct, deleteProduct, type ProductData } from "@/store/slices/productSlice"
import { getFileUrl } from "@/config/api"

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: ProductData | null
  onClose: () => void
  onSave: () => void
}) {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.product)

  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [imagePreview, setImagePreview] = useState<string | undefined>(getFileUrl(product?.imageUrl))
  const [imageFile, setImageFile] = useState<File | null>(null) // Store actual file
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function validate() {
    const errs: Record<string, string> = {}

    if (!name.trim()) errs.name = "Product name is required"
    if (!description.trim()) errs.description = "Product description is required"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)

    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      if (product) {
        await dispatch(updateProduct({ id: product.id, formData })).unwrap()
      } else {
        await dispatch(addProduct(formData)).unwrap()
      }
      onSave()
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">
              Product Name *
            </Label>
            <div className="relative">
              <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-9 border-2 focus:border-primary bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Product Description *
            </Label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Textarea
                id="description"
                className="pl-9 min-h-[120px] border-2 focus:border-primary bg-background"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
              />
            </div>
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="font-semibold">
              Product Image
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border-2 focus:border-primary bg-background"
            />
          </div>

          {imagePreview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-24 rounded-lg">
                  <AvatarImage src={imagePreview || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="rounded-lg">
                    <FiPackage className="size-8" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImagePreview(undefined)
                    setImageFile(null) // Clear file
                  }}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          )}

          {product && (
            <div className="space-y-2">
              <Label>Created At</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCalendar className="size-4" />
                <span>{new Date(product.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  products: ProductData[]
  isLoading: boolean
  onEdit: (product: ProductData) => void
  onDelete: (product: ProductData) => void
  canEdit?: boolean
  canDelete?: boolean
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Loading products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiPackage className="size-12 mx-auto mb-3 opacity-20" />
        <p>No products yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
            <div className="col-span-1"></div>
            <div className="col-span-3">Product Name</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Created At</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="border rounded-b-lg divide-y">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-1">
                  <Avatar className="size-12 rounded-lg">
                    <AvatarImage src={getFileUrl(product.imageUrl) || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="rounded-lg">
                      <FiPackage className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="col-span-3">
                  <div className="font-medium">{product.name}</div>
                </div>
                <div className="col-span-5">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="size-3 shrink-0" />
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs mt-1">{new Date(product.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(product)} aria-label="Edit product">
                      <FiEdit2 className="size-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
                      aria-label="Delete product"
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
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-16 rounded-lg shrink-0">
                  <AvatarImage src={getFileUrl(product.imageUrl) || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="rounded-lg">
                    <FiPackage className="size-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="font-medium text-base">{product.name}</div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FiCalendar className="size-3" />
                    <span>{new Date(product.createdAt).toLocaleString()}</span>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 pt-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex-1 gap-2">
                          <FiEdit2 className="size-3" />
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(product)}
                          className="flex-1 gap-2 text-destructive hover:text-destructive border-destructive/30"
                        >
                          <FiTrash2 className="size-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const { products, isLoading } = useAppSelector((state) => state.product)
  const { user: currentUser } = useAppSelector((state) => state.auth)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductData | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const isGuest = currentUser?.role === "guest"

  const canCreate = !isGuest // All except guest can create
  const canEdit = !isGuest // All except guest can edit
  const canDelete = isAdmin || isManager // Only admin and manager can delete

  function handleDeleteClick(product: ProductData) {
    if (!canDelete) {
      toast.error("You don't have permission to delete products")
      return
    }
    setProductToDelete(product)
    setDeleteConfirmOpen(true)
  }

  function confirmDelete() {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete.id))
      setProductToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  function handleEdit(product: ProductData) {
    if (!canEdit) {
      toast.error("You don't have permission to edit products")
      return
    }
    setEditing(product)
    setFormOpen(true)
  }

  function handleAdd() {
    if (!canCreate) {
      toast.error("You don't have permission to create products")
      return
    }
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Products</h1>
          {isGuest && <p className="text-sm text-muted-foreground mt-1">View only access</p>}
        </div>
        {canCreate && (
          <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
            <FiPlus className="size-4" />
            Add Product
          </Button>
        )}
      </div>

      {formOpen && (
        <ProductForm
          product={editing}
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
            <CardTitle className="text-base md:text-lg">All Products</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <ProductsTable
              products={products}
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
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone and
              will permanently remove this product from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
