// src/admin/pages/accounts/accountsData.js
// Static demo data for the Accounts module. Replace with API data later.

export const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Income", "Expense"];

export const ACCOUNT_SUBTYPES = {
  Asset: ["Cash", "Bank", "Accounts Receivable", "Other Current Asset", "Fixed Asset"],
  Liability: ["Accounts Payable", "Other Current Liability", "Long Term Liability"],
  Equity: ["Equity"],
  Income: ["Income", "Other Income"],
  Expense: ["Operating Expense", "Cost of Goods Sold", "Other Expense"],
};

export const TAX_RATES = [0, 5, 10, 15];
export const EXPENSE_STATUSES = ["Paid", "Pending", "Overdue"];
export const INCOME_STATUSES = ["Received", "Pending", "Overdue"];

// Assets & expenses are debit-normal; everything else is credit-normal
export const isDebitNormal = (type) => type === "Asset" || type === "Expense";

const A = (code, name, type, subType, balance, description = "", active = true) => ({
  id: `a${code}`, code: String(code), name, type, subType, balance, description, active,
});

// Balanced: total debits = total credits = 401,400
const accounts = [
  A(1000, "Cash on Hand", "Asset", "Cash", 12500, "Physical cash held at the office"),
  A(1005, "Petty Cash (Closed)", "Asset", "Cash", 0, "Closed in 2025", false),
  A(1010, "Bank - Operating", "Asset", "Bank", 124300, "Primary operating bank account"),
  A(1100, "Accounts Receivable", "Asset", "Accounts Receivable", 46800, "Money owed by customers"),
  A(1200, "Prepaid Expenses", "Asset", "Other Current Asset", 4200),
  A(1500, "Office Equipment", "Asset", "Fixed Asset", 28000, "Computers, furniture and fittings"),
  A(2000, "Accounts Payable", "Liability", "Accounts Payable", 21400, "Money owed to vendors"),
  A(2100, "Salaries Payable", "Liability", "Other Current Liability", 15600),
  A(2200, "Tax Payable", "Liability", "Other Current Liability", 6300, "Sales tax collected, not yet remitted"),
  A(2500, "Bank Loan", "Liability", "Long Term Liability", 40000, "5-year business term loan"),
  A(3000, "Owner's Capital", "Equity", "Equity", 70000),
  A(3100, "Retained Earnings", "Equity", "Equity", 18400),
  A(4000, "Sales Revenue", "Income", "Income", 170000, "Product sales"),
  A(4100, "Service Income", "Income", "Income", 56500, "Consulting and support"),
  A(4200, "Other Income", "Income", "Other Income", 3200, "Interest and misc."),
  A(5000, "Salaries & Wages", "Expense", "Operating Expense", 96000),
  A(5100, "Rent Expense", "Expense", "Operating Expense", 36000),
  A(5200, "Utilities", "Expense", "Operating Expense", 9800),
  A(5300, "Office Supplies", "Expense", "Operating Expense", 6400),
  A(5400, "Software Subscriptions", "Expense", "Operating Expense", 11200),
  A(5500, "Marketing & Ads", "Expense", "Operating Expense", 18900),
  A(5600, "Travel & Meals", "Expense", "Operating Expense", 7300),
];

const X = (id, date, vendor, categoryId, paidThroughId, amount, taxRate, status, reference, notes = "") =>
  ({ id: `e${id}`, date, vendor, categoryId, paidThroughId, amount, taxRate, status, reference, notes });

const expenses = [
  X(1, "2026-10-24", "Cloudhost Inc", "a5400", "a1010", 1250, 0, "Paid", "EXP-1048", "Annual hosting renewal"),
  X(2, "2026-10-22", "Prime Realty", "a5100", "a1010", 3000, 0, "Paid", "EXP-1046", "October office rent"),
  X(3, "2026-10-20", "AdWorks Agency", "a5500", "a1010", 2400, 10, "Pending", "EXP-1044", "Q4 campaign"),
  X(4, "2026-10-18", "OfficeMart", "a5300", "a1000", 380, 5, "Paid", "EXP-1043"),
  X(5, "2026-10-15", "Metro Utilities", "a5200", "a1010", 840, 0, "Overdue", "EXP-1041", "Electricity + internet"),
  X(6, "2026-10-12", "SkyJet Travel", "a5600", "a1010", 1120, 5, "Paid", "EXP-1040", "Client visit - Dubai"),
  X(7, "2026-10-09", "Staff Payroll", "a5000", "a1010", 8000, 0, "Pending", "EXP-1038", "October payroll"),
  X(8, "2026-10-05", "Slack Technologies", "a5400", "a1010", 320, 0, "Paid", "EXP-1036"),
  X(9, "2026-09-28", "Google Ads", "a5500", "a1010", 1800, 0, "Paid", "EXP-1031"),
  X(10, "2026-09-25", "Metro Utilities", "a5200", "a1010", 790, 0, "Paid", "EXP-1029"),
  X(11, "2026-09-20", "CityCab Travel", "a5600", "a1000", 145, 0, "Paid", "EXP-1026"),
  X(12, "2026-09-15", "OfficeMart", "a5300", "a1000", 260, 5, "Overdue", "EXP-1022"),
];

const I = (id, date, source, categoryId, depositToId, amount, taxRate, status, reference, notes = "") =>
  ({ id: `i${id}`, date, source, categoryId, depositToId, amount, taxRate, status, reference, notes });

const incomes = [
  I(1, "2026-10-25", "Acme Corp", "a4000", "a1010", 12500, 0, "Received", "INV-2041", "Hardware order"),
  I(2, "2026-10-23", "Globex Ltd", "a4100", "a1010", 6400, 10, "Received", "INV-2040", "Support retainer"),
  I(3, "2026-10-19", "Initech", "a4000", "a1010", 4800, 0, "Pending", "INV-2039"),
  I(4, "2026-10-16", "Umbrella Co", "a4100", "a1010", 3300, 0, "Overdue", "INV-2034", "Reminder sent"),
  I(5, "2026-10-11", "Stark Industries", "a4000", "a1010", 9200, 5, "Received", "INV-2037"),
  I(6, "2026-10-08", "Bank Interest", "a4200", "a1010", 210, 0, "Received", "INT-1010"),
  I(7, "2026-10-03", "Wayne Enterprises", "a4100", "a1010", 5600, 0, "Pending", "INV-2036"),
  I(8, "2026-09-29", "Acme Corp", "a4000", "a1010", 11000, 0, "Received", "INV-2031"),
  I(9, "2026-09-22", "Hooli", "a4000", "a1000", 2150, 0, "Received", "INV-2029", "Cash sale"),
  I(10, "2026-09-14", "Globex Ltd", "a4100", "a1010", 4000, 0, "Overdue", "INV-2025"),
];

const J = (id, ref, date, description, status, lines) => ({ id: `j${id}`, ref, date, description, status, lines });
const jl = (accountId, debit, credit, note = "") => ({ accountId, debit, credit, note });

const journalEntries = [
  J(1, "JE-0001", "2026-10-01", "Monthly rent accrual", "Posted", [jl("a5100", 3000, 0, "October rent"), jl("a2000", 0, 3000)]),
  J(2, "JE-0002", "2026-10-05", "Office equipment purchase", "Posted", [jl("a1500", 6000, 0, "5 laptops"), jl("a1010", 0, 6000)]),
  J(3, "JE-0003", "2026-10-15", "Salary accrual", "Posted", [jl("a5000", 8000, 0), jl("a2100", 0, 8000)]),
  J(4, "JE-0004", "2026-10-20", "Prepaid insurance", "Draft", [jl("a1200", 1200, 0, "12-month policy"), jl("a1010", 0, 1200)]),
  J(5, "JE-0005", "2026-10-26", "Sales tax adjustment", "Draft", [jl("a4000", 450, 0), jl("a2200", 0, 450)]),
];

const L = (n, accountId, date, ref, description, debit, credit) =>
  ({ id: `l${n}`, accountId, date, ref, description, debit, credit });

const ledger = [
  L(1, "a1010", "2026-10-02", "REC-501", "Customer payment - Acme Corp", 11000, 0),
  L(2, "a1010", "2026-10-05", "JE-0002", "Office equipment purchase", 0, 6000),
  L(3, "a1010", "2026-10-05", "EXP-1036", "Slack Technologies", 0, 320),
  L(4, "a1010", "2026-10-11", "REC-507", "Customer payment - Stark Industries", 9660, 0),
  L(5, "a1010", "2026-10-22", "EXP-1046", "Prime Realty - rent", 0, 3000),
  L(6, "a1010", "2026-10-23", "REC-510", "Customer payment - Globex Ltd", 7040, 0),
  L(7, "a1010", "2026-10-24", "EXP-1048", "Cloudhost Inc", 0, 1250),
  L(8, "a1010", "2026-10-25", "REC-511", "Customer payment - Acme Corp", 12500, 0),
  L(9, "a1100", "2026-10-01", "INV-2037", "Invoice - Stark Industries", 9660, 0),
  L(10, "a1100", "2026-10-03", "INV-2036", "Invoice - Wayne Enterprises", 5600, 0),
  L(11, "a1100", "2026-10-10", "INV-2040", "Invoice - Globex Ltd", 7040, 0),
  L(12, "a1100", "2026-10-11", "REC-507", "Payment received - Stark", 0, 9660),
  L(13, "a1100", "2026-10-16", "INV-2034", "Invoice - Umbrella Co", 3300, 0),
  L(14, "a1100", "2026-10-19", "INV-2039", "Invoice - Initech", 4800, 0),
  L(15, "a1100", "2026-10-23", "REC-510", "Payment received - Globex", 0, 7040),
  L(16, "a2000", "2026-10-01", "JE-0001", "Monthly rent accrual", 0, 3000),
  L(17, "a2000", "2026-10-09", "BILL-312", "AdWorks Agency - bill", 0, 2640),
  L(18, "a2000", "2026-10-15", "BILL-318", "Metro Utilities - bill", 0, 840),
  L(19, "a2000", "2026-10-22", "PAY-120", "Prime Realty - payment", 3000, 0),
  L(20, "a4000", "2026-10-01", "INV-2037", "Invoice - Stark Industries", 0, 9200),
  L(21, "a4000", "2026-10-19", "INV-2039", "Invoice - Initech", 0, 4800),
  L(22, "a4000", "2026-10-25", "INV-2041", "Invoice - Acme Corp", 0, 12500),
  L(23, "a5100", "2026-10-01", "JE-0001", "Monthly rent accrual", 3000, 0),
  L(24, "a1000", "2026-10-18", "EXP-1043", "OfficeMart - supplies", 0, 399),
  L(25, "a1000", "2026-10-20", "SAL-090", "Cash sale - Hooli", 2150, 0),
];

export const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const initialAccountsState = {
  accounts,
  expenses,
  incomes,
  journalEntries,
  ledger,
  metrics: {
    // KPI cards are derived from account balances; these drive trend chips/sparklines
    deltas: { receivables: 8.2, payables: -3.1, cash: 12.4, profit: 18.6 },
    spark: {
      receivables: [31, 34, 33, 38, 41, 40, 43, 44, 42, 45, 46, 46.8],
      payables: [26, 25, 27, 24, 25, 23, 24, 22, 23, 22, 21.8, 21.4],
      cash: [78, 82, 80, 86, 91, 95, 99, 104, 108, 113, 118, 136.8],
      profit: [2.4, 3.6, 1.3, 2.2, 3.5, 3.6, 4.3, 4.6, 4.5, 3.5, 4.9, 5.7],
    },
  },
  monthly: {
    income: [17200, 19800, 16400, 18100, 20300, 19000, 21500, 20700, 22400, 19900, 23100, 24600],
    expenses: [14800, 16200, 15100, 15900, 16800, 15400, 17200, 16100, 17900, 16400, 18200, 18900],
  },
  cashTrend: [78000, 82000, 80000, 86000, 91000, 95000, 99000, 104000, 108000, 113000, 118000, 136800],
  bankAccounts: [
    { id: "b1", name: "Operating Account", number: "•••• 4821", balance: 124300, lastSync: "Synced 2 hours ago", uncategorized: 4 },
    { id: "b2", name: "Cash on Hand", number: "Manual", balance: 12500, lastSync: "Updated today", uncategorized: 0 },
  ],
  agingReceivables: {
    buckets: ["Current", "1-15 days", "16-30 days", "31-45 days", "45+ days"],
    rows: [
      { name: "Acme Corp", values: [8000, 4000, 0, 0, 0] },
      { name: "Globex Ltd", values: [6400, 3300, 2100, 0, 0] },
      { name: "Initech", values: [4000, 2500, 1800, 1200, 0] },
      { name: "Umbrella Co", values: [2500, 1500, 1500, 1000, 1800] },
      { name: "Stark Industries", values: [1500, 1000, 1500, 1200, 0] },
    ],
  },
  agingPayables: {
    buckets: ["Current", "1-15 days", "16-30 days", "31-45 days", "45+ days"],
    rows: [
      { name: "Cloudhost Inc", values: [3200, 1500, 0, 0, 0] },
      { name: "Prime Realty", values: [4000, 0, 0, 0, 0] },
      { name: "OfficeMart", values: [1800, 1200, 1100, 0, 0] },
      { name: "AdWorks Agency", values: [1200, 1500, 1200, 1200, 0] },
      { name: "Metro Utilities", values: [1000, 1200, 800, 0, 500] },
    ],
  },
  cashFlowStatement: {
    opening: 63700,
    sections: [
      { title: "Operating activities", rows: [["Net profit", 44100], ["Increase in accounts receivable", -8400], ["Increase in accounts payable", 4600], ["Increase in prepaid expenses", -1200]] },
      { title: "Investing activities", rows: [["Purchase of office equipment", -6000]] },
      { title: "Financing activities", rows: [["Bank loan proceeds", 40000]] },
    ],
  },
};