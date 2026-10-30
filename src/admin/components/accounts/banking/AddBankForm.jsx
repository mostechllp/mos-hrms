import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addBankAccount } from "../../../store/slices/accounts/bankingSlice";
import { X, Info } from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white max-w-md";

const AddBankForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.banking.loading);

  const [formData, setFormData] = useState({
    accountType: "Bank",
    accountName: "",
    accountCode: "",
    currency: "INR",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    users: "",
    description: "",
    makePrimary: false,
  });

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountName.trim()) return;

    try {
      await dispatch(addBankAccount(formData)).unwrap();
      navigate("/admin/accounts/banking");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
        <h1 className="text-xl font-medium text-gray-800">Add Bank or Credit Card</h1>
        <button onClick={() => navigate("/admin/accounts/banking")} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Account Type */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-red-500 font-medium w-40 shrink-0 pt-1">Select Account Type*</label>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="radio" value="Bank" checked={formData.accountType === "Bank"} onChange={() => setField("accountType", "Bank")} className="text-blue-600 focus:ring-blue-500" />
                Bank
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="radio" value="Credit Card" checked={formData.accountType === "Credit Card"} onChange={() => setField("accountType", "Credit Card")} className="text-blue-600 focus:ring-blue-500" />
                Credit Card
              </label>
            </div>
          </div>

          {/* Account Name */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-red-500 font-medium w-40 shrink-0 pt-1">Account Name*</label>
            <input type="text" className={inputCls} value={formData.accountName} onChange={(e) => setField("accountName", e.target.value)} />
          </div>

          {/* Account Code */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">Account Code</label>
            <input type="text" className={inputCls} value={formData.accountCode} onChange={(e) => setField("accountCode", e.target.value)} />
          </div>

          {/* Currency */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-red-500 font-medium w-40 shrink-0 pt-1">Currency*</label>
            <select className={inputCls} value={formData.currency} onChange={(e) => setField("currency", e.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Account Number */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">Account Number</label>
            <input type="text" className={inputCls} value={formData.accountNumber} onChange={(e) => setField("accountNumber", e.target.value)} />
          </div>

          {/* Bank Name */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">Bank Name</label>
            <input type="text" className={inputCls} value={formData.bankName} onChange={(e) => setField("bankName", e.target.value)} />
          </div>

          {/* IFSC */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">IFSC</label>
            <input type="text" className={inputCls} value={formData.ifsc} onChange={(e) => setField("ifsc", e.target.value)} />
          </div>

          {/* Users */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">Users</label>
            <div className="w-full max-w-md">
              <select className={inputCls} value={formData.users} onChange={(e) => setField("users", e.target.value)}>
                <option value="">Select Users</option>
                <option value="Fidha">Fidha Fathima</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Note: Only users associated with this bank can access this bank account.</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-4">
            <label className="text-sm text-gray-700 w-40 shrink-0 pt-1">Description</label>
            <textarea 
              className={`${inputCls} resize-none h-24`} 
              placeholder="Max. 500 characters" 
              value={formData.description} 
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          {/* Make Primary */}
          <div className="flex items-start gap-4">
            <div className="w-40 shrink-0"></div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={formData.makePrimary} onChange={(e) => setField("makePrimary", e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Make this primary
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center gap-3 pt-6 border-t border-gray-100">
            <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
               {isLoading ? "Saving..." : "Save"}
            </button>
            <button type="button" disabled={isLoading} onClick={() => navigate("/admin/accounts/banking")} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
               Cancel
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddBankForm;