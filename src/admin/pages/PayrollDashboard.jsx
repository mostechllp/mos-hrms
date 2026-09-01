import React from 'react'
import UnderDevelopment from '../../components/common/UnderDevelopment'

const PayrollDashboard = () => {
  return (
    <UnderDevelopment pageName="Payroll"/>
  )
}

export default PayrollDashboard

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CalendarDays, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// const PayrollDashboard = () => {
//   const navigate = useNavigate();
//   const [currentYear, setCurrentYear] = useState(2026);

//   const months = [
//     { id: 1, name: "January", short: "Jan", payrolls: 0 },
//     { id: 2, name: "February", short: "Feb", payrolls: 0 },
//     { id: 3, name: "March", short: "Mar", payrolls: 0 },
//     { id: 4, name: "April", short: "Apr", payrolls: 0 },
//     { id: 5, name: "May", short: "May", payrolls: 0 },
//     { id: 6, name: "June", short: "Jun", payrolls: 0 },
//     { id: 7, name: "July", short: "Jul", payrolls: 13 },
//     { id: 8, name: "August", short: "Aug", payrolls: 3 },
//     { id: 9, name: "September", short: "Sep", payrolls: 0 },
//     { id: 10, name: "October", short: "Oct", payrolls: 0 },
//     { id: 11, name: "November", short: "Nov", payrolls: 0 },
//     { id: 12, name: "December", short: "Dec", payrolls: 0 }
//   ];

//   return (
//     <div className="min-h-screen bg-[#f8fcfb] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-[1400px] mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="flex items-center gap-3">
//             <CalendarDays className="text-green-500 w-8 h-8" />
//             <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
//               Payroll Calendar
//             </h1>
//             <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md flex items-center gap-1.5">
//               <CalendarDays className="w-3 h-3" />
//               {currentYear}
//             </span>
//           </div>
//           <button 
//             onClick={() => navigate('/admin/payroll/add')}
//             className="flex items-center gap-2 btn-primary-custom px-5 py-2.5 rounded-full font-bold shadow-sm transition-all"
//           >
//             <Plus size={18} strokeWidth={3} />
//             Add Payroll
//           </button>
//         </div>

//         {/* Year Selector */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4 flex justify-between items-center">
//           <button 
//             onClick={() => setCurrentYear(prev => prev - 1)}
//             className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <h2 className="text-xl font-black text-gray-800 dark:text-white">
//             {currentYear}
//           </h2>
//           <button 
//             onClick={() => setCurrentYear(prev => prev + 1)}
//             className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>

//         {/* Months Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//           {months.map((month) => {
//             const hasPayroll = month.payrolls > 0;
//             return (
//               <div 
//                 key={month.id}
//                 onClick={() => navigate(`/admin/payroll/${currentYear}/${month.name.toLowerCase()}`)}
//                 className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-1 ${
//                   hasPayroll 
//                     ? "bg-green-50/50 dark:bg-green-900/20 border-green-400 dark:border-green-600" 
//                     : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500"
//                 }`}
//               >
//                 <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
//                   {month.short}
//                 </span>
//                 <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
//                   {month.name}
//                 </h3>
//                 {hasPayroll ? (
//                   <span className="text-2xl font-black text-green-500">
//                     {month.payrolls}
//                   </span>
//                 ) : (
//                   <span className="text-xs font-medium text-gray-300 dark:text-gray-600">
//                     No Payroll
//                   </span>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Legend */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-4 flex items-center gap-6">
//           <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Legend:</span>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded border border-green-400 bg-green-50/50"></div>
//             <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Has Payroll</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded border border-gray-200 bg-white"></div>
//             <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">No Payroll</span>
//           </div>
//         </div>

//         {/* Summary Statistics */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
//             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Payrolls</p>
//             <h3 className="text-2xl font-black text-blue-500">16</h3>
//           </div>
          
//           <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
//             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Months with Payroll</p>
//             <h3 className="text-2xl font-black text-green-500">2</h3>
//           </div>
          
//           <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6">
//             <p className="text-xs font-medium text-blue-500 mb-1">INR Total</p>
//             <h3 className="text-xl font-black text-blue-500">₹26,043.48</h3>
//           </div>
//         </div>

//         {/* Breakdown Statistics */}
//         <div className="grid grid-cols-1 gap-4">
//           <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 flex justify-between items-end">
//             <div>
//               <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">INR Breakdown</p>
//               <h3 className="text-sm font-bold text-blue-500">Total: ₹26,043.48</h3>
//             </div>
//             <div className="text-right">
//               <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Paid</p>
//               <h3 className="text-sm font-bold text-blue-500">₹25,000.00</h3>
//             </div>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   );
// };

// export default PayrollDashboard;
