import React from 'react'
import UnderDevelopment from "../../../components/common/UnderDevelopment"

const CrmDashboard = () => {
  return (
    <UnderDevelopment pageName='CRM Dashboard'/>
  )
}

export default CrmDashboard

// // src/admin/pages/crm/CrmDashboard.jsx

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Users,
//   UserCheck,
//   Briefcase,
//   IndianRupee,
//   TrendingUp,
//   TrendingDown,
//   CalendarClock,
//   AlertCircle,
//   Target,
//   FileText,
//   DollarSign,
//   RefreshCw,
//   Download,
//   Plus,
//   Eye,
//   BarChart3,
// } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// // ------------------------------------------------------------
// // STATIC DATA (replace with API later)
// // ------------------------------------------------------------

// const SUMMARY_CARDS = {
//   leads: { value: 128, label: "Total leads" },
//   customers: { value: 64, label: "Total customers" },
//   openOpportunities: { value: 24, label: "Open opportunities" },
//   pipeline: { value: "₹12.5L", label: "Estimated open deal value" },
// };

// const SECONDARY_CARDS = [
//   { key: "newLeads", label: "New leads this month", value: 32, icon: Users, color: "blue" },
//   { key: "wonDeals", label: "Won deals this month", value: 12, icon: TrendingUp, color: "green" },
//   { key: "lostDeals", label: "Lost deals this month", value: 5, icon: TrendingDown, color: "red" },
//   { key: "followUps", label: "Follow-ups due today", value: 8, icon: CalendarClock, color: "amber" },
//   { key: "overdue", label: "Overdue activities", value: 3, icon: AlertCircle, color: "orange" },
//   { key: "conversion", label: "Conversion rate", value: "18.5%", icon: Target, color: "indigo" },
//   { key: "quotationValue", label: "Quotation value", value: "₹8.2L", icon: FileText, color: "purple" },
//   { key: "avgDeal", label: "Average deal value", value: "₹52K", icon: DollarSign, color: "teal" },
// ];

// const PIPELINE_DATA = [
//   { stage: "New", count: 45, value: 420000 },
//   { stage: "Qualified", count: 28, value: 560000 },
//   { stage: "Proposal Sent", count: 18, value: 380000 },
//   { stage: "Negotiation", count: 12, value: 290000 },
//   { stage: "Won", count: 12, value: 240000 },
//   { stage: "Lost", count: 5, value: 80000 },
// ];

// const LEAD_SOURCE_DATA = [
//   { name: "Website", value: 42 },
//   { name: "Referral", value: 28 },
//   { name: "Social Media", value: 18 },
//   { name: "Phone", value: 14 },
//   { name: "Email", value: 12 },
//   { name: "Exhibition", value: 8 },
//   { name: "Manual Entry", value: 4 },
//   { name: "Other", value: 2 },
// ];

// const LEAD_SOURCE_COLORS = [
//   "#3b82f6",
//   "#10b981",
//   "#f59e0b",
//   "#8b5cf6",
//   "#ec4899",
//   "#06b6d4",
//   "#ef4444",
//   "#6b7280",
// ];

// const MONTHLY_SALES_DATA = [
//   { month: "Jan", deals: 8, value: 180000 },
//   { month: "Feb", deals: 10, value: 240000 },
//   { month: "Mar", deals: 12, value: 310000 },
//   { month: "Apr", deals: 9, value: 220000 },
//   { month: "May", deals: 14, value: 380000 },
//   { month: "Jun", deals: 11, value: 290000 },
//   { month: "Jul", deals: 15, value: 420000 },
//   { month: "Aug", deals: 13, value: 350000 },
//   { month: "Sep", deals: 12, value: 240000 },
// ];

// const UPCOMING_ACTIVITIES = [
//   { id: 1, title: "Follow-up call", customer: "Acme Corp", assignee: "Riya Roy", dueDate: "2026-09-16", priority: "High", status: "Pending" },
//   { id: 2, title: "Product demo", customer: "Globex Ltd", assignee: "Karthik Raj", dueDate: "2026-09-17", priority: "Medium", status: "Scheduled" },
//   { id: 3, title: "Proposal review", customer: "Initech", assignee: "Riya Roy", dueDate: "2026-09-18", priority: "High", status: "Pending" },
//   { id: 4, title: "Contract signing", customer: "Umbrella Inc", assignee: "Aarav Mehta", dueDate: "2026-09-19", priority: "Low", status: "Scheduled" },
//   { id: 5, title: "Discovery call", customer: "Stark Industries", assignee: "Karthik Raj", dueDate: "2026-09-20", priority: "Medium", status: "Pending" },
// ];

// const RECENT_ACTIVITY = [
//   { id: 1, type: "lead_created", text: "New lead created: Acme Corp", user: "Riya Roy", time: "10 min ago" },
//   { id: 2, type: "customer_updated", text: "Customer updated: Globex Ltd", user: "Karthik Raj", time: "45 min ago" },
//   { id: 3, type: "opportunity_stage", text: "Opportunity moved to Negotiation: Initech", user: "Riya Roy", time: "2 hours ago" },
//   { id: 4, type: "quotation_created", text: "Quotation created #Q-2026-0148", user: "Aarav Mehta", time: "3 hours ago" },
//   { id: 5, type: "follow_up_done", text: "Follow-up completed: Umbrella Inc", user: "Karthik Raj", time: "5 hours ago" },
// ];

// // ------------------------------------------------------------
// // CONFIG
// // ------------------------------------------------------------

// const DATE_RANGES = [
//   { value: "today", label: "Today" },
//   { value: "week", label: "This Week" },
//   { value: "month", label: "This Month" },
//   { value: "quarter", label: "This Quarter" },
//   { value: "custom", label: "Custom Range" },
// ];

// const SALESPERSONS = [
//   { value: "", label: "All Salespersons" },
//   { value: "riya", label: "Riya Roy" },
//   { value: "karthik", label: "Karthik Raj" },
//   { value: "aarav", label: "Aarav Mehta" },
// ];

// const TEAMS = [
//   { value: "", label: "All Teams" },
//   { value: "sales", label: "Sales" },
//   { value: "inside-sales", label: "Inside Sales" },
//   { value: "field-sales", label: "Field Sales" },
// ];

// const CARD_COLOR_MAP = {
//   blue: {
//     bg: "bg-blue-100 dark:bg-blue-900/30",
//     text: "text-blue-600 dark:text-blue-400",
//   },
//   green: {
//     bg: "bg-green-100 dark:bg-green-900/30",
//     text: "text-green-600 dark:text-green-400",
//   },
//   red: {
//     bg: "bg-red-100 dark:bg-red-900/30",
//     text: "text-red-600 dark:text-red-400",
//   },
//   amber: {
//     bg: "bg-amber-100 dark:bg-amber-900/30",
//     text: "text-amber-600 dark:text-amber-400",
//   },
//   orange: {
//     bg: "bg-orange-100 dark:bg-orange-900/30",
//     text: "text-orange-600 dark:text-orange-400",
//   },
//   indigo: {
//     bg: "bg-indigo-100 dark:bg-indigo-900/30",
//     text: "text-indigo-600 dark:text-indigo-400",
//   },
//   purple: {
//     bg: "bg-purple-100 dark:bg-purple-900/30",
//     text: "text-purple-600 dark:text-purple-400",
//   },
//   teal: {
//     bg: "bg-teal-100 dark:bg-teal-900/30",
//     text: "text-teal-600 dark:text-teal-400",
//   },
// };

// // ------------------------------------------------------------
// // HELPERS
// // ------------------------------------------------------------

// const formatCurrency = (n) => {
//   if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
//   if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
//   return `₹${n}`;
// };

// const formatDate = (d) => {
//   if (!d) return "—";
//   return new Date(d).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//   });
// };

// const priorityBadge = (priority) => {
//   const map = {
//     High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
//     Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
//     Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
//   };
//   return map[priority] || map.Medium;
// };

// const ACTIVITY_ICON_MAP = {
//   lead_created: { icon: Users, color: "text-blue-500" },
//   customer_updated: { icon: UserCheck, color: "text-green-500" },
//   opportunity_stage: { icon: Briefcase, color: "text-purple-500" },
//   quotation_created: { icon: FileText, color: "text-amber-500" },
//   follow_up_done: { icon: CalendarClock, color: "text-teal-500" },
// };

// // ------------------------------------------------------------
// // COMPONENT
// // ------------------------------------------------------------

// const CrmDashboard = () => {
//   const navigate = useNavigate();

//   const [dateRange, setDateRange] = useState("month");
//   const [salesperson, setSalesperson] = useState("");
//   const [team, setTeam] = useState("");
//   const [refreshing, setRefreshing] = useState(false);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     // TODO: dispatch(fetchCrmDashboard({ dateRange, salesperson, team }))
//     setTimeout(() => setRefreshing(false), 800);
//   };

//   const handleExport = () => {
//     // TODO: trigger CSV/PDF export
//     console.log("Export dashboard report");
//   };

//   return (
//     <div className="w-full space-y-6">
//       {/* ============================================================
//           A. HEADER
//           ============================================================ */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//             CRM Dashboard
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Overview of your sales pipeline, leads, and activities
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
//           {/* Date range */}
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//           >
//             {DATE_RANGES.map((r) => (
//               <option key={r.value} value={r.value}>
//                 {r.label}
//               </option>
//             ))}
//           </select>

//           {/* Salesperson */}
//           <select
//             value={salesperson}
//             onChange={(e) => setSalesperson(e.target.value)}
//             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//           >
//             {SALESPERSONS.map((s) => (
//               <option key={s.value} value={s.value}>
//                 {s.label}
//               </option>
//             ))}
//           </select>

//           {/* Team */}
//           <select
//             value={team}
//             onChange={(e) => setTeam(e.target.value)}
//             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//           >
//             {TEAMS.map((t) => (
//               <option key={t.value} value={t.value}>
//                 {t.label}
//               </option>
//             ))}
//           </select>

//           {/* Refresh */}
//           <button
//             onClick={handleRefresh}
//             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
//             title="Refresh"
//           >
//             <RefreshCw
//               size={14}
//               className={refreshing ? "animate-spin" : ""}
//             />
//             <span className="sm:hidden lg:inline">Refresh</span>
//           </button>

//           {/* Export */}
//           <button
//             onClick={handleExport}
//             className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
//             title="Export report"
//           >
//             <Download size={14} />
//             <span className="sm:hidden lg:inline">Export</span>
//           </button>
//         </div>
//       </div>

//       {/* ============================================================
//           B. PRIMARY SUMMARY CARDS
//           ============================================================ */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
//         {/* Leads */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
//           <div className="flex justify-between items-start mb-3">
//             <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
//               <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//             </div>
//           </div>
//           <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
//             {SUMMARY_CARDS.leads.value}
//           </div>
//           <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
//             {SUMMARY_CARDS.leads.label}
//           </div>
//         </div>

//         {/* Customers */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
//           <div className="flex justify-between items-start mb-3">
//             <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
//               <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
//             </div>
//           </div>
//           <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
//             {SUMMARY_CARDS.customers.value}
//           </div>
//           <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
//             {SUMMARY_CARDS.customers.label}
//           </div>
//         </div>

//         {/* Open Opportunities */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
//           <div className="flex justify-between items-start mb-3">
//             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
//               <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//             </div>
//           </div>
//           <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
//             {SUMMARY_CARDS.openOpportunities.value}
//           </div>
//           <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
//             {SUMMARY_CARDS.openOpportunities.label}
//           </div>
//         </div>

//         {/* Pipeline Value */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
//           <div className="flex justify-between items-start mb-3">
//             <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
//               <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
//             </div>
//           </div>
//           <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
//             {SUMMARY_CARDS.pipeline.value}
//           </div>
//           <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
//             {SUMMARY_CARDS.pipeline.label}
//           </div>
//         </div>
//       </div>

//       {/* ============================================================
//           B2. SECONDARY CARDS
//           ============================================================ */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//         {SECONDARY_CARDS.map((card) => {
//           const Icon = card.icon;
//           const colors = CARD_COLOR_MAP[card.color] || CARD_COLOR_MAP.blue;
//           return (
//             <div
//               key={card.key}
//               className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <div
//                   className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}
//                 >
//                   <Icon className={`w-4 h-4 ${colors.text}`} />
//                 </div>
//               </div>
//               <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
//                 {card.value}
//               </div>
//               <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                 {card.label}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ============================================================
//           C. CHARTS
//           ============================================================ */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {/* Sales Pipeline */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-base font-bold text-gray-900 dark:text-white">
//               Sales Pipeline
//             </h2>
//             <BarChart3 size={16} className="text-gray-400" />
//           </div>
//           <ResponsiveContainer width="100%" height={280}>
//             <BarChart data={PIPELINE_DATA}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
//               <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
//               <YAxis tick={{ fontSize: 11 }} />
//               <Tooltip
//                 formatter={(value, name) =>
//                   name === "count" ? [value, "Deals"] : [value, name]
//                 }
//                 contentStyle={{ fontSize: 12, borderRadius: 8 }}
//               />
//               <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Lead Source */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-base font-bold text-gray-900 dark:text-white">
//               Lead Sources
//             </h2>
//           </div>
//           <ResponsiveContainer width="100%" height={280}>
//             <PieChart>
//               <Pie
//                 data={LEAD_SOURCE_DATA}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={90}
//                 innerRadius={45}
//                 paddingAngle={2}
//                 label={({ name, percent }) =>
//                   `${name} ${(percent * 100).toFixed(0)}%`
//                 }
//                 labelLine={false}
//               >
//                 {LEAD_SOURCE_DATA.map((_, i) => (
//                   <Cell
//                     key={i}
//                     fill={LEAD_SOURCE_COLORS[i % LEAD_SOURCE_COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Monthly Sales */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-base font-bold text-gray-900 dark:text-white">
//             Monthly Sales
//           </h2>
//           <div className="flex items-center gap-3 text-xs">
//             <div className="flex items-center gap-1.5">
//               <div className="w-3 h-3 rounded-full bg-blue-500" />
//               <span className="text-gray-600 dark:text-gray-400">Deals</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-3 h-3 rounded-full bg-emerald-500" />
//               <span className="text-gray-600 dark:text-gray-400">Value</span>
//             </div>
//           </div>
//         </div>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={MONTHLY_SALES_DATA}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
//             <XAxis dataKey="month" tick={{ fontSize: 11 }} />
//             <YAxis
//               yAxisId="left"
//               tick={{ fontSize: 11 }}
//               label={{ value: "Deals", angle: -90, position: "insideLeft", fontSize: 11 }}
//             />
//             <YAxis
//               yAxisId="right"
//               orientation="right"
//               tick={{ fontSize: 11 }}
//               tickFormatter={(v) => formatCurrency(v)}
//             />
//             <Tooltip
//               formatter={(value, name) =>
//                 name === "value" ? [formatCurrency(value), "Value"] : [value, "Deals"]
//               }
//               contentStyle={{ fontSize: 12, borderRadius: 8 }}
//             />
//             <Line
//               yAxisId="left"
//               type="monotone"
//               dataKey="deals"
//               stroke="#3b82f6"
//               strokeWidth={2}
//               dot={{ r: 3 }}
//             />
//             <Line
//               yAxisId="right"
//               type="monotone"
//               dataKey="value"
//               stroke="#10b981"
//               strokeWidth={2}
//               dot={{ r: 3 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* ============================================================
//           C2. UPCOMING ACTIVITIES + RECENT ACTIVITY
//           ============================================================ */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Upcoming activities (2 cols) */}
//         <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
//             <h2 className="text-base font-bold text-gray-900 dark:text-white">
//               Upcoming Activities
//             </h2>
//             <button
//               onClick={() => navigate("/admin/crm/activities")}
//               className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
//             >
//               View all →
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Activity
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Customer
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Assignee
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Due
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Priority
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Status
//                   </th>
//                   <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {UPCOMING_ACTIVITIES.map((a) => (
//                   <tr
//                     key={a.id}
//                     className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
//                   >
//                     <td className="px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
//                       {a.title}
//                     </td>
//                     <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
//                       {a.customer}
//                     </td>
//                     <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
//                       {a.assignee}
//                     </td>
//                     <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
//                       {formatDate(a.dueDate)}
//                     </td>
//                     <td className="px-4 py-2.5">
//                       <span
//                         className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityBadge(
//                           a.priority,
//                         )}`}
//                       >
//                         {a.priority}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400">
//                       {a.status}
//                     </td>
//                     <td className="px-4 py-2.5">
//                       <button
//                         onClick={() =>
//                           navigate(`/admin/crm/activities/${a.id}`)
//                         }
//                         className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
//                         title="View"
//                       >
//                         <Eye size={14} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Recent activity feed */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
//             <h2 className="text-base font-bold text-gray-900 dark:text-white">
//               Recent Activity
//             </h2>
//           </div>
//           <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
//             {RECENT_ACTIVITY.map((act) => {
//               const meta = ACTIVITY_ICON_MAP[act.type] || {
//                 icon: AlertCircle,
//                 color: "text-gray-500",
//               };
//               const Icon = meta.icon;
//               return (
//                 <div
//                   key={act.id}
//                   className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
//                 >
//                   <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <Icon className={`w-4 h-4 ${meta.color}`} />
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
//                       {act.text}
//                     </p>
//                     <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
//                       {act.user} · {act.time}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ============================================================
//           D. ACTION BUTTONS
//           ============================================================ */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//         <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
//           Quick Actions
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           <button
//             onClick={() => navigate("/admin/crm/leads/new")}
//             className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
//           >
//             <Plus size={16} /> Add Lead
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/customers/new")}
//             className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
//           >
//             <Plus size={16} /> Add Customer
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/opportunities/new")}
//             className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
//           >
//             <Plus size={16} /> Add Opportunity
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/activities/new")}
//             className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
//           >
//             <Plus size={16} /> Schedule Activity
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
//           <button
//             onClick={() => navigate("/admin/crm/leads")}
//             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
//           >
//             <Eye size={15} /> View All Leads
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/opportunities")}
//             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
//           >
//             <BarChart3 size={15} /> View Pipeline
//           </button>
//           <button
//             onClick={() => navigate("/admin/crm/reports")}
//             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
//           >
//             <FileText size={15} /> View Reports
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CrmDashboard;