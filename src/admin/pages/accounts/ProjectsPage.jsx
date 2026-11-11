import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProject } from "../../store/slices/accounts/projectsSlice";
import {
  Plus, MoreHorizontal, ChevronDown, Box, FileText,
  Clock, CheckCircle2, X, Search, Filter,
  User, Trash2, Edit2, Link, FolderKanban,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MenuItem = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <Icon size={14} className="text-slate-400" />
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{children}</h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default: "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`p-1.5 rounded-md transition-colors ${tones[tone]}`}>
      <Icon size={15} />
    </button>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-[12.5px] font-medium text-slate-900 dark:text-slate-100">{value || "—"}</p>
  </div>
);

const Metric = ({ label, value, sub }) => (
  <div className="text-center">
    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-base font-semibold text-slate-900 dark:text-slate-50 tabular-nums">{value}</p>
    {sub && <p className="text-[11.5px] text-slate-500 mt-0.5 tabular-nums">{sub}</p>}
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

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Time tracking</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              Projects
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {projects.length === 0
                ? "No projects yet"
                : `${projects.length} ${projects.length === 1 ? "project" : "projects"} tracked`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn title="Filter" className="!px-2"><Filter size={15} /></GhostBtn>

            <button
              onClick={() => openTimerModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Clock size={13} /> Start timer
            </button>

            <button
              onClick={() => navigate("/admin/accounts/time-tracking/projects/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus size={13} /> New
            </button>

            <div className="relative" ref={menuRef}>
              <GhostBtn onClick={() => setShowMoreMenu((v) => !v)} className="!px-2">
                <MoreHorizontal size={16} />
              </GhostBtn>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-900/5 z-30 py-1.5">
                  <MenuItem icon={Filter}    label="Filter" />
                  <MenuItem icon={FileText}  label="Export" />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                  <MenuItem icon={Clock}     label="Preferences" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- Empty state ---- */}
        {projects.length === 0 ? (
          <EmptyState onCreate={() => navigate("/admin/accounts/time-tracking/projects/new")} />
        ) : (

          /* ---- Table surface ---- */
          <Surface className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                    <th className="px-4 py-2.5 text-left font-medium">Project name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-left font-medium">Billing method</th>
                    <th className="px-4 py-2.5 text-right font-medium">Logged hours</th>
                    <th className="px-4 py-2.5 text-right font-medium">Unbilled amount</th>
                    <th className="px-4 py-2.5 text-right font-medium w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-400" aria-label={`Select ${project.projectName}`} />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.projectName}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{project.customerName}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{project.billingMethod}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {project.stats?.loggedHours || "00:00"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{Number(project.stats?.unbilledHours === "00:00" ? 0 : 500).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconAction icon={Search} label="View"   onClick={() => setSelectedProject(project)} />
                          <IconAction icon={Edit2}  label="Edit"   onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${project.id}`)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => setDeleteTarget(project)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>

      {/* ---- Drawer ---- */}
      {selectedProject && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedProject(null)}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-[70%] lg:w-[65%] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">

            {/* Drawer header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Project</p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                  {selectedProject.projectName}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${selectedProject.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => openTimerModal()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <Clock size={13} /> Log time
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {["Overview", "Timesheet", "Purchases", "Sales", "Budget configuration", "Journals", "Activity logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
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
                    <Surface className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <Box size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{selectedProject.projectName}</p>
                          <p className="text-[11.5px] text-slate-500">{selectedProject.billingMethod}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <DetailItem label="Customer"      value={selectedProject.customerName} />
                        <DetailItem label="Rate per hour" value={`₹${Number(selectedProject.ratePerHour || 22).toFixed(2)}`} />
                        <DetailItem label="Watchlist"     value="Enabled" />
                      </div>
                    </Surface>
                  </div>

                  {/* Right panel */}
                  <div className="flex-1 min-w-0 space-y-4">

                    {/* Chart card */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                          <button className="px-2.5 py-1 text-[11.5px] font-medium text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-md">
                            Project hours
                          </button>
                          <button className="px-2.5 py-1 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md transition-colors">
                            Profitability
                          </button>
                        </div>
                        <button className="inline-flex items-center gap-1 text-[11.5px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                          This week <ChevronDown size={11} />
                        </button>
                      </div>

                      <div className="h-40 flex items-end justify-between gap-1 px-1">
                        {[25, 26, 27, 28, 29, 30, 31].map((day) => (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full max-w-[8px] bg-slate-200 dark:bg-slate-700 rounded-t" style={{ height: `${8 + (day % 5) * 8}px` }}></div>
                            <span className="text-[10px] text-slate-400">{day}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                        <Metric label="Logged"   value="00:00" sub="₹0.00" />
                        <Metric label="Billable" value="00:00" sub="₹0.00" />
                        <Metric label="Billed"   value="00:00" sub="₹0.00" />
                        <Metric label="Unbilled" value="00:00" sub="₹0.00" />
                      </div>
                    </Surface>

                    {/* Users */}
                    <Surface>
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <SectionLabel>Users</SectionLabel>
                        <button className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          + Add user
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                              <th className="text-left  font-medium px-4 py-2">Name</th>
                              <th className="text-right font-medium px-4 py-2">Logged</th>
                              <th className="text-right font-medium px-4 py-2">Billed</th>
                              <th className="text-right font-medium px-4 py-2">Unbilled</th>
                              <th className="text-right font-medium px-4 py-2">Role</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {selectedProject.users?.length ? selectedProject.users.map((user) => (
                              <tr key={user.id}>
                                <td className="px-4 py-2.5">
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                  <p className="text-[11px] text-slate-500">{user.email}</p>
                                </td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">00:00</td>
                                <td className="px-4 py-2.5 text-right text-slate-500">{user.role || "—"}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-slate-500">No users yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Surface>

                    {/* Tasks */}
                    <Surface className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <SectionLabel>Project tasks</SectionLabel>
                        <button className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                          + Add task
                        </button>
                      </div>
                      <p className="text-[12.5px] text-slate-500">No project tasks have been added.</p>
                    </Surface>
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
                <Surface className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText size={18} className="text-slate-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Set a budget for this project</p>
                    <p className="text-[12px] text-slate-500 mb-5">
                      Track actuals against budgeted cost and revenue to stay ahead of project finances.
                    </p>
                    <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                      Create budget
                    </button>
                  </div>
                </Surface>
              )}

              {!["Overview", "Purchases", "Sales", "Budget configuration"].includes(activeTab) && (
                <Surface className="py-20 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 mb-1">No data</p>
                  <p className="text-[12px] text-slate-500">Nothing to show under {activeTab} yet.</p>
                </Surface>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ---- Start timer modal ---- */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                <Clock size={14} /> Start timer
              </div>
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center py-6">
              <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-wider tabular-nums">
                00 : 00 : 00
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <button className="text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1 transition-colors">
                <Link size={12} /> Associate project
              </button>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-300">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                  placeholder="Add notes…"
                  value={timerNote}
                  onChange={(e) => setTimerNote(e.target.value)}
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsTimerModalOpen(false)}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
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
    </div>
  );
};

/* ---------- sub-components ---------- */

const EmptySection = ({ title, message }) => (
  <Surface>
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <SectionLabel>{title}</SectionLabel>
      <button className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
        <Filter size={10} /> Status: All <ChevronDown size={10} />
      </button>
    </div>
    <p className="text-center py-8 text-[12.5px] text-slate-500">{message}</p>
  </Surface>
);

const EmptyState = ({ onCreate }) => {
  const steps = [
    { icon: User,         label: "Customer" },
    { icon: FileText,     label: "Project",   tone: "accent" },
    { icon: Clock,        label: "Log time" },
    { icon: FileText,     label: "Invoices",  tone: "pos" },
  ];
  return (
    <Surface className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <FolderKanban size={22} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Create your first project
        </h2>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Keep track of time spent on various projects and bill clients accurately.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Create project
        </button>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <SectionLabel>Lifecycle</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <LifeStep icon={s.icon} label={s.label} tone={s.tone} />
              {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>}
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
          <div key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
};

const LifeStep = ({ icon: Icon, label, tone }) => {
  const tones = {
    default: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800",
    pos:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    accent:  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium ${tones[tone || "default"]}`}>
      <Icon size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default ProjectsPage;