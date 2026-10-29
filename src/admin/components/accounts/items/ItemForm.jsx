import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem } from "../../store/slices/accounts/itemsSlice";
import { X, HelpCircle, ChevronRight } from "lucide-react";
import { Button, inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

// Static options for the dropdowns
const UNIT_OPTIONS = [
  { value: "Box", label: "Box" },
  { value: "Hours", label: "Hours" },
  { value: "Pieces", label: "Pieces" },
  { value: "Kg", label: "Kg" },
  { value: "cms", label: "CMS" },
  { value: "dz", label: "DOZ" },
  { value: "ft", label: "FTS" },
  { value: "g", label: "GMS" },
  { value: "km", label: "KME" },
  { value: "lb", label: "LBS" },
  { value: "mg", label: "MGS" },
  { value: "ml", label: "MLT" },
  { value: "m", label: "MTR" },
  { value: "pcs", label: "PCS" },
];

// --- SALES ACCOUNTS ---
const SALES_ACCOUNTS = [
  { value: "h_asset", label: "Other Current Asset", disabled: true, isHeading: true },
  { value: "advance_tax", label: "Advance Tax" },
  { value: "employee_advance", label: "Employee Advance" },
  { value: "prepaid_expenses", label: "Prepaid Expenses" },
  { value: "tds_receivable", label: "TDS Receivable" },
  { value: "h_fixed", label: "Fixed Asset", disabled: true, isHeading: true },
  { value: "furniture_equip", label: "Furniture and Equipment" },
  { value: "h_liability", label: "Other Current Liability", disabled: true, isHeading: true },
  { value: "employee_reimb", label: "Employee Reimbursements" },
  { value: "opening_bal_adj", label: "Opening Balance Adjustments" },
  { value: "tax_payable", label: "Tax Payable" },
  { value: "tds_payable", label: "TDS Payable" },
  { value: "unearned_revenue", label: "Unearned Revenue" },
  { value: "h_income", label: "Income", disabled: true, isHeading: true },
  { value: "discount", label: "Discount" },
  { value: "general_income", label: "General Income" },
  { value: "interest_income", label: "Interest Income" },
  { value: "late_fee_income", label: "Late Fee Income" },
  { value: "other_charges", label: "Other Charges" },
  { value: "Sales", label: "Sales" },
  { value: "shipping_charge", label: "Shipping Charge" },
];

// --- PURCHASE ACCOUNTS ---
const PURCHASE_ACCOUNTS = [
  { value: "h_asset_p", label: "Other Current Asset", disabled: true, isHeading: true },
  { value: "p_advance_tax", label: "Advance Tax" },
  { value: "p_employee_advance", label: "Employee Advance" },
  { value: "p_prepaid_expenses", label: "Prepaid Expenses" },
  { value: "p_tds_receivable", label: "TDS Receivable" },
  { value: "h_fixed_p", label: "Fixed Asset", disabled: true, isHeading: true },
  { value: "p_furniture_equip", label: "Furniture and Equipment" },
  { value: "h_liability_p", label: "Other Current Liability", disabled: true, isHeading: true },
  { value: "p_employee_reimb", label: "Employee Reimbursements" },
  { value: "p_opening_bal_adj", label: "Opening Balance Adjustments" },
  { value: "p_tax_payable", label: "Tax Payable" },
  { value: "p_tds_payable", label: "TDS Payable" },
  { value: "p_unearned_revenue", label: "Unearned Revenue" },
  { value: "h_expense", label: "Expense", disabled: true, isHeading: true },
  { value: "advertising", label: "Advertising And Marketing" },
  { value: "automobile", label: "Automobile Expense" },
  { value: "bad_debt", label: "Bad Debt" },
  { value: "bank_fees", label: "Bank Fees and Charges" },
  { value: "consultant", label: "Consultant Expense" },
  { value: "contract_assets", label: "Contract Assets" },
  { value: "credit_card", label: "Credit Card Charges" },
  { value: "depreciation_amort", label: "Depreciation And Amortisation" },
  { value: "depreciation_exp", label: "Depreciation Expense" },
  { value: "it_internet", label: "IT and Internet Expenses" },
  { value: "janitorial", label: "Janitorial Expense" },
  { value: "lodging", label: "Lodging" },
  { value: "meals", label: "Meals and Entertainment" },
  { value: "merchandise", label: "Merchandise" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "other_expenses", label: "Other Expenses" },
  { value: "postage", label: "Postage" },
  { value: "printing", label: "Printing and Stationery" },
  { value: "purchase_discounts", label: "Purchase Discounts" },
  { value: "raw_materials", label: "Raw Materials And Consumables" },
  { value: "rent_expense", label: "Rent Expense" },
  { value: "repairs", label: "Repairs and Maintenance" },
  { value: "salaries", label: "Salaries and Employee Wages" },
  { value: "telephone", label: "Telephone Expense" },
  { value: "transportation", label: "Transportation Expense" },
  { value: "travel", label: "Travel Expense" },
  { value: "uncategorized", label: "Uncategorized" },
  { value: "h_cogs", label: "Cost Of Goods Sold", disabled: true, isHeading: true },
  { value: "Cost of Goods Sold", label: "Cost of Goods Sold" },
  { value: "job_costing", label: "Job Costing" },
  { value: "labor", label: "Labor" },
  { value: "materials", label: "Materials" },
  { value: "subcontractor", label: "Subcontractor" },
];

const VENDOR_OPTIONS = [
  { value: "vendor1", label: "Acme Corp" },
  { value: "vendor2", label: "Global Tech" },
  { value: "vendor3", label: "Office Supplies Inc." },
];

const ItemForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); 
  
  const existingItem = useSelector((state) => 
    state.items.items.find((item) => item.id === id)
  );

  const [formData, setFormData] = useState({
    name: existingItem?.name || "",
    type: existingItem?.type || "Goods",
    usageUnit: existingItem?.usageUnit || "",
    rate: existingItem?.rate || "",
    description: existingItem?.description || "",
    purchaseRate: existingItem?.purchaseRate || "",
    purchaseDescription: existingItem?.purchaseDescription || "",
    salesAccount: existingItem?.salesAccount || "Sales",
    purchaseAccount: existingItem?.purchaseAccount || "Cost of Goods Sold",
    preferredVendor: existingItem?.preferredVendor || "",
  });

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rate) return;
    
    const finalData = {
      ...formData,
      rate: Number(formData.rate) || 0,
      purchaseRate: Number(formData.purchaseRate) || 0,
    };
    
    if (id) {
      dispatch(updateItem({ id, ...finalData }));
    } else {
      dispatch(addItem(finalData));
    }
    
    navigate("/admin/accounts/items");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
          {id ? "Edit Item" : "New Item"}
        </h1>
        <button
          onClick={() => navigate("/admin/accounts/items")}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
        <ChevronRight size={14} />
        <Link to="/admin/accounts/items" className="hover:text-blue-600 dark:hover:text-blue-400">Items</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {id ? `Edit: ${existingItem?.name || 'Item'}` : "New Item"}
        </span>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 w-full max-w-6xl pb-20"
      >
        <div className="py-6 px-8">
          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
            <div className="md:col-span-8 space-y-5">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-right text-gray-600 dark:text-gray-400 font-medium">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`${inputCls} max-w-md`}
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-right text-gray-600 dark:text-gray-400 font-medium flex items-center justify-end gap-1">
                  Type <HelpCircle size={14} className="text-gray-400" />
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "Goods"}
                      onChange={() => setField("type", "Goods")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Goods
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "Service"}
                      onChange={() => setField("type", "Service")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Service
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-right text-gray-600 dark:text-gray-400 font-medium flex items-center justify-end gap-1">
                  Unit <HelpCircle size={14} className="text-gray-400" />
                </label>
                <div className="max-w-md w-full">
                  <SearchableSelect
                    value={formData.usageUnit}
                    onChange={(val) => setField("usageUnit", val)}
                    options={UNIT_OPTIONS}
                    placeholder="Select or type to add"
                    searchPlaceholder="Search units..."
                    clearable={true}
                    onAddNew={() => console.log("Add new unit clicked")}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          {/* Sales Information */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <h2 className="text-lg font-normal text-gray-800 dark:text-gray-200">
                Sales Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 pl-6">
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Selling Price<span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">
                    INR
                  </span>
                  <input
                    type="number"
                    className={`${inputCls} rounded-l-none`}
                    value={formData.rate}
                    onChange={(e) => setField("rate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Account<span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <SearchableSelect
                    value={formData.salesAccount}
                    onChange={(val) => setField("salesAccount", val)}
                    options={SALES_ACCOUNTS}
                    placeholder="Select account"
                    searchPlaceholder="Search accounts..."
                    clearable={false}
                    onAddNew={() => console.log("Add new account clicked")}
                    addNewLabel="New Account"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Description
                </label>
                <textarea
                  rows="2"
                  className={`${inputCls} max-w-2xl`}
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          {/* Purchase Information */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <h2 className="text-lg font-normal text-gray-800 dark:text-gray-200">
                Purchase Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 pl-6">
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Cost Price<span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm rounded-l-md">
                    INR
                  </span>
                  <input
                    type="number"
                    className={`${inputCls} rounded-l-none`}
                    value={formData.purchaseRate}
                    onChange={(e) => setField("purchaseRate", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Account<span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <SearchableSelect
                    value={formData.purchaseAccount}
                    onChange={(val) => setField("purchaseAccount", val)}
                    options={PURCHASE_ACCOUNTS}
                    placeholder="Select account"
                    searchPlaceholder="Search accounts..."
                    clearable={false}
                    onAddNew={() => console.log("Add new account clicked")}
                    addNewLabel="New Account"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Description
                </label>
                <textarea
                  rows="2"
                  className={`${inputCls} max-w-2xl`}
                  value={formData.purchaseDescription}
                  onChange={(e) => setField("purchaseDescription", e.target.value)}
                ></textarea>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-32 text-sm text-right text-gray-600 dark:text-gray-400 font-medium mt-2">
                  Preferred Vendor
                </label>
                <div className="flex-1">
                  <SearchableSelect
                    value={formData.preferredVendor}
                    onChange={(val) => setField("preferredVendor", val)}
                    options={VENDOR_OPTIONS}
                    placeholder="Select vendor"
                    searchPlaceholder="Search vendors..."
                    clearable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3 sticky bottom-0 z-10 px-8 mt-auto">
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/accounts/items")}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ItemForm;