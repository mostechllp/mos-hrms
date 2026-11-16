// src/admin/pages/accounts/ProjectsPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProject } from "../../store/slices/accounts/projectsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, Box, FileText,
  Clock, CheckCircle2, X, Search, Filter,
  User, Trash2, Edit2, Link, FolderKanban,
  IndianRupee
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
    <Icon size={14} className="text-gray-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    primary:
      "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    warning:
      "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-colors ${tones[tone]}`}
    >
      <Icon size={14} />
    </button>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-xs md:text-[12.5px] font-medium text-gray-900 dark:text-gray-100">{value || "—"}</p>
  </div>
);

const Metric = ({ label, value, sub }) => (
  <div className="text-center">
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-base font-semibold text-gray-900 dark:text-gray-50 tabular-nums">{value}</p>
    {sub && <p className="text-[11.5px] text-gray-500 mt-0.5 tabular-nums">{sub}</p>}
  </div>
);

/* ---------- page ---------- */

const ProjectsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector((s) => s.accountProjects.projects) || [];

  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timerNote, setTimerNote] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedProject?.id === deleteTarget.id) setSelectedProject(null);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  const openTimerModal = (e) => {
    if (e) e.stopPropagation();
    setIsTimerModalOpen(true);
  };

  const totalProjects = projects.length;
  const hourlyProjects = projects.filter((p) => p.billingMethod?.toLowerCase().includes("hourly")).length;
  const fixedProjects = projects.filter((p) => p.billingMethod?.toLowerCase().includes("fixed")).length;
  const totalUnbilled = projects.reduce(
    (s, p) => s + (p.stats?.unbilledHours === "00:00" ? 0 : 500),
    0
  );

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---- Stats Cards ---- */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat label="Total Projects" value={totalProjects} icon={FolderKanban} color="green" />
        <MiniStat label="Hourly Billed" value={hourlyProjects} icon={Clock} color="blue" />
        <MiniStat label="Fixed Cost" value={fixedProjects} icon={FileText} color="violet" />
        <MiniStat
          label="Unbilled Amount"
          value={`₹${totalUnbilled.toFixed(2)}`}
          icon={IndianRupee}
          color="amber"
          isMoney
        />
      </div>

      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Projects
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalProjects === 0
              ? "No projects yet"
              : `${totalProjects} ${totalProjects === 1 ? "project" : "projects"} tracked`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <GhostBtn title="Filter" className="border border-gray-200 dark:border-gray-700 !px-2">
            <Filter size={15} />
          </GhostBtn>

          <button
            onClick={() => openTimerModal()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Clock size={13} /> Start timer
          </button>

          <button
            onClick={() => navigate("/admin/accounts/time-tracking/projects/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Project
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden">
                <MenuItem icon={Filter}   label="Filter" />
                <MenuItem icon={FileText} label="Export" />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5" />
                <MenuItem icon={Clock}    label="Preferences" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Empty state ---- */}
      {totalProjects === 0 ? (
        <EmptyState onCreate={() => navigate("/admin/accounts/time-tracking/projects/new")} />
      ) : (
        /* ---- Table surface ---- */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Project name
                    </th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Billing method</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Logged hours</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Unbilled amount</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                          aria-label={`Select ${project.projectName}`}
                        />
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                          }}
                          className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                        >
                          {project.projectName}
                        </button>
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {project.customerName}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {project.billingMethod}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        {project.stats?.loggedHours || "00:00"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                        ₹{Number(project.stats?.unbilledHours === "00:00" ? 0 : 500).toFixed(2)}
                      </td>

                      <td className="px-3 md:px-4 py-2 md:py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <IconAction icon={Search} label="View" tone="primary" onClick={() => setSelectedProject(project)} />
                          <IconAction
                            icon={Edit2}
                            label="Edit"
                            tone="warning"
                            onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${project.id}`)}
                          />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(project)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ---- Drawer ---- */}
      {selectedProject && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedProject(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Project</p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                  {selectedProject.projectName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${selectedProject.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => openTimerModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <Clock size={13} /> Log time
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "Timesheet", "Purchases", "Sales", "Budget configuration", "Journals", "Activity logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-xs md:text-[12.5px] font-medium transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">

              {activeTab === "Overview" && (
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left panel */}
                  <div className="lg:w-72 space-y-4 shrink-0">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          <Box size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">{selectedProject.projectName}</p>
                          <p className="text-[11.5px] text-gray-500">{selectedProject.billingMethod}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <DetailItem label="Customer"      value={selectedProject.customerName} />
                        <DetailItem label="Rate per hour" value={`₹${Number(selectedProject.ratePerHour || 22).toFixed(2)}`} />
                        <DetailItem label="Watchlist"     value="Enabled" />
                      </div>
                    </Card>
                  </div>

                  {/* Right panel */}
                  <div className="flex-1 min-w-0 space-y-4">

                    {/* Chart card */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                          <button className="px-2.5 py-1 text-[11.5px] font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-full">
                            Project hours
                          </button>
                          <button className="px-2.5 py-1 text-[11.5px] font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-full transition-colors">
                            Profitability
                          </button>
                        </div>
                        <button className="inline-flex items-center gap-1 text-[11.5px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          This week <ChevronDown size={11} />
                        </button>
                      </div>

                      <div className="h-40 flex items-end justify-between gap-1 px-1">
                        {[25, 26, 27, 28, 29, 30, 31].map((day) => (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full max-w-[8px] bg-gray-200 dark:bg-gray-700 rounded-t" style={{ height: `${8 + (day % 5) * 8}px` }}></div>
                            <span className="text-[10px] text-gray-400">{day}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <Metric label="Logged"   value="00:00" sub="₹0.00" />
                        <Metric label="Billable" value="00:00" sub="₹0.00" />
                        <Metric label="Billed"   value="00:00" sub="₹0.00" />
                        <Metric label="Unbilled" value="00:00" sub="₹0.00" />
                      </div>
                    </Card>

                    {/* Users */}
                    <Card>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <SectionLabel>Users</SectionLabel>
                        <button className="text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          + Add user
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <th className="text-left  font-medium px-4 py-2">Name</th>
                              <th className="text-right font-medium px-4 py-2">Logged</th>
                              <th className="text-right font-medium px-4 py-2">Billed</th>
                              <th className="text-right font-medium px-4 py-2">Unbilled</th>
                              <th className="text-right font-medium px-4 py-2">Role</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {selectedProject.users?.length ? selectedProject.users.map((user) => (
                              <tr key={user.id}>
                                <td className="px-4 py-2.5">
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                                  <p className="text-[11px] text-gray-500">{user.email}</p>
                                </td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right text-gray-500">{user.role || "—"}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-xs md:text-[12.5px] text-gray-500">No users yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Tasks */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <SectionLabel>Project tasks</SectionLabel>
                        <button className="text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          + Add task
                        </button>
                      </div>
                      <p className="text-xs md:text-[12.5px] text-gray-500">No project tasks have been added.</p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "Purchases" && (
                <div className="space-y-3">
                  {[
                    { title: "Expenses",         empty: "There are no expenses" },
                    { title: "Bills",            empty: "There are no bills" },
                    { title: "Purchase orders",  empty: "There are no purchase orders" },
                    { title: "Vendor credits",   empty: "No data to display" },
                  ].map((s) => (
                    <EmptySection key={s.title} title={s.title} message={s.empty} />
                  ))}
                </div>
              )}

              {activeTab === "Sales" && (
                <div className="space-y-3">
                  {[
                    { title: "Invoices",       empty: "There are no invoices" },
                    { title: "Quotes",         empty: "There are no quotes" },
                    { title: "Sales orders",   empty: "There are no sales orders" },
                    { title: "Credit notes",   empty: "There are no credit notes" },
                  ].map((s) => (
                    <EmptySection key={s.title} title={s.title} message={s.empty} />
                  ))}
                </div>
              )}

              {activeTab === "Budget configuration" && (
                <Card className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1">Set a budget for this project</p>
                    <p className="text-xs text-gray-500 mb-5">
                      Track actuals against budgeted cost and revenue to stay ahead of project finances.
                    </p>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all">
                      Create budget
                    </button>
                  </div>
                </Card>
              )}

              {!["Overview", "Purchases", "Sales", "Budget configuration"].includes(activeTab) && (
                <Card className="py-20 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <p className="text-xs md:text-[13px] font-medium text-gray-700 dark:text-gray-200 mb-1">No data</p>
                  <p className="text-xs text-gray-500">Nothing to show under {activeTab} yet.</p>
                </Card>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ---- Start timer modal ---- */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                <Clock size={14} /> Start timer
              </div>
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center py-6">
              <div className="text-3xl font-semibold text-gray-800 dark:text-gray-100 tracking-wider tabular-nums">
                00 : 00 : 00
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <button className="text-xs md:text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 inline-flex items-center gap-1 transition-colors">
                <Link size={12} /> Associate project
              </button>
              <div className="space-y-1.5">
                <label className="text-xs md:text-[12px] font-medium text-gray-600 dark:text-gray-300">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                  placeholder="Add notes…"
                  value={timerNote}
                  onChange={(e) => setTimerNote(e.target.value)}
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Start timer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete project"
        message={`Are you sure you want to delete "${deleteTarget?.projectName}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

/* ---------- sub-components ---------- */

const MiniStat = ({ label, value, icon: Icon, color, isMoney }) => {
  const bg = {
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    violet: "bg-violet-100 dark:bg-violet-900/30",
  }[color] || "bg-gray-100 dark:bg-gray-700";

  const fg = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    violet: "text-violet-600 dark:text-violet-400",
  }[color] || "text-gray-600 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon size={18} className={fg} />}
        </div>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

const EmptySection = ({ title, message }) => (
  <Card>
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <SectionLabel>{title}</SectionLabel>
      <button className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
        <Filter size={10} /> Status: All <ChevronDown size={10} />
      </button>
    </div>
    <p className="text-center py-8 text-xs md:text-[12.5px] text-gray-500">{message}</p>
  </Card>
);

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: User,         label: "Customer" },
    { icon: FileText,     label: "Project",   tone: "accent" },
    { icon: Clock,        label: "Log time" },
    { icon: FileText,     label: "Invoices",  tone: "pos" },
  ];
  return (
    <Card className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <FolderKanban size={22} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Create your first project
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          Keep track of time spent on various projects and bill clients accurately.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create project
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-gray-300 dark:text-gray-600 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-md mx-auto space-y-2">
        {[
          "Log time spent on projects",
          "Invite staff and assign project tasks",
          "Set budgets for projects",
          "Manage projects and their tasks",
        ].map((b) => (
          <div key={b} className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-600 dark:text-gray-300">
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    pos:     "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/40",
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default ProjectsPage;