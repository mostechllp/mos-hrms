import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/login", {
        username: email,
        password,
      });

      const data = response.data.data;

      localStorage.setItem("employee-token", data.access_token);
      localStorage.setItem("employee-user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

const initialState = {
  isAuthenticated: !!localStorage.getItem("employee-token"),
  user: JSON.parse(localStorage.getItem("employee-user")) || null,
  token: localStorage.getItem("employee-token") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;

      localStorage.removeItem("employee-token");
      localStorage.removeItem("employee-user");
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
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
        state.user = {
          name: action.payload.user.employee?.name,
          email: action.payload.user.email,
          role: action.payload.user.roles?.[0],
          avatar: action.payload.user.avatar,
        };
        state.token = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
