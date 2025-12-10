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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { FiEdit2, FiTrash2, FiPackage, FiCalendar, FiFileText, FiSettings } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProducts, addProduct, updateProduct, deleteProduct, type ProductData } from "@/store/slices/productSlice"
import { fetchServices, addService, updateService, deleteService, type ServiceData } from "@/store/slices/serviceSlice"
import { getFileUrl } from "@/config/api"

// ============ PRODUCT FORM ============
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
  const [imageFile, setImageFile] = useState<File | null>(null)
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
                    setImageFile(null)
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

// ============ SERVICE FORM ============
function ServiceForm({
  service,
  onClose,
  onSave,
}: {
  service: ServiceData | null
  onClose: () => void
  onSave: () => void
}) {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.service)

  const [serviceName, setServiceName] = useState(service?.serviceName || "")
  const [purpose, setPurpose] = useState(service?.purpose || "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}

    if (!serviceName.trim()) errs.serviceName = "Service name is required"
    if (!purpose.trim()) errs.purpose = "Service purpose is required"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors")
      return
    }

    try {
      if (service) {
        await dispatch(updateService({ id: service.id, serviceName, purpose })).unwrap()
      } else {
        await dispatch(addService({ serviceName, purpose })).unwrap()
      }
      onSave()
    } catch (error) {
      console.error("Failed to save service:", error)
    }
  }

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{service ? "Edit Service" : "Add New Service"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="serviceName" className="font-semibold">
              Service Name *
            </Label>
            <div className="relative">
              <FiSettings className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="serviceName"
                className="pl-9 border-2 focus:border-primary bg-background"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name"
              />
            </div>
            {errors.serviceName && <p className="text-xs text-destructive">{errors.serviceName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="font-semibold">
              Purpose *
            </Label>
            <Textarea
              id="purpose"
              className="min-h-[120px] border-2 focus:border-primary bg-background"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe the purpose of this service..."
            />
            {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
          </div>

          {service && (
            <div className="space-y-2">
              <Label>Created At</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCalendar className="size-4" />
                <span>{new Date(service.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : service ? "Update Service" : "Add Service"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ PRODUCTS TABLE ============
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
    return <div className="text-center py-12 text-muted-foreground">Loading products...</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiPackage className="size-12 mx-auto mb-3 opacity-20" />
        <p>No products yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:grid gap-4 px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground grid-cols-12">
        <div className="col-span-1"></div>
        <div className="col-span-3">Product Name</div>
        <div className="col-span-5">Description</div>
        <div className="col-span-2">Created At</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="space-y-3 md:space-y-0 md:border md:rounded-lg md:divide-y">
        {products.map((product) => (
          <div
            key={product.id}
            className="hidden md:grid gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors grid-cols-12"
          >
            <div className="col-span-1">
              <Avatar className="size-12 rounded-lg">
                <AvatarImage src={getFileUrl(product.imageUrl) || "/placeholder.svg"} className="object-cover" />
                <AvatarFallback className="rounded-lg">
                  <FiPackage className="size-5" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="col-span-3 font-medium">{product.name}</div>
            <div className="col-span-5 text-sm text-muted-foreground line-clamp-2">{product.description}</div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
            <div className="col-span-1 flex items-center justify-end gap-1">
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                  <FiEdit2 className="size-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product)}
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
  )
}

// ============ SERVICES TABLE ============
function ServicesTable({
  services,
  isLoading,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  services: ServiceData[]
  isLoading: boolean
  onEdit: (service: ServiceData) => void
  onDelete: (service: ServiceData) => void
  canEdit?: boolean
  canDelete?: boolean
}) {
  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading services...</div>
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiSettings className="size-12 mx-auto mb-3 opacity-20" />
        <p>No services yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:grid gap-4 px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground grid-cols-12">
        <div className="col-span-3">Service Name</div>
        <div className="col-span-6">Purpose</div>
        <div className="col-span-2">Created At</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="space-y-3 md:space-y-0 md:border md:rounded-lg md:divide-y">
        {services.map((service) => (
          <div
            key={service.id}
            className="hidden md:grid gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors grid-cols-12"
          >
            <div className="col-span-3 font-medium">{service.serviceName}</div>
            <div className="col-span-6 text-sm text-muted-foreground line-clamp-2">{service.purpose}</div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {new Date(service.createdAt).toLocaleDateString()}
            </div>
            <div className="col-span-1 flex items-center justify-end gap-1">
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
                  <FiEdit2 className="size-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(service)}
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
  )
}

// ============ MAIN PAGE ============
export function ProductsServicesPage() {
  const dispatch = useAppDispatch()
  const { products, isLoading: productLoading } = useAppSelector((state) => state.product)
  const { services, isLoading: serviceLoading } = useAppSelector((state) => state.service)
  const { user: currentUser } = useAppSelector((state) => state.auth)

  const [productFormOpen, setProductFormOpen] = useState(false)
  const [serviceFormOpen, setServiceFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [editingService, setEditingService] = useState<ServiceData | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"product" | "service" | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ProductData | ServiceData | null>(null)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchServices())
  }, [dispatch])

  const canCreate = ["admin", "manager"].includes(currentUser?.role || "")
  const canEdit = ["admin", "manager"].includes(currentUser?.role || "")
  const canDelete = currentUser?.role === "admin"
  const allProducts = products || []
  const allServices = services || []

  if (productLoading && serviceLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products & Services</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Products</h2>
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setProductFormOpen(true)
                }}
                className="bg-primary hover:bg-primary/90"
              >
                + Add Product
              </Button>
            )}
          </div>

          {productFormOpen && (
            <ProductForm
              product={editingProduct}
              onClose={() => {
                setProductFormOpen(false)
                setEditingProduct(null)
              }}
              onSave={() => {
                setProductFormOpen(false)
                setEditingProduct(null)
                dispatch(fetchProducts())
              }}
            />
          )}

          {!productFormOpen && (
            <Card>
              <CardContent className="pt-6">
                {allProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FiPackage className="size-12 mx-auto mb-3 opacity-20" />
                    <p>No products yet. Create one to get started!</p>
                  </div>
                ) : (
                  <ProductsTable
                    products={allProducts}
                    isLoading={productLoading}
                    onEdit={(product) => {
                      setEditingProduct(product)
                      setProductFormOpen(true)
                    }}
                    onDelete={(product) => {
                      if (!canDelete) {
                        toast.error("You don't have permission to delete products")
                        return
                      }
                      setItemToDelete(product)
                      setDeleteType("product")
                      setDeleteConfirmOpen(true)
                    }}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Services</h2>
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingService(null)
                  setServiceFormOpen(true)
                }}
                className="bg-primary hover:bg-primary/90"
              >
                + Add Service
              </Button>
            )}
          </div>

          {serviceFormOpen && (
            <ServiceForm
              service={editingService}
              onClose={() => {
                setServiceFormOpen(false)
                setEditingService(null)
              }}
              onSave={() => {
                setServiceFormOpen(false)
                setEditingService(null)
                dispatch(fetchServices())
              }}
            />
          )}

          {!serviceFormOpen && (
            <Card>
              <CardContent className="pt-6">
                {allServices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FiSettings className="size-12 mx-auto mb-3 opacity-20" />
                    <p>No services yet. Create one to get started!</p>
                  </div>
                ) : (
                  <ServicesTable
                    services={allServices}
                    isLoading={serviceLoading}
                    onEdit={(service) => {
                      setEditingService(service)
                      setServiceFormOpen(true)
                    }}
                    onDelete={(service) => {
                      if (!canDelete) {
                        toast.error("You don't have permission to delete services")
                        return
                      }
                      setItemToDelete(service)
                      setDeleteType("service")
                      setDeleteConfirmOpen(true)
                    }}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete && deleteType === "product"
                ? `Delete "${(itemToDelete as ProductData).name}"? This cannot be undone.`
                : itemToDelete && deleteType === "service"
                  ? `Delete "${(itemToDelete as ServiceData).serviceName}"? This cannot be undone.`
                  : "Delete this item? This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!itemToDelete || !deleteType) return

                if (deleteType === "product") {
                  dispatch(deleteProduct((itemToDelete as ProductData).id))
                } else {
                  dispatch(deleteService((itemToDelete as ServiceData).id))
                }

                setItemToDelete(null)
                setDeleteType(null)
                setDeleteConfirmOpen(false)
              }}
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
