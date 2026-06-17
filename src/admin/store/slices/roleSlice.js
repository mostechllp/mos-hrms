import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/roles");
      console.log("Roles: ", response.data.data || response.data)
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
  }
);

export const addRole = createAsyncThunk(
  "roles/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/roles", data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add role"
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/roles/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/roles/${id}/permissions`);
      return { roleId: id, permissions: response.data.data || response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  "roles/updatePermissions",
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/admin/roles/${id}/permissions`, {
        permissions,
      });
      return { roleId: id, permissions: response.data.data || response.data || permissions };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update permissions"
      );
    }
  }
);

// We might also need fetchModules if they are dynamic.
export const fetchModules = createAsyncThunk(
  "roles/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/modules"); // Adjust if endpoint differs
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch modules"
      );
    }
  }
);


const roleSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [],
    rolePermissions: {},
    modules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Role
      .addCase(addRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      // Update Role
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      // Delete Role
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
        delete state.rolePermissions[action.payload];
      })
      // Fetch Permissions
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.rolePermissions[action.payload.roleId] = action.payload.permissions;
      })
      // Update Permissions
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        // If the API doesn't return the updated permissions in the expected format, we may need to adjust this.
        state.rolePermissions[action.payload.roleId] = action.payload.permissions;
      })
      // Fetch Modules
      .addCase(fetchModules.fulfilled, (state, action) => {
         state.modules = action.payload || [];
      });
  },
});

export default roleSlice.reducer;
