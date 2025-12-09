import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

export interface UserData {
  profileImage: string
  fullName: string
  id: string
  email: string
  phone: string
  role: "admin" | "manager" | "employee" | "guest"
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

interface UserState {
  users: UserData[]
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
}

// Helper function to get auth token
const getAuthToken = (state: RootState) => {
  return state.auth.token || localStorage.getItem("crm_token")
}

// Fetch all users
export const fetchUsers = createAsyncThunk("user/fetchUsers", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      return rejectWithValue("No authentication token")
    }

    const response = await axios.get(`${API_CONFIG.USERS}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.users
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to fetch users"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Add new user
export const addUser = createAsyncThunk("user/addUser", async (formData: FormData, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      toast.error("No authentication token found. Please login again.")
      return rejectWithValue("No authentication token")
    }

    const response = await axios.post(`${API_CONFIG.AUTH}/add-user`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type will be automatically set by axios with boundary for FormData
      },
    })

    toast.success("User added successfully!")
    return response.data.user
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to add user"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Update user
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (payload: { id: string; formData: FormData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const token = getAuthToken(state)

      if (!token) {
        toast.error("No authentication token found. Please login again.")
        return rejectWithValue("No authentication token")
      }

      const response = await axios.put(`${API_CONFIG.USERS}/${payload.id}`, payload.formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type will be automatically set by axios with boundary for FormData
        },
      })

      toast.success("User updated successfully!")
      return response.data.user
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update user"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

// Delete user
export const deleteUser = createAsyncThunk("user/deleteUser", async (id: string, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState
    const token = getAuthToken(state)

    if (!token) {
      toast.error("No authentication token found. Please login again.")
      return rejectWithValue("No authentication token")
    }

    await axios.delete(`${API_CONFIG.USERS}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    toast.success("User deleted successfully!")
    return id
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to delete user"
    toast.error(message)
    return rejectWithValue(message)
  }
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUsers: (state) => {
      state.users = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add user
      .addCase(addUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.push(action.payload)
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearUsers } = userSlice.actions
export default userSlice.reducer
