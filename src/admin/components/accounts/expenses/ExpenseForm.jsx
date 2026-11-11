import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addExpense, updateExpense } from "../../../store/slices/accounts/expensesSlice";
import {
  X, Search, UploadCloud, ChevronDown, ListTree, Plus, Trash2,
  MoreHorizontal, Tag, FileText, RotateCcw,
} from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- constants ---------- */

const EXPENSE_ACCOUNTS = [
  { value: "Advertising And Marketing", label: "Advertising And Marketing" },
  { value: "Automobile Expense", label: "Automobile Expense" },
  { value: "Job Costing", label: "Job Costing" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Rent Expense", label: "Rent Expense" },
  { value: "Travel Expense", label: "Travel Expense" },
];

const PAID_THROUGH_ACCOUNTS = [
  { value: "Petty Cash", label: "Petty Cash" },
  { value: "Undeposited Funds", label: "Undeposited Funds" },
  { value: "Bank Account", label: "Bank Account" },
];

const createEmptyRow = () => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
  date: "",
  expenseAccount: "",
  amount: "",
  paidThrough: "",
  vendor: "",
  customerName: "",
  project: "",
  billable: false,
});

/* ---------- primitives ---------- */

const Field = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const Surface = ({ title, description, action, children, className = "" }) => (
  <section className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}>
    {(title || description || action) && (
      <div className="px-5 sm:px-6 pt-5 pb-1 flex items-start justify-between gap-3">
        <div>
          {title && <h2 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
          {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const ReceiptDropzone = () => (
  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
    <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center mb-3">
      <UploadCloud size={18} className="text-white dark:text-slate-900" />
    </div>
    <p className="text-[12.5px] font-medium text-slate-800 dark:text-slate-200 mb-0.5">Drag or drop receipts</p>
    <p className="text-[11px] text-slate-500 mb-3">Max file size 10 MB</p>
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <UploadCloud size={12} /> Upload files <ChevronDown size={11} />
    </button>
  </div>
);

const CurrencyInput = ({ value, onChange, readOnly }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
      INR
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
    />
  </div>
);

/* ---------- page ---------- */

const ExpenseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingExpense = useSelector((state) =>
    state.expenses.expenses.find((e) => e.id === id)
  );
  const vendors = useSelector((state) => state.vendors.vendors) || [];
  const customers = useSelector((state) => state.customers.customers) || [];

  const [activeTab, setActiveTab] = useState("Record expense");

  const [formData, setFormData] = useState({
    date: existingExpense?.date || new Date().toISOString().split("T")[0],
    expenseAccount: existingExpense?.expenseAccount || "",
    amount: existingExpense?.amount || "",
    paidThrough: existingExpense?.paidThrough || "",
    vendor: existingExpense?.vendor || "",
    invoiceNumber: existingExpense?.invoiceNumber || "",
    notes: existingExpense?.notes || "",
    customerName: existingExpense?.customerName || "",
    isBillable: existingExpense?.isBillable || false,
    currency: "INR",
  });

  const [mileageData, setMileageData] = useState({
    date: new Date().toISOString().split("T")[0],
    employee: "",
    calculateMileageUsing: "distance",
    distance: "",
    ratePerKm: 3,
    amount: "0.00",
    paidThrough: "",
    vendor: "",
    invoiceNumber: "",
    notes: "",
    customerName: "",
  });

  const [bulkRows, setBulkRows] = useState([
    createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow(),
  ]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const setMileageField = (key, value) => setMileageData((prev) => ({ ...prev, [key]: value }));

  const handleBulkRowChange = (rowId, field, value) =>
    setBulkRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
  const addBulkRow = () => setBulkRows([...bulkRows, createEmptyRow()]);
  const removeBulkRow = (rowId) => setBulkRows(bulkRows.filter((r) => r.id !== rowId));

  useEffect(() => {
    if (mileageData.calculateMileageUsing === "distance" && mileageData.distance) {
      const amt = Number(mileageData.distance) * mileageData.ratePerKm;
      setMileageField("amount", amt.toFixed(2));
    }
  }, [mileageData.distance, mileageData.ratePerKm, mileageData.calculateMileageUsing]);

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (activeTab === "Record expense") {
      if (!formData.expenseAccount || !formData.amount) return;
      const finalData = {
        ...formData,
        amount: Number(formData.amount) || 0,
        isBillable: !!formData.customerName,
        status: "Paid",
      };
      if (id) dispatch(updateExpense({ id, ...finalData }));
      else dispatch(addExpense(finalData));
    } else if (activeTab === "Record mileage") {
      if (!mileageData.paidThrough || !mileageData.amount) return;
      dispatch(addExpense({
        ...mileageData,
        expenseAccount: "Automobile Expense",
        amount: Number(mileageData.amount) || 0,
        status: "Paid",
      }));
    } else if (activeTab === "Bulk add expenses") {
      const valid = bulkRows.filter((r) => r.expenseAccount && r.amount);
      valid.forEach((row) =>
        dispatch(addExpense({ ...row, amount: Number(row.amount) || 0, status: "Paid" }))
      );
    }
    navigate("/admin/accounts/purchases/expenses");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchases · Expenses</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
              {id ? "Edit expense" : "Record expense"}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update expense details" : "Log a single expense, mileage, or several at once"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/purchases/expenses")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Tabs ---- */}
        <Surface className="mb-4 !py-0">
          <div className="px-5 sm:px-6">
            <div className="flex gap-1 -mb-px overflow-x-auto">
              {["Record expense", "Record mileage", "Bulk add expenses"].map((tab) => (
                <button
                  key={tab}
                  type="button"
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
        </Surface>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ==== Record expense ==== */}
          {activeTab === "Record expense" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <Surface title="Expense details" description="What was spent, on what, and how it was paid">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                    <Field label="Date" required>
                      <input type="date" className={inputCls} value={formData.date} onChange={(e) => setField("date", e.target.value)} />
                    </Field>
                    <Field label="Amount" required>
                      <CurrencyInput value={formData.amount} onChange={(e) => setField("amount", e.target.value)} />
                    </Field>

                    <Field label="Expense account" required>
                      <SearchableSelect value={formData.expenseAccount} onChange={(v) => setField("expenseAccount", v)} options={EXPENSE_ACCOUNTS} placeholder="Select an account" />
                      <button type="button" className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                        <ListTree size={12} /> Itemize
                      </button>
                    </Field>

                    <Field label="Paid through" required>
                      <SearchableSelect value={formData.paidThrough} onChange={(v) => setField("paidThrough", v)} options={PAID_THROUGH_ACCOUNTS} placeholder="Select an account" />
                    </Field>

                    <Field label="Vendor">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableSelect value={formData.vendor} onChange={(v) => setField("vendor", v)} options={vendors.map((v) => ({ value: v.displayName, label: v.displayName }))} placeholder="Select vendor" />
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>

                    <Field label="Invoice #">
                      <input type="text" className={inputCls} value={formData.invoiceNumber} onChange={(e) => setField("invoiceNumber", e.target.value)} />
                    </Field>
                  </div>

                  <Field label="Notes">
                    <textarea rows={3} className={inputCls} placeholder="Max. 500 characters" value={formData.notes} onChange={(e) => setField("notes", e.target.value)} />
                  </Field>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Field label="Customer (for billable expenses)">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableSelect value={formData.customerName} onChange={(v) => setField("customerName", v)} options={customers.map((c) => ({ value: c.displayName, label: c.displayName }))} placeholder="Select or add a customer" />
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              </Surface>

              <div className="space-y-4">
                <Surface title="Receipt">
                  <ReceiptDropzone />
                </Surface>
              </div>
            </div>
          )}

          {/* ==== Record mileage ==== */}
          {activeTab === "Record mileage" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <Surface title="Mileage details" description="Track mileage with automatic rate calculation">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                    <Field label="Date" required>
                      <input type="date" className={inputCls} value={mileageData.date} onChange={(e) => setMileageField("date", e.target.value)} />
                    </Field>
                    <Field label="Employee">
                      <select className={inputCls} value={mileageData.employee} onChange={(e) => setMileageField("employee", e.target.value)}>
                        <option value="">Select employee</option>
                        <option value="fidha">Joe Doe</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Calculate mileage using" required>
                    <div className="flex items-center gap-5 h-9">
                      <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" checked={mileageData.calculateMileageUsing === "distance"} onChange={() => setMileageField("calculateMileageUsing", "distance")} className="text-slate-900 focus:ring-slate-400 border-slate-300" />
                        Distance travelled
                      </label>
                      <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" checked={mileageData.calculateMileageUsing === "odometer"} onChange={() => setMileageField("calculateMileageUsing", "odometer")} className="text-slate-900 focus:ring-slate-400 border-slate-300" />
                        Odometer reading
                      </label>
                    </div>
                  </Field>

                  {mileageData.calculateMileageUsing === "distance" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                      <Field label="Distance" required>
                        <div className="flex">
                          <input type="number" className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums" value={mileageData.distance} onChange={(e) => setMileageField("distance", e.target.value)} />
                          <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg">
                            km
                          </span>
                        </div>
                      </Field>
                      <Field label="Rate">
                        <div className="flex items-center h-9 text-[12.5px] text-slate-600 dark:text-slate-300">
                          ₹ {mileageData.ratePerKm} / km
                          <button type="button" className="ml-2 text-slate-900 dark:text-slate-100 font-medium hover:underline">Change</button>
                        </div>
                      </Field>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                    <Field label="Amount" required>
                      <CurrencyInput
                        value={mileageData.amount}
                        onChange={(e) => setMileageField("amount", e.target.value)}
                        readOnly={mileageData.calculateMileageUsing === "distance"}
                      />
                    </Field>
                    <Field label="Paid through" required>
                      <SearchableSelect value={mileageData.paidThrough} onChange={(v) => setMileageField("paidThrough", v)} options={PAID_THROUGH_ACCOUNTS} placeholder="Select an account" />
                    </Field>
                    <Field label="Vendor">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableSelect value={mileageData.vendor} onChange={(v) => setMileageField("vendor", v)} options={vendors.map((v) => ({ value: v.displayName, label: v.displayName }))} placeholder="Select vendor" />
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>
                    <Field label="Invoice #">
                      <input type="text" className={inputCls} value={mileageData.invoiceNumber} onChange={(e) => setMileageField("invoiceNumber", e.target.value)} />
                    </Field>
                  </div>

                  <Field label="Notes">
                    <textarea rows={3} className={inputCls} placeholder="Max. 500 characters" value={mileageData.notes} onChange={(e) => setMileageField("notes", e.target.value)} />
                  </Field>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Field label="Customer (for billable expenses)">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableSelect value={mileageData.customerName} onChange={(v) => setMileageField("customerName", v)} options={customers.map((c) => ({ value: c.displayName, label: c.displayName }))} placeholder="Select or add a customer" />
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              </Surface>

              <Surface title="Receipt">
                <ReceiptDropzone />
              </Surface>
            </div>
          )}

          {/* ==== Bulk add expenses ==== */}
          {activeTab === "Bulk add expenses" && (
            <Surface title="Bulk expenses" description="Add multiple expenses at once" className="!py-0">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full min-w-[1100px] text-[12.5px]">
                  <thead>
                    <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 w-8" />
                      <th className="text-left  font-medium py-2.5 px-2 text-rose-500">Date *</th>
                      <th className="text-left  font-medium py-2.5 px-2 text-rose-500">Account *</th>
                      <th className="text-left  font-medium py-2.5 px-2 text-rose-500">Amount *</th>
                      <th className="text-left  font-medium py-2.5 px-2 text-rose-500">Paid through *</th>
                      <th className="text-left  font-medium py-2.5 px-2">Vendor</th>
                      <th className="text-left  font-medium py-2.5 px-2">Customer</th>
                      <th className="text-left  font-medium py-2.5 px-2">Project</th>
                      <th className="text-center font-medium py-2.5 px-2">Billable</th>
                      <th className="text-left  font-medium py-2.5 px-2">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkRows.map((row) => (
                      <tr key={row.id} className="align-top group">
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeBulkRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove row"
                            aria-label="Remove row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                        <td className="py-2 px-2">
                          <input type="date" className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" value={row.date} onChange={(e) => handleBulkRowChange(row.id, "date", e.target.value)} />
                        </td>
                        <td className="py-2 px-2">
                          <select className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" value={row.expenseAccount} onChange={(e) => handleBulkRowChange(row.id, "expenseAccount", e.target.value)}>
                            <option value="">Select</option>
                            {EXPENSE_ACCOUNTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex">
                            <span className="inline-flex items-center px-2 text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-md">INR</span>
                            <input type="number" className="flex-1 min-w-0 px-2 py-1.5 text-[12px] text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-slate-400 tabular-nums" value={row.amount} onChange={(e) => handleBulkRowChange(row.id, "amount", e.target.value)} />
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <select className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" value={row.paidThrough} onChange={(e) => handleBulkRowChange(row.id, "paidThrough", e.target.value)}>
                            <option value="">Select</option>
                            {PAID_THROUGH_ACCOUNTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" value={row.vendor} onChange={(e) => handleBulkRowChange(row.id, "vendor", e.target.value)}>
                            <option value="">Select</option>
                            {vendors.map((v) => <option key={v.id} value={v.displayName}>{v.displayName}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400" value={row.customerName} onChange={(e) => handleBulkRowChange(row.id, "customerName", e.target.value)}>
                            <option value="">Select</option>
                            {customers.map((c) => <option key={c.id} value={c.displayName}>{c.displayName}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select className="w-full px-2 py-1.5 text-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400">
                            <option value="">Select</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.billable}
                            onChange={(e) => handleBulkRowChange(row.id, "billable", e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <button type="button" className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <Tag size={10} /> Tags
                            </button>
                            <button type="button" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 pb-5">
                <button
                  type="button"
                  onClick={addBulkRow}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus size={13} /> Add row
                </button>
              </div>
            </Surface>
          )}

          {/* ---- Footer ---- */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/purchases/expenses")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              {activeTab !== "Bulk add expenses" && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Save &amp; new
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;