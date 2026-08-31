import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Mock Async Thunks
export const savePayrollStep = createAsyncThunk('payroll/saveStep', async (data) => data);
export const submitPayroll = createAsyncThunk('payroll/submit', async (data) => data);
export const fetchDraftPayroll = createAsyncThunk('payroll/fetchDraft', async () => ({}));
export const calculateSalarySplit = createAsyncThunk('payroll/calculateSplit', async (data) => []);
export const fetchOvertimeData = createAsyncThunk('payroll/fetchOvertime', async () => []);
export const fetchPayrollSummary = createAsyncThunk('payroll/fetchSummary', async () => ({}));
export const fetchEmployeeSalaryPackages = createAsyncThunk('payroll/fetchPackages', async () => []);
export const convertSalary = createAsyncThunk('payroll/convertSalary', async (data) => data);
export const generatePayslip = createAsyncThunk('payroll/generatePayslip', async () => ({}));

// NEW: Fetch payroll employees
export const fetchPayrollEmployees = createAsyncThunk(
  'payroll/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/payroll');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Fetch payroll entries (with month/year filter)
export const fetchPayrollEntries = createAsyncThunk(
  'payroll/fetchEntries',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/admin/payroll/entries?year=${year}&month=${month}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payroll entries');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentStep: 1,
  stepData: {},
  loading: false,
  isSubmitting: false,
  isSaving: false,
  successMessage: null,
  error: null,
  calculatedCountries: [],
  countriesLoading: false,
  overtimeData: [],
  overtimeLoading: false,
  summaryData: null,
  summaryLoading: false,
  employeePackages: [],
  packagesLoading: false,
  // NEW state
  employees: [],
  payrollEntries: [],
  entriesLoading: false,
  employeesLoading: false,
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => { state.currentStep = action.payload; },
    updateStepData: (state, action) => { state.stepData = { ...state.stepData, ...action.payload }; },
    markStepCompleted: (state) => { },
    clearPayrollError: (state) => { state.error = null; },
    clearPayrollSuccess: (state) => { state.successMessage = null; },
    resetPayrollState: () => initialState,
    clearEmployeePackages: (state) => { state.employeePackages = []; },
    clearPayrollEntries: (state) => { state.payrollEntries = []; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchPayrollEmployees.pending, (state) => {
        state.employeesLoading = true;
        state.error = null;
      })
      .addCase(fetchPayrollEmployees.fulfilled, (state, action) => {
        state.employeesLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchPayrollEmployees.rejected, (state, action) => {
        state.employeesLoading = false;
        state.error = action.payload || 'Failed to fetch employees';
      })
      // Fetch Payroll Entries
      .addCase(fetchPayrollEntries.pending, (state) => {
        state.entriesLoading = true;
        state.error = null;
      })
      .addCase(fetchPayrollEntries.fulfilled, (state, action) => {
        state.entriesLoading = false;
        state.payrollEntries = action.payload;
      })
      .addCase(fetchPayrollEntries.rejected, (state, action) => {
        state.entriesLoading = false;
        state.error = action.payload || 'Failed to fetch payroll entries';
      });
  },
});

export const {
  setCurrentStep,
  updateStepData,
  markStepCompleted,
  clearPayrollError,
  clearPayrollSuccess,
  resetPayrollState,
  clearEmployeePackages,
  clearPayrollEntries,
} = payrollSlice.actions;

// Selectors
export const selectCurrentStep = (state) => state.payroll?.currentStep || 1;
export const selectStepData = (state) => state.payroll?.stepData || {};
export const selectPayrollLoading = (state) => state.payroll?.loading || false;
export const selectPayrollIsSubmitting = (state) => state.payroll?.isSubmitting || false;
export const selectPayrollSaving = (state) => state.payroll?.isSaving || false;
export const selectPayrollSuccess = (state) => state.payroll?.successMessage || null;
export const selectPayrollError = (state) => state.payroll?.error || null;
export const selectCalculatedCountries = (state) => state.payroll?.calculatedCountries || [];
export const selectCountriesLoading = (state) => state.payroll?.countriesLoading || false;
export const selectOvertimeData = (state) => state.payroll?.overtimeData || [];
export const selectOvertimeLoading = (state) => state.payroll?.overtimeLoading || false;
export const selectSummaryData = (state) => state.payroll?.summaryData || null;
export const selectSummaryLoading = (state) => state.payroll?.summaryLoading || false;
export const selectEmployeePackages = (state) => state.payroll?.employeePackages || [];
export const selectPackagesLoading = (state) => state.payroll?.packagesLoading || false;
// NEW selectors
export const selectEmployees = (state) => state.payroll?.employees || [];
export const selectEmployeesLoading = (state) => state.payroll?.employeesLoading || false;
export const selectPayrollEntries = (state) => state.payroll?.payrollEntries || [];
export const selectEntriesLoading = (state) => state.payroll?.entriesLoading || false;

export default payrollSlice.reducer;