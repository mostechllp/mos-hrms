import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard, Layers, Calendar, TrendingUp, CheckCircle2,
  Mail, RefreshCw, AlertCircle, ArrowUpRight, Receipt,
  Clock, Sparkles, ShieldCheck, X, ArrowUpCircle,
} from "lucide-react";
import {
  fetchSubscriptions, fetchSubscriptionOptions, simulateSubscribe, requestUpgrade,
} from "../../admin/store/slices/subscriptionSlice";
import { createPortal } from "react-dom";

const money = (v, currency = "INR") => {
  const n = Number(v) || 0;
  return `${currency === "INR" ? "₹" : currency + " "}${n.toLocaleString("en-IN")}`;
};

const StatusPill = ({ status }) => {
  const styles = {
    Active:    "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400",
    Trialing:  "bg-[#f0f4ff] text-[#3b82f6] dark:bg-blue-900/30 dark:text-blue-400",
    "Past due":"bg-[#fff8e6] text-[#f59e0b] dark:bg-amber-900/30 dark:text-amber-400",
    Cancelled: "bg-[#fee2e2] text-[#ef4444] dark:bg-red-900/30 dark:text-red-400",
    // 👇 Added status for upgrade
    "Upgrade Requested": "bg-[#f4f0fd] text-[#7c5cfc] dark:bg-purple-900/30 dark:text-purple-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${styles[status] || styles.Active}`}>
      {status}
    </span>
  );
};

const formatDate = (v) => {
  if (!v || v === "—") return "—";
  try {
    return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return v; }
};

const MySubscriptionPage = () => {
  const dispatch = useDispatch();
  const { plans, subscribers, loading, error } = useSelector((s) => s.subscriptions);
  const { user } = useSelector((s) => s.auth);

  const [refreshLoading, setRefreshLoading] = useState(false);
  
  // Checkout State
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  // Upgrade State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);

  useEffect(() => {
    if (plans.length === 0 && subscribers.length === 0) {
      dispatch(fetchSubscriptions());
      dispatch(fetchSubscriptionOptions());
    }
  }, [dispatch, plans.length, subscribers.length]);

  const myEmail = user?.email || user?.email_address || "";

  const mySubscription = useMemo(() => {
    if (!subscribers.length) return null;
    return subscribers.find(
      (s) => myEmail && s.email?.toLowerCase() === myEmail.toLowerCase()
    ) || null;
  }, [subscribers, myEmail]);

  const myPlan = useMemo(() => {
    if (!mySubscription) return null;
    return plans.find((p) => p.name === mySubscription.plan) || null;
  }, [mySubscription, plans]);

  const availablePlans = useMemo(() => {
    return plans.filter((p) => p.status === "Active" && p.name !== mySubscription?.plan);
  }, [plans, mySubscription]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await Promise.all([
      dispatch(fetchSubscriptions()),
      dispatch(fetchSubscriptionOptions()),
    ]);
    setRefreshLoading(false);
  };

  // --- CHECKOUT LOGIC ---
  const handlePay = () => {
    if (!checkoutPlan) return;
    setIsPaying(true);
    
    setTimeout(() => {
      dispatch(simulateSubscribe({
        id: Date.now(),
        customer: user?.name || user?.employee?.name || "Current User",
        email: myEmail,
        plan: checkoutPlan.name,
        status: "Active",
        startedAt: new Date().toISOString(),
        nextBillingAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        mrr: checkoutPlan.price,
      }));
      setIsPaying(false);
      setCheckoutPlan(null);
    }, 1200);
  };

  // --- UPGRADE LOGIC ---
  const handleUpgradeRequest = () => {
    if (!selectedUpgradePlan || !mySubscription) return;
    setIsRequestingUpgrade(true);
    
    setTimeout(() => {
      dispatch(requestUpgrade({
        subscriberId: mySubscription.id,
        requestedPlan: selectedUpgradePlan.name,
      }));
      setIsRequestingUpgrade(false);
      setUpgradeModalOpen(false);
      setSelectedUpgradePlan(null);
    }, 1000);
  };

  if (loading && !mySubscription && plans.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <i className="fas fa-spinner fa-spin text-3xl text-[#10b981] mr-3"></i>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading subscription details…</p>
      </div>
    );
  }

  // =====================================================================
  // EMPTY STATE (NO SUBSCRIPTION YET) -> SHOW PLANS
  // =====================================================================
  if (!mySubscription) {
    return (
      <div className="w-full overflow-x-hidden space-y-6 pb-8 px-1 sm:px-0">
        
        <div className="text-center max-w-2xl mx-auto py-8">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose your subscription plan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            You don't have an active subscription yet. Select a plan below to get started.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-[12.5px] text-red-700 dark:text-red-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mt-8">
          {plans.filter((p) => p.status === "Active").map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            >
              {plan.subscriberCount > 100 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Popular
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                </div>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {money(plan.price, plan.currency)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    / {plan.interval.toLowerCase()}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCheckoutPlan(plan)}
                className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-2.5 rounded-xl transition-colors mt-auto"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>

        {/* -------------------- CHECKOUT MODAL -------------------- */}
        {checkoutPlan && createPortal(
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100 dark:border-gray-700">
              
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Checkout</h3>
                <button onClick={() => !isPaying && setCheckoutPlan(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{checkoutPlan.name} Plan</p>
                    <p className="text-xs text-gray-500">{checkoutPlan.interval} billing</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {money(checkoutPlan.price, checkoutPlan.currency)}
                  </p>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{money(checkoutPlan.price, checkoutPlan.currency)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (0%)</span>
                    <span>{money(0, checkoutPlan.currency)}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total due today</span>
                    <span>{money(checkoutPlan.price, checkoutPlan.currency)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg flex items-start gap-2 mb-6">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    This is a dummy checkout. In production, this would integrate with Stripe or Razorpay.
                  </p>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay {money(checkoutPlan.price, checkoutPlan.currency)}</>
                  )}
                </button>
              </div>
            </div>
          </div>, 
          document.body
        )}
      </div>
    );
  }

  // =====================================================================
  // ACTIVE SUBSCRIPTION STATE
  // =====================================================================
  return (
    <div className="w-full overflow-x-hidden space-y-5 pb-8 px-1 sm:px-0">
      
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-[12.5px] text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center my-2 flex-wrap gap-3">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent flex items-center gap-2">
          <CreditCard className="text-[#10b981] w-5 h-5 md:w-6 md:h-6" />
          My subscription
        </h2>

        <button
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <i className={`fas fa-sync-alt ${refreshLoading ? "fa-spin text-green-500" : ""}`}></i> Refresh
        </button>
      </div>

      {/* Show alert if upgrade is requested */}
      {mySubscription.status === "Upgrade Requested" && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/40 text-[12.5px] text-purple-700 dark:text-purple-300">
          <ArrowUpCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Upgrade Pending:</strong> You have requested to upgrade to the <strong>{mySubscription.requestedPlan}</strong> plan. Your admin will review this shortly.
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="bg-[#eafaf1] dark:bg-green-900/20 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-green-900/30 text-[#10b981] dark:text-green-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-semibold text-[#10b981] dark:text-green-400 uppercase tracking-wider">
                Current plan
              </p>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                {mySubscription.plan}
              </h3>
              {myPlan && (
                <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                  {myPlan.interval} · {myPlan.billingCycle}
                </p>
              )}
            </div>
          </div>
          <StatusPill status={mySubscription.status} />
        </div>

        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Monthly recurring
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              {money(mySubscription.mrr)}
            </p>
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Next billing
            </p>
            <p className="text-[13px] md:text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(mySubscription.nextBillingAt)}
            </p>
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Subscribed since
            </p>
            <p className="text-[13px] md:text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(mySubscription.startedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10b981]" /> What's included
          </h4>
          {myPlan?.features?.length ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {myPlan.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] md:text-[13px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-md px-3 py-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-gray-400">Plan features not available.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10b981]" /> Upgrade
            </h4>
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Need more seats or features? Request an upgrade and your admin will approve it.
            </p>
          </div>
          <button 
            onClick={() => setUpgradeModalOpen(true)}
            disabled={mySubscription.status === "Upgrade Requested"}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <ArrowUpRight className="w-4 h-4" /> 
            {mySubscription.status === "Upgrade Requested" ? "Upgrade Pending" : "Request upgrade"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#10b981]" /> Billing history
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {[
                { id: "INV-SUB-0006", date: mySubscription.nextBillingAt, amount: mySubscription.mrr, status: "Pending" },
                { id: "INV-SUB-0005", date: mySubscription.startedAt,      amount: mySubscription.mrr, status: "Paid"    },
              ].map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {inv.id}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(inv.date)}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                    {money(inv.amount)}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                        inv.status === "Paid"
                          ? "bg-[#eafaf1] text-[#10b981] dark:bg-green-900/30 dark:text-green-400"
                          : "bg-[#fff8e6] text-[#f59e0b] dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] md:text-xs text-gray-400 text-center py-4 flex items-center justify-center gap-1.5">
        <Mail className="w-3 h-3" /> Billing questions? Contact your admin at billing@yourcompany.com
      </p>

      {/* -------------------- UPGRADE MODAL -------------------- */}
      {upgradeModalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100 dark:border-gray-700">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Upgrade</h3>
              <button onClick={() => !isRequestingUpgrade && setUpgradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the plan you'd like to upgrade to. Your admin will be notified to approve this request.
              </p>

              <div className="space-y-3 mb-6">
                {availablePlans.length > 0 ? (
                  availablePlans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                        selectedUpgradePlan?.id === plan.id
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="upgradePlan"
                          checked={selectedUpgradePlan?.id === plan.id}
                          onChange={() => setSelectedUpgradePlan(plan)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                          <p className="text-xs text-gray-500">{plan.interval}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {money(plan.price, plan.currency)}
                      </p>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">You are already on the highest available plan.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setUpgradeModalOpen(false)}
                  disabled={isRequestingUpgrade}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgradeRequest}
                  disabled={!selectedUpgradePlan || isRequestingUpgrade}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isRequestingUpgrade ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <>Submit Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
};

export default MySubscriptionPage;