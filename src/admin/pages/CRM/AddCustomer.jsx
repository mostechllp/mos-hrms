import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const AddCustomer = () => {
  return (
    <UnderDevelopment pageName='Add customer'/>
  )
}

export default AddCustomer

// // src/admin/pages/crm/AddCustomer.jsx

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Save, Plus, UserPlus, Briefcase, X } from "lucide-react";
// import { showToast } from "../../../components/common/Toast";

// // ------------------------------------------------------------
// // Static option lists
// // ------------------------------------------------------------

// const CUSTOMER_TYPES = ["Individual", "Company"];
// const INDUSTRIES = [
//   "IT Services",
//   "Manufacturing",
//   "Fintech",
//   "Retail",
//   "Aerospace",
//   "Logistics",
//   "Healthcare",
//   "Education",
//   "Real Estate",
//   "Other",
// ];
// const STATUSES = ["Active", "Inactive"];
// const COUNTRIES = ["India", "UAE", "USA", "UK", "Singapore", "Australia"];
// const STATES = [
//   "Maharashtra",
//   "Karnataka",
//   "Gujarat",
//   "Tamil Nadu",
//   "Kerala",
//   "Delhi",
//   "Telangana",
//   "West Bengal",
// ];
// const ACCOUNT_MANAGERS = [
//   { value: "riya", label: "Riya Roy" },
//   { value: "karthik", label: "Karthik Raj" },
//   { value: "aarav", label: "Aarav Mehta" },
// ];
// const PREFERRED_COMM = ["Call", "Email", "WhatsApp", "Other"];
// const CUSTOMER_CATEGORIES = ["Prospect", "Customer", "Partner"];
// const CUSTOMER_SOURCES = ["Referral", "Website", "Sales", "Other"];
// const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Advance"];

// // ------------------------------------------------------------
// // Small UI pieces
// // ------------------------------------------------------------

// const Field = ({ label, required, children, hint }) => (
//   <div>
//     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     {children}
//     {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
//   </div>
// );

// const Input = (props) => (
//   <input
//     {...props}
//     className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//   />
// );

// const Textarea = (props) => (
//   <textarea
//     {...props}
//     className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//   />
// );

// const Select = ({ options, ...props }) => (
//   <select
//     {...props}
//     className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//   >
//     {options.map((o) =>
//       typeof o === "string" ? (
//         <option key={o} value={o}>
//           {o}
//         </option>
//       ) : (
//         <option key={o.value} value={o.value}>
//           {o.label}
//         </option>
//       ),
//     )}
//   </select>
// );

// const Section = ({ title, children }) => (
//   <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
//     <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
//       {title}
//     </h2>
//     {children}
//   </div>
// );

// // ------------------------------------------------------------
// // Component
// // ------------------------------------------------------------

// const AddCustomer = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     // A — Company
//     customerId: "CUS-0007",
//     companyName: "",
//     customerType: "Company",
//     industry: "",
//     registrationNumber: "",
//     taxNumber: "",
//     website: "",
//     status: "Active",
//     customerSince: new Date().toISOString().split("T")[0],
//     assignedTo: "",

//     // B — Address
//     billingAddress: "",
//     shippingAddress: "",
//     city: "",
//     state: "",
//     country: "India",
//     postalCode: "",

//     // C — Primary contact
//     contactName: "",
//     contactDesignation: "",
//     contactEmail: "",
//     contactPhone: "",
//     contactAltPhone: "",
//     preferredComm: "Email",

//     // D — Business
//     category: "Customer",
//     source: "Website",
//     paymentTerms: "Net 30",
//     creditLimit: "",
//     notes: "",
//   });

//   const [submitting, setSubmitting] = useState(false);

//   const update = (field, value) =>
//     setForm((prev) => ({ ...prev, [field]: value }));

//   const validate = () => {
//     if (!form.companyName.trim()) {
//       showToast("Company name is required", "error");
//       return false;
//     }
//     if (!form.contactName.trim()) {
//       showToast("Primary contact name is required", "error");
//       return false;
//     }
//     return true;
//   };

//   const submit = async (afterSave) => {
//     if (!validate()) return;
//     setSubmitting(true);
//     try {
//       // TODO: dispatch(createCustomer(form))
//       console.log("Submitting customer:", form);
//       showToast("Customer saved successfully", "success");
//       if (afterSave) afterSave();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSave = () => submit(() => navigate("/admin/crm/customers"));
//   const handleSaveAndAddContact = () =>
//     submit(() => showToast("Customer saved. Open add contact next.", "success"));
//   const handleSaveAndAddOpportunity = () =>
//     submit(() =>
//       showToast("Customer saved. Open add opportunity next.", "success"),
//     );

//   return (
//     <div className="w-full max-w-5xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Add Customer
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//             Create a new customer record
//           </p>
//         </div>
//       </div>

//       {/* A — Company details */}
//       <Section title="A. Company Details">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Customer ID">
//             <Input
//               value={form.customerId}
//               readOnly
//               disabled
//               className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
//             />
//           </Field>
//           <Field label="Customer Type">
//             <Select
//               value={form.customerType}
//               onChange={(e) => update("customerType", e.target.value)}
//               options={CUSTOMER_TYPES}
//             />
//           </Field>
//           <Field label="Company Name" required>
//             <Input
//               value={form.companyName}
//               onChange={(e) => update("companyName", e.target.value)}
//               placeholder="e.g. Acme Corp"
//             />
//           </Field>
//           <Field label="Industry">
//             <Select
//               value={form.industry}
//               onChange={(e) => update("industry", e.target.value)}
//               options={["", ...INDUSTRIES]}
//             />
//           </Field>
//           <Field label="Company Registration No.">
//             <Input
//               value={form.registrationNumber}
//               onChange={(e) => update("registrationNumber", e.target.value)}
//             />
//           </Field>
//           <Field label="Tax / GST No.">
//             <Input
//               value={form.taxNumber}
//               onChange={(e) => update("taxNumber", e.target.value)}
//             />
//           </Field>
//           <Field label="Website">
//             <Input
//               type="url"
//               value={form.website}
//               onChange={(e) => update("website", e.target.value)}
//               placeholder="https://example.com"
//             />
//           </Field>
//           <Field label="Customer Status">
//             <Select
//               value={form.status}
//               onChange={(e) => update("status", e.target.value)}
//               options={STATUSES}
//             />
//           </Field>
//           <Field label="Customer Since">
//             <Input
//               type="date"
//               value={form.customerSince}
//               onChange={(e) => update("customerSince", e.target.value)}
//             />
//           </Field>
//           <Field label="Assigned Account Manager" required>
//             <Select
//               value={form.assignedTo}
//               onChange={(e) => update("assignedTo", e.target.value)}
//               options={[
//                 { value: "", label: "Select account manager..." },
//                 ...ACCOUNT_MANAGERS,
//               ]}
//             />
//           </Field>
//         </div>
//       </Section>

//       {/* B — Address */}
//       <Section title="B. Address">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="md:col-span-2">
//             <Field label="Billing Address">
//               <Textarea
//                 rows={2}
//                 value={form.billingAddress}
//                 onChange={(e) => update("billingAddress", e.target.value)}
//               />
//             </Field>
//           </div>
//           <div className="md:col-span-2">
//             <Field label="Shipping / Service Address">
//               <Textarea
//                 rows={2}
//                 value={form.shippingAddress}
//                 onChange={(e) => update("shippingAddress", e.target.value)}
//               />
//             </Field>
//           </div>
//           <Field label="City">
//             <Input
//               value={form.city}
//               onChange={(e) => update("city", e.target.value)}
//             />
//           </Field>
//           <Field label="State">
//             <Select
//               value={form.state}
//               onChange={(e) => update("state", e.target.value)}
//               options={["", ...STATES]}
//             />
//           </Field>
//           <Field label="Country">
//             <Select
//               value={form.country}
//               onChange={(e) => update("country", e.target.value)}
//               options={COUNTRIES}
//             />
//           </Field>
//           <Field label="Postal Code">
//             <Input
//               value={form.postalCode}
//               onChange={(e) => update("postalCode", e.target.value)}
//             />
//           </Field>
//         </div>
//       </Section>

//       {/* C — Primary contact */}
//       <Section title="C. Primary Contact">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Contact Person Name" required>
//             <Input
//               value={form.contactName}
//               onChange={(e) => update("contactName", e.target.value)}
//               placeholder="e.g. Ramesh Kumar"
//             />
//           </Field>
//           <Field label="Designation">
//             <Input
//               value={form.contactDesignation}
//               onChange={(e) => update("contactDesignation", e.target.value)}
//               placeholder="e.g. Procurement Manager"
//             />
//           </Field>
//           <Field label="Email">
//             <Input
//               type="email"
//               value={form.contactEmail}
//               onChange={(e) => update("contactEmail", e.target.value)}
//             />
//           </Field>
//           <Field label="Phone">
//             <Input
//               value={form.contactPhone}
//               onChange={(e) => update("contactPhone", e.target.value)}
//             />
//           </Field>
//           <Field label="Alternate Phone">
//             <Input
//               value={form.contactAltPhone}
//               onChange={(e) => update("contactAltPhone", e.target.value)}
//             />
//           </Field>
//           <Field label="Preferred Communication">
//             <Select
//               value={form.preferredComm}
//               onChange={(e) => update("preferredComm", e.target.value)}
//               options={PREFERRED_COMM}
//             />
//           </Field>
//         </div>
//       </Section>

//       {/* D — Business details */}
//       <Section title="D. Business Details">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Field label="Customer Category">
//             <Select
//               value={form.category}
//               onChange={(e) => update("category", e.target.value)}
//               options={CUSTOMER_CATEGORIES}
//             />
//           </Field>
//           <Field label="Customer Source">
//             <Select
//               value={form.source}
//               onChange={(e) => update("source", e.target.value)}
//               options={CUSTOMER_SOURCES}
//             />
//           </Field>
//           <Field label="Payment Terms">
//             <Select
//               value={form.paymentTerms}
//               onChange={(e) => update("paymentTerms", e.target.value)}
//               options={PAYMENT_TERMS}
//             />
//           </Field>
//           <Field label="Credit Limit">
//             <Input
//               type="number"
//               value={form.creditLimit}
//               onChange={(e) => update("creditLimit", e.target.value)}
//               placeholder="0.00"
//             />
//           </Field>
//         </div>
//         <Field label="Notes">
//           <Textarea
//             rows={3}
//             value={form.notes}
//             onChange={(e) => update("notes", e.target.value)}
//             placeholder="Any additional context about this customer..."
//           />
//         </Field>
//       </Section>

//       {/* Actions */}
//       <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           disabled={submitting}
//           className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           <X size={15} /> Cancel
//         </button>
//         <button
//           type="button"
//           onClick={handleSaveAndAddOpportunity}
//           disabled={submitting}
//           className="px-4 py-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           <Briefcase size={15} /> Save & Add Opportunity
//         </button>
//         <button
//           type="button"
//           onClick={handleSaveAndAddContact}
//           disabled={submitting}
//           className="px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           <UserPlus size={15} /> Save & Add Contact
//         </button>
//         <button
//           type="button"
//           onClick={handleSave}
//           disabled={submitting}
//           className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
//         >
//           <Save size={15} /> Save Customer
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddCustomer;