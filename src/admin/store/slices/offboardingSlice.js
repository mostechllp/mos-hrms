import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Initiate offboarding - POST /admin/offboarding/initiate
export const initiateOffboarding = createAsyncThunk(
  "offboarding/initiate",
  async (offboardingData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/admin/offboarding/initiate",
        offboardingData,
      );

      if (
        response.data &&
        (response.data.success === true || response.data.status === "success")
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to initiate offboarding",
      );
    } catch (error) {
      console.error("Initiate offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to initiate offboarding",
      );
    }
  },
);

// Fetch all offboarding requests - GET /admin/offboarding
export const fetchAllOffboarding = createAsyncThunk(
  "offboarding/fetchAll",
  async (
    { page = 1, perPage = 10, status = "all", search = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(status !== "all" && { status }),
        ...(search && { search }),
      });

      const response = await apiClient.get(`/admin/offboarding?${params}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch offboarding requests",
        );
      }
    } catch (error) {
      console.error("Fetch all offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch offboarding requests",
      );
    }
  },
);

// Fetch offboarding by ID - GET /admin/offboarding/{id}
export const fetchOffboardingById = createAsyncThunk(
  "offboarding/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/offboarding/${id}`);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch offboarding details",
        );
      }
    } catch (error) {
      console.error("Fetch offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch offboarding details",
      );
    }
  },
);

// Fetch offboarding progress - GET /admin/offboarding/{id}/progress
export const fetchOffboardingProgress = createAsyncThunk(
  "offboarding/fetchProgress",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/offboarding/${id}/progress`);

      // Check for status === "success" instead of success === true
      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch offboarding progress",
        );
      }
    } catch (error) {
      console.error("Fetch offboarding progress error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch offboarding progress",
      );
    }
  },
);

// Update Offboarding - PUT /admin/offboarding/update-initiate
export const updateOffboarding = createAsyncThunk(
  "offboarding/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/admin/offboarding/update-initiate`,
        {
          ...data,
          offboarding_id: id,
        },
      );

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update offboarding",
        );
      }
    } catch (error) {
      console.error("Update offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update offboarding",
      );
    }
  },
);

// Delete Offboarding - DELETE /admin/offboarding/{id}
export const deleteOffboarding = createAsyncThunk(
  "offboarding/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/offboarding/${id}`);

      if (response.data && response.data.status === "success") {
        return { id, message: response.data.message };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to delete offboarding",
        );
      }
    } catch (error) {
      console.error("Delete offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete offboarding",
      );
    }
  },
);

// Save Handover - POST /admin/offboarding/save-handover
export const saveHandover = createAsyncThunk(
  "offboarding/saveHandover",
  async (
    {
      offboarding_id,
      task_and_projects,
      files_and_contents,
      reporting_manager_confirmation,
      notes,
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.post(
        "/admin/offboarding/save-handover",
        {
          offboarding_id,
          task_and_projects,
          files_and_contents,
          reporting_manager_confirmation,
          notes,
        },
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to save handover details",
      );
    } catch (error) {
      console.error("Save handover error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save handover details",
      );
    }
  },
);

// ----------------------------------------------------
// LEAVE VERIFICATION
// ----------------------------------------------------

// Fetch Leave Verification - GET /admin/offboarding/{id}/leave-verification
export const fetchLeaveVerification = createAsyncThunk(
  "offboarding/fetchLeaveVerification",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/offboarding/${id}/leave-verification`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch leave verification",
      );
    } catch (error) {
      console.error("Fetch leave verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave verification",
      );
    }
  },
);

// Update Leave Verification - POST /admin/offboarding/{id}/leave-verification
export const updateLeaveVerification = createAsyncThunk(
  "offboarding/updateLeaveVerification",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/leave-verification`,
        leaveData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update leave verification",
      );
    } catch (error) {
      console.error("Update leave verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave verification",
      );
    }
  },
);

// Save Leave Verification - POST /admin/offboarding/save-leave-verification
export const saveLeaveVerification = createAsyncThunk(
  "offboarding/saveLeaveVerification",
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/admin/offboarding/save-leave-verification",
        leaveData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to save leave verification",
      );
    } catch (error) {
      console.error("Save leave verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save leave verification",
      );
    }
  },
);

// ----------------------------------------------------
// ACCESS REMOVAL
// ----------------------------------------------------

// Save Access Removal - POST /admin/offboarding/save-access-removal
export const saveAccessRemoval = createAsyncThunk(
  "offboarding/saveAccessRemoval",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/admin/offboarding/save-access-removal",
        payload,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to save access removal",
      );
    } catch (error) {
      console.error("Save access removal error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save access removal",
      );
    }
  },
);

// Fetch Access Removal - GET /admin/offboarding/{id}/access-removal
export const fetchAccessRemoval = createAsyncThunk(
  "offboarding/fetchAccessRemoval",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/offboarding/${id}/access-removal`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch access removal",
      );
    } catch (error) {
      console.error("Fetch access removal error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch access removal",
      );
    }
  },
);

// Update Access Removal - POST /admin/offboarding/{id}/access-removal
export const updateAccessRemoval = createAsyncThunk(
  "offboarding/updateAccessRemoval",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/access-removal`,
        data,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ? { id, ...response.data.data } : { id };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update access removal",
      );
    } catch (error) {
      console.error("Update access removal error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update access removal",
      );
    }
  },
);

// Update Visa Status - POST /admin/offboarding/{id}/visa-status
export const updateVisaStatus = createAsyncThunk(
  "offboarding/updateVisaStatus",
  async ({ id, visaData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/visa-status`,
        visaData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ? { id, ...response.data.data } : { id };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update visa status",
        );
      }
    } catch (error) {
      console.error("Update visa status error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update visa status",
      );
    }
  },
);

// Update Checklist - POST /admin/offboarding/{id}/checklist
export const updateChecklist = createAsyncThunk(
  "offboarding/updateChecklist",
  async ({ id, checklistData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/checklist`,
        checklistData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ? { id, ...response.data.data } : { id };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update checklist",
        );
      }
    } catch (error) {
      console.error("Update checklist error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update checklist",
      );
    }
  },
);

// Update Assets - POST /admin/offboarding/{id}/assets
export const updateAssets = createAsyncThunk(
  "offboarding/updateAssets",
  async ({ id, assetsData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/assets`,
        assetsData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ? { id, ...response.data.data } : { id };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update assets",
        );
      }
    } catch (error) {
      console.error("Update assets error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update assets",
      );
    }
  },
);

// Submit Interview - POST /admin/offboarding/{id}/interview
export const submitInterview = createAsyncThunk(
  "offboarding/submitInterview",
  async ({ id, interviewData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/interview`,
        interviewData,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ? { id, ...response.data.data } : { id };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to submit interview",
        );
      }
    } catch (error) {
      console.error("Submit interview error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit interview",
      );
    }
  },
);

// Fetch Settlement - GET /admin/offboarding/{id}/settlement
export const fetchSettlement = createAsyncThunk(
  "offboarding/fetchSettlement",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/admin/offboarding/${id}/settlement`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch settlement",
      );
    } catch (error) {
      console.error("Fetch settlement error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch settlement",
      );
    }
  },
);

// Update Settlement - POST /admin/offboarding/{id}/settlement
export const updateSettlement = createAsyncThunk(
  "offboarding/updateSettlement",
  async ({ id, settlementData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/settlement`,
        settlementData,
      );

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update settlement",
        );
      }
    } catch (error) {
      console.error("Update settlement error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update settlement",
      );
    }
  },
);

// Generate Letters - POST /admin/offboarding/{id}/letters
export const generateLetters = createAsyncThunk(
  "offboarding/generateLetters",
  async ({ id, lettersData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/letters`,
        lettersData,
      );

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to generate letters",
        );
      }
    } catch (error) {
      console.error("Generate letters error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate letters",
      );
    }
  },
);

// Cancel offboarding (if needed)
export const cancelOffboarding = createAsyncThunk(
  "offboarding/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/admin/offboarding/${id}`);

      if (response.data && response.data.status === "success") {
        return { id, message: response.data.message };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to cancel offboarding",
        );
      }
    } catch (error) {
      console.error("Cancel offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel offboarding",
      );
    }
  },
);

// Save draft offboarding (if needed)
export const saveOffboardingDraft = createAsyncThunk(
  "offboarding/saveDraft",
  async (draftData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/admin/offboarding/draft",
        draftData,
      );

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to save draft",
        );
      }
    } catch (error) {
      console.error("Save draft error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save draft",
      );
    }
  },
);

// Complete Offboarding - POST /admin/offboarding/{id}/complete
export const completeOffboarding = createAsyncThunk(
  "offboarding/completeOffboarding",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/admin/offboarding/${id}/complete`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id, ...response.data.data };
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to complete offboarding",
        );
      }
    } catch (error) {
      console.error("Complete offboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete offboarding",
      );
    }
  },
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------
const initialState = {
  offboardings: [],
  currentOffboarding: null,
  currentProgress: null,
  leaveVerification: null,
  accessRemoval: null, 
  settlement: null,         
  calculatedSettlement: null,
  currentStep: 1,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 10,
  filters: {
    status: "all",
    search: "",
    department: "all",
    dateFrom: null,
    dateTo: null,
  },
  stats: {
    total: 0,
    initiated: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  },
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const offboardingSlice = createSlice({
  name: "offboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    clearCurrentOffboarding: (state) => {
      state.currentOffboarding = null;
      state.currentProgress = null;
      state.leaveVerification = null;
      state.currentStep = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalChecklist: (state, action) => {
      if (state.currentOffboarding) {
        state.currentOffboarding.checklist = action.payload;
      }
    },
    updateLocalAssets: (state, action) => {
      if (state.currentOffboarding) {
        state.currentOffboarding.assets = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Offboarding
      .addCase(initiateOffboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateOffboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOffboarding = action.payload;
        state.offboardings.unshift(action.payload);
        state.totalCount += 1;

        if (action.payload.status === "initiated") {
          state.stats.initiated += 1;
          state.stats.total += 1;
        }
      })
      .addCase(initiateOffboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Offboarding
      .addCase(fetchAllOffboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOffboarding.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload || {};

        state.offboardings = apiData.data || [];
        state.totalCount = apiData.total || 0;
        state.currentPage = apiData.current_page || 1;
        state.perPage = apiData.per_page || 10;

        state.stats = {
          total: state.offboardings.length,
          initiated: state.offboardings.filter((o) => o.status === "initiated")
            .length,
          inProgress: state.offboardings.filter(
            (o) => o.status === "in-progress" || o.status === "in_progress",
          ).length,
          completed: state.offboardings.filter((o) => o.status === "completed")
            .length,
          cancelled: state.offboardings.filter((o) => o.status === "cancelled")
            .length,
        };
      })
      .addCase(fetchAllOffboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Offboarding By ID
      .addCase(fetchOffboardingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffboardingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOffboarding = action.payload;

        const stepMap = {
          initiation: 1,
          visa_cancellation: 2,
          checklist: 3,
          assets: 4,
          exit_interview: 5,
          settlement: 6,
          letters: 7,
        };
        state.currentStep = stepMap[action.payload.current_step] || 1;
      })
      .addCase(fetchOffboardingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Offboarding Progress
      .addCase(fetchOffboardingProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffboardingProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgress = action.payload;
      })
      .addCase(fetchOffboardingProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Visa Status
      .addCase(updateVisaStatus.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          action.payload &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.visa_status = action.payload.visa_status;
          state.currentOffboarding.visa_details = action.payload.visa_details;
        }
      })

      // Update Checklist
      .addCase(updateChecklist.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          action.payload &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.checklist = action.payload.checklist;
          state.currentOffboarding.checklist_progress =
            action.payload.checklist_progress;
        }
      })

      // Update Assets
      .addCase(updateAssets.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          action.payload &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.assets = action.payload.assets;
          state.currentOffboarding.assets_status = action.payload.assets_status;
        }
      })

      // Submit Interview
      .addCase(submitInterview.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.interview = action.payload.interview;
          state.currentOffboarding.interview_status =
            action.payload.interview_status;
        }
      })

      // Update Settlement
            // Update Settlement
      .addCase(updateSettlement.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          action.payload &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.settlement = action.payload.settlement;
          state.currentOffboarding.settlement_status =
            action.payload.settlement_status;
        }

        // Also store the freshly returned settlement if present
        if (action.payload?.settlement) {
          state.settlement = action.payload.settlement;
        }
        if (action.payload?.calculated_settlement) {
          state.calculatedSettlement = action.payload.calculated_settlement;
        }
      })

      // Generate Letters
      .addCase(generateLetters.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.letters = action.payload.letters;
          state.currentOffboarding.letters_status =
            action.payload.letters_status;
        }
      })

      // Cancel Offboarding
      .addCase(cancelOffboarding.fulfilled, (state, action) => {
        const index = state.offboardings.findIndex(
          (o) => o.id === action.payload.id,
        );
        if (index !== -1) {
          state.offboardings[index].status = "cancelled";
        }

        if (
          state.currentOffboarding &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding.status = "cancelled";
        }

        state.stats.cancelled += 1;
        state.stats.total = state.offboardings.filter(
          (o) => o.status !== "cancelled",
        ).length;
      })

      // Save Draft
      .addCase(saveOffboardingDraft.fulfilled, (state, action) => {
        if (action.payload.id) {
          const index = state.offboardings.findIndex(
            (o) => o.id === action.payload.id,
          );
          if (index !== -1) {
            state.offboardings[index] = action.payload;
          } else {
            state.offboardings.unshift(action.payload);
          }
        }
      })
      // In the extraReducers of offboardingSlice
      .addCase(deleteOffboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOffboarding.fulfilled, (state, action) => {
        state.offboardings = state.offboardings.filter(
          (off) => off.id !== action.payload.id,
        );
        state.totalCount -= 1;

        if (
          state.currentOffboarding &&
          state.currentOffboarding.id === action.payload.id
        ) {
          state.currentOffboarding = null;
          state.currentProgress = null;
        }

        state.stats = {
          total: state.offboardings.length,
          initiated: state.offboardings.filter((o) => o.status === "initiated")
            .length,
          inProgress: state.offboardings.filter(
            (o) => o.status === "in-progress" || o.status === "in_progress",
          ).length,
          completed: state.offboardings.filter((o) => o.status === "completed")
            .length,
          cancelled: state.offboardings.filter((o) => o.status === "cancelled")
            .length,
        };
      })
      .addCase(deleteOffboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Handover
      .addCase(saveHandover.fulfilled, (state, action) => {
        if (
          state.currentOffboarding &&
          state.currentOffboarding.id === action.payload.offboarding_id
        ) {
          state.currentOffboarding.handover = action.payload;
        }
      })
      // Fetch Leave Verification
      .addCase(fetchLeaveVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveVerification = action.payload;
      })
      .addCase(fetchLeaveVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Leave Verification
      .addCase(updateLeaveVerification.fulfilled, (state, action) => {
        state.leaveVerification = action.payload;
      })

      // Save Leave Verification
      .addCase(saveLeaveVerification.fulfilled, (state, action) => {
        state.leaveVerification = action.payload;
      })
            // Save Access Removal
      .addCase(saveAccessRemoval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAccessRemoval.fulfilled, (state, action) => {
        state.loading = false;
        state.accessRemoval = action.payload;
      })
      .addCase(saveAccessRemoval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Access Removal
      .addCase(fetchAccessRemoval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessRemoval.fulfilled, (state, action) => {
        state.loading = false;
        state.accessRemoval = action.payload;
      })
      .addCase(fetchAccessRemoval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Access Removal
      .addCase(updateAccessRemoval.fulfilled, (state, action) => {
        state.accessRemoval = action.payload;
      })
            // Fetch Settlement
      .addCase(fetchSettlement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettlement.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = { settlement, calculated_settlement }
        state.settlement = action.payload?.settlement || null;
        state.calculatedSettlement =
          action.payload?.calculated_settlement || null;
      })
      .addCase(fetchSettlement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ----------------------------------------------------
// EXPORT ACTIONS AND REDUCER
// ----------------------------------------------------
export const {
  setCurrentStep,
  setCurrentPage,
  setPerPage,
  setFilters,
  resetFilters,
  clearCurrentOffboarding,
  clearError,
  updateLocalChecklist,
  updateLocalAssets,
} = offboardingSlice.actions;

export default offboardingSlice.reducer;
