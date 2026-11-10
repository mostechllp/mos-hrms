import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addRecurringBill, updateRecurringBill } from "../../../store/slices/accounts/recurringBillsSlice";
import { X, Plus, Search, FileText, ChevronDown, Info } from "lucide-react";

const inputCls =
  "w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500";

// Inline-editable cells in the item table share this style
const cellInputCls =
  "w-full border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded px-2 py-1 text-sm focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500";

const SearchableSelect = ({ options, value, onChange, placeholder, className }) => (
  <select
    className={`w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 ${className}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const RecurringBillForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingBill = useSelector((state) =>
    state.recurringBills.recurringBills.find((b) => b.id === id)
  );
  const vendors = useSelector(
    (state) =>
      state?.vendors?.vendors || [
        { vendorName: "LocalFix" },
        { vendorName: "Acme Corp" },
      ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    profileName: "",
    vendor: "",
    repeatEvery: "Week",
    startOn: new Date().toISOString().split("T")[0],
    endsOn: "",
    neverExpires: true,
    accountsPayable: "Accounts Payable",
    paymentTerms: "Due on Receipt",
    items: [{ id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    subTotal: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    if (existingBill) {
      setFormData({ ...existingBill });
    }
  }, [existingBill]);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (["quantity", "rate"].includes(field)) {
      const qty = Number(newItems[index].quantity) || 0;
      const rate = Number(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }

    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setFormData((prev) => ({ ...prev, items: newItems, subTotal: newTotal, total: newTotal }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now().toString(), name: "", account: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setFormData((prev) => ({ ...prev, items: newItems, subTotal: newTotal, total: newTotal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor.trim() || !formData.profileName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) {
        await dispatch(updateRecurringBill({ id, ...formData })).unwrap();
      } else {
        await dispatch(addRecurringBill(formData)).unwrap();
      }
      navigate("/admin/accounts/purchases/recurring-bills");
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between py-3 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FileText size={20} className="text-gray-600 dark:text-gray-400" />
          {id ? "Edit Recurring Bill" : "New Recurring Bill"}
        </h1>
        <button
          onClick={() => navigate("/admin/accounts/purchases/recurring-bills")}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 pb-8">
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Vendor Section */}
          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Vendor Name <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="flex">
                <SearchableSelect
                  options={vendors.map((v) => ({ value: v.vendorName, label: v.vendorName }))}
                  value={formData.vendor}
                  onChange={(val) => setField("vendor", val)}
                  placeholder="Select a Vendor"
                  className="rounded-r-none border-r-0"
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 border border-blue-500 rounded-r-md hover:bg-blue-600"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">
                Profile Name <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                value={formData.profileName}
                onChange={(e) => setField("profileName", e.target.value)}
                placeholder="e.g., Weekly Maintenance"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">
                Repeat Every <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                className={inputCls}
                value={formData.repeatEvery}
                onChange={(e) => setField("repeatEvery", e.target.value)}
              >
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">
                Start On <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={formData.startOn}
                onChange={(e) => setField("startOn", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">Ends On</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="date"
                  disabled={formData.neverExpires}
                  className={`${inputCls} ${
                    formData.neverExpires
                      ? "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.endsOn}
                  onChange={(e) => setField("endsOn", e.target.value)}
                />
                <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.neverExpires}
                    onChange={(e) => setField("neverExpires", e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-900"
                  />
                  Never Expires
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0 flex items-center gap-1">
                Accounts Payable <Info size={14} className="text-gray-400 dark:text-gray-500" />
              </label>
              <select
                className={inputCls}
                value={formData.accountsPayable}
                onChange={(e) => setField("accountsPayable", e.target.value)}
              >
                <option value="Accounts Payable">Accounts Payable</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">Payment Terms</label>
              <select
                className={inputCls}
                value={formData.paymentTerms}
                onChange={(e) => setField("paymentTerms", e.target.value)}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Item Table */}
          <div className="p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <FileText size={14} /> At Transaction Level <ChevronDown size={12} />
              </span>
            </div>

            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="px-3 py-2 w-[30%]">ITEM DETAILS</th>
                  <th className="px-3 py-2">ACCOUNT</th>
                  <th className="px-3 py-2 text-right">QUANTITY</th>
                  <th className="px-3 py-2 text-right">RATE</th>
                  <th className="px-3 py-2 text-right">AMOUNT</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {formData.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                    <td className="px-3 py-3 text-gray-400 dark:text-gray-500 text-center">
                      <div className="cursor-grab">⋮⋮</div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        className={cellInputCls}
                        placeholder="Type or click to select an item."
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select className={cellInputCls}>
                        <option value="">Select an account</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        className={`${cellInputCls} w-20 text-right`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        className={`${cellInputCls} w-24 text-right`}
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                      {Number(item.amount).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <button
                type="button"
                onClick={addItemRow}
                className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded"
              >
                <Plus size={14} /> Add New Row
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end p-6 pt-0">
            <div className="w-full max-w-sm space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sub Total</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formData.subTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                <span className="text-gray-800 dark:text-gray-200 font-semibold text-base">Total</span>
                <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                  ₹{formData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Notes */}
          <div className="p-6">
            <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none h-24 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="It will not be shown in PDF"
              value={formData.notes}
              onChange={(e) => setField("notes", e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/admin/accounts/purchases/recurring-bills")}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecurringBillForm;