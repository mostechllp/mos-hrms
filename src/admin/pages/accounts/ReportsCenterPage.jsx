import React, { useState } from "react";
import {
  Home, Star, Share2, User, Clock, Search, Plus, MoreHorizontal,
  Folder, ChevronDown, Printer, RotateCcw, X, Filter, FileText,
  Settings, Play, BarChart2, Menu, Share, Layers,
} from "lucide-react";
import { reportsCategories, allReports, pnlData } from "../../utils/reportsData";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const EmptyState = ({ icon: Icon, title, message, action }) => (
  <Surface className="py-16 px-6">
    <div className="max-w-md mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon size={22} className="text-slate-400" />
      </div>
      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-[12.5px] text-slate-500 mt-1.5 mb-5">{message}</p>
      {action}
    </div>
  </Surface>
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
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={() => setIsViewingReport(false)}
                className="p-2 mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                aria-label="Back"
              >
                <FileText size={16} />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Business overview
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                  Profit and loss
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 tabular-nums">
                  From 01/10/2026 → 31/10/2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800" aria-label="Share">
                <Share size={13} />
              </GhostBtn>
              <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800" aria-label="Print">
                <Printer size={13} />
              </GhostBtn>
              <GhostBtn className="border border-slate-200 dark:border-slate-800">
                Export <ChevronDown size={13} />
              </GhostBtn>
              <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800" aria-label="Refresh">
                <RotateCcw size={13} />
              </GhostBtn>
              <button
                onClick={() => setIsViewingReport(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Filters bar */}
          <Surface className="px-4 py-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider pr-2">
                <Filter size={12} /> Filters
              </span>
              <GhostBtn className="border border-slate-200 dark:border-slate-800">
                Date range: This month <ChevronDown size={13} />
              </GhostBtn>
              <GhostBtn className="border border-slate-200 dark:border-slate-800">
                Report basis: Accrual <ChevronDown size={13} />
              </GhostBtn>
              <GhostBtn className="border border-slate-200 dark:border-slate-800">
                <Plus size={13} /> More filters
              </GhostBtn>

              <div className="ml-auto inline-flex items-stretch rounded-lg overflow-hidden">
                <button className="px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Run report
                </button>
                <button
                  className="inline-flex items-center px-2 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-l border-white/10 dark:border-slate-900/10 transition-colors"
                  aria-label="More run options"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          </Surface>

          {/* Body */}
          <div className="space-y-4">

            {/* View toggle + config */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="inline-flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                {["Table", "Chart"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setReportViewMode(mode)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                      reportViewMode === mode
                        ? "bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-100"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {mode} view
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <GhostBtn className="border border-slate-200 dark:border-slate-800">
                  Compare with: None <ChevronDown size={13} />
                </GhostBtn>
                <GhostBtn className="border border-slate-200 dark:border-slate-800">
                  Customize columns
                  <span className="ml-1 px-1.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    2
                  </span>
                </GhostBtn>
                <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800" aria-label="Settings">
                  <Settings size={13} />
                </GhostBtn>
              </div>
            </div>

            {/* Report card */}
            <Surface className="p-6">
              <div className="text-center mb-8">
                <p className="text-[12px] text-slate-500">Fidha</p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  Profit and loss
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">Basis: Accrual</p>
                <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                  From 01/10/2026 to 31/10/2026
                </p>
              </div>

              {reportViewMode === "Table" ? (
                <div className="max-w-4xl mx-auto overflow-x-auto">
                  <table className="w-full text-[12.5px] whitespace-nowrap">
                    <thead>
                      <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="px-3 py-2.5 text-left font-medium">Account</th>
                        <th className="px-3 py-2.5 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pnlData.map((section, idx) => (
                        <React.Fragment key={idx}>
                          <tr
                            className={
                              section.isTotalRow
                                ? "font-semibold bg-slate-50/60 dark:bg-slate-800/30"
                                : ""
                            }
                          >
                            <td className="px-3 py-2.5 text-slate-900 dark:text-slate-100">
                              {section.section}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-900 dark:text-slate-100 tabular-nums">
                              {section.total !== 0 || section.isTotalRow
                                ? section.total.toFixed(2)
                                : ""}
                            </td>
                          </tr>
                          {section.items.map((item, i) => (
                            <tr
                              key={i}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="px-6 py-2 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                {item.name}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200 tabular-nums">
                                {item.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          {section.items.length > 0 && (
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-medium">
                                Total for {section.section}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200 font-medium tabular-nums">
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 flex-wrap">
                      <GhostBtn>
                        X-axis:{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          Project
                        </span>{" "}
                        <ChevronDown size={13} />
                      </GhostBtn>
                      <GhostBtn>
                        Y-axis:{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          Cost of goods sold
                        </span>{" "}
                        <ChevronDown size={13} />
                      </GhostBtn>
                    </div>
                    <div className="flex items-center gap-2">
                      <GhostBtn className="text-blue-600 dark:text-blue-400">
                        <Play size={12} /> Set target
                      </GhostBtn>
                      <GhostBtn>
                        <BarChart2 size={13} /> Bar chart <ChevronDown size={13} />
                      </GhostBtn>
                    </div>
                  </div>

                  <div className="h-64 sm:h-80 relative">
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 pb-10 tabular-nums">
                      <span>4 K</span>
                      <span>3 K</span>
                      <span>2 K</span>
                      <span>1 K</span>
                      <span>0</span>
                    </div>
                    <div className="ml-8 h-full flex items-end justify-around border-b border-l border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex flex-col items-center w-full">
                        <div className="w-14 bg-slate-900 dark:bg-slate-100 h-[70%] rounded-t hover:opacity-80 transition-opacity relative group cursor-pointer">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tabular-nums">
                            4,222.00
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-[12px] text-slate-800 dark:text-slate-100 font-medium">
                            Project
                          </p>
                          <p className="text-[10.5px] text-slate-500">
                            Not mentioned
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Surface>
          </div>
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create new report
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* ---- Header ---- */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Accountant
              </p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                Reports center
              </h1>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search reports…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> Create report
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} />
            </button>
            <GhostBtn className="!px-2 border border-slate-200 dark:border-slate-800" aria-label="More">
              <MoreHorizontal size={16} />
            </GhostBtn>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search reports…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
            />
          </div>
        </div>
      </header>

      {/* ---- Body: Sidebar + Main ---- */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-[40] md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-[50] md:z-auto
            w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
            flex flex-col shrink-0 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex justify-between items-center md:hidden px-4 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              Menu
            </h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <item.icon
                      size={14}
                      className={
                        active
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-400"
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
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-colors ${
                  selectedCategory === "All Reports"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                All reports
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] px-1.5 rounded-full font-medium tabular-nums">
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
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] transition-colors ${
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Folder size={13} className="text-slate-400 shrink-0" />
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
            <Surface className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  {selectedCategory}
                  {selectedCategory === "All Reports" && (
                    <span className="ml-2 text-[11.5px] text-slate-500 font-normal tabular-nums">
                      {filteredReports.length}
                    </span>
                  )}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] whitespace-nowrap">
                  <thead>
                    <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-4 sm:px-5 py-2.5 text-left font-medium">Report name</th>
                      <th className="px-4 py-2.5 text-left font-medium">Category</th>
                      <th className="px-4 py-2.5 text-left font-medium">Created by</th>
                      <th className="px-4 py-2.5 text-left font-medium">Last visited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-[13px] text-slate-500"
                        >
                          No reports match "{searchQuery}"
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr
                          key={report.id}
                          className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          onClick={() => setIsViewingReport(true)}
                        >
                          <td className="px-4 sm:px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                            <span className="inline-flex items-center gap-2">
                              <button
                                className="text-slate-300 hover:text-amber-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Toggle favorite"
                              >
                                <Star
                                  size={13}
                                  fill={report.isFavorite ? "currentColor" : "none"}
                                  className={report.isFavorite ? "text-amber-400" : ""}
                                />
                              </button>
                              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {report.name}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {report.category}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {report.createdBy}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {report.lastVisited}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Surface>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[100] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Create custom report
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-5">
              <p className="text-[12.5px] font-medium text-slate-700 dark:text-slate-200">
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
                      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        active
                          ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/60"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="creationMode"
                        checked={active}
                        onChange={() => setCreationMode(opt.key)}
                        className="mt-0.5 text-slate-900 focus:ring-slate-400 border-slate-300"
                      />
                      <div>
                        <h3 className="text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                          {opt.title}
                        </h3>
                        <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {creationMode === "existing" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-slate-600 dark:text-slate-300">
                    Select a report
                  </label>
                  <select
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
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
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creationMode === "existing" && !selectedBaseReport}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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