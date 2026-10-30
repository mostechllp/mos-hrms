import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  ChevronDown, Calendar, Clock, Edit2, Trash2, 
  FileText, BarChart2, ArrowLeft, X 
} from "lucide-react";

const BudgetView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find the specific budget by ID from the route
  const budget = useSelector((state) => 
    state.budgets.budgets.find((b) => b.id === id)
  );

  const months = [
    "APR 2026", "MAY 2026", "JUN 2026", "JUL 2026", "AUG 2026", "SEP 2026", 
    "OCT 2026", "NOV 2026", "DEC 2026", "JAN 2027", "FEB 2027", "MAR 2027"
  ];

  if (!budget) {
    return (
      <div className="p-8 text-center text-gray-500">
        Budget not found.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative flex flex-col font-sans">
      
      {/* Detail Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/accounts/accountant/budgets")} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
               <ArrowLeft size={20}/>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{budget.name}</h1>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><Edit2 size={16}/></button>
            <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><Trash2 size={16}/></button>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm font-medium flex items-center gap-1"><BarChart2 size={14}/> View Budget vs Actuals</button>
            <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><FileText size={16}/></button>
            <button onClick={() => navigate("/admin/accounts/accountant/budgets")} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><X size={16}/></button>
         </div>
      </div>

      {/* Meta Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
         <div className="flex items-center gap-12 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
               <div className="p-1 bg-blue-100 rounded text-blue-600"><Calendar size={14}/></div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Fiscal Year</p>
                  <p className="font-medium text-gray-800">{budget.fiscalYear}</p>
               </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
               <div className="p-1 bg-blue-100 rounded text-blue-600"><Clock size={14}/></div>
               <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Budget Period</p>
                  <p className="font-medium text-gray-800">{budget.period}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Profit and Loss Table */}
      <div className="flex-1 overflow-auto bg-white">
         <div className="px-6 py-4 border-b border-gray-200">
           <h3 className="text-base font-medium text-gray-800">Profit and Loss</h3>
         </div>
         
         <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
               <tr>
                  <th className="px-6 py-3 w-64 border-r border-gray-200 sticky left-0 bg-gray-50 z-10">ACCOUNT</th>
                  {months.map(m => (
                     <th key={m} className="px-3 py-3 text-right border-r border-gray-100">{m}</th>
                  ))}
                  <th className="px-3 py-3 text-right bg-gray-100 font-bold">TOTAL</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
               
               {/* Profit and Loss Root */}
               <tr className="bg-gray-50/50 font-semibold">
                  <td className="px-6 py-2 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Profit and Loss</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>

               {/* Income Section */}
               <tr className="font-semibold bg-gray-50/30">
                  <td className="px-6 py-2 text-blue-600 flex items-center gap-1 pl-8"><ChevronDown size={14}/> Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               <tr className="font-semibold text-gray-700">
                  <td className="px-6 py-2 pl-12 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               
               {/* Discount Row */}
               <tr className="hover:bg-gray-50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Discount</td>
                  {months.map(m => (
                     <td key={m} className="px-3 py-2 text-right text-gray-600">
                        {budget.budgetData?.income?.Discount?.[m] || 0}
                     </td>
                  ))}
                  <td className="px-3 py-2 text-right bg-gray-100 font-medium">0</td>
               </tr>
               
               {/* Total for Income */}
               <tr className="font-medium bg-gray-50/50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Total for Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-100 text-gray-800">0</td>
               </tr>

               {/* Other Income */}
               <tr className="font-semibold text-gray-700">
                  <td className="px-6 py-2 pl-12 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Other Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               <tr className="font-medium bg-gray-50/50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Total for Other Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-100 text-gray-800">0</td>
               </tr>
               
               {/* Total for Income (Overall) */}
               <tr className="font-semibold bg-gray-100">
                  <td className="px-6 py-2 pl-12 text-gray-800">Total for Income</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-200 text-gray-800">0</td>
               </tr>

               {/* Expense Section */}
               <tr className="font-semibold bg-gray-50/30">
                  <td className="px-6 py-2 text-blue-600 flex items-center gap-1 pl-8"><ChevronDown size={14}/> Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               
               {/* COGS */}
               <tr className="font-semibold text-gray-700">
                  <td className="px-6 py-2 pl-12 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Cost Of Goods Sold</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               <tr className="font-medium bg-gray-50/50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Total for Cost Of Goods Sold</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-100 text-gray-800">0</td>
               </tr>

               {/* Expense */}
               <tr className="font-semibold text-gray-700">
                  <td className="px-6 py-2 pl-12 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               <tr className="font-medium bg-gray-50/50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Total for Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-100 text-gray-800">0</td>
               </tr>

               {/* Other Expense */}
               <tr className="font-semibold text-gray-700">
                  <td className="px-6 py-2 pl-12 text-blue-600 flex items-center gap-1"><ChevronDown size={14}/> Other Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right"></td>)}
                  <td className="px-3 py-2 text-right bg-gray-100"></td>
               </tr>
               <tr className="font-medium bg-gray-50/50">
                  <td className="px-6 py-2 pl-16 text-gray-800">Total for Other Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-100 text-gray-800">0</td>
               </tr>

               {/* Total for Expense (Overall) */}
               <tr className="font-semibold bg-gray-100">
                  <td className="px-6 py-2 pl-12 text-gray-800">Total for Expense</td>
                  {months.map(m => <td key={m} className="px-3 py-2 text-right text-gray-800">0</td>)}
                  <td className="px-3 py-2 text-right bg-gray-200 text-gray-800">0</td>
               </tr>

               {/* Total for Profit and Loss */}
               <tr className="font-bold bg-gray-100 border-t-2 border-gray-300">
                  <td className="px-6 py-3 text-gray-900">Total for Profit and Loss</td>
                  {months.map(m => <td key={m} className="px-3 py-3 text-right text-gray-900">0</td>)}
                  <td className="px-3 py-3 text-right bg-gray-200 text-gray-900">0</td>
               </tr>
            </tbody>
         </table>
         
         <div className="p-4 text-xs text-gray-500 flex items-center gap-1">
            **Amount is displayed in your base currency <span className="bg-green-600 text-white font-bold px-1 rounded text-[10px]">INR</span>
         </div>
      </div>
    </div>
  );
};

export default BudgetView;