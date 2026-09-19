import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const Opportunities = () => {
  return (
    <UnderDevelopment pageName='Opportunities'/>
  )
}

export default Opportunities

// // src/admin/pages/crm/Opportunities.jsx

// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Plus,
//   Search,
//   Filter,
//   Download,
//   Eye,
//   Pencil,
//   Trash2,
//   Briefcase,
//   TrendingUp,
//   TrendingDown,
//   IndianRupee,
//   CalendarClock,
//   X,
//   List,
//   KanbanSquare,
//   Target,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import { showToast } from "../../../components/common/Toast";
// import Pagination from "../../components/common/Paginations";
// import ConfirmModal from "../../components/common/ConfirmModal";

// // ------------------------------------------------------------
// // STATIC DATA
// // ------------------------------------------------------------

// const STAGES = [
//   { key: "New", label: "New", color: "blue" },
//   { key: "Qualified", label: "Qualified", color: "indigo" },
//   { key: "Proposal Sent", label: "Proposal Sent", color: "purple" },
//   { key: "Negotiation", label: "Negotiation", color: "amber" },
//   { key: "Won", label: "Won", color: "green" },
//   { key: "Lost", label: "Lost", color: "red" },
// ];

// const OPPORTUNITIES = [
//   {
//     id: "OPP-0001",
//     name: "ABC Traders HRMS Rollout",
//     customer: "ABC Traders",
//     product: "HRMS",
//     value: 200000,
//     currency: "INR",
//     stage: "New",
//     probability: 20,
//     expectedClose: "2026-10-15",
//     assignedTo: "Rahul Verma",
//     priority: "High",
//     createdAt: "2026-09-10",
//   },
//   {
//     id: "OPP-0002",
//     name: "XYZ Pvt Ltd ERP Migration",
//     customer: "XYZ Pvt Ltd",
//     product: "ERP",
//     value: 500000,
//     currency: "INR",
//     stage: "Qualified",
//     probability: 40,
//     expectedClose: "2026-11-20",
//     assignedTo: "Amina Khan",
//     priority: "High",
//     createdAt: "2026-09-05",
//   },
//   {
//     id: "OPP-0003",
//     name: "PQR Solutions CRM Setup",
//     customer: "PQR Solutions",
//     product: "CRM",
//     value: 150000,
//     currency: "INR",
//     stage: "Proposal Sent",
//     probability: 60,
//     expectedClose: "2026-10-05",
//     assignedTo: "Karthik Raj",
//     priority: "Medium",
//     createdAt: "2026-09-02",
//   },
//   {
//     id: "OPP-0004",
//     name: "LMN Group HRMS Upgrade",
//     customer: "LMN Group",
//     product: "HRMS",
//     value: 300000,
//     currency: "INR",
//     stage: "Negotiation",
//     probability: 70,
//     expectedClose: "2026-09-28",
//     assignedTo: "Riya Roy",
//     priority: "High",
//     createdAt: "2026-08-25",
//   },
//   {
//     id: "OPP-0005",
//     name: "Acme Corp Payroll Renewal",
//     customer: "Acme Corp",
//     product: "Payroll",
//     value: 120000,
//     currency: "INR",
//     stage: "Won",
//     probability: 100,
//     expectedClose: "2026-09-15",
//     assignedTo: "Riya Roy",
//     priority: "Medium",
//     createdAt: "2026-08-10",
//   },
//   {
//     id: "OPP-0006",
//     name: "Globex Attendance System",
//     customer: "Globex Ltd",
//     product: "Attendance System",
//     value: 90000,
//     currency: "INR",
//     stage: "Lost",
//     probability: 0,
//     expectedClose: "2026-09-05",
//     assignedTo: "Aarav Mehta",
//     priority: "Low",
//     createdAt: "2026-08-01",
//   },
//   {
//     id: "OPP-0007",
//     name: "Initech Custom Development",
//     customer: "Initech Solutions",
//     product: "Custom Development",
//     value: 800000,
//     currency: "INR",
//     stage: "Qualified",
//     probability: 35,
//     expectedClose: "2026-12-10",
//     assignedTo: "Karthik Raj",
//     priority: "High",
//     createdAt: "2026-09-12",
//   },
// ];

// const CUSTOMERS = [
//   "ABC Traders",
//   "XYZ Pvt Ltd",
//   "PQR Solutions",
//   "LMN Group",
//   "Acme Corp",
//   "Globex Ltd",
//   "Initech Solutions",
//   "Umbrella Inc",
// ];

// const PRODUCTS = [
//   "HRMS",
//   "ERP",
//   "CRM",
//   "Payroll",
//   "Attendance System",
//   "Custom Development",
// ];

// const SALESPEOPLE = ["Rahul Verma", "Amina Khan", "Karthik Raj", "Riya Roy", "Aarav Mehta"];
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

// const formatCurrency = (n, currency = "INR") => {
//   const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "AED" ? "AED " : "";
//   if (n >= 100000) return `${symbol}${(n / 100000).toFixed(2)}L`;
//   if (n >= 1000) return `${symbol}${(n / 1000).toFixed(0)}K`;
//   return `${symbol}${n}`;
// };

// const stageBadge = (stage) => {
//   const map = {
//     New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
//     Qualified: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
//     "Proposal Sent": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
//     Negotiation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
//     Won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//     Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
//   };
//   return map[stage] || map.New;
// };

// const priorityBadge = (priority) => {
//   const map = {
//     High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
//     Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
//     Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//   };
//   return map[priority] || map.Medium;
// };

// const stageColorHex = (stage) => {
//   const map = {
//     New: "#3b82f6",
//     Qualified: "#6366f1",
//     "Proposal Sent": "#8b5cf6",
//     Negotiation: "#f59e0b",
//     Won: "#10b981",
//     Lost: "#ef4444",
//   };
//   return map[stage] || "#6b7280";
// };

// // ------------------------------------------------------------
// // COMPONENT
// // ------------------------------------------------------------

// const Opportunities = () => {
//   const navigate = useNavigate();

//   const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
//   const [search, setSearch] = useState("");
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     stage: "",
//     customer: "",
//     assignedTo: "",
//     product: "",
//     priority: "",
//   });
//   const [view, setView] = useState("table"); // table | pipeline

//   const [currentPage, setCurrentPage] = useState(1);
//   const perPage = 10;

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDelete, setPendingDelete] = useState(null);

//   // ------------------------------------------------------------
//   // Filtering
//   // ------------------------------------------------------------
//   const filtered = useMemo(() => {
//     return opportunities.filter((o) => {
//       if (filters.stage && o.stage !== filters.stage) return false;
//       if (filters.customer && o.customer !== filters.customer) return false;
//       if (filters.assignedTo && o.assignedTo !== filters.assignedTo) return false;
//       if (filters.product && o.product !== filters.product) return false;
//       if (filters.priority && o.priority !== filters.priority) return false;

//       if (search) {
//         const q = search.toLowerCase();
//         return (
//           o.name.toLowerCase().includes(q) ||
//           o.customer.toLowerCase().includes(q) ||
//           o.id.toLowerCase().includes(q) ||
//           o.product.toLowerCase().includes(q)
//         );
//       }
//       return true;
//     });
//   }, [opportunities, filters, search]);

//   const totalFiltered = filtered.length;
//   const totalPages = Math.ceil(totalFiltered / perPage) || 1;
//   const start = (currentPage - 1) * perPage;
//   const pageOpps = filtered.slice(start, start + perPage);

//   const activeFilterCount = Object.values(filters).filter(Boolean).length;

//   // ------------------------------------------------------------
//   // Summary
//   // ------------------------------------------------------------
//   const summary = useMemo(() => {
//     const open = opportunities.filter((o) => o.stage !== "Won" && o.stage !== "Lost");
//     const openValue = open.reduce((sum, o) => sum + o.value, 0);
//     const won = opportunities.filter((o) => o.stage === "Won");
//     const lost = opportunities.filter((o) => o.stage === "Lost");

//     const now = new Date();
//     const closingThisMonth = open.filter((o) => {
//       const d = new Date(o.expectedClose);
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     }).length;

//     return {
//       total: opportunities.length,
//       open: open.length,
//       pipelineValue: openValue,
//       won: won.length,
//       lost: lost.length,
//       closingThisMonth: closingThisMonth || 3, // sample fallback
//     };
//   }, [opportunities]);

//   // ------------------------------------------------------------
//   // Handlers
//   // ------------------------------------------------------------
//   const handleDeleteClick = (opp) => {
//     setPendingDelete(opp);
//     setConfirmOpen(true);
//   };

//   const handleConfirmDelete = () => {
//     if (!pendingDelete) return;
//     setOpportunities((prev) => prev.filter((o) => o.id !== pendingDelete.id));
//     showToast(`Opportunity "${pendingDelete.name}" deleted`, "success");
//     setConfirmOpen(false);
//     setPendingDelete(null);
//   };

//   const clearFilters = () => {
//     setFilters({ stage: "", customer: "", assignedTo: "", product: "", priority: "" });
//     setSearch("");
//     setCurrentPage(1);
//   };

//   const resetToFirstPage = () => setCurrentPage(1);

//   // ------------------------------------------------------------
//   // Pipeline columns
//   // ------------------------------------------------------------
//   const pipelineGroups = useMemo(() => {
//     return STAGES.map((s) => ({
//       ...s,
//       items: filtered.filter((o) => o.stage === s.key),
//       total: filtered
//         .filter((o) => o.stage === s.key)
//         .reduce((sum, o) => sum + o.value, 0),
//     }));
//   }, [filtered]);

//   return (
//     <div className="w-full overflow-x-hidden space-y-6">
//       {/* ---------- Header ---------- */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//             Opportunities
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Track and manage your sales pipeline
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 w-full lg:w-auto">
//           <button
//             onClick={() => showToast("Export started", "success")}
//             className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
//           >
//             <Download size={15} /> Export
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/opportunities/new")}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
//           >
//             <Plus size={16} /> Add Opportunity
//           </button>
//         </div>
//       </div>

//       {/* ---------- Summary cards ---------- */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//         <SummaryCard label="Total" value={summary.total} icon={Briefcase} color="blue" />
//         <SummaryCard label="Open" value={summary.open} icon={Target} color="indigo" />
//         <SummaryCard label="Pipeline Value" value={formatCurrency(summary.pipelineValue)} icon={IndianRupee} color="purple" small />
//         <SummaryCard label="Won" value={summary.won} icon={CheckCircle2} color="green" />
//         <SummaryCard label="Lost" value={summary.lost} icon={XCircle} color="red" />
//         <SummaryCard label="Closing This Month" value={summary.closingThisMonth} icon={CalendarClock} color="amber" />
//       </div>

//       {/* ---------- Search + Filters + View toggle ---------- */}
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
//             placeholder="Search by name, customer, ID, or product..."
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

//         {/* View toggle */}
//         <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
//           <button
//             onClick={() => setView("table")}
//             className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
//               view === "table"
//                 ? "bg-blue-600 text-white"
//                 : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
//             }`}
//             title="Table view"
//           >
//             <List size={15} />
//           </button>
//           <button
//             onClick={() => setView("pipeline")}
//             className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
//               view === "pipeline"
//                 ? "bg-blue-600 text-white"
//                 : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
//             }`}
//             title="Pipeline view"
//           >
//             <KanbanSquare size={15} />
//           </button>
//         </div>
//       </div>

//       {filtersOpen && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//             <FilterSelect
//               label="Stage"
//               value={filters.stage}
//               onChange={(v) => { setFilters((f) => ({ ...f, stage: v })); resetToFirstPage(); }}
//               options={STAGES.map((s) => s.label)}
//             />
//             <FilterSelect
//               label="Customer"
//               value={filters.customer}
//               onChange={(v) => { setFilters((f) => ({ ...f, customer: v })); resetToFirstPage(); }}
//               options={CUSTOMERS}
//             />
//             <FilterSelect
//               label="Assigned"
//               value={filters.assignedTo}
//               onChange={(v) => { setFilters((f) => ({ ...f, assignedTo: v })); resetToFirstPage(); }}
//               options={SALESPEOPLE}
//             />
//             <FilterSelect
//               label="Product"
//               value={filters.product}
//               onChange={(v) => { setFilters((f) => ({ ...f, product: v })); resetToFirstPage(); }}
//               options={PRODUCTS}
//             />
//             <FilterSelect
//               label="Priority"
//               value={filters.priority}
//               onChange={(v) => { setFilters((f) => ({ ...f, priority: v })); resetToFirstPage(); }}
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

//       {/* ---------- TABLE VIEW ---------- */}
//       {view === "table" && (
//         <>
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
//             <div className="min-w-[1100px]">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                     {[
//                       "OPP ID",
//                       "OPPORTUNITY",
//                       "CUSTOMER",
//                       "PRODUCT",
//                       "VALUE",
//                       "STAGE",
//                       "PROB.",
//                       "EXPECTED CLOSE",
//                       "ASSIGNED",
//                       "PRIORITY",
//                       "ACTIONS",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {pageOpps.length > 0 ? (
//                     pageOpps.map((o) => (
//                       <tr
//                         key={o.id}
//                         onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)}
//                         className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
//                       >
//                         <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
//                           {o.id}
//                         </td>
//                         <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
//                           {o.name}
//                         </td>
//                         <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                           {o.customer}
//                         </td>
//                         <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                           {o.product}
//                         </td>
//                         <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
//                           {formatCurrency(o.value, o.currency)}
//                         </td>
//                         <td className="px-3 py-2.5">
//                           <span
//                             className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${stageBadge(
//                               o.stage,
//                             )}`}
//                           >
//                             {o.stage}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                           {o.probability}%
//                         </td>
//                         <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                           {formatDate(o.expectedClose)}
//                         </td>
//                         <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                           {o.assignedTo}
//                         </td>
//                         <td className="px-3 py-2.5">
//                           <span
//                             className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${priorityBadge(
//                               o.priority,
//                             )}`}
//                           >
//                             {o.priority}
//                           </span>
//                         </td>
//                         <td
//                           className="px-3 py-2.5"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <div className="flex gap-1">
//                             <IconBtn
//                               icon={Eye}
//                               color="text-blue-500"
//                               title="View"
//                               onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)}
//                             />
//                             <IconBtn
//                               icon={Pencil}
//                               color="text-amber-500"
//                               title="Edit"
//                               onClick={() => navigate(`/admin/crm/opportunities/${o.id}/edit`)}
//                             />
//                             <IconBtn
//                               icon={Trash2}
//                               color="text-red-500"
//                               title="Delete"
//                               onClick={() => handleDeleteClick(o)}
//                             />
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan={11}
//                         className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
//                       >
//                         No opportunities found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {totalFiltered > 0 && (
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//               totalItems={totalFiltered}
//               itemsPerPage={perPage}
//             />
//           )}
//         </>
//       )}

//       {/* ---------- PIPELINE VIEW ---------- */}
//       {view === "pipeline" && (
//         <div className="overflow-x-auto pb-4">
//           <div className="flex gap-4 min-w-max">
//             {pipelineGroups.map((col) => (
//               <div
//                 key={col.key}
//                 className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col"
//               >
//                 {/* Column header */}
//                 <div className="p-3 border-b border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center justify-between mb-1">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-2.5 h-2.5 rounded-full"
//                         style={{ backgroundColor: stageColorHex(col.key) }}
//                       />
//                       <h3 className="text-sm font-bold text-gray-900 dark:text-white">
//                         {col.label}
//                       </h3>
//                     </div>
//                     <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
//                       {col.items.length}
//                     </span>
//                   </div>
//                   <p className="text-[11px] text-gray-500 dark:text-gray-400">
//                     {formatCurrency(col.total)}
//                   </p>
//                 </div>

//                 {/* Column body */}
//                 <div className="p-3 space-y-2 flex-1 max-h-[600px] overflow-y-auto">
//                   {col.items.length > 0 ? (
//                     col.items.map((o) => (
//                       <div
//                         key={o.id}
//                         onClick={() => navigate(`/admin/crm/opportunities/${o.id}`)}
//                         className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex items-start justify-between gap-2 mb-2">
//                           <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
//                             {o.customer}
//                           </p>
//                           <span
//                             className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 ${priorityBadge(
//                               o.priority,
//                             )}`}
//                           >
//                             {o.priority}
//                           </span>
//                         </div>
//                         <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 truncate">
//                           {o.product} · {formatCurrency(o.value, o.currency)}
//                         </p>
//                         <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
//                           <span>Assigned: {o.assignedTo}</span>
//                           <span>{o.probability}%</span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-6 text-[11px] text-gray-400 dark:text-gray-500">
//                       No opportunities
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ---------- Delete confirm ---------- */}
//       <ConfirmModal
//         isOpen={confirmOpen}
//         onClose={() => {
//           setConfirmOpen(false);
//           setPendingDelete(null);
//         }}
//         onConfirm={handleConfirmDelete}
//         title="Delete Opportunity"
//         message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//       />
//     </div>
//   );
// };

// // ------------------------------------------------------------
// // Building blocks
// // ------------------------------------------------------------

// const SummaryCard = ({ label, value, icon: Icon, color, small }) => {
//   const map = {
//     blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
//     indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
//     purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
//     green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
//     red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
//     amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
//   };
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
//       <div className="flex items-center justify-between mb-2">
//         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}>
//           <Icon className="w-4 h-4" />
//         </div>
//       </div>
//       <div className={`${small ? "text-base" : "text-xl"} font-bold text-gray-900 dark:text-white truncate`}>
//         {value}
//       </div>
//       <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
//         {label}
//       </div>
//     </div>
//   );
// };

// const IconBtn = ({ icon: Icon, color, title, onClick }) => (
//   <button
//     onClick={onClick}
//     title={title}
//     className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${color}`}
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

// export default Opportunities;