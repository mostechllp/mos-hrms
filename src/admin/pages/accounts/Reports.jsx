// src/admin/pages/accounts/tabs/ReportsTab.jsx
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FileText,
  ArrowRight,
  Download,
  Star,
  Printer,
  TrendingUp,
  BarChart3,
  Wallet,
  Receipt,
  Clock,
  Calculator,
  Hourglass,
  Scale,
  BookOpen,
} from "lucide-react";
import { isDebitNormal } from "./accountsData";
import {
  Card,
  Button,
  Modal,
  SearchBox,
  SelectSm,
  Th,
  money,
  downloadCSV,
} from "../../components/accounts/ui";

// 👇 Each report now carries a Lucide icon component
const REPORTS = [
  {
    key: "pl",
    cat: "Business overview",
    name: "Profit & Loss",
    description: "Income and expenses over a period",
    Icon: TrendingUp,
  },
  {
    key: "bs",
    cat: "Business overview",
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity snapshot",
    Icon: BarChart3,
  },
  {
    key: "cf",
    cat: "Business overview",
    name: "Cash Flow Statement",
    description: "Inflows and outflows of cash",
    Icon: Wallet,
  },
  {
    key: "ic",
    cat: "Sales",
    name: "Income by Source",
    description: "Revenue grouped by customer or source",
    Icon: Receipt,
  },
  {
    key: "ar",
    cat: "Sales",
    name: "A/R Aging Summary",
    description: "Receivables grouped by age",
    Icon: Clock,
  },
  {
    key: "ec",
    cat: "Purchases",
    name: "Expenses by Category",
    description: "Where your money is going",
    Icon: Calculator,
  },
  {
    key: "ap",
    cat: "Purchases",
    name: "A/P Aging Summary",
    description: "Payables grouped by age",
    Icon: Hourglass,
  },
  {
    key: "tb",
    cat: "Accountant",
    name: "Trial Balance",
    description: "All account balances — debits vs credits",
    Icon: Scale,
  },
  {
    key: "gl",
    cat: "Accountant",
    name: "General Ledger Summary",
    description: "Debits and credits per account",
    Icon: BookOpen,
  },
];

const CATS = ["All", "Favorites", ...new Set(REPORTS.map((r) => r.cat))];

/* ---- report builders: return { head, rows:[{k,c}] } ---- */
const R = (c) => ({ k: "row", c });
const H = (label) => ({ k: "head", c: [label] });
const T = (c) => ({ k: "total", c });

const build = (key, s) => {
  const sum = (l) => l.reduce((a, x) => a + x.balance, 0);
  const of = (t) => s.accounts.filter((a) => a.type === t && a.balance !== 0);
  const income = sum(of("Income")),
    expense = sum(of("Expense")),
    profit = income - expense;

  switch (key) {
    case "pl":
      return {
        head: ["Account", "Amount"],
        rows: [
          H("Income"),
          ...of("Income").map((a) => R([a.name, a.balance])),
          T(["Total income", income]),
          H("Expenses"),
          ...of("Expense").map((a) => R([a.name, a.balance])),
          T(["Total expenses", expense]),
          T(["Net profit", profit]),
        ],
      };
    case "bs":
      return {
        head: ["Account", "Amount"],
        rows: [
          H("Assets"),
          ...of("Asset").map((a) => R([a.name, a.balance])),
          T(["Total assets", sum(of("Asset"))]),
          H("Liabilities"),
          ...of("Liability").map((a) => R([a.name, a.balance])),
          T(["Total liabilities", sum(of("Liability"))]),
          H("Equity"),
          ...of("Equity").map((a) => R([a.name, a.balance])),
          R(["Current year earnings", profit]),
          T(["Total equity", sum(of("Equity")) + profit]),
          T([
            "Liabilities + equity",
            sum(of("Liability")) + sum(of("Equity")) + profit,
          ]),
        ],
      };
    case "cf": {
      const cf = s.cashFlowStatement;
      let net = 0;
      const rows = [];
      cf.sections.forEach((sec) => {
        const t = sec.rows.reduce((a, r) => a + r[1], 0);
        net += t;
        rows.push(
          H(sec.title),
          ...sec.rows.map((r) => R(r)),
          T([`Net cash from ${sec.title.split(" ")[0].toLowerCase()}`, t])
        );
      });
      rows.push(
        T(["Net change in cash", net]),
        R(["Opening cash balance", cf.opening]),
        T(["Closing cash balance", cf.opening + net])
      );
      return { head: ["Description", "Amount"], rows };
    }
    case "tb":
      return {
        head: ["Account", "Debit", "Credit"],
        rows: [
          ...s.accounts
            .filter((a) => a.balance !== 0)
            .map((a) =>
              R([
                a.name,
                isDebitNormal(a.type) ? a.balance : "—",
                isDebitNormal(a.type) ? "—" : a.balance,
              ])
            ),
          T([
            "Total",
            sum(s.accounts.filter((a) => isDebitNormal(a.type))),
            sum(s.accounts.filter((a) => !isDebitNormal(a.type))),
          ]),
        ],
      };
    case "gl": {
      const rows = s.accounts
        .map((a) => {
          const l = s.ledger.filter((x) => x.accountId === a.id);
          return (
            l.length &&
            R([
              a.name,
              l.reduce((t, x) => t + x.debit, 0),
              l.reduce((t, x) => t + x.credit, 0),
              `${l.length}`,
            ])
          );
        })
        .filter(Boolean);
      return { head: ["Account", "Debits", "Credits", "Entries"], rows };
    }
    case "ar":
    case "ap": {
      const ag = key === "ar" ? s.agingReceivables : s.agingPayables;
      const cols = ag.buckets.map((_, i) =>
        ag.rows.reduce((t, r) => t + r.values[i], 0)
      );
      return {
        head: [
          key === "ar" ? "Customer" : "Vendor",
          ...ag.buckets,
          "Total",
        ],
        rows: [
          ...ag.rows.map((r) =>
            R([r.name, ...r.values, r.values.reduce((a, b) => a + b, 0)])
          ),
          T(["Total", ...cols, cols.reduce((a, b) => a + b, 0)]),
        ],
      };
    }
    case "ec": {
      const list = of("Expense").sort((a, b) => b.balance - a.balance);
      return {
        head: ["Category", "Amount", "% of total"],
        rows: [
          ...list.map((a) =>
            R([
              a.name,
              a.balance,
              `${((a.balance / expense) * 100).toFixed(1)}%`,
            ])
          ),
          T(["Total", expense, "100%"]),
        ],
      };
    }
    case "ic": {
      const by = {};
      s.incomes.forEach(
        (i) => (by[i.source] = (by[i.source] || 0) + i.amount * (1 + i.taxRate / 100))
      );
      const list = Object.entries(by).sort((a, b) => b[1] - a[1]);
      return {
        head: ["Source", "Invoiced"],
        rows: [
          ...list.map(([n, v]) => R([n, v])),
          T(["Total", list.reduce((t, [, v]) => t + v, 0)]),
        ],
      };
    }
    default:
      return { head: [], rows: [] };
  }
};

const cell = (v) => (typeof v === "number" ? money(v, 2) : v);

const ReportModal = ({ report, onClose }) => {
  const state = useSelector((s) => s.accounts);
  const [period, setPeriod] = useState("This fiscal year");
  const data = useMemo(
    () => (report ? build(report.key, state) : null),
    [report, state]
  );
  if (!report) return null;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={report.name}
      subtitle={`${period} · Demo data`}
      footer={
        <>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCSV(`${report.name}.csv`, [
                data.head,
                ...data.rows.map((r) => (r.k === "head" ? [r.c[0]] : r.c)),
              ])
            }
          >
            <Download size={14} /> Download CSV
          </Button>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="mb-4">
        <SelectSm value={period} onChange={(e) => setPeriod(e.target.value)}>
          {["This month", "This quarter", "This fiscal year", "Last 12 months"].map(
            (p) => (
              <option key={p}>{p}</option>
            )
          )}
        </SelectSm>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {data.head.map((h, i) => (
                <Th key={h} right={i > 0}>
                  {h}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) =>
              r.k === "head" ? (
                <tr key={i}>
                  <td
                    colSpan={data.head.length}
                    className="pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                  >
                    {r.c[0]}
                  </td>
                </tr>
              ) : (
                <tr
                  key={i}
                  className={
                    r.k === "total"
                      ? "border-t border-gray-200 dark:border-gray-700"
                      : "border-b border-gray-100 dark:border-gray-700/50"
                  }
                >
                  {r.c.map((v, j) => (
                    <td
                      key={j}
                      className={`py-2 text-sm ${j > 0 ? "text-right" : ""} ${
                        r.k === "total"
                          ? "font-bold text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

const ReportsTab = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [favs, setFavs] = useState(["pl", "bs"]);
  const [active, setActive] = useState(null);

  const list = REPORTS.filter((r) =>
    cat === "All"
      ? true
      : cat === "Favorites"
      ? favs.includes(r.key)
      : r.cat === cat
  ).filter((r) =>
    `${r.name} ${r.description}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Reports
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Generate and download financial reports
          </p>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search reports…" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              cat === c
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((r) => {
          const Icon = r.Icon;
          return (
            <div
              key={r.key}
              onClick={() => setActive(r)}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                {/* 👇 Lucide icon replacing the emoji */}
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Icon size={18} />
                </div>
                <div className="flex">
                  <button
                    title="Favorite"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFavs((f) =>
                        f.includes(r.key)
                          ? f.filter((k) => k !== r.key)
                          : [...f, r.key]
                      );
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      favs.includes(r.key)
                        ? "text-amber-500"
                        : "text-gray-400 hover:text-amber-500"
                    }`}
                  >
                    <Star
                      size={14}
                      fill={favs.includes(r.key) ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    title="Open to download"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(r);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {r.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {r.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{r.cat}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  Generate <ArrowRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-10">
          No reports match your search.
        </p>
      )}

      <div className="mt-6 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-center">
        <FileText className="mx-auto text-gray-400 mb-2" size={20} />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          More report templates coming soon
        </p>
      </div>

      <ReportModal report={active} onClose={() => setActive(null)} />
    </div>
  );
};

export default ReportsTab;