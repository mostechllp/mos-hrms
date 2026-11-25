// src/admin/pages/CustomersPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  clearError,
  fetchCustomerById,
  clearSelectedCustomer,
  deleteContactPerson, 
} from "../../store/slices/accounts/customersSlice";
import {
  Plus,
  ArrowUpDown,
  Download,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  UploadCloud,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  Columns,
  Loader2,
  Settings,
  Paperclip,
  Printer,
  FileText,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomizeColumnsModal from "../../../components/common/CustomizeColumnsModal";
import ContactPersonModal from "../../components/accounts/customers/ContactPersonModal";

/* ---------- primitives ---------- */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children, className = "" }) => (
  <h3 className={`text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 ${className}`}>
    {children}
  </h3>
);

const IconAction = ({ icon: Icon, label, onClick, tone = "default" }) => {
  const tones = {
    default:
      "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    primary:
      "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    warning:
      "text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30",
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-full transition-all duration-200 ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
};

/* ---------- column definitions ---------- */
const ALL_COLUMNS = [
  { id: "displayName", label: "Name", locked: true, defaultVisible: true },
  { id: "companyName", label: "Company Name", defaultVisible: true },
  { id: "email", label: "Email", defaultVisible: true },
  { id: "workPhone", label: "Phone", defaultVisible: true },
  { id: "receivables", label: "Receivables (BCY)", defaultVisible: true },
  { id: "unusedCredits", label: "Unused Credits (BCY)", defaultVisible: true },
  { id: "source", label: "Source", defaultVisible: true },
  { id: "firstName", label: "First Name", defaultVisible: true },
  { id: "lastName", label: "Last Name", defaultVisible: false },
  { id: "salutation", label: "Salutation", defaultVisible: false },
  { id: "customerType", label: "Customer Type", defaultVisible: false },
  { id: "mobile", label: "Mobile", defaultVisible: false },
  { id: "pan", label: "Tax ID / PAN", defaultVisible: false },
  { id: "currency", label: "Currency", defaultVisible: false },
  { id: "paymentTerms", label: "Payment Terms", defaultVisible: false },
  { id: "portalAccess", label: "Portal Access", defaultVisible: false },
  { id: "openingBalance", label: "Opening Balance", defaultVisible: false },
  { id: "receivableAccount", label: "Receivable Account", defaultVisible: false },
  { id: "createdAt", label: "Created At", defaultVisible: false },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "balance_desc", label: "Highest Balance" },
  { value: "balance_asc", label: "Lowest Balance" },
];

const getCurrencySymbol = (currencyString) => {
  if (!currencyString) return "";
  const c = String(currencyString).toUpperCase();
  if (c.includes("INR")) return "₹";
  if (c.includes("USD")) return "$";
  if (c.includes("EUR")) return "€";
  if (c.includes("GBP")) return "£";
  if (c.includes("AED")) return "د.إ";
  if (c.includes("SAR")) return "﷼";
  if (c.includes("JPY")) return "¥";
  if (c.includes("RUB")) return "₽";
  if (c.includes("CNY")) return "¥";
  return "";
};

const getVal = (obj, camel, snake) => {
  if (!obj) return null;
  return obj[camel] !== undefined ? obj[camel] : obj[snake];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ---------- page ---------- */
const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    customers,
    loading,
    error,
    pagination,
    selectedCustomer,
    selectedCustomerLoading = loading,
    formOptions
  } = useSelector((s) => s.accountCustomers);
  
  const { user } = useSelector((s) => s.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Contact Modal State
  const [contactModal, setContactModal] = useState({ isOpen: false, editId: null });

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.reduce(
      (acc, col) => ({
        ...acc,
        [col.id]: col.defaultVisible || col.locked,
      }),
      {},
    ),
  );

  const [filters, setFilters] = useState({
    hasCompany: "all",
    portalAccess: "all",
    currency: "all",
  });
  const [sortBy, setSortBy] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  /* ---- fetch on mount + whenever page/search/filters change ---- */
  useEffect(() => {
    const params = { page, per_page: pageSize };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filters.currency !== "all") params.currency = filters.currency;
    if (filters.portalAccess !== "all")
      params.portal_access = filters.portalAccess === "yes" ? 1 : 0;
    if (filters.hasCompany !== "all")
      params.has_company = filters.hasCompany === "yes" ? 1 : 0;

    dispatch(fetchCustomers(params));
  }, [dispatch, page, pageSize, searchQuery, filters]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const processedCustomers = useMemo(() => {
    const result = [...customers];
    result.sort((a, b) => {
      const nameA = a.displayName || a.display_name || "";
      const nameB = b.displayName || b.display_name || "";
      if (sortBy === "name_asc") return nameA.localeCompare(nameB);
      if (sortBy === "name_desc") return nameB.localeCompare(nameA);
      
      const balA = a.openingBalance || a.opening_balance || 0;
      const balB = b.openingBalance || b.opening_balance || 0;
      if (sortBy === "balance_desc") return balB - balA;
      if (sortBy === "balance_asc") return balA - balB;
      return 0;
    });
    return result;
  }, [customers, sortBy]);

  const handleViewCustomer = async (customer) => {
    setIsDrawerOpen(true);
    setActiveTab("overview");
    if (selectedCustomer?.id !== customer.id) {
      await dispatch(fetchCustomerById(customer.id));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteCustomer(deleteTarget.id));
    if (deleteCustomer.fulfilled.match(result)) {
      if (selectedCustomer?.id === deleteTarget.id) {
        setIsDrawerOpen(false);
        dispatch(clearSelectedCustomer());
      }
      setDeleteTarget(null);
    } else {
      setDeleteTarget(null);
    }
  };

  const handleDeleteContactConfirm = async () => {
    if (!deleteContactTarget) return;
    const result = await dispatch(deleteContactPerson({ 
      customerId: selectedCustomer.id, 
      id: deleteContactTarget.id 
    }));
    if (deleteContactPerson.fulfilled.match(result)) {
      await dispatch(fetchCustomerById(selectedCustomer.id));
      setDeleteContactTarget(null);
    } else {
      setDeleteContactTarget(null);
    }
  };

  const toggleColumn = (id) =>
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalCustomers = pagination?.total ?? customers.length;

  const availableCurrencies = useMemo(
    () => [
      ...new Set(
        customers.map((c) => c.baseCurrency ?? c.base_currency).filter(Boolean),
      ),
    ],
    [customers],
  );

  const hasActiveFilters =
    filters.hasCompany !== "all" ||
    filters.portalAccess !== "all" ||
    filters.currency !== "all";

  const defaultSymbol = getCurrencySymbol(
    customers[0]?.baseCurrency ?? customers[0]?.base_currency,
  );
  const totalBalance = customers.reduce(
    (s, c) => s + (c.openingBalance || c.opening_balance || 0),
    0,
  );

  const visibleColumnCount =
    Object.values(visibleColumns).filter(Boolean).length + 1;

  return (
    <div className="w-full overflow-x-hidden px-2 md:px-4">
      {/* error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MiniStat
          label="Total Customers"
          value={totalCustomers}
          icon="fas fa-users"
          color="green"
        />
        <MiniStat
          label="With Company"
          value={customers.filter((c) => c.companyName || c.company_name).length}
          icon="fas fa-building"
          color="blue"
        />
        <MiniStat
          label="With Portal Access"
          value={customers.filter((c) => c.portalAccess || c.portal_access).length}
          icon="fas fa-user-shield"
          color="violet"
        />
        <MiniStat
          label="Outstanding Balance"
          value={`${defaultSymbol}${totalBalance.toFixed(2)}`}
          icon="fas fa-hand-holding-usd"
          color="amber"
          isMoney
        />
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            {totalCustomers === 0
              ? "No customers yet"
              : `${totalCustomers} ${totalCustomers === 1 ? "customer" : "customers"} in your directory`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Download size={14} /> Import
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Upload size={14} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/accounts/sales/customers/new")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={14} /> New Customer
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {loading && customers.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 size={22} className="animate-spin text-green-500" />
          <span className="text-sm">Loading customers…</span>
        </Card>
      ) : totalCustomers === 0 && !searchQuery && !hasActiveFilters ? (
        <EmptyState navigate={navigate} />
      ) : (
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search customers…"
                value={searchQuery}
                onChange={(e) => {
                  setPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
              />
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Columns size={15} />
              <span className="hidden md:inline">Columns</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.hasCompany}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, hasCompany: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Company: Any</option>
                <option value="yes">Has Company</option>
                <option value="no">No Company</option>
              </select>
              <select
                value={filters.portalAccess}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, portalAccess: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Portal: Any</option>
                <option value="yes">Portal Enabled</option>
                <option value="no">Portal Disabled</option>
              </select>
              <select
                value={filters.currency}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, currency: e.target.value });
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="all">Currency: Any</option>
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setPage(1);
                    setFilters({
                      hasCompany: "all",
                      portalAccess: "all",
                      currency: "all",
                    });
                  }}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] lg:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    {visibleColumns.displayName && (
                      <th className="px-4 md:px-5 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                          Name <ArrowUpDown size={11} />
                        </span>
                      </th>
                    )}
                    {visibleColumns.companyName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Company Name
                      </th>
                    )}
                    {visibleColumns.email && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Email
                      </th>
                    )}
                    {visibleColumns.workPhone && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Phone
                      </th>
                    )}
                    {visibleColumns.receivables && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Receivables (BCY)
                      </th>
                    )}
                    {visibleColumns.unusedCredits && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Unused Credits (BCY)
                      </th>
                    )}
                    {visibleColumns.source && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Source
                      </th>
                    )}
                    {visibleColumns.firstName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        First Name
                      </th>
                    )}

                    {/* Additional Custom Headers */}
                    {visibleColumns.lastName && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Last Name
                      </th>
                    )}
                    {visibleColumns.salutation && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Salutation
                      </th>
                    )}
                    {visibleColumns.customerType && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Customer Type
                      </th>
                    )}
                    {visibleColumns.mobile && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Mobile
                      </th>
                    )}
                    {visibleColumns.pan && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Tax ID / PAN
                      </th>
                    )}
                    {visibleColumns.currency && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Currency
                      </th>
                    )}
                    {visibleColumns.paymentTerms && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Payment Terms
                      </th>
                    )}
                    {visibleColumns.portalAccess && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Portal Access
                      </th>
                    )}
                    {visibleColumns.openingBalance && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Opening Balance
                      </th>
                    )}
                    {visibleColumns.receivableAccount && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Receivable Acct.
                      </th>
                    )}
                    {visibleColumns.createdAt && (
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Created At
                      </th>
                    )}

                    <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={visibleColumnCount}
                        className="py-10 text-center text-gray-500"
                      >
                        <Loader2
                          size={18}
                          className="inline animate-spin mr-2 text-green-500"
                        />{" "}
                        Loading…
                      </td>
                    </tr>
                  ) : processedCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumnCount}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No customers match your filters or search.
                      </td>
                    </tr>
                  ) : (
                    processedCustomers.map((customer) => {
                      const name = getVal(customer, "displayName", "display_name");
                      const companyName = getVal(customer, "companyName", "company_name");
                      const email = getVal(customer, "email", "email");
                      const phone = getVal(customer, "workPhone", "work_phone");
                      const balance = getVal(customer, "openingBalance", "opening_balance") || 0;
                      const source = getVal(customer, "source", "source") || "Direct";
                      const fName = getVal(customer, "firstName", "first_name");
                      const lName = getVal(customer, "lastName", "last_name");
                      const salutation = getVal(customer, "salutation", "salutation");
                      const cType = getVal(customer, "customerType", "customer_type");
                      const mobile = getVal(customer, "mobile", "mobile");
                      const pan = getVal(customer, "pan", "pan") || getVal(customer, "gstinPan", "gstin_pan");
                      const curr = getVal(customer, "baseCurrency", "base_currency");
                      const terms = getVal(customer, "paymentTerms", "payment_terms");
                      const isPortal = getVal(customer, "portalAccess", "portal_access");
                      const recAcc = getVal(customer, "receivableAccount", "receivable_account");
                      const cAt = getVal(customer, "createdAt", "created_at");

                      return (
                      <tr
                        key={customer.id}
                        onClick={() => handleViewCustomer(customer)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      >
                        {visibleColumns.displayName && (
                          <td className="px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCustomer(customer);
                              }}
                              className="text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
                            >
                              {name}
                            </button>
                          </td>
                        )}
                        {visibleColumns.companyName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {companyName || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {email || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.workPhone && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {phone || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.receivables && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                            {getCurrencySymbol(curr)}{balance.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.unusedCredits && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                            {getCurrencySymbol(curr)}0.00
                          </td>
                        )}
                        {visibleColumns.source && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {source}
                          </td>
                        )}
                        {visibleColumns.firstName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {fName || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}

                        {/* Additional Custom Body Cells */}
                        {visibleColumns.lastName && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {lName || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.salutation && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {salutation || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.customerType && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {cType || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.mobile && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {mobile || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.pan && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {pan || <span className="text-gray-300">—</span>}
                          </td>
                        )}
                        {visibleColumns.currency && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {curr || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.paymentTerms && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {terms || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.portalAccess && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {isPortal ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Enabled</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Disabled</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.openingBalance && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                            {getCurrencySymbol(curr)}{balance.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.receivableAccount && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {recAcc || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}
                        {visibleColumns.createdAt && (
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {cAt ? formatDate(cAt) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        )}

                        <td
                          className="px-3 md:px-4 py-2 md:py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={Eye}
                              label="View"
                              tone="primary"
                              onClick={() => handleViewCustomer(customer)}
                            />
                            <IconAction
                              icon={Edit2}
                              label="Edit"
                              tone="warning"
                              onClick={() =>
                                navigate(
                                  `/admin/accounts/sales/customers/edit/${customer.id}`,
                                )
                              }
                            />
                            <IconAction
                              icon={Trash2}
                              label="Delete"
                              tone="danger"
                              onClick={() => setDeleteTarget(customer)}
                            />
                          </div>
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination?.lastPage > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                Page {pagination.currentPage} of {pagination.lastPage} ·{" "}
                {pagination.total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Prev
                </button>
                <button
                  disabled={
                    pagination.currentPage >= pagination.lastPage || loading
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      <CustomizeColumnsModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      {/* DRAWER WITH TABS */}
      {isDrawerOpen && selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => {
              setIsDrawerOpen(false);
              dispatch(clearSelectedCustomer());
            }}
          />
          <aside className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-[50%] xl:w-[45%] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
            
            {/* Drawer Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </p>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate mt-0.5">
                    {getVal(selectedCustomer, "displayName", "display_name")}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/accounts/sales/customers/edit/${selectedCustomer.id}`)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selectedCustomer)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      dispatch(clearSelectedCustomer());
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ml-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 mt-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "comments", label: "Comments" },
                  { id: "transactions", label: "Transactions" },
                  { id: "mails", label: "Mails" },
                  { id: "statement", label: "Statement" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content wrapper */}
            {selectedCustomerLoading && !selectedCustomer.billing_address && !selectedCustomer.billingAddress ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                <Loader2 size={24} className="animate-spin text-green-500" />
                <span className="text-sm">Loading details...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 py-6 px-5 sm:px-6">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                      {/* Company / Name Header */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-lg">
                            {getVal(selectedCustomer, "displayName", "display_name")?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                              {getVal(selectedCustomer, "displayName", "display_name")}
                            </h3>
                            {getVal(selectedCustomer, "companyName", "company_name") && (
                              <p className="text-xs text-gray-500">
                                {getVal(selectedCustomer, "companyName", "company_name")}
                              </p>
                            )}
                          </div>
                        </div>
                        {(getVal(selectedCustomer, "portalAccess", "portal_access") !== undefined) && (
                          <button className="text-xs text-blue-500 hover:underline mt-1 block">
                            Invite to Portal
                          </button>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                          <SectionLabel className="mb-0">Address</SectionLabel>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Edit2 size={13} />
                          </button>
                        </div>
                        
                        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Billing Address</p>
                            {getVal(selectedCustomer, "billingAddress", "billing_address") ? (
                              <div className="leading-relaxed">
                                <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.attention}</p>
                                <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.street1}</p>
                                <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.street2}</p>
                                <p>
                                  {getVal(selectedCustomer, "billingAddress", "billing_address")?.city}{" "}
                                  {getVal(selectedCustomer, "billingAddress", "billing_address")?.state}
                                </p>
                                <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.country}</p>
                              </div>
                            ) : <p className="text-gray-400">No billing address</p>}
                          </div>
                          
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Shipping Address</p>
                            {getVal(selectedCustomer, "shippingAddress", "shipping_address") ? (
                              <div className="leading-relaxed">
                                <p>{getVal(selectedCustomer, "shippingAddress", "shipping_address")?.attention}</p>
                                <p>{getVal(selectedCustomer, "shippingAddress", "shipping_address")?.street1}</p>
                                <p>{getVal(selectedCustomer, "shippingAddress", "shipping_address")?.street2}</p>
                                <p>
                                  {getVal(selectedCustomer, "shippingAddress", "shipping_address")?.city}{" "}
                                  {getVal(selectedCustomer, "shippingAddress", "shipping_address")?.state}
                                </p>
                                <p>{getVal(selectedCustomer, "shippingAddress", "shipping_address")?.country}</p>
                              </div>
                            ) : <p className="text-gray-400">No shipping address</p>}
                          </div>
                        </div>
                        <button className="text-xs text-blue-500 hover:underline mt-2">
                          Add additional address
                        </button>
                      </div>

                      {/* Contact Persons */}
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                          <div className="flex items-center gap-1">
                            <SectionLabel className="mb-0">Contact Persons</SectionLabel>
                            <button 
                              onClick={() => setContactModal({ isOpen: true, editId: null })}
                              className="text-blue-500 hover:text-blue-600 mb-2"
                              title="Add Contact Person"
                            >
                              <UserPlus size={13} />
                            </button>
                          </div>
                        </div>
                        {selectedCustomer.contact_persons && selectedCustomer.contact_persons.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 pb-2">
                            {selectedCustomer.contact_persons.map(cp => (
                              <div key={cp.id} className="relative group text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-all">
                                
                                {/* Hover Actions */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 pl-1">
                                  <button 
                                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    title="Edit Contact"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContactModal({ isOpen: true, editId: cp.id });
                                    }}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button 
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Delete Contact"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteContactTarget(cp);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate pr-12">
                                  {cp.salutation} {cp.first_name || cp.firstName} {cp.last_name || cp.lastName}
                                </p>
                                {(cp.email) && (
                                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                                    <Mail size={11} className="shrink-0" />
                                    <span className="truncate">{cp.email}</span>
                                  </div>
                                )}
                                {(cp.work_phone || cp.workPhone) && (
                                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                                    <Phone size={11} className="shrink-0" />
                                    <span className="truncate">{cp.work_phone || cp.workPhone}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No contact persons found.</p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                      {/* Other Details */}
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                          <SectionLabel className="mb-0">Other Details</SectionLabel>
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                          <div className="text-gray-500 text-xs col-span-1">Customer Type</div>
                          <div className="col-span-2">{getVal(selectedCustomer, "customerType", "customer_type") || "—"}</div>

                          <div className="text-gray-500 text-xs col-span-1">Default Currency</div>
                          <div className="col-span-2">{getVal(selectedCustomer, "baseCurrency", "base_currency") || "—"}</div>

                          <div className="text-gray-500 text-xs col-span-1">PAN</div>
                          <div className="col-span-2">{getVal(selectedCustomer, "gstinPan", "gstin_pan") || "—"}</div>

                          <div className="text-gray-500 text-xs col-span-1">Portal Status</div>
                          <div className="col-span-2">
                            {getVal(selectedCustomer, "portalAccess", "portal_access") ? (
                              <span className="text-green-600">Enabled</span>
                            ) : (
                              <span className="text-red-500">Disabled</span>
                            )}
                          </div>

                          <div className="text-gray-500 text-xs col-span-1">Customer Language</div>
                          <div className="col-span-2">English</div>
                        </div>
                      </div>

                      {/* Receivables */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <SectionLabel className="mb-0 text-gray-800 dark:text-gray-200 text-sm font-semibold normal-case">Receivables</SectionLabel>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">CURRENCY</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">OUTSTANDING RECEIVABLES</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">UNUSED CREDITS</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                                  {getVal(selectedCustomer, "baseCurrency", "base_currency") || "INR"} - {getVal(selectedCustomer, "baseCurrency", "base_currency") === "INR" ? "Indian Rupee" : "Currency"}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                                  {getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))}
                                  {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">0.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <button className="text-xs text-blue-500 hover:underline mt-2">
                          Enter Opening Balance
                        </button>
                      </div>

                      {/* Record Info */}
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                          <SectionLabel className="mb-0">Record Info</SectionLabel>
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                          <div className="text-gray-500 text-xs col-span-1">Customer ID</div>
                          <div className="col-span-2">{selectedCustomer.id}</div>
                          
                          <div className="text-gray-500 text-xs col-span-1">Created On</div>
                          <div className="col-span-2">{formatDate(getVal(selectedCustomer, "createdAt", "created_at"))}</div>
                          
                          <div className="text-gray-500 text-xs col-span-1">Created By</div>
                          <div className="col-span-2">{selectedCustomer.creator?.username || "System"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COMMENTS TAB */}
                {activeTab === "comments" && (
                  <div className="max-w-2xl mx-auto">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-6">
                      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                        <button className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded font-bold text-xs">B</button>
                        <button className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded italic font-serif text-xs">I</button>
                        <button className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded underline text-xs">U</button>
                      </div>
                      <textarea
                        className="w-full p-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none resize-none"
                        rows={4}
                        placeholder="Write a comment..."
                      />
                      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          Add Comment
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                        All Comments
                      </h4>
                      <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                        No comments yet.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TRANSACTIONS TAB */}
                {activeTab === "transactions" && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                    <FileText size={32} className="mb-3 text-gray-300" />
                    <p className="text-sm">Transactions timeline will be implemented soon.</p>
                  </div>
                )}

                {/* 4. MAILS TAB */}
                {activeTab === "mails" && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                    <Mail size={32} className="mb-3 text-gray-300" />
                    <p className="text-sm">Email communication history will be implemented soon.</p>
                  </div>
                )}

                {/* 5. STATEMENT TAB */}
                {activeTab === "statement" && (
                  <div className="space-y-4">
                    {/* Actions bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 dark:bg-gray-700 outline-none">
                          <option>This Month</option>
                          <option>Last Month</option>
                          <option>This Year</option>
                        </select>
                        <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 dark:bg-gray-700 outline-none">
                          <option>Filter By: All</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"><Printer size={14} /></button>
                        <button className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"><Download size={14} /></button>
                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-1">
                          <Mail size={14} /> Send Email
                        </button>
                      </div>
                    </div>

                    {/* Statement Preview */}
                    <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm mx-auto max-w-3xl relative">
                      

                      <div className="text-center mb-8 pt-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                          Customer Statement for {getVal(selectedCustomer, "displayName", "display_name")}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          From {formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} To {formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))}
                        </p>
                      </div>

                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">To</p>
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{getVal(selectedCustomer, "displayName", "display_name")}</p>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            {getVal(selectedCustomer, "billingAddress", "billing_address")?.street1 && <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.street1}</p>}
                            {getVal(selectedCustomer, "billingAddress", "billing_address")?.street2 && <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.street2}</p>}
                            <p>
                              {getVal(selectedCustomer, "billingAddress", "billing_address")?.city} {getVal(selectedCustomer, "billingAddress", "billing_address")?.state}
                            </p>
                            <p>{getVal(selectedCustomer, "billingAddress", "billing_address")?.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {user?.name || user?.employee?.name || "User Name"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {user?.employee?.department?.name || user?.department || "Organization"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {user?.employee?.designation?.name || user?.designation || "Location"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {user?.email || "email@example.com"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right mb-6">
                        <h3 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100">Statement of Accounts</h3>
                        <div className="border-b border-gray-300 dark:border-gray-600 w-full mt-1 mb-2"></div>
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} To {formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))}
                        </p>
                      </div>

                      {/* Account Summary */}
                      <div className="mb-8">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Account Summary
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-gray-600 dark:text-gray-400">Opening Balance</span>
                            <span className="text-gray-800 dark:text-gray-200">
                              {getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))} {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-gray-600 dark:text-gray-400">Invoiced Amount</span>
                            <span className="text-gray-800 dark:text-gray-200">{getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))} 0.00</span>
                          </div>
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-gray-600 dark:text-gray-400">Amount Received</span>
                            <span className="text-gray-800 dark:text-gray-200">{getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))} 0.00</span>
                          </div>
                          <div className="flex justify-between px-3 py-2 font-medium bg-gray-50 dark:bg-gray-800/50">
                            <span className="text-gray-700 dark:text-gray-300">Balance Due</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))} {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transactions Table */}
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#4a4a4a] text-white">
                            <th className="px-3 py-2 font-medium">Date</th>
                            <th className="px-3 py-2 font-medium">Transactions</th>
                            <th className="px-3 py-2 font-medium">Details</th>
                            <th className="px-3 py-2 font-medium text-right">Amount</th>
                            <th className="px-3 py-2 font-medium text-right">Payments</th>
                            <th className="px-3 py-2 font-medium text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          <tr>
                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                              {formatDate(getVal(selectedCustomer, "createdAt", "created_at") || new Date().toISOString())}
                            </td>
                            <td className="px-3 py-3 text-gray-800 dark:text-gray-200">***Opening Balance***</td>
                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400"></td>
                            <td className="px-3 py-3 text-right text-gray-800 dark:text-gray-200">
                              {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400"></td>
                            <td className="px-3 py-3 text-right text-gray-800 dark:text-gray-200 font-medium">
                              {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="mt-8 flex justify-end">
                        <div className="flex items-center gap-8 border-t border-gray-300 dark:border-gray-600 pt-2 w-64">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Balance Due</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {getCurrencySymbol(getVal(selectedCustomer, "baseCurrency", "base_currency"))} {(getVal(selectedCustomer, "openingBalance", "opening_balance") || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </aside>
        </>
      )}

      {/* CONTACT PERSON MODAL (Handles Add & Edit) */}
      <ContactPersonModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, editId: null })}
        customerId={selectedCustomer?.id}
        editId={contactModal.editId}
        salutations={formOptions.salutations || []}
      />

      {/* CONFIRM DELETE CUSTOMER */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete customer"
        message={`Are you sure you want to delete "${getVal(deleteTarget, "displayName", "display_name")}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* CONFIRM DELETE CONTACT PERSON */}
      <ConfirmModal
        isOpen={!!deleteContactTarget}
        onClose={() => setDeleteContactTarget(null)}
        onConfirm={handleDeleteContactConfirm}
        title="Delete Contact Person"
        message={`Are you sure you want to delete this contact person? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

/* ---------- sub-components ---------- */
const EmptyState = ({ navigate }) => (
  <Card className="py-16 px-6">
    <div className="max-w-xl mx-auto text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Users size={22} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        Every sale starts with a customer
      </h2>
      <p className="text-sm text-gray-500 mt-1.5 mb-6">
        Create and manage customers and their contact persons, all in one place.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => navigate("/admin/accounts/sales/customers/new")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={14} /> Create customer
        </button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <UploadCloud size={14} /> Import file
        </button>
      </div>
    </div>
    <div className="mt-12 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={14} className="text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Key benefits
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {[
          "Stay connected with multiple contact persons",
          "Provide portal access to customers",
          "Handle multiple addresses effortlessly",
          "Create multi-currency transactions for contacts",
        ].map((benefit, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <CheckCircle2
              size={14}
              className="text-green-500 mt-0.5 shrink-0"
            />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const MiniStat = ({ label, value, icon, color, isMoney }) => {
  const bg =
    {
      green: "bg-green-100 dark:bg-green-900/30",
      blue: "bg-blue-100 dark:bg-blue-900/30",
      amber: "bg-amber-100 dark:bg-amber-900/30",
      red: "bg-red-100 dark:bg-red-900/30",
      violet: "bg-violet-100 dark:bg-violet-900/30",
    }[color] || "bg-gray-100 dark:bg-gray-700";
  const fg =
    {
      green: "text-green-600 dark:text-green-400",
      blue: "text-blue-600 dark:text-blue-400",
      amber: "text-amber-600 dark:text-amber-400",
      red: "text-red-600 dark:text-red-400",
      violet: "text-violet-600 dark:text-violet-400",
    }[color] || "text-gray-600 dark:text-gray-400";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div
          className={`w-8 h-8 md:w-10 md:h-10 ${bg} rounded-xl flex items-center justify-center`}
        >
          <i className={`${icon} ${fg} text-sm md:text-lg`}></i>
        </div>
      </div>
      <div
        className={`text-xl md:text-2xl font-bold ${fg} tabular-nums ${isMoney ? "truncate" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
};

export default CustomersPage;