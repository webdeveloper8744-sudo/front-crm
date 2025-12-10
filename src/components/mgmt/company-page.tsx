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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  fetchCompanyById,
  type CompanyData,
  type CompanyDirector,
  type CompanyEmployee,
} from "@/store/slices/companySlice"

type CompanyPost = "Director" | "Manager" | "Accounts" | "Other"

interface CompanyFormData extends CompanyData {
  director?: CompanyDirector
  employee?: CompanyEmployee
}

function CompanyForm({
  company,
  onClose,
  onSave,
}: {
  company: CompanyFormData | null
  onClose: () => void
  onSave: () => void
}) {
  const dispatch = useAppDispatch()
  const { isLoading, currentCompany } = useAppSelector((state) => state.company)

  const [formData, setFormData] = useState<CompanyFormData>({
    id: "",
    companyName: "",
    cinNumber: "",
    registeredAddress: "",
    alternateAddress: "",
    gstNumber: "",
    registeredMailId: "",
    dinAlphanumeric: "",
    post: "Director",
    phoneNumber: "",
    createdAt: "",
  })

  const [director, setDirector] = useState<CompanyDirector>({
    fullName: "",
    dinNumber: "",
    phoneNumber: "",
    email: "",
    panNumber: "",
    aadhaarNumber: "",
  })

  const [employee, setEmployee] = useState<CompanyEmployee>({
    fullName: "",
    phoneNumber: "",
    email: "",
    designation: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (company?.id && currentCompany?.company?.id === company.id) {
      setFormData({
        id: currentCompany.company.id,
        companyName: currentCompany.company.companyName,
        cinNumber: currentCompany.company.cinNumber,
        registeredAddress: currentCompany.company.registeredAddress,
        alternateAddress: currentCompany.company.alternateAddress || "",
        gstNumber: currentCompany.company.gstNumber,
        registeredMailId: currentCompany.company.registeredMailId,
        dinAlphanumeric: currentCompany.company.dinAlphanumeric,
        post: currentCompany.company.post,
        phoneNumber: currentCompany.company.phoneNumber || "",
        createdAt: currentCompany.company.createdAt,
      })

      if (currentCompany.directors && currentCompany.directors.length > 0) {
        const directorData = currentCompany.directors[0]
        setDirector({
          id: directorData.id,
          fullName: directorData.fullName,
          dinNumber: directorData.dinNumber,
          phoneNumber: directorData.phoneNumber,
          email: directorData.email,
          panNumber: directorData.panNumber,
          aadhaarNumber: directorData.aadhaarNumber,
        })
      }

      if (currentCompany.employees && currentCompany.employees.length > 0) {
        const employeeData = currentCompany.employees[0]
        setEmployee({
          id: employeeData.id,
          fullName: employeeData.fullName,
          phoneNumber: employeeData.phoneNumber,
          email: employeeData.email,
          designation: employeeData.designation,
        })
      }
    } else if (!company) {
      setFormData({
        id: "",
        companyName: "",
        cinNumber: "",
        registeredAddress: "",
        alternateAddress: "",
        gstNumber: "",
        registeredMailId: "",
        dinAlphanumeric: "",
        post: "Director",
        phoneNumber: "",
        createdAt: "",
      })
      setDirector({
        fullName: "",
        dinNumber: "",
        phoneNumber: "",
        email: "",
        panNumber: "",
        aadhaarNumber: "",
      })
      setEmployee({
        fullName: "",
        phoneNumber: "",
        email: "",
        designation: "",
      })
    }
  }, [company, currentCompany])

  function validate() {
    const errs: Record<string, string> = {}

    if (!formData.companyName?.trim()) errs.companyName = "Company name is required"
    if (!formData.cinNumber?.trim()) errs.cinNumber = "CIN number is required"
    if (!formData.registeredAddress?.trim()) errs.registeredAddress = "Registered address is required"
    if (!formData.gstNumber?.trim()) errs.gstNumber = "GST number is required"
    if (!formData.registeredMailId?.trim()) errs.registeredMailId = "Registered email is required"
    if (!formData.dinAlphanumeric?.trim()) errs.dinAlphanumeric = "DIN is required"

    if (formData.post === "Director") {
      if (!director.fullName?.trim()) errs["director.fullName"] = "Director name is required"
      if (!director.dinNumber?.trim()) errs["director.dinNumber"] = "Director DIN is required"
      if (!director.phoneNumber?.trim()) errs["director.phoneNumber"] = "Director phone is required"
      if (!director.email?.trim()) errs["director.email"] = "Director email is required"
      if (!director.panNumber?.trim()) errs["director.panNumber"] = "Director PAN is required"
      if (!director.aadhaarNumber?.trim()) errs["director.aadhaarNumber"] = "Director Aadhaar is required"
    } else {
      if (!employee.fullName?.trim()) errs["employee.fullName"] = "Employee name is required"
      if (!employee.phoneNumber?.trim()) errs["employee.phoneNumber"] = "Employee phone is required"
      if (!employee.email?.trim()) errs["employee.email"] = "Employee email is required"
      if (!employee.designation?.trim()) errs["employee.designation"] = "Designation is required"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) {
      toast.error("Please fix the errors")
      return
    }

    try {
      const payload = {
        companyName: formData.companyName,
        cinNumber: formData.cinNumber,
        registeredAddress: formData.registeredAddress,
        alternateAddress: formData.alternateAddress,
        gstNumber: formData.gstNumber,
        registeredMailId: formData.registeredMailId,
        dinAlphanumeric: formData.dinAlphanumeric,
        post: formData.post,
        phoneNumber: formData.phoneNumber,
        director: formData.post === "Director" ? director : undefined,
        employee: ["Manager", "Accounts", "Other"].includes(formData.post) ? employee : undefined,
      }

      if (company) {
        await dispatch(updateCompany({ id: company.id, ...payload } as any)).unwrap()
      } else {
        await dispatch(addCompany(payload as any)).unwrap()
      }

      toast.success(company ? "Company updated successfully" : "Company added successfully")
      onClose()
      onSave()
    } catch (err: any) {
      toast.error(err?.message || "Failed to save company")
    }
  }

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{company ? "Edit Company" : "Add New Company"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Details */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="font-semibold">
              Company Name *
            </Label>
            <Input
              id="companyName"
              value={formData.companyName || ""}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter company name"
            />
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cinNumber" className="font-semibold">
              CIN Number *
            </Label>
            <Input
              id="cinNumber"
              value={formData.cinNumber || ""}
              onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter CIN number"
            />
            {errors.cinNumber && <p className="text-xs text-destructive">{errors.cinNumber}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="registeredAddress" className="font-semibold">
              Registered Address *
            </Label>
            <Textarea
              id="registeredAddress"
              value={formData.registeredAddress || ""}
              onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter registered address"
            />
            {errors.registeredAddress && <p className="text-xs text-destructive">{errors.registeredAddress}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alternateAddress" className="font-semibold">
              Alternate Address / Branch Address
            </Label>
            <Textarea
              id="alternateAddress"
              value={formData.alternateAddress || ""}
              onChange={(e) => setFormData({ ...formData, alternateAddress: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter alternate or branch address (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstNumber" className="font-semibold">
              GST Number *
            </Label>
            <Input
              id="gstNumber"
              value={formData.gstNumber || ""}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter GST number"
            />
            {errors.gstNumber && <p className="text-xs text-destructive">{errors.gstNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registeredMailId" className="font-semibold">
              Registered Email ID *
            </Label>
            <Input
              id="registeredMailId"
              type="email"
              value={formData.registeredMailId || ""}
              onChange={(e) => setFormData({ ...formData, registeredMailId: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter email"
            />
            {errors.registeredMailId && <p className="text-xs text-destructive">{errors.registeredMailId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dinAlphanumeric" className="font-semibold">
              DIN (Alphanumeric) *
            </Label>
            <Input
              id="dinAlphanumeric"
              value={formData.dinAlphanumeric || ""}
              onChange={(e) => setFormData({ ...formData, dinAlphanumeric: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter DIN"
            />
            {errors.dinAlphanumeric && <p className="text-xs text-destructive">{errors.dinAlphanumeric}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="font-semibold">
              Company Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="border-2 focus:border-primary"
              placeholder="Enter phone number"
            />
          </div>

          {/* Post Selection */}
          <div className="space-y-2 md:col-span-2">
            <Label className="font-semibold">Post *</Label>
            <Select value={formData.post || "Director"} onValueChange={(v) => setFormData({ ...formData, post: v })}>
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Director">Director</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Accounts">Accounts</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Director Form */}
          {formData.post === "Director" && (
            <>
              <div className="space-y-2 md:col-span-2">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Director Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="directorName" className="font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="directorName"
                  value={director.fullName || ""}
                  onChange={(e) => setDirector({ ...director, fullName: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter full name"
                />
                {errors["director.fullName"] && (
                  <p className="text-xs text-destructive">{errors["director.fullName"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorDin" className="font-semibold">
                  DIN Number (Numeric) *
                </Label>
                <Input
                  id="directorDin"
                  value={director.dinNumber || ""}
                  onChange={(e) => setDirector({ ...director, dinNumber: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter DIN"
                />
                {errors["director.dinNumber"] && (
                  <p className="text-xs text-destructive">{errors["director.dinNumber"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorPhone" className="font-semibold">
                  Phone Number *
                </Label>
                <Input
                  id="directorPhone"
                  value={director.phoneNumber || ""}
                  onChange={(e) => setDirector({ ...director, phoneNumber: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter phone"
                />
                {errors["director.phoneNumber"] && (
                  <p className="text-xs text-destructive">{errors["director.phoneNumber"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorEmail" className="font-semibold">
                  Email *
                </Label>
                <Input
                  id="directorEmail"
                  type="email"
                  value={director.email || ""}
                  onChange={(e) => setDirector({ ...director, email: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter email"
                />
                {errors["director.email"] && <p className="text-xs text-destructive">{errors["director.email"]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorPan" className="font-semibold">
                  PAN Number *
                </Label>
                <Input
                  id="directorPan"
                  value={director.panNumber || ""}
                  onChange={(e) => setDirector({ ...director, panNumber: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter PAN"
                />
                {errors["director.panNumber"] && (
                  <p className="text-xs text-destructive">{errors["director.panNumber"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorAadhaar" className="font-semibold">
                  Aadhaar Number *
                </Label>
                <Input
                  id="directorAadhaar"
                  value={director.aadhaarNumber || ""}
                  onChange={(e) => setDirector({ ...director, aadhaarNumber: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter Aadhaar"
                />
                {errors["director.aadhaarNumber"] && (
                  <p className="text-xs text-destructive">{errors["director.aadhaarNumber"]}</p>
                )}
              </div>
            </>
          )}

          {/* Employee Form */}
          {["Manager", "Accounts", "Other"].includes(formData.post) && (
            <>
              <div className="space-y-2 md:col-span-2">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">{formData.post} Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeName" className="font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="employeeName"
                  value={employee.fullName || ""}
                  onChange={(e) => setEmployee({ ...employee, fullName: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter full name"
                />
                {errors["employee.fullName"] && (
                  <p className="text-xs text-destructive">{errors["employee.fullName"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeePhone" className="font-semibold">
                  Phone Number *
                </Label>
                <Input
                  id="employeePhone"
                  value={employee.phoneNumber || ""}
                  onChange={(e) => setEmployee({ ...employee, phoneNumber: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter phone"
                />
                {errors["employee.phoneNumber"] && (
                  <p className="text-xs text-destructive">{errors["employee.phoneNumber"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeEmail" className="font-semibold">
                  Email *
                </Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={employee.email || ""}
                  onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter email"
                />
                {errors["employee.email"] && <p className="text-xs text-destructive">{errors["employee.email"]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeDesignation" className="font-semibold">
                  Designation *
                </Label>
                <Input
                  id="employeeDesignation"
                  value={employee.designation || ""}
                  onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
                  className="border-2 focus:border-primary"
                  placeholder="Enter designation"
                />
                {errors["employee.designation"] && (
                  <p className="text-xs text-destructive">{errors["employee.designation"]}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex gap-3">
          <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? "Saving..." : company ? "Update Company" : "Create Company"}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CompaniesTable() {
  const dispatch = useAppDispatch()
  const { companies, isLoading } = useAppSelector((state) => state.company)
  const [selectedCompany, setSelectedCompany] = useState<CompanyFormData | null>(null)
  const [isAddingCompany, setIsAddingCompany] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchCompanies() as any)
  }, [dispatch])

  const handleEdit = (company: CompanyData) => {
    dispatch(fetchCompanyById(company.id) as any)
    setSelectedCompany(company)
    setIsAddingCompany(false)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await dispatch(deleteCompany(deleteConfirm) as any)
    setDeleteConfirm(null)
  }

  const handleFormClose = () => {
    setSelectedCompany(null)
    setIsAddingCompany(false)
  }

  const handleFormSave = () => {
    setSelectedCompany(null)
    setIsAddingCompany(false)
    dispatch(fetchCompanies() as any)
  }

  if (selectedCompany || isAddingCompany) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Button onClick={() => handleFormClose()} variant="outline" className="gap-2">
              Back to Companies
            </Button>
          </div>
          <CompanyForm company={selectedCompany} onClose={handleFormClose} onSave={handleFormSave} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Manage Companies</h1>
          </div>
          <Button onClick={() => setIsAddingCompany(true)} className="gap-2">
            <FiPlus className="w-4 h-4" />
            Add Company
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No companies found</p>
              <Button onClick={() => setIsAddingCompany(true)} className="gap-2">
                <FiPlus className="w-4 h-4" />
                Create First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto px-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>CIN Number</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.cinNumber}</TableCell>
                      <TableCell>{company.gstNumber}</TableCell>
                      <TableCell>{company.registeredMailId}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {company.post}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(company)} className="gap-2">
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirm(company.id)}
                            className="gap-2"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default CompaniesTable
