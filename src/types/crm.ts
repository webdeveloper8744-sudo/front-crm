export type ID = string

export type SourceType = "Survey" | "Facebook" | "Website" | "Other"
export type DownloadStatus = "completed" | "not_complete" | "process"
export type PaymentStatus = "paid" | "pending" | "failed"
export type BillingSentStatus = "sent" | "not_sent" | "process"

export interface Employee {
  id: ID
  name: string
  createdAt: string
}

export interface LeadEmployeeInfo {
  newField2: number | undefined
  newField1: string | undefined
  employeeName: string
  source: SourceType
  otherSource?: string
  leadCreatedAt: string
  lastContactedAt?: string
  comment?: string
}

export interface LeadOrderClientInfo {
  aadhaarPdfName?: string
  panPdfName?: string
  optionalPdfName?: string
  clientImageDataUrl?: string
  email: string
  phone: string
  orderId: string
  orderDate: string
  clientAddress: string
  clientKycId: string
  kycPin: string
  downloadStatus: DownloadStatus
  processedBy: string
  processedAt: string
}

export interface LeadBillingInfo {
  quotedPrice: number
  companyNameAddress: string
  referenceBy: string
  paymentStatus: PaymentStatus
  invoiceNumber?: string
  invoiceDate?: string
  billingSentStatus: BillingSentStatus
  billingDate?: string
  discountAmount?: number
  discountType?: "amount" | "percentage"
  discountedPrice?: number
}

export interface Lead {
  id: ID
  createdAt: string
  employee: LeadEmployeeInfo
  order: LeadOrderClientInfo
  billing: LeadBillingInfo
}

export interface UserRole {
  id: ID
  name: string
  role: "admin" | "manager" | "sales"
  email: string
  createdAt: string
}

export interface Product {
  id: ID
  name: string
  sku?: string
  category: "tally" | "dsc" | "other"
  createdAt: string
}
