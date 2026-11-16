import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Edit2, Trash2, RefreshCw, CheckCircle2, Users,
  Layers, Receipt, AlertCircle, CreditCard, LayoutGrid, List,
  Sparkles, TrendingUp,
} from "lucide-react";
import {
  fetchSubscriptions, fetchSubscriptionOptions, deletePlan,
} from "../store/slices/subscriptionSlice";
import SubscriptionPlanModal from "../components/subscriptions/SubscriptionPlanModal";
import PlanDetailModal from "../components/subscriptions/PlanDetailModal";
import ConfirmModal from "../components/common/ConfirmModal";

/* ---------- primitives ---------- */

const StatusPill = ({ status }) => {
  const styles = {
    Active:    "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400",
    Draft:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    Archived:  "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
    Trialing:  "bg-[#f0f4ff] text-[#3b82f6] dark:bg-blue-900/30 dark:text-blue-400",
    "Past due":"bg-[#fff8e6] text-[#f59e0b] dark:bg-amber-900/30 dark:text-amber-400",
    Cancelled: "bg-[#fee2e2] text-[#ef4444] dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const money = (v, currency = "INR") => {
  const n = Number(v) || 0;
  return `${currency === "INR" ? "₹" : currency + " "}${n.toLocaleString("en-IN")}`;
};

/* ---------- page ---------- */

const SubscriptionsAdminPage = () => {
  const dispatch = useDispatch();
  const { plans, subscribers, loading, error, submitting, submittingError } = useSelector(
    (s) => s.subscriptions
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");       // "list" | "grid"
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshLoading, setRefreshLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // detail modal — plan being viewed
  const [viewTarget, setViewTarget] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(fetchSubscriptions());
      dispatch(fetchSubscriptionOptions());
    }
  }, [dispatch, plans.length]);

  /* ---- derived ---- */
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const activePlans = plans.filter((p) => p.status === "Active").length;
    const totalSubs = plans.reduce((sum, p) => sum + (Number(p.subscriberCount) || 0), 0);
    const mrr = subscribers.reduce((sum, s) => sum + (Number(s.mrr) || 0), 0);
    const trialing = subscribers.filter((s) => s.status === "Trialing").length;
    return { activePlans, totalSubs, mrr, trialing };
  }, [plans, subscribers]);

  const statusOptions = ["all", "Active", "Draft", "Archived"];

  /* ---- actions ---- */
  const openCreate = () => { setEditingPlan(null); setModalOpen(true); };
  const openEdit = (plan) => { setEditingPlan(plan); setModalOpen(true); };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await Promise.all([
      dispatch(fetchSubscriptions()),
      dispatch(fetchSubscriptionOptions()),
    ]);
    setRefreshLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deletePlan(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      // surfaced via submittingError
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden space-y-5 pb-8 px-1 sm:px-0">

      {/* ---- Stat cards ---- */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f4f0fd] dark:bg-purple-900/30 text-[#7c5cfc] dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {stats.activePlans}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Active plans
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#7c5cfc] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#eafaf1] dark:bg-green-900/30 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {stats.totalSubs}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Total subscribers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#10b981] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight tabular-nums">
              {money(stats.mrr)}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              MRR
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#3b82f6] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#fff8e6] dark:bg-amber-900/30 text-[#f59e0b] dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {stats.trialing}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Trialing
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#f59e0b] rounded-r-full"></div>
        </div>
      </div>

      {/* ---- Heading + view switcher ---- */}
      <div className="flex justify-between items-center my-2 flex-wrap gap-3">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <CreditCard className="text-[#10b981] w-5 h-5 md:w-6 md:h-6" />
          Plans
        </h2>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
        </div>
      </div>

      {/* ---- Error ---- */}
      {(error || submittingError) && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-[12.5px] text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error || submittingError}</span>
        </div>
      )}

      {/* ---- Toolbar ---- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "All statuses" : opt}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/40"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshLoading}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg w-full sm:w-auto"
            title="Refresh"
          >
            <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin text-green-500" : ""}`}></i> Refresh
          </button>

          <button
            onClick={openCreate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <i className="fas fa-plus-circle"></i> New plan
          </button>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="min-h-[400px]">
        {loading && plans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#10b981] mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Loading plans…</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">No plans found</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mb-4">Try clearing filters or create your first plan.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* ---------- GRID ---------- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setViewTarget(plan)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#eafaf1] dark:bg-green-900/20 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base leading-tight truncate">
                          {plan.name}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                          {plan.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <StatusPill status={plan.status} />
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {plan.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <i className="fas fa-repeat text-gray-400"></i> {plan.interval}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <i className="fas fa-coins text-gray-400"></i>{" "}
                      {plan.billingCycle === "Usage-based" ? "Metered" : money(plan.price, plan.currency)}
                    </span>
                    {plan.trialDays > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-1 rounded-full bg-[#fff8e6] dark:bg-amber-900/30 text-[#f59e0b] dark:text-amber-400">
                        <i className="fas fa-gift"></i> {plan.trialDays}d trial
                      </span>
                    )}
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="text-[10px] md:text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-gray-400 text-[10px] ml-4">
                          +{plan.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/60 mt-2">
                  <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span>{plan.subscriberCount} subscribers</span>
                  </div>

                  {/* Stop propagation so button clicks don't open the modal */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(plan)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Edit plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(plan)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ---------- LIST ---------- */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-xs">
            <div className="min-w-[750px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">S.L.NO.</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PLAN</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">BILLING</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PRICE</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">TRIAL</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">SUBSCRIBERS</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">STATUS</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {filteredPlans.map((plan, index) => (
                    <tr
                      key={plan.id}
                      onClick={() => setViewTarget(plan)}
                      className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#eafaf1] dark:bg-green-900/20 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs md:text-sm">{plan.name}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{plan.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {plan.interval} · {plan.billingCycle}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                        {plan.billingCycle === "Usage-based" ? "Metered" : money(plan.price, plan.currency)}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                        {plan.trialDays ? `${plan.trialDays}d` : "—"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                        {plan.subscriberCount}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <StatusPill status={plan.status} />
                      </td>
                      {/* Stop propagation so button clicks don't open the modal */}
                      <td
                        className="px-3 md:px-4 py-2 md:py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(plan)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit plan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(plan)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] md:text-xs text-gray-400 text-center py-4">
        Plans define pricing and billing cycles. Manage subscribers from the Subscribers page.
      </p>

      <SubscriptionPlanModal
        open={modalOpen}
        initial={editingPlan}
        onClose={() => setModalOpen(false)}
      />

      <PlanDetailModal
        open={!!viewTarget}
        plan={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Existing subscribers on this plan will not be affected.`}
        confirmText={isDeleting || submitting ? "Deleting…" : "Delete"}
        variant="danger"
        isLoading={isDeleting || submitting}
      />
    </div>
  );
};

export default SubscriptionsAdminPage;