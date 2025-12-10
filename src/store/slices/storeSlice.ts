import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface StoreData {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
}

interface StoreState {
  stores: StoreData[]
  isLoading: boolean
  error: string | null
}

const initialState: StoreState = {
  stores: [],
  isLoading: false,
  error: null,
}

const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all stores
export const fetchStores = createAsyncThunk("store/fetchAll", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    console.log("[v0] Fetching stores, token exists:", !!token)

    const response = await axios.get(`${API_CONFIG.BASE_URL}/store`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })

    console.log("[v0] Stores fetched successfully:", response.data)
    return response.data.stores || response.data
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || "Failed to fetch stores"
    console.error("[v0] Failed to fetch stores:", message)
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Create store
export const addStore = createAsyncThunk(
  "store/add",
  async (payload: { name: string; description: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      console.log("[v0] Creating store:", payload)

      const response = await axios.post(`${API_CONFIG.BASE_URL}/store/createstore`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Store created:", response.data)
      toast.success("Store created successfully!")
      return response.data.store
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || "Failed to create store"
      console.error("[v0] Failed to create store:", message)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Update store
export const updateStore = createAsyncThunk(
  "store/update",
  async (payload: { id: string; name: string; description: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      console.log("[v0] Updating store:", payload)

      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/store/update/${payload.id}`,
        { name: payload.name, description: payload.description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("[v0] Store updated:", response.data)
      toast.success("Store updated successfully!")
      return response.data.store
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || "Failed to update store"
      console.error("[v0] Failed to update store:", message)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete store
export const deleteStore = createAsyncThunk("store/delete", async (id: string, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      toast.error("No authentication token found. Please login again.")
      return rejectWithValue("No authentication token")
    }

    console.log("[v0] Deleting store:", id)

    await axios.delete(`${API_CONFIG.BASE_URL}/store/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("[v0] Store deleted successfully")
    toast.success("Store deleted successfully!")
    return id
  } catch (error: any) {
    const message =
      error.response?.data?.details || error.response?.data?.error || error.message || "Failed to delete store"
    console.error("[v0] Failed to delete store:", message)
    toast.error(message)
    return rejectWithValue(message)
  }
})

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false
        state.stores = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.stores = []
      })
      .addCase(addStore.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addStore.fulfilled, (state, action) => {
        state.isLoading = false
        state.stores.unshift(action.payload)
      })
      .addCase(addStore.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateStore.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.stores.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.stores[index] = action.payload
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteStore.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.isLoading = false
        state.stores = state.stores.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = storeSlice.actions
export default storeSlice.reducer
