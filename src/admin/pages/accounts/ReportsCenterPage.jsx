import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, Star, Share2, User, Clock, Search, Plus, MoreHorizontal,
  Folder, ChevronRight, ChevronDown, Download, Printer, RotateCcw,
  X, Filter, FileText, Settings, Play, ArrowRight, BarChart2,
  FilePlus, Shield, Info, Menu
} from "lucide-react";
import { reportsCategories, allReports, pnlData } from "../../utils/reportsData";

const ReportsCenterPage = () => {
  const navigate = useNavigate();

  // Sidebar State
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Modals & Views
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [reportViewMode, setReportViewMode] = useState("Table"); // "Table" | "Chart"
  
  // Create Report Modal State
  const [creationMode, setCreationMode] = useState("existing"); // "existing" | "scratch"
  const [selectedBaseReport, setSelectedBaseReport] = useState("");

  // Filter/Search
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic
  const filteredReports = allReports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === "All Reports") return matchesSearch;
    if (selectedCategory === "Favorites") return matchesSearch && report.isFavorite;
    return matchesSearch && report.category === selectedCategory;
  });

  // --- RENDER: REPORT VIEW (Image 2 & 3) ---
  if (isViewingReport) {
    return (
      <div className="bg-white min-h-screen relative flex flex-col font-sans">
        
        {/* Report Header */}
        <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 bg-gray-50 gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsViewingReport(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded border border-gray-300">
              <FileText size={20} />
            </button>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Business Overview</p>
              <h1 className="text-base md:text-lg font-medium text-gray-800 flex flex-wrap items-center gap-2">
                Profit and Loss <span className="text-gray-400 font-normal text-xs md:text-sm">• From 01/10/2026 To 31/10/2026</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"><Share2 size={16} /></button>
             <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"><Printer size={16} /></button>
             <div className="flex rounded border border-gray-300 overflow-hidden bg-white">
               <button className="px-3 py-1.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-1">Export <ChevronDown size={14}/></button>
             </div>
             <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600"><RotateCcw size={16} /></button>
             <button onClick={() => setIsViewingReport(false)} className="p-1.5 border border-gray-300 rounded hover:bg-red-50 text-red-500 ml-auto md:ml-0"><X size={16} /></button>
          </div>
        </div>

        {/* Report Filters */}
        <div className="px-4 md:px-6 py-2 flex flex-wrap items-center gap-2 md:gap-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-600 w-full md:w-auto">
            <Filter size={16} /> Filters :
          </div>
          <button className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-50">Date Range : This Month <ChevronDown size={14}/></button>
          <button className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-50">Report Basis : Accrual <ChevronDown size={14}/></button>
          <button className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-50"><Plus size={14}/> More Filters</button>
          
          <div className="ml-auto flex items-center gap-2">
             <div className="flex rounded border border-blue-500 overflow-hidden bg-blue-50">
               <button className="px-4 py-1.5 text-sm font-medium text-blue-700">Run Report</button>
               <button className="px-2 py-1.5 border-l border-blue-300 text-blue-700"><ChevronDown size={14}/></button>
             </div>
          </div>
        </div>

        {/* View Toggle & Report Content */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="flex gap-4 border-b border-gray-200">
              <button onClick={() => setReportViewMode("Table")} className={`pb-2 text-sm font-medium border-b-2 ${reportViewMode === "Table" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Table View</button>
              <button onClick={() => setReportViewMode("Chart")} className={`pb-2 text-sm font-medium border-b-2 ${reportViewMode === "Chart" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Chart View</button>
            </div>
            <div className="flex items-center gap-2 md:gap-4 text-sm text-gray-600 flex-wrap">
              <button className="flex items-center gap-1 border border-gray-300 px-2 md:px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-xs md:text-sm">Compare With : None <ChevronDown size={14}/></button>
              <button className="flex items-center gap-1 border border-gray-300 px-2 md:px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-xs md:text-sm">Customize Columns <span className="bg-blue-100 text-blue-600 px-1.5 rounded text-xs font-bold">2</span></button>
              <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50"><Settings size={16}/></button>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">Fidha</p>
            <h2 className="text-xl font-medium text-gray-900 mt-1">Profit and Loss</h2>
            <p className="text-sm text-gray-500 mt-1">Basis : Accrual</p>
            <p className="text-sm text-gray-500 mt-1">From 01/10/2026 To 31/10/2026</p>
          </div>

          {reportViewMode === "Table" ? (
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2">ACCOUNT</th>
                    <th className="px-4 py-2 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pnlData.map((section, idx) => (
                    <React.Fragment key={idx}>
                      <tr className={section.isTotalRow ? "font-bold bg-gray-50/30" : ""}>
                        <td className="px-4 py-3 text-gray-800">{section.section}</td>
                        <td className="px-4 py-3 text-right text-gray-800">{section.total !== 0 || section.isTotalRow ? section.total.toFixed(2) : ""}</td>
                      </tr>
                      {section.items.map((item, i) => (
                        <tr key={i} className="hover:bg-blue-50/30">
                          <td className="px-6 md:px-8 py-2 text-blue-600 hover:underline cursor-pointer">{item.name}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      {section.items.length > 0 && (
                        <tr className="bg-gray-50/50">
                          <td className="px-4 py-2 text-gray-800 font-medium">Total for {section.section}</td>
                          <td className="px-4 py-2 text-right text-gray-800 font-medium">{section.total.toFixed(2)}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto border border-gray-200 rounded-lg bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b border-gray-200 gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <button className="flex items-center gap-1 text-sm text-gray-700">X-axis : <span className="font-semibold">Project</span> <ChevronDown size={14}/></button>
                  <button className="flex items-center gap-1 text-sm text-gray-700">Y-axis : <span className="font-semibold">Cost of Goods Sold</span> <ChevronDown size={14}/></button>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Play size={12}/> Set target</button>
                  <button className="flex items-center gap-1 text-sm text-gray-700"><BarChart2 size={14}/> Bar Chart <ChevronDown size={14}/></button>
                </div>
              </div>
              
              <div className="h-64 md:h-96 p-4 md:p-6 relative">
                <div className="absolute left-2 md:left-10 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pb-12 pt-8">
                   <span>4 K</span><span>3 K</span><span>2 K</span><span>1 K</span><span>0</span>
                </div>
                <div className="ml-8 md:ml-12 h-full flex items-end justify-around border-b border-l border-gray-200 pb-2">
                   <div className="flex flex-col items-center w-full">
                      <div className="w-12 md:w-16 bg-blue-600 h-[70%] rounded-t hover:opacity-80 transition-opacity relative group cursor-pointer">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">4,222.00</div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs text-gray-800 font-medium">Project</p>
                        <p className="text-[10px] text-gray-500">Not mentioned</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN REPORTS PAGE (Image 1, 4, 5) ---
  return (
    <div className="bg-[#F8F9FA] min-h-screen relative flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="md:hidden p-1.5 border border-gray-300 rounded text-gray-600">
            <Menu size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-medium text-gray-800 flex-1">Reports Center</h1>
          <div className="flex items-center gap-2 md:hidden">
             <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap">
               + New
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:max-w-2xl">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search reports" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm font-medium rounded">
            Create New Report
          </button>
          <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 flex flex-col shrink-0 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-4">
            <h2 className="text-lg font-medium text-gray-800">Menu</h2>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1 mb-8">
            {[
              { name: "Home", icon: Home },
              { name: "Favorites", icon: Star },
              { name: "Shared Reports", icon: Share2 },
              { name: "My Reports", icon: User },
              { name: "Scheduled Reports", icon: Clock },
            ].map(item => (
              <button 
                key={item.name} 
                onClick={() => { setActiveTab(item.name); setIsMobileSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.name ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <item.icon size={16} className={activeTab === item.name ? 'text-blue-600' : 'text-gray-400'} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Category</div>
          <div className="space-y-0.5">
            <button onClick={() => { setActiveTab("Home"); setSelectedCategory("All Reports"); setIsMobileSidebarOpen(false); }} className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === "All Reports" ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              All Reports
              <span className="bg-gray-200 text-gray-600 text-xs px-2 rounded-full font-medium">{allReports.length}</span>
            </button>
            {reportsCategories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => { setActiveTab("Home"); setSelectedCategory(cat.name); setIsMobileSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Folder size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          
          {/* Home / All Reports List */}
          {activeTab === "Home" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-medium text-gray-800">
                  {selectedCategory} 
                  {selectedCategory === "All Reports" && <span className="ml-2 text-sm text-gray-500 font-normal">{filteredReports.length}</span>}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 md:px-6 py-3">Report Name</th>
                      <th className="px-4 py-3">Report Category</th>
                      <th className="px-4 py-3">Created By</th>
                      <th className="px-4 py-3">Last Visited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-blue-50/50 cursor-pointer group" onClick={() => setIsViewingReport(true)}>
                        <td className="px-4 md:px-6 py-3 font-medium text-blue-600 group-hover:underline flex items-center gap-2">
                          <button className="text-gray-300 hover:text-yellow-400" onClick={(e) => e.stopPropagation()}>
                            <Star size={14} fill={report.isFavorite ? "currentColor" : "none"} className={report.isFavorite ? "text-yellow-400" : ""} />
                          </button>
                          {report.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{report.category}</td>
                        <td className="px-4 py-3 text-gray-600">{report.createdBy}</td>
                        <td className="px-4 py-3 text-gray-500">{report.lastVisited}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State for Favorites, Shared, My Reports, Scheduled (Images 4, 5) */}
          {["Favorites", "Shared Reports", "My Reports", "Scheduled Reports"].includes(activeTab) && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[60vh] md:h-[70vh] flex flex-col items-center justify-center p-6">
               
               {/* Dynamic Empty Graphic */}
               <div className="w-24 h-24 md:w-32 md:h-32 mb-6 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-50 rounded-full opacity-50"></div>
                  {activeTab === "Favorites" && <Star size={40} className="text-blue-300 relative z-10 md:w-12 md:h-12" />}
                  {activeTab === "Shared Reports" && <Share2 size={40} className="text-blue-300 relative z-10 md:w-12 md:h-12" />}
                  {activeTab === "My Reports" && <FileText size={40} className="text-blue-300 relative z-10 md:w-12 md:h-12" />}
                  {activeTab === "Scheduled Reports" && <Clock size={40} className="text-blue-300 relative z-10 md:w-12 md:h-12" />}
               </div>

               <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 text-center px-4">
                  {activeTab === "Favorites" && "You haven't marked any reports as a favorite."}
                  {activeTab === "Shared Reports" && "Currently, you don't have any shared reports."}
                  {activeTab === "My Reports" && "You haven't created any custom reports yet."}
                  {activeTab === "Scheduled Reports" && "You don't have any scheduled reports yet."}
               </h3>
               <p className="text-gray-500 text-sm mb-6 max-w-md text-center px-4">
                  {activeTab === "Favorites" && "Click the Star icon next to a report to view it here."}
                  {activeTab === "Shared Reports" && "If someone shares a custom report with you, you will be able to view it here."}
                  {activeTab === "My Reports" && "Create a custom report by customizing an existing report."}
                  {activeTab === "Scheduled Reports" && "Schedule reports to be sent to your email automatically."}
               </p>

               {activeTab === "My Reports" && (
                  <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium">
                     Create New Report
                  </button>
               )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM REPORT MODAL (Image 6) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex justify-center items-start pt-10 md:pt-16 px-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in border border-gray-200 my-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-normal text-gray-800">Create Custom Report</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 md:p-6 space-y-6">
              <p className="text-sm text-gray-700 font-medium">Choose how you would like to create the report</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Option 1: Existing */}
                 <div 
                    onClick={() => setCreationMode("existing")}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${creationMode === "existing" ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"}`}
                 >
                    <div className="flex items-start gap-3">
                       <input type="radio" checked={creationMode === "existing"} onChange={() => setCreationMode("existing")} className="mt-1 text-blue-600 focus:ring-blue-500" />
                       <div>
                          <h3 className="text-sm font-medium text-gray-900">Create from existing report</h3>
                          <p className="text-xs text-gray-500 mt-1">Start with an existing report and customize it by applying filters, modifying columns, adjusting layouts, grouping data, and more.</p>
                       </div>
                    </div>
                 </div>

                 {/* Option 2: Scratch */}
                 <div 
                    onClick={() => setCreationMode("scratch")}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${creationMode === "scratch" ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"}`}
                 >
                    <div className="flex items-start gap-3">
                       <input type="radio" checked={creationMode === "scratch"} onChange={() => setCreationMode("scratch")} className="mt-1 text-blue-600 focus:ring-blue-500" />
                       <div>
                          <h3 className="text-sm font-medium text-gray-900">Create an entirely new report</h3>
                          <p className="text-xs text-gray-500 mt-1">Build reports from scratch using modules by custom report builder, and apply filters to display the required data.</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Select Base Report Dropdown */}
              {creationMode === "existing" && (
                 <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select a Report</label>
                    <select 
                       className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                       value={selectedBaseReport}
                       onChange={(e) => setSelectedBaseReport(e.target.value)}
                    >
                       <option value="">Select a Report</option>
                       {allReports.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                       ))}
                    </select>
                 </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button 
                 onClick={() => { setIsCreateModalOpen(false); }}
                 disabled={creationMode === "existing" && !selectedBaseReport}
                 className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Proceed
              </button>
              <button 
                 onClick={() => setIsCreateModalOpen(false)} 
                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ReportsCenterPage;