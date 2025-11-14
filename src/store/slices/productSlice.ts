import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"


export interface ProductData {
  id: string
  name: string
  description: string
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

interface ProductState {
  products: ProductData[]
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  error: null,
}

// Helper function to get auth token
const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all products
export const fetchProducts = createAsyncThunk("product/fetchProducts", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      return rejectWithValue("No authentication token")
    }

    const response = await axios.get(`${API_CONFIG.PRODUCTS}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.products
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to fetch products"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Add new product
export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.post(`${API_CONFIG.PRODUCTS}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Product added successfully!")
      return response.data.product
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to add product"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Update product
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (payload: { id: string; formData: FormData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.put(`${API_CONFIG.PRODUCTS}/${payload.id}`, payload.formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Product updated successfully!")
      return response.data.product
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update product"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      await axios.delete(`${API_CONFIG.PRODUCTS}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success("Product deleted successfully!")
      return id
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete product"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearProducts: (state) => {
      state.products = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products.unshift(action.payload)
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.products.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter((p) => p.id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearProducts } = productSlice.actions
export default productSlice.reducer
