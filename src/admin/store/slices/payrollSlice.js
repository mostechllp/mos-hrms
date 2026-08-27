import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

export default payrollSlice.reducer;
