// src/admin/pages/accounts/ReportsCenterPage.jsx
import React, { useState } from "react";
import {
  Home, Star, Share2, User, Clock, Search, Plus, MoreHorizontal,
  Folder, ChevronDown, Printer, RotateCcw, X, Filter, FileText,
  Settings, Play, BarChart2, Menu, Share,
} from "lucide-react";
import { reportsCategories, allReports, pnlData } from "../../utils/reportsData";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const EmptyState = ({ icon: Icon, title, message, action }) => (
  <Card className="py-16 px-6">
    <div className="max-w-md mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon size={22} className="text-gray-400" />
      </div>
      <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-xs md:text-[12.5px] text-gray-500 mt-1.5 mb-5">{message}</p>
      {action}
    </div>
  </Card>
);

/* ---------- page ---------- */

const ReportsCenterPage = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [reportViewMode, setReportViewMode] = useState("Table");
  const [creationMode, setCreationMode] = useState("existing");
  const [selectedBaseReport, setSelectedBaseReport] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = allReports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === "All Reports") return matchesSearch;
    if (selectedCategory === "Favorites") return matchesSearch && report.isFavorite;
    return matchesSearch && report.category === selectedCategory;
  });

  /* =====================================================
     RENDER: REPORT VIEW
  ===================================================== */
  if (isViewingReport) {
    return (
      <div className="w-full overflow-x-hidden">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => setIsViewingReport(false)}
              className="p-2 mt-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
              aria-label="Back"
            >
              <FileText size={16} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Business overview
              </p>
              <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent mt-0.5">
                Profit and loss
              </h2>
              <p className="text-xs md:text-[13px] text-gray-500 mt-0.5 tabular-nums">
                From 01/10/2026 → 31/10/2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Share">
              <Share size={13} />
            </GhostBtn>
            <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Print">
              <Printer size={13} />
            </GhostBtn>
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              Export <ChevronDown size={13} />
            </GhostBtn>
            <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Refresh">
              <RotateCcw size={13} />
            </GhostBtn>
            <button
              onClick={() => setIsViewingReport(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <Card className="px-4 py-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider pr-2">
              <Filter size={12} /> Filters
            </span>
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              Date range: This month <ChevronDown size={13} />
            </GhostBtn>
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              Report basis: Accrual <ChevronDown size={13} />
            </GhostBtn>
            <GhostBtn className="border border-gray-200 dark:border-gray-700">
              <Plus size={13} /> More filters
            </GhostBtn>

            <div className="ml-auto inline-flex items-stretch rounded-full overflow-hidden">
              <button className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all">
                Run report
              </button>
              <button
                className="inline-flex items-center px-2 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 border-l border-white/20 transition-all"
                aria-label="More run options"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        </Card>

        {/* Body */}
        <div className="space-y-4">

          {/* View toggle + config */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5">
              {["Table", "Chart"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setReportViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    reportViewMode === mode
                      ? "bg-white dark:bg-gray-800 shadow-sm text-green-600 dark:text-green-400"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {mode} view
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <GhostBtn className="border border-gray-200 dark:border-gray-700">
                Compare with: None <ChevronDown size={13} />
              </GhostBtn>
              <GhostBtn className="border border-gray-200 dark:border-gray-700">
                Customize columns
                <span className="ml-1 px-1.5 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                  2
                </span>
              </GhostBtn>
              <GhostBtn className="!px-2 border border-gray-200 dark:border-gray-700" aria-label="Settings">
                <Settings size={13} />
              </GhostBtn>
            </div>
          </div>

          {/* Report card */}
          <Card className="p-6">
            <div className="text-center mb-8">
              <p className="text-xs text-gray-500">Fidha</p>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-1">
                Profit and loss
              </h3>
              <p className="text-xs text-gray-500 mt-1">Basis: Accrual</p>
              <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                From 01/10/2026 to 31/10/2026
              </p>
            </div>

            {reportViewMode === "Table" ? (
              <div className="max-w-4xl mx-auto overflow-x-auto">
                <table className="w-full text-xs md:text-[12.5px] whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-left font-semibold">Account</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pnlData.map((section, idx) => (
                      <React.Fragment key={idx}>
                        <tr
                          className={
                            section.isTotalRow
                              ? "font-semibold bg-gray-50/60 dark:bg-gray-700/30"
                              : ""
                          }
                        >
                          <td className="px-3 py-2.5 text-gray-900 dark:text-gray-100">
                            {section.section}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900 dark:text-gray-100 tabular-nums">
                            {section.total !== 0 || section.isTotalRow
                              ? section.total.toFixed(2)
                              : ""}
                          </td>
                        </tr>
                        {section.items.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                          >
                            <td className="px-6 py-2 text-green-600 dark:text-green-400 hover:underline cursor-pointer">
                              {item.name}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-200 tabular-nums">
                              {item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {section.items.length > 0 && (
                          <tr className="bg-gray-50/50 dark:bg-gray-700/20">
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">
                              Total for {section.section}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-200 font-medium tabular-nums">
                              {section.total.toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 flex-wrap">
                    <GhostBtn>
                      X-axis:{" "}
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Project
                      </span>{" "}
                      <ChevronDown size={13} />
                    </GhostBtn>
                    <GhostBtn>
                      Y-axis:{" "}
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Cost of goods sold
                      </span>{" "}
                      <ChevronDown size={13} />
                    </GhostBtn>
                  </div>
                  <div className="flex items-center gap-2">
                    <GhostBtn className="text-green-600 dark:text-green-400">
                      <Play size={12} /> Set target
                    </GhostBtn>
                    <GhostBtn>
                      <BarChart2 size={13} /> Bar chart <ChevronDown size={13} />
                    </GhostBtn>
                  </div>
                </div>

                <div className="h-64 sm:h-80 relative">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500 pb-10 tabular-nums">
                    <span>4 K</span>
                    <span>3 K</span>
                    <span>2 K</span>
                    <span>1 K</span>
                    <span>0</span>
                  </div>
                  <div className="ml-8 h-full flex items-end justify-around border-b border-l border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex flex-col items-center w-full">
                      <div className="w-14 bg-green-500 h-[70%] rounded-t hover:opacity-80 transition-opacity relative group cursor-pointer">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[11px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tabular-nums">
                          4,222.00
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs text-gray-800 dark:text-gray-100 font-medium">
                          Project
                        </p>
                        <p className="text-[10.5px] text-gray-500">
                          Not mentioned
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER: MAIN REPORTS PAGE
  ===================================================== */
  const NAV_ITEMS = [
    { name: "Home", icon: Home },
    { name: "Favorites", icon: Star },
    { name: "Shared Reports", icon: Share2 },
    { name: "My Reports", icon: User },
    { name: "Scheduled Reports", icon: Clock },
  ];

  const EMPTY_STATES = {
    Favorites: {
      icon: Star,
      title: "No favorite reports yet",
      message: "Click the star next to a report to pin it here for quick access.",
    },
    "Shared Reports": {
      icon: Share2,
      title: "No shared reports",
      message: "Reports shared with you by teammates will show up here.",
    },
    "My Reports": {
      icon: FileText,
      title: "No custom reports yet",
      message: "Create a custom report by customizing an existing one.",
      action: (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create new report
        </button>
      ),
    },
    "Scheduled Reports": {
      icon: Clock,
      title: "No scheduled reports",
      message: "Schedule reports to be delivered to your inbox automatically.",
    },
  };

  const empty = EMPTY_STATES[activeTab];

  return (
    <div className="w-full overflow-x-hidden flex flex-col">
      {/* ---- Header ---- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Accountant
              </p>
              <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent truncate mt-0.5">
                Reports center
              </h2>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search reports…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={13} /> Create report
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={13} />
            </button>
            <button
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="More"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search reports…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
            />
          </div>
        </div>
      </header>

      {/* ---- Body: Sidebar + Main ---- */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-[40] md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-[50] md:z-auto
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            flex flex-col shrink-0 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex justify-between items-center md:hidden px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
              Menu
            </h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 flex-1">
            <nav className="space-y-0.5 mb-6">
              {NAV_ITEMS.map((item) => {
                const active = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs md:text-[12.5px] font-medium transition-colors ${
                      active
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <item.icon
                      size={14}
                      className={
                        active
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400"
                      }
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <SectionLabel>Report categories</SectionLabel>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab("Home");
                  setSelectedCategory("All Reports");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-full text-xs md:text-[12.5px] transition-colors ${
                  selectedCategory === "All Reports"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                All reports
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10.5px] px-2 rounded-full font-medium tabular-nums">
                  {allReports.length}
                </span>
              </button>
              {reportsCategories.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab("Home");
                      setSelectedCategory(cat.name);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs md:text-[12.5px] transition-colors ${
                      active
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Folder size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "Home" && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                  {selectedCategory}
                  {selectedCategory === "All Reports" && (
                    <span className="ml-2 text-[11.5px] text-gray-500 font-normal tabular-nums">
                      {filteredReports.length}
                    </span>
                  )}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[700px] lg:min-w-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 sm:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Report name</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Category</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Created by</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Last visited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-12 text-center text-xs md:text-[13px] text-gray-500"
                          >
                            No reports match "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((report) => (
                          <tr
                            key={report.id}
                            className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => setIsViewingReport(true)}
                          >
                            <td className="px-4 sm:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                              <span className="inline-flex items-center gap-2">
                                <button
                                  className="text-gray-300 hover:text-amber-400 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="Toggle favorite"
                                >
                                  <Star
                                    size={13}
                                    fill={report.isFavorite ? "currentColor" : "none"}
                                    className={report.isFavorite ? "text-amber-400" : ""}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsViewingReport(true);
                                  }}
                                  className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                                >
                                  {report.name}
                                </button>
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {report.category}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              {report.createdBy}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500">
                              {report.lastVisited}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {["Favorites", "Shared Reports", "My Reports", "Scheduled Reports"].includes(
            activeTab
          ) &&
            empty && (
              <EmptyState
                icon={empty.icon}
                title={empty.title}
                message={empty.message}
                action={empty.action}
              />
            )}
        </main>
      </div>

      {/* ---- CREATE REPORT MODAL ---- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[100] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Create custom report
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-5">
              <p className="text-xs md:text-[12.5px] font-medium text-gray-700 dark:text-gray-200">
                Choose how you would like to create the report
              </p>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    key: "existing",
                    title: "Create from existing report",
                    description:
                      "Start with an existing report and customize it with filters, columns, layouts, and grouping.",
                  },
                  {
                    key: "scratch",
                    title: "Create an entirely new report",
                    description:
                      "Build reports from scratch using modules in the custom report builder.",
                  },
                ].map((opt) => {
                  const active = creationMode === opt.key;
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        active
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="creationMode"
                        checked={active}
                        onChange={() => setCreationMode(opt.key)}
                        className="mt-0.5 text-green-500 focus:ring-green-400 border-gray-300 dark:border-gray-600"
                      />
                      <div>
                        <h3 className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100">
                          {opt.title}
                        </h3>
                        <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {creationMode === "existing" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Select a report
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                    value={selectedBaseReport}
                    onChange={(e) => setSelectedBaseReport(e.target.value)}
                  >
                    <option value="">Select a report</option>
                    {allReports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creationMode === "existing" && !selectedBaseReport}
                className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ReportsCenterPage;