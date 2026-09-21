import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { parseResumeTextWithAI } from "../../utils/openRouterService";
import { extractTextFromFile } from "../../utils/fileExtractor";
import apiClient from "../../../utils/apiClient";

// Parse AI resume using file extraction and OpenRouter
// Helper: split a full name into { firstName, lastName }
const splitFullName = (full = "") => {
  const parts = String(full).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

export const parseResume = createAsyncThunk(
  "onboarding/parseResume",
  async (file, { rejectWithValue }) => {
    try {
      const text = await extractTextFromFile(file);
      const parsedData = await parseResumeTextWithAI(text);

      // ── Normalize name fields ──
      // The AI may return: fullName, name, firstName/lastName, or first_name/last_name.
      // Make sure we always end up with firstName + lastName.
      const rawFullName =
        parsedData.fullName ||
        parsedData.name ||
        parsedData.full_name ||
        [
          parsedData.firstName || parsedData.first_name,
          parsedData.lastName || parsedData.last_name,
        ]
          .filter(Boolean)
          .join(" ");

      const { firstName, lastName } = splitFullName(rawFullName);

      return {
        ...parsedData,
        firstName:
          parsedData.firstName || parsedData.first_name || firstName || "",
        lastName: parsedData.lastName || parsedData.last_name || lastName || "",
        // keep the full name too, harmless
        fullName: rawFullName || "",
        fileName: file.name,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to parse resume");
    }
  },
);

// ----------------------------------------------------
// Shape converters between the form model and API model
// ----------------------------------------------------

// Form model → API payload
export const toApiPayload = (form = {}) => {
  const special_days = [];
  if (form.specialDayEvent && form.specialDayDate) {
    special_days.push({
      name: form.specialDayEvent,
      date: form.specialDayDate,
    });
  }

  return {
    first_name: (form.firstName || "").trim(),
    last_name: (form.lastName || "").trim(),
    personal_email: form.email || "",
    personal_number: form.phone || "",
    nationality: form.nationality || "",
    address: form.address || "",
    joining_date: form.joiningDate || "",
    experience_level: form.experience || "",
    key_skills: form.skills || "",
    highest_education: form.education || "",

    dob: form.dob || undefined,
    gender: form.gender || undefined,
    marital_status: form.maritalStatus || undefined,

    department_id: form.departmentId ? Number(form.departmentId) : undefined,
    designation_id: form.designationId ? Number(form.designationId) : undefined,

    organization_id: form.organizationId ?? undefined,
    company_id: form.companyId ?? undefined,

    bank_details: form.bankName
      ? [
          {
            bank_country: form.bankCountry || "",
            bank_name: form.bankName || "",
            account_number: form.accountNumber || "",
            iban_number: (form.bankIban || "").replace(/\s/g, ""),
            swift_code: form.bankSwift || "",
            branch_name: form.bankBranch || "",
            ifsc_code: form.bankIfsc || "",
          },
        ]
      : undefined,

    special_days,
  };
};

// API model → form model
export const fromApiResponse = (api = {}) => {
  const user = api.user || {};

  const firstSpecialDay = Array.isArray(api.special_days)
    ? api.special_days[0]
    : null;

  const firstBank = Array.isArray(api.bank_details)
    ? api.bank_details[0]
    : null;

  const apiFullName =
    api.full_name ||
    api.fullName ||
    [api.first_name, api.last_name].filter(Boolean).join(" ");

  const { firstName: derivedFirst, lastName: derivedLast } =
    splitFullName(apiFullName);

  return {
    id: api.id,
    userId: user.id ?? api.user_id ?? null,

    firstName: api.first_name || derivedFirst || "",
    lastName: api.last_name || derivedLast || "",

    email: api.personal_email || api.company_email || "",
    phone: api.personal_number || api.company_mobile_number || "",
    nationality: api.nationality || "",
    address: api.address || "",
    joiningDate: api.joining_date || "",
    experience: api.experience_level || "",
    skills: api.key_skills || "",
    education: api.highest_education || "",

    dob: api.dob || "",
    gender: api.gender || "",
    maritalStatus: api.marital_status || "",

    departmentId:
      user.department_id != null
        ? String(user.department_id)
        : api.department_id != null
          ? String(api.department_id)
          : "",
    designationId:
      user.designation_id != null
        ? String(user.designation_id)
        : api.designation_id != null
          ? String(api.designation_id)
          : "",
    department: user.department?.name || "",
    designation: user.designation?.name || "",

    organizationId: user.organization_id ?? api.organization_id ?? "",
    companyId: user.company_id ?? api.company_id ?? "",

    bankCountry: firstBank?.bank_country || "India",
    bankName: firstBank?.bank_name || "",
    accountNumber: firstBank?.account_number || "",
    bankIfsc: firstBank?.ifsc_code || "",
    bankBranch: firstBank?.branch_name || "",
    bankIban: firstBank?.iban_number || "",
    bankSwift: firstBank?.swift_code || "",

    specialDayEvent: firstSpecialDay?.name || "",
    specialDayDate: firstSpecialDay?.date || "",
  };
};

// ----------------------------------------------------
// EMPLOYEE DETAILS (onboard)
// ----------------------------------------------------

// Fetch details for an onboarding draft / new-hire
// GET /employees/onboard/details/:id?
export const fetchEmployeeDetails = createAsyncThunk(
  "onboarding/fetchEmployeeDetails",
  async (id = null, { rejectWithValue }) => {
    try {
      const url = id
        ? `/admin/employees/onboard/details/${id}`
        : `/admin/employees/onboard/details`;

      const response = await apiClient.get(url);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromApiResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch employee details",
      );
    } catch (error) {
      console.error("Fetch employee details error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee details",
      );
    }
  },
);

export const createEmployeeDetails = createAsyncThunk(
  "onboarding/createEmployeeDetails",
  async ({ id = null, data }, { rejectWithValue }) => {
    try {
      const url = id
        ? `/admin/employees/onboard/details/${id}`
        : `/admin/employees/onboard/details`;

      const payload = toApiPayload(data);
      const response = await apiClient.post(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        // Return BOTH the API response and the friendly form shape
        const apiData = response.data.data ?? response.data;
        return {
          id: apiData.id,
          api: apiData,
          form: fromApiResponse(apiData),
        };
      }
      return rejectWithValue(
        response.data?.message || "Failed to save employee details",
      );
    } catch (error) {
      console.error("Create employee details error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save employee details",
      );
    }
  },
);

export const updateEmployeeDetailsApi = createAsyncThunk(
  "onboarding/updateEmployeeDetailsApi",
  async ({ id = null, data }, { rejectWithValue }) => {
    try {
      const url = id
        ? `/admin/employees/onboard/details/${id}`
        : `/admin/employees/onboard/details`;

      const payload = toApiPayload(data);
      const response = await apiClient.put(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        const apiData = response.data.data ?? response.data;
        return {
          id: apiData.id,
          api: apiData,
          form: fromApiResponse(apiData),
        };
      }
      return rejectWithValue(
        response.data?.message || "Failed to update employee details",
      );
    } catch (error) {
      console.error("Update employee details error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee details",
      );
    }
  },
);

// ----------------------------------------------------
// PROFESSIONAL VERIFICATION
//   Note: the {id} in these endpoints is the USER id,
//   not the employee id.
// ----------------------------------------------------

// Form ↔ API converters
const toVerificationPayload = (form = {}) => ({
  linkedin_url: form.linkedInUrl || "",
  github_url: form.githubUrl || "",
  portfolio_url: form.portfolioUrl || "",
  other_professional_url: form.otherUrl || "",
  identity_verified: Boolean(form.identityVerified),
  credentials_verified: Boolean(form.credentialsVerified),
  employment_info_verified: Boolean(form.employmentInfoVerified),
  verification_notes: form.verificationNotes || "",
});

const fromVerificationResponse = (api = {}) => {
  // The response may nest the data under .verification or be flat
  const v = api.verification || api;
  return {
    linkedInUrl: v.linkedin_url || "",
    githubUrl: v.github_url || "",
    portfolioUrl: v.portfolio_url || "",
    otherUrl: v.other_professional_url || "",
    identityVerified: Boolean(v.identity_verified),
    credentialsVerified: Boolean(v.credentials_verified),
    employmentInfoVerified: Boolean(v.employment_info_verified),
    verificationNotes: v.verification_notes || "",
  };
};

// GET /api/admin/employees/onboard/verification/:id?
export const fetchProfessionalVerification = createAsyncThunk(
  "onboarding/fetchProfessionalVerification",
  async (userId = null, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/verification/${userId}`
        : `/admin/employees/onboard/verification`;

      const response = await apiClient.get(url);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromVerificationResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch professional verification",
      );
    } catch (error) {
      console.error("Fetch verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch professional verification",
      );
    }
  },
);

// POST /api/admin/employees/onboard/verification/:id?
export const createProfessionalVerification = createAsyncThunk(
  "onboarding/createProfessionalVerification",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/verification/${userId}`
        : `/admin/employees/onboard/verification`;

      const payload = toVerificationPayload(data);
      const response = await apiClient.post(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromVerificationResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to save professional verification",
      );
    } catch (error) {
      console.error("Create verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to save professional verification",
      );
    }
  },
);

// PUT /api/admin/employees/onboard/verification/:id?
export const updateProfessionalVerificationApi = createAsyncThunk(
  "onboarding/updateProfessionalVerificationApi",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/verification/${userId}`
        : `/admin/employees/onboard/verification`;

      const payload = toVerificationPayload(data);
      const response = await apiClient.put(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromVerificationResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to update professional verification",
      );
    } catch (error) {
      console.error("Update verification error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update professional verification",
      );
    }
  },
);

// ----------------------------------------------------
// SALARY converters
// ----------------------------------------------------

const toSalaryPayload = (form = {}) => ({
  currency: form.currency || "INR",
  payment_cycle: form.paymentCycle || "Monthly",
  salary_components: Array.isArray(form.salaryComponents)
    ? form.salaryComponents.map((c) => ({
        component_name: c.name,
        value: Number(c.price) || 0,
      }))
    : [],
});

const fromSalaryResponse = (api = {}) => {
  const s = api.salary || api;
  const components = Array.isArray(s.salary_components)
    ? s.salary_components
    : [];
  const total = components.reduce((sum, c) => sum + (Number(c.value) || 0), 0);

  // Derive basic + other from the components (since API doesn't store them)
  let basicSalary = 0;
  let otherAllowance = 0;
  const basicComp = components.find((c) =>
    (c.component_name || "").toLowerCase().includes("basic"),
  );
  if (basicComp) {
    basicSalary = Number(basicComp.value) || 0;
    otherAllowance = components
      .filter((c) => c !== basicComp)
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  } else if (components.length > 0) {
    basicSalary = Number(components[0].value) || 0;
    otherAllowance = components
      .slice(1)
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  }

  return {
    currency: s.currency || "INR",
    paymentCycle: s.payment_cycle || "Monthly",
    totalMonthlySalary: total,
    basicSalary: String(basicSalary),
    otherAllowance: String(otherAllowance),
    salaryComponents: components.map((c, idx) => ({
      id: c.id ?? Date.now() + idx,
      name: c.component_name || "",
      price: Number(c.value) || 0,
    })),
  };
};

// ----------------------------------------------------
// SALARY & COMPONENTS
// ----------------------------------------------------

// GET /api/admin/employees/onboard/salary/:id?
export const fetchSalary = createAsyncThunk(
  "onboarding/fetchSalary",
  async (userId = null, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/salary/${userId}`
        : `/admin/employees/onboard/salary`;

      const response = await apiClient.get(url);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromSalaryResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch salary",
      );
    } catch (error) {
      console.error("Fetch salary error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch salary",
      );
    }
  },
);

// POST /api/admin/employees/onboard/salary/:id?
export const createSalary = createAsyncThunk(
  "onboarding/createSalary",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/salary/${userId}`
        : `/admin/employees/onboard/salary`;

      const payload = toSalaryPayload(data);
      const response = await apiClient.post(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromSalaryResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(response.data?.message || "Failed to save salary");
    } catch (error) {
      console.error("Create salary error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save salary",
      );
    }
  },
);

// PUT /api/admin/employees/onboard/salary/:id?
export const updateSalaryApi = createAsyncThunk(
  "onboarding/updateSalaryApi",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/salary/${userId}`
        : `/admin/employees/onboard/salary`;

      const payload = toSalaryPayload(data);
      const response = await apiClient.put(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromSalaryResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to update salary",
      );
    } catch (error) {
      console.error("Update salary error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update salary",
      );
    }
  },
);

// ----------------------------------------------------
// BANK converters
// ----------------------------------------------------

const toBankPayload = (form = {}) => {
  const accounts = Array.isArray(form.bankAccounts)
    ? form.bankAccounts
    : form.bankName
      ? [/* legacy single-account fallback */]
      : [];

  return {
    bank_details: accounts.map((acc) => ({
      bank_country: acc.bankCountry || "",
      bank_name: acc.bankName || "",
      account_number: acc.accountNumber || "",
      iban_number: (acc.bankIban || "").replace(/\s/g, ""),
      swift_code: acc.bankSwift || "",
      branch_name: acc.bankBranch || "",
      ifsc_code: acc.bankIfsc || "",
    })),
  };
};

const fromBankResponse = (api = {}) => {
  // API may return { bank_details: [...] } or a flat object
  const list = Array.isArray(api.bank_details)
    ? api.bank_details
    : Array.isArray(api.bank_account)
      ? [api.bank_account]
      : api.bank
        ? [api.bank]
        : [api];

  const b = list[0] || {};
  return {
    bankCountry: b.bank_country || "India",
    bankName: b.bank_name || "",
    accountNumber: b.account_number || "",
    bankIfsc: b.ifsc_code || "",
    bankBranch: b.branch_name || "",
    bankIban: b.iban_number || "",
    bankSwift: b.swift_code || "",
  };
};

// ----------------------------------------------------
// BANK ACCOUNTS
// ----------------------------------------------------

// GET /api/admin/employees/onboard/banks/:id?
export const fetchBank = createAsyncThunk(
  "onboarding/fetchBank",
  async (userId = null, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/banks/${userId}`
        : `/admin/employees/onboard/banks`;

      const response = await apiClient.get(url);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromBankResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch bank details",
      );
    } catch (error) {
      console.error("Fetch bank error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bank details",
      );
    }
  },
);

// POST /api/admin/employees/onboard/banks/:id?
export const createBank = createAsyncThunk(
  "onboarding/createBank",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/banks/${userId}`
        : `/admin/employees/onboard/banks`;

      const payload = toBankPayload(data);
      const response = await apiClient.post(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromBankResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to save bank details",
      );
    } catch (error) {
      console.error("Create bank error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save bank details",
      );
    }
  },
);

// PUT /api/admin/employees/onboard/banks/:id?
export const updateBankApi = createAsyncThunk(
  "onboarding/updateBankApi",
  async ({ userId = null, data }, { rejectWithValue }) => {
    try {
      const url = userId
        ? `/admin/employees/onboard/banks/${userId}`
        : `/admin/employees/onboard/banks`;

      const payload = toBankPayload(data);
      const response = await apiClient.put(url, payload);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromBankResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to update bank details",
      );
    } catch (error) {
      console.error("Update bank error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update bank details",
      );
    }
  },
);

// ----------------------------------------------------
// PRE-ONBOARDING CHECKLIST converters
// ----------------------------------------------------

const toChecklistPayload = (form = {}) => {
  const hr = form.hrTasks || {};
  const it = form.itTasks || {};
  const waPersonal = form.whatsappGroups?.personal || {};
  const waTeam = form.whatsappGroups?.team || {};
  const welcome = form.welcomeAnnouncement || {};
  const meet = form.googleMeet || {};

  return {
    hr_emp_info_completed: Boolean(hr.infoCompleted),
    hr_id_proof_verified: Boolean(hr.idVerified),
    hr_academic_cert_verified: Boolean(hr.academicVerified),
    hr_employment_ref_verified: Boolean(hr.referenceVerified),
    hr_all_docs_verified: Boolean(hr.documentsVerified),
    hr_offer_letter_generated: Boolean(hr.offerGenerated),
    hr_offer_letter_sent: Boolean(hr.offerSent),
    hr_offer_letter_accepted: Boolean(hr.offerAccepted),

    it_company_email_created: Boolean(it.emailCreated),
    it_hrms_account_created: Boolean(it.hrmsCreated),
    it_system_access_created: Boolean(it.systemAccess),
    it_software_configured: Boolean(it.softwareConfigured),

    wa_personal_added: Boolean(waPersonal.added),
    wa_personal_added_date: waPersonal.addedDate || "",
    wa_personal_added_by: waPersonal.addedBy || "",

    wa_team_added: Boolean(waTeam.added),
    wa_team_added_date: waTeam.addedDate || "",
    wa_team_added_by: waTeam.addedBy || "",

    welcome_poster_published: Boolean(welcome.published),
    welcome_poster_published_date: welcome.publishedDate || "",
    welcome_poster_published_by: welcome.publishedBy || "",

    meet_date: meet.meetingDate || "",
    meet_time: meet.meetingTime || "",
    meet_link: meet.meetLink || "",
    meet_calendar_invite_sent: Boolean(meet.calendarInviteSent),
    meet_completed: Boolean(meet.meetingCompleted),
  };
};

// Helper: ISO 8601 → "YYYY-MM-DD" (what DateInput expects)
const toDateOnly = (value) => {
  if (!value) return "";
  const str = String(value);
  // Already YYYY-MM-DD?
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // ISO datetime → take date part
  const d = new Date(str);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const fromChecklistResponse = (api = {}) => {
  const c = api.checklist || api;
  return {
    hrTasks: {
      infoCompleted: Boolean(c.hr_emp_info_completed),
      idVerified: Boolean(c.hr_id_proof_verified),
      academicVerified: Boolean(c.hr_academic_cert_verified),
      referenceVerified: Boolean(c.hr_employment_ref_verified),
      documentsVerified: Boolean(c.hr_all_docs_verified),
      offerGenerated: Boolean(c.hr_offer_letter_generated),
      offerSent: Boolean(c.hr_offer_letter_sent),
      offerAccepted: Boolean(c.hr_offer_letter_accepted),
    },
    itTasks: {
      emailCreated: Boolean(c.it_company_email_created),
      hrmsCreated: Boolean(c.it_hrms_account_created),
      systemAccess: Boolean(c.it_system_access_created),
      softwareConfigured: Boolean(c.it_software_configured),
    },
    whatsappGroups: {
      personal: {
        added: Boolean(c.wa_personal_added),
        addedDate: toDateOnly(c.wa_personal_added_date),
        addedBy: c.wa_personal_added_by || "",
      },
      team: {
        added: Boolean(c.wa_team_added),
        addedDate: toDateOnly(c.wa_team_added_date),
        addedBy: c.wa_team_added_by || "",
      },
    },
    welcomeAnnouncement: {
      published: Boolean(c.welcome_poster_published),
      publishedDate: toDateOnly(c.welcome_poster_published_date),
      publishedBy: c.welcome_poster_published_by || "",
    },
    googleMeet: {
      meetingDate: toDateOnly(c.meet_date),
      meetingTime: c.meet_time || "",
      meetLink: c.meet_link || "",
      calendarInviteSent: Boolean(c.meet_calendar_invite_sent),
      meetingCompleted: Boolean(c.meet_completed),
      completedDate: toDateOnly(c.meet_completed_date),
    },
  };
};

// ----------------------------------------------------
// PRE-ONBOARDING CHECKLIST
// ----------------------------------------------------

// GET /api/admin/employees/onboard/checklist/:id
export const fetchChecklist = createAsyncThunk(
  "onboarding/fetchChecklist",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue("Missing user id for checklist fetch");
      }

      const response = await apiClient.get(
        `/admin/employees/onboard/checklist/${userId}`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromChecklistResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch checklist",
      );
    } catch (error) {
      console.error("Fetch checklist error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch checklist",
      );
    }
  },
);

// POST /api/admin/employees/onboard/checklist/:id
export const saveChecklist = createAsyncThunk(
  "onboarding/saveChecklist",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue("Missing user id for checklist save");
      }

      const payload = toChecklistPayload(data);
      const response = await apiClient.post(
        `/admin/employees/onboard/checklist/${userId}`,
        payload,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return fromChecklistResponse(response.data.data ?? response.data);
      }
      return rejectWithValue(
        response.data?.message || "Failed to save checklist",
      );
    } catch (error) {
      console.error("Save checklist error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save checklist",
      );
    }
  },
);

// ----------------------------------------------------
// COMPLETE ONBOARDING
// POST /api/admin/employees/onboard/complete/:id
// ----------------------------------------------------
export const completeOnboardingApi = createAsyncThunk(
  "onboarding/completeOnboardingApi",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Missing id for onboarding completion");
      }

      const response = await apiClient.post(
        `/admin/employees/onboard/complete/${id}`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ?? response.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to complete onboarding",
      );
    } catch (error) {
      console.error("Complete onboarding error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete onboarding",
      );
    }
  },
);

// ----------------------------------------------------
// ONBOARDING PROGRESS
// GET /api/admin/employees/onboard/progress/:id
// ----------------------------------------------------
export const fetchOnboardingProgress = createAsyncThunk(
  "onboarding/fetchOnboardingProgress",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Missing id for onboarding progress");
      }

      const response = await apiClient.get(
        `/admin/employees/onboard/progress/${id}`,
      );

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return response.data.data ?? response.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to fetch onboarding progress",
      );
    } catch (error) {
      console.error("Fetch onboarding progress error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch onboarding progress",
      );
    }
  },
);

// ----------------------------------------------------
// DELETE ONBOARDING EMPLOYEE
// DELETE /api/admin/employees/{id}
// ----------------------------------------------------
export const deleteOnboardingEmployee = createAsyncThunk(
  "onboarding/deleteOnboardingEmployee",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Missing id for delete");
      }

      const response = await apiClient.delete(`/admin/employees/${id}`);

      if (
        response.data &&
        (response.data.status === "success" || response.data.success === true)
      ) {
        return { id };
      }
      return rejectWithValue(
        response.data?.message || "Failed to delete employee",
      );
    } catch (error) {
      console.error("Delete employee error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee",
      );
    }
  },
);

const initialState = {
  currentStep: 1,
  isLoading: false,
  error: null,
  resumeData: null,
  detailsId: null,
  detailsSaving: false,
  detailsError: null,

  verificationSaving: false,
  verificationLoading: false,
  verificationError: null,
  verificationId: null,
  verificationExists: false,

  salarySaving: false,
  salaryLoading: false,
  salaryError: null,
  salaryId: null,
  salaryExists: false,

  bankSaving: false,
  bankLoading: false,
  bankError: null,
  bankExists: false,

  checklistSaving: false,
  checklistLoading: false,
  checklistError: null,
  checklistExists: false,

  employeeDetails: {
    firstName: "",
    lastName: "",
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
    basicSalary: "",
    otherAllowance: "",
    totalMonthlySalary: 0,
    paymentCycle: "Monthly",
    bankName: "",
    accountNumber: "",
    specialDayEvent: "",
    specialDayDate: "",
  },
  offerLetter: {
    content: "",
    template: "standard",
    generated: false,
  },
  preOnboardingChecklist: {
    hrTasks: {
      infoCompleted: false,
      idVerified: false,
      academicVerified: false,
      referenceVerified: false,
      documentsVerified: false,
      offerGenerated: false,
      offerSent: false,
      offerAccepted: false,
    },
    itTasks: {
      emailCreated: false,
      hrmsCreated: false,
      systemAccess: false,
      softwareConfigured: false,
    },
    whatsappGroups: {
      personal: {
        added: false,
        addedDate: "",
        addedBy: "",
      },
      team: {
        added: false,
        addedDate: "",
        addedBy: "",
      },
    },
    welcomeAnnouncement: {
      published: false,
      publishedDate: "",
      publishedBy: "",
    },
    googleMeet: {
      meetingDate: "",
      meetingTime: "",
      meetLink: "",
      calendarInviteSent: false,
      meetingCompleted: false,
      completedDate: "",
    },
  },
  professionalVerification: {
    linkedInUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    otherUrl: "",
    identityVerified: false,
    credentialsVerified: false,
    employmentInfoVerified: false,
    verificationNotes: "",
  },
  onboardingComplete: false,

  onboardingSubmitting: false,
  onboardingSubmitError: null,

  progressLoading: false,
  progressError: null,
  onboardingProgress: {
    employeeId: null,
    employeeName: "",
    status: "",
    percentage: 0,
    completedSteps: 0,
    totalSteps: 6,
    steps: [],
  },

  deleteLoading: false,
  deleteError: null,
  deleteSuccessId: null,
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
    updatePreOnboardingChecklist: (state, action) => {
      const { section, data } = action.payload;
      if (section) {
        state.preOnboardingChecklist[section] = {
          ...state.preOnboardingChecklist[section],
          ...data,
        };
      } else {
        state.preOnboardingChecklist = {
          ...state.preOnboardingChecklist,
          ...action.payload,
        };
      }
    },
    updateProfessionalVerification: (state, action) => {
      state.professionalVerification = {
        ...state.professionalVerification,
        ...action.payload,
      };
    },
    resetOnboarding: () => {
      return initialState;
    },
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
    },
    restoreDraft: (state, action) => {
      return { ...state, ...action.payload };
    },
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
        state.employeeDetails = {
          ...state.employeeDetails, // keep any previously-known split names
          ...action.payload, // overlay the AI-parsed values
        };
        state.currentStep = 2;
      })
      .addCase(parseResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Employee Details
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.isLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload is already the form-shaped object
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
        state.detailsId = action.payload.id ?? state.detailsId;
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.detailsError = action.payload;
      })

      // Create Employee Details
      .addCase(createEmployeeDetails.pending, (state) => {
        state.detailsSaving = true;
        state.detailsError = null;
      })
      .addCase(createEmployeeDetails.fulfilled, (state, action) => {
        state.detailsSaving = false;
        if (action.payload?.id) state.detailsId = action.payload.id;
        if (action.payload?.form) {
          state.employeeDetails = {
            ...state.employeeDetails,
            ...action.payload.form,
          };
        }
      })
      .addCase(createEmployeeDetails.rejected, (state, action) => {
        state.detailsSaving = false;
        state.detailsError = action.payload;
      })

      // Update Employee Details
      .addCase(updateEmployeeDetailsApi.pending, (state) => {
        state.detailsSaving = true;
        state.detailsError = null;
      })
      .addCase(updateEmployeeDetailsApi.fulfilled, (state, action) => {
        state.detailsSaving = false;
        if (action.payload?.id) state.detailsId = action.payload.id;
        if (action.payload?.form) {
          state.employeeDetails = {
            ...state.employeeDetails,
            ...action.payload.form,
          };
        }
      })
      .addCase(updateEmployeeDetailsApi.rejected, (state, action) => {
        state.detailsSaving = false;
        state.detailsError = action.payload;
      })
      // Fetch Professional Verification
      .addCase(fetchProfessionalVerification.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(fetchProfessionalVerification.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.professionalVerification = {
          ...state.professionalVerification,
          ...action.payload,
        };
        state.verificationExists = true;
      })
      .addCase(fetchProfessionalVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationExists = false;
        state.verificationError = action.payload;
      })

      // Create Professional Verification
      .addCase(createProfessionalVerification.pending, (state) => {
        state.verificationSaving = true;
        state.verificationError = null;
      })
      .addCase(createProfessionalVerification.fulfilled, (state, action) => {
        state.verificationSaving = false;
        state.verificationExists = true;
        state.professionalVerification = {
          ...state.professionalVerification,
          ...action.payload,
        };
      })
      .addCase(createProfessionalVerification.rejected, (state, action) => {
        state.verificationSaving = false;
        state.verificationError = action.payload;
      })

      // Update Professional Verification
      .addCase(updateProfessionalVerificationApi.pending, (state) => {
        state.verificationSaving = true;
        state.verificationError = null;
      })
      .addCase(updateProfessionalVerificationApi.fulfilled, (state, action) => {
        state.verificationSaving = false;
        state.verificationExists = true;
        state.professionalVerification = {
          ...state.professionalVerification,
          ...action.payload,
        };
      })
      .addCase(updateProfessionalVerificationApi.rejected, (state, action) => {
        state.verificationSaving = false;
        state.verificationError = action.payload;
      })
      // Fetch Salary
      .addCase(fetchSalary.pending, (state) => {
        state.salaryLoading = true;
        state.salaryError = null;
      })
      .addCase(fetchSalary.fulfilled, (state, action) => {
        state.salaryLoading = false;
        state.salaryExists = true;
        state.salaryId = state.salaryId; // unchanged
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(fetchSalary.rejected, (state, action) => {
        state.salaryLoading = false;
        state.salaryExists = false;
        state.salaryError = action.payload;
      })

      // Create Salary
      .addCase(createSalary.pending, (state) => {
        state.salarySaving = true;
        state.salaryError = null;
      })
      .addCase(createSalary.fulfilled, (state, action) => {
        state.salarySaving = false;
        state.salaryExists = true;
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(createSalary.rejected, (state, action) => {
        state.salarySaving = false;
        state.salaryError = action.payload;
      })

      // Update Salary
      .addCase(updateSalaryApi.pending, (state) => {
        state.salarySaving = true;
        state.salaryError = null;
      })
      .addCase(updateSalaryApi.fulfilled, (state, action) => {
        state.salarySaving = false;
        state.salaryExists = true;
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(updateSalaryApi.rejected, (state, action) => {
        state.salarySaving = false;
        state.salaryError = action.payload;
      })
      // Fetch Bank
      .addCase(fetchBank.pending, (state) => {
        state.bankLoading = true;
        state.bankError = null;
      })
      .addCase(fetchBank.fulfilled, (state, action) => {
        state.bankLoading = false;
        state.bankExists = true;
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(fetchBank.rejected, (state, action) => {
        state.bankLoading = false;
        state.bankExists = false;
        state.bankError = action.payload;
      })

      // Create Bank
      .addCase(createBank.pending, (state) => {
        state.bankSaving = true;
        state.bankError = null;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.bankSaving = false;
        state.bankExists = true;
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(createBank.rejected, (state, action) => {
        state.bankSaving = false;
        state.bankError = action.payload;
      })

      // Update Bank
      .addCase(updateBankApi.pending, (state) => {
        state.bankSaving = true;
        state.bankError = null;
      })
      .addCase(updateBankApi.fulfilled, (state, action) => {
        state.bankSaving = false;
        state.bankExists = true;
        state.employeeDetails = {
          ...state.employeeDetails,
          ...action.payload,
        };
      })
      .addCase(updateBankApi.rejected, (state, action) => {
        state.bankSaving = false;
        state.bankError = action.payload;
      })
      // Fetch Checklist
      .addCase(fetchChecklist.pending, (state) => {
        state.checklistLoading = true;
        state.checklistError = null;
      })
      .addCase(fetchChecklist.fulfilled, (state, action) => {
        state.checklistLoading = false;
        state.checklistExists = true;
        state.preOnboardingChecklist = {
          ...state.preOnboardingChecklist,
          ...action.payload,
        };
      })
      .addCase(fetchChecklist.rejected, (state, action) => {
        state.checklistLoading = false;
        state.checklistExists = false;
        state.checklistError = action.payload;
      })

      // Save Checklist
      .addCase(saveChecklist.pending, (state) => {
        state.checklistSaving = true;
        state.checklistError = null;
      })
      .addCase(saveChecklist.fulfilled, (state, action) => {
        state.checklistSaving = false;
        state.checklistExists = true;
        state.preOnboardingChecklist = {
          ...state.preOnboardingChecklist,
          ...action.payload,
        };
      })
      .addCase(saveChecklist.rejected, (state, action) => {
        state.checklistSaving = false;
        state.checklistError = action.payload;
      })
      // Complete Onboarding
      .addCase(completeOnboardingApi.pending, (state) => {
        state.onboardingSubmitting = true;
        state.onboardingSubmitError = null;
      })
      .addCase(completeOnboardingApi.fulfilled, (state) => {
        state.onboardingSubmitting = false;
        state.onboardingComplete = true;
      })
      .addCase(completeOnboardingApi.rejected, (state, action) => {
        state.onboardingSubmitting = false;
        state.onboardingSubmitError = action.payload;
      })
      // Onboarding Progress
      .addCase(fetchOnboardingProgress.pending, (state) => {
        state.progressLoading = true;
        state.progressError = null;
      })
      .addCase(fetchOnboardingProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        const p = action.payload || {};
        state.onboardingProgress = {
          employeeId: p.employee_id ?? null,
          employeeName: p.employee_name ?? "",
          status: p.status ?? "",
          percentage: Number(p.percentage) || 0,
          completedSteps: Number(p.completed_steps) || 0,
          totalSteps: Number(p.total_steps) || 6,
          steps: Array.isArray(p.steps) ? p.steps : [],
        };
      })
      .addCase(fetchOnboardingProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.progressError = action.payload;
      })
      // Delete Onboarding Employee
      .addCase(deleteOnboardingEmployee.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccessId = null;
      })
      .addCase(deleteOnboardingEmployee.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccessId = action.payload?.id ?? null;
      })
      .addCase(deleteOnboardingEmployee.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const {
  setStep,
  updateEmployeeDetails,
  updateOfferLetter,
  updatePreOnboardingChecklist,
  updateProfessionalVerification,
  resetOnboarding,
  completeOnboarding,
  restoreDraft,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
