import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"
import { API_CONFIG } from "@/config/api"

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "manager" | "employee" | "guest"
  phone?: string
  imageUrl?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isInitialized: false,
  isLoading: false,
  error: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string; selectedRole: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_CONFIG.AUTH}/login`, credentials)
      const { token, user } = response.data

      // Store in localStorage
      localStorage.setItem("crm_token", token)
      localStorage.setItem("crm_current_user", JSON.stringify(user))

      toast.success("Welcome back!")
      return { token, user }
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("crm_token")
  localStorage.removeItem("crm_current_user")
  toast.success("Logged out successfully")
})

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("crm_token")
    const userStr = localStorage.getItem("crm_current_user")

    if (!token || !userStr) {
      return rejectWithValue("No stored credentials")
    }

    const user = JSON.parse(userStr)

    // Verify token with backend
    try {
      await axios.get(`${API_CONFIG.AUTH}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      // Token is invalid
      localStorage.removeItem("crm_token")
      localStorage.removeItem("crm_current_user")
      return rejectWithValue("Invalid token")
    }

    return { user, token }
  } catch (error) {
    localStorage.removeItem("crm_token")
    localStorage.removeItem("crm_current_user")
    return rejectWithValue("Auth check failed")
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email: string, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_CONFIG.AUTH}/forgot-password`, { email })
    return response.data
  } catch (error: any) {
    const message = error.response?.data?.error || "Failed to send verification code"
    return rejectWithValue(message)
  }
})

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_CONFIG.AUTH}/verify-reset-code`, { email, code })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error || "Invalid verification code"
      return rejectWithValue(message)
    }
  },
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_CONFIG.AUTH}/reset-password`, { email, code, newPassword })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to reset password"
      return rejectWithValue(message)
    }
  },
)

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

export const checkTokenValidity = createAsyncThunk(
  "auth/checkTokenValidity",
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("crm_token")

    if (!token) {
      return rejectWithValue("No token found")
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem("crm_current_user")
      localStorage.removeItem("crm_token")
      toast.error("Your session has expired. Please login again.")
      dispatch(clearAuth())
      return rejectWithValue("Token expired")
    }

    return { valid: true }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isInitialized = true
      localStorage.setItem("crm_current_user", JSON.stringify(action.payload))
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem("crm_token", action.payload)
    },
    setAuth: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isInitialized = true
      localStorage.setItem("crm_current_user", JSON.stringify(action.payload.user))
      localStorage.setItem("crm_token", action.payload.token)
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isInitialized = true
      localStorage.removeItem("crm_current_user")
      localStorage.removeItem("crm_token")
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem("crm_token")
      const userStr = localStorage.getItem("crm_current_user")

      if (token && userStr) {
        if (isTokenExpired(token)) {
          localStorage.removeItem("crm_current_user")
          localStorage.removeItem("crm_token")
          state.user = null
          state.token = null
          state.isInitialized = true
          return
        }

        try {
          const user = JSON.parse(userStr)
          state.user = user
          state.token = token
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error)
          localStorage.removeItem("crm_current_user")
          localStorage.removeItem("crm_token")
        }
      }

      state.isInitialized = true
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isInitialized = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.user = null
        state.token = null
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isInitialized = true
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isInitialized = true
      })
      .addCase(checkTokenValidity.rejected, (state) => {
        state.user = null
        state.token = null
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setUser, setToken, setAuth, clearAuth, initializeAuth, clearError } = authSlice.actions
export default authSlice.reducer
