import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const Customers = () => {
  return (
    <UnderDevelopment pageName='Customers'/>
  )
}

export default Customers

// // src/admin/pages/crm/Customers.jsx

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
//   UserPlus,
//   Briefcase,
//   CalendarClock,
//   X,
//   Users,
//   UserCheck,
//   UserX,
//   UserPlus2,
//   Briefcase as BriefcaseIcon,
//   Clock,
//   LayoutGrid,
//   List,
// } from "lucide-react";
// import { showToast } from "../../../components/common/Toast";
// import Pagination from "../../components/common/Paginations";
// import ConfirmModal from "../../components/common/ConfirmModal";

// // ------------------------------------------------------------
// // STATIC DATA
// // ------------------------------------------------------------

// const CUSTOMERS = [
//   {
//     id: "CUS-0001",
//     company: "Acme Corp",
//     primaryContact: "Ramesh Kumar",
//     phone: "+91 98765 43210",
//     email: "contact@acmecorp.com",
//     industry: "Manufacturing",
//     assignedTo: "Riya Roy",
//     status: "Active",
//     customerSince: "2025-04-12",
//     openOpportunities: 3,
//     type: "Company",
//     city: "Mumbai",
//     state: "Maharashtra",
//   },
//   {
//     id: "CUS-0002",
//     company: "Globex Ltd",
//     primaryContact: "Priya Sharma",
//     phone: "+91 98200 11223",
//     email: "hello@globex.in",
//     industry: "IT Services",
//     assignedTo: "Karthik Raj",
//     status: "Active",
//     customerSince: "2024-11-08",
//     openOpportunities: 1,
//     type: "Company",
//     city: "Bengaluru",
//     state: "Karnataka",
//   },
//   {
//     id: "CUS-0003",
//     company: "Initech Solutions",
//     primaryContact: "Amit Patel",
//     phone: "+91 99887 76655",
//     email: "amit@initech.io",
//     industry: "Fintech",
//     assignedTo: "Aarav Mehta",
//     status: "Active",
//     customerSince: "2025-06-20",
//     openOpportunities: 2,
//     type: "Company",
//     city: "Ahmedabad",
//     state: "Gujarat",
//   },
//   {
//     id: "CUS-0004",
//     company: "Ramesh Enterprises",
//     primaryContact: "Ramesh Iyer",
//     phone: "+91 90123 45678",
//     email: "ramesh@iyerent.com",
//     industry: "Retail",
//     assignedTo: "Riya Roy",
//     status: "Inactive",
//     customerSince: "2023-02-14",
//     openOpportunities: 0,
//     type: "Company",
//     city: "Chennai",
//     state: "Tamil Nadu",
//   },
//   {
//     id: "CUS-0005",
//     company: "Stark Industries",
//     primaryContact: "Vikram Singh",
//     phone: "+91 91234 56789",
//     email: "info@stark.in",
//     industry: "Aerospace",
//     assignedTo: "Karthik Raj",
//     status: "Active",
//     customerSince: "2024-08-01",
//     openOpportunities: 4,
//     type: "Company",
//     city: "Pune",
//     state: "Maharashtra",
//   },
//   {
//     id: "CUS-0006",
//     company: "Anjali Nair",
//     primaryContact: "Anjali Nair",
//     phone: "+91 90909 90909",
//     email: "anjali@nairco.in",
//     industry: "Logistics",
//     assignedTo: "Aarav Mehta",
//     status: "Active",
//     customerSince: "2026-08-25",
//     openOpportunities: 0,
//     type: "Individual",
//     city: "Kochi",
//     state: "Kerala",
//   },
// ];

// const STATUSES = ["Active", "Inactive"];
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
// ];
// const ASSIGNEES = ["Riya Roy", "Karthik Raj", "Aarav Mehta"];
// const CUSTOMER_TYPES = ["Individual", "Company"];

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
//     Active:
//       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//     Inactive:
//       "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
//   };
//   return map[status] || map.Active;
// };

// // ------------------------------------------------------------
// // COMPONENT
// // ------------------------------------------------------------

// const Customers = () => {
//   const navigate = useNavigate();

//   const [customers, setCustomers] = useState(CUSTOMERS);
//   const [search, setSearch] = useState("");
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "",
//     industry: "",
//     assignedTo: "",
//     type: "",
//   });
//   const [view, setView] = useState("table"); // table | grid

//   const [currentPage, setCurrentPage] = useState(1);
//   const perPage = 10;

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDelete, setPendingDelete] = useState(null);

//   // ------------------------------------------------------------
//   // Filtering
//   // ------------------------------------------------------------
//   const filtered = useMemo(() => {
//     return customers.filter((c) => {
//       if (filters.status && c.status !== filters.status) return false;
//       if (filters.industry && c.industry !== filters.industry) return false;
//       if (filters.assignedTo && c.assignedTo !== filters.assignedTo)
//         return false;
//       if (filters.type && c.type !== filters.type) return false;

//       if (search) {
//         const q = search.toLowerCase();
//         return (
//           c.company.toLowerCase().includes(q) ||
//           c.primaryContact.toLowerCase().includes(q) ||
//           c.email.toLowerCase().includes(q) ||
//           c.phone.toLowerCase().includes(q) ||
//           c.id.toLowerCase().includes(q)
//         );
//       }
//       return true;
//     });
//   }, [customers, filters, search]);

//   const totalFiltered = filtered.length;
//   const totalPages = Math.ceil(totalFiltered / perPage) || 1;
//   const start = (currentPage - 1) * perPage;
//   const pageCustomers = filtered.slice(start, start + perPage);

//   const activeFilterCount = Object.values(filters).filter(Boolean).length;

//   // ------------------------------------------------------------
//   // Summary
//   // ------------------------------------------------------------
//   const summary = useMemo(() => {
//     const now = new Date();
//     const thisMonth = customers.filter((c) => {
//       const d = new Date(c.customerSince);
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     }).length;

//     return {
//       total: customers.length,
//       active: customers.filter((c) => c.status === "Active").length,
//       inactive: customers.filter((c) => c.status === "Inactive").length,
//       newThisMonth: thisMonth || 2, // sample fallback
//       withOpenOpps: customers.filter((c) => c.openOpportunities > 0).length,
//       needsFollowUp: customers.filter((c) => c.status === "Active" && c.openOpportunities > 0).length,
//     };
//   }, [customers]);

//   // ------------------------------------------------------------
//   // Handlers
//   // ------------------------------------------------------------
//   const handleDeleteClick = (customer) => {
//     setPendingDelete(customer);
//     setConfirmOpen(true);
//   };

//   const handleConfirmDelete = () => {
//     if (!pendingDelete) return;
//     setCustomers((prev) => prev.filter((c) => c.id !== pendingDelete.id));
//     showToast(`Customer ${pendingDelete.company} deleted`, "success");
//     setConfirmOpen(false);
//     setPendingDelete(null);
//   };

//   const clearFilters = () => {
//     setFilters({ status: "", industry: "", assignedTo: "", type: "" });
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
//             Customers
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Manage your customer relationships and records
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 w-full lg:w-auto">
//           <button
//             onClick={() => navigate("/admin/crm/customers/import")}
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
//             onClick={() => navigate("/admin/crm/customers/new")}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
//           >
//             <Plus size={16} /> Add Customer
//           </button>
//         </div>
//       </div>

//       {/* ---------- Summary cards ---------- */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//         <SummaryCard label="Total" value={summary.total} icon={Users} color="blue" />
//         <SummaryCard label="Active" value={summary.active} icon={UserCheck} color="green" />
//         <SummaryCard label="Inactive" value={summary.inactive} icon={UserX} color="gray" />
//         <SummaryCard label="New This Month" value={summary.newThisMonth} icon={UserPlus2} color="indigo" />
//         <SummaryCard label="With Open Deals" value={summary.withOpenOpps} icon={BriefcaseIcon} color="purple" />
//         <SummaryCard label="Needs Follow-up" value={summary.needsFollowUp} icon={Clock} color="amber" />
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
//             placeholder="Search by company, contact, email, phone, or ID..."
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
//             onClick={() => setView("grid")}
//             className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
//               view === "grid"
//                 ? "bg-blue-600 text-white"
//                 : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
//             }`}
//             title="Grid view"
//           >
//             <LayoutGrid size={15} />
//           </button>
//         </div>
//       </div>

//       {filtersOpen && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
//               label="Industry"
//               value={filters.industry}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, industry: v }));
//                 resetToFirstPage();
//               }}
//               options={INDUSTRIES}
//             />
//             <FilterSelect
//               label="Account Manager"
//               value={filters.assignedTo}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, assignedTo: v }));
//                 resetToFirstPage();
//               }}
//               options={ASSIGNEES}
//             />
//             <FilterSelect
//               label="Customer Type"
//               value={filters.type}
//               onChange={(v) => {
//                 setFilters((f) => ({ ...f, type: v }));
//                 resetToFirstPage();
//               }}
//               options={CUSTOMER_TYPES}
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

//       {/* ---------- Table view ---------- */}
//       {view === "table" && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
//           <div className="min-w-[1100px]">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                   {[
//                     "CUSTOMER ID",
//                     "COMPANY",
//                     "PRIMARY CONTACT",
//                     "PHONE",
//                     "EMAIL",
//                     "INDUSTRY",
//                     "ASSIGNED",
//                     "STATUS",
//                     "CUSTOMER SINCE",
//                     "OPEN DEALS",
//                     "ACTIONS",
//                   ].map((h) => (
//                     <th
//                       key={h}
//                       className="px-3 py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageCustomers.length > 0 ? (
//                   pageCustomers.map((c) => (
//                     <tr
//                       key={c.id}
//                       onClick={() =>
//                         navigate(`/admin/crm/customers/${c.id}`)
//                       }
//                       className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
//                     >
//                       <td className="px-3 py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
//                         {c.id}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
//                         {c.company}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.primaryContact}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.phone}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.email}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.industry}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.assignedTo}
//                       </td>
//                       <td className="px-3 py-2.5">
//                         <span
//                           className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusBadge(
//                             c.status,
//                           )}`}
//                         >
//                           {c.status}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {formatDate(c.customerSince)}
//                       </td>
//                       <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
//                         {c.openOpportunities > 0 ? (
//                           <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
//                             <Briefcase size={12} /> {c.openOpportunities}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>
//                       <td
//                         className="px-3 py-2.5"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div className="flex gap-1">
//                           <IconBtn
//                             icon={Eye}
//                             color="text-blue-500"
//                             title="View"
//                             onClick={() =>
//                               navigate(`/admin/crm/customers/${c.id}`)
//                             }
//                           />
//                           <IconBtn
//                             icon={Pencil}
//                             color="text-amber-500"
//                             title="Edit"
//                             onClick={() =>
//                               navigate(`/admin/crm/customers/${c.id}/edit`)
//                             }
//                           />
//                           <IconBtn
//                             icon={UserPlus}
//                             color="text-indigo-500"
//                             title="Add Contact"
//                             onClick={() =>
//                               showToast(
//                                 "Add contact — implement later",
//                                 "info",
//                               )
//                             }
//                           />
//                           <IconBtn
//                             icon={Briefcase}
//                             color="text-purple-500"
//                             title="Add Opportunity"
//                             onClick={() =>
//                               showToast(
//                                 "Add opportunity — implement later",
//                                 "info",
//                               )
//                             }
//                           />
//                           <IconBtn
//                             icon={CalendarClock}
//                             color="text-teal-500"
//                             title="Schedule Activity"
//                             onClick={() =>
//                               showToast(
//                                 "Schedule activity — implement later",
//                                 "info",
//                               )
//                             }
//                           />
//                           <IconBtn
//                             icon={Trash2}
//                             color="text-red-500"
//                             title="Delete"
//                             onClick={() => handleDeleteClick(c)}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={11}
//                       className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
//                     >
//                       No customers found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ---------- Grid view ---------- */}
//       {view === "grid" && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {pageCustomers.map((c) => (
//             <div
//               key={c.id}
//               onClick={() => navigate(`/admin/crm/customers/${c.id}`)}
//               className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
//                   {c.company.charAt(0)}
//                 </div>
//                 <span
//                   className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(
//                     c.status,
//                   )}`}
//                 >
//                   {c.status}
//                 </span>
//               </div>
//               <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
//                 {c.company}
//               </h3>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
//                 {c.industry} · {c.city}
//               </p>
//               <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
//                 <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
//                   <Users size={12} /> {c.primaryContact}
//                 </div>
//                 <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
//                   <UserCheck size={12} /> {c.assignedTo}
//                 </div>
//                 {c.openOpportunities > 0 && (
//                   <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
//                     <Briefcase size={12} /> {c.openOpportunities} open opportunities
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

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
//         title="Delete Customer"
//         message={`Are you sure you want to delete "${pendingDelete?.company}"? This action cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//       />
//     </div>
//   );
// };

// // ------------------------------------------------------------
// // Building blocks
// // ------------------------------------------------------------

// const SummaryCard = ({ label, value, icon: Icon, color }) => {
//   const map = {
//     blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
//     green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
//     gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
//     indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
//     purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
//     amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
//   };
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
//       <div className="flex items-center justify-between mb-2">
//         <div
//           className={`w-8 h-8 rounded-lg flex items-center justify-center ${map[color]}`}
//         >
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

// export default Customers;