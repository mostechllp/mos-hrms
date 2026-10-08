// src/admin/pages/crm/ViewQuotation.jsx

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Send,
  FileDown,
  Check,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  User,
} from "lucide-react";
import { showToast } from "../../../components/common/Toast";
import {
  fetchQuotationById,
  updateQuotationStatusApi,
  clearCurrentQuotation,
  fromQuotationApi,
} from "../../store/slices/quotationSlice";

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

const formatCurrency = (n, currency = "INR") => {
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "AED"
          ? "AED "
          : currency === "EUR"
            ? "€"
            : currency === "GBP"
              ? "£"
              : currency === "SGD"
                ? "S$"
                : "";
  return `${symbol}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  const map = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    viewed:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };
  return map[s] || map.draft;
};

const statusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// ---------- component ----------
const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentQuotation, currentQuotationLoading, currentQuotationError } =
    useSelector((state) => state.quotations);

  useEffect(() => {
    dispatch(fetchQuotationById(id));
    return () => dispatch(clearCurrentQuotation());
  }, [dispatch, id]);

  const q = currentQuotation ? fromQuotationApi(currentQuotation) : null;

  const handleMarkStatus = async (status) => {
    try {
      await dispatch(updateQuotationStatusApi({ id, status })).unwrap();
      showToast(`Quotation marked as ${status}`, "success");
      dispatch(fetchQuotationById(id));
    } catch (err) {
      showToast(err || "Failed to update status", "error");
    }
  };

  const handleSend = async () => {
    try {
      await dispatch(updateQuotationStatusApi({ id, status: "sent" })).unwrap();
      showToast("Quotation sent", "success");
      dispatch(fetchQuotationById(id));
    } catch (err) {
      showToast(err || "Failed to send", "error");
    }
  };

  if (currentQuotationLoading) {
    return (
      <div className="w-full py-16 text-center text-gray-500 dark:text-gray-400">
        Loading quotation…
      </div>
    );
  }

  if (currentQuotationError || !q) {
    return (
      <div className="w-full py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {currentQuotationError || "Quotation not found"}
        </p>
        <button
          onClick={() => navigate("/admin/crm/quotations")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Back to Quotations
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {q.quotationNumber}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(q.status)}`}
              >
                {statusLabel(q.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Created {formatDate(q.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/admin/crm/quotations/${id}/edit`)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Pencil size={14} /> Edit
          </button>

          {/* Show Send only if not already sent / not in a terminal state */}
          {q.status === "draft" && (
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Send size={14} /> Send
            </button>
          )}

          {/* Accept / Reject only when sent or viewed */}
          {["sent", "viewed"].includes(q.status) && (
            <>
              <button
                onClick={() => handleMarkStatus("accepted")}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => handleMarkStatus("rejected")}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Customer
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <Building2 size={14} className="text-gray-400" />
              {q.customerName}
            </div>
            {q.contactPerson && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User size={14} className="text-gray-400" />
                {q.contactPerson}
              </div>
            )}
            {q.contactEmail && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail size={14} className="text-gray-400" />
                {q.contactEmail}
              </div>
            )}
            {q.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone size={14} className="text-gray-400" />
                {q.contactPhone}
              </div>
            )}
            {q.billingAddress && (
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <MapPin
                  size={14}
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                />
                <span className="whitespace-pre-line">{q.billingAddress}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetaRow
              icon={Calendar}
              label="Issue Date"
              value={formatDate(q.quotationDate)}
            />
            <MetaRow
              icon={Clock}
              label="Valid Until"
              value={formatDate(q.validUntil)}
            />
            <MetaRow icon={FileText} label="Currency" value={q.currency} />
            <MetaRow
              icon={FileText}
              label="Payment Terms"
              value={q.paymentTerms || "—"}
            />
            {q.deliveryTimeline && (
              <div className="col-span-2">
                <MetaRow
                  icon={Clock}
                  label="Delivery"
                  value={q.deliveryTimeline}
                />
              </div>
            )}
            {q.leadName && (
              <div className="col-span-2">
                <MetaRow
                  icon={FileText}
                  label="Related Lead"
                  value={q.leadName}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Line Items
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {[
                  "#",
                  "PRODUCT / SERVICE",
                  "DESCRIPTION",
                  "QTY",
                  "UNIT PRICE",
                  "DISCOUNT",
                  "TAX %",
                  "TOTAL",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.items.map((it, idx) => {
                const qty = Number(it.quantity) || 0;
                const unit = Number(it.unit_price) || 0;
                const base = qty * unit;
                const disc =
                  it.discount_type === "percent"
                    ? (base * (Number(it.discount) || 0)) / 100
                    : Number(it.discount) || 0;
                const taxable = base - disc;
                const tax = (taxable * (Number(it.tax_percent) || 0)) / 100;
                const total = taxable + tax;
                return (
                  <tr
                    key={it.id}
                    className="border-b border-gray-100 dark:border-gray-700/40"
                  >
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {it.product_service}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {it.description || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {qty}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(unit, q.currency)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {it.discount_type === "percent"
                        ? `${it.discount}%`
                        : formatCurrency(it.discount, q.currency)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {it.tax_percent}%
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(total, q.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {q.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Notes
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {q.notes}
              </p>
            </div>
          )}
          {q.termsAndConditions && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Terms & Conditions
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {q.termsAndConditions}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3 self-start">
          <TotalRow
            label="Subtotal"
            value={formatCurrency(q.subtotal, q.currency)}
          />
          <TotalRow
            label="Tax Total"
            value={formatCurrency(q.taxTotal, q.currency)}
          />
          <TotalRow
            label="Additional Charges"
            value={formatCurrency(q.additionalCharges, q.currency)}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                Grand Total
              </span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(q.grandTotal, q.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetaRow = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      <Icon size={11} /> {label}
    </div>
    <div className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
      {value}
    </div>
  </div>
);

const TotalRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400 font-medium">
      {label}
    </span>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      {value}
    </span>
  </div>
);

export default ViewQuotation;
