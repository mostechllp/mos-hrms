import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCustomer, updateCustomer } from "../../../store/slices/accounts/customersSlice";
import { X, Info, HelpCircle, ChevronRight, Upload, Plus } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

const SALUTATIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

const TABS = ["Other Details", "Address", "Contact Persons", "Custom Fields", "Reporting Tags", "Remarks"];

// Helper component to keep labels and '?' icons on the same line
const LabelWithHelp = ({ text, required, className = "" }) => (
  <label className={`flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 font-medium ${className}`}>
    {text}
    {required && <span className="text-red-500">*</span>}
    <HelpCircle size={12} className="text-gray-400 ml-0.5" />
  </label>
);

const CustomerForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const existingCustomer = useSelector((state) => 
    state.customers.customers.find((c) => c.id === id)
  );

  const [activeTab, setActiveTab] = useState("Other Details");
  
  const [formData, setFormData] = useState({
    type: existingCustomer?.type || "Business",
    salutation: existingCustomer?.salutation || "Mr.",
    firstName: existingCustomer?.firstName || "",
    lastName: existingCustomer?.lastName || "",
    companyName: existingCustomer?.companyName || "",
    displayName: existingCustomer?.displayName || "",
    email: existingCustomer?.email || "",
    workPhone: existingCustomer?.workPhone || "",
    mobile: existingCustomer?.mobile || "",
    language: existingCustomer?.language || "English",
    pan: existingCustomer?.pan || "",
    currency: existingCustomer?.currency || "INR- Indian Rupee",
    receivableAccount: existingCustomer?.receivableAccount || "Accounts Receivable",
    openingBalance: existingCustomer?.openingBalance || 0,
    paymentTerms: existingCustomer?.paymentTerms || "Due on Receipt",
    portalAccess: existingCustomer?.portalAccess || false,
    billingAddress: existingCustomer?.billingAddress || {
      attention: "", country: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: ""
    },
    shippingAddress: existingCustomer?.shippingAddress || {
      attention: "", country: "", street1: "", street2: "", city: "", state: "", pinCode: "", phone: "", fax: ""
    },
    contactPersons: existingCustomer?.contactPersons || []
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setAddressField = (type, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) return;

    const finalData = {
      ...formData,
      openingBalance: Number(formData.openingBalance) || 0,
    };

    if (id) {
      dispatch(updateCustomer({ id, ...finalData }));
    } else {
      dispatch(addCustomer(finalData));
    }
    navigate("/admin/accounts/sales/customers");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
          {id ? "Edit Customer" : "New Customer"}
        </h1>
        <button onClick={() => navigate("/admin/accounts/sales/customers")} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X size={20} />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin/dashboard" className="hover:text-blue-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/admin/accounts/sales/customers" className="hover:text-blue-600">Customers</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {id ? `Edit: ${existingCustomer?.displayName}` : "New Customer"}
        </span>
      </div>

      {/* Info Banner */}
      <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Info size={16} />
        <span>Prefill Customer details from the GST portal using the Customer's GSTIN. <a href="#" className="font-semibold underline">Prefill &gt;</a></span>
      </div>

      {/* Form Body - Removed max-widths for full width */}
      <form onSubmit={handleSubmit} className="flex-1 w-full pb-20">
        <div className="py-6 px-8 w-full">
          
          {/* Core Info Grid - Expanding to fill screen */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-8 mb-10 w-full">
            
            {/* Customer Type */}
            <div className="md:col-span-12 flex items-start gap-4">
              <div className="w-40 flex justify-end mt-1">
                <LabelWithHelp text="Customer Type" />
              </div>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={formData.type === "Business"} onChange={() => setField("type", "Business")} className="text-blue-600 focus:ring-blue-500 w-4 h-4" /> Business
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="radio" checked={formData.type === "Individual"} onChange={() => setField("type", "Individual")} className="text-blue-600 focus:ring-blue-500 w-4 h-4" /> Individual
                </label>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="md:col-span-12 flex items-start gap-4">
              <div className="w-40 flex justify-end mt-2.5">
                <LabelWithHelp text="Primary Contact" />
              </div>
              <div className="flex-1 flex flex-wrap gap-4">
                <div className="w-32">
                  <SearchableSelect value={formData.salutation} onChange={(val) => setField("salutation", val)} options={SALUTATIONS} clearable={false} />
                </div>
                <input type="text" placeholder="First Name" className={`${inputCls} flex-1 min-w-[200px]`} value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                <input type="text" placeholder="Last Name" className={`${inputCls} flex-1 min-w-[200px]`} value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
            </div>

            {/* Company Name */}
            <div className="md:col-span-12 flex items-center gap-4">
              <div className="w-40 flex justify-end">
                <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Company Name</label>
              </div>
              <input type="text" className={`${inputCls} flex-1 max-w-3xl`} value={formData.companyName} onChange={(e) => setField("companyName", e.target.value)} />
            </div>

            {/* Display Name */}
            <div className="md:col-span-12 flex items-start gap-4">
              <div className="w-40 flex justify-end mt-2.5">
                <LabelWithHelp text="Display Name" required />
              </div>
              <div className="flex-1 max-w-3xl">
                <SearchableSelect 
                  value={formData.displayName} 
                  onChange={(val) => setField("displayName", val)} 
                  options={[
                    { value: `${formData.firstName} ${formData.lastName}`, label: `${formData.firstName} ${formData.lastName}`.trim() },
                    { value: formData.companyName, label: formData.companyName }
                  ].filter(o => o.value)} 
                  placeholder="Select or type to add" 
                  onAddNew={() => {}} 
                  addNewLabel="Add New"
                />
                {!formData.displayName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><Info size={12}/> Enter the Display Name of your customer.</p>}
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-12 flex items-center gap-4">
              <div className="w-40 flex justify-end">
                <LabelWithHelp text="Email Address" />
              </div>
              <input type="email" className={`${inputCls} flex-1 max-w-3xl`} value={formData.email} onChange={(e) => setField("email", e.target.value)} />
            </div>

            {/* Phone */}
            <div className="md:col-span-12 flex items-center gap-4">
              <div className="w-40 flex justify-end">
                <LabelWithHelp text="Phone" />
              </div>
              <div className="flex gap-4 flex-1 max-w-3xl">
                <div className="flex flex-1">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">+91</span>
                  <input type="text" placeholder="Work Phone" className={`${inputCls} rounded-l-none`} value={formData.workPhone} onChange={(e) => setField("workPhone", e.target.value)} />
                </div>
                <div className="flex flex-1">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">+91</span>
                  <input type="text" placeholder="Mobile" className={`${inputCls} rounded-l-none`} value={formData.mobile} onChange={(e) => setField("mobile", e.target.value)} />
                </div>
              </div>
            </div>

          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-6 overflow-x-auto w-full">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px] w-full">
            
            {/* OTHER DETAILS - Changed to a 3-column grid to fill space */}
            {activeTab === "Other Details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 w-full">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">PAN</label>
                  <input type="text" className={inputCls} value={formData.pan} onChange={(e) => setField("pan", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Currency</label>
                  <select className={inputCls} value={formData.currency} onChange={(e) => setField("currency", e.target.value)}>
                    <option value="INR- Indian Rupee">INR- Indian Rupee</option>
                    <option value="USD- US Dollar">USD- US Dollar</option>
                  </select>
                </div>
                <div>
                  <LabelWithHelp text="Accounts Receivable" className="mb-1" />
                  <select className={inputCls} value={formData.receivableAccount} onChange={(e) => setField("receivableAccount", e.target.value)}>
                    <option value="Accounts Receivable">Accounts Receivable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Opening Balance</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">INR</span>
                    <input type="number" className={`${inputCls} rounded-l-none`} value={formData.openingBalance} onChange={(e) => setField("openingBalance", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Terms</label>
                  <select className={inputCls} value={formData.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)}>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-3 flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={formData.portalAccess} onChange={(e) => setField("portalAccess", e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                  <label className="text-sm text-gray-700 dark:text-gray-300">Allow portal access for this customer</label>
                </div>
              </div>
            )}

            {/* ADDRESS - Spreads out in 2 columns, max width removed */}
            {activeTab === "Address" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 w-full">
                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Attention</label>
                      <input type="text" className={inputCls} value={formData.billingAddress.attention} onChange={(e) => setAddressField("billingAddress", "attention", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Country/Region</label>
                      <select className={inputCls} value={formData.billingAddress.country} onChange={(e) => setAddressField("billingAddress", "country", e.target.value)}>
                        <option value="">Select</option>
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Address</label>
                      <textarea rows="2" placeholder="Street 1" className={`${inputCls} mb-2`} value={formData.billingAddress.street1} onChange={(e) => setAddressField("billingAddress", "street1", e.target.value)} />
                      <textarea rows="2" placeholder="Street 2" className={inputCls} value={formData.billingAddress.street2} onChange={(e) => setAddressField("billingAddress", "street2", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">City</label>
                        <input type="text" className={inputCls} value={formData.billingAddress.city} onChange={(e) => setAddressField("billingAddress", "city", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">State</label>
                        <input type="text" className={inputCls} value={formData.billingAddress.state} onChange={(e) => setAddressField("billingAddress", "state", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pin Code</label>
                      <input type="text" className={inputCls} value={formData.billingAddress.pinCode} onChange={(e) => setAddressField("billingAddress", "pinCode", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                      <input type="text" className={inputCls} value={formData.billingAddress.phone} onChange={(e) => setAddressField("billingAddress", "phone", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Shipping Address</h3>
                    <button type="button" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1" onClick={() => setField("shippingAddress", formData.billingAddress)}>
                      <Upload size={12} className="rotate-180" /> Copy billing address
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Attention</label>
                      <input type="text" className={inputCls} value={formData.shippingAddress.attention} onChange={(e) => setAddressField("shippingAddress", "attention", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Country/Region</label>
                      <select className={inputCls} value={formData.shippingAddress.country} onChange={(e) => setAddressField("shippingAddress", "country", e.target.value)}>
                        <option value="">Select</option>
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Address</label>
                      <textarea rows="2" placeholder="Street 1" className={`${inputCls} mb-2`} value={formData.shippingAddress.street1} onChange={(e) => setAddressField("shippingAddress", "street1", e.target.value)} />
                      <textarea rows="2" placeholder="Street 2" className={inputCls} value={formData.shippingAddress.street2} onChange={(e) => setAddressField("shippingAddress", "street2", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">City</label>
                        <input type="text" className={inputCls} value={formData.shippingAddress.city} onChange={(e) => setAddressField("shippingAddress", "city", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">State</label>
                        <input type="text" className={inputCls} value={formData.shippingAddress.state} onChange={(e) => setAddressField("shippingAddress", "state", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pin Code</label>
                      <input type="text" className={inputCls} value={formData.shippingAddress.pinCode} onChange={(e) => setAddressField("shippingAddress", "pinCode", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT PERSONS */}
            {activeTab === "Contact Persons" && (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-r dark:border-gray-700 w-32">Salutation</th>
                      <th className="px-4 py-3 border-r dark:border-gray-700">First Name</th>
                      <th className="px-4 py-3 border-r dark:border-gray-700">Last Name</th>
                      <th className="px-4 py-3 border-r dark:border-gray-700">Email Address</th>
                      <th className="px-4 py-3 border-r dark:border-gray-700">Work Phone</th>
                      <th className="px-4 py-3">Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.contactPersons.length > 0 ? (
                      formData.contactPersons.map((cp, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700/60">
                          <td className="px-0 py-0 border-r dark:border-gray-700"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.salutation} /></td>
                          <td className="px-0 py-0 border-r dark:border-gray-700"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.firstName} /></td>
                          <td className="px-0 py-0 border-r dark:border-gray-700"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.lastName} /></td>
                          <td className="px-0 py-0 border-r dark:border-gray-700"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.email} /></td>
                          <td className="px-0 py-0 border-r dark:border-gray-700"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.workPhone} /></td>
                          <td className="px-0 py-0"><input type="text" className="w-full h-full p-2 border-none focus:ring-0 bg-transparent text-sm" value={cp.mobile} /></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No contact persons added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button type="button" className="mt-4 text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add Contact Person
                </button>
              </div>
            )}

            {/* CUSTOM FIELDS */}
            {activeTab === "Custom Fields" && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                <p>Start adding custom fields for your Customers and Vendors by going to <i>Settings ➔ Preferences ➔ Customers and Vendors</i>.</p>
                <p>You can also refine the address format of your Customers and Vendors from there.</p>
              </div>
            )}

            {/* REPORTING TAGS */}
            {activeTab === "Reporting Tags" && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                <p>You've not created any Reporting Tags.</p>
                <p>Start creating reporting tags by going to <i>More Settings ➔ Reporting Tags</i></p>
              </div>
            )}

            {/* REMARKS */}
            {activeTab === "Remarks" && (
              <div className="w-full">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Remarks (Internal Notes)</label>
                <textarea rows="4" className={inputCls} placeholder="Add any internal notes about this customer..."></textarea>
              </div>
            )}

          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3 sticky bottom-0 z-10 px-8 mt-auto">
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save
        </Button>
        <Button variant="secondary" onClick={() => navigate("/admin/accounts/sales/customers")} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CustomerForm;