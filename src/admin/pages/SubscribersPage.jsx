import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search, RefreshCw, Users, AlertCircle, LayoutGrid, List,
  Mail, Calendar, TrendingUp, CreditCard, Sparkles, UserCheck,
  Download, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import { fetchSubscriptions, fetchSubscriptionOptions } from "../store/slices/subscriptionSlice";
import SubscriberDetailModal from "../components/subscriptions/SubscriberDetailModal";

/* ---------- primitives ---------- */

const StatusPill = ({ status }) => {
  const styles = {
    Active:    "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400",
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

const SubscribersPage = () => {
  const dispatch = useDispatch();
  const { plans, subscribers, loading, error } = useSelector((s) => s.subscriptions);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [refreshLoading, setRefreshLoading] = useState(false);

  // detail modal — subscriber being viewed
  const [viewTarget, setViewTarget] = useState(null);

  // client-side pagination for now; swap for server-side when API is ready
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  useEffect(() => {
    if (plans.length === 0 && subscribers.length === 0) {
      dispatch(fetchSubscriptions());
      dispatch(fetchSubscriptionOptions());
    }
  }, [dispatch, plans.length, subscribers.length]);

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, planFilter, perPage]);

  /* ---- derived ---- */
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.plan?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || s.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesPlan =
        planFilter === "all" || s.plan?.toLowerCase() === planFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscribers, searchQuery, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / perPage));
  const paginatedSubscribers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredSubscribers.slice(start, start + perPage);
  }, [filteredSubscribers, page, perPage]);

  const stats = useMemo(() => {
    const active = subscribers.filter((s) => s.status === "Active").length;
    const trialing = subscribers.filter((s) => s.status === "Trialing").length;
    const pastDue = subscribers.filter((s) => s.status === "Past due").length;
    const mrr = subscribers
      .filter((s) => s.status === "Active")
      .reduce((sum, s) => sum + (Number(s.mrr) || 0), 0);
    return { active, trialing, pastDue, mrr };
  }, [subscribers]);

  const planOptions = useMemo(
    () => [{ value: "all", label: "All plans" }, ...plans.map((p) => ({ value: p.name, label: p.name }))],
    [plans]
  );

  // look up the chosen plan for the subscriber being viewed
  const viewTargetPlan = useMemo(() => {
    if (!viewTarget) return null;
    return plans.find((p) => p.name === viewTarget.plan) || null;
  }, [viewTarget, plans]);

  /* ---- actions ---- */
  const handleRefresh = async () => {
    setRefreshLoading(true);
    await Promise.all([
      dispatch(fetchSubscriptions()),
      dispatch(fetchSubscriptionOptions()),
    ]);
    setRefreshLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "—") return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  /* ---------- render ---------- */

  return (
    <div className="w-full overflow-x-hidden space-y-5 pb-8 px-1 sm:px-0">

      {/* ---- Stat cards ---- */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#eafaf1] dark:bg-green-900/30 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {stats.active}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Active
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#10b981] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
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
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#3b82f6] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#fff8e6] dark:bg-amber-900/30 text-[#f59e0b] dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {stats.pastDue}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Past due
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#f59e0b] rounded-r-full"></div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f4f0fd] dark:bg-purple-900/30 text-[#7c5cfc] dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight tabular-nums">
              {money(stats.mrr)}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Active MRR
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-20 md:w-24 h-1 bg-[#7c5cfc] rounded-r-full"></div>
        </div>
      </div>

      {/* ---- Heading + view switcher ---- */}
      <div className="flex justify-between items-center my-2 flex-wrap gap-3">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <Users className="text-[#10b981] w-5 h-5 md:w-6 md:h-6" />
          Subscribers
        </h2>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
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
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
        </div>
      </div>

      {/* ---- Error ---- */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-[12.5px] text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---- Toolbar ---- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Trialing">Trialing</option>
              <option value="Past due">Past due</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>

          <div className="relative w-full sm:w-44">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer"
            >
              {planOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscribers…"
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
          >
            <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin text-green-500" : ""}`}></i> Refresh
          </button>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="min-h-[400px]">
        {loading && subscribers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#10b981] mb-3"></i>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Loading subscribers…</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">No subscribers found</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mb-4">Try clearing filters or search terms.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {paginatedSubscribers.map((s) => (
              <div
                key={s.id}
                onClick={() => setViewTarget(s)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {s.customer?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base leading-tight truncate">
                          {s.customer}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                          {s.plan}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <StatusPill status={s.status} />
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>Started {formatDate(s.startedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>Next: {formatDate(s.nextBillingAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/60 mt-2">
                  <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                      {money(s.mrr)} MRR
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-xs">
            <div className="min-w-[750px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">S.L.NO.</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">CUSTOMER</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PLAN</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">EMAIL</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">STARTED</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">NEXT BILLING</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">MRR</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {paginatedSubscribers.map((s, index) => (
                    <tr
                      key={s.id}
                      onClick={() => setViewTarget(s)}
                      className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f0f4ff] dark:bg-blue-900/30 text-[#3b82f6] dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            {s.customer?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{s.customer}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{s.plan}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{s.email}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{formatDate(s.startedAt)}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{formatDate(s.nextBillingAt)}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                        {money(s.mrr)}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <StatusPill status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---- Pagination ---- */}
      {filteredSubscribers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-700 dark:text-gray-200">
              {(page - 1) * perPage + 1}
            </span>–<span className="font-semibold text-gray-700 dark:text-gray-200">
              {Math.min(page * perPage, filteredSubscribers.length)}
            </span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredSubscribers.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer"
            >
              {[10, 15, 25, 50].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] md:text-xs text-gray-400 text-center py-4">
        Subscribers are customers currently attached to a plan. Manage pricing from the Plans page.
      </p>

      <SubscriberDetailModal
        open={!!viewTarget}
        subscriber={viewTarget}
        plan={viewTargetPlan}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};

export default SubscribersPage;