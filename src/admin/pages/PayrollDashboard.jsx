import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  fetchPayrollEmployees,
  fetchPayrollEntries,
  selectEmployees,
  selectEmployeesLoading,
  selectPayrollEntries,
  selectEntriesLoading,
  selectPayrollError,
  selectTotalPayrollAmount,
  selectPendingPayrollCount,
  selectPaidPayrollCount,
  selectPayrollTotalCount,
} from '../store/slices/payrollSlice';

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Redux selectors
  const employees = useSelector(selectEmployees);
  const employeesLoading = useSelector(selectEmployeesLoading);
  const payrollEntries = useSelector(selectPayrollEntries);
  const entriesLoading = useSelector(selectEntriesLoading);
  const error = useSelector(selectPayrollError);
  const totalPayrollAmount = useSelector(selectTotalPayrollAmount);
  const pendingCount = useSelector(selectPendingPayrollCount);
  const paidCount = useSelector(selectPaidPayrollCount);
  const totalCount = useSelector(selectPayrollTotalCount);

  // Fetch employees and payroll entries on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(fetchPayrollEmployees());
      // Fetch entries for current year
      await dispatch(fetchPayrollEntries({ 
        year: currentYear, 
        month: 'all' 
      }));
      setLoading(false);
    };
    fetchData();
  }, [dispatch, currentYear]);

  // Group payroll entries by month
  const getPayrollsByMonth = () => {
    const monthCounts = new Array(12).fill(0);
    
    payrollEntries.forEach(entry => {
      if (entry.pay_period_month) {
        const monthIndex = parseInt(entry.pay_period_month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthCounts[monthIndex]++;
        }
      }
    });
    
    return monthCounts;
  };

  const payrollsByMonth = getPayrollsByMonth();

  // Month data with real counts
  const months = [
    { id: 1, name: "January", short: "Jan", payrolls: payrollsByMonth[0] },
    { id: 2, name: "February", short: "Feb", payrolls: payrollsByMonth[1] },
    { id: 3, name: "March", short: "Mar", payrolls: payrollsByMonth[2] },
    { id: 4, name: "April", short: "Apr", payrolls: payrollsByMonth[3] },
    { id: 5, name: "May", short: "May", payrolls: payrollsByMonth[4] },
    { id: 6, name: "June", short: "Jun", payrolls: payrollsByMonth[5] },
    { id: 7, name: "July", short: "Jul", payrolls: payrollsByMonth[6] },
    { id: 8, name: "August", short: "Aug", payrolls: payrollsByMonth[7] },
    { id: 9, name: "September", short: "Sep", payrolls: payrollsByMonth[8] },
    { id: 10, name: "October", short: "Oct", payrolls: payrollsByMonth[9] },
    { id: 11, name: "November", short: "Nov", payrolls: payrollsByMonth[10] },
    { id: 12, name: "December", short: "Dec", payrolls: payrollsByMonth[11] }
  ];

  // Calculate months with payroll
  const monthsWithPayroll = months.filter(m => m.payrolls > 0).length;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle month click
  const handleMonthClick = (monthName) => {
    navigate(`/admin/payroll/${currentYear}/${monthName.toLowerCase()}`);
  };

  // Handle year change
  const handleYearChange = async (year) => {
    setCurrentYear(year);
    await dispatch(fetchPayrollEntries({ 
      year: year, 
      month: 'all' 
    }));
  };

  // Loading state
  if (loading || employeesLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">Error: {error}</p>
          <button
            onClick={() => {
              dispatch(fetchPayrollEmployees());
              dispatch(fetchPayrollEntries({ year: currentYear, month: 'all' }));
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-green-500 w-8 h-8" />
            <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
              Payroll Calendar
            </h1>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" />
              {currentYear}
            </span>
          </div>
          <button 
            onClick={() => navigate('/admin/payroll/add')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-bold shadow-sm transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Add Payroll
          </button>
        </div>

        {/* Year Selector */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4 flex justify-between items-center">
          <button 
            onClick={() => handleYearChange(currentYear - 1)}
            className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-gray-800 dark:text-white">
            {currentYear}
          </h2>
          <button 
            onClick={() => handleYearChange(currentYear + 1)}
            className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month) => {
            const hasPayroll = month.payrolls > 0;
            return (
              <div 
                key={month.id}
                onClick={() => hasPayroll && handleMonthClick(month.name)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                  hasPayroll 
                    ? "bg-green-50/50 dark:bg-green-900/20 border-green-400 dark:border-green-600 cursor-pointer hover:shadow-md hover:-translate-y-1" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-default"
                }`}
              >
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {month.short}
                </span>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {month.name}
                </h3>
                {hasPayroll ? (
                  <span className="text-2xl font-black text-green-500">
                    {month.payrolls}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-300 dark:text-gray-600">
                    No Payroll
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-green-400 bg-green-50/50"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Has Payroll</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-gray-200 bg-white"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">No Payroll</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Employees:</span>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{employees.length}</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Payrolls</p>
            <h3 className="text-2xl font-black text-blue-500">{totalCount}</h3>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Months with Payroll</p>
            <h3 className="text-2xl font-black text-green-500">{monthsWithPayroll}</h3>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</p>
            <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paid</p>
            <h3 className="text-2xl font-black text-green-500">{paidCount}</h3>
          </div>
        </div>

        {/* Total Amount Breakdown */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Total Payroll Amount</p>
                <h3 className="text-2xl font-black text-blue-500">{formatCurrency(totalPayrollAmount)}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Pending Amount</p>
                <h3 className="text-lg font-bold text-amber-500">{formatCurrency(pendingCount > 0 ? totalPayrollAmount * (pendingCount / totalCount || 0) : 0)}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Paid Amount</p>
                <h3 className="text-lg font-bold text-green-500">{formatCurrency(paidCount > 0 ? totalPayrollAmount * (paidCount / totalCount || 0) : 0)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {monthsWithPayroll > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Monthly Payroll Distribution</h3>
            <div className="grid grid-cols-12 gap-2 h-32 items-end">
              {months.map((month) => {
                const maxPayroll = Math.max(...months.map(m => m.payrolls), 1);
                const height = month.payrolls > 0 ? (month.payrolls / maxPayroll) * 100 : 0;
                return (
                  <div key={month.id} className="flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        month.payrolls > 0 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ height: `${Math.max(height * 0.9, 4)}px` }}
                    />
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                      {month.short}
                    </span>
                    {month.payrolls > 0 && (
                      <span className="text-[8px] font-bold text-green-500">{month.payrolls}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PayrollDashboard;