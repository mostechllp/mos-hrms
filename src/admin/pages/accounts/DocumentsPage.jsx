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
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Surface = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl ${className}`}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
    {children}
  </h3>
);

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1 text-[12px] font-medium text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-rose-500">*</span>}
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
      className={`w-full text-left flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
        active
          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
      }`}
    >
      <span className="inline-flex items-center gap-2.5 min-w-0">
        <Icon
          size={14}
          className={active ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}
        />
        <span className="truncate">{label}</span>
      </span>
      {badge != null && !active && (
        <span className="w-4.5 h-4.5 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold flex items-center justify-center tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );

  const FileRow = ({ doc, showFolder }) => (
    <tr className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
      <td className="px-4 sm:px-5 py-3">
        <input
          type="checkbox"
          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          aria-label={`Select ${doc.name}`}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
            <FileText size={15} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {doc.name}
            </p>
            {doc.status && (
              <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-medium uppercase tracking-wider">
                <ScanLine size={10} /> {doc.status}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.uploadedBy}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.uploadedAt}</td>
      <td className="px-4 py-3 text-slate-500">{doc.associatedTo || "—"}</td>
      {showFolder && (
        <td className="px-4 py-3 text-slate-500">{doc.folder || "—"}</td>
      )}
    </tr>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-[40] md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ---- Sidebar ---- */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-[50] md:z-auto
            w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
            flex flex-col shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Workspace
              </p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                Documents
              </h1>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Folders
              </span>
              <GhostBtn className="!px-1.5 !py-1" onClick={() => setIsFolderModalOpen(true)} aria-label="New folder">
                <Plus size={13} />
              </GhostBtn>
            </div>

            <div className="space-y-0.5 mb-6">
              {folders.length === 0 ? (
                <div className="px-2.5 py-3 text-[12px] text-slate-500">
                  <p className="mb-2">No folders yet.</p>
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="text-slate-900 dark:text-slate-100 font-medium hover:underline"
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
                      className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                        active
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <Folder
                        size={14}
                        className={active ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}
                      />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <NavItem icon={Trash} label="Trash" onClick={() => {}} />
          </div>
        </aside>

        {/* ---- Main ---- */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">

          {/* Header */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  aria-label="Open menu"
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Documents
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
                    {title}
                  </h2>
                </div>
              </div>

              {activeView !== "all-documents" && (
                <div className="flex items-center gap-2 shrink-0">
                  {activeView === "files" && (
                    <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                      <ScanLine size={12} /> Autoscans: 50 / 50
                    </span>
                  )}
                  <div className="inline-flex items-stretch rounded-lg overflow-hidden">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                      Upload file
                    </button>
                    <button
                      className="inline-flex items-center px-2 py-1.5 text-[12px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-l border-white/10 dark:border-slate-900/10 transition-colors"
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
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6">

            {/* ---- VIEW: ALL DOCUMENTS ---- */}
            {activeView === "all-documents" && (
              <Surface className="overflow-hidden">
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Filter
                  </span>
                  <GhostBtn className="border border-slate-200 dark:border-slate-800">
                    File type: All <ChevronDown size={13} />
                  </GhostBtn>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px] whitespace-nowrap min-w-[720px]">
                    <thead>
                      <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                        <th className="px-4 py-2.5 text-left font-medium">File name</th>
                        <th className="px-4 py-2.5 text-left font-medium">Uploaded by</th>
                        <th className="px-4 py-2.5 text-left font-medium">Uploaded on</th>
                        <th className="px-4 py-2.5 text-left font-medium">Associated to</th>
                        <th className="px-4 py-2.5 text-left font-medium">Folder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-[13px] text-slate-500">
                            No documents uploaded yet
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => <FileRow key={doc.id} doc={doc} showFolder />)
                      )}
                    </tbody>
                  </table>
                </div>
              </Surface>
            )}

            {/* ---- VIEW: FOLDER ---- */}
            {activeView === "folder" && (
              <div className="space-y-4">
                <Surface className="px-4 sm:px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-full max-w-xs">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Search in folder…"
                        className="w-full pl-9 pr-9 py-1.5 text-[12.5px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <GhostBtn className="border border-slate-200 dark:border-slate-800 ml-auto">
                      File type: All <ChevronDown size={13} />
                    </GhostBtn>
                  </div>
                </Surface>

                <Surface className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px] whitespace-nowrap min-w-[600px]">
                      <thead>
                        <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                          <th className="w-10 px-4 sm:px-5 py-2.5"></th>
                          <th className="px-4 py-2.5 text-left font-medium">File name</th>
                          <th className="px-4 py-2.5 text-left font-medium">Uploaded by</th>
                          <th className="px-4 py-2.5 text-left font-medium">Uploaded on</th>
                          <th className="px-4 py-2.5 text-left font-medium">Associated to</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {documents.filter((d) => d.folder === activeFolder?.name).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-16">
                              <div className="max-w-md mx-auto text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <FolderOpen size={22} className="text-slate-400" />
                                </div>
                                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">
                                  No documents in this folder
                                </p>
                                <p className="text-[12px] text-slate-500 mt-1">
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
                </Surface>
              </div>
            )}

            {/* ---- VIEW: FILES ---- */}
            {activeView === "files" && (
              <div className="space-y-4">
                {/* Banner */}
                <Surface className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                        Your plan now includes autoscan credits
                      </h3>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Along with expenses, your plan now includes autoscan credits for bills,
                        documents, and email forwarding. Need more? Purchase additional credits anytime.
                      </p>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors" aria-label="Dismiss">
                      <X size={16} />
                    </button>
                  </div>
                </Surface>

                {/* Drop zone */}
                <Surface
                  className={`py-12 sm:py-16 px-4 transition-colors ${
                    isDragging
                      ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/40"
                      : ""
                  }`}
                >
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`max-w-lg mx-auto text-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                      isDragging
                        ? "border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <CloudUpload size={22} className="text-slate-400" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      Drag & drop files here
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 mb-5">
                      Upload images, PDFs, docs or sheets
                    </p>

                    <input type="file" ref={fileInputRef} className="hidden" multiple />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                      Choose files to upload
                    </button>

                    <div className="mt-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-left">
                      <Mail size={14} className="text-slate-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          Send documents to
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          fidha.ybcu0wck_khwbk0hs@inbox.zohoreceipts.in
                        </p>
                      </div>
                    </div>
                  </div>
                </Surface>

                {/* Features */}
                <Surface className="px-5 py-6">
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
                        className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3">
                          <f.icon size={16} />
                        </div>
                        <h3 className="text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                          {f.title}
                        </h3>
                        <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{f.body}</p>
                      </div>
                    ))}
                  </div>
                </Surface>
              </div>
            )}

            {/* ---- VIEW: BANK STATEMENTS ---- */}
            {activeView === "bank-statements" && (
              <div className="space-y-4">

                {/* Setup card */}
                <Surface className="px-5 py-6 max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Setup
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
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
                          <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2">
                            <s.icon size={16} />
                          </div>
                          <p className="text-[12px] text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                            {s.label}
                          </p>
                        </div>
                        {i === 0 && (
                          <div className="hidden md:block w-10 border-t-2 border-dashed border-slate-200 dark:border-slate-700" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 flex items-center gap-2 max-w-lg mx-auto mb-3">
                    <Mail size={13} className="text-slate-500 shrink-0" />
                    <span className="text-[11.5px] text-slate-700 dark:text-slate-200 truncate flex-1 font-mono">
                      fidha.nhiu3li4_l2itnsvu4.secure@inbox.zohorec...
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <GhostBtn className="text-slate-700 dark:text-slate-200">
                      <Copy size={12} /> Copy
                    </GhostBtn>
                    <GhostBtn className="text-slate-700 dark:text-slate-200">
                      <Edit2 size={12} /> Edit
                    </GhostBtn>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline mb-3">
                      How do I auto-forward bank statements?
                    </button>
                    <div className="flex justify-center gap-2">
                      {[Mail, Mail, Mail].map((Icon, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                        >
                          <Icon size={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Surface>

                {/* Flow */}
                <Surface className="px-5 py-6 max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      How it works
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                      Bank statement inbox
                    </h2>
                  </div>

                  <div className="min-w-[600px] overflow-x-auto pb-2">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-40 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900">
                        <RefreshCw size={13} className="text-slate-400 shrink-0" /> Auto-forward bank statements
                      </div>
                      <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-8" />
                      <div className="w-56 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                          <FileText size={11} /> Bank statements
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1">
                          <div className="flex text-[8.5px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
                            <div className="w-1/2">File name</div>
                            <div className="w-1/4">By</div>
                            <div className="w-1/4">Bank</div>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded w-full mb-1" />
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                        </div>
                      </div>
                      <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-8" />
                      <div className="w-28 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900">
                        <ShieldCheck size={13} className="text-emerald-500 shrink-0" /> Add to bank
                      </div>
                    </div>

                    <div className="mt-4 ml-24">
                      <div className="w-44 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-2 text-[11.5px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900">
                        <UploadCloud size={13} className="text-slate-400 shrink-0" /> Upload bank statements manually
                      </div>
                    </div>
                  </div>
                </Surface>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ---- NEW FOLDER MODAL ---- */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-8 sm:pt-16 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  New
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
                  Create folder
                </h2>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition"
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
                        className="flex items-start gap-2 text-[12.5px] text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="permission"
                          defaultChecked={i === 0}
                          className="mt-0.5 text-slate-900 focus:ring-slate-400 border-slate-300"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>

                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg p-3 flex items-start gap-2">
                  <Info size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    By default, this folder is visible to all admins in your workspace.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-3 py-2 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="px-3 py-2 text-[12.5px] font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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