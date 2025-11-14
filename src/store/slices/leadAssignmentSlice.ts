import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"

const API_URL = "http://localhost:3000"
const getAuthToken = (state: RootState) => state.auth?.token || localStorage.getItem("crm_token")

export interface LeadAssignment {
  id: string
  leadId: string
  assignedToId: string
  assignedToName: string
  assignedById: string
  assignedByName: string
  leadClientName: string
  leadClientCompany: string
  leadClientAddress?: string
  leadProductName?: string
  leadQuotedPrice: number
  status: string
  priority: string
  dueDate?: string
  contactAttempts: number
  lastContactedAt?: string
  nextFollowUpAt?: string
  notes?: string
  internalComments?: string
  isActive: boolean
  completedAt?: string
  completedBy?: string
  completionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AssignmentHistory {
  id: string
  assignmentId: string
  changedById: string
  changedByName: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  comment?: string
  createdAt: string
}

export interface AssignmentStats {
  total: number
  active: number
  new: number
  inProgress: number
  won: number
  lost: number
  highPriority: number
  overdue: number
}

interface LeadAssignmentState {
  assignments: LeadAssignment[]
  currentAssignment: LeadAssignment | null
  history: AssignmentHistory[]
  stats: AssignmentStats | null
  isLoading: boolean
  error: string | null
}

const initialState: LeadAssignmentState = {
  assignments: [],
  currentAssignment: null,
  history: [],
  stats: null,
  isLoading: false,
  error: null,
}

// Fetch all assignments
export const fetchAssignments = createAsyncThunk(
  "leadAssignment/fetchAll",
  async (filters: { status?: string; priority?: string; isActive?: boolean } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.priority) params.append("priority", filters.priority)
      if (filters.isActive !== undefined) params.append("isActive", String(filters.isActive))

      const res = await axios.get(`${API_URL}/lead-assignments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data.assignments as LeadAssignment[]
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to fetch assignments"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

// Fetch assignment by ID with history
export const fetchAssignmentById = createAsyncThunk(
  "leadAssignment/fetchById",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.get(`${API_URL}/lead-assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return { assignment: res.data.assignment, history: res.data.history }
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to fetch assignment"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

// Fetch assignment statistics
export const fetchAssignmentStats = createAsyncThunk(
  "leadAssignment/fetchStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.get(`${API_URL}/lead-assignments/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data as AssignmentStats
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to fetch statistics"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

// Create assignment
export const createAssignment = createAsyncThunk(
  "leadAssignment/create",
  async (
    data: { leadId: string; assignedToId: string; priority?: string; dueDate?: string; notes?: string },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.post(`${API_URL}/lead-assignments`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Assignment created successfully")
      return res.data as LeadAssignment
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to create assignment"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

// Update assignment
export const updateAssignment = createAsyncThunk(
  "leadAssignment/update",
  async (
    {
      id,
      data,
    }: {
      id: string
      data: {
        status?: string
        priority?: string
        contactAttempts?: number
        lastContactedAt?: string
        nextFollowUpAt?: string
        notes?: string
        internalComments?: string
      }
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.put(`${API_URL}/lead-assignments/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Assignment updated successfully")
      return res.data as LeadAssignment
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to update assignment"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

// Delete assignment
export const deleteAssignment = createAsyncThunk(
  "leadAssignment/delete",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      await axios.delete(`${API_URL}/lead-assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Assignment deleted successfully")
      return id
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to delete assignment"
      toast.error(msg)
      return rejectWithValue(msg)
    }
  },
)

const leadAssignmentSlice = createSlice({
  name: "leadAssignment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null
      state.history = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false
        state.assignments = action.payload
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch assignment by ID
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.currentAssignment = action.payload.assignment
        state.history = action.payload.history
      })
      // Fetch stats
      .addCase(fetchAssignmentStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Create assignment
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload)
      })
      // Update assignment
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const idx = state.assignments.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) {
          state.assignments[idx] = action.payload
        }
        if (state.currentAssignment?.id === action.payload.id) {
          state.currentAssignment = action.payload
        }
      })
      // Delete assignment
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter((a) => a.id !== action.payload)
      })
  },
})

export const { clearError, clearCurrentAssignment } = leadAssignmentSlice.actions
export default leadAssignmentSlice.reducer
