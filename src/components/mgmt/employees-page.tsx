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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiUser, FiCalendar, FiShield } from "react-icons/fi"
import { toast } from "sonner"

type EmployeeRole = "manager" | "employee"

type Employee = {
  id: string
  name: string
  phone: string
  email: string
  role: EmployeeRole
  imageUrl?: string
  createdAt: string
  managedBy: string
}

const employeeStorage = {
  get: (): Employee[] => {
    try {
      const data = localStorage.getItem('crm_employees')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },
  set: (employees: Employee[]) => {
    localStorage.setItem('crm_employees', JSON.stringify(employees))
  },
  add: (employee: Employee) => {
    const employees = employeeStorage.get()
    employees.push(employee)
    employeeStorage.set(employees)
  },
  update: (id: string, employee: Employee) => {
    const employees = employeeStorage.get()
    const index = employees.findIndex(e => e.id === id)
    if (index !== -1) {
      employees[index] = employee
      employeeStorage.set(employees)
    }
  },
  remove: (id: string) => {
    const employees = employeeStorage.get().filter(e => e.id !== id)
    employeeStorage.set(employees)
  }
}

const uid = () => Math.random().toString(36).slice(2, 11)

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  useEffect(() => {
    setEmployees(employeeStorage.get())
  }, [])

  function refresh() {
    setEmployees(employeeStorage.get())
  }

  function handleDeleteClick(id: string) {
    setEmployeeToDelete(id)
    setDeleteConfirmOpen(true)
  }

  function confirmDelete() {
    if (employeeToDelete) {
      employeeStorage.remove(employeeToDelete)
      refresh()
      toast.success("Employee deleted successfully")
      setEmployeeToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  function handleEdit(employee: Employee) {
    setEditing(employee)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-semibold">Employees</h1>
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
          <FiPlus className="size-4" />
          Add Employee
        </Button>
      </div>

      {formOpen && (
        <EmployeeForm
          employee={editing}
          allEmployees={employees}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSave={() => {
            refresh()
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {!formOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">All Employees</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <EmployeesTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
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

function EmployeeForm({ 
  employee, 
  allEmployees,
  onClose, 
  onSave 
}: { 
  employee: Employee | null
  allEmployees: Employee[]
  onClose: () => void
  onSave: () => void 
}) {
  const [name, setName] = useState(employee?.name || "")
  const [phone, setPhone] = useState(employee?.phone || "")
  const [email, setEmail] = useState(employee?.email || "")
  const [role, setRole] = useState<EmployeeRole>(employee?.role || "employee")
  const [managedBy, setManagedBy] = useState(employee?.managedBy || "")
  const [imagePreview, setImagePreview] = useState<string | undefined>(employee?.imageUrl)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableManagers = allEmployees.filter(emp => 
    emp.id !== employee?.id && emp.role === "manager"
  )

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function validate() {
    const errs: Record<string, string> = {}

    if (!name.trim()) errs.name = "Employee name is required"
    
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format"

    if (!phone.trim()) errs.phone = "Phone is required"
    else if (phone.replace(/\D/g, "").length < 10) errs.phone = "Phone must be at least 10 digits"

    if (role === "employee" && !managedBy) {
      errs.managedBy = "Please select a manager for this employee"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors")
      return
    }

    const employeeData: Employee = {
      id: employee?.id || uid(),
      name,
      phone,
      email,
      role,
      imageUrl: imagePreview,
      managedBy: role === "manager" ? "" : managedBy,
      createdAt: employee?.createdAt || new Date().toISOString(),
    }

    if (employee) {
      employeeStorage.update(employee.id, employeeData)
      toast.success("Employee updated successfully")
    } else {
      employeeStorage.add(employeeData)
      toast.success("Employee added successfully")
    }

    onSave()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {employee ? "Edit Employee" : "Add New Employee"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Employee Name *</Label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Employee Email *</Label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Employee Phone *</Label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={role} onValueChange={(v) => {
              setRole(v as EmployeeRole)
              if (v === "manager") setManagedBy("")
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "employee" && (
            <div className="space-y-2 md:col-span-2">
              <Label>Managed By *</Label>
              <Select value={managedBy} onValueChange={setManagedBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {availableManagers.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No managers available. Please add a manager first.
                    </div>
                  ) : (
                    availableManagers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.managedBy && <p className="text-xs text-destructive">{errors.managedBy}</p>}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Employee Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {imagePreview && (
            <div className="space-y-2 md:col-span-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={imagePreview} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImagePreview(undefined)}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          )}

          {employee && (
            <div className="space-y-2 md:col-span-2">
              <Label>Created At</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCalendar className="size-4" />
                <span>{new Date(employee.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {employee ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmployeesTable({ 
  employees, 
  onEdit, 
  onDelete 
}: {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
}) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FiUser className="size-12 mx-auto mb-3 opacity-20" />
        <p>No employees yet.</p>
      </div>
    )
  }

  function getManagerName(managedBy: string): string {
    if (!managedBy) return "N/A"
    const manager = employees.find(e => e.id === managedBy)
    return manager?.name || "Unknown"
  }

  const roleColors: Record<EmployeeRole, string> = {
    manager: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    employee: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-3">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-t-lg text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Image</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-right">Managed By / Actions</div>
          </div>
          <div className="border rounded-b-lg divide-y">
            {employees.map((employee) => (
              <div key={employee.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                <div className="col-span-1">
                  <Avatar className="size-10">
                    <AvatarImage src={employee.imageUrl} />
                    <AvatarFallback>{employee.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="col-span-2">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <FiCalendar className="size-3" />
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FiPhone className="size-3 shrink-0" />
                    <span className="truncate">{employee.phone}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge variant="secondary" className={`${roleColors[employee.role]} capitalize`}>
                    {employee.role}
                  </Badge>
                </div>
                <div className="col-span-2">
                  {employee.role === "employee" && employee.managedBy && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <FiShield className="size-3 inline mr-1" />
                      {getManagerName(employee.managedBy)}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(employee)}
                      aria-label="Edit employee"
                    >
                      <FiEdit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(employee.id)}
                      aria-label="Delete employee"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <FiTrash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {employees.map((employee) => (
          <Card key={employee.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={employee.imageUrl} />
                  <AvatarFallback>{employee.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium">{employee.name}</div>
                    <Badge variant="secondary" className={`${roleColors[employee.role]} capitalize text-xs shrink-0`}>
                      {employee.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiMail className="size-3 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiPhone className="size-3 shrink-0" />
                    <span>{employee.phone}</span>
                  </div>
                  {employee.role === "employee" && employee.managedBy && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Managed by:</span>
                      <span className="text-xs font-medium">{getManagerName(employee.managedBy)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FiCalendar className="size-3" />
                    <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      className="flex-1 gap-2"
                    >
                      <FiEdit2 className="size-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(employee.id)}
                      className="flex-1 gap-2 text-destructive hover:text-destructive border-destructive/30"
                    >
                      <FiTrash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}