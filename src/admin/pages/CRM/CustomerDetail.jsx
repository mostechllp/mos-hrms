// src/admin/pages/CRM/CustomerDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  MoreVertical,
  Phone,
  Mail,
  CalendarPlus,
  FileText,
  Briefcase,
  UserPlus,
  Upload,
  Repeat,
  Trash2,
  Building2,
  Users,
  Clock,
  IndianRupee,
  Award,
  CheckCircle2,
  Hash,
  Globe,
  Layers,
  Percent,
  Info,
  Tag,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import AddContactModal from "../../components/crm/AddContactModal";
import {
  fetchCustomerById,
  deleteCustomerApi,
  updateCustomerStatusApi,
  fromCustomerApi,
  clearCurrentCustomer,
} from "../../store/slices/customerSlice";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "activities", label: "Activities" },
  { key: "opportunities", label: "Opportunities" },
  { key: "quotations", label: "Quotations" },
  { key: "documents", label: "Documents" },
  { key: "notes", label: "Notes" },
];

// ---------- helpers ----------
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return "—";
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num}`;
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    Blacklisted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return map[status] || map.Active;
};

const getAccountManagerName = (am) => {
  if (!am) return "—";
  const full = `${am.first_name || ""} ${am.last_name || ""}`.trim();
  return full || am.name || "—";
};

const getAccountManagerAvatar = (am) => {
  if (!am?.avatar) return null;
  if (String(am.avatar).startsWith("http")) return am.avatar;
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${base}/storage/${am.avatar}`;
};

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentCustomer,
    currentCustomerLoading,
    currentCustomerError,
    submitting,
  } = useSelector((state) => state.customers);

  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    if (customerId) dispatch(fetchCustomerById(customerId));
    return () => dispatch(clearCurrentCustomer());
  }, [dispatch, customerId]);

  const customer = currentCustomer ? fromCustomerApi(currentCustomer) : null;

  const handleDelete = async () => {
    if (!customer) return;
    try {
      await dispatch(deleteCustomerApi(customer.id)).unwrap();
      showToast(`Customer ${customer.companyName} deleted`, "success");
      setConfirmDelete(false);
      navigate("/admin/crm/customers");
    } catch (err) {
      showToast(err || "Failed to delete customer", "error");
    }
  };

  const handleQuickStatus = async (status) => {
    if (!customer) return;
    try {
      await dispatch(
        updateCustomerStatusApi({
          id: customer.id,
          customer_status: status,
          note: "",
        }),
      ).unwrap();
      showToast(`Status updated to ${status}`, "success");
      setMenuOpen(false);
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  if (currentCustomerLoading && !customer) {
    return (
      <div className="w-full py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentCustomerError && !customer) {
    return (
      <div className="w-full py-16 text-center">
        <p className="text-red-500 mb-4">{currentCustomerError}</p>
        <button
          onClick={() => navigate("/admin/crm/customers")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) return null;

  const am = currentCustomer.account_manager;
  const amName = getAccountManagerName(am);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/crm/customers")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {customer.companyName || "—"}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(
                customer.status,
              )}`}
            >
              {customer.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono">{customer.customerId}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {customer.industry || "—"}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {customer.contactName || "—"}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>AM: {amName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/crm/customers/${customer.id}/edit`)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Pencil size={14} /> Edit
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <MenuItem
                    icon={UserPlus}
                    label="Add Contact"
                    onClick={() => {
                      setContactModalOpen(true);
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Briefcase}
                    label="Add Opportunity"
                    onClick={() => {
                      showToast("Add opportunity — later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Phone}
                    label="Schedule Call"
                    onClick={() => {
                      showToast("Schedule call — later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={CalendarPlus}
                    label="Schedule Meeting"
                    onClick={() => {
                      showToast("Schedule meeting — later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={FileText}
                    label="Add Note"
                    onClick={() => {
                      showToast("Add note — later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Upload}
                    label="Upload Document"
                    onClick={() => {
                      showToast("Upload document — later", "info");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={Repeat}
                    label="Mark as Active"
                    onClick={() => handleQuickStatus("Active")}
                  />
                  <MenuItem
                    icon={Repeat}
                    label="Mark as Inactive"
                    onClick={() => handleQuickStatus("Inactive")}
                  />
                  <MenuItem
                    icon={Repeat}
                    label="Mark as Blacklisted"
                    onClick={() => handleQuickStatus("Blacklisted")}
                  />
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <MenuItem
                    icon={Trash2}
                    label="Delete Customer"
                    danger
                    onClick={() => {
                      setConfirmDelete(true);
                      setMenuOpen(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        <QuickChip
          icon={Pencil}
          label="Edit Customer"
          onClick={() => navigate(`/admin/crm/customers/${customer.id}/edit`)}
        />
        <QuickChip
          icon={UserPlus}
          label="Add Contact"
          onClick={() => setContactModalOpen(true)}
        />
        <QuickChip
          icon={Briefcase}
          label="Add Opportunity"
          onClick={() => showToast("Add opportunity", "info")}
        />
        <QuickChip
          icon={Phone}
          label="Schedule Call"
          onClick={() => showToast("Schedule call", "info")}
        />
        <QuickChip
          icon={CalendarPlus}
          label="Schedule Meeting"
          onClick={() => showToast("Schedule meeting", "info")}
        />
        <QuickChip
          icon={FileText}
          label="Add Note"
          onClick={() => showToast("Add note", "info")}
        />
        <QuickChip
          icon={Upload}
          label="Upload Document"
          onClick={() => showToast("Upload document", "info")}
        />
      </div>

      {/* Info card — all key fields the API returns */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoBlock icon={Hash} label="Customer ID" value={customer.customerId} mono />
          <InfoBlock icon={Layers} label="Customer Type" value={customer.customerType} />
          <InfoBlock icon={Building2} label="Industry" value={customer.industry} />
          <InfoBlock icon={CheckCircle2} label="Status" value={customer.status} />
          <InfoBlock icon={Clock} label="Customer Since" value={formatDate(customer.customerSince)} />
          <InfoBlock icon={Users} label="Account Manager" value={amName} />
          <InfoBlock icon={Users} label="Primary Contact" value={customer.contactName} />
          <InfoBlock icon={Mail} label="Email" value={customer.contactEmail} />
          <InfoBlock icon={Phone} label="Phone" value={customer.contactPhone} />
          <InfoBlock icon={Percent} label="Payment Terms" value={customer.paymentTerms} />
          <InfoBlock icon={IndianRupee} label="Credit Limit" value={formatCurrency(customer.creditLimit)} />
          <InfoBlock icon={Tag} label="Category" value={customer.category} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        {activeTab === "overview" && (
          <OverviewTab customer={customer} am={am} raw={currentCustomer} />
        )}
        {activeTab === "contacts" && (
          <ContactsTab
            contacts={currentCustomer.contacts || []}
            onAdd={() => setContactModalOpen(true)}
          />
        )}
        {activeTab === "activities" && (
          <ActivitiesTab activities={currentCustomer.activities || []} />
        )}
        {activeTab === "opportunities" && (
          <EmptyTab label="No opportunities yet." />
        )}
        {activeTab === "quotations" && (
          <QuotationsTab quotations={currentCustomer.quotations || []} />
        )}
        {activeTab === "documents" && (
          <EmptyTab label="No documents uploaded yet." />
        )}
        {activeTab === "notes" && <NotesTab customer={customer} />}
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.companyName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />

      <AddContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSubmit={(data) => {
          console.log("New contact:", data);
          showToast("Add contact — API not ready", "info");
          setContactModalOpen(false);
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------
// Building blocks
// ------------------------------------------------------------

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
      danger
        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  >
    <Icon size={15} />
    {label}
  </button>
);

const QuickChip = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
  >
    <Icon size={13} />
    {label}
  </button>
);

const InfoBlock = ({ icon: Icon, label, value, mono }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className="text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p
      className={`text-sm text-gray-800 dark:text-gray-200 ${
        mono ? "font-mono" : "font-medium"
      } truncate`}
    >
      {value || "—"}
    </p>
  </div>
);

const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 dark:border-gray-700/40 last:border-b-0">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
      {label}
    </span>
    <span
      className={`text-sm text-gray-800 dark:text-gray-200 text-right ${
        mono ? "font-mono" : ""
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
    {children}
  </h3>
);

// ------------------------------------------------------------
// Tab components
// ------------------------------------------------------------

const OverviewTab = ({ customer, am, raw }) => {
  const amName = getAccountManagerName(am);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        <div>
          <SectionTitle>Company Details</SectionTitle>
          <div className="space-y-0">
            <Row label="Customer ID" value={customer.customerId} mono />
            <Row label="Customer Type" value={customer.customerType} />
            <Row label="Company Name" value={customer.companyName} />
            <Row label="Industry" value={customer.industry} />
            <Row label="Registration No." value={customer.registrationNumber} />
            <Row label="Tax / GST No." value={customer.taxNumber} />
            <Row
              label="Website"
              value={
                customer.website ? (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Globe size={12} /> {customer.website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </div>

        <div>
          <SectionTitle>Account</SectionTitle>
          <div className="space-y-0">
            <Row label="Status" value={customer.status} />
            <Row label="Customer Since" value={formatDate(customer.customerSince)} />
            <Row label="Account Manager" value={amName} />
            <Row label="Category" value={customer.category} />
            <Row label="Source" value={customer.source} />
            <Row label="Payment Terms" value={customer.paymentTerms} />
            <Row label="Credit Limit" value={formatCurrency(customer.creditLimit)} />
          </div>
        </div>

        <div>
          <SectionTitle>Notes</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {customer.notes || "No notes yet."}
            </p>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div>
          <SectionTitle>Primary Contact</SectionTitle>
          <div className="space-y-0">
            <Row label="Name" value={customer.contactName} />
            <Row label="Designation" value={customer.contactDesignation} />
            <Row
              label="Email"
              value={
                customer.contactEmail ? (
                  <a
                    href={`mailto:${customer.contactEmail}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {customer.contactEmail}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Phone"
              value={
                customer.contactPhone ? (
                  <a
                    href={`tel:${customer.contactPhone}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {customer.contactPhone}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Alternate Phone" value={customer.contactAltPhone} />
            <Row label="Preferred Comm." value={customer.preferredComm} />
          </div>
        </div>

        <div>
          <SectionTitle>Address</SectionTitle>
          <div className="space-y-0">
            <Row label="Billing" value={customer.billingAddress} />
            <Row label="Shipping" value={customer.shippingAddress} />
            <Row label="City" value={customer.city} />
            <Row label="State" value={customer.state} />
            <Row label="Country" value={customer.country} />
            <Row label="Postal Code" value={customer.postalCode} />
          </div>
        </div>

        <div>
          <SectionTitle>System</SectionTitle>
          <div className="space-y-0">
            <Row label="Created At" value={formatDateTime(customer.createdAt)} />
            <Row label="Updated At" value={formatDateTime(customer.updatedAt)} />
            <Row
              label="Created By"
              value={raw?.creator?.username || raw?.creator?.email || "—"}
            />
            <Row
              label="Updated By"
              value={raw?.updater?.username || raw?.updater?.email || "—"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactsTab = ({ contacts = [], onAdd }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
        </h3>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <UserPlus size={13} /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No contacts yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c) => {
            const name = c.name || c.contact_person_name || "—";
            const designation = c.designation || c.contact_designation || "";
            const dept = c.dept || c.department || "";
            const email = c.email || c.contact_email || "";
            const phone = c.phone || c.contact_phone || "";
            const preferred = c.preferred || c.preferred_communication || "";
            const isPrimary = c.primary ?? c.is_primary ?? false;

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {name}
                    </p>
                    {(designation || dept) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {[designation, dept].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {isPrimary && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                      Primary
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail size={12} /> {email}
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone size={12} /> {phone}
                    </div>
                  )}
                  {preferred && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                      Prefers {preferred}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ActivitiesTab = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No activities logged yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <CalendarPlus size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {a.type || a.activity_type || "Activity"}
              {a.summary || a.subject ? `: ${a.summary || a.subject}` : ""}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {a.user || a.created_by_name || "—"} ·{" "}
              {formatDateTime(a.when || a.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuotationsTab = ({ quotations = [] }) => {
  if (!quotations.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No quotations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quotations.map((q) => (
        <div
          key={q.id}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700/60"
        >
          <div>
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {q.quotation_id || q.id}
            </p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
              {formatCurrency(q.amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(q.date || q.created_at)}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
              {q.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const NotesTab = ({ customer }) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
      {customer.notes || "No notes yet."}
    </p>
  </div>
);

const EmptyTab = ({ label }) => (
  <div className="text-center py-8">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

export default CustomerDetail;