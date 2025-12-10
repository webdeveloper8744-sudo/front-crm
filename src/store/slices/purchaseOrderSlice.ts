import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface MTokenSerialNumber {
  id: string
  serialNumber: string
  purchaseOrderId: string
  storeId: string
  purchaseDate: string
  isUsed: boolean
  usedInLeadId?: string
  store?: {
    id: string
    name: string
  }
  createdAt: string
}

export interface PurchaseOrderData {
  id: string
  productName: string
  storeId: string
  quantity: number
  amount: number
  purchaseDate: string
  store?: {
    id: string
    name: string
    description: string
  }
  createdAt: string
}

interface PurchaseOrderState {
  orders: PurchaseOrderData[]
  serialNumbers: MTokenSerialNumber[]
  isLoading: boolean
  error: string | null
}

const initialState: PurchaseOrderState = {
  orders: [],
  serialNumbers: [],
  isLoading: false,
  error: null,
}

const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all purchase orders
export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrder/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await axios.get(`${API_CONFIG.BASE_URL}/purchase-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.orders
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to fetch purchase orders"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Create purchase order
export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrder/create",
  async (
    payload: { storeId: string; quantity: number; amount: number; purchaseDate: string; serialNumbers: string[] },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/purchase-orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Purchase order created successfully!")
      return response.data.order
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create purchase order"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Fetch all MToken serial numbers
export const fetchMTokenSerialNumbers = createAsyncThunk(
  "purchaseOrder/fetchSerials",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await axios.get(`${API_CONFIG.BASE_URL}/purchase-orders/serial/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.serials
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to fetch serial numbers"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Search MToken serial numbers
export const searchMTokenSerialNumbers = createAsyncThunk(
  "purchaseOrder/searchSerials",
  async (payload: { query?: string; storeId?: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const params = new URLSearchParams()
      if (payload.query) params.append("query", payload.query)
      if (payload.storeId) params.append("storeId", payload.storeId)

      const response = await axios.get(`${API_CONFIG.BASE_URL}/purchase-orders/serial/search?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.results
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to search serial numbers"
      return rejectWithValue(message)
    }
  },
)

// Mark MToken as used
export const markMTokenAsUsed = createAsyncThunk(
  "purchaseOrder/markAsUsed",
  async (payload: { serialNumber: string; leadId: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/purchase-orders/serial/mark-used`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.serial
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to mark MToken as used"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete purchase order
export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrder/delete",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      await axios.delete(`${API_CONFIG.BASE_URL}/purchase-orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Purchase order deleted successfully!")
      return id
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete purchase order"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch purchase orders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create purchase order
      .addCase(createPurchaseOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders.unshift(action.payload)
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch serial numbers
      .addCase(fetchMTokenSerialNumbers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMTokenSerialNumbers.fulfilled, (state, action) => {
        state.isLoading = false
        state.serialNumbers = action.payload
      })
      .addCase(fetchMTokenSerialNumbers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Search serial numbers
      .addCase(searchMTokenSerialNumbers.fulfilled, (state, action) => {
        state.serialNumbers = action.payload
      })
      // Delete purchase order
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = state.orders.filter((o) => o.id !== action.payload)
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = purchaseOrderSlice.actions
export default purchaseOrderSlice.reducer
