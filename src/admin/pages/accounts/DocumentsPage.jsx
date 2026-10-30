import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFolder } from "../../store/slices/accounts/documentsSlice";
import { 
  ChevronLeft, FileText, Folder, Trash, Plus, 
  ScanLine, UploadCloud, Mail, CloudUpload, FilePlus, 
  FolderPlus, Search, Copy, Edit2, X, Info, 
  RefreshCw, HelpCircle, ArrowRight, ShieldCheck,
  ChevronDown, Menu
} from "lucide-react";

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white";

const DocumentsPage = () => {
  const dispatch = useDispatch();
  const { folders, documents } = useSelector((state) => state.documents);

  // View State
  const [activeView, setActiveView] = useState("all-documents");
  const [activeFolder, setActiveFolder] = useState(null);
  
  // Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Sidebar Mobile Toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    dispatch(addFolder(folderName));
    setFolderName("");
    setIsFolderModalOpen(false);
  };

  const handleFolderClick = (folder) => {
    setActiveFolder(folder);
    setActiveView("folder");
    setIsMobileSidebarOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* Flex Container for Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-[40] md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-[50] md:z-auto
          w-64 bg-[#F8F9FA] border-r border-gray-200 flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-2xl font-normal text-gray-900">Documents</h1>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2 mb-6">
              <button 
                onClick={() => { setActiveView("all-documents"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "all-documents" ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FileText size={16} className={activeView === "all-documents" ? 'text-white' : 'text-gray-500'} /> All Documents
              </button>
            </nav>

            <div className="px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inboxes</div>
            <nav className="space-y-1 px-2 mb-6">
              <button 
                onClick={() => { setActiveView("files"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "files" ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={16} className={activeView === "files" ? 'text-white' : 'text-gray-500'} /> Files
                </div>
                {activeView !== "files" && <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">1</div>}
              </button>
              <button 
                onClick={() => { setActiveView("bank-statements"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "bank-statements" ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FileText size={16} className={activeView === "bank-statements" ? 'text-white' : 'text-gray-500'} /> Bank Statements
              </button>
            </nav>

            <div className="px-5 flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</span>
              <button onClick={() => setIsFolderModalOpen(true)} className="text-gray-500 hover:text-gray-800"><Plus size={16} /></button>
            </div>
            <div className="px-5 space-y-2 mb-8">
              {folders.length === 0 ? (
                <div className="text-sm text-gray-500">
                  <p className="mb-2">There are no folders.</p>
                  <button onClick={() => setIsFolderModalOpen(true)} className="text-blue-600 hover:underline">Create New Folder</button>
                </div>
              ) : (
                folders.map(folder => (
                  <button 
                    key={folder.id} 
                    onClick={() => handleFolderClick(folder)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "folder" && activeFolder?.id === folder.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Folder size={16} className={activeView === "folder" && activeFolder?.id === folder.id ? 'text-white' : 'text-gray-500'} /> {folder.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Trash size={16} className="text-gray-500" /> Trash
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
          
          {/* Header */}
          <div className="px-4 md:px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden p-1.5 border border-gray-300 rounded text-gray-600 shrink-0">
                <Menu size={20} />
              </button>
              <h2 className="text-base md:text-lg font-medium text-gray-900 truncate">
                {activeView === "all-documents" && "All Documents"}
                {activeView === "files" && "Files"}
                {activeView === "bank-statements" && "Bank Statements"}
                {activeView === "folder" && activeFolder?.name}
              </h2>
            </div>
            
            {(activeView !== "all-documents") && (
              <div className="flex items-center gap-2 shrink-0">
                {activeView === "files" && (
                   <div className="hidden md:flex bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md items-center gap-2 text-sm font-medium mr-2">
                      <ScanLine size={16}/> Available Autoscans: 50 / 50
                   </div>
                )}
                <div className="flex rounded border border-blue-500 overflow-hidden">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium whitespace-nowrap">
                    Upload File
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 border-l border-blue-400">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            
            {/* VIEW: ALL DOCUMENTS */}
            {activeView === "all-documents" && (
              <>
                <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Filter By :</span>
                  <span className="font-medium text-gray-800">File Type: All</span>
                  <button className="text-blue-600"><ChevronDown size={14}/></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                    <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 md:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></th>
                        <th className="px-4 py-3">FILE NAME</th>
                        <th className="px-4 py-3">UPLOADED BY</th>
                        <th className="px-4 py-3">UPLOADED ON</th>
                        <th className="px-4 py-3">ASSOCIATED TO</th>
                        <th className="px-4 py-3">FOLDER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer group">
                          <td className="px-4 md:px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                          <td className="px-4 py-4">
                             <div className="flex items-start gap-3">
                                <FileText size={20} className="text-red-500 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                   <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                                   {doc.status && (
                                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-xs rounded">
                                         <ScanLine size={12}/> {doc.status}
                                      </div>
                                   )}
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{doc.uploadedBy}</td>
                          <td className="px-4 py-4 text-gray-600">{doc.uploadedAt}</td>
                          <td className="px-4 py-4 text-gray-500">{doc.associatedTo || "-"}</td>
                          <td className="px-4 py-4 text-gray-500">{doc.folder || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VIEW: FOLDER */}
            {activeView === "folder" && (
              <>
                <div className="px-4 md:px-6 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
                  <div className="relative w-full max-w-xs md:w-64">
                     <input 
                       type="text" 
                       placeholder="Type a folder name" 
                       className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white pr-10"
                     />
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                       <X size={16}/>
                     </button>
                  </div>
                  <button className="hidden md:flex text-gray-600 hover:text-blue-600 items-center gap-1 text-sm font-medium shrink-0">
                    <Search size={16}/> Search
                  </button>
                </div>

                <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Filter By :</span>
                  <span className="font-medium text-gray-800">File Type: All</span>
                  <button className="text-blue-600"><ChevronDown size={14}/></button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
                    <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 md:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></th>
                        <th className="px-4 py-3">FILE NAME</th>
                        <th className="px-4 py-3">UPLOADED BY</th>
                        <th className="px-4 py-3">UPLOADED ON</th>
                        <th className="px-4 py-3">ASSOCIATED TO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {documents.filter(d => d.folder === activeFolder?.name).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-24 text-center text-gray-500 text-base">
                            No documents have been added
                          </td>
                        </tr>
                      ) : (
                        documents.filter(d => d.folder === activeFolder?.name).map(doc => (
                          <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer group">
                            <td className="px-4 md:px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600" /></td>
                            <td className="px-4 py-4">
                               <div className="flex items-start gap-3">
                                  <FileText size={20} className="text-red-500 mt-0.5 shrink-0" />
                                  <div>
                                     <p className="font-medium text-gray-800">{doc.name}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{doc.uploadedBy}</td>
                            <td className="px-4 py-4 text-gray-600">{doc.uploadedAt}</td>
                            <td className="px-4 py-4 text-gray-500">{doc.associatedTo || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VIEW: FILES */}
            {activeView === "files" && (
              <div className="p-4 md:p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4 flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded border border-blue-200 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-blue-500 md:w-6 md:h-6" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">Your plan now includes autoscan credits</h3>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">Along with expenses, your plan now includes autoscan credits for bills, documents, and email forwarding. Need more? You can purchase additional credits anytime.</p>
                   </div>
                   <button className="text-gray-400 hover:text-gray-700 shrink-0"><X size={18}/></button>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 md:py-20 px-4 md:px-6 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/30'}`}
                >
                   <div className="w-20 h-16 md:w-24 md:h-20 mb-4 relative">
                      <div className="absolute inset-0 flex items-end justify-center gap-1">
                         <CloudUpload size={40} className="text-orange-400 fill-orange-100 md:w-12 md:h-12" />
                      </div>
                   </div>
                   <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 text-center">Drag & Drop Files Here</h3>
                   <p className="text-xs md:text-sm text-gray-600 mb-6 text-center">Upload your documents (Images, PDF, Docs or Sheets) here</p>
                   
                   <input type="file" ref={fileInputRef} className="hidden" multiple />
                   <button onClick={() => fileInputRef.current.click()} className="bg-blue-500 hover:bg-blue-600 text-white px-5 md:px-6 py-2 rounded font-medium text-sm transition-colors">
                      Choose files to upload
                   </button>

                   <div className="mt-10 md:mt-16 w-full max-w-md bg-gray-100 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4">
                      <Mail size={20} className="text-purple-600 shrink-0 md:w-6 md:h-6" />
                      <div className="flex-1 min-w-0">
                         <p className="text-xs md:text-sm font-medium text-gray-900">Send your document(s) to</p>
                         <p className="text-[10px] md:text-xs text-blue-600 truncate">fidha.ybcu0wck_khwbk0hs@inbox.zohoreceipts.in</p>
                      </div>
                   </div>
                </div>

                <div className="mt-12 md:mt-20">
                   <h2 className="text-center text-lg md:text-xl font-medium text-gray-900 mb-8 md:mb-12">Key Features of Document</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center max-w-5xl mx-auto">
                      <div>
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-blue-500"><ScanLine size={24} className="md:w-7 md:h-7"/></div>
                         <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Auto scan</h3>
                         <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">Enable auto-scan to automatically capture data</p>
                      </div>
                      <div>
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-blue-500"><Mail size={24} className="md:w-7 md:h-7"/></div>
                         <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Mail-In</h3>
                         <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">Have your clients directly mail documents to your account</p>
                      </div>
                      <div>
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-blue-500"><FilePlus size={24} className="md:w-7 md:h-7"/></div>
                         <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Convert</h3>
                         <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">Convert scanned documents into transactions</p>
                      </div>
                      <div>
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-blue-500"><FolderPlus size={24} className="md:w-7 md:h-7"/></div>
                         <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Organize</h3>
                         <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed">Create folders to manage and organize your files</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* VIEW: BANK STATEMENTS */}
            {activeView === "bank-statements" && (
              <div className="p-4 md:p-6">
                <div className="border border-gray-200 rounded-lg p-6 md:p-10 flex flex-col items-center text-center mb-8 md:mb-12 max-w-3xl mx-auto bg-white">
                   <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-6 md:mb-8">Auto-upload your bank statements from email</h2>
                   
                   <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-4 mb-6 md:mb-8 w-full max-w-lg">
                      <div className="flex flex-col items-center flex-1">
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2"><RefreshCw size={24} className="text-orange-600 md:w-7 md:h-7"/></div>
                         <p className="text-xs md:text-sm text-gray-700 text-center">1. Set up auto-forwarding in your email</p>
                      </div>
                      <div className="hidden md:block flex-1 border-t-2 border-dashed border-gray-300 mt-[-20px]"></div>
                      <div className="flex flex-col items-center flex-1">
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2"><FilePlus size={24} className="text-orange-600 md:w-7 md:h-7"/></div>
                         <p className="text-xs md:text-sm text-gray-700 text-center">2. Add Statements to Bank</p>
                      </div>
                   </div>

                   <div className="bg-gray-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 w-full max-w-lg mb-4">
                      <Mail size={14} className="text-gray-500 shrink-0" />
                      <span className="text-[10px] md:text-sm text-gray-700 truncate flex-1 font-mono">fidha.nhiu3li4_l2itnsvu4.secure@inbox.zohorec...</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs md:text-sm text-blue-600 font-medium">
                      <button className="hover:underline flex items-center gap-1"><Copy size={14}/> Copy</button>
                      <button className="hover:underline flex items-center gap-1"><Edit2 size={14}/> Edit</button>
                   </div>

                   <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100 w-full">
                      <p className="text-xs md:text-sm text-blue-600 cursor-pointer mb-4 hover:underline">How do I auto-forward bank statements?</p>
                      <div className="flex justify-center gap-4">
                         <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"><Mail size={16} className="text-blue-500"/></div>
                         <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"><Mail size={16} className="text-red-500"/></div>
                         <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"><Mail size={16} className="text-blue-400"/></div>
                      </div>
                   </div>
                </div>

                <div className="text-center max-w-4xl mx-auto overflow-x-auto">
                   <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-6 md:mb-8">How does Bank Statements Inbox work?</h2>
                   
                   <div className="min-w-[600px] pb-4">
                      <div className="flex items-center justify-center gap-2 md:gap-4">
                         <div className="w-40 md:w-48 border border-blue-200 rounded p-2 md:p-3 flex items-center gap-2 text-[10px] md:text-xs text-gray-700">
                            <RefreshCw size={14} className="text-blue-500 shrink-0"/> Auto-Forward Bank Statements
                         </div>
                         <div className="border-t-2 border-dashed border-blue-300 w-6 md:w-12"></div>
                         <div className="w-56 md:w-64 bg-blue-50 border border-blue-300 rounded p-2 text-left">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-blue-800 mb-2"><FileText size={12}/> Bank Statements</div>
                            <div className="bg-white border border-gray-200 rounded p-1 space-y-1">
                               <div className="flex text-[8px] text-gray-500 font-semibold border-b border-gray-100 pb-1 mb-1">
                                  <div className="w-1/2">FILE NAME</div><div className="w-1/4">UPLOADED BY</div><div className="w-1/4">SUGGESTED BANK</div>
                               </div>
                               <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                               <div className="h-2 bg-gray-100 rounded w-5/6 mb-1"></div>
                            </div>
                         </div>
                         <div className="border-t-2 border-dashed border-blue-300 w-6 md:w-12"></div>
                         <div className="w-28 md:w-32 border border-blue-200 rounded p-2 md:p-3 flex items-center gap-2 text-[10px] md:text-xs text-gray-700">
                            <ShieldCheck size={14} className="text-green-500 shrink-0"/> Add to Bank
                         </div>
                      </div>
                      <div className="mt-4 ml-24 md:ml-32">
                         <div className="w-40 md:w-48 border border-blue-200 rounded p-2 md:p-3 flex items-center gap-2 text-[10px] md:text-xs text-gray-700">
                            <UploadCloud size={14} className="text-blue-500 shrink-0"/> Upload Bank Statements Manually
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* NEW FOLDER MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex justify-center items-start pt-10 md:pt-16 px-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in border border-gray-200 my-8">
            
            <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-normal text-gray-800">New Folder</h2>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="p-4 md:p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm text-red-500 font-medium">Folder Name*</label>
                <input 
                  type="text" 
                  className={inputCls} 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                 <label className="text-sm text-red-500 font-medium">Folder Permissions*</label>
                 <div className="space-y-2">
                    <label className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                       <input type="radio" name="permission" defaultChecked className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0" />
                       All users with permission to access documents.
                    </label>
                    <label className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                       <input type="radio" name="permission" className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0" />
                       Custom
                    </label>
                 </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-start gap-2">
                 <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-xs text-gray-700">
                    By default, this folder is visible to all admins in Zoho Books.
                 </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={!folderName.trim()} 
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsFolderModalOpen(false)} 
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
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

export default DocumentsPage;