// src/admin/pages/accounts/DocumentsPage.jsx
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFolder } from "../../store/slices/accounts/documentsSlice";
import {
  FileText, Folder, Trash, Plus, ScanLine, UploadCloud, Mail,
  CloudUpload, FilePlus, FolderPlus, Search, Copy, Edit2, X, Info,
  RefreshCw, ShieldCheck, ChevronDown, Menu, FolderOpen,
} from "lucide-react";

/* ---------- primitives ---------- */

const GhostBtn = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

/* ---------- page ---------- */

const DocumentsPage = () => {
  const dispatch = useDispatch();
  const { folders, documents } = useSelector((state) => state.documents);

  const [activeView, setActiveView] = useState("all-documents");
  const [activeFolder, setActiveFolder] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); };

  const title =
    activeView === "all-documents"
      ? "All documents"
      : activeView === "files"
      ? "Files"
      : activeView === "bank-statements"
      ? "Bank statements"
      : activeFolder?.name;

  /* Sidebar nav item */
  const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-full text-xs md:text-[12.5px] font-medium transition-colors ${
        active
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      <span className="inline-flex items-center gap-2.5 min-w-0">
        <Icon
          size={14}
          className={active ? "text-green-600 dark:text-green-400" : "text-gray-400"}
        />
        <span className="truncate">{label}</span>
      </span>
      {badge != null && !active && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-semibold flex items-center justify-center tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );

  const FileRow = ({ doc, showFolder }) => (
    <tr className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-3 md:px-4 py-2 md:py-3">
        <input
          type="checkbox"
          className="rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400"
          aria-label={`Select ${doc.name}`}
        />
      </td>
      <td className="px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
            <FileText size={15} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {doc.name}
            </p>
            {doc.status && (
              <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-medium uppercase tracking-wider">
                <ScanLine size={10} /> {doc.status}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{doc.uploadedBy}</td>
      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">{doc.uploadedAt}</td>
      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500">{doc.associatedTo || "—"}</td>
      {showFolder && (
        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500">{doc.folder || "—"}</td>
      )}
    </tr>
  );

  return (
    <div className="w-full overflow-x-hidden flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[1px] z-[40] md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ---- Sidebar ---- */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-[50] md:z-auto
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            flex flex-col shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Workspace
              </p>
              <h2 className="text-lg font-bold gradient-heading bg-clip-text text-transparent mt-0.5">
                Documents
              </h2>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">

            <nav className="space-y-0.5 mb-5">
              <NavItem
                icon={FileText}
                label="All documents"
                active={activeView === "all-documents"}
                onClick={() => { setActiveView("all-documents"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
              />
            </nav>

            <SectionLabel>Inboxes</SectionLabel>
            <nav className="space-y-0.5 mb-5">
              <NavItem
                icon={Folder}
                label="Files"
                active={activeView === "files"}
                badge={1}
                onClick={() => { setActiveView("files"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
              />
              <NavItem
                icon={FileText}
                label="Bank statements"
                active={activeView === "bank-statements"}
                onClick={() => { setActiveView("bank-statements"); setActiveFolder(null); setIsMobileSidebarOpen(false); }}
              />
            </nav>

            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Folders
              </span>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                aria-label="New folder"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="space-y-0.5 mb-6">
              {folders.length === 0 ? (
                <div className="px-2.5 py-3 text-xs text-gray-500">
                  <p className="mb-2">No folders yet.</p>
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                  >
                    Create new folder
                  </button>
                </div>
              ) : (
                folders.map((folder) => {
                  const active = activeView === "folder" && activeFolder?.id === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs md:text-[12.5px] font-medium transition-colors ${
                        active
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <Folder
                        size={14}
                        className={active ? "text-green-600 dark:text-green-400" : "text-gray-400"}
                      />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <NavItem icon={Trash} label="Trash" onClick={() => {}} />
          </div>
        </aside>

        {/* ---- Main ---- */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">

          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                  aria-label="Open menu"
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </p>
                  <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent truncate mt-0.5">
                    {title}
                  </h2>
                </div>
              </div>

              {activeView !== "all-documents" && (
                <div className="flex items-center gap-2 shrink-0">
                  {activeView === "files" && (
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tabular-nums">
                      <ScanLine size={12} /> Autoscans: 50 / 50
                    </span>
                  )}
                  <div className="inline-flex items-stretch rounded-full overflow-hidden">
                    <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all">
                      Upload file
                    </button>
                    <button
                      className="inline-flex items-center px-2 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 border-l border-white/20 transition-all"
                      aria-label="More upload options"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">

            {/* ---- VIEW: ALL DOCUMENTS ---- */}
            {activeView === "all-documents" && (
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Filter
                  </span>
                  <GhostBtn className="border border-gray-200 dark:border-gray-700">
                    File type: All <ChevronDown size={13} />
                  </GhostBtn>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[900px] lg:min-w-0">
                    <table className="w-full border-collapse text-xs md:text-[12.5px]">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                          <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">File name</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded by</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded on</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Associated to</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Folder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-xs md:text-[13px] text-gray-500">
                              No documents uploaded yet
                            </td>
                          </tr>
                        ) : (
                          documents.map((doc) => <FileRow key={doc.id} doc={doc} showFolder />)
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

            {/* ---- VIEW: FOLDER ---- */}
            {activeView === "folder" && (
              <div className="space-y-4">
                <Card className="px-4 sm:px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-full max-w-xs">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search in folder…"
                        className="w-full pl-9 pr-9 py-1.5 text-xs md:text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <GhostBtn className="border border-gray-200 dark:border-gray-700 ml-auto">
                      File type: All <ChevronDown size={13} />
                    </GhostBtn>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[700px] lg:min-w-0">
                      <table className="w-full border-collapse text-xs md:text-[12.5px]">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="w-10 px-4 sm:px-5 py-2 md:py-3"></th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">File name</th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded by</th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded on</th>
                            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Associated to</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.filter((d) => d.folder === activeFolder?.name).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-16">
                                <div className="max-w-md mx-auto text-center">
                                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <FolderOpen size={22} className="text-gray-400" />
                                  </div>
                                  <p className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-gray-100">
                                    No documents in this folder
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Upload a file or drag documents here to populate this folder.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            documents
                              .filter((d) => d.folder === activeFolder?.name)
                              .map((doc) => <FileRow key={doc.id} doc={doc} />)
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ---- VIEW: FILES ---- */}
            {activeView === "files" && (
              <div className="space-y-4">
                {/* Banner */}
                <Card className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Your plan now includes autoscan credits
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Along with expenses, your plan now includes autoscan credits for bills,
                        documents, and email forwarding. Need more? Purchase additional credits anytime.
                      </p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors" aria-label="Dismiss">
                      <X size={16} />
                    </button>
                  </div>
                </Card>

                {/* Drop zone */}
                <Card
                  className={`py-12 sm:py-16 px-4 transition-colors ${
                    isDragging
                      ? "border-green-400 bg-green-50/40 dark:bg-green-900/10"
                      : ""
                  }`}
                >
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`max-w-lg mx-auto text-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                      isDragging
                        ? "border-green-400 bg-white dark:bg-gray-800"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <CloudUpload size={22} className="text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Drag & drop files here
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 mb-5">
                      Upload images, PDFs, docs or sheets
                    </p>

                    <input type="file" ref={fileInputRef} className="hidden" multiple />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      Choose files to upload
                    </button>

                    <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-left">
                      <Mail size={14} className="text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
                          Send documents to
                        </p>
                        <p className="text-[11px] text-gray-500 truncate font-mono">
                          fidha.ybcu0wck_khwbk0hs@inbox.zohoreceipts.in
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Features */}
                <Card className="px-5 py-6">
                  <SectionLabel>Key features</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {[
                      { icon: ScanLine, title: "Auto scan", body: "Automatically capture data from documents" },
                      { icon: Mail, title: "Mail-in", body: "Clients can mail documents directly to your account" },
                      { icon: FilePlus, title: "Convert", body: "Turn scanned documents into transactions" },
                      { icon: FolderPlus, title: "Organize", body: "Create folders to manage your files" },
                    ].map((f) => (
                      <div
                        key={f.title}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                          <f.icon size={16} />
                        </div>
                        <h3 className="text-xs md:text-[12.5px] font-semibold text-gray-800 dark:text-gray-100">
                          {f.title}
                        </h3>
                        <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">{f.body}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ---- VIEW: BANK STATEMENTS ---- */}
            {activeView === "bank-statements" && (
              <div className="space-y-4">

                {/* Setup card */}
                <Card className="px-5 py-6 max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                      Setup
                    </p>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-1">
                      Auto-upload bank statements from email
                    </h2>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                    {[
                      { icon: RefreshCw, label: "1. Set up auto-forwarding in your email" },
                      { icon: FilePlus, label: "2. Add statements to bank" },
                    ].map((s, i) => (
                      <React.Fragment key={s.label}>
                        <div className="flex flex-col items-center flex-1 max-w-[220px]">
                          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-2">
                            <s.icon size={16} />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                            {s.label}
                          </p>
                        </div>
                        {i === 0 && (
                          <div className="hidden md:block w-10 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-2 max-w-lg mx-auto mb-3">
                    <Mail size={13} className="text-gray-500 shrink-0" />
                    <span className="text-[11.5px] text-gray-700 dark:text-gray-200 truncate flex-1 font-mono">
                      fidha.nhiu3li4_l2itnsvu4.secure@inbox.zohorec...
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <GhostBtn className="text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      <Copy size={12} /> Copy
                    </GhostBtn>
                    <GhostBtn className="text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      <Edit2 size={12} /> Edit
                    </GhostBtn>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button className="text-xs text-green-600 dark:text-green-400 hover:underline mb-3 font-medium">
                      How do I auto-forward bank statements?
                    </button>
                    <div className="flex justify-center gap-2">
                      {[Mail, Mail, Mail].map((Icon, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500"
                        >
                          <Icon size={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Flow */}
                <Card className="px-5 py-6 max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                      How it works
                    </p>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-1">
                      Bank statement inbox
                    </h2>
                  </div>

                  <div className="min-w-[600px] overflow-x-auto pb-2">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-40 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
                        <RefreshCw size={13} className="text-gray-400 shrink-0" /> Auto-forward bank statements
                      </div>
                      <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 w-8" />
                      <div className="w-56 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                          <FileText size={11} /> Bank statements
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1">
                          <div className="flex text-[8.5px] text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">
                            <div className="w-1/2">File name</div>
                            <div className="w-1/4">By</div>
                            <div className="w-1/4">Bank</div>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-full mb-1" />
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                      </div>
                      <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 w-8" />
                      <div className="w-28 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
                        <ShieldCheck size={13} className="text-green-500 shrink-0" /> Add to bank
                      </div>
                    </div>

                    <div className="mt-4 ml-24">
                      <div className="w-44 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
                        <UploadCloud size={13} className="text-gray-400 shrink-0" /> Upload bank statements manually
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---- NEW FOLDER MODAL ---- */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight mt-0.5">
                  Create folder
                </h2>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateFolder}>
              <div className="px-5 py-5 space-y-4">

                <Field label="Folder name" required>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    autoFocus
                  />
                </Field>

                <Field label="Folder permissions" required>
                  <div className="space-y-2 pt-1">
                    {[
                      "All users with permission to access documents",
                      "Custom",
                    ].map((label, i) => (
                      <label
                        key={label}
                        className="flex items-start gap-2 text-xs md:text-[12.5px] text-gray-700 dark:text-gray-200 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="permission"
                          defaultChecked={i === 0}
                          className="mt-0.5 text-green-500 focus:ring-green-400 border-gray-300 dark:border-gray-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>

                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start gap-2">
                  <Info size={14} className="text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-[11.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    By default, this folder is visible to all admins in your workspace.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="px-4 py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DocumentsPage;