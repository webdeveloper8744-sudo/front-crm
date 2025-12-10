// Pure JavaScript Excel export without CDN dependencies
export async function exportToExcel(data: any[], filename: string) {
  try {
    if (!data || data.length === 0) {
      console.warn("No data to export")
      return
    }

    const workbookData = convertToWorkbookFormat(data)
    downloadAsXLS(workbookData, filename)
  } catch (error) {
    console.error("Excel export error:", error)
    throw new Error("Failed to export to Excel")
  }
}

function convertToWorkbookFormat(data: any[]) {
  // Get all unique keys from all objects
  const headers = Array.from(
    new Set(
      data.reduce((acc: string[], obj) => {
        return acc.concat(Object.keys(obj))
      }, []),
    ),
  )

  // Convert data to array format for XLS
  const rows = [headers]

  for (const item of data) {
    const row = headers.map((header) => {
      const value = item[header] ?? ""
      // Handle different data types
      if (typeof value === "object") {
        return JSON.stringify(value)
      }
      return String(value)
    })
    rows.push(row)
  }

  return rows
}

function downloadAsXLS(rows: any[][], filename: string) {
  // Create CSV content (XLS can be opened with tab-delimited format)
  const csvContent = rows
    .map(
      (row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join("\t"), // Use tab delimiter for XLS
    )
    .join("\n")

  // Add UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF"
  const blob = new Blob([bom + csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" })

  // Create download link
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.xls`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function formatLeadsForExcelExport(leads: any[]) {
  return leads.map((lead) => ({
    "Employee Name": lead.employeeName || "",
    Source: lead.source || "",
    "Other Source": lead.otherSource || "",
    "Lead Created Date": lead.leadCreatedAt || "",
    "Expected Close Date": lead.expectedCloseDate || "",
    "Last Contacted": lead.lastContactedAt || "",
    Stage: lead.stage || "",
    Comment: lead.comment || "",
    Remarks: lead.remarks || "",
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
    "Aadhaar PDF URL": lead.aadhaarPdfUrl || "",
    "PAN PDF URL": lead.panPdfUrl || "",
    "Optional PDF URL": lead.optionalPdfUrl || "",
    "Client Image URL": lead.clientImageUrl || "",
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
    "Discount Amount": lead.discountAmount || "",
    "Discount Type": lead.discountType || "",
    "Discounted Price": lead.discountedPrice || "",
    "Company CIN": lead.cinNumber || "",
    "Company GST": lead.gstNumber || "",
    "Company Email": lead.registeredEmailId || "",
    "Company Phone": lead.companyPhoneNumber || "",
    "Company Address": lead.registeredAddress || "",
    "Company Alternate Address": lead.alternateAddress || "",
    "Post/Designation": lead.post || "",
  }))
}
