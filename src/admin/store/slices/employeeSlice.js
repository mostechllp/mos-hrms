import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/employees");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees",
      );
    }
  },
);

// In your employeeSlice.js, update the addEmployee thunk
// export const addEmployee = createAsyncThunk(
//   "employees/add",
//   async (employeeData, { rejectWithValue }) => {
//     try {
//       console.log("Sending employee data:", employeeData);

//       const response = await apiClient.post("/admin/employees", employeeData);
//       console.log("Employee add response:", response.data);

//       return response.data.data;
//     } catch (error) {
//       console.error("Employee add error - Full error:", error);
//       console.error(
//         "Employee add error - Response data:",
//         error.response?.data,
//       );
//       console.error(
//         "Employee add error - Validation errors:",
//         error.response?.data?.errors,
//       );

//       // Return the full error object with validation details
//       if (error.response?.data?.errors) {
//         return rejectWithValue({
//           message: error.response.data.message,
//           errors: error.response.data.errors,
//         });
//       }

//       const errorMessage =
//         error.response?.data?.message || "Failed to add employee";
//       return rejectWithValue(errorMessage);
//     }
//   },
// );
export const addEmployee = createAsyncThunk(
  "employees/add",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/employees", employeeData);
      console.log("Employee add response:", response.data);
      return response.data.data;
    } catch (error) {
      if (error.response?.data?.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to add employee"
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/employees/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee",
      );
    }
  },
);

export const updateEmployeeStatus = createAsyncThunk(
  "employees/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/employees/${id}/update-status`, {
        status: status.toLowerCase(),
      });

      return { id, status };
    } catch (error) {
      console.log("STATUS ERROR:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/employees/${id}`);
      console.log("Fetch employee by ID response:", response.data);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch employee",
        );
      }
    } catch (error) {
      console.error("Fetch employee error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee",
      );
    }
  },
);

// Update employee
export const updateEmployee = createAsyncThunk(
  "employees/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/employees/${id}`, data);
      console.log("Update employee response:", response.data);

      if (response.data && response.data.status === "success") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to update employee",
        );
      }
    } catch (error) {
      console.error("Update employee error:", error.response?.data);

      if (error.response?.data?.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }

      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee",
      );
    }
  },
);

const initialState = {
  employees: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  perPage: 10,
  filters: {
    status: "all",
    search: "",
    company: "all",
    department: "all",
  },
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.loading = false;

        const apiData = action.payload.data?.data || [];

        state.employees = apiData.map((emp) => ({
          id: emp.id,

          name: [emp.first_name, emp.last_name].filter(Boolean).join(" "),

          status: emp.user?.status === "active" ? "Active" : "Inactive",

          designation: emp.user?.designation?.name || "-",
          department: emp.user?.department?.name || "-",
          company: emp.user?.company?.name || "-",

          raw: emp,
        }));

        // pagination
        state.totalCount = action.payload.data?.total || 0;
        state.currentPage = action.payload.data?.current_page || 1;
        state.perPage = action.payload.data?.per_page || 10;
        state.totalCount = action.payload.total || action.payload.length;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp.id !== action.payload,
        );
        state.totalCount -= 1;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (emp) => emp.id === action.payload.id,
        );
        if (index !== -1) {
          state.employees[index].status = action.payload.status;
        }
      })
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // Update the employee in the employees list if it exists
        const index = state.employees.findIndex(
          (emp) => emp.id === action.payload.id,
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.currentEmployee = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, setPerPage, setFilters, resetFilters } =
  employeeSlice.actions;
export default employeeSlice.reducer;
