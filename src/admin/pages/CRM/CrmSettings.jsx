import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const CrmSettings = () => {
  return (
    <UnderDevelopment pageName='CRM Settings'/>
  )
}

export default CrmSettings

// // src/admin/pages/crm/CrmSettings.jsx

// import { useMemo, useState } from "react";
// import {
//   Plus,
//   Trash2,
//   Pencil,
//   Check,
//   X,
//   Save,
//   GripVertical,
//   UserCog,
//   Target,
//   Building2,
//   Activity,
//   Package,
//   Shield,
//   Bell,
//   Settings as SettingsIcon,
//   Search,
// } from "lucide-react";
// import { showToast } from "../../../components/common/Toast";

// // ============================================================
// // STATIC DEFAULTS — replace with API later
// // ============================================================

// const INITIAL_SETTINGS = {
//   leadStatuses: [
//     { id: 1, name: "New", color: "#3b82f6", isDefault: true },
//     { id: 2, name: "Contacted", color: "#f59e0b" },
//     { id: 3, name: "Qualified", color: "#10b981" },
//     { id: 4, name: "Unqualified", color: "#6b7280" },
//     { id: 5, name: "Converted", color: "#8b5cf6" },
//   ],
//   leadSources: [
//     { id: 1, name: "Website" },
//     { id: 2, name: "Referral" },
//     { id: 3, name: "Social Media" },
//     { id: 4, name: "Phone" },
//     { id: 5, name: "Email" },
//     { id: 6, name: "Exhibition" },
//     { id: 7, name: "Manual Entry" },
//     { id: 8, name: "Other" },
//   ],
//   leadPriorities: [
//     { id: 1, name: "Low", color: "#10b981" },
//     { id: 2, name: "Medium", color: "#f59e0b" },
//     { id: 3, name: "High", color: "#ef4444" },
//   ],
//   qualificationRules: [
//     { id: 1, rule: "Budget confirmed", enabled: true },
//     { id: 2, rule: "Decision maker identified", enabled: true },
//     { id: 3, rule: "Requirement documented", enabled: true },
//     { id: 4, rule: "Timeline within 6 months", enabled: false },
//     { id: 5, rule: "Authority / signing power confirmed", enabled: false },
//   ],
//   opportunityStages: [
//     { id: 1, name: "New", order: 1, defaultProbability: 20, color: "#3b82f6" },
//     { id: 2, name: "Qualified", order: 2, defaultProbability: 40, color: "#6366f1" },
//     { id: 3, name: "Proposal Sent", order: 3, defaultProbability: 60, color: "#8b5cf6" },
//     { id: 4, name: "Negotiation", order: 4, defaultProbability: 75, color: "#f59e0b" },
//     { id: 5, name: "Won", order: 5, defaultProbability: 100, color: "#10b981" },
//     { id: 6, name: "Lost", order: 6, defaultProbability: 0, color: "#ef4444" },
//   ],
//   lostReasons: [
//     { id: 1, name: "Price too high" },
//     { id: 2, name: "Lost to competitor" },
//     { id: 3, name: "No budget" },
//     { id: 4, name: "Timing not right" },
//     { id: 5, name: "No decision" },
//     { id: 6, name: "Product fit" },
//   ],
//   winReasons: [
//     { id: 1, name: "Best price" },
//     { id: 2, name: "Better product fit" },
//     { id: 3, name: "Existing relationship" },
//     { id: 4, name: "Faster implementation" },
//     { id: 5, name: "Strong support" },
//   ],
//   opportunityTypes: [
//     { id: 1, name: "New Business" },
//     { id: 2, name: "Upsell" },
//     { id: 3, name: "Cross-sell" },
//     { id: 4, name: "Renewal" },
//   ],
//   customerCategories: [
//     { id: 1, name: "Prospect" },
//     { id: 2, name: "Customer" },
//     { id: 3, name: "Partner" },
//   ],
//   industries: [
//     { id: 1, name: "IT Services" },
//     { id: 2, name: "Manufacturing" },
//     { id: 3, name: "Fintech" },
//     { id: 4, name: "Retail" },
//     { id: 5, name: "Logistics" },
//     { id: 6, name: "Healthcare" },
//     { id: 7, name: "Aerospace" },
//     { id: 8, name: "Education" },
//     { id: 9, name: "Real Estate" },
//   ],
//   customerStatuses: [
//     { id: 1, name: "Active", color: "#10b981" },
//     { id: 2, name: "Inactive", color: "#6b7280" },
//   ],
//   customerTypes: [
//     { id: 1, name: "Individual" },
//     { id: 2, name: "Company" },
//   ],
//   activityTypes: [
//     { id: 1, name: "Call" },
//     { id: 2, name: "Email" },
//     { id: 3, name: "Meeting" },
//     { id: 4, name: "Task" },
//     { id: 5, name: "Site Visit" },
//   ],
//   reminderOptions: [
//     { id: 1, name: "None", minutes: 0 },
//     { id: 2, name: "15 min", minutes: 15 },
//     { id: 3, name: "1 hour", minutes: 60 },
//     { id: 4, name: "1 day", minutes: 1440 },
//   ],
//   priorityValues: [
//     { id: 1, name: "Low", color: "#10b981" },
//     { id: 2, name: "Medium", color: "#f59e0b" },
//     { id: 3, name: "High", color: "#ef4444" },
//   ],
//   defaultActivityDuration: "60", // minutes

//   productCategories: [
//     { id: 1, name: "Human Resources" },
//     { id: 2, name: "Sales" },
//     { id: 3, name: "Enterprise" },
//     { id: 4, name: "Marketing" },
//     { id: 5, name: "Subscription" },
//     { id: 6, name: "Support" },
//     { id: 7, name: "Hardware" },
//     { id: 8, name: "Other" },
//   ],
//   units: [
//     { id: 1, name: "Unit" },
//     { id: 2, name: "License" },
//     { id: 3, name: "Project" },
//     { id: 4, name: "User/Month" },
//     { id: 5, name: "Month" },
//     { id: 6, name: "Year" },
//     { id: 7, name: "Hour" },
//     { id: 8, name: "Day" },
//   ],
//   currencies: [
//     { id: 1, code: "INR", symbol: "₹", isDefault: true },
//     { id: 2, code: "USD", symbol: "$" },
//     { id: 3, code: "AED", symbol: "AED" },
//     { id: 4, code: "GBP", symbol: "£" },
//   ],
//   taxSettings: [
//     { id: 1, name: "GST 18%", rate: 18, isDefault: true },
//     { id: 2, name: "GST 12%", rate: 12 },
//     { id: 3, name: "GST 5%", rate: 5 },
//     { id: 4, name: "Exempt", rate: 0 },
//   ],

//   permissions: {
//     viewAllCustomers: ["Super Admin", "Admin", "Sales Manager"],
//     createLeads: ["Super Admin", "Admin", "Sales Manager", "Salesperson"],
//     assignLeads: ["Super Admin", "Admin", "Sales Manager"],
//     deleteCustomers: ["Super Admin", "Admin"],
//     editQuotations: ["Super Admin", "Admin", "Sales Manager"],
//     viewSalesReports: ["Super Admin", "Admin", "Sales Manager", "Salesperson"],
//     changeOpportunityStage: [
//       "Super Admin",
//       "Admin",
//       "Sales Manager",
//       "Salesperson",
//     ],
//   },

//   notifications: {
//     followUpReminders: true,
//     overdueActivityAlerts: true,
//     leadAssignment: true,
//     quotationStatus: false,
//     opportunityStageChange: true,
//   },
// };

// const ALL_ROLES = [
//   "Super Admin",
//   "Admin",
//   "Sales Manager",
//   "Salesperson",
//   "Support",
// ];

// // ============================================================
// // SECTION TABS
// // ============================================================

// const SECTIONS = [
//   { key: "lead", label: "Lead Settings", icon: Target },
//   { key: "opportunity", label: "Opportunity Settings", icon: GripVertical },
//   { key: "customer", label: "Customer Settings", icon: Building2 },
//   { key: "activity", label: "Activity Settings", icon: Activity },
//   { key: "product", label: "Product Settings", icon: Package },
//   { key: "permissions", label: "CRM Permissions", icon: Shield },
//   { key: "notifications", label: "Notification Settings", icon: Bell },
// ];

// // ============================================================
// // MAIN COMPONENT
// // ============================================================

// const CrmSettings = () => {
//   const [activeSection, setActiveSection] = useState("lead");
//   const [settings, setSettings] = useState(INITIAL_SETTINGS);
//   const [sidebarSearch, setSidebarSearch] = useState("");

//   const updateSetting = (key, value) =>
//     setSettings((s) => ({ ...s, [key]: value }));

//   const handleSaveAll = () => {
//     // TODO: dispatch(saveCrmSettings(settings))
//     console.log("Save settings:", settings);
//     showToast("CRM settings saved successfully", "success");
//   };

//   const filteredSections = useMemo(() => {
//     if (!sidebarSearch.trim()) return SECTIONS;
//     const q = sidebarSearch.toLowerCase();
//     return SECTIONS.filter((s) => s.label.toLowerCase().includes(q));
//   }, [sidebarSearch]);

//   return (
//     <div className="w-full space-y-6">
//       {/* ---------- Header ---------- */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//             <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//           </div>
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//               CRM Settings
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//               Configure lists, workflows, and defaults used across CRM forms
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={handleSaveAll}
//           className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
//         >
//           <Save size={15} /> Save Changes
//         </button>
//       </div>

//       {/* ---------- Two-column layout ---------- */}
//       <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
//         {/* Sidebar */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 h-fit lg:sticky lg:top-4">
//           <div className="relative mb-3">
//             <Search
//               size={14}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />
//             <input
//               value={sidebarSearch}
//               onChange={(e) => setSidebarSearch(e.target.value)}
//               placeholder="Search sections..."
//               className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
//             />
//           </div>
//           <div className="space-y-1">
//             {filteredSections.map((sec) => {
//               const Icon = sec.icon;
//               const active = activeSection === sec.key;
//               return (
//                 <button
//                   key={sec.key}
//                   onClick={() => setActiveSection(sec.key)}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition-colors ${
//                     active
//                       ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
//                       : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"
//                   }`}
//                 >
//                   <Icon size={15} />
//                   <span className="truncate">{sec.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="min-w-0 space-y-4">
//           {activeSection === "lead" && (
//             <LeadSettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "opportunity" && (
//             <OpportunitySettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "customer" && (
//             <CustomerSettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "activity" && (
//             <ActivitySettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "product" && (
//             <ProductSettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "permissions" && (
//             <PermissionSettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//           {activeSection === "notifications" && (
//             <NotificationSettings
//               settings={settings}
//               updateSetting={updateSetting}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================
// // SHARED UI PRIMITIVES
// // ============================================================

// const SettingsCard = ({ title, description, action, children }) => (
//   <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
//     <div className="flex items-start justify-between gap-3 mb-4">
//       <div>
//         <h3 className="text-base font-bold text-gray-900 dark:text-white">
//           {title}
//         </h3>
//         {description && (
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//             {description}
//           </p>
//         )}
//       </div>
//       {action}
//     </div>
//     {children}
//   </div>
// );

// /**
//  * Editable list: render items with inline add/edit/delete.
//  * Each item: { id, name, ...extras }
//  */
// const EditableList = ({
//   items,
//   onAdd,
//   onUpdate,
//   onRemove,
//   renderExtra,
//   placeholder = "New item",
//   emptyMessage = "No items yet.",
// }) => {
//   const [editingId, setEditingId] = useState(null);
//   const [editingValue, setEditingValue] = useState("");
//   const [adding, setAdding] = useState(false);
//   const [newValue, setNewValue] = useState("");

//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setEditingValue(item.name);
//   };

//   const confirmEdit = () => {
//     const trimmed = editingValue.trim();
//     if (!trimmed) return;
//     onUpdate(editingId, { name: trimmed });
//     setEditingId(null);
//     setEditingValue("");
//   };

//   const handleAdd = () => {
//     const trimmed = newValue.trim();
//     if (!trimmed) return;
//     onAdd(trimmed);
//     setNewValue("");
//     setAdding(false);
//   };

//   return (
//     <div className="space-y-2">
//       {items.length === 0 && (
//         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
//           {emptyMessage}
//         </p>
//       )}
//       {items.map((item) => (
//         <div
//           key={item.id}
//           className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20"
//         >
//           {editingId === item.id ? (
//             <>
//               <input
//                 autoFocus
//                 value={editingValue}
//                 onChange={(e) => setEditingValue(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") confirmEdit();
//                   if (e.key === "Escape") setEditingId(null);
//                 }}
//                 className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-400 rounded text-sm focus:outline-none"
//               />
//               <button
//                 onClick={confirmEdit}
//                 className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 title="Save"
//               >
//                 <Check size={14} />
//               </button>
//               <button
//                 onClick={() => setEditingId(null)}
//                 className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 title="Cancel"
//               >
//                 <X size={14} />
//               </button>
//             </>
//           ) : (
//             <>
//               <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
//                 {item.name}
//               </span>
//               {renderExtra?.(item)}
//               <button
//                 onClick={() => startEdit(item)}
//                 className="p-1.5 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
//                 title="Edit"
//               >
//                 <Pencil size={14} />
//               </button>
//               <button
//                 onClick={() => onRemove(item.id)}
//                 className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
//                 title="Delete"
//               >
//                 <Trash2 size={14} />
//               </button>
//             </>
//           )}
//         </div>
//       ))}

//       {adding ? (
//         <div className="flex items-center gap-2">
//           <input
//             autoFocus
//             value={newValue}
//             onChange={(e) => setNewValue(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleAdd();
//               if (e.key === "Escape") {
//                 setAdding(false);
//                 setNewValue("");
//               }
//             }}
//             placeholder={placeholder}
//             className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
//           />
//           <button
//             onClick={handleAdd}
//             className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
//           >
//             Add
//           </button>
//           <button
//             onClick={() => {
//               setAdding(false);
//               setNewValue("");
//             }}
//             className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
//           >
//             Cancel
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={() => setAdding(true)}
//           className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
//         >
//           <Plus size={14} /> Add
//         </button>
//       )}
//     </div>
//   );
// };

// const nextId = (list) =>
//   list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;

// // ============================================================
// // A. LEAD SETTINGS
// // ============================================================

// const LeadSettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard
//       title="Lead Statuses"
//       description="Statuses a lead can be in through its lifecycle"
//     >
//       <EditableList
//         items={settings.leadStatuses}
//         placeholder="e.g. Nurturing"
//         onAdd={(name) =>
//           updateSetting("leadStatuses", [
//             ...settings.leadStatuses,
//             { id: nextId(settings.leadStatuses), name, color: "#6b7280" },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "leadStatuses",
//             settings.leadStatuses.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "leadStatuses",
//             settings.leadStatuses.filter((x) => x.id !== id),
//           )
//         }
//         renderExtra={(item) => (
//           <span
//             className="w-3 h-3 rounded-full"
//             style={{ backgroundColor: item.color || "#6b7280" }}
//           />
//         )}
//       />
//     </SettingsCard>

//     <SettingsCard
//       title="Lead Sources"
//       description="Where your leads come from"
//     >
//       <EditableList
//         items={settings.leadSources}
//         placeholder="e.g. Webinar"
//         onAdd={(name) =>
//           updateSetting("leadSources", [
//             ...settings.leadSources,
//             { id: nextId(settings.leadSources), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "leadSources",
//             settings.leadSources.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "leadSources",
//             settings.leadSources.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard
//       title="Lead Priorities"
//       description="Priority levels used to triage leads"
//     >
//       <EditableList
//         items={settings.leadPriorities}
//         placeholder="e.g. Urgent"
//         onAdd={(name) =>
//           updateSetting("leadPriorities", [
//             ...settings.leadPriorities,
//             { id: nextId(settings.leadPriorities), name, color: "#6b7280" },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "leadPriorities",
//             settings.leadPriorities.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "leadPriorities",
//             settings.leadPriorities.filter((x) => x.id !== id),
//           )
//         }
//         renderExtra={(item) => (
//           <span
//             className="w-3 h-3 rounded-full"
//             style={{ backgroundColor: item.color || "#6b7280" }}
//           />
//         )}
//       />
//     </SettingsCard>

//     <SettingsCard
//       title="Lead Qualification Rules"
//       description="Criteria that determine when a lead becomes Qualified"
//     >
//       <div className="space-y-2">
//         {settings.qualificationRules.map((r) => (
//           <div
//             key={r.id}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60"
//           >
//             <input
//               type="checkbox"
//               checked={r.enabled}
//               onChange={() =>
//                 updateSetting(
//                   "qualificationRules",
//                   settings.qualificationRules.map((x) =>
//                     x.id === r.id ? { ...x, enabled: !x.enabled } : x,
//                   ),
//                 )
//               }
//               className="accent-blue-500"
//             />
//             <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
//               {r.rule}
//             </span>
//             <button
//               onClick={() =>
//                 updateSetting(
//                   "qualificationRules",
//                   settings.qualificationRules.filter((x) => x.id !== r.id),
//                 )
//               }
//               className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
//               title="Delete"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         ))}
//       </div>
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // B. OPPORTUNITY SETTINGS
// // ============================================================

// const OpportunitySettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard
//       title="Opportunity Stages"
//       description="Stages in the sales pipeline, in order"
//     >
//       <div className="space-y-2">
//         {settings.opportunityStages.map((s, i) => (
//           <div
//             key={s.id}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20"
//           >
//             <GripVertical
//               size={14}
//               className="text-gray-400 flex-shrink-0 cursor-grab"
//             />
//             <span
//               className="w-3 h-3 rounded-full flex-shrink-0"
//               style={{ backgroundColor: s.color || "#6b7280" }}
//             />
//             <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
//               {s.name}
//             </span>
//             <div className="flex items-center gap-1 text-xs">
//               <span className="text-gray-500 dark:text-gray-400">
//                 Default prob.
//               </span>
//               <input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={s.defaultProbability}
//                 onChange={(e) =>
//                   updateSetting(
//                     "opportunityStages",
//                     settings.opportunityStages.map((x) =>
//                       x.id === s.id
//                         ? { ...x, defaultProbability: Number(e.target.value) }
//                         : x,
//                     ),
//                   )
//                 }
//                 className="w-14 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs"
//               />
//               <span className="text-gray-500 dark:text-gray-400">%</span>
//             </div>
//             <button
//               onClick={() =>
//                 updateSetting(
//                   "opportunityStages",
//                   settings.opportunityStages.filter((x) => x.id !== s.id),
//                 )
//               }
//               className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
//               title="Delete"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         ))}
//       </div>
//       <AddInline
//         placeholder="New stage name"
//         onAdd={(name) =>
//           updateSetting("opportunityStages", [
//             ...settings.opportunityStages,
//             {
//               id: nextId(settings.opportunityStages),
//               name,
//               order: settings.opportunityStages.length + 1,
//               defaultProbability: 50,
//               color: "#6b7280",
//             },
//           ])
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Lost Reasons" description="Reasons to pick from when marking a deal lost">
//       <EditableList
//         items={settings.lostReasons}
//         placeholder="e.g. Budget freeze"
//         onAdd={(name) =>
//           updateSetting("lostReasons", [
//             ...settings.lostReasons,
//             { id: nextId(settings.lostReasons), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "lostReasons",
//             settings.lostReasons.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "lostReasons",
//             settings.lostReasons.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Win Reasons" description="Reasons to pick from when marking a deal won">
//       <EditableList
//         items={settings.winReasons}
//         placeholder="e.g. Referral trust"
//         onAdd={(name) =>
//           updateSetting("winReasons", [
//             ...settings.winReasons,
//             { id: nextId(settings.winReasons), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "winReasons",
//             settings.winReasons.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "winReasons",
//             settings.winReasons.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Opportunity Types" description="Classification of opportunities">
//       <EditableList
//         items={settings.opportunityTypes}
//         placeholder="e.g. Trial"
//         onAdd={(name) =>
//           updateSetting("opportunityTypes", [
//             ...settings.opportunityTypes,
//             { id: nextId(settings.opportunityTypes), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "opportunityTypes",
//             settings.opportunityTypes.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "opportunityTypes",
//             settings.opportunityTypes.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // C. CUSTOMER SETTINGS
// // ============================================================

// const CustomerSettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard title="Customer Categories">
//       <EditableList
//         items={settings.customerCategories}
//         placeholder="e.g. Reseller"
//         onAdd={(name) =>
//           updateSetting("customerCategories", [
//             ...settings.customerCategories,
//             { id: nextId(settings.customerCategories), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "customerCategories",
//             settings.customerCategories.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "customerCategories",
//             settings.customerCategories.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Industry List">
//       <EditableList
//         items={settings.industries}
//         placeholder="e.g. Hospitality"
//         onAdd={(name) =>
//           updateSetting("industries", [
//             ...settings.industries,
//             { id: nextId(settings.industries), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "industries",
//             settings.industries.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "industries",
//             settings.industries.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Customer Statuses">
//       <EditableList
//         items={settings.customerStatuses}
//         placeholder="e.g. Churned"
//         onAdd={(name) =>
//           updateSetting("customerStatuses", [
//             ...settings.customerStatuses,
//             { id: nextId(settings.customerStatuses), name, color: "#6b7280" },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "customerStatuses",
//             settings.customerStatuses.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "customerStatuses",
//             settings.customerStatuses.filter((x) => x.id !== id),
//           )
//         }
//         renderExtra={(item) => (
//           <span
//             className="w-3 h-3 rounded-full"
//             style={{ backgroundColor: item.color || "#6b7280" }}
//           />
//         )}
//       />
//     </SettingsCard>

//     <SettingsCard title="Customer Types">
//       <EditableList
//         items={settings.customerTypes}
//         placeholder="e.g. Government"
//         onAdd={(name) =>
//           updateSetting("customerTypes", [
//             ...settings.customerTypes,
//             { id: nextId(settings.customerTypes), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "customerTypes",
//             settings.customerTypes.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "customerTypes",
//             settings.customerTypes.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // D. ACTIVITY SETTINGS
// // ============================================================

// const ActivitySettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard title="Activity Types">
//       <EditableList
//         items={settings.activityTypes}
//         placeholder="e.g. Webinar"
//         onAdd={(name) =>
//           updateSetting("activityTypes", [
//             ...settings.activityTypes,
//             { id: nextId(settings.activityTypes), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "activityTypes",
//             settings.activityTypes.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "activityTypes",
//             settings.activityTypes.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard
//       title="Reminder Options"
//       description="Time before an activity to notify the assigned user"
//     >
//       <div className="space-y-2">
//         {settings.reminderOptions.map((r) => (
//           <div
//             key={r.id}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60"
//           >
//             <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
//               {r.name}
//             </span>
//             <span className="text-xs text-gray-500 dark:text-gray-400">
//               {r.minutes} min
//             </span>
//             <button
//               onClick={() =>
//                 updateSetting(
//                   "reminderOptions",
//                   settings.reminderOptions.filter((x) => x.id !== r.id),
//                 )
//               }
//               className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
//               title="Delete"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         ))}
//       </div>
//     </SettingsCard>

//     <SettingsCard title="Priority Values">
//       <EditableList
//         items={settings.priorityValues}
//         placeholder="e.g. Critical"
//         onAdd={(name) =>
//           updateSetting("priorityValues", [
//             ...settings.priorityValues,
//             { id: nextId(settings.priorityValues), name, color: "#6b7280" },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "priorityValues",
//             settings.priorityValues.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "priorityValues",
//             settings.priorityValues.filter((x) => x.id !== id),
//           )
//         }
//         renderExtra={(item) => (
//           <span
//             className="w-3 h-3 rounded-full"
//             style={{ backgroundColor: item.color || "#6b7280" }}
//           />
//         )}
//       />
//     </SettingsCard>

//     <SettingsCard
//       title="Default Activity Duration"
//       description="Used to prefill the end time when creating a new activity"
//     >
//       <div className="flex items-center gap-2">
//         <input
//           type="number"
//           min="5"
//           max="480"
//           value={settings.defaultActivityDuration}
//           onChange={(e) =>
//             updateSetting("defaultActivityDuration", e.target.value)
//           }
//           className="w-24 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
//         />
//         <span className="text-sm text-gray-600 dark:text-gray-400">
//           minutes
//         </span>
//       </div>
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // E. PRODUCT SETTINGS
// // ============================================================

// const ProductSettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard title="Product Categories">
//       <EditableList
//         items={settings.productCategories}
//         placeholder="e.g. Hardware"
//         onAdd={(name) =>
//           updateSetting("productCategories", [
//             ...settings.productCategories,
//             { id: nextId(settings.productCategories), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "productCategories",
//             settings.productCategories.map((x) =>
//               x.id === id ? { ...x, ...patch } : x,
//             ),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "productCategories",
//             settings.productCategories.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Units">
//       <EditableList
//         items={settings.units}
//         placeholder="e.g. Bundle"
//         onAdd={(name) =>
//           updateSetting("units", [
//             ...settings.units,
//             { id: nextId(settings.units), name },
//           ])
//         }
//         onUpdate={(id, patch) =>
//           updateSetting(
//             "units",
//             settings.units.map((x) => (x.id === id ? { ...x, ...patch } : x)),
//           )
//         }
//         onRemove={(id) =>
//           updateSetting(
//             "units",
//             settings.units.filter((x) => x.id !== id),
//           )
//         }
//       />
//     </SettingsCard>

//     <SettingsCard title="Currencies">
//       <div className="space-y-2">
//         {settings.currencies.map((c) => (
//           <div
//             key={c.id}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60"
//           >
//             <span className="w-12 text-xs font-bold text-gray-500 dark:text-gray-400">
//               {c.symbol}
//             </span>
//             <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
//               {c.code}
//             </span>
//             {c.isDefault && (
//               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
//                 Default
//               </span>
//             )}
//             <button
//               onClick={() =>
//                 updateSetting(
//                   "currencies",
//                   settings.currencies.map((x) => ({
//                     ...x,
//                     isDefault: x.id === c.id,
//                   })),
//                 )
//               }
//               className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
//             >
//               Set as default
//             </button>
//           </div>
//         ))}
//       </div>
//     </SettingsCard>

//     <SettingsCard
//       title="Tax Settings"
//       description="Manage only if your Finance module doesn't already own tax definitions"
//     >
//       <div className="space-y-2">
//         {settings.taxSettings.map((t) => (
//           <div
//             key={t.id}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/60"
//           >
//             <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
//               {t.name}
//             </span>
//             <span className="text-xs text-gray-500 dark:text-gray-400">
//               {t.rate}%
//             </span>
//             {t.isDefault && (
//               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
//                 Default
//               </span>
//             )}
//           </div>
//         ))}
//       </div>
//       <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3">
//         ⚠ If your Finance module already manages taxes, keep this list in sync
//         rather than maintaining a separate set of records.
//       </p>
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // F. CRM PERMISSIONS
// // ============================================================

// const PERMISSION_FIELDS = [
//   { key: "viewAllCustomers", label: "Who can view all customers?" },
//   { key: "createLeads", label: "Who can create leads?" },
//   { key: "assignLeads", label: "Who can assign leads?" },
//   { key: "deleteCustomers", label: "Who can delete customer records?" },
//   { key: "editQuotations", label: "Who can edit quotations?" },
//   { key: "viewSalesReports", label: "Who can view sales reports?" },
//   { key: "changeOpportunityStage", label: "Who can change opportunity stages?" },
// ];

// const PermissionSettings = ({ settings, updateSetting }) => {
//   const toggleRole = (permKey, role) => {
//     const current = settings.permissions[permKey] || [];
//     const next = current.includes(role)
//       ? current.filter((r) => r !== role)
//       : [...current, role];
//     updateSetting("permissions", {
//       ...settings.permissions,
//       [permKey]: next,
//     });
//   };

//   return (
//     <div className="space-y-4">
//       <SettingsCard
//         title="CRM Permissions"
//         description="Choose which roles can perform each action"
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200 dark:border-gray-700">
//                 <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[220px]">
//                   Permission
//                 </th>
//                 {ALL_ROLES.map((role) => (
//                   <th
//                     key={role}
//                     className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
//                   >
//                     {role}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {PERMISSION_FIELDS.map((field) => (
//                 <tr
//                   key={field.key}
//                   className="border-b border-gray-100 dark:border-gray-700/40"
//                 >
//                   <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-200">
//                     {field.label}
//                   </td>
//                   {ALL_ROLES.map((role) => {
//                     const checked =
//                       settings.permissions[field.key]?.includes(role) ||
//                       false;
//                     return (
//                       <td
//                         key={role}
//                         className="px-3 py-3 text-center"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={checked}
//                           onChange={() => toggleRole(field.key, role)}
//                           className="w-4 h-4 accent-blue-500"
//                         />
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
//           Super Admin always has all permissions and cannot be restricted.
//         </p>
//       </SettingsCard>
//     </div>
//   );
// };

// // ============================================================
// // G. NOTIFICATION SETTINGS
// // ============================================================

// const NOTIFICATION_FIELDS = [
//   {
//     key: "followUpReminders",
//     label: "Follow-up reminders",
//     description: "Notify the assigned user before a scheduled follow-up",
//   },
//   {
//     key: "overdueActivityAlerts",
//     label: "Overdue activity alerts",
//     description: "Alert the assigned user and their manager when an activity is overdue",
//   },
//   {
//     key: "leadAssignment",
//     label: "Lead assignment notifications",
//     description: "Notify the salesperson when a new lead is assigned to them",
//   },
//   {
//     key: "quotationStatus",
//     label: "Quotation status notifications",
//     description: "Notify the salesperson when a quotation is viewed, accepted, or rejected",
//   },
//   {
//     key: "opportunityStageChange",
//     label: "Opportunity stage change notifications",
//     description: "Notify the salesperson or manager when an opportunity changes stage",
//   },
// ];

// const NotificationSettings = ({ settings, updateSetting }) => (
//   <div className="space-y-4">
//     <SettingsCard
//       title="Notification Settings"
//       description="Control which emails and in-app alerts your team receives"
//     >
//       <div className="space-y-2">
//         {NOTIFICATION_FIELDS.map((f) => (
//           <label
//             key={f.key}
//             className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
//           >
//             <input
//               type="checkbox"
//               checked={!!settings.notifications[f.key]}
//               onChange={() =>
//                 updateSetting("notifications", {
//                   ...settings.notifications,
//                   [f.key]: !settings.notifications[f.key],
//                 })
//               }
//               className="mt-0.5 w-4 h-4 accent-blue-500"
//             />
//             <div>
//               <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
//                 {f.label}
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                 {f.description}
//               </p>
//             </div>
//           </label>
//         ))}
//       </div>
//     </SettingsCard>
//   </div>
// );

// // ============================================================
// // Utility: inline add row used by a couple of sections
// // ============================================================

// const AddInline = ({ placeholder, onAdd }) => {
//   const [adding, setAdding] = useState(false);
//   const [value, setValue] = useState("");

//   const submit = () => {
//     const v = value.trim();
//     if (!v) return;
//     onAdd(v);
//     setValue("");
//     setAdding(false);
//   };

//   if (!adding) {
//     return (
//       <button
//         onClick={() => setAdding(true)}
//         className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
//       >
//         <Plus size={14} /> Add
//       </button>
//     );
//   }
//   return (
//     <div className="flex items-center gap-2 mt-2">
//       <input
//         autoFocus
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") submit();
//           if (e.key === "Escape") {
//             setAdding(false);
//             setValue("");
//           }
//         }}
//         placeholder={placeholder}
//         className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
//       />
//       <button
//         onClick={submit}
//         className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
//       >
//         Add
//       </button>
//       <button
//         onClick={() => {
//           setAdding(false);
//           setValue("");
//         }}
//         className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
//       >
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default CrmSettings;