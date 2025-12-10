import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface ServiceData {
  id: string
  serviceName: string
  purpose: string
  createdAt: string
  updatedAt?: string
}

interface ServiceState {
  services: ServiceData[]
  isLoading: boolean
  error: string | null
}

const initialState: ServiceState = {
  services: [],
  isLoading: false,
  error: null,
}

const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all services
export const fetchServices = createAsyncThunk("service/fetchServices", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      return rejectWithValue("No authentication token")
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.services
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to fetch services"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Add new service
export const addService = createAsyncThunk(
  "service/addService",
  async (payload: { serviceName: string; purpose: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/services`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Service added successfully!")
      return response.data.service
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to add service"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Update service
export const updateService = createAsyncThunk(
  "service/updateService",
  async (payload: { id: string; serviceName: string; purpose: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.put(`${API_CONFIG.BASE_URL}/services/${payload.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Service updated successfully!")
      return response.data.service
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update service"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete service
export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      await axios.delete(`${API_CONFIG.BASE_URL}/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Service deleted successfully!")
      return id
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete service"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearServices: (state) => {
      state.services = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false
        state.services = action.payload
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add service
      .addCase(addService.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.isLoading = false
        state.services.unshift(action.payload)
      })
      .addCase(addService.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update service
      .addCase(updateService.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.services.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.services[index] = action.payload
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete service
      .addCase(deleteService.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isLoading = false
        state.services = state.services.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearServices } = serviceSlice.actions
export default serviceSlice.reducer
