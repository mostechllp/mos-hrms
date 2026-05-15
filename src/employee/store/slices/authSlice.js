import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

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

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const response = await apiClient.post("/employee/update-profile", {
        name: profileData.fullName,
        email: profileData.email,
      });

      if (response.data.status === "success") {
        const updatedUser = response.data.data || response.data.user;
        
        // Get current user from state
        const currentUser = getState().auth.user;
        
        // Merge the updated data
        const newUserData = {
          ...currentUser,
          ...updatedUser,
          name: updatedUser.name || updatedUser.employee?.name || profileData.fullName,
          email: updatedUser.email || profileData.email,
        };
        
        // Get the stored user to preserve other data
        const storedUser = JSON.parse(localStorage.getItem("employee-user") || "{}");
        const finalUserData = {
          ...storedUser,
          ...newUserData,
        };
        
        // Update localStorage
        localStorage.setItem("employee-user", JSON.stringify(finalUserData));
        
        return finalUserData;
      } else {
        return rejectWithValue(response.data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Fetch current user data (to sync after refresh)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/employee/profile");
      
      if (response.data.status === "success") {
        const userData = response.data.data || response.data.user;
        
        // Update localStorage
        const currentStored = JSON.parse(localStorage.getItem("employee-user") || "{}");
        const updatedUserData = {
          ...currentStored,
          ...userData,
        };
        localStorage.setItem("employee-user", JSON.stringify(updatedUserData));
        
        return updatedUserData;
      }
      return rejectWithValue("Failed to fetch user data");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

const initialState = {
  isAuthenticated: !!localStorage.getItem("employee-token"),
  user: JSON.parse(localStorage.getItem("employee-user")) || null,
  token: localStorage.getItem("employee-token") || null,
  loading: false,
  error: null,
  profileUpdateLoading: false,
  profileUpdateError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.profileUpdateLoading = false;
      state.profileUpdateError = null;

      localStorage.removeItem("employee-token");
      localStorage.removeItem("employee-user");
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Also update localStorage
      const storedUser = JSON.parse(localStorage.getItem("employee-user") || "{}");
      const updatedUser = { ...storedUser, ...action.payload };
      localStorage.setItem("employee-user", JSON.stringify(updatedUser));
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProfileUpdateError: (state) => {
      state.profileUpdateError = null;
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
          ...action.payload.user, // Include all user data
        };
        state.token = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.profileUpdateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.user = {
          ...state.user,
          ...action.payload,
          name: action.payload.name || action.payload.employee?.name || state.user?.name,
          email: action.payload.email || state.user?.email,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateError = action.payload;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
          name: action.payload.name || action.payload.employee?.name || state.user?.name,
          email: action.payload.email || state.user?.email,
        };
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { 
  logout, 
  updateProfile, 
  clearError, 
  clearProfileUpdateError 
} = authSlice.actions;

export default authSlice.reducer;