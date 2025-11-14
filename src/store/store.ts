import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import userReducer from "./slices/userSlice"
import productReducer from "./slices/productSlice"
import leadReducer from "./slices/leadSlice" //
import leadAssignmentReducer from "./slices/leadAssignmentSlice"
import notificationReducer from "./slices/notificationSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    lead: leadReducer,
    leadAssignment: leadAssignmentReducer, // Add lead assignment reducer
    notification: notificationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
