"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { FiUser, FiClipboard, FiDollarSign } from "react-icons/fi"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchUsers } from "@/store/slices/userSlice"
import { fetchProducts } from "@/store/slices/productSlice"
import { createLead, updateLead, fetchLeads } from "@/store/slices/leadSlice"
import { fetchStores } from "@/store/slices/storeSlice"
import { fetchMTokenSerialNumbers } from "@/store/slices/purchaseOrderSlice"
import { useSelector } from "react-redux" // Import useSelector

type Stage = "Lead" | "Contacted" | "Qualified" | "Proposal Made" | "Won" | "Lost" | "Fridge"

const ALLOWED_PDF_TYPES = ["application/pdf"]
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type Step1Values = {
  employeeName: string
  source: "Survey" | "Facebook" | "Website" | "Other"
  otherSource?: string
  leadCreatedAt: string
  expectedCloseDate?: string
  lastContactedAt?: string
  stage?: Stage
  comment?: string
  remarks?: string
}

type Step2Values = {
  aadhaarPdf?: File
  panPdf?: File
  optionalPdf?: File
  clientImage?: File
  aadhaarPdfUrl?: string
  panPdfUrl?: string
  optionalPdfUrl?: string
  clientImageUrl?: string
  clientName: string
  clientCompanyName: string
  clientCompanyId?: string // Add company ID for managed companies
  clientCompanyOther?: string // Add custom company name for "Other" option
  productChoice: string
  productCustomName?: string
  assignTeamMember: string
  email: string
  phone: string
  orderId: string
  mTokenOrderId?: string // Separate MToken Order ID field
  orderDate: string
  clientAddress: string
  clientKycId: string
  kycPin: string
  downloadStatus: string
  processedBy: string
  processedAt: string
  referredBy?: string
  referredByClientId?: string
  referredByType?: "fresh" | "existing" | "other"
  mTokenOption?: "with" | "without"
  mTokenSerialNumber?: string
  mTokenStoreFilter?: string
  mTokenAvailableList?: any[]
}

type Step3Values = {
  quotedPrice: number
  companyName?: string // Make optional, use managed company dropdown
  companyId?: string // Add managed company ID reference
  companyOther?: string // Custom company for "Other"
  companyNameAddress: string
  paymentStatus: string
  paymentStatusChoice: "paid" | "pending" | "failed" | "other"
  paymentStatusOther?: string
  invoiceNumber?: string
  invoiceDate?: string
  billingSentStatus: string
  billingDate?: string
  billDoc?: File
  billDocUrl?: string
  discountAmount: number
  discountType: "amount" | "percentage"
  discountedPrice: number
}

type Step1Errors = Partial<Record<keyof Step1Values, string>>
type Step2Errors = Partial<Record<keyof Step2Values, string>>
type Step3Errors = Partial<Record<keyof Step3Values, string>>

export function LeadWizard({
  open,
  onOpenChange,
  initialLead,
  onSaved,
  title = "New Lead",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLead?: any
  onSaved: () => void
  title?: string
}) {
  const [step, setStep] = React.useState(1)

  const dispatch = useAppDispatch()
  const { users } = useAppSelector((s) => s.user || { users: [] })
  const { products } = useAppSelector((s) => s.product || { products: [] })
  const { items: allLeads } = useAppSelector((s) => s.lead || { items: [] })
  const { stores } = useAppSelector((s) => s.store || { stores: [] })
  const { serialNumbers } = useAppSelector((s) => s.purchaseOrder || { serialNumbers: [] })

  const companies = useSelector((state: any) => state.company?.companies || [])

  const appliedProductDefaultRef = React.useRef(false)
  const initialLeadProductNameRef = React.useRef<string | undefined>(
    (initialLead as any)?.order?.productName || undefined,
  )

  const productOptions: string[] = React.useMemo(() => {
    return Array.from(new Set((products || []).map((p: any) => p.name).filter(Boolean)))
  }, [products])

  React.useEffect(() => {
    if (open) {
      appliedProductDefaultRef.current = false
      setStep(1)
      setS1(initialS1)
      setS2(initialS2)
      setS3(initialS3)
      setE1({})
      setE2({})
      setE3({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialLead])

  React.useEffect(() => {
    if (!open) return
    if (appliedProductDefaultRef.current) return

    const list = productOptions
    const existing = initialLeadProductNameRef.current

    if (existing && existing.trim().length) {
      if (list.includes(existing)) {
        setS2((p) => ({ ...p, productChoice: existing, productCustomName: "" }))
      } else {
        setS2((p) => ({ ...p, productChoice: "Other", productCustomName: existing }))
      }
      appliedProductDefaultRef.current = true
      return
    }

    if (list.length > 0) {
      setS2((p) => ({ ...p, productChoice: list[0], productCustomName: "" }))
    } else {
      setS2((p) => ({ ...p, productChoice: "Other" }))
    }
    appliedProductDefaultRef.current = true
  }, [open, productOptions, initialLead])

  // Replace your existing initialS1, initialS2, initialS3 definitions with these:

  // Line 141 area - SAFE Initial Values
  const initialS1: Step1Values = React.useMemo(() => {
    if (!initialLead) {
      return {
        employeeName: "",
        source: "Survey",
        leadCreatedAt: new Date().toISOString().slice(0, 10),
        stage: "Lead",
      }
    }

    // Safely extract employee data - handles both nested and flat structures
    const employee = initialLead.employee || initialLead

    return {
      employeeName: employee.employeeName || "",
      source: (employee.source || "Survey") as Step1Values["source"],
      otherSource: employee.otherSource,
      leadCreatedAt: employee.leadCreatedAt || new Date().toISOString().slice(0, 10),
      expectedCloseDate: employee.expectedCloseDate,
      lastContactedAt: employee.lastContactedAt,
      stage: (employee.stage || "Lead") as Stage,
      comment: employee.comment,
      remarks: employee.remarks,
    }
  }, [initialLead])

  const initialS2: Step2Values = React.useMemo(() => {
    if (!initialLead) {
      return {
        clientName: "",
        clientCompanyName: "",
        clientCompanyId: "",
        clientCompanyOther: "",
        productChoice: productOptions[0] || "Other",
        productCustomName: "",
        assignTeamMember: "",
        email: "",
        phone: "",
        orderId: "",
        mTokenOrderId: "", // Initialize MToken Order ID
        orderDate: new Date().toISOString().slice(0, 10),
        clientAddress: "",
        clientKycId: "",
        kycPin: "",
        downloadStatus: "process",
        processedBy: "",
        processedAt: "",
        referredBy: "",
        referredByClientId: "",
        referredByType: "fresh", // default to fresh client
        mTokenOption: "without",
        mTokenSerialNumber: "",
        mTokenStoreFilter: "",
        mTokenAvailableList: [],
      }
    }

    const order = initialLead.order || initialLead

    let productChoice = "Other"
    let productCustomName = ""

    if (order.productName) {
      if (productOptions.includes(order.productName)) {
        productChoice = order.productName
      } else {
        productChoice = "Other"
        productCustomName = order.productName
      }
    }

    let referredByType: "fresh" | "existing" | "other" = "fresh"
    if (initialLead.referredByClientId) {
      referredByType = "existing"
    } else if (initialLead.referredBy) {
      referredByType = "other"
    }

    let clientCompanyId = ""
    let clientCompanyOther = ""
    const managedCompany = companies.find((c: any) => c.id === initialLead.clientCompanyId)
    if (managedCompany) {
      clientCompanyId = managedCompany.id
    } else {
      clientCompanyOther = initialLead.clientCompanyName || ""
    }

    return {
      clientName: order.clientName || "",
      clientCompanyName: order.clientCompanyName || "",
      clientCompanyId, // Set managed company ID
      clientCompanyOther, // Set custom company
      productChoice,
      productCustomName,
      assignTeamMember: order.assignTeamMember || "",
      email: order.email || "",
      phone: order.phone || "",
      orderId: order.orderId || "",
      mTokenOrderId: initialLead.mTokenOrderId || "", // Restore MToken Order ID
      orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
      clientAddress: order.clientAddress || "",
      clientKycId: order.clientKycId || "",
      kycPin: order.kycPin || "",
      downloadStatus: order.downloadStatus || "process",
      processedBy: order.processedBy || "",
      processedAt: order.processedAt || "",
      aadhaarPdfUrl: order.aadhaarPdfUrl,
      panPdfUrl: order.panPdfUrl,
      optionalPdfUrl: order.optionalPdfUrl,
      clientImageUrl: order.clientImageUrl,
      referredBy: initialLead.referredBy || "",
      referredByClientId: initialLead.referredByClientId || "",
      referredByType,
      // Initializing MToken fields from existing lead if available
      mTokenOption: initialLead.mTokenOption || "without",
      mTokenSerialNumber: initialLead.mTokenSerialNumber || "",
      mTokenStoreFilter: initialLead.mTokenStoreFilter || "",
      mTokenAvailableList: initialLead.mTokenAvailableList || [],
    }
  }, [initialLead, productOptions, companies])

  const initialS3: Step3Values = React.useMemo(() => {
    if (!initialLead) {
      return {
        quotedPrice: 0,
        companyName: "",
        companyId: "",
        companyOther: "",
        companyNameAddress: "",
        paymentStatus: "pending",
        paymentStatusChoice: "pending",
        invoiceNumber: "",
        invoiceDate: "",
        billingSentStatus: "not_sent",
        billingDate: "",
        discountAmount: 0,
        discountType: "amount",
        discountedPrice: 0,
      }
    }

    const billing = initialLead.billing || initialLead
    const paymentStat = billing.paymentStatus || "pending"

    let companyId = ""
    let companyOther = ""
    const managedCompany = companies.find((c: any) => c.id === initialLead.clientCompanyId)
    if (managedCompany) {
      companyId = managedCompany.id
    } else {
      companyOther = billing.companyName || (billing.companyNameAddress?.split("\n")?.[0] ?? "")
    }

    return {
      quotedPrice: Number(billing.quotedPrice || 0),
      companyName: billing.companyName || (billing.companyNameAddress?.split("\n")?.[0] ?? ""),
      companyId, // Set managed company ID
      companyOther, // Set custom company
      companyNameAddress: billing.companyNameAddress || "",
      paymentStatus: paymentStat,
      paymentStatusChoice: (["paid", "pending", "failed"].includes(paymentStat) ? paymentStat : "other") as
        | "paid"
        | "pending"
        | "failed"
        | "other",
      paymentStatusOther: ["paid", "pending", "failed"].includes(paymentStat) ? undefined : paymentStat,
      invoiceNumber: billing.invoiceNumber,
      invoiceDate: billing.invoiceDate,
      billingSentStatus: billing.billingSentStatus || "not_sent",
      billingDate: billing.billingDate,
      billDocUrl: billing.billDocUrl,
      discountAmount: Number(initialLead.discountAmount || 0),
      discountType: (initialLead.discountType || "amount") as "amount" | "percentage",
      discountedPrice: Number(initialLead.discountedPrice || 0),
    }
  }, [initialLead, companies])

  const [s1, setS1] = React.useState<Step1Values>(initialS1)
  const [s2, setS2] = React.useState<Step2Values>(initialS2)
  const [s3, setS3] = React.useState<Step3Values>(initialS3)

  const [e1, setE1] = React.useState<Step1Errors>({})
  const [e2, setE2] = React.useState<Step2Errors>({})
  const [e3, setE3] = React.useState<Step3Errors>({})

  React.useEffect(() => {
    if (open) {
      dispatch(fetchUsers() as any).catch(() => {})
      dispatch(fetchProducts() as any).catch(() => {})
      dispatch(fetchLeads() as any).catch(() => {}) // fetchLeads is now correctly imported and used
      dispatch(fetchStores() as any).catch(() => {})
      dispatch(fetchMTokenSerialNumbers() as any).catch(() => {})
    }
  }, [open, dispatch])

  const validateFile = (file: File | undefined, fieldName: string, allowedTypes: string[]): string | undefined => {
    if (!file) return undefined

    if (!allowedTypes.includes(file.type)) {
      const typeStr = allowedTypes.includes("application/pdf") ? "PDF" : "JPG, PNG, WebP, or AVIF image"
      return `Invalid file type. ${fieldName} must be ${typeStr}.`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit. ${fieldName} is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
    }

    return undefined
  }

  function onNext1() {
    const errs: Step1Errors = {}
    if (!s1.employeeName?.trim()) errs.employeeName = "Please fill this field."
    if (!s1.leadCreatedAt) errs.leadCreatedAt = "Please fill this field."
    if (s1.source === "Other" && !s1.otherSource?.trim()) errs.otherSource = "Please specify the source."
    if (!s1.stage) errs.stage = "Please fill this field." // validate stage
    // expectedCloseDate optional; remarks optional

    setE1(errs)
    if (Object.keys(errs).length) {
      toast.error("Fix errors in Employee details")
      return
    }
    setStep(2)
    toast.success("Employee details validated")
  }

  function onNext2() {
    const errs: Step2Errors = {}

    const required: Array<keyof Step2Values> = [
      "clientName",
      "clientCompanyName",
      "assignTeamMember",
      "email",
      "phone",
      "orderId",
      "orderDate",
      "clientAddress",
      "clientKycId",
      "kycPin",
      "processedBy",
      "processedAt",
    ]
    required.forEach((k) => {
      const v = s2[k] as unknown as string | undefined
      if (!v || !v.toString().trim()) errs[k] = "Please fill this field."
    })

    if (!s2.productChoice || (s2.productChoice === "Other" && !s2.productCustomName?.trim())) {
      errs.productChoice = "Product is required."
      errs.productCustomName = s2.productChoice === "Other" ? "Enter product name." : undefined
    }

    if (s2.productChoice === "DSC" || s2.productCustomName?.toUpperCase().includes("DSC")) {
      if (s2.mTokenOption === "with" && !s2.mTokenSerialNumber?.trim()) {
        errs.mTokenSerialNumber = "MToken serial number is required."
      }
      if (s2.mTokenOption === "without" && !s2.orderId?.trim()) {
        errs.orderId = "Order ID is required."
      }
    }

    if (s2.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s2.email)) errs.email = "Email format is incorrect."
    if (s2.phone && s2.phone.replace(/\D/g, "").length < 8) errs.phone = "Invalid phone number."

    const aadhaarErr = validateFile(s2.aadhaarPdf, "Aadhaar PDF", ALLOWED_PDF_TYPES)
    if (aadhaarErr) errs.aadhaarPdf = aadhaarErr

    const panErr = validateFile(s2.panPdf, "PAN PDF", ALLOWED_PDF_TYPES)
    if (panErr) errs.panPdf = panErr

    const optionalErr = validateFile(s2.optionalPdf, "Optional PDF", ALLOWED_PDF_TYPES)
    if (optionalErr) errs.optionalPdf = optionalErr

    const imageErr = validateFile(s2.clientImage, "Client Image", ALLOWED_IMAGE_TYPES)
    if (imageErr) errs.clientImage = imageErr

    setE2(errs)
    if (Object.keys(errs).length) {
      toast.error("Fix errors in Order/Client details")
      return
    }

    setS3((prev) => (!prev.companyName ? { ...prev, companyName: s2.clientCompanyName } : prev))

    setStep(3)
    toast.success("Order/Client details validated")
  }

  function onFinish() {
    const errs: Step3Errors = {}
    if (s3.quotedPrice == null || isNaN(Number(s3.quotedPrice)) || Number(s3.quotedPrice) < 0) {
      errs.quotedPrice = "Quoted price must be >= 0."
    }
    if (s3.discountAmount < 0) {
      errs.discountAmount = "Discount cannot be negative."
    }

    const composedCompanyNameAddress =
      s3.companyName?.trim() || s3.companyNameAddress?.trim()
        ? [s3.companyName?.trim(), s3.companyNameAddress?.trim()].filter(Boolean).join("\n")
        : ""
    if (!composedCompanyNameAddress) {
      errs.companyNameAddress = "Please fill this field."
    }
    if (s3.paymentStatusChoice === "other" && !s3.paymentStatusOther?.trim()) {
      errs.paymentStatusOther = "Enter custom payment status."
    }

    const billDocErr = validateFile(s3.billDoc, "Billing Document", ALLOWED_PDF_TYPES)
    if (billDocErr) errs.billDoc = billDocErr

    setE3(errs)
    if (Object.keys(errs).length) {
      toast.error("Fix errors in Billing details")
      return
    }

    const productName = s2.productChoice === "Other" ? (s2.productCustomName || "").trim() : s2.productChoice

    const fd = new FormData()
    // Step 1
    fd.append("employeeName", s1.employeeName)
    fd.append("source", s1.source)
    if (s1.source === "Other" && s1.otherSource) fd.append("otherSource", s1.otherSource)
    fd.append("leadCreatedAt", s1.leadCreatedAt)
    if (s1.expectedCloseDate) fd.append("expectedCloseDate", s1.expectedCloseDate)
    if (s1.lastContactedAt) fd.append("lastContactedAt", s1.lastContactedAt)
    if (s1.stage) fd.append("stage", s1.stage)
    if (s1.comment) fd.append("comment", s1.comment)
    if (s1.remarks) fd.append("remarks", s1.remarks)

    // Step 2
    fd.append("clientName", s2.clientName)
    fd.append("clientCompanyName", s2.clientCompanyName)
    // Append company ID and custom company name
    if (s2.clientCompanyId) fd.append("clientCompanyId", s2.clientCompanyId)
    if (s2.clientCompanyOther) fd.append("clientCompanyOther", s2.clientCompanyOther)

    fd.append("productName", productName)
    fd.append("assignTeamMember", s2.assignTeamMember)
    fd.append("email", s2.email)
    fd.append("phone", s2.phone)
    fd.append("orderId", s2.orderId)
    // Append MToken Order ID if applicable
    if (s2.mTokenOrderId) fd.append("mTokenOrderId", s2.mTokenOrderId)
    fd.append("orderDate", s2.orderDate)
    fd.append("clientAddress", s2.clientAddress)
    fd.append("clientKycId", s2.clientKycId)
    fd.append("kycPin", s2.kycPin)
    fd.append("downloadStatus", s2.downloadStatus)
    fd.append("processedBy", s2.processedBy)
    fd.append("processedAt", s2.processedAt)
    if (s2.aadhaarPdf) fd.append("aadhaarPdf", s2.aadhaarPdf)
    if (s2.panPdf) fd.append("panPdf", s2.panPdf)
    if (s2.optionalPdf) fd.append("optionalPdf", s2.optionalPdf)
    if (s2.clientImage) fd.append("clientImage", s2.clientImage)
    fd.append("referredByType", s2.referredByType || "fresh")
    if (s2.referredByType === "existing" && s2.referredByClientId) {
      fd.append("referredByClientId", s2.referredByClientId || "")
      fd.append("referredByClientName", s2.referredBy || "")
    } else if (s2.referredByType === "other" && s2.referredBy) {
      fd.append("referredByOtherName", s2.referredBy)
    }

    // Append MToken fields to FormData if applicable
    if (s2.productChoice === "DSC" || s2.productCustomName?.toUpperCase().includes("DSC")) {
      fd.append("mTokenOption", s2.mTokenOption || "without")
      if (s2.mTokenOption === "with") {
        fd.append("mTokenSerialNumber", s2.mTokenSerialNumber || "")
      }
    }

    // Step 3
    fd.append("quotedPrice", String(Number(s3.quotedPrice ?? 0)))
    // Append company ID and custom company name for billing
    if (s3.companyId) fd.append("companyId", s3.companyId)
    if (s3.companyOther) fd.append("companyOther", s3.companyOther)
    fd.append("companyNameAddress", composedCompanyNameAddress)
    fd.append("paymentStatus", s3.paymentStatusChoice)
    if (s3.paymentStatusChoice === "other" && s3.paymentStatusOther) {
      fd.append("paymentStatusNote", s3.paymentStatusOther)
    }
    if (s3.invoiceNumber) fd.append("invoiceNumber", s3.invoiceNumber)
    if (s3.invoiceDate) fd.append("invoiceDate", s3.invoiceDate)
    fd.append("billingSentStatus", s3.billingSentStatus)
    if (s3.billingDate) fd.append("billingDate", s3.billingDate)
    if (s3.billDoc) fd.append("billDoc", s3.billDoc)
    fd.append("discountAmount", String(Number(s3.discountAmount ?? 0)))
    fd.append("discountType", s3.discountType)
    fd.append("discountedPrice", String(Number(s3.discountedPrice ?? 0)))

    const doSave = async () => {
      if (initialLead?.id) {
        await dispatch(updateLead({ id: initialLead.id, formData: fd }) as any)
      } else {
        await dispatch(createLead(fd) as any)
      }
    }

    doSave()
      .then(() => onSaved())
      .catch(() => {
        // errors are already handled via slice toasts
      })
  }

  return (
    <>
      {!open ? null : (
        <section className="w-full max-w-full mx-auto rounded-2xl border-2 border-border bg-card shadow-lg p-0">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 px-6 py-5 border-b-2 border-border bg-muted/30">
            <h2 className="text-lg md:text-xl font-semibold text-balance">{title}</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </header>

          {/* Body */}
          <div className="px-6 py-8">
            {/* Stepper */}
            <div className="pb-6 border-b-2 border-border mb-6">
              <Stepper step={step} />
            </div>

            {/* Step content */}
            {step === 1 && (
              <>
                <p className="mt-4 mb-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Employee Details
                </p>
                <Card className="border-2 border-border shadow-sm">
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="employeeName" className="font-semibold">
                        Employee Name *
                      </Label>
                      <Select value={s1.employeeName} onValueChange={(v) => setS1((p) => ({ ...p, employeeName: v }))}>
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.length ? (
                            users.map((u: any) => (
                              <SelectItem key={u.id} value={u.fullName}>
                                {u.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="No users">No users</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FieldError msg={e1.employeeName} />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Source *</Label>
                      <Select
                        value={s1.source}
                        onValueChange={(v) => setS1((p) => ({ ...p, source: v as Step1Values["source"] }))}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Survey">Survey</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {s1.source === "Other" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="otherSource" className="font-semibold">
                          Specify Source *
                        </Label>
                        <Input
                          id="otherSource"
                          value={s1.otherSource || ""}
                          onChange={(e) => setS1((p) => ({ ...p, otherSource: e.target.value }))}
                          className="border-2 focus:border-primary"
                        />
                        <FieldError msg={e1.otherSource} />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="leadCreatedAt" className="font-semibold">
                        Lead Creation Date *
                      </Label>
                      <Input
                        id="leadCreatedAt"
                        type="date"
                        value={s1.leadCreatedAt}
                        onChange={(e) => setS1((p) => ({ ...p, leadCreatedAt: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e1.leadCreatedAt} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedCloseDate">Expected Client Closing Date</Label>
                      <Input
                        id="expectedCloseDate"
                        type="date"
                        value={s1.expectedCloseDate || ""}
                        onChange={(e) => setS1((p) => ({ ...p, expectedCloseDate: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastContactedAt">Last Contacted</Label>
                      <Input
                        id="lastContactedAt"
                        type="date"
                        value={s1.lastContactedAt || ""}
                        onChange={(e) => setS1((p) => ({ ...p, lastContactedAt: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Stage *</Label>
                      <Select
                        value={s1.stage || "Lead"}
                        onValueChange={(v) => setS1((p) => ({ ...p, stage: v as Stage }))}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Contacted">Contacted</SelectItem>
                          <SelectItem value="Qualified">Qualified</SelectItem>
                          <SelectItem value="Proposal Made">Proposal Made</SelectItem>
                          <SelectItem value="Won">Won</SelectItem>
                          <SelectItem value="Lost">Lost</SelectItem>
                          <SelectItem value="Fridge">Fridge</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e1.stage} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Notes, context..."
                        value={s1.comment || ""}
                        onChange={(e) => setS1((p) => ({ ...p, comment: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        placeholder="Additional remarks..."
                        value={s1.remarks || ""}
                        onChange={(e) => setS1((p) => ({ ...p, remarks: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <>
                <p className="mt-4 mb-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Order & Client Details
                </p>
                <Card className="border-2 border-border shadow-sm">
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="font-semibold">
                        Client Name *
                      </Label>
                      <Input
                        id="clientName"
                        value={s2.clientName}
                        onChange={(e) => setS2((p) => ({ ...p, clientName: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.clientName} />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Client Company Name *</Label>
                      <Select
                        value={s2.clientCompanyId || "other"}
                        onValueChange={(v) => {
                          if (v === "other") {
                            setS2((p) => ({ ...p, clientCompanyId: "", clientCompanyOther: "" }))
                          } else {
                            const company = companies.find((c: any) => c.id === v)
                            setS2((p) => ({
                              ...p,
                              clientCompanyId: v,
                              clientCompanyOther: "",
                              clientCompanyName: company?.companyName || "",
                            }))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {companies.length > 0 ? (
                            companies.map((company: any) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.companyName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-companies">No companies available</SelectItem>
                          )}
                          <SelectItem value="other">+ Other Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e2.clientCompanyId} />
                    </div>

                    {!s2.clientCompanyId && (
                      <div className="space-y-2">
                        <Label htmlFor="clientCompanyOther" className="font-semibold">
                          Enter Company Name *
                        </Label>
                        <Input
                          id="clientCompanyOther"
                          value={s2.clientCompanyOther}
                          onChange={(e) => {
                            setS2((p) => ({
                              ...p,
                              clientCompanyOther: e.target.value,
                              clientCompanyName: e.target.value,
                            }))
                          }}
                          placeholder="Enter custom company name"
                          className="border-2 focus:border-primary"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="font-semibold">Referred By (Client)</Label>
                      <Select
                        value={s2.referredByType || "fresh"}
                        onValueChange={(v) => {
                          if (v === "fresh") {
                            setS2((p) => ({ ...p, referredByType: "fresh", referredByClientId: "", referredBy: "" }))
                          } else if (v === "existing") {
                            setS2((p) => ({ ...p, referredByType: "existing", referredByClientId: "", referredBy: "" }))
                          } else if (v === "other") {
                            setS2((p) => ({ ...p, referredByType: "other", referredByClientId: "", referredBy: "" }))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select referral type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresh">Fresh Client (First Time)</SelectItem>
                          <SelectItem value="existing">Referred by Existing Client</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {s2.referredByType === "existing" && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Select Referring Client *</Label>
                        <Select
                          value={s2.referredByClientId || ""}
                          onValueChange={(v) => {
                            const selectedLead = allLeads.find((l: any) => l.id === v)
                            setS2((p) => ({
                              ...p,
                              referredByClientId: v,
                              referredBy: selectedLead?.clientName || "",
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {allLeads.length > 0 ? (
                              allLeads.map((lead: any) => (
                                <SelectItem key={lead.id} value={lead.id}>
                                  {lead.clientName} ({lead.clientCompanyName})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-clients">No clients available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FieldError msg={e2.referredByClientId} />
                      </div>
                    )}

                    {s2.referredByType === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="referredByOther" className="font-semibold">
                          Referring Client Name *
                        </Label>
                        <Input
                          id="referredByOther"
                          value={s2.referredBy}
                          onChange={(e) => setS2((p) => ({ ...p, referredBy: e.target.value }))}
                          placeholder="Enter client name"
                          className="border-2 focus:border-primary"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="font-semibold">Product Name *</Label>
                      <Select
                        value={s2.productChoice}
                        onValueChange={(v) => setS2((p) => ({ ...p, productChoice: v }))}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select product or service" />
                        </SelectTrigger>
                        <SelectContent>
                          {productOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e2.productChoice} />
                    </div>

                    {s2.productChoice === "Other" && (
                      <div className="space-y-2">
                        <Label htmlFor="productCustomName" className="font-semibold">
                          Custom Product Name *
                        </Label>
                        <Input
                          id="productCustomName"
                          value={s2.productCustomName || ""}
                          onChange={(e) => setS2((p) => ({ ...p, productCustomName: e.target.value }))}
                          className="border-2 focus:border-primary"
                        />
                        <FieldError msg={e2.productCustomName} />
                      </div>
                    )}

                    {(s2.productChoice === "DSC" || s2.productCustomName?.toUpperCase().includes("DSC")) && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-semibold">MToken Usage *</Label>
                          <Select
                            value={s2.mTokenOption || "without"}
                            onValueChange={(v) =>
                              setS2((p) => ({
                                ...p,
                                mTokenOption: v as "with" | "without",
                                mTokenSerialNumber: "",
                                mTokenOrderId: "", // Clear MToken Order ID when toggling
                              }))
                            }
                          >
                            <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="with">With MToken</SelectItem>
                              <SelectItem value="without">Without MToken</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {s2.mTokenOption === "with" && (
                          <>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="mTokenSerialNumber" className="font-semibold">
                                MToken Serial Number *
                              </Label>
                              <Select
                                value={s2.mTokenSerialNumber || ""}
                                onValueChange={(v) => setS2((p) => ({ ...p, mTokenSerialNumber: v }))}
                              >
                                <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                                  <SelectValue placeholder="Select available MToken" />
                                </SelectTrigger>
                                <SelectContent className="max-h-48">
                                  {serialNumbers
                                    .filter((s: any) => !s.isUsed)
                                    .map((serial: any) => (
                                      <SelectItem key={serial.id} value={serial.serialNumber}>
                                        <div className="flex flex-col">
                                          <span className="font-mono font-bold">{serial.serialNumber}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {stores.find((s: any) => s.id === serial.storeId)?.name} |{" "}
                                            {serial.purchaseDate}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FieldError msg={e2.mTokenSerialNumber} />
                            </div>
                          </>
                        )}

                        {s2.mTokenOption === "without" && (
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="mTokenOrderId" className="font-semibold">
                              MToken Order ID *
                            </Label>
                            <Input
                              id="mTokenOrderId"
                              type="text"
                              value={s2.mTokenOrderId || ""}
                              onChange={(e) => setS2((p) => ({ ...p, mTokenOrderId: e.target.value }))}
                              placeholder="Enter unique MToken order ID"
                              className="border-2 focus:border-primary bg-primary/5 border-primary/30"
                            />
                            <p className="text-xs text-muted-foreground font-semibold">
                              This is a unique identifier for MToken tracking (separate from regular Order ID)
                            </p>
                            <FieldError msg={e2.mTokenOrderId} />
                          </div>
                        )}
                      </>
                    )}

                    {!(s2.productChoice === "DSC" || s2.productCustomName?.toUpperCase().includes("DSC")) ||
                      (s2.mTokenOption === "with" && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="orderId" className="font-semibold">
                            Order ID *
                          </Label>
                          <Input
                            id="orderId"
                            type="text"
                            value={s2.orderId}
                            onChange={(e) => setS2((p) => ({ ...p, orderId: e.target.value }))}
                            placeholder="Enter order ID"
                            className="border-2 focus:border-primary"
                          />
                          <FieldError msg={e2.orderId} />
                        </div>
                      ))}

                    <div className="space-y-2">
                      <Label htmlFor="orderDate" className="font-semibold">
                        Order Date *
                      </Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={s2.orderDate}
                        onChange={(e) => setS2((p) => ({ ...p, orderDate: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.orderDate} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="clientAddress" className="font-semibold">
                        Client Address *
                      </Label>
                      <Textarea
                        id="clientAddress"
                        value={s2.clientAddress}
                        onChange={(e) => setS2((p) => ({ ...p, clientAddress: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.clientAddress} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientKycId" className="font-semibold">
                        Client KYC ID *
                      </Label>
                      <Input
                        id="clientKycId"
                        value={s2.clientKycId}
                        onChange={(e) => setS2((p) => ({ ...p, clientKycId: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.clientKycId} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kycPin" className="font-semibold">
                        KYC PIN *
                      </Label>
                      <Input
                        id="kycPin"
                        type="password"
                        value={s2.kycPin}
                        onChange={(e) => setS2((p) => ({ ...p, kycPin: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.kycPin} />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Download Status *</Label>
                      <Select
                        value={s2.downloadStatus}
                        onValueChange={(v) => setS2((p) => ({ ...p, downloadStatus: v as string }))}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="not_complete">Not complete</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e2.downloadStatus} />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Processed By (Employee) *</Label>
                      <Select value={s2.processedBy} onValueChange={(v) => setS2((p) => ({ ...p, processedBy: v }))}>
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.length ? (
                            users.map((u: any) => (
                              <SelectItem key={u.id} value={u.fullName}>
                                {u.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="No users">No users</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FieldError msg={e2.processedBy} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processedAt" className="font-semibold">
                        Processing Date *
                      </Label>
                      <Input
                        id="processedAt"
                        type="date"
                        value={s2.processedAt}
                        onChange={(e) => setS2((p) => ({ ...p, processedAt: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e2.processedAt} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 3 && (
              <>
                <p className="mt-4 mb-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Billing Details
                </p>
                <Card className="border-2 border-border shadow-sm">
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="quotedPrice" className="font-semibold">
                        Quoted Price (₹)
                      </Label>
                      <Input
                        id="quotedPrice"
                        type="number"
                        step="0.01"
                        value={String(s3.quotedPrice ?? "")}
                        onChange={(e) => {
                          const price = Number(e.target.value)
                          const currentDiscountType = s3.discountType
                          const currentDiscountAmount = s3.discountAmount
                          const discount =
                            currentDiscountType === "percentage"
                              ? (price * currentDiscountAmount) / 100
                              : currentDiscountAmount
                          setS3((prevS3) => ({
                            ...prevS3,
                            quotedPrice: price,
                            discountedPrice: Math.max(0, price - discount),
                          }))
                        }}
                        className="border-2 focus:border-primary"
                      />
                      <FieldError msg={e3.quotedPrice} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountAmount" className="font-semibold">
                        Discount
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="discountAmount"
                          type="number"
                          step="0.01"
                          value={String(s3.discountAmount ?? "")}
                          onChange={(e) => {
                            const discount = Number(e.target.value)
                            const finalDiscount =
                              s3.discountType === "percentage" ? (s3.quotedPrice * discount) / 100 : discount
                            setS3((prevS3) => ({
                              ...prevS3,
                              discountAmount: discount,
                              discountedPrice: Math.max(0, s3.quotedPrice - finalDiscount),
                            }))
                          }}
                          placeholder="Amount"
                          className="border-2 focus:border-primary flex-1"
                        />
                        <Select
                          value={s3.discountType}
                          onValueChange={(v) => {
                            const finalDiscount =
                              v === "percentage" ? (s3.quotedPrice * s3.discountAmount) / 100 : s3.discountAmount
                            setS3((prevS3) => ({
                              ...prevS3,
                              discountType: v as "amount" | "percentage",
                              discountedPrice: Math.max(0, s3.quotedPrice - finalDiscount),
                            }))
                          }}
                        >
                          <SelectTrigger className="w-24 border-2 focus:border-primary bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">₹</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FieldError msg={e3.discountAmount} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountedPrice" className="font-semibold">
                        Final Price (₹)
                      </Label>
                      <Input
                        id="discountedPrice"
                        type="number"
                        step="0.01"
                        value={String(s3.discountedPrice ?? "")}
                        readOnly
                        className="border-2 focus:border-primary bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Auto-calculated</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Company Name *</Label>
                      <Select
                        value={s3.companyId || "other"}
                        onValueChange={(v) => {
                          if (v === "other") {
                            setS3((p) => ({ ...p, companyId: "", companyOther: "" }))
                          } else {
                            const company = companies.find((c: any) => c.id === v)
                            setS3((p) => ({
                              ...p,
                              companyId: v,
                              companyOther: "",
                              companyName: company?.companyName || "",
                            }))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {companies.length > 0 ? (
                            companies.map((company: any) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.companyName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-companies">No companies available</SelectItem>
                          )}
                          <SelectItem value="other">+ Other Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e3.companyId} />
                    </div>

                    {!s3.companyId && (
                      <div className="space-y-2">
                        <Label htmlFor="companyOther" className="font-semibold">
                          Enter Company Name *
                        </Label>
                        <Input
                          id="companyOther"
                          value={s3.companyOther || ""}
                          onChange={(e) => {
                            setS3((p) => ({
                              ...p,
                              companyOther: e.target.value,
                              companyName: e.target.value,
                            }))
                          }}
                          placeholder="Enter custom company name"
                          className="border-2 focus:border-primary"
                        />
                      </div>
                    )}

                    {/* <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyNameAddress" className="font-semibold">
                        Company Address *
                      </Label>
                      <Textarea
                        id="companyNameAddress"
                        value={s3.companyNameAddress}
                        onChange={(e) => setS3((p) => ({ ...p, companyNameAddress: e.target.value }))}
                        className="border-2 focus:border-primary"
                        placeholder="Enter complete company address"
                      />
                      <FieldError msg={e3.companyNameAddress} />
                    </div> */}

                    <div className="space-y-2">
                      <Label className="font-semibold">Payment Status *</Label>
                      <Select
                        value={s3.paymentStatusChoice}
                        onValueChange={(v) =>
                          setS3((p) => ({ ...p, paymentStatusChoice: v as Step3Values["paymentStatusChoice"] }))
                        }
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Completed</SelectItem>
                          <SelectItem value="failed">Fail</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e3.paymentStatusChoice} />
                    </div>

                    {s3.paymentStatusChoice === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="paymentStatusOther" className="font-semibold">
                          Custom Payment Status *
                        </Label>
                        <Input
                          id="paymentStatusOther"
                          value={s3.paymentStatusOther || ""}
                          onChange={(e) => setS3((p) => ({ ...p, paymentStatusOther: e.target.value }))}
                          className="border-2 focus:border-primary"
                        />
                        <FieldError msg={e3.paymentStatusOther} />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={s3.invoiceNumber || ""}
                        onChange={(e) => setS3((p) => ({ ...p, invoiceNumber: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={s3.invoiceDate || ""}
                        onChange={(e) => setS3((p) => ({ ...p, invoiceDate: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Billing Sent Status *</Label>
                      <Select
                        value={s3.billingSentStatus}
                        onValueChange={(v) => setS3((p) => ({ ...p, billingSentStatus: v as string }))}
                      >
                        <SelectTrigger className="w-full border-2 focus:border-primary bg-background">
                          <SelectValue placeholder="Billing sent status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="not_sent">Not sent</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError msg={e3.billingSentStatus} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingDate">Billing Date</Label>
                      <Input
                        id="billingDate"
                        type="date"
                        value={s3.billingDate || ""}
                        onChange={(e) => setS3((p) => ({ ...p, billingDate: e.target.value }))}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billDoc">Billing Document (PDF) - Optional</Label>
                      {initialLead?.billDocUrl && !s3.billDoc && (
                        <div className="text-xs text-muted-foreground mb-1">
                          Current:{" "}
                          <a
                            href={initialLead.billDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View existing file
                          </a>
                        </div>
                      )}
                      <Input
                        id="billDoc"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setS3((p) => ({ ...p, billDoc: e.target.files?.[0] }))}
                        className="border-2 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        PDF only, max 5MB. Upload new file to replace existing.
                      </p>
                      <FieldError msg={e3.billDoc} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Footer actions */}
          <footer className="px-6 py-5 border-t-2 border-border bg-muted/30">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">Step {step} of 3</div>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                {step < 3 && <Button onClick={step === 1 ? onNext1 : onNext2}>Next</Button>}
                {step === 3 && <Button onClick={onFinish}>Save Lead</Button>}
              </div>
            </div>
          </footer>
        </section>
      )}
    </>
  )
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="rounded-lg border-2 border-border bg-muted/40 p-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <StepItem index={1} step={step} label="Employee" />
        <StepItem index={2} step={step} label="Order / Client" />
        <StepItem index={3} step={step} label="Billing" />
      </div>
    </div>
  )
}

function StepItem({ index, step, label }: { index: number; step: number; label: string }) {
  const active = step === index
  const done = step > index
  const Icon = index === 1 ? FiUser : index === 2 ? FiClipboard : FiDollarSign

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-md border-2 px-3 py-3 transition-all duration-200",
        active ? "border-primary bg-card shadow-md" : "border-border bg-card/50",
        done ? "bg-secondary/60 border-secondary" : "",
      ].join(" ")}
      data-active={active || undefined}
      data-done={done || undefined}
      aria-current={active ? "step" : undefined}
    >
      <span
        className={[
          "inline-flex items-center justify-center rounded-md border-2 size-10 shrink-0",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
          done ? "bg-secondary border-secondary text-foreground" : "",
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{label}</div>
        <div className="text-xs text-muted-foreground">{active ? "In progress" : done ? "Completed" : "Pending"}</div>
      </div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-destructive font-medium">{msg}</p>
}
