/**
 * CSV Export Utility
 * Converts data to CSV format and triggers download
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn("No data to export")
    return
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(new Set(data.flatMap((item) => Object.keys(item))))

  // Create CSV header
  const header = allKeys.join(",")

  // Create CSV rows
  const rows = data.map((item) => {
    return allKeys
      .map((key) => {
        const value = item[key]

        // Handle null/undefined
        if (value === null || value === undefined) {
          return ""
        }

        // Convert to string and escape quotes
        const stringValue = String(value).replace(/"/g, '""')

        // Wrap in quotes if contains comma, newline, or quote
        if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
          return `"${stringValue}"`
        }

        return stringValue
      })
      .join(",")
  })

  // Combine header and rows
  const csv = [header, ...rows].join("\n")

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format lead data for CSV export - EXACT match with wizard fields and bulk upload template
 */
export function formatLeadsForExport(leads: any[]) {
  return leads.map((lead) => ({
    // Step 1 - Employee Details (EXACT wizard field order)
    "Employee Name": lead.employeeName || "",
    Source: lead.source || "",
    "Other Source": lead.otherSource || "",
    "Lead Created Date": lead.leadCreatedAt || "",
    "Expected Close Date": lead.expectedCloseDate || "",
    "Last Contacted": lead.lastContactedAt || "",
    Stage: lead.stage || "",
    Comment: lead.comment || "",
    Remarks: lead.remarks || "",
    // Step 2 - Order/Client Details (EXACT wizard field order)
    "Client Name": lead.clientName || "",
    "Client Company Name": lead.clientCompanyName || "",
    "Product Name": lead.productName || "",
    "Assign Team Member": lead.assignTeamMember || "",
    Email: lead.email || "",
    Phone: lead.phone || "",
    "Order ID": lead.orderId || "",
    "Order Date": lead.orderDate || "",
    "Client Address": lead.clientAddress || "",
    "Client KYC ID": lead.clientKycId || "",
    "KYC PIN": lead.kycPin || "",
    "Download Status": lead.downloadStatus || "",
    "Processed By": lead.processedBy || "",
    "Processed At": lead.processedAt || "",
    // Document URLs from Cloudinary
    "Aadhaar PDF URL": lead.aadhaarPdfUrl || "",
    "PAN PDF URL": lead.panPdfUrl || "",
    "Optional PDF URL": lead.optionalPdfUrl || "",
    "Client Image URL": lead.clientImageUrl || "",
    // Step 3 - Billing Details (EXACT wizard field order)
    "Quoted Price": lead.quotedPrice || "",
    "Company Name": lead.companyName || "",
    "Company Name & Address": lead.companyNameAddress || "",
    "Reference By": lead.referenceBy || "",
    "Payment Status": lead.paymentStatus || "",
    "Payment Status Note": lead.paymentStatusNote || "",
    "Invoice Number": lead.invoiceNumber || "",
    "Invoice Date": lead.invoiceDate || "",
    "Billing Sent Status": lead.billingSentStatus || "",
    "Billing Date": lead.billingDate || "",
    "Bill Document URL": lead.billDocUrl || "",
  }))
}

/**
 * Format assigned leads data for CSV export - matches assignment page columns
 */
export function formatAssignedLeadsForExport(leads: any[]) {
  return leads.map((lead) => ({
    "Client Image URL": lead.clientImageUrl || "",
    "Client Name": lead.clientName || "",
    "Company Name": lead.clientCompanyName || "",
    "Product Name": lead.productName || "",
    Status: lead.assignmentStatus || "new",
    "Assigned To": lead.assignTeamMember || "",
    Email: lead.email || "",
    Phone: lead.phone || "",
    Stage: lead.stage || "",
    "Quoted Price": lead.quotedPrice || "",
    "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "",
  }))
}

/**
 * Generate and download a CSV template for bulk lead upload
 * IMPORTANT: This template MUST match the bulk upload parser exactly
 */
export function downloadLeadTemplate() {
  // EXACT header order matching wizard fields
  const headers = [
    "Employee Name",
    "Source",
    "Other Source",
    "Lead Created Date",
    "Expected Close Date",
    "Last Contacted",
    "Stage",
    "Comment",
    "Remarks",
    "Client Name",
    "Client Company Name",
    "Product Name",
    "Assign Team Member",
    "Email",
    "Phone",
    "Order ID",
    "Order Date",
    "Client Address",
    "Client KYC ID",
    "KYC PIN",
    "Download Status",
    "Processed By",
    "Processed At",
    "Aadhaar PDF URL",
    "PAN PDF URL",
    "Optional PDF URL",
    "Client Image URL",
    "Quoted Price",
    "Company Name",
    "Company Name & Address",
    "Reference By",
    "Payment Status",
    "Payment Status Note",
    "Invoice Number",
    "Invoice Date",
    "Billing Sent Status",
    "Billing Date",
    "Bill Document URL",
  ]

  // Sample data with realistic values for DSC/Tally/Google RCS/WABA
  const sampleData = [
    [
      "Sanjay Srivashtav", // Employee Name - MUST match existing user
      "Website",
      "",
      "2025-01-15",
      "2025-02-15",
      "2025-01-14",
      "Contacted",
      "Client interested in DSC for company registration",
      "Follow up next week",
      "Rajesh Kumar",
      "Tech Solutions Pvt Ltd",
      "DSC",
      "Yash", // Assign Team Member - MUST match existing user
      "rajesh.kumar@techsolutions.com",
      "9876543210",
      "ORD001",
      "2025-01-15",
      "123 MG Road, Bangalore, Karnataka",
      "AADH123456789012",
      "560001",
      "completed",
      "Sanjay Srivashtav", // Processed By - MUST match existing user
      "2025-01-15",
      "https://res.cloudinary.com/de0glq6bf/raw/upload/v1760348490/crm/clients/docs/aadhaarPdf-1760348488414-79435354.pdf",
      "https://res.cloudinary.com/de0glq6bf/raw/upload/v1760348491/crm/clients/docs/panPdf-1760348489370-268216594.pdf",
      "https://res.cloudinary.com/de0glq6bf/raw/upload/v1760348265/crm/clients/docs/optionalPdf-1760348261319-191800836.pdf",
      "https://res.cloudinary.com/de0glq6bf/image/upload/v1760348490/crm/clients/images/clientImage-1760348489706-632437818.png",
      "2500",
      "Tech Solutions Pvt Ltd",
      "Tech Solutions Pvt Ltd\n123 MG Road\nBangalore, Karnataka - 560001, India",
      "Partner Referral",
      "paid",
      "",
      "INV2025001",
      "2025-01-15",
      "sent",
      "2025-01-15",
      "https://res.cloudinary.com/de0glq6bf/raw/upload/v1760348493/crm/clients/docs/billDoc-1760348489714-447828840.pdf",
    ],
    [
      "Yash",
      "Referral",
      "Partner Network",
      "2025-01-16",
      "2025-02-20",
      "2025-01-15",
      "Qualified",
      "Needs Tally Prime license for accounting",
      "Hot lead - high priority",
      "Priya Sharma",
      "Sharma Enterprises",
      "Tally",
      "Sanjay Srivashtav",
      "priya.sharma@sharmaent.com",
      "9123456789",
      "ORD002",
      "2025-01-16",
      "456 Park Street, Kolkata, West Bengal",
      "AADH789012345678",
      "700016",
      "process",
      "Yash",
      "2025-01-16",
      "",
      "",
      "",
      "",
      "15000",
      "Sharma Enterprises",
      "Sharma Enterprises\n456 Park Street\nKolkata, West Bengal - 700016, India",
      "Event",
      "pending",
      "",
      "INV2025002",
      "2025-01-16",
      "not_sent",
      "",
      "",
    ],
  ]

  const escapeCSVValue = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvRows = [
    headers.map(escapeCSVValue).join(","),
    ...sampleData.map((row) => row.map((cell) => escapeCSVValue(String(cell))).join(",")),
  ]

  const csv = csvRows.join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", "lead_bulk_upload_template.csv")
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
