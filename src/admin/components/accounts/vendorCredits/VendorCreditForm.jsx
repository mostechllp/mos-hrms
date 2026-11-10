import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addVendorCredit, updateVendorCredit } from "../../../store/slices/accounts/vendorCreditsSlice";
import { X, Plus, Search, FileText, ChevronDown, Info, Upload, Settings } from "lucide-react";

const inputCls =
  "w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500";

// Inline-editable cells in the item table share this style
const cellInputCls =
  "w-full border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded px-2 py-1 text-sm focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500";

const VendorCreditForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const existingCredit = useSelector((state) =>
    state.vendorCredits.vendorCredits.find((c) => c.id === id)
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
    creditNoteNumber: "",
    vendor: "",
    orderNumber: "",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    accountsPayable: "Accounts Payable",
    items: [{ id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, amount: 0 }],
    subTotal: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    if (existingCredit) {
      setFormData({ ...existingCredit });
    }
  }, [existingCredit]);

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
        { id: Date.now().toString(), name: "", description: "", account: "", quantity: 1, rate: 0, amount: 0 },
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
    if (!formData.vendor.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) {
        await dispatch(updateVendorCredit({ id, ...formData })).unwrap();
      } else {
        await dispatch(addVendorCredit(formData)).unwrap();
      }
      navigate("/admin/accounts/purchases/vendor-credits");
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
          {id ? "Edit Vendor Credit" : "New Vendor Credits"}
        </h1>
        <button
          onClick={() => navigate("/admin/accounts/purchases/vendor-credits")}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-8">
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
                <select
                  className={`${inputCls} rounded-r-none border-r-0`}
                  value={formData.vendor}
                  onChange={(e) => setField("vendor", e.target.value)}
                >
                  <option value="">Select a Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.vendorName} value={v.vendorName}>{v.vendorName}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 border border-blue-500 rounded-r-md flex items-center justify-center hover:bg-blue-600"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">
                Credit Note# <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.creditNoteNumber}
                  onChange={(e) => setField("creditNoteNumber", e.target.value)}
                />
                <Settings size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">Order Number</label>
              <input
                type="text"
                className={inputCls}
                value={formData.orderNumber}
                onChange={(e) => setField("orderNumber", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">Vendor Credit Date</label>
              <input
                type="date"
                className={inputCls}
                value={formData.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0 flex items-center gap-1">
                Subject <Info size={14} className="text-gray-400 dark:text-gray-500" />
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Enter a subject within 250 characters"
                value={formData.subject}
                onChange={(e) => setField("subject", e.target.value)}
                maxLength={250}
              />
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
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Item Table */}
          <div className="p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <FileText size={14} /> At Transaction Level <ChevronDown size={12} />
              </span>
              <button type="button" className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center gap-1">
                <Plus size={14} /> Bulk Actions
              </button>
            </div>

            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="px-3 py-2 w-[35%]">ITEM DETAILS</th>
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
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 mb-1 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Type or click to select an item."
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded px-2 py-1 text-xs focus:outline-none text-gray-500 dark:text-gray-400 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
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

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={addItemRow}
                className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded"
              >
                <Plus size={14} /> Add New Row
              </button>
              <button
                type="button"
                className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 hover:underline border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded bg-gray-50 dark:bg-gray-900"
              >
                <Plus size={14} /> Add Items in Bulk
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end p-6 pt-0">
            <div className="w-full max-w-sm space-y-3 text-sm bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Sub Total</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formData.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Discount</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-right text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="0"
                  />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">%</span>
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400">0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <input type="radio" name="taxType" defaultChecked className="text-blue-600 dark:bg-gray-800 dark:border-gray-600" /> TDS
                  </label>
                  <label className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <input type="radio" name="taxType" className="text-blue-600 dark:bg-gray-800 dark:border-gray-600" /> TCS
                  </label>
                </div>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-32 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400">
                  <option>Select a Tax</option>
                </select>
                <span className="font-medium text-gray-500 dark:text-gray-400">- 0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                <input
                  type="number"
                  className="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-right text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="0.00"
                />
                <Info size={14} className="text-gray-400 dark:text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">0.00</span>
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

          {/* Notes & Attachments */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/30 dark:bg-gray-900/20">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Notes</label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none h-24 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="It will not be shown in PDF"
                value={formData.notes}
                onChange={(e) => setField("notes", e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                Attach File(s) to Vendor Credits
              </label>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Upload size={14} /> Upload File <ChevronDown size={14} />
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You can upload a maximum of 5 files, 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
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
            onClick={() => navigate("/admin/accounts/purchases/vendor-credits")}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorCreditForm;