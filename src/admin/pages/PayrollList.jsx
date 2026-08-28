import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Plus, Search, ListChecks, Archive } from 'lucide-react';

const PayrollList = () => {
  const navigate = useNavigate();
  const { year, month } = useParams();
  
  const monthName = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';
  const displayTitle = `${monthName} ${year}`;

  const [entries, setEntries] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Back Link */}
        <div>
          <button 
            onClick={() => navigate('/admin/payroll')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Calendar
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FileText className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">0</h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">Total Payrolls</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Clock className="text-gray-800 dark:text-gray-100 w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black text-gray-800 dark:text-white leading-none">0</h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">Pending</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-sm font-bold text-green-500">AED</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-green-500 leading-none">AED 0.00</h3>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">AED Total Amount</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">INR</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">₹0.00</h3>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">INR Total Amount</p>
            </div>
          </div>
        </div>

        {/* List Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <ListChecks className="text-green-500 w-7 h-7" strokeWidth={3} />
              Payroll List
            </h2>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
              {displayTitle}
            </span>
          </div>
          <button 
            onClick={() => navigate('/admin/payroll/add')}
            className="flex items-center gap-2 btn-primary-custom px-5 py-2.5 rounded-full font-bold shadow-sm transition-all text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Add Payroll
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm overflow-hidden mt-4">
          
          {/* Toolbar */}
          <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              Show entries
              <select 
                value={entries}
                onChange={(e) => setEntries(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full text-sm px-4 py-2 text-gray-600 dark:text-gray-300 w-full sm:w-auto focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-medium">
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder="Search employee or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/80"></div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-[#fafbfc] dark:bg-gray-800/50 text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">SL NO</th>
                  <th className="px-6 py-4 whitespace-nowrap">EMPLOYEE</th>
                  <th className="px-6 py-4 whitespace-nowrap">MONTH / YEAR</th>
                  <th className="px-6 py-4 whitespace-nowrap">GROSS SALARY</th>
                  <th className="px-6 py-4 whitespace-nowrap">OVERTIME</th>
                  <th className="px-6 py-4 whitespace-nowrap">DEDUCTIONS</th>
                  <th className="px-6 py-4 whitespace-nowrap">NET PAY</th>
                  <th className="px-6 py-4 whitespace-nowrap">CURRENCY</th>
                  <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                  <th className="px-6 py-4 whitespace-nowrap">PAYMENT DATE</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty State */}
                <tr>
                  <td colSpan="11" className="px-6 py-24 text-center border-t border-gray-100 dark:border-gray-700/80">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <Archive className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                      <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                        No payroll records found for {displayTitle}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayrollList;
