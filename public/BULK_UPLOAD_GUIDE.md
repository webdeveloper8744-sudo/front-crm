# Bulk Lead Upload Guide - Complete Instructions

## CRITICAL: Fields That MUST Be Changed Manually

Before uploading the CSV, you MUST update these fields to match your system:

### 1. User Name Fields (MUST match exactly from Users & Roles page)
- **Employee Name** - The employee who created/owns this lead
- **Assign Team Member** - The team member assigned to handle this lead  
- **Processed By** - The user who processed the documents

**How to get correct names:**
1. Go to "Users & Roles" page in your CRM
2. Copy the EXACT full name of each user (including spaces and capitalization)
3. Paste into the CSV file

**Example:**
- If user is shown as "Sanjay Srivashtav" in Users & Roles, use exactly "Sanjay Srivashtav"
- NOT "sanjay srivashtav" or "Sanjay" or "S. Srivashtav"

---

## Required Field Values (Must Match Exactly)

### Source Field
Choose ONE of these exact values:
- `Survey`
- `Facebook`
- `Website`
- `Other`

**Note:** If you choose "Other", you MUST fill the "Other Source" field with details

### Stage Field
Choose ONE of these exact values:
- `Lead`
- `Contacted`
- `Qualified`
- `Proposal Made`
- `Won`
- `Lost`
- `Fridge`

### Download Status Field
Choose ONE of these exact values:
- `completed`
- `not_complete`
- `process`

### Payment Status Field
Choose ONE of these exact values:
- `paid`
- `pending`
- `failed`
- `other`

**Note:** If you choose "other", you can fill the "Payment Status Note" field with details

### Billing Sent Status Field
Choose ONE of these exact values:
- `sent`
- `not_sent`
- `process`

---

## Date Format

ALL date fields must use this format: `YYYY-MM-DD`

**Examples:**
- ✅ Correct: `2025-01-15`
- ❌ Wrong: `15/01/2025`, `01-15-2025`, `15-Jan-2025`

**Date Fields:**
- Lead Created Date
- Expected Close Date
- Last Contacted
- Order Date
- Processed At
- Invoice Date
- Billing Date

---

## Optional Fields (Can Be Left Empty)

These fields are NOT required and can be left blank:
- Other Source (only needed if Source = "Other")
- Expected Close Date
- Last Contacted
- Comment
- Remarks
- Reference By
- Payment Status Note
- Invoice Number
- Invoice Date
- Billing Date
- All Document URL fields

---

## Handling Documents for 4000+ Leads

### Option 1: Upload Without Documents (RECOMMENDED for bulk)
1. Leave ALL document URL columns empty
2. Upload the CSV with basic lead information
3. Later, edit individual leads to add documents through the UI

**Pros:** Fast, no errors, works for 4000+ leads
**Cons:** Need to add documents later

### Option 2: Use Pre-uploaded Cloudinary URLs
1. Upload all documents to Cloudinary first
2. Copy the full Cloudinary URLs
3. Paste URLs into respective columns in CSV

**Document URL Columns:**
- Aadhaar PDF URL
- PAN PDF URL
- Optional PDF URL
- Client Image URL
- Bill Document URL

**Example URL format:**
\`\`\`
https://res.cloudinary.com/de0glq6bf/raw/upload/v1760348490/crm/clients/docs/aadhaarPdf-1760348488414-79435354.pdf
\`\`\`

### Option 3: Copy URLs from Previous Exports
1. Export existing leads to CSV
2. Copy Cloudinary URLs from exported file
3. Reuse those URLs for new leads (if documents are similar)

---

## Step-by-Step Upload Process

### Step 1: Download Template
1. Click "Bulk Upload" button in Leads page
2. Click "Download CSV Template with 2 Sample Leads"
3. Open the downloaded file in Excel or Google Sheets

### Step 2: Update User Names
1. Go to "Users & Roles" page
2. Note down EXACT user names
3. Replace user names in CSV:
   - Column A: Employee Name
   - Column M: Assign Team Member
   - Column V: Processed By

### Step 3: Fill Your Lead Data
1. Keep the header row (row 1) unchanged
2. Delete the 2 sample data rows
3. Add your lead data starting from row 2
4. Ensure all required fields are filled
5. Use exact values for select fields (Source, Stage, etc.)
6. Use YYYY-MM-DD format for all dates

### Step 4: Handle Documents
Choose one of the 3 options above based on your needs

### Step 5: Save and Upload
1. Save the file as CSV format
2. Go to Leads page → Click "Bulk Upload"
3. Click "Choose File" and select your CSV
4. Click "Upload Leads"
5. Wait for validation and upload to complete

### Step 6: Review Results
- Green message: Successfully uploaded leads
- Red message: Failed leads with specific error details
- Fix errors in CSV and re-upload failed leads

---

## Common Errors and Solutions

### Error: "User not found: [name]"
**Solution:** The user name doesn't exist in your system
- Go to Users & Roles page
- Copy the EXACT user name
- Update the CSV with correct name

### Error: "Invalid source value"
**Solution:** Source field has wrong value
- Must be exactly: Survey, Facebook, Website, or Other
- Check for typos and extra spaces

### Error: "Invalid date format"
**Solution:** Date is not in YYYY-MM-DD format
- Change date format to YYYY-MM-DD
- Example: 2025-01-15

### Error: "Missing required field: [field name]"
**Solution:** A required field is empty
- Fill the required field with valid data
- Check the "Optional Fields" section to see which fields can be empty

### Error: "Invalid download status"
**Solution:** Download Status has wrong value
- Must be exactly: completed, not_complete, or process

---

## Tips for 4000+ Lead Upload

1. **Test First:** Upload 5-10 leads first to ensure format is correct
2. **Batch Upload:** Split into batches of 500-1000 leads for easier error tracking
3. **Skip Documents Initially:** Upload basic info first, add documents later
4. **Use Consistent Data:** Keep user names, product names consistent across all rows
5. **Validate Before Upload:** Check all required fields are filled
6. **Keep Backup:** Save original CSV before uploading
7. **Review Errors:** If some leads fail, fix only those rows and re-upload

---

## Field Reference (All 38 Fields)

| # | Field Name | Required | Type | Example |
|---|------------|----------|------|---------|
| 1 | Employee Name | Yes | User Name | Sanjay Srivashtav |
| 2 | Source | Yes | Select | Website |
| 3 | Other Source | Conditional | Text | LinkedIn Campaign |
| 4 | Lead Created Date | Yes | Date | 2025-01-15 |
| 5 | Expected Close Date | No | Date | 2025-02-15 |
| 6 | Last Contacted | No | Date | 2025-01-14 |
| 7 | Stage | Yes | Select | Contacted |
| 8 | Comment | No | Text | Client interested in DSC |
| 9 | Remarks | No | Text | Follow up next week |
| 10 | Client Name | Yes | Text | Rajesh Kumar |
| 11 | Client Company Name | Yes | Text | Tech Solutions Pvt Ltd |
| 12 | Product Name | Yes | Text | DSC |
| 13 | Assign Team Member | Yes | User Name | Yash |
| 14 | Email | Yes | Email | rajesh@example.com |
| 15 | Phone | Yes | Number | 9876543210 |
| 16 | Order ID | Yes | Text | ORD2025001 |
| 17 | Order Date | Yes | Date | 2025-01-15 |
| 18 | Client Address | Yes | Text | 123 MG Road, Bangalore |
| 19 | Client KYC ID | Yes | Text | AADH123456789012 |
| 20 | KYC PIN | Yes | Number | 560001 |
| 21 | Download Status | Yes | Select | completed |
| 22 | Processed By | Yes | User Name | Sanjay Srivashtav |
| 23 | Processed At | Yes | Date | 2025-01-15 |
| 24 | Aadhaar PDF URL | No | URL | https://... |
| 25 | PAN PDF URL | No | URL | https://... |
| 26 | Optional PDF URL | No | URL | https://... |
| 27 | Client Image URL | No | URL | https://... |
| 28 | Quoted Price | Yes | Number | 2500 |
| 29 | Company Name | Yes | Text | Tech Solutions Pvt Ltd |
| 30 | Company Name & Address | Yes | Text | Full address |
| 31 | Reference By | No | Text | Partner Referral |
| 32 | Payment Status | Yes | Select | paid |
| 33 | Payment Status Note | No | Text | Additional notes |
| 34 | Invoice Number | No | Text | INV2025001 |
| 35 | Invoice Date | No | Date | 2025-01-15 |
| 36 | Billing Sent Status | Yes | Select | sent |
| 37 | Billing Date | No | Date | 2025-01-15 |
| 38 | Bill Document URL | No | URL | https://... |

---

## Need Help?

If you encounter issues:
1. Check this guide for solutions
2. Verify user names in Users & Roles page
3. Test with 2-3 leads first
4. Contact support if errors persist
