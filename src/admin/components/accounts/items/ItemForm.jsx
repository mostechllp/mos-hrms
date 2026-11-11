import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem } from "../../../store/slices/accounts/itemsSlice";
import { X, HelpCircle, ChevronRight } from "lucide-react";
import { inputCls } from "../ui";
import SearchableSelect from "../../../../components/common/SearchableSelect";

/* ---------- options (unchanged) ---------- */
const UNIT_OPTIONS = [
  { value: "Box", label: "Box" }, { value: "Hours", label: "Hours" },
  { value: "Pieces", label: "Pieces" }, { value: "Kg", label: "Kg" },
  { value: "cms", label: "CMS" }, { value: "dz", label: "DOZ" },
  { value: "ft", label: "FTS" }, { value: "g", label: "GMS" },
  { value: "km", label: "KME" }, { value: "lb", label: "LBS" },
  { value: "mg", label: "MGS" }, { value: "ml", label: "MLT" },
  { value: "m", label: "MTR" }, { value: "pcs", label: "PCS" },
];

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

/* ---------- primitives ---------- */

const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {hint && <HelpCircle size={12} className="text-slate-400 ml-0.5" />}
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

const CurrencyInput = ({ value, onChange, required }) => (
  <div className="flex">
    <span className="inline-flex items-center px-3 text-[12px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg">
      INR
    </span>
    <input
      type="number"
      value={value}
      onChange={onChange}
      required={required}
      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition tabular-nums"
    />
  </div>
);

/* ---------- page ---------- */

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

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.rate) return;

    const finalData = {
      ...formData,
      rate: Number(formData.rate) || 0,
      purchaseRate: Number(formData.purchaseRate) || 0,
    };

    if (id) dispatch(updateItem({ id, ...finalData }));
    else dispatch(addItem(finalData));

    navigate("/admin/accounts/items");
  };

  const title = id ? "Edit item" : "New item";

  return (
    /* FULL WIDTH — no max-w container */
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ---- Header ---- */}
        <header className="pt-8 pb-6 flex items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
              <Link to="/admin/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <Link to="/admin/accounts/items" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Items</Link>
              <ChevronRight size={11} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {id ? existingItem?.name || "Edit" : "New"}
              </span>
            </nav>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              {title}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {id ? "Update pricing, accounts, and vendor defaults" : "Add a good or service you buy or sell"}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/accounts/items")}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic Information */}
          <Surface title="Basic information" description="Name, type, and unit of measure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Name" required className="md:col-span-2">
                <input
                  type="text"
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Type" required>
                <div className="flex items-center gap-5 h-9">
                  {["Goods", "Service"].map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.type === t}
                        onChange={() => setField("type", t)}
                        className="text-slate-900 focus:ring-slate-400 border-slate-300"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Usage unit" hint>
                <SearchableSelect
                  value={formData.usageUnit}
                  onChange={(val) => setField("usageUnit", val)}
                  options={UNIT_OPTIONS}
                  placeholder="Select or type to add"
                  searchPlaceholder="Search units..."
                  clearable
                  onAddNew={() => console.log("Add new unit clicked")}
                />
              </Field>
            </div>
          </Surface>

          {/* Sales Information */}
          <Surface title="Sales information" description="How this item is priced and posted when you sell it">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Selling price" required>
                <CurrencyInput
                  value={formData.rate}
                  onChange={(e) => setField("rate", e.target.value)}
                  required
                />
              </Field>

              <Field label="Sales account" required>
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
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Optional notes shown on invoices"
                />
              </Field>
            </div>
          </Surface>

          {/* Purchase Information */}
          <Surface title="Purchase information" description="Cost, expense account, and preferred vendor">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Cost price" required>
                <CurrencyInput
                  value={formData.purchaseRate}
                  onChange={(e) => setField("purchaseRate", e.target.value)}
                />
              </Field>

              <Field label="Purchase account" required>
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
              </Field>

              <Field label="Preferred vendor" className="md:col-span-2">
                <SearchableSelect
                  value={formData.preferredVendor}
                  onChange={(val) => setField("preferredVendor", val)}
                  options={VENDOR_OPTIONS}
                  placeholder="Select vendor"
                  searchPlaceholder="Search vendors..."
                  clearable
                />
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={formData.purchaseDescription}
                  onChange={(e) => setField("purchaseDescription", e.target.value)}
                  placeholder="Optional notes shown on bills"
                />
              </Field>
            </div>
          </Surface>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/95 dark:via-slate-950/95 to-transparent">
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/items")}
                className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {id ? "Save changes" : "Create item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;