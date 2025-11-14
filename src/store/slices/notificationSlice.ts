import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import type { RootState } from "../store"
import { API_CONFIG } from "@/config/api"

const getAuthToken = (state: RootState) => state.auth?.token || localStorage.getItem("crm_token")

export interface Notification {
  id: string
  assignmentId: string
  userId: string
  userName: string
  leadClientName: string
  leadClientCompany: string
  notificationType: string
  message?: string
  isViewed: boolean
  viewedAt?: string
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

// Fetch notification count
export const fetchNotificationCount = createAsyncThunk(
  "notification/fetchCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const res = await axios.get(`${API_CONFIG.NOTIFICATIONS}/count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data.count as number
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to fetch notification count"
      return rejectWithValue(msg)
    }
  },
)

// Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (filters: { isViewed?: boolean; limit?: number } = {}, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      const params = new URLSearchParams()
      if (filters.isViewed !== undefined) params.append("isViewed", String(filters.isViewed))
      if (filters.limit) params.append("limit", String(filters.limit))

      const res = await axios.get(`${API_CONFIG.NOTIFICATIONS}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data.notifications as Notification[]
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to fetch notifications"
      return rejectWithValue(msg)
    }
  },
)

// Mark notifications as viewed
export const markNotificationsAsViewed = createAsyncThunk(
  "notification/markViewed",
  async (notificationIds: string[], { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      await axios.post(
        `${API_CONFIG.NOTIFICATIONS}/mark-viewed`,
        { notificationIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return notificationIds
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to mark notifications as viewed"
      return rejectWithValue(msg)
    }
  },
)

// Mark all notifications as viewed
export const markAllNotificationsAsViewed = createAsyncThunk(
  "notification/markAllViewed",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState() as RootState)
      await axios.post(
        `${API_CONFIG.NOTIFICATIONS}/mark-all-viewed`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return true
    } catch (e: any) {
      const msg = e.response?.data?.error || "Failed to mark all notifications as viewed"
      return rejectWithValue(msg)
    }
  },
)

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch count
      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Mark as viewed
      .addCase(markNotificationsAsViewed.fulfilled, (state, action) => {
        const ids = action.payload
        state.notifications = state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, isViewed: true, viewedAt: new Date().toISOString() } : n,
        )
        state.unreadCount = Math.max(0, state.unreadCount - ids.length)
      })
      // Mark all as viewed
      .addCase(markAllNotificationsAsViewed.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isViewed: true,
          viewedAt: new Date().toISOString(),
        }))
        state.unreadCount = 0
      })
  },
})

export const { clearError, resetNotifications } = notificationSlice.actions
export default notificationSlice.reducer
