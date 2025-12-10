export type PostType = "director" | "manager" | "accounts"

export interface Company {
  id: string
  companyName: string
  cinNumber: string
  registerAddress: string
  alternateAddress?: string
  gstNo: string
  registeredMailId: string
  phoneNumber: string
  post: PostType
  directorFullName?: string
  dinNumber?: string
  directorPhone?: string
  directorEmail?: string
  panNumber?: string
  aadhaarNumber?: string
  contactFullName?: string
  contactPhone?: string
  contactEmail?: string
  createdAt?: Date
  updatedAt?: Date
}
