import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface CompanyData {
  id: string
  companyName: string
  cinNumber: string
  registerAddress: string
  alternateAddress?: string
  gstNo: string
  registeredMailId: string
  phoneNumber: string
  post: "director" | "manager" | "accounts"
  directorFullName?: string
  dinNumber?: string
  directorPhone?: string
  directorEmail?: string
  panNumber?: string
  aadhaarNumber?: string
  contactFullName?: string
  contactPhone?: string
  contactEmail?: string
  createdAt: string
  updatedAt?: string
}

interface CompanyState {
  companies: CompanyData[]
  isLoading: boolean
  error: string | null
}

const initialState: CompanyState = {
  companies: [],
  isLoading: false,
  error: null,
}

// Helper function to get auth token
const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all companies
export const fetchCompanies = createAsyncThunk("company/fetchCompanies", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      return rejectWithValue("No authentication token")
    }

    const response = await axios.get(`${API_CONFIG.COMPANIES}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.companies
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to fetch companies"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Add new company
export const addCompany = createAsyncThunk(
  "company/addCompany",
  async (data: Partial<CompanyData>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.COMPANIES}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Company added successfully!")
      return response.data.company
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to add company"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Update company
export const updateCompanyData = createAsyncThunk(
  "company/updateCompany",
  async (payload: { id: string; data: Partial<CompanyData> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.put(`${API_CONFIG.COMPANIES}/${payload.id}`, payload.data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Company updated successfully!")
      return response.data.company
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update company"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete company
export const deleteCompanyData = createAsyncThunk(
  "company/deleteCompany",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      await axios.delete(`${API_CONFIG.COMPANIES}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Company deleted successfully!")
      return id
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete company"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCompanies: (state) => {
      state.companies = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false
        state.companies = action.payload
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add company
      .addCase(addCompany.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addCompany.fulfilled, (state, action) => {
        state.isLoading = false
        state.companies.unshift(action.payload)
      })
      .addCase(addCompany.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update company
      .addCase(updateCompanyData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCompanyData.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.companies.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.companies[index] = action.payload
        }
      })
      .addCase(updateCompanyData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete company
      .addCase(deleteCompanyData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCompanyData.fulfilled, (state, action) => {
        state.isLoading = false
        state.companies = state.companies.filter((c) => c.id !== action.payload)
      })
      .addCase(deleteCompanyData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCompanies } = companySlice.actions
export default companySlice.reducer
