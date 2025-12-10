import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface CompanyDirector {
  id?: string
  fullName: string
  dinNumber: string
  phoneNumber: string
  email: string
  panNumber: string
  aadhaarNumber: string
}

export interface CompanyEmployee {
  id?: string
  fullName: string
  phoneNumber: string
  email: string
  designation: string
}

export interface CompanyData {
  id: string
  companyName: string
  cinNumber: string
  registeredAddress: string
  alternateAddress?: string
  gstNumber: string
  registeredMailId: string
  dinAlphanumeric: string
  post: string
  phoneNumber?: string
  createdAt: string
  updatedAt?: string
}

interface CompanyState {
  companies: CompanyData[]
  currentCompany: (CompanyData & { directors: CompanyDirector[]; employees: CompanyEmployee[] }) | null
  isLoading: boolean
  error: string | null
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,
}

const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all companies
export const fetchCompanies = createAsyncThunk("company/fetchAll", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      return rejectWithValue("No authentication token")
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/companies`, {
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

// Fetch single company
export const fetchCompanyById = createAsyncThunk(
  "company/fetchById",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await axios.get(`${API_CONFIG.BASE_URL}/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to fetch company"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Create company
export const addCompany = createAsyncThunk(
  "company/add",
  async (
    payload: {
      companyName: string
      cinNumber: string
      registeredAddress: string
      alternateAddress?: string
      gstNumber: string
      registeredMailId: string
      dinAlphanumeric: string
      post: string
      phoneNumber?: string
      director?: CompanyDirector
      employee?: CompanyEmployee
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/companies`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Company created successfully!")
      return response.data.company
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create company"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Update company
export const updateCompany = createAsyncThunk(
  "company/update",
  async (
    payload: {
      id: string
      companyName: string
      cinNumber: string
      registeredAddress: string
      alternateAddress?: string
      gstNumber: string
      registeredMailId: string
      dinAlphanumeric: string
      post: string
      phoneNumber?: string
      director?: CompanyDirector
      employee?: CompanyEmployee
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.put(`${API_CONFIG.BASE_URL}/companies/${payload.id}`, payload, {
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
export const deleteCompany = createAsyncThunk("company/delete", async (id: string, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      toast.error("No authentication token found. Please login again.")
      return rejectWithValue("No authentication token")
    }

    await axios.delete(`${API_CONFIG.BASE_URL}/companies/${id}`, {
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
})

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
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
      // Fetch by ID
      .addCase(fetchCompanyById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCompany = action.payload
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add
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
      // Update
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.companies.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.companies[index] = action.payload
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete
      .addCase(deleteCompany.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.isLoading = false
        state.companies = state.companies.filter((c) => c.id !== action.payload)
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentCompany } = companySlice.actions
export default companySlice.reducer
