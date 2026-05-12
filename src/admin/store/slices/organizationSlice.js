import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Fetch organizations
export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/organizations");
      console.log("Organizations response: ", response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations",
      );
    }
  },
);

// Add organization
export const addOrganization = createAsyncThunk(
  "organizations/add",
  async (organizationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/admin/organizations",
        organizationData,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add organization",
      );
    }
  },
);

// Update organization
export const updateOrganization = createAsyncThunk(
  "organizations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/organizations/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update organization",
      );
    }
  },
);

// Delete organization
export const deleteOrganization = createAsyncThunk(
  "organizations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/organizations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

const organizationSlice = createSlice({
  name: "organizations",
  initialState: {
    organizations: [],
    currentOrganization: null,
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload || [];
        state.organizations = apiData.map((org) => ({
          id: org.id,
          name: org.name,
          phone: org.phone || "-",
          email: org.email || "-",
          address: org.address || "-",
          multi_company:
            org.multi_company === 1 || org.multi_company === true
              ? "Yes"
              : "No",
          parentOrganization: org.parent_organization?.name || "—",
          logo: org.logo || null,
          createdAt: org.created_at
            ? new Date(org.created_at).toLocaleDateString()
            : "-",
          raw: org,
        }));
        state.totalCount = apiData.length || 0;
      })

      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Add Organization
      .addCase(addOrganization.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const newOrg = {
          id: action.payload.id,
          name: action.payload.name,
          phone: action.payload.phone || "-",
          email: action.payload.email || "-",
          address: action.payload.address || "-",
          logo: action.payload.logo || null,
          // Map the response field correctly
          multi_company:
            action.payload.multi_company ||
            action.payload.multiCompany ||
            "Yes",
          createdAt: action.payload.created_at
            ? new Date(action.payload.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
          raw: action.payload,
        };
        state.organizations.unshift(newOrg);
        state.totalCount += 1;
      })
      .addCase(addOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update Organization
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(
          (org) => org.id === action.payload.id,
        );
        if (index !== -1) {
          state.organizations[index] = {
            ...state.organizations[index],
            name: action.payload.name,
            phone: action.payload.phone || "-",
            email: action.payload.email || "-",
            address: action.payload.address || "-",
            multi_company:
              action.payload.multi_company === 1 ||
              action.payload.multi_company === true
                ? "Yes"
                : "No",
            raw: action.payload,
          };
        }
      })
      // Delete Organization
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter(
          (org) => org.id !== action.payload,
        );
        state.totalCount -= 1;
      });
  },
});

export const { setCurrentOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
