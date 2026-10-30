import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteProject } from "../../store/slices/accounts/projectsSlice";
import { 
  Plus, MoreHorizontal, ChevronDown, PlayCircle, Box, FileText, 
  Clock, RefreshCw, CheckCircle2, X, Search, Filter, 
  Settings, User, ArrowLeft, Trash2, Edit2, Link
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.accountProjects.projects);

  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  // Start Timer Modal State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timerNote, setTimerNote] = useState("");

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(deleteTarget.id)).unwrap();
      setIsDeleting(false);
      setDeleteTarget(null);
      if (selectedProject?.id === deleteTarget.id) setSelectedProject(null);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  const openTimerModal = (e) => {
    if (e) e.stopPropagation();
    setIsTimerModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen relative overflow-hidden flex flex-col">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">All Projects</h1>
          <ChevronDown size={16} className="text-blue-600" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-gray-300 rounded overflow-hidden">
             <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100"><Filter size={16} className="text-gray-600"/></button>
             <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border-l border-gray-300"><MoreHorizontal size={16} className="text-gray-600"/></button>
          </div>
          
          <button onClick={() => openTimerModal()} className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
             <Clock size={16}/> Start
          </button>
          
          <div className="flex items-center rounded border border-gray-300 overflow-hidden">
            <button onClick={() => navigate("/admin/accounts/time-tracking/projects/new")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-1">
              <Plus size={16} /> New
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 border-l border-blue-400">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        /* EMPTY STATE LAYOUT */
        <div className="flex flex-col items-center pt-16 pb-20 px-6">
          

          <h2 className="text-2xl font-normal text-gray-800 mb-2">Create your first project</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-lg text-center">
            Keep track of time you spend on various projects.
          </p>
          
          <button onClick={() => navigate("/admin/accounts/time-tracking/projects/new")} className="bg-blue-500 hover:bg-blue-600 text-white uppercase tracking-wider text-xs px-6 py-2.5 rounded font-semibold">
            CREATE NEW PROJECT
          </button>

          {/* Life Cycle Section with Lucide Icons */}
          <div className="w-full max-w-6xl mt-20 text-center border-t border-gray-200 pt-12">
             <h3 className="text-lg font-medium text-gray-800 mb-12">Life cycle of a Project</h3>
             
             <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold text-gray-600">
                <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <User size={16} className="text-blue-500"/> CUSTOMER
                </div>
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                <div className="border border-blue-200 bg-blue-50 text-blue-700 rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <FileText size={16} className="text-blue-500"/> PROJECT
                </div>
                
                <div className="flex flex-col gap-2 relative">
                   <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t-2 border-dashed border-gray-300"></div>
                   <div className="flex items-center gap-2">
                      <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                      <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700">
                         <Clock size={16} className="text-blue-500"/> LOG TIME USING TIMER
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                      <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm text-blue-700">
                         <FileText size={16} className="text-blue-500"/> PROJECT EXPENSE
                      </div>
                   </div>
                </div>
                
                <div className="w-8 border-t-2 border-dashed border-gray-300"></div>
                <div className="border border-blue-200 bg-white rounded px-3 py-2 flex items-center gap-2 shadow-sm">
                   <FileText size={16} className="text-blue-500"/> INVOICES
                </div>
             </div>

             <div className="mt-16 text-left inline-block">
                <h4 className="text-base font-medium text-gray-800 mb-4">Do more than just Project Time Tracking</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Log time spent on projects</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Invite staff and assign project tasks</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Set budget for projects</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Manage projects and associated project tasks</li>
                </ul>
             </div>
          </div>
        </div>
      ) : (
        /* MAIN TABLE */
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3 w-10"></th>
                <th className="px-4 py-3 cursor-pointer hover:text-gray-700">Project Name</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Billing Method</th>
                <th className="px-4 py-3 text-right">Logged Hours</th>
                <th className="px-4 py-3 text-right">Unbilled Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => setSelectedProject(project)}>
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                  <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">{project.projectName}</td>
                  <td className="px-4 py-3 text-gray-800">{project.customerName}</td>
                  <td className="px-4 py-3 text-gray-500">{project.billingMethod}</td>
                  <td className="px-4 py-3 text-gray-800 text-right">{project.stats.loggedHours}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-right">₹{Number(project.stats.unbilledHours === "00:00" ? 0 : 500).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedProject(project)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded"><Search size={16} /></button>
                      <button onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${project.id}`)} className="p-1.5 text-gray-500 hover:text-green-600 rounded"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteTarget(project)} className="p-1.5 text-gray-500 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SLIDING DRAWER (Project Details) */}
      {selectedProject && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[75%] lg:w-[70%] bg-white shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200">
            
            {/* Drawer Header */}
            <div className="flex flex-col bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                   <button onClick={() => setSelectedProject(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><ArrowLeft size={20}/></button>
                   <h2 className="text-xl font-bold text-gray-900">{selectedProject.projectName}</h2>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                   <button onClick={() => navigate(`/admin/accounts/time-tracking/projects/edit/${selectedProject.id}`)} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white">Edit</button>
                   <button onClick={() => openTimerModal()} className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 font-medium"><Clock size={14}/> Log Time</button>
                   <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white flex items-center gap-1">New Transaction <ChevronDown size={14}/></button>
                   <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white"><FileText size={16}/></button>
                   <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white flex items-center gap-1">More <ChevronDown size={14}/></button>
                   <button onClick={() => setSelectedProject(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded ml-2">
                      <X size={20} />
                   </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 px-6 overflow-x-auto">
                {["Overview", "Timesheet", "Purchases", "Sales", "Budget Configuration", "Journals", "Activity Logs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body Content based on Tab */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === "Overview" && (
                <div className="flex gap-6">
                   {/* Left Panel: Details */}
                   <div className="w-1/3 bg-white border border-gray-200 rounded-lg p-5 space-y-6 self-start">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                         <Box size={24} className="text-gray-400"/>
                         <h3 className="text-lg font-medium text-gray-800">{selectedProject.projectName}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-blue-600">
                         <User size={20} />
                         <span className="font-medium">{selectedProject.customerName}</span>
                      </div>
                      <div className="space-y-3 text-sm">
                         <div>
                            <p className="text-gray-500">Billing Method</p>
                            <p className="text-gray-800 font-medium">{selectedProject.billingMethod}</p>
                         </div>
                         <div>
                            <p className="text-gray-500">Rate Per Hour</p>
                            <p className="text-gray-800 font-medium">₹{Number(selectedProject.ratePerHour || 22).toFixed(2)}</p>
                         </div>
                         <div>
                            <p className="text-gray-500">Add to dashboard watchlist.</p>
                            <p className="text-gray-800"><span className="font-medium">Enabled</span> - <span className="text-blue-600 cursor-pointer hover:underline">Disable</span></p>
                         </div>
                      </div>
                   </div>

                   {/* Right Panel: Stats & Users */}
                   <div className="flex-1 space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                         <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4 border-b border-gray-200 pb-2">
                               <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-2 -mb-[10px]">Project Hours</button>
                               <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Profitability Summary</button>
                            </div>
                            <button className="text-sm text-blue-600 flex items-center gap-1">This Week <ChevronDown size={14}/></button>
                         </div>
                         
                         {/* Mock Chart Area */}
                         <div className="h-48 bg-gray-50 rounded border border-gray-100 flex items-end justify-between px-6 pb-2 relative mb-6">
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 py-2 px-1">
                               <span>5 K</span><span>4 K</span><span>3 K</span><span>2 K</span><span>1 K</span><span>0</span>
                            </div>
                            {[25,26,27,28,29,30,31].map(day => (
                               <div key={day} className="flex flex-col items-center gap-2 z-10 w-full">
                                  <div className="w-2 bg-blue-100 h-4 rounded-t"></div>
                                  <span className="text-[10px] text-gray-500">{day} Oct</span>
                               </div>
                            ))}
                         </div>

                         {/* Stats Grid */}
                         <div className="grid grid-cols-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-center">
                            <div>
                               <p className="text-xs text-gray-500 mb-1">Logged Hours</p>
                               <p className="text-blue-600 font-medium text-lg">00:00</p>
                               <p className="text-sm font-semibold text-gray-800">₹0.00</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 mb-1">Billable Hours</p>
                               <p className="text-blue-600 font-medium text-lg">00:00</p>
                               <p className="text-sm font-semibold text-gray-800">₹0.00</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 mb-1">Billed Hours</p>
                               <p className="text-blue-600 font-medium text-lg">00:00</p>
                               <p className="text-sm font-semibold text-gray-800">₹0.00</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 mb-1">Unbilled Hours</p>
                               <p className="text-blue-600 font-medium text-lg">00:00</p>
                               <p className="text-sm font-semibold text-gray-800">₹0.00</p>
                            </div>
                         </div>
                      </div>

                      {/* Users Table */}
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800">Users</h3>
                            <button className="text-sm text-blue-600 hover:underline">+ Add User</button>
                         </div>
                         <table className="w-full text-left text-sm">
                            <thead className="text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
                               <tr>
                                  <th className="pb-2">NAME</th>
                                  <th className="pb-2 text-right">LOGGED HOURS</th>
                                  <th className="pb-2 text-right">BILLED HOURS</th>
                                  <th className="pb-2 text-right">UNBILLED HOURS</th>
                                  <th className="pb-2 text-right">ROLE</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {selectedProject.users?.map(user => (
                                  <tr key={user.id}>
                                     <td className="py-3">
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                     </td>
                                     <td className="py-3 text-right text-gray-700">00:00</td>
                                     <td className="py-3 text-right text-gray-700">00:00</td>
                                     <td className="py-3 text-right text-gray-700">00:00</td>
                                     <td className="py-3 text-right text-gray-700">{user.role}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>

                      {/* Project Tasks */}
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800">Project Tasks</h3>
                            <button className="text-sm text-blue-600 hover:underline">+ Add Task</button>
                         </div>
                         <div className="text-center py-8 text-gray-500 text-sm">
                            No project tasks have been added.
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* PURCHASES TAB */}
              {activeTab === "Purchases" && (
                <div className="space-y-6">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Go to transactions</span> <ChevronDown size={14}/>
                   </div>

                   {/* Expenses Section */}
                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Expenses</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-left text-xs text-gray-500 uppercase font-semibold">
                            <thead>
                               <tr className="border-b border-gray-100">
                                  <th className="px-4 py-2">DATE</th>
                                  <th className="px-4 py-2">EXPENSE AC...</th>
                                  <th className="px-4 py-2">REFERENCE#</th>
                                  <th className="px-4 py-2">VENDOR NAME</th>
                                  <th className="px-4 py-2">PAID THROU...</th>
                                  <th className="px-4 py-2">CUSTOMER ...</th>
                                  <th className="px-4 py-2 text-right">AMOUNT</th>
                                  <th className="px-4 py-2 text-right">STATUS</th>
                               </tr>
                            </thead>
                         </table>
                         <div className="text-center py-8 text-sm text-gray-500">There are no expenses</div>
                      </div>
                   </div>

                   {/* Bills Section */}
                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Bills</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no Bills</div>
                   </div>

                   {/* Purchase Orders Section */}
                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Purchase Orders</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no Purchase Orders</div>
                   </div>

                   {/* Vendor Credits Section */}
                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Vendor Credits</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">No data to display</div>
                   </div>
                </div>
              )}

              {/* SALES TAB */}
              {activeTab === "Sales" && (
                <div className="space-y-6">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Go to transactions</span> <ChevronDown size={14}/>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Invoices</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no invoices</div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Quotes</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no quotes</div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Sales Orders</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no Sales Orders</div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                         <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ChevronDown size={16}/> Credit Notes</h3>
                         <button className="text-xs text-blue-600 flex items-center gap-1"><Filter size={12}/> Status: All <ChevronDown size={12}/></button>
                      </div>
                      <div className="text-center py-8 text-sm text-gray-500">There are no credit notes</div>
                   </div>
                </div>
              )}

              {/* BUDGET CONFIGURATION TAB */}
              {activeTab === "Budget Configuration" && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-200">
                   <h2 className="text-2xl font-normal text-gray-800 mb-2">Budget your business finance. Stay on top of your expenses.</h2>
                   <p className="text-gray-500 text-sm mb-8 text-center max-w-lg">
                     Create budgets for the various activities of your business, compare them with the actuals, and see how your business is performing.
                   </p>
                   <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded">
                      CREATE BUDGET
                   </button>
                </div>
              )}

              {/* OTHER TABS (Fallback) */}
              {!["Overview", "Purchases", "Sales", "Budget Configuration"].includes(activeTab) && (
                <div className="flex items-center justify-center py-24 text-gray-500 bg-white rounded-lg border border-gray-200">
                   No data available for {activeTab}.
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* START TIMER MODAL */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
             {/* Modal Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                   <Clock size={18} /> START TIMER
                </div>
                <button onClick={() => setIsTimerModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
                   <X size={20} />
                </button>
             </div>
             
             {/* Timer Display */}
             <div className="text-center py-8">
                <div className="text-4xl font-mono font-semibold text-gray-900 tracking-wider">
                   00h : 00m : 00s
                </div>
             </div>

             {/* Modal Body */}
             <div className="px-6 pb-6 space-y-4">
                <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                   <Link size={14}/> Associate Project
                </button>
                
                <div className="space-y-1.5">
                   <label className="text-sm text-gray-700">Notes</label>
                   <textarea 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                      placeholder="Add notes"
                      value={timerNote}
                      onChange={(e) => setTimerNote(e.target.value)}
                   />
                </div>
             </div>

             {/* Modal Footer */}
             <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                <button onClick={() => setIsTimerModalOpen(false)} className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                   Start Timer
                </button>
                <button onClick={() => setIsTimerModalOpen(false)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                   Cancel
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.projectName}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;