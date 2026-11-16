// src/admin/pages/accounts/JournalForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addJournal } from "../../../store/slices/accounts/manualJournalsSlice";
import {
  X, Plus, Trash2, Settings, Info, Upload, ChevronDown, ChevronRight,
  GripVertical, Sparkles,
} from "lucide-react";
import TransactionNumberSettingsModal from "../common/TransactionNumberSettingsModal";

const inputCls =
  "w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
      {hint && <Info size={12} className="text-gray-400 ml-0.5" />}
    </label>
    {children}
  </div>
);

const Card = ({ title, description, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && (
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            {title}
          </h2>
        )}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

/* ---------- page ---------- */

const JournalForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.manualJournals.loading);

  const [isNumberSettingsOpen, setIsNumberSettingsOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    reverseDate: "",
    publishReverseOnly: false,
    journalNumber: "1",
    referenceNumber: "",
    notes: "",
    reportingMethod: "Accrual and Cash",
    currency: "INR- Indian Rupee",
    lines: [
      { id: Date.now().toString(), account: "", description: "", contact: "", debit: "", credit: "" },
      { id: Date.now().toString() + "1", account: "", description: "", contact: "", debit: "", credit: "" },
    ],
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData((prev) => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { id: Date.now().toString(), account: "", description: "", contact: "", debit: "", credit: "" }],
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length <= 2) return;
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, lines: newLines }));
  };

  const totalDebit = formData.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = formData.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = totalDebit - totalCredit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.notes.trim()) return;
    try {
      await dispatch(addJournal(formData)).unwrap();
      navigate("/admin/accounts/accountant/manual-journals");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full overflow-x-hidden pb-24">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5 flex-wrap">
            <Link
              to="/admin/dashboard"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <Link
              to="/admin/accounts/accountant/manual-journals"
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Manual journals
            </Link>
            <ChevronRight size={11} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">New</span>
          </nav>
          <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
            New journal
          </h2>
          <p className="text-xs md:text-[13px] text-gray-500 mt-0.5">
            Transfer and adjust money between accounts using double-entry lines
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            Choose template
          </button>
          <button
            onClick={() => navigate("/admin/accounts/accountant/manual-journals")}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ---- Info banner ---- */}
      <div className="mb-4 flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/60 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300">
        <Sparkles size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Every line must be a debit or a credit. The total debits and credits must balance
          before the journal can be saved.{" "}
          <a
            href="#"
            className="font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
          >
            Learn more →
          </a>
        </p>
      </div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Journal information */}
        <Card title="Journal information" description="Date, reference, and reporting basis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Date" required>
              <input
                type="date"
                className={inputCls}
                value={formData.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </Field>

            <Field label="Reverse journal date">
              <input
                type="date"
                className={inputCls}
                value={formData.reverseDate}
                onChange={(e) => setField("reverseDate", e.target.value)}
              />
            </Field>

            <Field label="Journal #" required>
              <div className="relative">
                <input
                  type="text"
                  className={`${inputCls} pr-10`}
                  value={formData.journalNumber}
                  onChange={(e) => setField("journalNumber", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setIsNumberSettingsOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700 transition-colors"
                  title="Configure Journal Number"
                >
                  <Settings size={16} />
                </button>
              </div>
            </Field>

            <Field label="Reference #">
              <input
                type="text"
                className={inputCls}
                value={formData.referenceNumber}
                onChange={(e) => setField("referenceNumber", e.target.value)}
              />
            </Field>

            <Field label="Notes" required className="md:col-span-2">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Max. 500 characters"
                value={formData.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </Field>

            <Field label="Reporting method" hint className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {["Accrual and Cash", "Accrual Only", "Cash Only"].map((method) => (
                  <label
                    key={method}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs md:text-[12.5px] cursor-pointer transition-colors ${
                      formData.reportingMethod === method
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportingMethod"
                      value={method}
                      checked={formData.reportingMethod === method}
                      onChange={() => setField("reportingMethod", method)}
                      className="text-green-500 focus:ring-green-400 border-gray-300 dark:border-gray-600"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Currency" className="md:col-span-2">
              <select
                className={`${inputCls} max-w-xs`}
                value={formData.currency}
                onChange={(e) => setField("currency", e.target.value)}
              >
                <option value="INR- Indian Rupee">INR — Indian Rupee</option>
                <option value="USD- US Dollar">USD — US Dollar</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publishReverseOnly}
                  onChange={(e) => setField("publishReverseOnly", e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
                />
                Publish reverse journal only on the reverse journal date
                <Info size={12} className="text-gray-400" />
              </label>
            </div>
          </div>
        </Card>

        {/* Journal lines */}
        <Card title="Journal lines" description="Each line must be a debit or a credit">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs md:text-[12.5px] whitespace-nowrap border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
                  <th className="w-8 px-2 py-2 md:py-2.5"></th>
                  <th className="px-2 py-2 md:py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 w-[26%]">Account</th>
                  <th className="px-2 py-2 md:py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Description</th>
                  <th className="px-2 py-2 md:py-2.5 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="px-2 py-2 md:py-2.5 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Debits</th>
                  <th className="px-2 py-2 md:py-2.5 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Credits</th>
                  <th className="w-8 px-2 py-2 md:py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {formData.lines.map((line, index) => (
                  <tr key={line.id} className="group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 py-2 text-center">
                      <GripVertical size={13} className="text-gray-300 dark:text-gray-600 mx-auto cursor-grab" />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                        value={line.account}
                        onChange={(e) => handleLineChange(index, "account", e.target.value)}
                      >
                        <option value="">Select account</option>
                        <option value="Employee Advance">Employee Advance</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        placeholder="Description"
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors"
                        value={line.description}
                        onChange={(e) => handleLineChange(index, "description", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1.5 text-xs md:text-[12.5px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                        value={line.contact}
                        onChange={(e) => handleLineChange(index, "contact", e.target.value)}
                      >
                        <option value="">Select contact</option>
                        <option value="LocalFix">LocalFix</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-24 px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors tabular-nums"
                        value={line.debit}
                        onChange={(e) => handleLineChange(index, "debit", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-24 px-2 py-1.5 text-xs md:text-[12.5px] text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-green-400 focus:bg-white dark:focus:bg-gray-900 rounded-md text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors tabular-nums"
                        value={line.credit}
                        onChange={(e) => handleLineChange(index, "credit", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove line"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
            >
              <Plus size={13} /> Add new row
            </button>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full sm:w-[420px] bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2 text-xs md:text-[12.5px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Subtotal</span>
                <div className="flex gap-8">
                  <span className="font-medium w-24 text-right text-gray-800 dark:text-gray-100 tabular-nums">
                    {totalDebit.toFixed(2)}
                  </span>
                  <span className="font-medium w-24 text-right text-gray-800 dark:text-gray-100 tabular-nums">
                    {totalCredit.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-gray-100 font-semibold">Total (₹)</span>
                <div className="flex gap-8">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 w-24 text-right tabular-nums">
                    {totalDebit.toFixed(2)}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 w-24 text-right tabular-nums">
                    {totalCredit.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${difference !== 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
                  Difference
                </span>
                <span
                  className={`font-medium w-24 text-right tabular-nums ${
                    difference !== 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"
                  }`}
                >
                  {difference.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Attachments */}
        <Card title="Attachments" description="Upload supporting documents (max 5 files, 10MB each)">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Upload size={13} /> Upload file <ChevronDown size={13} className="ml-0.5" />
          </button>
        </Card>

        {/* Footer actions */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
            >
              Save as draft
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => navigate("/admin/accounts/accountant/manual-journals")}
              className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? "Saving…" : "Save journal"}
            </button>
          </div>
        </div>
      </form>

      {/* Reusable Number Settings Modal */}
      <TransactionNumberSettingsModal
        isOpen={isNumberSettingsOpen}
        onClose={() => setIsNumberSettingsOpen(false)}
        title="Configure Journal Number Preferences"
        initialData={{ autoGenerate: true, prefix: "", nextNumber: "1", restartFiscalYear: false }}
        onSave={(data) => {
          console.log("Journal Number Settings Saved:", data);
        }}
      />
    </div>
  );
};

export default JournalForm;