// src/redux/slices/accounts/accountsSlice.js  (move wherever your other slices live)
import { createSlice } from "@reduxjs/toolkit";
import { initialAccountsState, isDebitNormal } from "../../../pages/accounts/accountsData"; // adjust path

// Posting a journal moves account balances and writes ledger rows
const postLines = (state, je) => {
  je.lines.forEach((line, i) => {
    const acc = state.accounts.find((a) => a.id === line.accountId);
    if (!acc) return;
    const net = (Number(line.debit) || 0) - (Number(line.credit) || 0);
    acc.balance += isDebitNormal(acc.type) ? net : -net;
    state.ledger.push({
      id: `l_${je.id}_${i}`,
      accountId: line.accountId,
      date: je.date,
      ref: je.ref,
      description: line.note || je.description,
      debit: Number(line.debit) || 0,
      credit: Number(line.credit) || 0,
    });
  });
};

const upsert = (list, item) => {
  const i = list.findIndex((x) => x.id === item.id);
  if (i > -1) list[i] = { ...list[i], ...item };
  else list.unshift(item);
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState: initialAccountsState,
  reducers: {
    saveAccount: (s, { payload }) => {
      const i = s.accounts.findIndex((a) => a.id === payload.id);
      if (i > -1) s.accounts[i] = { ...s.accounts[i], ...payload };
      else s.accounts.push(payload);
      s.accounts.sort((a, b) => a.code.localeCompare(b.code));
    },
    deleteAccount: (s, { payload }) => {
      s.accounts = s.accounts.filter((a) => a.id !== payload);
    },

    saveExpense: (s, { payload }) => upsert(s.expenses, payload),
    deleteExpenses: (s, { payload }) => {
      s.expenses = s.expenses.filter((e) => !payload.includes(e.id));
    },

    saveIncome: (s, { payload }) => upsert(s.incomes, payload),
    deleteIncomes: (s, { payload }) => {
      s.incomes = s.incomes.filter((e) => !payload.includes(e.id));
    },

    saveJournal: (s, { payload }) => {
      const prev = s.journalEntries.find((j) => j.id === payload.id);
      upsert(s.journalEntries, payload);
      if (payload.status === "Posted" && (!prev || prev.status !== "Posted")) postLines(s, payload);
    },
    postJournal: (s, { payload: id }) => {
      const je = s.journalEntries.find((j) => j.id === id);
      if (je && je.status === "Draft") {
        je.status = "Posted";
        postLines(s, je);
      }
    },
    deleteJournal: (s, { payload: id }) => {
      s.journalEntries = s.journalEntries.filter((j) => !(j.id === id && j.status === "Draft"));
    },
  },
});

export const {
  saveAccount, deleteAccount,
  saveExpense, deleteExpenses,
  saveIncome, deleteIncomes,
  saveJournal, postJournal, deleteJournal,
} = accountsSlice.actions;

export default accountsSlice.reducer;