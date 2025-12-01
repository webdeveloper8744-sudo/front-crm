"use client"

import type React from "react"
import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FiUser,
  FiClipboard,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiDownload,
  FiImage,
  FiFileText,
  FiX,
  FiEye,
} from "react-icons/fi"
import { getFileUrl } from "@/config/api"

export function LeadViewDialog({
  lead,
  open,
  onOpenChange,
  onViewReferredClient,
}: {
  lead: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewReferredClient?: (clientId: string) => void
}) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedReferredClientId, setSelectedReferredClientId] = useState<string | null>(null)
  const [selectedReferredClientName, setSelectedReferredClientName] = useState<string | null>(null)

  if (!lead) return null

  const employee = lead.employee || {
    employeeName: lead.employeeName,
    source: lead.source,
    otherSource: lead.otherSource,
    leadCreatedAt: lead.leadCreatedAt,
    lastContactedAt: lead.lastContactedAt,
    comment: lead.comment,
    remarks: lead.remarks,
    stage: lead.stage,
    expectedCloseDate: lead.expectedCloseDate,
  }

  const client = lead.client || {
    clientName: lead.clientName,
    clientCompanyName: lead.clientCompanyName,
    clientImageUrl: lead.clientImageUrl,
  }

  const product = lead.product || {
    productName: lead.productName,
  }

  const assignment = lead.assignment || {
    assignTeamMember: lead.assignTeamMember,
  }

  const order = lead.order || {
    orderId: lead.orderId,
    orderDate: lead.orderDate,
    email: lead.email,
    phone: lead.phone,
    clientAddress: lead.clientAddress,
    clientKycId: lead.clientKycId,
    kycPin: lead.kycPin,
    downloadStatus: lead.downloadStatus,
    processedBy: lead.processedBy,
    processedAt: lead.processedAt,
    aadhaarPdfUrl: lead.aadhaarPdfUrl,
    panPdfUrl: lead.panPdfUrl,
    optionalPdfUrl: lead.optionalPdfUrl,
    mTokenOption: lead.mTokenOption,
    mTokenSerialNumber: lead.mTokenSerialNumber,
  }

  const billing = lead.billing || {
    quotedPrice: lead.quotedPrice,
    paymentStatus: lead.paymentStatus,
    paymentStatusNote: lead.paymentStatusNote,
    companyName: lead.companyName,
    companyNameAddress: lead.companyNameAddress,
    referenceBy: lead.referenceBy,
    invoiceNumber: lead.invoiceNumber,
    invoiceDate: lead.invoiceDate,
    billingSentStatus: lead.billingSentStatus,
    billingDate: lead.billingDate,
    billDocUrl: lead.billDocUrl,
  }

  const srcText =
    employee.source === "Other" ? employee.otherSource?.toString().trim() || "Other" : employee.source || "—"

  const downloadStatus = order.downloadStatus as string | undefined
  const paymentStatus = billing.paymentStatus as string | undefined

  const fmtDate = (d?: string) => {
    if (!d) return "N/A"
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return d
    }
  }

  const fmtDateTime = (d?: string) => {
    if (!d) return "N/A"
    try {
      return new Date(d).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return d
    }
  }

  const companyDisplay = billing.companyName
    ? `${billing.companyName} | ${billing.companyNameAddress || ""}`
    : billing.companyNameAddress || "—"

  const handleDownloadPdf = async (url: string, filename: string) => {
    if (!url) return

    try {
      const fullUrl = getFileUrl(url)

      if (fullUrl.startsWith("https://res.cloudinary.com")) {
        const link = document.createElement("a")
        link.href = fullUrl
        link.download = filename
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      const response = await fetch(fullUrl)

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleViewDocument = (url?: string) => {
    if (!url) return
    const fullUrl = getFileUrl(url)
    window.open(fullUrl, "_blank")
  }

  const handleViewReferredClientClick = (clientId: string, clientName: string) => {
    setSelectedReferredClientId(clientId)
    setSelectedReferredClientName(clientName)
    setConfirmDialogOpen(true)
  }

  const handleConfirmViewReferredClient = () => {
    if (selectedReferredClientId && onViewReferredClient) {
      onViewReferredClient(selectedReferredClientId)
      setConfirmDialogOpen(false)
      setSelectedReferredClientId(null)
      setSelectedReferredClientName(null)
      onOpenChange(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full h-full max-h-[95vh] max-w-[90vw] md:max-w-[80vw] lg:max-w-6xl bg-background rounded-lg shadow-lg flex flex-col overflow-hidden overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-3 sm:p-4 md:p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance flex-1 min-w-0">Lead Details</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                <FiX className="size-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="sticky top-0 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 p-1 mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 md:mt-6 bg-muted/50 rounded-lg">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-1.5">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="client" className="text-xs sm:text-sm px-2 py-1.5">
                    Client
                  </TabsTrigger>
                  <TabsTrigger value="order" className="text-xs sm:text-sm px-2 py-1.5">
                    Order
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="text-xs sm:text-sm px-2 py-1.5">
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 py-1.5">
                    Docs
                  </TabsTrigger>
                  <TabsTrigger value="referral" className="text-xs sm:text-sm px-2 py-1.5">
                    Referral
                  </TabsTrigger>
                </TabsList>

                <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiUser className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Employee & Stage Information</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                        <DetailItem label="Employee Name" value={employee.employeeName || "—"} />
                        <DetailItem label="Lead Source" value={srcText} />
                        <DetailItem label="Stage" value={employee.stage || "—"} />
                        <DetailItem label="Lead Created" value={fmtDate(employee.leadCreatedAt)} />
                        <DetailItem label="Last Contacted" value={fmtDateTime(employee.lastContactedAt)} />
                        <DetailItem label="Expected Close" value={fmtDate(employee.expectedCloseDate)} />
                        <DetailItem label="Product" value={product.productName || "—"} />
                        <DetailItem label="Team Member" value={assignment.assignTeamMember || "—"} />
                        {employee.comment && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <DetailItem label="Comment" value={employee.comment} />
                          </div>
                        )}
                        {employee.remarks && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <DetailItem label="Remarks" value={employee.remarks} />
                          </div>
                        )}
                      </div>
                    </section>
                  </TabsContent>

                  {/* Client Tab */}
                  <TabsContent value="client" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiUser className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Client Information</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                            <DetailItem
                              label="Client Name"
                              value={client.clientName || "—"}
                              className="font-semibold text-base"
                            />
                            <DetailItem
                              label="Company"
                              value={client.clientCompanyName || "—"}
                              className="font-semibold text-base"
                            />
                            <div className="flex items-start gap-2 sm:col-span-2">
                              <FiMail className="size-4 mt-1 text-muted-foreground shrink-0" />
                              <DetailItem label="Email" value={order.email || "—"} />
                            </div>
                            <div className="flex items-start gap-2 sm:col-span-2">
                              <FiPhone className="size-4 mt-1 text-muted-foreground shrink-0" />
                              <DetailItem label="Phone" value={order.phone || "—"} />
                            </div>
                            <div className="flex items-start gap-2 sm:col-span-2">
                              <FiMapPin className="size-4 mt-1 text-muted-foreground shrink-0" />
                              <DetailItem label="Address" value={order.clientAddress || "—"} />
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-1">
                          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50 h-fit">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                              Client Image
                            </p>
                            {client.clientImageUrl ? (
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-border">
                                <img
                                  src={getFileUrl(client.clientImageUrl) || "/placeholder.svg"}
                                  alt="Client"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' textAnchor='middle' dy='.3em' fill='%239ca3af'%3EImage Error%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                                <FiImage className="size-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </TabsContent>

                  {/* Order Tab */}
                  <TabsContent value="order" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiClipboard className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Order Information</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                        {product.productName?.toUpperCase().includes("DSC") && (
                          <>
                            <DetailItem
                              label="MToken Usage"
                              value={order.mTokenOption === "with" ? "With MToken" : "Without MToken"}
                            />
                            {order.mTokenOption === "with" && (
                              <DetailItem label="MToken Serial Number" value={order.mTokenSerialNumber || "—"} />
                            )}
                          </>
                        )}

                        <DetailItem label="Order ID" value={order.orderId || "—"} className="font-semibold" />
                        <DetailItem label="Order Date" value={fmtDate(order.orderDate)} />
                        <DetailItem label="Client KYC ID" value={order.clientKycId || "—"} />
                        <DetailItem label="KYC PIN" value={order.kycPin ? "••••••••" : "—"} />
                        <DetailItem
                          label="Download Status"
                          value={
                            <Badge
                              variant={
                                downloadStatus === "completed"
                                  ? "default"
                                  : downloadStatus === "process"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {(downloadStatus || "—").replaceAll("_", " ")}
                            </Badge>
                          }
                        />
                        <DetailItem label="Processed By" value={order.processedBy || "—"} />
                        <DetailItem label="Processing Date" value={fmtDate(order.processedAt)} />
                      </div>
                    </section>
                  </TabsContent>

                  {/* Billing Tab */}
                  <TabsContent value="billing" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiDollarSign className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Billing Information</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                        <DetailItem
                          label="Quoted Price"
                          value={`₹${Number(billing.quotedPrice ?? 0).toFixed(2)}`}
                          className="text-lg font-semibold text-primary"
                        />
                        <DetailItem
                          label="Payment Status"
                          value={
                            <Badge
                              variant={
                                paymentStatus === "paid"
                                  ? "default"
                                  : paymentStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {paymentStatus || "—"}
                            </Badge>
                          }
                        />
                        {billing.paymentStatusNote && (
                          <DetailItem label="Payment Note" value={billing.paymentStatusNote} />
                        )}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <DetailItem label="Company Name & Address" value={companyDisplay} className="break-words" />
                        </div>
                        {billing.referenceBy && <DetailItem label="Reference By" value={billing.referenceBy} />}
                        {billing.invoiceNumber && (
                          <DetailItem label="Invoice Number" value={billing.invoiceNumber} className="font-semibold" />
                        )}
                        {billing.invoiceDate && (
                          <DetailItem label="Invoice Date" value={fmtDate(billing.invoiceDate)} />
                        )}
                        <DetailItem
                          label="Billing Sent Status"
                          value={
                            <Badge
                              variant={
                                billing.billingSentStatus === "sent"
                                  ? "default"
                                  : billing.billingSentStatus === "process"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {(billing.billingSentStatus || "—").replaceAll("_", " ")}
                            </Badge>
                          }
                        />
                        {billing.billingDate && (
                          <DetailItem label="Billing Date" value={fmtDate(billing.billingDate)} />
                        )}
                      </div>
                    </section>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiFileText className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Documents & Files</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <DocumentPreviewCard
                          title="Aadhaar PDF"
                          url={order.aadhaarPdfUrl}
                          type="pdf"
                          getFileUrl={getFileUrl}
                          onView={() => handleViewDocument(order.aadhaarPdfUrl)}
                          onDownload={() => handleDownloadPdf(order.aadhaarPdfUrl, "aadhaar.pdf")}
                        />

                        <DocumentPreviewCard
                          title="PAN PDF"
                          url={order.panPdfUrl}
                          type="pdf"
                          getFileUrl={getFileUrl}
                          onView={() => handleViewDocument(order.panPdfUrl)}
                          onDownload={() => handleDownloadPdf(order.panPdfUrl, "pan.pdf")}
                        />

                        <DocumentPreviewCard
                          title="Optional PDF"
                          url={order.optionalPdfUrl}
                          type="pdf"
                          getFileUrl={getFileUrl}
                          onView={() => handleViewDocument(order.optionalPdfUrl)}
                          onDownload={() => handleDownloadPdf(order.optionalPdfUrl, "optional.pdf")}
                        />

                        <DocumentPreviewCard
                          title="Bill Document"
                          url={billing.billDocUrl}
                          type="pdf"
                          getFileUrl={getFileUrl}
                          onView={() => handleViewDocument(billing.billDocUrl)}
                          onDownload={() => handleDownloadPdf(billing.billDocUrl, "bill.pdf")}
                        />
                      </div>
                    </section>
                  </TabsContent>

                  {/* Referral Tab */}
                  <TabsContent value="referral" className="space-y-4 mt-0">
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <FiUser className="size-5 text-primary shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold">Referral Information</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50 mb-6">
                        <DetailItem
                          label="Referred By"
                          value={lead.referredBy || "Fresh Client (No Referral)"}
                          className="font-semibold"
                        />
                        {lead.discountAmount > 0 && (
                          <>
                            <DetailItem
                              label="Discount"
                              value={`${lead.discountAmount}${lead.discountType === "percentage" ? "%" : "₹"}`}
                              className="text-primary font-semibold"
                            />
                            <DetailItem label="Original Price" value={`₹${Number(lead.quotedPrice ?? 0).toFixed(2)}`} />
                            <DetailItem
                              label="Final Price"
                              value={`₹${Number(lead.discountedPrice ?? 0).toFixed(2)}`}
                              className="text-lg font-semibold text-primary"
                            />
                          </>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Clients Referred by {lead.clientName}</h4>
                        <div className="p-3 sm:p-4 rounded-lg border bg-card">
                          {lead.referredClients && lead.referredClients.length > 0 ? (
                            <div className="space-y-2">
                              {lead.referredClients.map((referredLead: any) => (
                                <div
                                  key={referredLead.id}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{referredLead.clientName}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {referredLead.clientCompanyName}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleViewReferredClientClick(referredLead.id, referredLead.clientName)
                                    }
                                    className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition whitespace-nowrap"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No clients referred by this client yet</p>
                          )}
                        </div>
                      </div>
                    </section>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Metadata Footer */}
              <div className="px-3 sm:px-4 md:px-6 py-4 border-t mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="size-3 shrink-0" />
                    <span className="truncate">Created: {fmtDateTime(lead.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="size-3 shrink-0" />
                    <span className="truncate">Updated: {fmtDateTime(lead.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open Client Details?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to open the details of{" "}
              <span className="font-semibold">{selectedReferredClientName}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmViewReferredClient}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm break-words ${className || ""}`}>{value}</p>
    </div>
  )
}

function DocumentPreviewCard({
  title,
  url,
  onView,
  onDownload,
}: {
  title: string
  url?: string
  type: "pdf" | "image"
  getFileUrl: (url?: string) => string
  onView: () => void
  onDownload: () => void
}) {
  return (
    <div className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FiFileText className="size-5 text-primary shrink-0" />
          <p className="font-medium text-sm truncate">{title}</p>
        </div>
      </div>

      {url ? (
        <div className="space-y-3">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors">
            <div className="text-center">
              <FiFileText className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Click "View" to preview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <FiEye className="size-3" />
              View
            </button>
            <button
              onClick={onDownload}
              className="flex-1 px-3 py-2 text-xs font-medium border border-primary text-primary rounded-md hover:bg-primary/10 transition flex items-center justify-center gap-2"
            >
              <FiDownload className="size-3" />
              Download
            </button>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-dashed border-border">
          <p className="text-xs text-muted-foreground font-medium">No document uploaded</p>
        </div>
      )}
    </div>
  )
}
