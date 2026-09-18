import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const Leads = () => {
  return (
    <UnderDevelopment pageName='Leads'/>
  )
}

export default Leads

// // src/admin/pages/crm/Leads.jsx

// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Plus,
//   Search,
//   Filter,
//   Download,
//   Upload,
//   Eye,
//   Pencil,
//   Trash2,
//   UserCog,
//   UserCheck,
//   Briefcase,
//   CalendarClock,
//   X,
//   Users,
//   UserPlus,
//   CheckCircle2,
//   XCircle,
//   Clock,
// } from "lucide-react";
// import { showToast } from "../../../components/common/Toast";
// import Pagination from "../../components/common/Paginations";
// import ConfirmModal from "../../components/common/ConfirmModal";
// import ConvertLeadModal from "../../components/crm/ConvertLeadModal";

// // ------------------------------------------------------------
// // STATIC DATA
// // ------------------------------------------------------------

// const LEADS = [
//   {
//     id: "LED-0001",
//     name: "Ramesh Kumar",
//     company: "Acme Corp",
//     phone: "+91 98765 43210",
//     email: "ramesh@acmecorp.com",
//     source: "Website",
//     status: "New",
//     assignedTo: "Riya Roy",
//     nextFollowUp: "2026-09-18",
//     createdAt: "2026-09-10",
//     priority: "High",
//     industry: "Manufacturing",
//     location: "Mumbai, MH",
//   },
//   {
//     id: "LED-0002",
//     name: "Priya Sharma",
//     company: "Globex Ltd",
//     phone: "+91 98200 11223",
//     email: "priya@globex.in",
//     source: "Referral",
//     status: "Contacted",
//     assignedTo: "Karthik Raj",
//     nextFollowUp: "2026-09-20",
//     createdAt: "2026-09-08",
//     priority: "Medium",
//     industry: "IT Services",
//     location: "Bengaluru, KA",
//   },
//   {
//     id: "LED-0003",
//     name: "Amit Patel",
//     company: "Initech Solutions",
//     phone: "+91 99887 76655",
//     email: "amit@initech.io",
//     source: "Social Media",
//     status: "Qualified",
//     assignedTo: "Aarav Mehta",
//     nextFollowUp: "2026-09-16",
//     createdAt: "2026-09-05",
//     priority: "High",
//     industry: "Fintech",
//     location: "Ahmedabad, GJ",
//   },
//   {
//     id: "LED-0004",
//     name: "Neha Verma",
//     company: "Umbrella Inc",
//     phone: "+91 90123 45678",
//     email: "neha@umbrella.com",
//     source: "Email",
//     status: "Unqualified",
//     assignedTo: "Riya Roy",
//     nextFollowUp: "2026-09-25",
//     createdAt: "2026-09-03",
//     priority: "Low",
//     industry: "Retail",
//     location: "Delhi, DL",
//   },
//   {
//     id: "LED-0005",
//     name: "Vikram Singh",
//     company: "Stark Industries",
//     phone: "+91 91234 56789",
//     email: "vikram@stark.in",
//     source: "Exhibition",
//     status: "Converted",
//     assignedTo: "Karthik Raj",
//     nextFollowUp: "—",
//     createdAt: "2026-08-28",
//     priority: "High",
//     industry: "Aerospace",
//     location: "Pune, MH",
//   },
//   {
//     id: "LED-0006",
//     name: "Anjali Nair",
//     company: "Wayne Enterprises",
//     phone: "+91 90909 90909",
//     email: "anjali@wayne.in",
//     source: "Phone",
//     status: "New",
//     assignedTo: "Aarav Mehta",
//     nextFollowUp: "2026-09-19",
//     createdAt: "2026-09-12",
//     priority: "Medium",
//     industry: "Logistics",
//     location: "Kochi, KL",
//   },
// ];

// const STATUSES = [
//   "New",
//   "Contacted",
//   "Qualified",
//   "Unqualified",
//   "Converted",
// ];

// const SOURCES = [
//   "Website",
//   "Referral",
//   "Social Media",
//   "Email",
//   "Phone",
//   "Exhibition",
//   "Manual Entry",
//   "Other",
// ];

// const ASSIGNEES = ["Riya Roy", "Karthik Raj", "Aarav Mehta"];
// const INDUSTRIES = ["IT Services", "Manufacturing", "Fintech", "Retail", "Aerospace", "Logistics"];
// const PRIORITIES = ["Low", "Medium", "High"];

// // ------------------------------------------------------------
// // HELPERS
// // ------------------------------------------------------------

// const formatDate = (d) => {
//   if (!d || d === "—") return "—";
//   return new Date(d).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const statusBadge = (status) => {
//   const map = {
//     New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
//     Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
//     Qualified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//     Unqualified: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
//     Converted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
//   };
//   return map[status] || map.New;
// };

// const priorityBadge = (priority) => {
//   const map = {
//     High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
//     Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
//     Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//   };
//   return map[priority] || map.Medium;
// };

// // ------------------------------------------------------------
// // COMPONENT
// // ------------------------------------------------------------

// const Leads = () => {
//   const navigate = useNavigate();

//   const [leads, setLeads] = useState(LEADS);
//   const [search, setSearch] = useState("");
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "",
//     source: "",
//     assignedTo: "",
//     industry: "",
//     priority: "",
//   });

//   const [currentPage, setCurrentPage] = useState(1);
//   const perPage = 10;

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDelete, setPendingDelete] = useState(null);

//   const [convertOpen, setConvertOpen] = useState(false);
//   const [pendingConvert, setPendingConvert] = useState(null);

//   // ------------------------------------------------------------
//   // Filtering
//   // ------------------------------------------------------------
//   const filtered = useMemo(() => {
//     return leads.filter((l) => {
//       if (filters.status && l.status !== filters.status) return false;
//       if (filters.source && l.source !== filters.source) return false;
//       if (filters.assignedTo && l.assignedTo !== filters.assignedTo) return false;
//       if (filters.industry && l.industry !== filters.industry) return false;
//       if (filters.priority && l.priority !== filters.priority) return false;

//       if (search) {
//         const q = search.toLowerCase();
//         return (
//           l.name.toLowerCase().includes(q) ||
//           l.company.toLowerCase().includes(q) ||
//           l.email.toLowerCase().includes(q) ||
//           l.phone.toLowerCase().includes(q) ||
//           l.id.toLowerCase().includes(q)
//         );
//       }
//       return true;
//     });
//   }, [leads, filters, search]);

//   const totalFiltered = filtered.length;
//   const totalPages = Math.ceil(totalFiltered / perPage) || 1;
//   const start = (currentPage - 1) * perPage;
//   const pageLeads = filtered.slice(start, start + perPage);

//   const activeFilterCount = Object.values(filters).filter(Boolean).length;

//   // ------------------------------------------------------------
//   // Summary counts
//   // ------------------------------------------------------------
//   const summary = useMemo(() => {
//     return {
//       total: leads.length,
//       new: leads.filter((l) => l.status === "New").length,
//       qualified: leads.filter((l) => l.status === "Qualified").length,
//       unqualified: leads.filter((l) => l.status === "Unqualified").length,
//       converted: leads.filter((l) => l.status === "Converted").length,
//       followUpsDue: leads.filter(
//         (l) =>
//           l.nextFollowUp !== "—" &&
//           new Date(l.nextFollowUp) <= new Date("2026-09-20"),
//       ).length,
//     };
//   }, [leads]);

//   // ------------------------------------------------------------
//   // Handlers
//   // ------------------------------------------------------------
//   const handleDeleteClick = (lead) => {
//     setPendingDelete(lead);
//     setConfirmOpen(true);
//   };

//   const handleConfirmDelete = () => {
//     if (!pendingDelete) return;
//     setLeads((prev) => prev.filter((l) => l.id !== pendingDelete.id));
//     showToast(`Lead ${pendingDelete.name} deleted`, "success");
//     setConfirmOpen(false);
//     setPendingDelete(null);
//   };

//   const handleConvertClick = (lead) => {
//     setPendingConvert(lead);
//     setConvertOpen(true);
//   };

//   const handleConvertSubmit = ({ createOpportunity }) => {
//     if (!pendingConvert) return;
//     setLeads((prev) =>
//       prev.map((l) =>
//         l.id === pendingConvert.id ? { ...l, status: "Converted" } : l,
//       ),
//     );
//     showToast(
//       createOpportunity
//         ? `${pendingConvert.name} converted with opportunity created`
//         : `${pendingConvert.name} converted to customer`,
//       "success",
//     );
//     setConvertOpen(false);
//     setPendingConvert(null);
//   };

//   const clearFilters = () => {
//     setFilters({
//       status: "",
//       source: "",
//       assignedTo: "",
//       industry: "",
//       priority: "",
//     });
//     setSearch("");
//     setCurrentPage(1);
//   };

//   const resetToFirstPage = () => setCurrentPage(1);

//   return (
//     <div className="w-full overflow-x-hidden space-y-6">
//       {/* ---------- Header ---------- */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//             Leads
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Manage your sales leads and track their progress
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 w-full lg:w-auto">
//           <button
//             onClick={() => navigate("/admin/crm/leads/import")}
//             className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
//           >
//             <Upload size={15} /> Import
//           </button>
//           <button
//             onClick={() => showToast("Export started", "success")}
//             className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
//           >
//             <Download size={15} /> Export
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/leads/new")}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
//           >
//             <Plus size={16} /> Add Lead
//           </button>
//         </div>
//       </div>

//       {/* ---------- Summary cards ---------- */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//         <SummaryCard
//           label="Total Leads"
//           value={summary.total}
//           icon={Users}
//           color="blue"
//         />
//         <SummaryCard
//           label="New"
//           value={summary.new}
//           icon={UserPlus}
//           color="indigo"
//         />
//         <SummaryCard
//           label="Qualified"
//           value={summary.qualified}
//           icon={CheckCircle2}
//           color="green"
//         />
//         <SummaryCard
//           label="Unqualified"
//           value={summary.unqualified}
//           icon={XCircle}
//           color="gray"
//         />
//         <SummaryCard
//           label="Converted"
//           value={summary.converted}
//           icon={UserCheck}
//           color="purple"
//         />
//         <SummaryCard
//           label="Follow-ups Due"
//           value={summary.followUpsDue}
//           icon={Clock}
//           color="amber"
//         />
//       </div>

//       {/* ---------- Search + Filters ---------- */}
//       <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
//         <div className="relative flex-1">
//           <Search
//             size={16}
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//           />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               resetToFirstPage();
//             }}
//             placeholder="Search by name, company, email, phone, or ID..."
//             className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>

//         <button
//           onClick={() => setFiltersOpen((v) => !v)}
//           className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
//             activeFilterCount > 0
//               ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
//               : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//           }`}
//         >
//           <Filter size={15} />
//           Filters
//           {activeFilterCount > 0 && (
//             <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
//               {activeFilterCount}
//             </span>
//           )}
//         </button>
//       </div>

//       {filtersOpen && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//             <FilterSelect
//               label="Status"
//               value={filters.status}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, status: v }));
//                 resetToFirstPage();
//               }}
//               options={STATUSES}
//             />
//             <FilterSelect
//               label="Source"
//               value={filters.source}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, source: v }));
//                 resetToFirstPage();
//               }}
//               options={SOURCES}
//             />
//             <FilterSelect
//               label="Assigned To"
//               value={filters.assignedTo}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, assignedTo: v }));
//                 resetToFirstPage();
//               }}
//               options={ASSIGNEES}
//             />
//             <FilterSelect
//               label="Industry"
//               value={filters.industry}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, industry: v }));
//                 resetToFirstPage();
//               }}
//               options={INDUSTRIES}
//             />
//             <FilterSelect
//               label="Priority"
//               value={filters.priority}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, priority: v }));
//                 resetToFirstPage();
//               }}
//               options={PRIORITIES}
//             />
//           </div>
//           {activeFilterCount > 0 && (
//             <div className="flex justify-end mt-3">
//               <button
//                 onClick={clearFilters}
//                 className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
//               >
//                 <X size={12} /> Clear all filters
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ---------- Table ---------- */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
//         <div className="min-w-[1100px]">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                 {[
//                   "LEAD ID",
//                   "NAME",
//                   "COMPANY",
//                   "CONTACT",
//                   "SOURCE",
//                   "STATUS",
//                   "ASSIGNED TO",
//                   "NEXT FOLLOW-UP",
//                   "CREATED",
//                   "ACTIONS",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {pageLeads.length > 0 ? (
//                 pageLeads.map((l) => (
//                   <tr
//                     key={l.id}
//                     onClick={() => navigate(`/admin/crm/leads/${l.id}`)}
//                     className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
//                   >
//                     <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
//                       {l.id}
//                     </td>
//                     <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
//                       {l.name}
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                       {l.company}
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
//                       <div className="flex flex-col">
//                         <span>{l.phone}</span>
//                         <span className="text-gray-400 dark:text-gray-500 text-[11px]">
//                           {l.email}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                       {l.source}
//                     </td>
//                     <td className="px-3 py-2.5">
//                       <span
//                         className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
//                           l.status,
//                         )}`}
//                       >
//                         {l.status}
//                       </span>
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                       {l.assignedTo}
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                       {formatDate(l.nextFollowUp)}
//                     </td>
//                     <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                       {formatDate(l.createdAt)}
//                     </td>
//                     <td
//                       className="px-3 py-2.5"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <div className="flex gap-1">
//                         <IconBtn
//                           icon={Eye}
//                           color="text-blue-500"
//                           title="View"
//                           onClick={() => navigate(`/admin/crm/leads/${l.id}`)}
//                         />
//                         <IconBtn
//                           icon={Pencil}
//                           color="text-amber-500"
//                           title="Edit"
//                           onClick={() =>
//                             navigate(`/admin/crm/leads/${l.id}/edit`)
//                           }
//                         />
//                         <IconBtn
//                           icon={UserCog}
//                           color="text-indigo-500"
//                           title="Assign"
//                           onClick={() =>
//                             showToast("Assign dialog — implement later", "info")
//                           }
//                         />
//                         <IconBtn
//                           icon={UserCheck}
//                           color="text-green-500"
//                           title="Convert to Customer"
//                           onClick={() => handleConvertClick(l)}
//                           disabled={l.status === "Converted"}
//                         />
//                         <IconBtn
//                           icon={Briefcase}
//                           color="text-purple-500"
//                           title="Convert to Opportunity"
//                           onClick={() =>
//                             showToast(
//                               "Convert to opportunity — implement later",
//                               "info",
//                             )
//                           }
//                         />
//                         <IconBtn
//                           icon={CalendarClock}
//                           color="text-teal-500"
//                           title="Schedule Follow-up"
//                           onClick={() =>
//                             showToast(
//                               "Schedule follow-up — implement later",
//                               "info",
//                             )
//                           }
//                         />
//                         <IconBtn
//                           icon={Trash2}
//                           color="text-red-500"
//                           title="Delete"
//                           onClick={() => handleDeleteClick(l)}
//                         />
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={10}
//                     className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
//                   >
//                     No leads found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ---------- Pagination ---------- */}
//       {totalFiltered > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//           totalItems={totalFiltered}
//           itemsPerPage={perPage}
//         />
//       )}

//       {/* ---------- Delete confirm ---------- */}
//       <ConfirmModal
//         isOpen={confirmOpen}
//         onClose={() => {
//           setConfirmOpen(false);
//           setPendingDelete(null);
//         }}
//         onConfirm={handleConfirmDelete}
//         title="Delete Lead"
//         message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//       />

//       {/* ---------- Convert Lead modal ---------- */}
//       <ConvertLeadModal
//         isOpen={convertOpen}
//         onClose={() => {
//           setConvertOpen(false);
//           setPendingConvert(null);
//         }}
//         lead={pendingConvert}
//         onSubmit={handleConvertSubmit}
//       />
//     </div>
//   );
// };

// // ------------------------------------------------------------
// // Small building blocks
// // ------------------------------------------------------------

// const SummaryCard = ({ label, value, icon: Icon, color }) => {
//   const map = {
//     blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
//     indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
//     green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
//     gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
//     purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
//     amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
//   };
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
//       <div className="flex items-center justify-between mb-2">
//         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}>
//           <Icon className="w-4 h-4" />
//         </div>
//       </div>
//       <div className="text-xl font-bold text-gray-900 dark:text-white">
//         {value}
//       </div>
//       <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
//         {label}
//       </div>
//     </div>
//   );
// };

// const IconBtn = ({ icon: Icon, color, title, onClick, disabled }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     title={title}
//     className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color} disabled:opacity-30 disabled:cursor-not-allowed`}
//   >
//     <Icon size={14} />
//   </button>
// );

// const FilterSelect = ({ label, value, onChange, options }) => (
//   <div>
//     <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
//       {label}
//     </label>
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//     >
//       <option value="">All</option>
//       {options.map((o) => (
//         <option key={o} value={o}>
//           {o}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// export default Leads;