import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Simulate AI resume parsing
export const parseResume = createAsyncThunk(
  "onboarding/parseResume",
  async (file, { rejectWithValue }) => {
    try {
      // Simulate API call delay - reduced for faster feel
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock parsed data
      return {
        fullName: "Johnathan Doe",
        email: "john.doe@example.com",
        phone: "+971 50 123 4567",
        nationality: "United Arab Emirates",
        address: "Downtown Dubai, UAE",
        designation: "Senior Software Engineer",
        department: "Engineering",
        skills: "React, Node.js, AWS, Python",
        experience: "8 Years",
        education: "B.Sc. in Computer Science",
        joiningDate: new Date().toISOString().split('T')[0],
        fileName: file.name
      };
    } catch (error) {
      return rejectWithValue("Failed to parse resume");
    }
  }
);

const initialState = {
  currentStep: 1,
  isLoading: false,
  error: null,
  resumeData: null,
  employeeDetails: {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    address: "",
    designation: "",
    department: "",
    skills: "",
    experience: "",
    education: "",
    joiningDate: "",
  },
  offerLetter: {
    content: "",
    template: "standard",
    generated: false
  },
  onboardingComplete: false
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateEmployeeDetails: (state, action) => {
      state.employeeDetails = { ...state.employeeDetails, ...action.payload };
    },
    updateOfferLetter: (state, action) => {
      state.offerLetter = { ...state.offerLetter, ...action.payload };
    },
    resetOnboarding: (state) => {
      return initialState;
    },
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(parseResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(parseResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumeData = { fileName: action.payload.fileName };
        state.employeeDetails = action.payload;
        state.currentStep = 2; // Auto-move to step 2 after parsing
      })
      .addCase(parseResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setStep, 
  updateEmployeeDetails, 
  updateOfferLetter, 
  resetOnboarding,
  completeOnboarding 
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
