// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient"; // Updated path

// src/store/slices/authSlice.js - Update the loginUser thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // The API expects 'username' not 'email'
      const response = await apiClient.post("/auth/login", {
        username: email,  // This was likely the issue
        password,
      });

      const data = response.data.data;
      const { access_token, user } = data;

      // Store unified token
      localStorage.setItem("auth-token", access_token);
      localStorage.setItem("user-type", user.type);
      localStorage.setItem("user-data", JSON.stringify(user));

      // Store role-specific tokens for backward compatibility
      if (user.type === "admin") {
        localStorage.setItem("hr-token", access_token);
        localStorage.setItem("hr-user", JSON.stringify(user));
      } else if (user.type === "employee") {
        localStorage.setItem("employee-token", access_token);
        localStorage.setItem("employee-user", JSON.stringify(user));
      }

      // Store remember me info if checked
      if (typeof window !== 'undefined') {
        const rememberMe = localStorage.getItem("remember-me") === "true";
        if (rememberMe) {
          localStorage.setItem("remembered-email", email);
        }
      }

      return data;
    } catch (error) {
      console.error("Login error:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  // Clear all storage
  localStorage.removeItem("auth-token");
  localStorage.removeItem("user-type");
  localStorage.removeItem("user-data");
  localStorage.removeItem("hr-token");
  localStorage.removeItem("hr-user");
  localStorage.removeItem("employee-token");
  localStorage.removeItem("employee-user");
  localStorage.removeItem("remember-me");
  localStorage.removeItem("remembered-email");

  return null;
});

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return rejectWithValue("No token");

    try {
      const response = await apiClient.get("/auth/me"); // or whatever your verify endpoint is
      return response.data.data;
    } catch {
      // Token is invalid/expired — clear everything
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-type");
      localStorage.removeItem("user-data");
      localStorage.removeItem("hr-token");
      localStorage.removeItem("hr-user");
      localStorage.removeItem("employee-token");
      localStorage.removeItem("employee-user");
      return rejectWithValue("Invalid token");
    }
  }
);
const getUserFromStorage = () => {
  const userData = localStorage.getItem("user-data");
  if (userData) {
    const user = JSON.parse(userData);
    return {
      ...user,
      name: user.employee?.name || user.username,
    };
  }
  return null;
};

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("auth-token") || null,
  userType: localStorage.getItem("user-type") || null,
  isAuthenticated: !!localStorage.getItem("auth-token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRememberMe: (state, action) => {
      if (action.payload) {
        localStorage.setItem("remember-me", "true");
      } else {
        localStorage.removeItem("remember-me");
        localStorage.removeItem("remembered-email");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.userType = action.payload.user.type;
        state.user = {
          ...action.payload.user,
          name: action.payload.user.employee?.name || action.payload.user.username,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userType = action.payload.user?.type;
        state.user = {
          ...action.payload.user,
          name: action.payload.user?.employee?.name || action.payload.user?.username,
        };
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.userType = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.userType = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setRememberMe } = authSlice.actions;
export default authSlice.reducer;