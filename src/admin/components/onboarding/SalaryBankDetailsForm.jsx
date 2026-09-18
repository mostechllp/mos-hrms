import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import {
  FiChevronRight,
  FiChevronLeft,
  FiDollarSign,
  FiCreditCard,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiGlobe,
} from "react-icons/fi";
import {
  setStep,
  updateEmployeeDetails,
  fetchSalary,
  createSalary,
  updateSalaryApi,
  fetchBank,
  createBank,
  updateBankApi,
  fetchOnboardingProgress, // <── ADD
} from "../../store/slices/onboardingSlice";
import { showToast } from "../../components/common/Toast";

const SalaryBankDetailsForm = () => {
  const dispatch = useDispatch();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");

  const onboardingState = useSelector((state) => state.onboarding) || {};
  const {
    employeeDetails = {},
    salaryExists = false,
    salarySaving = false,
    bankExists = false,
    bankSaving = false,
  } = onboardingState;

  // ── Resolve the user id ──
  const storedUserId = (() => {
    try {
      return localStorage.getItem("onboarding_user_id");
    } catch (_) {
      return null;
    }
  })();

  const resolvedUserId =
    routeId ||
    queryId ||
    employeeDetails?.userId ||
    storedUserId ||
    null;

  // ── Local UI state ──
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [currency, setCurrency] = useState("INR");
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [newComponentName, setNewComponentName] = useState("");
  const [newComponentPrice, setNewComponentPrice] = useState("");
  const [isSalarySaved, setIsSalarySaved] = useState(false);

  const [bankCountry, setBankCountry] = useState("India");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankSwift, setBankSwift] = useState("");
  const [isBankSaved, setIsBankSaved] = useState(false);

  const [paymentCycle, setPaymentCycle] = useState("Monthly");
  const [formErrors, setFormErrors] = useState({});

  const currenciesList = [
    { code: "AED", name: "United Arab Emirates Dirham (AED)" },
    { code: "INR", name: "Indian Rupee (INR)" },
    { code: "USD", name: "United States Dollar (USD)" },
    { code: "EUR", name: "Euro (EUR)" },
    { code: "GBP", name: "British Pound (GBP)" },
  ];

  useEffect(() => {
    if (!resolvedUserId) return;
    dispatch(fetchSalary(resolvedUserId));
    dispatch(fetchBank(resolvedUserId));
  }, [dispatch, resolvedUserId]);

  useEffect(() => {
    const details = employeeDetails || {};
    if (!details) return;

    if (details.currency) setCurrency(details.currency);
    if (details.paymentCycle) setPaymentCycle(details.paymentCycle);
    if (Array.isArray(details.salaryComponents) && details.salaryComponents.length) {
      setSalaryComponents(details.salaryComponents);
      setIsSalarySaved(true);
    }

    if (details.bankCountry) setBankCountry(details.bankCountry);
    if (details.bankName) setBankName(details.bankName);
    if (details.accountNumber) setBankAccountNumber(details.accountNumber);
    if (details.bankIfsc) setBankIfsc(details.bankIfsc);
    if (details.bankBranch) setBankBranch(details.bankBranch);

    if (details.bankIban) {
      const raw = String(details.bankIban).replace(/\s/g, "");
      let formatted = "";
      for (let i = 0; i < raw.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += raw[i];
      }
      setBankIban(formatted);
    }
    if (details.bankSwift) setBankSwift(details.bankSwift);

    if (details.bankName && details.accountNumber && details.bankIfsc) {
      setIsBankSaved(true);
    }
  }, [employeeDetails]);

  const computeAggregateSalary = () => {
    let basicSalary = 0;
    let otherAllowance = 0;

    const basicComponent = salaryComponents.find((comp) =>
      comp.name.toLowerCase().includes("basic"),
    );

    if (basicComponent) {
      basicSalary = basicComponent.price;
      otherAllowance = salaryComponents
        .filter((comp) => comp.id !== basicComponent.id)
        .reduce((sum, comp) => sum + comp.price, 0);
    } else if (salaryComponents.length > 0) {
      basicSalary = salaryComponents[0].price;
      otherAllowance = salaryComponents
        .slice(1)
        .reduce((sum, comp) => sum + comp.price, 0);
    }

    const totalMonthlySalary = salaryComponents.reduce(
      (sum, comp) => sum + comp.price,
      0,
    );

    return {
      basicSalary: String(basicSalary),
      otherAllowance: String(otherAllowance),
      totalMonthlySalary,
    };
  };

  const watchTotalSalary = useMemo(
    () => salaryComponents.reduce((sum, comp) => sum + comp.price, 0),
    [salaryComponents],
  );

  const handleAddSalaryComponent = () => {
    if (!newComponentName.trim()) {
      showToast("Component name cannot be empty", "error");
      return;
    }
    const priceNum = parseFloat(newComponentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Price must be a number greater than 0", "error");
      return;
    }
    if (
      salaryComponents.some(
        (c) => c.name.toLowerCase() === newComponentName.trim().toLowerCase(),
      )
    ) {
      showToast(`Component "${newComponentName.trim()}" already exists!`, "error");
      return;
    }

    setSalaryComponents((prev) => [
      ...prev,
      { id: Date.now(), name: newComponentName.trim(), price: priceNum },
    ]);
    setNewComponentName("");
    setNewComponentPrice("");
    showToast("Component added successfully!", "success");
  };

  const handleDeleteSalaryComponent = (id) => {
    setSalaryComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveSalaryStructure = async () => {
    if (salaryComponents.length === 0) {
      showToast("Please add at least one salary component before saving", "error");
      return;
    }
    if (!resolvedUserId) {
      showToast("Missing user id — save employee details first", "error");
      return;
    }

    const aggregated = computeAggregateSalary();
    const payload = {
      currency,
      paymentCycle,
      salaryComponents,
      ...aggregated,
    };

    try {
      if (salaryExists) {
        await dispatch(
          updateSalaryApi({ userId: resolvedUserId, data: payload }),
        ).unwrap();
      } else {
        await dispatch(
          createSalary({ userId: resolvedUserId, data: payload }),
        ).unwrap();
      }

      setIsSalarySaved(true);

      // ── Refresh onboarding progress ──
      dispatch(fetchOnboardingProgress(resolvedUserId));

      showToast("Salary structure saved!", "success");
    } catch (err) {
      showToast(err || "Failed to save salary", "error");
    }
  };

  const handleBankNameChange = (e) => {
    const val = e.target.value;
    setBankName(val);
    if (!val.trim()) {
      setFormErrors((prev) => ({ ...prev, bankName: "Bank name is required" }));
    } else if (val.trim().length < 2) {
      setFormErrors((prev) => ({
        ...prev,
        bankName: "Bank name must be at least 2 characters",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, bankName: "" }));
    }
  };

  const handleAccountNumberChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, "");
    setBankAccountNumber(val);
    const cleanVal = val.replace(/[\s-]/g, "");
    if (!val.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        accountNumber: "Account number is required",
      }));
    } else if (cleanVal.length < 9 || cleanVal.length > 18) {
      setFormErrors((prev) => ({
        ...prev,
        accountNumber: "Indian bank account numbers must be 9 to 18 digits",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, accountNumber: "" }));
    }
  };

  const handleIfscChange = (e) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 11);
    setBankIfsc(val);
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!val) {
      setFormErrors((prev) => ({ ...prev, ifsc: "IFSC Code is required" }));
    } else if (val.length < 11) {
      setFormErrors((prev) => ({
        ...prev,
        ifsc: "IFSC Code must be exactly 11 characters",
      }));
    } else if (!ifscRegex.test(val)) {
      setFormErrors((prev) => ({
        ...prev,
        ifsc: "Format must be: 4 letters, 0, then 6 alphanumeric (e.g. HDFC0000123)",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, ifsc: "" }));
    }
  };

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setBankBranch(val);
    if (!val.trim()) {
      setFormErrors((prev) => ({ ...prev, branch: "Branch name is required" }));
    } else {
      setFormErrors((prev) => ({ ...prev, branch: "" }));
    }
  };

  const handleIbanChange = (e) => {
    let val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 23);
    let formatted = "";
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += val[i];
    }
    setBankIban(formatted);
    if (!val) {
      setFormErrors((prev) => ({ ...prev, iban: "IBAN is required" }));
    } else if (!val.startsWith("AE")) {
      setFormErrors((prev) => ({
        ...prev,
        iban: "UAE IBAN must start with 'AE'",
      }));
    } else if (val.length < 23) {
      setFormErrors((prev) => ({
        ...prev,
        iban: `IBAN must be exactly 23 characters (current: ${val.length})`,
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, iban: "" }));
    }
  };

  const handleSwiftChange = (e) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 11);
    setBankSwift(val);
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!val) {
      setFormErrors((prev) => ({ ...prev, swift: "SWIFT/BIC Code is required" }));
    } else if (val.length !== 8 && val.length !== 11) {
      setFormErrors((prev) => ({
        ...prev,
        swift: "SWIFT/BIC Code must be 8 or 11 characters",
      }));
    } else if (!swiftRegex.test(val)) {
      setFormErrors((prev) => ({ ...prev, swift: "Invalid SWIFT/BIC format" }));
    } else {
      setFormErrors((prev) => ({ ...prev, swift: "" }));
    }
  };

  const handleSaveBankDetails = async () => {
    const errors = {};
    if (!bankName.trim()) errors.bankName = "Bank name is required";
    if (!bankAccountNumber.trim())
      errors.accountNumber = "Account number is required";
    if (!bankIfsc.trim()) {
      errors.ifsc = "IFSC Code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc)) {
      errors.ifsc = "Invalid IFSC Code format";
    }
    if (!bankBranch.trim()) errors.branch = "Branch name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please correct the errors in the bank details form", "error");
      return;
    }

    if (!resolvedUserId) {
      showToast("Missing user id — save employee details first", "error");
      return;
    }

    const cleanIban = bankIban.replace(/\s/g, "");
    const payload = {
      bankCountry,
      bankName,
      accountNumber: bankAccountNumber,
      bankIfsc,
      bankBranch,
      bankIban: cleanIban,
      bankSwift,
    };

    try {
      if (bankExists) {
        await dispatch(
          updateBankApi({ userId: resolvedUserId, data: payload }),
        ).unwrap();
      } else {
        await dispatch(
          createBank({ userId: resolvedUserId, data: payload }),
        ).unwrap();
      }

      setIsBankSaved(true);

      // ── Refresh onboarding progress ──
      dispatch(fetchOnboardingProgress(resolvedUserId));

      showToast("Bank details saved successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to save bank details", "error");
    }
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    const computedValues = computeAggregateSalary();
    const cleanIban = bankIban.replace(/\s/g, "");

    const formValues = {
      ...computedValues,
      paymentCycle,
      currency,
      salaryComponents,
      isSalarySaved,
      bankCountry,
      bankName,
      accountNumber: bankAccountNumber,
      bankIfsc,
      bankBranch,
      bankIban: cleanIban,
      bankSwift,
      isBankSaved,
    };

    const draftState = {
      ...onboardingState,
      employeeDetails: { ...onboardingState.employeeDetails, ...formValues },
    };

    try {
      localStorage.setItem("onboarding-draft", JSON.stringify(draftState));
      showToast("Draft saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save draft", "error");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isSalarySaved) {
      showToast("Please save your Salary Structure before continuing", "warning");
      return;
    }
    if (!isBankSaved) {
      showToast("Please save your Bank Details before continuing", "warning");
      return;
    }

    const computedValues = computeAggregateSalary();
    const cleanIban = bankIban.replace(/\s/g, "");

    const finalPayload = {
      ...computedValues,
      paymentCycle,
      currency,
      salaryComponents,
      isSalarySaved,
      bankCountry,
      bankName,
      accountNumber: bankAccountNumber,
      bankIfsc,
      bankBranch,
      bankIban: cleanIban,
      bankSwift,
      isBankSaved,
    };

    dispatch(updateEmployeeDetails(finalPayload));

    // ── Refresh onboarding progress one more time ──
    if (resolvedUserId) {
      dispatch(fetchOnboardingProgress(resolvedUserId));
    }

    dispatch(setStep(5));
    showToast("Financial details verified and saved!", "success");
  };

  const handleBack = () => dispatch(setStep(3));

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn space-y-8 pb-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Salary & Bank Details
        </h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          Configure employee salary structure and payment information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ══════════════ SALARY STRUCTURE ══════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden transition-all">
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                <FiDollarSign size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Salary Structure
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Select currency and build a dynamic component breakdown.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/40 transition-all border border-green-100 dark:border-green-900/30 shadow-sm"
            >
              <FiSave size={16} />
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {!isSalarySaved ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Currency Selection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 cursor-pointer"
                    >
                      {currenciesList.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Payment Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentCycle}
                      onChange={(e) => setPaymentCycle(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 cursor-pointer"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-4">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">
                    Add Salary Component
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Component Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basic Salary, Housing, Transit"
                        value={newComponentName}
                        onChange={(e) => setNewComponentName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-green-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>Price / Value</span>
                        {currency && (
                          <span className="font-extrabold text-[10px] text-green-600 dark:text-green-500">
                            {currency}
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Enter amount"
                        value={newComponentPrice}
                        onChange={(e) => setNewComponentPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-green-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSalaryComponent}
                      className="sm:col-span-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 hover:scale-[1.02]"
                    >
                      <FiPlus size={16} />
                      Add
                    </button>
                  </div>
                </div>

                {salaryComponents.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden border border-gray-100 dark:border-gray-700/80 rounded-xl">
                      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/60 text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                          <tr>
                            <th className="px-4 py-3">Component Name</th>
                            <th className="px-4 py-3 text-right">
                              Value ({currency})
                            </th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                          {salaryComponents.map((comp) => (
                            <tr
                              key={comp.id}
                              className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10"
                            >
                              <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                                {comp.name}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                {comp.price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSalaryComponent(comp.id)}
                                  className="p-1 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-green-50/30 dark:bg-green-950/10 font-bold border-t-2 border-green-200/50">
                            <td className="px-4 py-3 text-green-700 dark:text-green-400 uppercase tracking-wider">
                              Total Monthly Salary
                            </td>
                            <td className="px-4 py-3 text-right text-green-700 dark:text-green-400 text-base">
                              {currency}{" "}
                              {watchTotalSalary.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveSalaryStructure}
                        disabled={salarySaving}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {salarySaving ? (
                          <>
                            <FiSave size={14} className="animate-pulse" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave size={14} />
                            Save Salary Structure
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-6 text-xs text-gray-400 italic">
                    No salary components added yet. Add "Basic Salary" and other
                    allowances to build the structure.
                  </p>
                )}
              </div>
            ) : (
              // SALARY SAVED VIEW
              <div className="overflow-x-auto border border-gray-150 dark:border-gray-700/80 rounded-2xl shadow-inner animate-fadeIn">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/80 text-left">
                  <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Currency</th>
                      <th className="px-6 py-4">Component Name</th>
                      <th className="px-6 py-4">Component Price</th>
                      <th className="px-6 py-4 text-right">Total Salary</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-800/20">
                    <tr className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-extrabold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30 shadow-sm">
                          <FiGlobe className="text-green-600" size={14} />
                          {currency}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          {salaryComponents.map((comp) => (
                            <div key={comp.id} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {comp.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          {salaryComponents.map((comp) => (
                            <div
                              key={comp.id}
                              className="text-sm font-bold text-gray-900 dark:text-white"
                            >
                              {currency}{" "}
                              {comp.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <span className="text-base font-extrabold text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20 px-3.5 py-2 rounded-2xl border border-green-150/30 dark:border-green-900/20 shadow-inner">
                          {currency}{" "}
                          {watchTotalSalary.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setIsSalarySaved(false)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-xl transition-all border border-green-150/40 dark:border-green-900/30 hover:scale-[1.03]"
                        >
                          <FiEdit size={14} />
                          Modify Structure
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════ BANK DETAILS ══════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700/80 overflow-hidden transition-all">
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <FiCreditCard size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Bank Details
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Enter required fields with local validations.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {!isBankSaved ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Emirates NBD, HDFC Bank"
                      value={bankName}
                      onChange={handleBankNameChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all outline-none ${
                        formErrors.bankName
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                      }`}
                    />
                    {formErrors.bankName && (
                      <p className="text-xs font-semibold text-red-500">
                        {formErrors.bankName}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 101004561239"
                      value={bankAccountNumber}
                      onChange={handleAccountNumberChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all outline-none ${
                        formErrors.accountNumber
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                      }`}
                    />
                    {formErrors.accountNumber && (
                      <p className="text-xs font-semibold text-red-500">
                        {formErrors.accountNumber}
                      </p>
                    )}
                  </div>

                  {/* IFSC */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0000240"
                      value={bankIfsc}
                      onChange={handleIfscChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all outline-none font-mono tracking-wider ${
                        formErrors.ifsc
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                      }`}
                    />
                    {formErrors.ifsc && (
                      <p className="text-xs font-semibold text-red-500">
                        {formErrors.ifsc}
                      </p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bandra East, Mumbai"
                      value={bankBranch}
                      onChange={handleBranchChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all outline-none ${
                        formErrors.branch
                          ? "border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                      }`}
                    />
                    {formErrors.branch && (
                      <p className="text-xs font-semibold text-red-500">
                        {formErrors.branch}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBankDetails}
                    disabled={bankSaving}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {bankSaving ? (
                      <>
                        <FiSave size={14} className="animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={14} />
                        Save Bank Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // BANK SAVED VIEW
              <div className="overflow-x-auto border border-gray-150 dark:border-gray-700/80 rounded-2xl shadow-inner animate-fadeIn">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/80 text-left">
                  <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Country</th>
                      <th className="px-6 py-4">Bank Name & Account Details</th>
                      <th className="px-6 py-4">Routing / Key Identifier</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-800/20">
                    <tr className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 shadow-sm">
                          <FiGlobe className="text-blue-600" size={14} />
                          {bankCountry}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {bankName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Account Number:{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {bankAccountNumber}
                            </span>
                          </p>
                          {bankCountry === "India" && bankBranch && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Branch:{" "}
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {bankBranch}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                            IFSC Code
                          </span>
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-800">
                            {bankIfsc}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setIsBankSaved(false)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-xl transition-all border border-green-150/40 dark:border-green-900/30 hover:scale-[1.03]"
                        >
                          <FiEdit size={14} />
                          Modify Bank Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft">
          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all rounded-xl hover:-translate-x-1"
          >
            <FiChevronLeft size={20} />
            Back
          </button>

          <button
            type="submit"
            disabled={salarySaving || bankSaving}
            className={`w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap text-white ${
              isSalarySaved && isBankSaved
                ? "bg-green-500 hover:bg-green-600 hover:scale-[1.02]"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 opacity-60"
            }`}
          >
            Save and Continue
            <FiChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryBankDetailsForm;