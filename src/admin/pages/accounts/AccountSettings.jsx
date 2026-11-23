import { useMenuVisibility } from "../../../context/MenuVisibilityContext";


// Define the structure of the Accounts menu for the UI (independent of the sidebar config)
const ACCOUNTS_MENU_STRUCTURE = [
  { slug: "accounts-dashboard", label: "Dashboard" },
  { 
    slug: "sales", 
    label: "Revenue",
    children: [
      { slug: "sales-customers", label: "Customers" },
      { slug: "sales-quotes", label: "Quotes" },
      { slug: "sales-orders", label: "Order Forms" },
      { slug: "sales-invoices", label: "Invoices" },
      { slug: "sales-recurring", label: "Subscriptions" },
      { slug: "sales-challans", label: "Delivery Challans" },
      { slug: "sales-payments", label: "Incoming Payments" },
      { slug: "sales-credits", label: "Customer Credits" },
    ]
  },
  { 
    slug: "purchases", 
    label: "Spend",
    children: [
      { slug: "purchases-vendors", label: "Vendors" },
      { slug: "purchases-orders", label: "Purchase Orders" },
      { slug: "purchases-bills", label: "Bills" },
      { slug: "purchases-recurring-bills", label: "Recurring Bills" },
      { slug: "purchases-expenses", label: "Expenses" },
      { slug: "purchases-recurring", label: "Recurring Expenses" },
      { slug: "purchases-payments", label: "Outgoing Payments" },
      { slug: "purchases-credits", label: "Vendor Credits" },
    ]
  },
  { 
    slug: "money", 
    label: "Money",
    children: [
      { slug: "banking", label: "Bank Accounts" },
    ]
  },
  { 
    slug: "operations", 
    label: "Operations",
    children: [
      { slug: "time-tracking", label: "Time & Billables", children: [
        { slug: "time-projects", label: "Projects" },
        { slug: "time-timesheet", label: "Timesheets" },
      ]},
      { slug: "items", label: "Catalogue" },
      { slug: "account-documents", label: "Documents" },
    ]
  },
  { 
    slug: "accountant", 
    label: "Controls",
    children: [
      { slug: "acc-coa", label: "Chart of Accounts" },
      { slug: "acc-journals", label: "Manual Journals" },
      { slug: "acc-currency", label: "Currency Adjustments" },
      { slug: "acc-budgets", label: "Budgets" },
      { slug: "acc-locking", label: "Period Locking" },
      { slug: "acc-bulk", label: "Bulk Reclassify" },
    ]
  },
  { slug: "accounts-reports", label: "Reports" },
];

const AccountsMenuSettings = () => {
  const { isMenuVisible, toggleMenuVisibility } = useMenuVisibility();

  const renderMenuItems = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.slug} className={`ml-${level * 4} mb-2`}>
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
            {item.children && (
              <span className="text-xs text-gray-400">({item.children.length} items)</span>
            )}
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isMenuVisible(item.slug)}
              onChange={() => toggleMenuVisibility(item.slug)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
          </label>
        </div>
        
        {item.children && (
          <div className="mt-2 ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
            {renderMenuItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Accounts Menu Visibility</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Toggle which items appear in the Accounts sidebar menu.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        {renderMenuItems(ACCOUNTS_MENU_STRUCTURE)}
      </div>
    </div>
  );
};

export default AccountsMenuSettings;