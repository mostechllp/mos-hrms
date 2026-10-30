import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const mockApi = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 500));

export const addProject = createAsyncThunk(
  "projects/addProject",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id: Date.now().toString(), ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const response = await mockApi({ id, ...formData });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await mockApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete project");
    }
  }
);

// Real Static Data
const initialState = {
  projects: [
    {
      id: "p1",
      projectName: "SS",
      projectCode: "PRJ-001",
      customerName: "Mrs. sss www",
      billingMethod: "Hourly Rate Per Project",
      ratePerHour: 22.00,
      description: "Website redesign and maintenance project.",
      budget: {
        costBudget: 50000,
        revenueBudget: 75000,
      },
      users: [
        { id: "u1", name: "Fidha Fathima", email: "fidh3549@gmail.com", role: "Admin" }
      ],
      tasks: [],
      watchlist: true,
      stats: {
        loggedHours: "00:00",
        billableHours: "00:00",
        billedHours: "00:00",
        unbilledHours: "00:00",
      },
      transactions: {
        expenses: [],
        bills: [],
        purchaseOrders: [],
        vendorCredits: [],
        invoices: [],
        quotes: [],
        salesOrders: [],
        creditNotes: [],
      }
    },
    {
      id: "p2",
      projectName: "Acme Mobile App",
      projectCode: "PRJ-002",
      customerName: "Acme Corp",
      billingMethod: "Fixed Cost",
      ratePerHour: 0,
      description: "iOS and Android app development.",
      budget: {
        costBudget: 150000,
        revenueBudget: 250000,
      },
      users: [
        { id: "u1", name: "Fidha Fathima", email: "fidh3549@gmail.com", role: "Admin" },
        { id: "u2", name: "John Doe", email: "john@acme.com", role: "Staff" }
      ],
      tasks: [
        { id: "t1", name: "UI Design", description: "Create Figma mockups", billable: true }
      ],
      watchlist: true,
      stats: {
        loggedHours: "12:30",
        billableHours: "10:00",
        billedHours: "5:00",
        unbilledHours: "2:30",
      },
      transactions: {
        expenses: [{ id: "e1", date: "2026-10-15", account: "Software", amount: 500 }],
        bills: [{ id: "b1", date: "2026-10-20", billNumber: "B-101", vendor: "AWS", amount: 2000, status: "Open" }],
        purchaseOrders: [],
        vendorCredits: [],
        invoices: [{ id: "i1", date: "2026-10-25", invoiceNumber: "INV-001", amount: 5000, status: "Sent" }],
        quotes: [],
        salesOrders: [],
        creditNotes: [],
      }
    }
  ],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.projects[index] = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectsSlice.reducer;