import React, { useState } from "react";
import { Link } from "react-router-dom";

function AddPayroll() {

  const steps = [
    { id: 1, label: "Basic Info", active: true },
    { id: 2, label: "Salary Structure", active: false },
    { id: 3, label: "Country Split", active: false },
    { id: 4, label: "Deductions", active: false },
    { id: 5, label: "Summary", active: false },
  ];

  const [countries, setCountries] = useState([
    { id: 1, name: "UAE", currency: "AED", dailyRate: "600", daysWorked: "10", fxRate: "22.5" },
    { id: 2, name: "India", currency: "INR", dailyRate: "2000", daysWorked: "20", fxRate: "1" }
  ]);

  const [deductions, setDeductions] = useState([
    { id: 1, type: "PF (Employee 12%)", country: "India", amount: "6000", statutory: "Yes" },
    { id: 2, type: "Professional Tax", country: "India", amount: "200", statutory: "Yes" },
    { id: 3, type: "TDS / Income Tax", country: "India", amount: "4500", statutory: "Yes" },
    { id: 4, type: "Gratuity (UAE 8.33%)", country: "UAE", amount: "1125", statutory: "Yes" }
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto flex-1 pb-10">
      
      {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
              <Link to="/admin/payroll" className="hover:text-green-500 transition-colors">Payroll</Link>
              <i className="fas fa-chevron-right text-[10px]"></i>
              <span className="text-gray-800 dark:text-gray-200">Add Payroll</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
              <span className="text-green-500 text-2xl">
                <i className="fas fa-dollar-sign"></i>
              </span>
              Add New Payroll
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Configure employee salary, country-wise work splits, and deductions
            </p>
          </div>

          {/* Stepper */}
          <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 mb-6 scrollbar-hide">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs md:text-sm font-semibold transition-all border ${
                  step.active
                    ? "bg-green-500 text-white border-green-500 shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 shadow-sm"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step.active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  {step.id}
                </div>
                {step.label}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Employee Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 md:p-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                  <i className="fas fa-user text-xs"></i>
                </div>
                Employee Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Employee <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all">
                    <option>Ahmed Al Mansoori</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Employee ID</label>
                  <input type="text" value="EMP-0042" readOnly className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Organization <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all">
                    <option>Alpha Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Department</label>
                  <input type="text" value="Engineering" readOnly className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Designation</label>
                  <input type="text" value="Senior Developer" readOnly className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Employment Type</label>
                  <input type="text" value="Full-time" readOnly className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 outline-none" />
                </div>
              </div>
            </div>

            {/* Pay Period Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 md:p-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-xs"></i>
                </div>
                Pay Period
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Pay Period Month <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none transition-all">
                    <option>May</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Pay Period Year <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none transition-all">
                    <option>2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Period Start Date</label>
                  <div className="relative">
                    <input type="text" value="05/01/2026" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    <i className="far fa-calendar absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Period End Date</label>
                  <div className="relative">
                    <input type="text" value="05/31/2026" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    <i className="far fa-calendar absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Payment Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" value="05/30/2026" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    <i className="far fa-calendar absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Payment Mode <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none transition-all">
                    <option>Bank Transfer (NEFT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Total Working Days</label>
                  <input type="text" value="26" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Days Present</label>
                  <input type="text" value="30" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                </div>
              </div>
            </div>

            {/* Salary Structure Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 md:p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                    <i className="fas fa-coins text-xs"></i>
                  </div>
                  Salary Structure — Earnings
                </h3>
                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-md border border-green-100 dark:border-green-800">
                  Active Profile
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Annual CTC <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="12,00,000" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Basic Salary / month <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="50,000" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">HRA <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="20,000" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Conveyance Allowance</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="1,600" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Medical Allowance</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="1,250" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Special Allowance</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="5,150" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">LTA</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="2,000" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Performance Bonus</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="0" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Overtime Pay</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                    <input type="text" value="0" className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Gross Earnings</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">₹80,000</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">Before deductions</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Total Deductions</div>
                  <div className="text-lg font-bold text-red-500">₹12,315</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">PF + ESI + PT + TDS</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Employee PF</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">₹6,000</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">12% of basic</div>
                </div>
                <div className="p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                  <div className="text-[10px] text-green-600 dark:text-green-500 font-medium mb-1">Net Take-Home</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₹67,685</div>
                  <div className="text-[9px] text-green-500/70 mt-0.5">INR this month</div>
                </div>
              </div>
            </div>

            {/* Multi-Country Work Split Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 md:p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
                    <i className="fas fa-globe text-xs"></i>
                  </div>
                  Multi-Country Work Split
                </h3>
                <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-100 dark:border-amber-800">
                  2 countries
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-5">
                Enter the number of days worked in each country. Salary is calculated pro-rata based on each country's wage rate and converted to the base currency (INR).
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="col-span-3">Country</div>
                  <div className="col-span-2">Currency</div>
                  <div className="col-span-2">Daily Rate</div>
                  <div className="col-span-2">Days Worked</div>
                  <div className="col-span-2">FX Rate → INR</div>
                  <div className="col-span-1"></div>
                </div>
                
                {countries.map((c) => (
                  <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 md:bg-transparent dark:bg-gray-900/50 md:dark:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                    <div className="col-span-3">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none">
                        <option>{c.name}</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none">
                        <option>{c.currency}</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input type="text" value={c.dailyRate} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <input type="text" value={c.daysWorked} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <input type="text" value={c.fxRate} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    </div>
                    <div className="col-span-1 flex justify-end md:justify-center">
                      <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center border border-red-100 dark:border-red-900">
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800 flex items-center gap-2 mb-6">
                <i className="fas fa-plus"></i> Add Country
              </button>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 dark:bg-gray-900/50 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    <img src="https://flagcdn.com/w20/ae.png" alt="UAE" className="w-3 h-2" />
                    UAE (AED)
                  </div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-500">AED 6,000</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">10 days × AED 600</div>
                </div>
                <div className="p-3 rounded-xl bg-green-50/50 border border-green-100 dark:bg-gray-900/50 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-3 h-2" />
                    India (INR)
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-500">₹40,000</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">20 days × ₹2,000</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-gray-900/50 dark:border-gray-800 relative overflow-hidden">
                  <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-100/50 dark:from-blue-900/20 to-transparent"></div>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    UAE → INR
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-500">₹1,35,000</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">AED 6,000 × 22.5</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-gray-900/50 dark:border-gray-800">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mb-1">
                    Combined (INR)
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">₹1,75,000</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Total this month</div>
                </div>
              </div>
            </div>

            {/* Deductions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 md:p-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                  <i className="fas fa-minus-circle text-xs"></i>
                </div>
                Deductions
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="col-span-4">Deduction Type</div>
                  <div className="col-span-3">Country / Scope</div>
                  <div className="col-span-2">Amount (INR)</div>
                  <div className="col-span-2">Statutory?</div>
                  <div className="col-span-1"></div>
                </div>
                
                {deductions.map((d) => (
                  <div key={d.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 md:bg-transparent dark:bg-gray-900/50 md:dark:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                    <div className="col-span-4">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none">
                        <option>{d.type}</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none">
                        <option>{d.country}</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input type="text" value={d.amount} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <select className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none">
                        <option>{d.statutory}</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-end md:justify-center">
                      <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center border border-red-100 dark:border-red-900">
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800 flex items-center gap-2 mb-6">
                <i className="fas fa-plus"></i> Add Deduction
              </button>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">India Deductions</div>
                  <div className="text-lg font-bold text-red-500">₹10,700</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">PF + PT + TDS</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">UAE Deductions (INR)</div>
                  <div className="text-lg font-bold text-red-500">₹1,125</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">Gratuity</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Total Deductions</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-500">₹11,825</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">All countries</div>
                </div>
                <div className="p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                  <div className="text-[10px] text-green-600 dark:text-green-500 font-medium mb-1">Final Net Pay</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₹1,63,175</div>
                  <div className="text-[9px] text-green-500/70 mt-0.5">After all deductions</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to="/admin/payroll" className="w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs md:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-arrow-left"></i> Back
              </Link>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs md:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-transparent text-center">
                  Save as Draft
                </button>
                <button className="w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-xl bg-green-500 text-white text-xs md:text-sm font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center">
                  Save & Continue <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>

          </div>
    </div>
  );
}

export default AddPayroll;
