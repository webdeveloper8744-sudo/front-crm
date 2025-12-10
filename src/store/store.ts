import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import userReducer from "./slices/userSlice"
import productReducer from "./slices/productSlice"
import serviceReducer from "./slices/serviceSlice"
import leadReducer from "./slices/leadSlice"
import leadAssignmentReducer from "./slices/leadAssignmentSlice"
import notificationReducer from "./slices/notificationSlice"
import purchaseOrderReducer from "./slices/purchaseOrderSlice"
import storeReducer from "./slices/storeSlice"
import companyReducer from "./slices/companySlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    service: serviceReducer,
    lead: leadReducer,
    leadAssignment: leadAssignmentReducer,
    notification: notificationReducer,
    purchaseOrder: purchaseOrderReducer,
    store: storeReducer,
    company: companyReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
