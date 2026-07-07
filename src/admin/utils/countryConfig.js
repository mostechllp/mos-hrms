// src/admin/utils/countryConfig.js

export const countryConfigs = {
  UAE: {
    showUAE: true,
    showIndia: false,
    showVisa: true,
    showEmiratesID: true,
    showLabor: true,
    showNationality: true,
    showSkilledUnskilled: true,
    showPassport: true,
    showAadhaar: false,
    showVoterID: false,
    showDrivingLicense: false,
    showPANCard: false,
    passportRequired: true,
    identityDocuments: [],
    documents: {
      visa: true,
      labor_card: true,
      labor_contract: true,
      eid_1st_page: true,
      eid_2nd_page: true,
      passport_1st_page: true,
      passport_2nd_page: true,
      passport_outer_page: true,
      passport_id_page: true,
    },
    companyTypes: [
      { value: "llp", label: "LLP" },
      { value: "private_limited", label: "Private Limited (Pvt. Ltd.)" },
      { value: "proprietorship", label: "Proprietorship / Company" },
      { value: "freezone_llc", label: "Freezone LLC" },
      { value: "onshore_llc", label: "Onshore LLC" },
    ],
  },
  India: {
    showUAE: false,
    showIndia: true,
    showVisa: false,
    showEmiratesID: false,
    showLabor: false,
    showNationality: false,
    showSkilledUnskilled: false,
    showPassport: false,
    showAadhaar: true,
    showVoterID: true,
    showDrivingLicense: true,
    showPANCard: true,
    passportRequired: false,
    identityDocuments: [
      { key: "aadhaar_card", label: "Aadhaar Card", required: true, icon: "fas fa-id-card" },
      { key: "pan_card", label: "PAN Card", required: true, icon: "fas fa-file-invoice" },
      { key: "voter_id", label: "Voter ID", required: false, icon: "fas fa-vote-yea" },
      { key: "driving_license", label: "Driving License", required: false, icon: "fas fa-id-card" },
      { key: "passport_india", label: "Passport (Optional)", required: false, icon: "fas fa-passport" },
    ],
    documents: {
      aadhaar: true,
      pan: true,
      voter_id: true,
      driving_license: true,
      passport_india: true,
    },
    companyTypes: [
      { value: "llp", label: "LLP" },
      { value: "private_limited", label: "Private Limited (Pvt. Ltd.)" },
      { value: "proprietorship", label: "Proprietorship / Company" },
      { value: "public_limited", label: "Public Limited (Ltd.)" },
      { value: "one_person_company", label: "One Person Company (OPC)" },
      { value: "partnership", label: "Partnership" },
    ],
  },
};

export const getCountryConfig = (country) => {
  return countryConfigs[country] || countryConfigs.UAE;
};

export const INDIA_EMPLOYEE_TYPES = ["Indian", "Nepali", "Bangladeshi", "Pakistani", "Sri Lankan", "Other"];
export const UAE_EMPLOYEE_TYPES = ["Indian", "Nepali", "Bangladeshi", "Pakistani", "Sri Lankan", "Filipino", "Other"];

export const INDIA_MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];
export const UAE_MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];