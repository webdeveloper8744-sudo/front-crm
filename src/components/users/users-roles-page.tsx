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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiShield, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addUser, updateUser, deleteUser, fetchUsers, type UserData } from "@/store/slices/userSlice"

type UserRole = "admin" | "employee" | "manager" | "guest"

export function UsersRolesPage() {
  const dispatch = useAppDispatch()
  const { users, isLoading } = useAppSelector((state) => state.user)
  const { user: currentUser, isInitialized } = useAppSelector((state) => state.auth)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UserData | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  // Determine user permissions
  const isAdmin = currentUser?.role === "admin"
  const isManager = currentUser?.role === "manager"
  const canManageUsers = isAdmin || isManager
  const canDelete = isAdmin // Only admin can delete

  useEffect(() => {
    // Fetch users when auth is initialized and user is logged in
    if (isInitialized && currentUser) {
      dispatch(fetchUsers())
    }
  }, [dispatch, isInitialized, currentUser])

  function handleDeleteClick(id: string) {
    if (!canDelete) {
      toast.error("Only administrators can delete users")
      return
    }
    setUserToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (userToDelete && canDelete) {
      await dispatch(deleteUser(userToDelete))
      setUserToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  function handleEdit(user: UserData) {
    if (!canManageUsers) {
      toast.error("You don't have permission to edit users")
      return
    }
    setEditing(user)
    setFormOpen(true)
  }

  function handleAdd() {
    if (!isAdmin) {
      toast.error("Only administrators can add users")
      return
    }
    setEditing(null)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditing(null)
  }

  async function handleSave() {
    // Refresh users list after save
    await dispatch(fetchUsers())
    setFormOpen(false)
    setEditing(null)
  }

  // Show loading state while checking authentication
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

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <FiAlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Authentication Required</h2>
                <p className="text-muted-foreground">Please log in to access this page.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Guest users can only view
  const isGuestView = currentUser.role === "guest"

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Users & Roles</h1>
          {isGuestView && <p className="text-sm text-muted-foreground mt-1">View only access</p>}
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto" disabled={isLoading}>
            <FiPlus className="size-4" />
            Add User
          </Button>
        )}
      </div>

      {formOpen && <UserForm user={editing} onClose={handleClose} onSave={handleSave} />}

      {!formOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">All Users</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <UsersTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
              canEdit={canManageUsers}
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
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
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

function UserForm({
  user,
  onClose,
  onSave,
}: {
  user: UserData | null
  onClose: () => void
  onSave: () => void
}) {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.user)
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>(user?.role || "employee")
  const [imagePreview, setImagePreview] = useState<string | undefined>(user?.imageUrl)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        e.target.value = ""
        return
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only image files (JPEG, PNG, GIF, WEBP) are allowed")
        e.target.value = ""
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function validate() {
    const errs: Record<string, string> = {}

    // Full Name validation
    if (!fullName.trim()) {
      errs.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters"
    }

    // Email validation
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Invalid email format"
    }

    // Phone validation
    if (!phone.trim()) {
      errs.phone = "Phone is required"
    } else {
      const digitsOnly = phone.replace(/\D/g, "")
      if (digitsOnly.length < 10) {
        errs.phone = "Phone must be at least 10 digits"
      }
    }

    // Password validation for new users
    if (!user) {
      if (!password) {
        errs.password = "Password is required"
      } else if (password.length < 6) {
        errs.password = "Password must be at least 6 characters"
      }

      if (!confirmPassword) {
        errs.confirmPassword = "Please confirm password"
      } else if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match"
      }
    } else if (password || confirmPassword) {
      // Password validation for existing users (optional)
      if (password && password.length < 6) {
        errs.password = "Password must be at least 6 characters"
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      const formData = new FormData()
      formData.append("fullName", fullName.trim())
      formData.append("email", email.trim())
      formData.append("phone", phone.trim())
      formData.append("role", role)

      if (password) {
        formData.append("password", password)
      }

      // Handle image file
      const imageInput = document.getElementById("image") as HTMLInputElement
      if (imageInput?.files?.[0]) {
        formData.append("image", imageInput.files[0])
      }

      if (user) {
        await dispatch(
          updateUser({
            id: user.id,
            formData: formData,
          }),
        ).unwrap()
      } else {
        await dispatch(addUser(formData)).unwrap()
      }

      onSave()
    } catch (error: any) {
      console.error("Form submission error:", error)
      // Error toast is handled in the slice
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{user ? "Edit User" : "Add New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isLoading}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {user && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}
              {!user && " *"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password {!user && " *"}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-9"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Max size: 5MB. Formats: JPEG, PNG, GIF, WEBP</p>
          </div>

          {imagePreview && (
            <div className="space-y-2 md:col-span-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={imagePreview || "/placeholder.svg"} />
                  <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImagePreview(undefined)
                    const imageInput = document.getElementById("image") as HTMLInputElement
                    if (imageInput) imageInput.value = ""
                  }}
                  disabled={isLoading}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2">Processing...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              </>
            ) : user ? (
              "Update User"
            ) : (
              "Add User"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function UsersTable({
  users,
  onEdit,
  onDelete,
  isLoading,
  canEdit,
  canDelete,
}: {
  users: UserData[]
  onEdit: (user: UserData) => void
  onDelete: (id: string) => void
  isLoading: boolean
  canEdit: boolean
  canDelete: boolean
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiShield className="size-12 mx-auto mb-3 opacity-20" />
        <p>No users yet.</p>
      </div>
    )
  }

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    manager: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    employee: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    guest: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  }

  return (
    <div className="space-y-3">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
            <div className="col-span-1">User</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="border rounded-b-lg divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-1">
                  <Avatar className="size-10">
                    <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
                    <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="col-span-3">
                  <span className="font-medium">{user.fullName}</span>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <FiMail className="size-3 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{user.email}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FiPhone className="size-3 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <Badge variant="secondary" className={`${roleColors[user.role]} capitalize`}>
                    {user.role}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label="Edit user">
                      <FiEdit2 className="size-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      aria-label="Delete user"
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
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="font-medium text-base">{user.fullName}</div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FiMail className="size-3 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm truncate">{user.email}</span>
                    </div>
                    <Badge variant="secondary" className={`${roleColors[user.role]} capitalize text-xs shrink-0`}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiPhone className="size-3 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 pt-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="flex-1 gap-2">
                          <FiEdit2 className="size-3" />
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(user.id)}
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
