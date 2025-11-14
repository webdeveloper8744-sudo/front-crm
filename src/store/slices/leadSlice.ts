import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

const getAuthToken = (state: RootState) => state.auth?.token || localStorage.getItem("crm_token")

export interface LeadListItem {
  paymentStatus: string
  referredBy: unknown
  discountedPrice: number
  id: string
  employeeName: string
  clientName: string
  clientCompanyName: string
  productName: string
  quotedPrice: string
  createdAt: string
}

export interface AssignedLead {
  id: string
  employeeName: string
  clientName: string
  clientCompanyName: string
  clientAddress: string
  clientImageUrl?: string
  productName: string
  assignTeamMember: string
  assignmentStatus: string
  stage: string
  downloadStatus: string
  paymentStatus: string
  quotedPrice: number
  email: string
  phone: string
  orderId: string
  createdAt: string
  updatedAt: string
  comment?: string
  remarks?: string
  referredBy?: string
  referredByClientId?: string
  discountAmount?: number
  discountType?: "amount" | "percentage"
  discountedPrice?: number
}

interface LeadState {
  items: LeadListItem[]
  assignedLeads: AssignedLead[]
  current: any | null
  isLoading: boolean
  error: string | null
}

const initialState: LeadState = {
  items: [],
  assignedLeads: [],
  current: null,
  isLoading: false,
  error: null,
}

export const fetchAssignedLeads = createAsyncThunk("lead/fetchAssigned", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)
    const user = state.auth.user

    if (!user) {
      return rejectWithValue("User not authenticated")
    }

    const res = await axios.get(`${API_CONFIG.LEADS}/assigned?userId=${user.id}&role=${user.role}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data.leads as AssignedLead[]
  } catch (e: any) {
    const msg = e.response?.data?.error || "Failed to fetch assigned leads"
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const updateLeadStatus = createAsyncThunk(
  "lead/updateStatus",
  async (
    {
      id,
      stage,
      downloadStatus,
      paymentStatus,
      comment,
    }: {
      id: string
      stage?: string
      downloadStatus?: string
      paymentStatus?: string
      comment?: string
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.patch(
        `${API_CONFIG.LEADS}/${id}/status`,
        { stage, downloadStatus, paymentStatus, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Lead status updated successfully")
      return res.data
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to update lead status"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

export const fetchLeads = createAsyncThunk("lead/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState() as RootState)
    const res = await axios.get(`${API_CONFIG.LEADS}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data.leads || res.data
  } catch (e: any) {
    const msg = e.response?.data?.error || "Failed to fetch leads"
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const fetchLeadById = createAsyncThunk("lead/fetchById", async (id: string, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState() as RootState)
    const res = await axios.get(`${API_CONFIG.LEADS}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data.lead || res.data
  } catch (e: any) {
    const msg = e.response?.data?.error || "Failed to fetch lead"
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const createLead = createAsyncThunk("lead/create", async (formData: FormData, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState() as RootState)
    const res = await axios.post(`${API_CONFIG.LEADS}`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    })
    toast.success("Lead created successfully")
    return res.data.lead || res.data
  } catch (e: any) {
    const msg = e.response?.data?.error || "Failed to create lead"
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const updateLead = createAsyncThunk(
  "lead/update",
  async ({ id, formData }: { id: string; formData: FormData }, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.put(`${API_CONFIG.LEADS}/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast.success("Lead updated successfully")
      return res.data.lead || res.data
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to update lead"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

export const deleteLead = createAsyncThunk("lead/delete", async (id: string, { getState, rejectWithValue }) => {
  try {
    const token = getAuthToken(getState() as RootState)
    await axios.delete(`${API_CONFIG.LEADS}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    toast.success("Lead deleted successfully")
    return id
  } catch (e: any) {
    const msg = e.response?.data?.error || "Failed to delete lead"
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

// Added new action to update assignment status
export const updateAssignmentStatus = createAsyncThunk(
  "lead/updateAssignmentStatus",
  async ({ id, assignmentStatus }: { id: string; assignmentStatus: string }, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.patch(
        `${API_CONFIG.LEADS}/${id}/assignment-status`,
        { assignmentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Lead status updated successfully")
      return res.data
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to update lead status"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

export const bulkUploadLeads = createAsyncThunk(
  "lead/bulkUpload",
  async (leads: any[], { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.post(
        `${API_CONFIG.LEADS}/bulk-upload`,
        { leads },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const { results } = res.data
      if (results.failed.length > 0) {
        toast.warning(`${results.success.length} leads uploaded, ${results.failed.length} failed`)
      } else {
        toast.success(`Successfully uploaded ${results.success.length} leads`)
      }

      return res.data
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to upload leads"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    clearLeadError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(fetchLeads.fulfilled, (s, a) => {
        s.isLoading = false
        s.items = a.payload
      })
      .addCase(fetchLeads.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      .addCase(fetchLeadById.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(fetchLeadById.fulfilled, (s, a) => {
        s.isLoading = false
        s.current = a.payload
      })
      .addCase(fetchLeadById.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      .addCase(createLead.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(createLead.fulfilled, (s, a) => {
        s.isLoading = false
        s.items.push(a.payload)
      })
      .addCase(createLead.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      .addCase(updateLead.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(updateLead.fulfilled, (s, a) => {
        s.isLoading = false
        const idx = s.items.findIndex((x) => x.id === a.payload.id)
        if (idx !== -1) {
          s.items[idx] = a.payload
        }
      })
      .addCase(updateLead.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      .addCase(deleteLead.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(deleteLead.fulfilled, (s, a) => {
        s.isLoading = false
        s.items = s.items.filter((x) => x.id !== a.payload)
      })
      .addCase(deleteLead.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      .addCase(fetchAssignedLeads.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(fetchAssignedLeads.fulfilled, (s, a) => {
        s.isLoading = false
        s.assignedLeads = a.payload
      })
      .addCase(fetchAssignedLeads.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
      // Added handler for updateAssignmentStatus
      .addCase(updateAssignmentStatus.fulfilled, (s, a) => {
        const idx = s.assignedLeads.findIndex((x) => x.id === a.payload?.id)
        if (idx !== -1) {
          s.assignedLeads[idx] = { ...s.assignedLeads[idx], ...a.payload }
        }
      })
      .addCase(updateLeadStatus.fulfilled, (s, a) => {
        const idx = s.assignedLeads.findIndex((x) => x.id === a.payload?.id)
        if (idx !== -1) {
          s.assignedLeads[idx] = { ...s.assignedLeads[idx], ...a.payload }
        }
      })
      .addCase(bulkUploadLeads.pending, (s) => {
        s.isLoading = true
        s.error = null
      })
      .addCase(bulkUploadLeads.fulfilled, (s) => {
        s.isLoading = false
      })
      .addCase(bulkUploadLeads.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload as string
      })
  },
})

export const { clearLeadError } = leadSlice.actions
export default leadSlice.reducer
