"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCompanies, addCompany, updateCompanyData, deleteCompanyData } from "@/store/slices/companySlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { CompanyData } from "@/store/slices/companySlice"

interface FormData extends Partial<CompanyData> {
  id?: string
}

export default function ManageCompanyPage() {
  const dispatch = useAppDispatch()
  const { companies, isLoading } = useAppSelector((state) => state.company)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [post, setPost] = useState<"director" | "manager" | "accounts">("director")

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    cinNumber: "",
    registerAddress: "",
    alternateAddress: "",
    gstNo: "",
    registeredMailId: "",
    phoneNumber: "",
    post: "director",
    directorFullName: "",
    dinNumber: "",
    directorPhone: "",
    directorEmail: "",
    panNumber: "",
    aadhaarNumber: "",
    contactFullName: "",
    contactPhone: "",
    contactEmail: "",
  })

  useEffect(() => {
    dispatch(fetchCompanies() as any)
  }, [dispatch])

  const handlePostChange = (newPost: "director" | "manager" | "accounts") => {
    setPost(newPost)
    setFormData((prev) => ({
      ...prev,
      post: newPost,
      directorFullName: "",
      dinNumber: "",
      directorPhone: "",
      directorEmail: "",
      panNumber: "",
      aadhaarNumber: "",
      contactFullName: "",
      contactPhone: "",
      contactEmail: "",
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      cinNumber: "",
      registerAddress: "",
      alternateAddress: "",
      gstNo: "",
      registeredMailId: "",
      phoneNumber: "",
      post: "director",
      directorFullName: "",
      dinNumber: "",
      directorPhone: "",
      directorEmail: "",
      panNumber: "",
      aadhaarNumber: "",
      contactFullName: "",
      contactPhone: "",
      contactEmail: "",
    })
    setPost("director")
    setEditingId(null)
  }

  const handleAddClick = () => {
    resetForm()
    setOpenDialog(true)
  }

  const handleEditClick = (company: CompanyData) => {
    setEditingId(company.id)
    setFormData(company)
    setPost(company.post)
    setOpenDialog(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)
  }

  const handleSave = async () => {
    // Validation
    if (
      !formData.companyName ||
      !formData.cinNumber ||
      !formData.registerAddress ||
      !formData.gstNo ||
      !formData.registeredMailId ||
      !formData.phoneNumber
    ) {
      alert("Please fill in all required company fields")
      return
    }

    if (post === "director") {
      if (
        !formData.directorFullName ||
        !formData.dinNumber ||
        !formData.directorPhone ||
        !formData.directorEmail ||
        !formData.panNumber ||
        !formData.aadhaarNumber
      ) {
        alert("Please fill in all director fields")
        return
      }
    } else if (["manager", "accounts"].includes(post)) {
      if (!formData.contactFullName || !formData.contactPhone || !formData.contactEmail) {
        alert("Please fill in all contact fields")
        return
      }
    }

    const dataToSave = {
      ...formData,
      post,
    }

    if (editingId) {
      dispatch(updateCompanyData({ id: editingId, data: dataToSave }) as any)
    } else {
      dispatch(addCompany(dataToSave) as any)
    }

    setOpenDialog(false)
    resetForm()
  }

  const handleConfirmDelete = () => {
    if (deleteId) {
      dispatch(deleteCompanyData(deleteId) as any)
      setOpenDeleteDialog(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Companies</h1>
          <p className="text-muted-foreground mt-2">Create and manage company information</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Company" : "Add New Company"}</DialogTitle>
              <DialogDescription>Enter company details. Fields shown depend on the selected post.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Common Company Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cinNumber">CIN Number *</Label>
                  <Input
                    id="cinNumber"
                    name="cinNumber"
                    value={formData.cinNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter CIN"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNo">GST No. *</Label>
                  <Input
                    id="gstNo"
                    name="gstNo"
                    value={formData.gstNo || ""}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="registerAddress">Registered Address *</Label>
                  <Input
                    id="registerAddress"
                    name="registerAddress"
                    value={formData.registerAddress || ""}
                    onChange={handleInputChange}
                    placeholder="Enter registered address"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="alternateAddress">Alternate/Branch Address</Label>
                  <Input
                    id="alternateAddress"
                    name="alternateAddress"
                    value={formData.alternateAddress || ""}
                    onChange={handleInputChange}
                    placeholder="Enter alternate address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredMailId">Email *</Label>
                  <Input
                    id="registeredMailId"
                    name="registeredMailId"
                    type="email"
                    value={formData.registeredMailId || ""}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="post">Post Type *</Label>
                  <Select value={post} onValueChange={handlePostChange}>
                    <SelectTrigger id="post">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="accounts">Accounts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Director Fields */}
              {post === "director" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold">Director Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="directorFullName">Full Name *</Label>
                      <Input
                        id="directorFullName"
                        name="directorFullName"
                        value={formData.directorFullName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dinNumber">DIN Number *</Label>
                      <Input
                        id="dinNumber"
                        name="dinNumber"
                        value={formData.dinNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Enter DIN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        name="panNumber"
                        value={formData.panNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Enter PAN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorPhone">Phone *</Label>
                      <Input
                        id="directorPhone"
                        name="directorPhone"
                        value={formData.directorPhone || ""}
                        onChange={handleInputChange}
                        placeholder="Enter phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">Email *</Label>
                      <Input
                        id="directorEmail"
                        name="directorEmail"
                        type="email"
                        value={formData.directorEmail || ""}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                      <Input
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber || ""}
                        onChange={handleInputChange}
                        placeholder="Enter Aadhaar number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Manager/Accounts Fields */}
              {["manager", "accounts"].includes(post) && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="contactFullName">Full Name *</Label>
                      <Input
                        id="contactFullName"
                        name="contactFullName"
                        value={formData.contactFullName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone *</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone || ""}
                        onChange={handleInputChange}
                        placeholder="Enter phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail || ""}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  {editingId ? "Update" : "Add"} Company
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>View and manage all companies</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && companies.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No companies found. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>GST No.</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.cinNumber}</TableCell>
                      <TableCell>{company.gstNo}</TableCell>
                      <TableCell className="capitalize">{company.post}</TableCell>
                      <TableCell>
                        {company.post === "director" ? company.directorFullName : company.contactFullName}
                      </TableCell>
                      <TableCell>
                        {company.post === "director" ? company.directorEmail : company.contactEmail}
                      </TableCell>
                      <TableCell>
                        {company.post === "director" ? company.directorPhone : company.contactPhone}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(company)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(company.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Company</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this company? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
