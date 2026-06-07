// settingsSlice.js - Updated version
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

export const updateProfile = createAsyncThunk(
  "settings/updateProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    console.log("=== updateProfile thunk called ===");
    
    try {
      const isFormData = profileData instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
      
      const response = await apiClient.post("/employee/update-profile", profileData, { headers });
      
      console.log("=== Update Profile Response ===");
      console.log("Response data:", response.data);
      
      // After successful update, fetch fresh user data
      const userResponse = await apiClient.get("/auth/me");
      console.log("Raw user response:", userResponse.data);
      
      const userDataFromResponse = userResponse.data.data || userResponse.data;
      const updatedUser = userDataFromResponse.user || userDataFromResponse;
      
      console.log("Extracted user data:", updatedUser);
      
      const userData = {
        id: updatedUser.id,
        name: updatedUser.name || updatedUser.employee?.name,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        ...updatedUser
      };
      
      console.log("Formatted user data with avatar:", userData.avatar);
      
      dispatch({
        type: "auth/updateUser",
        payload: userData
      });
      
      return userData;
    } catch (error) {
      console.error("=== Update Profile Error ===", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Helper function to convert array format to object format
const convertArrayToObject = (workingHoursArray) => {
  const daysMap = {
    "Monday": "monday",
    "Tuesday": "tuesday",
    "Wednesday": "wednesday",
    "Thursday": "thursday",
    "Friday": "friday",
    "Saturday": "saturday",
    "Sunday": "sunday"
  };
  
  const defaultHours = {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "18:00" },
    sunday: { enabled: false, start: "09:00", end: "18:00" },
  };
  
  if (!workingHoursArray || !Array.isArray(workingHoursArray)) {
    return defaultHours;
  }
  
  const workingHoursObject = { ...defaultHours };
  
  workingHoursArray.forEach(item => {
    const dayKey = daysMap[item.day];
    if (dayKey) {
      workingHoursObject[dayKey] = {
        enabled: item.is_enabled === true || item.is_enabled === 1,
        start: item.start_time ? item.start_time.substring(0, 5) : "09:00",
        end: item.end_time ? item.end_time.substring(0, 5) : "18:00",
      };
    }
  });
  
  return workingHoursObject;
};

// Helper function to convert object format to array format
const convertObjectToArray = (workingHoursObject) => {
  const daysMapReverse = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };
  
  return Object.keys(workingHoursObject).map(day => ({
    day: daysMapReverse[day],
    is_enabled: workingHoursObject[day].enabled,
    start_time: workingHoursObject[day].enabled ? workingHoursObject[day].start : null,
    end_time: workingHoursObject[day].enabled ? workingHoursObject[day].end : null,
  }));
};

export const fetchWorkingHours = createAsyncThunk(
  "settings/fetchWorkingHours",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/working-hours");
      console.log("Working hours fetched:", response.data);
      
      // Extract the working hours array from response
      let workingHoursArray = response.data.data?.working_hours || 
                              response.data.working_hours || 
                              response.data.data;
      
      // If it's an array, convert to object format
      if (Array.isArray(workingHoursArray)) {
        workingHoursArray = workingHoursArray;
      } else if (workingHoursArray?.working_hours) {
        workingHoursArray = workingHoursArray.working_hours;
      }
      
      // Convert array to object format for component use
      const workingHoursObject = convertArrayToObject(workingHoursArray);
      console.log("Converted working hours object:", workingHoursObject);
      
      return workingHoursObject;
    } catch (error) {
      console.error("Fetch working hours error:", error);
      if (error.response?.status === 404) {
        // Return default working hours if not found
        return {
          monday: { enabled: true, start: "09:00", end: "18:00" },
          tuesday: { enabled: true, start: "09:00", end: "18:00" },
          wednesday: { enabled: true, start: "09:00", end: "18:00" },
          thursday: { enabled: true, start: "09:00", end: "18:00" },
          friday: { enabled: true, start: "09:00", end: "18:00" },
          saturday: { enabled: false, start: "09:00", end: "18:00" },
          sunday: { enabled: false, start: "09:00", end: "18:00" },
        };
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch working hours"
      );
    }
  }
);

// Save working hours
export const saveWorkingHours = createAsyncThunk(
  "settings/saveWorkingHours",
  async (workingHoursObject, { rejectWithValue }) => {
    try {
      // Convert object format to array format for API
      const workingHoursArray = convertObjectToArray(workingHoursObject);
      
      console.log("Saving working hours array:", workingHoursArray);
      
      const response = await apiClient.post("/admin/working-hours", {
        working_hours: workingHoursArray
      });
      
      console.log("Working hours saved:", response.data);
      return workingHoursObject;
    } catch (error) {
      console.error("Save working hours error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save working hours"
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "settings/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/employee/change-password", passwordData);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Change password error:", error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          return rejectWithValue(errorMessage);
        }
      }
      
      if (error.response?.status === 401) {
        return rejectWithValue("Current password is incorrect");
      }
      
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// Fetch current user profile
export const fetchUserProfile = createAsyncThunk(
  "settings/fetchProfile",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.get("/auth/me");
      const userData = response.data.data || response.data;
      
      const formattedUser = {
        name: userData.name || userData.employee?.name,
        email: userData.email,
        username: userData.username,
        ...userData
      };
      
      dispatch({
        type: "auth/updateUser",
        payload: formattedUser
      });
      
      return formattedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

const initialState = {
  profile: null,
  workingHours: null, // Add this line
  loading: false,
  workingHoursLoading: false, // Separate loading for working hours
  workingHoursSaving: false,
  error: null,
  updateSuccess: false,
  workingHoursSuccess: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearWorkingHoursSuccess: (state) => {
      state.workingHoursSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      
      // Fetch working hours
      .addCase(fetchWorkingHours.pending, (state) => {
        state.workingHoursLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkingHours.fulfilled, (state, action) => {
        state.workingHoursLoading = false;
        state.workingHours = action.payload;
        console.log("Working hours stored in state:", state.workingHours);
      })
      .addCase(fetchWorkingHours.rejected, (state, action) => {
        state.workingHoursLoading = false;
        state.error = action.payload;
      })
      
      // Save working hours
      .addCase(saveWorkingHours.pending, (state) => {
        state.workingHoursSaving = true;
        state.error = null;
        state.workingHoursSuccess = false;
      })
      .addCase(saveWorkingHours.fulfilled, (state, action) => {
        state.workingHoursSaving = false;
        state.workingHours = action.payload;
        state.workingHoursSuccess = true;
        console.log("Working hours saved and updated in state:", state.workingHours);
      })
      .addCase(saveWorkingHours.rejected, (state, action) => {
        state.workingHoursSaving = false;
        state.error = action.payload;
        state.workingHoursSuccess = false;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUpdateSuccess, clearWorkingHoursSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;