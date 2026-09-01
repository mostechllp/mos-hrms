import React from 'react'
import UnderDevelopment from '../../components/common/UnderDevelopment'

const Offboarding = () => {
  return (
    <UnderDevelopment pageName="Offbaording"/>
  )
}

export default Offboarding

// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   UserPlus,
//   ArrowRight,
//   CheckCircle2,
//   Clock,
//   Briefcase,
//   Calendar,
//   DollarSign,
//   FileText,
//   ShieldOff,
//   FolderMinus,
// } from "lucide-react";
// import { showToast } from "../../components/common/Toast";
// import { fetchEmployees } from "../store/slices/employeeSlice";
// import { fetchAllOffboarding, fetchOffboardingProgress } from "../store/slices/offboardingSlice";

// // Helper function to get step name based on 6-stage SOP
// const getStepName = (stepKey) => {
//   const stepMap = {
//     "initiation": "Exit Initiation",
//     "handover": "Handover",
//     "leave_check": "Leave Check",
//     "access_removal": "Access Removal",
//     "settlement": "FnF Settlement",
//     "documentation": "Documentation",
//   };
//   return stepMap[stepKey] || stepKey || "Unknown";
// };

// const getStepIcon = (stepKey) => {
//   switch (stepKey) {
//     case "initiation":
//       return <UserPlus size={14} />;
//     case "handover":
//       return <FolderMinus size={14} />;
//     case "leave_check":
//       return <Calendar size={14} />;
//     case "access_removal":
//       return <ShieldOff size={14} />;
//     case "settlement":
//       return <DollarSign size={14} />;
//     case "documentation":
//       return <FileText size={14} />;
//     default:
//       return <Clock size={14} />;
//   }
// };

// const OffboardingDashboard = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [stats, setStats] = useState({
//     activeOffboarding: 0,
//     pendingTasks: 0,
//     completedThisMonth: 0,
//   });

//   const [recentOffboarding, setRecentOffboarding] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [progressData, setProgressData] = useState({});

//   const { offboardings, loading: offboardingLoading } = useSelector((state) => state.offboarding);
//   const { employees, loading: employeesLoading } = useSelector((state) => state.employees);

//   // Build employee lookup map
//   const employeeMap = useMemo(() => {
//     const map = new Map();
//     if (employees && employees.length > 0) {
//       employees.forEach(emp => {
//         map.set(String(emp.id), emp);
//         if (emp.employee_id) map.set(String(emp.employee_id), emp);
//       });
//     }
//     return map;
//   }, [employees]);

//   useEffect(() => {
//     dispatch(fetchEmployees());
//     dispatch(fetchAllOffboarding({ page: 1, perPage: 50 }));
//   }, [dispatch]);

//   useEffect(() => {
//     const fetchProgressForAll = async () => {
//       if (offboardings && offboardings.length > 0) {
//         const progressMap = {};
//         for (const offboarding of offboardings) {
//           try {
//             const result = await dispatch(fetchOffboardingProgress(offboarding.id)).unwrap();
//             if (result) {
//               progressMap[offboarding.id] = result;
//             }
//           } catch (error) {
//             console.error(`Failed to fetch progress for offboarding ${offboarding.id}:`, error);
//           }
//         }
//         setProgressData(progressMap);
//       }
//     };
    
//     fetchProgressForAll();
//   }, [offboardings, dispatch]);

//   useEffect(() => {
//     if (!offboardingLoading && offboardings) {
//       const activeCount = offboardings.filter(
//         (off) => off.status !== "completed" && off.status !== "cancelled"
//       ).length;
      
//       const completedCount = offboardings.filter(
//         (off) => off.status === "completed"
//       ).length;

//       setStats({
//         activeOffboarding: activeCount,
//         pendingTasks: activeCount * 6, // 6 steps max
//         completedThisMonth: completedCount,
//       });

//       const formattedOffboardings = offboardings.map(off => {
//         let employee = null;
//         if (off.employee_id) {
//           employee = employeeMap.get(String(off.employee_id));
//         }
        
//         let employeeName = "Unknown Employee";
//         if (employee) {
//           employeeName = employee.name || `${employee.first_name} ${employee.last_name}`;
//         } else if (off.employee_name) {
//           employeeName = off.employee_name;
//         }
        
//         let department = off.department || "-";
//         if (employee && employee.department) {
//           department = employee.department;
//         }
        
//         const progress = progressData[off.id];
        
//         return {
//           id: off.id,
//           name: employeeName,
//           employeeId: off.employee_id,
//           department: department,
//           lastDay: off.last_working_day,
//           status: off.status,
//           currentStep: off.current_step || "initiation",
//           progressPercentage: progress?.progress_percentage || 0,
//           completedSteps: progress?.completed_steps || 0,
//           totalSteps: 6, // Updated to 6
//         };
//       });
      
//       setRecentOffboarding(formattedOffboardings);
//       setLoading(false);
//     }
//   }, [offboardings, offboardingLoading, employeeMap, progressData]);

//   const offboardingCards = [
//     {
//       id: "initiate",
//       title: "Initiate Offboarding",
//       description: "Start the 6-stage offboarding SOP. Set last working day and trigger workflows.",
//       icon: <UserPlus size={28} />,
//       path: "/admin/employees/offboarding-initiation",
//       color: "blue",
//       bgClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
//       buttonClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
//       stats: "Start new process",
//       buttonText: "Initiate Now",
//     }
//   ];

//   const quickStats = [
//     {
//       label: "Active Offboarding",
//       value: stats.activeOffboarding,
//       icon: <Briefcase size={20} />,
//       color: "blue",
//       bgClass: "bg-blue-100 dark:bg-blue-900/30",
//       textClass: "text-blue-600 dark:text-blue-400",
//     },
//     {
//       label: "Pending Tasks",
//       value: stats.pendingTasks,
//       icon: <Clock size={20} />,
//       color: "orange",
//       bgClass: "bg-orange-100 dark:bg-orange-900/30",
//       textClass: "text-orange-600 dark:text-orange-400",
//     },
//     {
//       label: "Completed (Month)",
//       value: stats.completedThisMonth,
//       icon: <CheckCircle2 size={20} />,
//       color: "green",
//       bgClass: "bg-green-100 dark:bg-green-900/30",
//       textClass: "text-green-600 dark:text-green-400",
//     }
//   ];

//   const getStatusColor = (status) => {
//     if (status === "completed") return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
//     if (status === "initiated") return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
//     return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "Not set";
//     return new Date(dateStr).toLocaleDateString("en-GB", {
//       day: "2-digit", month: "short", year: "numeric",
//     });
//   };

//   const handleContinue = (offboarding) => {
//     const step = offboarding.currentStep;
//     if (step === "initiation" || step === "initiated") {
//       navigate(`/admin/employees/offboarding-initiation?id=${offboarding.id}`);
//     } else if (step === "handover") {
//       navigate(`/admin/employees/offboarding/handover?id=${offboarding.id}`);
//     } else if (step === "leave_check") {
//       navigate(`/admin/employees/offboarding/leave-check?id=${offboarding.id}`);
//     } else if (step === "access_removal") {
//       navigate(`/admin/employees/offboarding/access-removal?id=${offboarding.id}`);
//     } else if (step === "settlement") {
//       navigate(`/admin/employees/final-settlement?id=${offboarding.id}`);
//     } else if (step === "documentation") {
//       navigate(`/admin/employees/letters-and-clearance?id=${offboarding.id}`);
//     } else {
//        navigate(`/admin/employees/offboarding-initiation?id=${offboarding.id}`);
//     }
//   };

//   if (loading || offboardingLoading) {
//     return (
//       <div className="w-full overflow-x-hidden flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full overflow-x-hidden p-6">
//       <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
//         {quickStats.map((stat, index) => (
//           <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-soft">
//             <div className="flex justify-between items-start mb-3">
//               <div className={`w-12 h-12 ${stat.bgClass} rounded-xl flex items-center justify-center`}>
//                 {stat.icon}
//               </div>
//               <span className={`text-3xl font-extrabold ${stat.textClass}`}>
//                 {stat.value}
//               </span>
//             </div>
//             <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
//           </div>
//         ))}
//       </div>

//       <div className="mb-6">
//         <h2 className="text-2xl font-bold gradient-heading bg-clip-text text-transparent">
//           Offboarding Process (SOP)
//         </h2>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {offboardingCards.map((card) => (
//           <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-soft cursor-pointer hover:-translate-y-1 transition-all" onClick={() => navigate(card.path)}>
//             <div className={`w-14 h-14 ${card.bgClass} rounded-xl flex items-center justify-center mb-4`}>
//               {card.icon}
//             </div>
//             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{card.description}</p>
//             <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
//               <button className={`px-4 py-2 rounded-lg ${card.buttonClass} font-semibold text-sm flex items-center gap-2 transition-all`}>
//                 {card.buttonText} <ArrowRight size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-soft">
//         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//           <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
//             <FileText size={18} /> Active Offboarding Requests
//           </h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 dark:bg-gray-700/50">
//               <tr>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500">Employee</th>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500">Last Day</th>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500">Step</th>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500">Progress</th>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
//                 <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentOffboarding.length > 0 ? recentOffboarding.map((item) => (
//                 <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
//                   <td className="px-4 py-3">
//                     <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.name}</p>
//                     <p className="text-xs text-gray-500">{item.department}</p>
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(item.lastDay)}</td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
//                       {getStepIcon(item.currentStep)} {getStepName(item.currentStep)}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-green-500" style={{ width: `${(item.completedSteps / item.totalSteps) * 100}%` }} />
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
//                       {item.status || "In Progress"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <button onClick={() => handleContinue(item)} className="text-sm font-semibold text-green-600 hover:text-green-700">
//                       Continue
//                     </button>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr>
//                   <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No offboarding requests found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OffboardingDashboard;