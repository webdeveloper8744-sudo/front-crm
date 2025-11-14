"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FiUpload, FiDownload, FiAlertCircle, FiInfo } from "react-icons/fi"
import { downloadLeadTemplate } from "@/utils/csvExport"
import axios from "axios"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: () => void
}

export function BulkUploadDialog({ open, onOpenChange, onUploadComplete }: BulkUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [results, setResults] = React.useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a valid CSV file")
        return
      }
      setFile(selectedFile)
      setResults(null)
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const data: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}

      headers.forEach((header, index) => {
        // Normalize header to match database field names
        const normalizedHeader = header.trim()

        // Direct mapping from CSV headers to database fields
        const fieldMap: Record<string, string> = {
          "Employee Name": "employeeName",
          Source: "source",
          "Other Source": "otherSource",
          "Lead Created Date": "leadCreatedAt",
          "Expected Close Date": "expectedCloseDate",
          "Last Contacted": "lastContactedAt",
          Stage: "stage",
          Comment: "comment",
          Remarks: "remarks",
          "Client Name": "clientName",
          "Client Company Name": "clientCompanyName",
          "Product Name": "productName",
          "Assign Team Member": "assignTeamMember",
          Email: "email",
          Phone: "phone",
          "Order ID": "orderId",
          "Order Date": "orderDate",
          "Client Address": "clientAddress",
          "Client KYC ID": "clientKycId",
          "KYC PIN": "kycPin",
          "Download Status": "downloadStatus",
          "Processed By": "processedBy",
          "Processed At": "processedAt",
          "Aadhaar PDF URL": "aadhaarPdfUrl",
          "PAN PDF URL": "panPdfUrl",
          "Optional PDF URL": "optionalPdfUrl",
          "Client Image URL": "clientImageUrl",
          "Quoted Price": "quotedPrice",
          "Company Name": "companyName",
          "Company Name & Address": "companyNameAddress",
          "Reference By": "referenceBy",
          "Payment Status": "paymentStatus",
          "Payment Status Note": "paymentStatusNote",
          "Invoice Number": "invoiceNumber",
          "Invoice Date": "invoiceDate",
          "Billing Sent Status": "billingSentStatus",
          "Billing Date": "billingDate",
          "Bill Document URL": "billDocUrl",
        }

        const mappedKey = fieldMap[normalizedHeader]
        if (mappedKey) {
          row[mappedKey] = values[index] || ""
        }
      })

      data.push(row)
    }

    return data
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setUploading(true)
    setResults(null)

    try {
      const text = await file.text()
      const leads = parseCSV(text)

      if (leads.length === 0) {
        toast.error("No valid data found in CSV file")
        setUploading(false)
        return
      }

      const token = localStorage.getItem("crm_token")

      if (!token) {
        toast.error("Authentication token not found. Please login again.")
        setUploading(false)
        return
      }

      console.log("[v0] Uploading", leads.length, "leads")

      const response = await axios.post(
        "http://localhost:3000/leads/bulk-upload",
        { leads },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("[v0] Upload successful:", response.data)

      setResults(response.data.results)
      toast.success(response.data.message)

      if (response.data.results.failed.length === 0) {
        setTimeout(() => {
          onUploadComplete()
          onOpenChange(false)
        }, 2000)
      }
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      toast.error(error.response?.data?.error || "Failed to upload leads")
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadLeadTemplate()
    toast.success("Template downloaded with 2 sample leads")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Leads (4000+ Supported)</DialogTitle>
          <DialogDescription>Upload multiple leads at once using a CSV file with proper validation</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <FiInfo className="size-4" />
            <AlertDescription className="text-sm">
              <strong>Required Field Values (Must Match Exactly):</strong>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Source:</strong> Survey, Facebook, Website, Other
                </div>
                <div>
                  <strong>Stage:</strong> Lead, Contacted, Qualified, Proposal Made, Won, Lost, Fridge
                </div>
                <div>
                  <strong>Download Status:</strong> completed, not_complete, process
                </div>
                <div>
                  <strong>Payment Status:</strong> paid, pending, failed, other
                </div>
                <div>
                  <strong>Billing Sent Status:</strong> sent, not_sent, process
                </div>
                <div>
                  <strong>Date Format:</strong> YYYY-MM-DD (e.g., 2025-01-15)
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <FiAlertCircle className="size-4" />
            <AlertDescription className="text-sm">
              <strong>IMPORTANT: User Names Must Match Exactly</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                <li>
                  <strong>Employee Name, Assign Team Member, Processed By:</strong> Must match existing user full names
                  from Users & Roles page
                </li>
                <li>If user name doesn't exist, the lead will be rejected with an error message</li>
                <li>Check your Users & Roles page to get exact user names before uploading</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <FiInfo className="size-4" />
            <AlertDescription className="text-sm">
              <strong>How to Handle Documents for 4000+ Leads:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                <li>
                  <strong>Option 1 (Recommended for bulk):</strong> Leave document URL columns empty, upload leads
                  first, then add documents later by editing individual leads
                </li>
                <li>
                  <strong>Option 2:</strong> If you have pre-uploaded documents to Cloudinary, paste the full URLs in
                  the respective columns
                </li>
                <li>
                  <strong>Option 3:</strong> Use existing Cloudinary URLs from your previous exports (copy-paste from
                  exported CSV)
                </li>
                <li>
                  Document columns: Aadhaar PDF URL, PAN PDF URL, Optional PDF URL, Client Image URL, Bill Document URL
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <FiInfo className="size-4" />
            <AlertDescription className="text-sm">
              <strong>Optional Fields (Can be left empty):</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                <li>Other Source (required only if Source = "Other")</li>
                <li>Expected Close Date, Last Contacted, Comment, Remarks</li>
                <li>Company Name, Reference By, Payment Status Note</li>
                <li>Invoice Number, Invoice Date, Billing Date</li>
                <li>All Document URL columns</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Step 1: Download Template</Label>
            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full bg-transparent">
              <FiDownload className="mr-2 size-4" />
              Download CSV Template with 2 Sample Leads
            </Button>
            <p className="text-xs text-muted-foreground">
              Template includes all required fields with realistic sample data and Cloudinary URLs
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Step 2: Upload Filled CSV</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
            {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
          </div>

          {results && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FiAlertCircle className="size-4" />
                Upload Results
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-green-600">✓ Successfully uploaded: {results.success.length} leads</p>
                {results.failed.length > 0 && (
                  <>
                    <p className="text-red-600">✗ Failed: {results.failed.length} leads</p>
                    <div className="mt-2 max-h-60 overflow-y-auto rounded border bg-muted/50 p-3">
                      {results.failed.map((fail: any, idx: number) => (
                        <div key={idx} className="mb-3 border-b pb-2 text-xs last:border-0">
                          <p className="font-semibold text-red-600">
                            Row {fail.row}: {fail.clientName || "Unknown Client"}
                          </p>
                          <p className="mt-1 text-red-500">{fail.error}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <FiUpload className="mr-2 size-4" />
            {uploading ? "Uploading..." : "Upload Leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
