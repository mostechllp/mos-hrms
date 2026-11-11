import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addJournal } from "../../../store/slices/accounts/manualJournalsSlice";
import {
  X, Plus, Trash2, Settings, Info, Upload, ChevronDown, ChevronRight, GripVertical,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition";

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && <Info size={12} className="text-slate-400 ml-0.5" />}
    </label>
    {children}
  </div>
);

const Surface = ({ title, description, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {(title || description) && (
      <div className="px-5 sm:px-6 pt-5 pb-1">
        {title && <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
        {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/accountant/manual-journals" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Manual journals
              </Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">New</span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              New journal
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Transfer and adjust money between accounts using double-entry lines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Choose template
            </button>
            <button
              onClick={() => navigate("/admin/accounts/accountant/manual-journals")}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Journal information */}
          <Surface title="Journal information" description="Date, reference, and reporting basis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                    className={`${inputCls} pr-9`}
                    value={formData.journalNumber}
                    onChange={(e) => setField("journalNumber", e.target.value)}
                  />
                  <Settings
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  />
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
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-[12.5px] cursor-pointer transition-colors ${
                        formData.reportingMethod === method
                          ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportingMethod"
                        value={method}
                        checked={formData.reportingMethod === method}
                        onChange={() => setField("reportingMethod", method)}
                        className="text-slate-900 focus:ring-slate-400 border-slate-300"
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
                <label className="inline-flex items-center gap-2 text-[12.5px] text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publishReverseOnly}
                    onChange={(e) => setField("publishReverseOnly", e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  Publish reverse journal only on the reverse journal date
                  <Info size={12} className="text-slate-400" />
                </label>
              </div>
            </div>
          </Surface>

          {/* Journal lines */}
          <Surface title="Journal lines" description="Each line must be a debit or a credit">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="w-8 px-2 py-2.5"></th>
                    <th className="px-2 py-2.5 text-left font-medium w-[26%]">Account</th>
                    <th className="px-2 py-2.5 text-left font-medium">Description</th>
                    <th className="px-2 py-2.5 text-left font-medium">Contact</th>
                    <th className="px-2 py-2.5 text-right font-medium">Debits</th>
                    <th className="px-2 py-2.5 text-right font-medium">Credits</th>
                    <th className="w-8 px-2 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.lines.map((line, index) => (
                    <tr key={line.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-2 py-2 text-center">
                        <GripVertical size={13} className="text-slate-300 dark:text-slate-600 mx-auto cursor-grab" />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
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
                          className="w-full px-2 py-1.5 text-[12.5px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, "description", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full px-2 py-1.5 text-[12.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
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
                          className="w-24 px-2 py-1.5 text-[12.5px] text-right bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors tabular-nums"
                          value={line.debit}
                          onChange={(e) => handleLineChange(index, "debit", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-24 px-2 py-1.5 text-[12.5px] text-right bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors tabular-nums"
                          value={line.credit}
                          onChange={(e) => handleLineChange(index, "credit", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus size={13} /> Add new row
              </button>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-full sm:w-[420px] bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 text-[12.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subtotal</span>
                  <div className="flex gap-8">
                    <span className="font-medium w-24 text-right text-slate-800 dark:text-slate-100 tabular-nums">
                      {totalDebit.toFixed(2)}
                    </span>
                    <span className="font-medium w-24 text-right text-slate-800 dark:text-slate-100 tabular-nums">
                      {totalCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">Total (₹)</span>
                  <div className="flex gap-8">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 w-24 text-right tabular-nums">
                      {totalDebit.toFixed(2)}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 w-24 text-right tabular-nums">
                      {totalCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${difference !== 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                    Difference
                  </span>
                  <span
                    className={`font-medium w-24 text-right tabular-nums ${
                      difference !== 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
                    }`}
                  >
                    {difference.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Surface>

          {/* Attachments */}
          <Surface title="Attachments" description="Upload supporting documents (max 5 files, 10MB each)">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Upload size={13} /> Upload file <ChevronDown size={13} className="ml-0.5" />
            </button>
          </Surface>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save as draft
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => navigate("/admin/accounts/accountant/manual-journals")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving…" : "Save journal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalForm;