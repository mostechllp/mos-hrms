import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Async Thunks
export const savePayrollStep = createAsyncThunk('payroll/saveStep', async (data) => data);
export const submitPayroll = createAsyncThunk('payroll/submit', async (data) => data);
export const fetchDraftPayroll = createAsyncThunk('payroll/fetchDraft', async () => ({}));
export const calculateSalarySplit = createAsyncThunk('payroll/calculateSplit', async (data) => []);
export const fetchOvertimeData = createAsyncThunk('payroll/fetchOvertime', async () => []);
export const fetchPayrollSummary = createAsyncThunk('payroll/fetchSummary', async () => ({}));
export const fetchEmployeeSalaryPackages = createAsyncThunk('payroll/fetchPackages', async () => []);
export const convertSalary = createAsyncThunk('payroll/convertSalary', async (data) => data);
export const generatePayslip = createAsyncThunk('payroll/generatePayslip', async () => ({}));

// ✅ FIXED: Fetch payroll employees
export const fetchPayrollEmployees = createAsyncThunk(
  'payroll/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/employees');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Fetch employees error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch employees'
      );
    }
  }
);

// ✅ FIXED: Fetch payroll entries - using /admin/payroll with month/year
export const fetchPayrollEntries = createAsyncThunk(
  'payroll/fetchEntries',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      // Use /admin/payroll endpoint with month and year as query parameters
      const response = await apiClient.get('/admin/payroll', {
        params: { 
          month: month,
          year: year 
        }
      });
      
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Fetch payroll entries error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch payroll entries'
      );
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
  // State for employees and entries
  employees: [],
  payrollEntries: [],
  entriesLoading: false,
  employeesLoading: false,
  totalCount: 0,
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
        state.totalCount = Array.isArray(action.payload) ? action.payload.length : 0;
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
        state.totalCount = Array.isArray(action.payload) ? action.payload.length : 0;
      })
      .addCase(fetchPayrollEntries.rejected, (state, action) => {
        state.entriesLoading = false;
        state.error = action.payload || 'Failed to fetch payroll entries';
      });
  },
});

// Actions
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

// ============================================================
// ✅ BASE SELECTORS - Simple direct lookups (not memoized)
// ============================================================
const selectPayrollState = (state) => state.payroll || {};

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

// ✅ SIMPLE selectors - return raw data (no memoization needed)
export const selectEmployees = (state) => state.payroll?.employees || [];
export const selectEmployeesLoading = (state) => state.payroll?.employeesLoading || false;
export const selectPayrollEntries = (state) => state.payroll?.payrollEntries || [];
export const selectEntriesLoading = (state) => state.payroll?.entriesLoading || false;
export const selectPayrollTotalCount = (state) => state.payroll?.totalCount || 0;

// ============================================================
// ✅ MEMOIZED SELECTORS - Use createSelector for derived data
// ============================================================

/**
 * Get employees with full name combined
 * Memoized: Returns same reference if employees array hasn't changed
 */
export const selectEmployeesWithFullName = createSelector(
  [selectEmployees],
  (employees) => {
    return employees.map((emp) => ({
      ...emp,
      fullName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
    }));
  }
);

/**
 * Get payroll entries with calculated net pay
 * Memoized: Returns same reference if entries array hasn't changed
 */
export const selectPayrollEntriesWithCalculations = createSelector(
  [selectPayrollEntries],
  (entries) => {
    return entries.map((entry) => ({
      ...entry,
      netPay: (entry.gross_salary || 0) + (entry.overtime || 0) - (entry.deductions || 0),
    }));
  }
);

/**
 * Get total payroll amount
 * Memoized: Recalculates only if entries change
 */
export const selectTotalPayrollAmount = createSelector(
  [selectPayrollEntries],
  (entries) => {
    return entries.reduce((acc, item) => {
      const salary = item.salary || item.gross_salary || 0;
      return acc + Number(salary);
    }, 0);
  }
);

/**
 * Get pending count
 * Memoized: Recalculates only if entries change
 */
export const selectPendingPayrollCount = createSelector(
  [selectPayrollEntries],
  (entries) => {
    return entries.filter(
      (item) => item.status === 'pending' || !item.status
    ).length;
  }
);

/**
 * Get paid count
 * Memoized: Recalculates only if entries change
 */
export const selectPaidPayrollCount = createSelector(
  [selectPayrollEntries],
  (entries) => {
    return entries.filter((item) => item.status === 'paid').length;
  }
);

/**
 * Get filtered payroll entries
 * Memoized: Returns same reference if entries or filters haven't changed
 */
export const selectFilteredPayrollEntries = createSelector(
  [
    selectPayrollEntries,
    (state, searchTerm, statusFilter) => ({ searchTerm, statusFilter })
  ],
  (entries, filters) => {
    const { searchTerm, statusFilter } = filters;
    
    return entries.filter((item) => {
      const employeeName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const searchMatch = 
        !searchTerm ||
        employeeName.includes(searchTerm.toLowerCase()) ||
        item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && item.status === 'paid') ||
        (statusFilter === 'pending' && (item.status === 'pending' || !item.status));

      return searchMatch && statusMatch;
    });
  }
);

export default payrollSlice.reducer;