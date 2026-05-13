import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import EntriesSelector from '../components/common/EntriesSelector';
import { showToast } from '../components/common/Toast';
import Pagination from '../components/common/Paginations';
import ConfirmModal from '../components/common/ConfirmModal';
import { fetchDocuments, deleteDocument, clearError, fetchDocumentFolders, updateDocument, fetchShareableUsers, fetchParties } from '../store/slices/documentsSlice';
// ─── Inline Edit Modal ────────────────────────────────────────────────────────
const EditModal = ({ isOpen, document, folders, shareableUsers, parties, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    folder: '',
    expiry_date: '',
    party_id: '',
    share_with: [], // array of user IDs
  });

  useEffect(() => {
    if (document) {
      // Resolve current share_with IDs
      const currentShareIds = (() => {
        if (Array.isArray(document.shared_users) && document.shared_users.length > 0) {
          return document.shared_users.map((u) => String(u.id)).filter(Boolean);
        }
        if (Array.isArray(document.share_with) && document.share_with.length > 0) {
          return document.share_with
            .map((item) => String(typeof item === 'object' ? item.id : item))
            .filter(Boolean);
        }
        return [];
      })();

      setForm({
        name: document.name || '',
        description: document.description || '',
        folder: document.folder_name || document.folder || document.type || '',
        expiry_date: document.expiry_date ? document.expiry_date.split('T')[0] : '',
        party_id: String(document.party_id || ''),
        share_with: currentShareIds,
      });
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Toggle a user in/out of share_with
  const toggleShareUser = (userId) => {
    const id = String(userId);
    setForm((prev) => ({
      ...prev,
      share_with: prev.share_with.includes(id)
        ? prev.share_with.filter((x) => x !== id)
        : [...prev.share_with, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(document.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <i className="fas fa-edit text-green-600 dark:text-green-400 text-sm"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Edit Agreement</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[260px]">{document.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors">
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required placeholder="Enter document name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
            <textarea
              name="description" value={form.description}
              onChange={handleChange} rows={2} placeholder="Enter description (optional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Folder */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Folder</label>
            <select
              name="folder" value={form.folder} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
              <option value="">Select folder</option>
              {folders && folders.length > 0
                ? folders.map((f) => <option key={f.name || f} value={f.name || f}>{f.name || f}</option>)
                : ['Agreements', 'HR', 'IT', 'Finance', 'Legal'].map((f) => (
                  <option key={f} value={f.toLowerCase()}>{f}</option>
                ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Expiry Date</label>
            <input
              type="date" name="expiry_date" value={form.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Party */}
          {parties && parties.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                <i className="fas fa-building mr-1"></i> Party
              </label>
              <select
                name="party_id"
                value={form.party_id}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="">No party</option>
                {parties.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name || p.company_name || `Party #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Share With */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              <i className="fas fa-share-alt mr-1"></i> Share With
              {form.share_with.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px]">
                  {form.share_with.length} selected
                </span>
              )}
            </label>

            {shareableUsers && shareableUsers.length > 0 ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Selected users shown as chips */}
                {form.share_with.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-green-50 dark:bg-green-900/10 border-b border-gray-200 dark:border-gray-600">
                    {form.share_with.map((uid) => {
                      const user = shareableUsers.find((u) => String(u.id) === uid);
                      return user ? (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px] font-medium"
                        >
                          {user.name}
                          <button
                            type="button"
                            onClick={() => toggleShareUser(uid)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-times text-[8px]"></i>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Scrollable user list */}
                <div className="max-h-36 overflow-y-auto">
                  {shareableUsers.map((user) => {
                    const uid = String(user.id);
                    const isSelected = form.share_with.includes(uid);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleShareUser(uid)}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${isSelected
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</div>
                          {user.email && (
                            <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-500'
                          }`}>
                          {isSelected && <i className="fas fa-check text-[8px]"></i>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                No users available to share with
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><i className="fas fa-spinner fa-spin text-xs"></i> Saving...</>
                : <><i className="fas fa-check text-xs"></i> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ─── Main Component ───────────────────────────────────────────────────────────
const Agreements = () => {
  const dispatch = useDispatch();
  // Update selector to also get shareableUsers and parties
  const { documents: documentsState = [], folders = [], shareableUsers = [], parties = [], error = null } = useSelector(
    (state) => state.documents || { documents: [], folders: [], shareableUsers: [], parties: [], loading: false, error: null }
  );

  const documents = Array.isArray(documentsState) ? documentsState : [];

  const [currentFolder, setCurrentFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editDocument, setEditDocument] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchDocumentFolders());
    dispatch(fetchShareableUsers()); // ← add
    dispatch(fetchParties());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Build folder list
  const folderList = [
    { name: 'All Files', value: 'all', icon: 'fas fa-folder-open' },
    ...(folders && folders.length > 0
      ? folders.map((folder) => ({
        name: folder.name || folder,
        value: folder.name || folder,
        icon: 'fas fa-folder',
      }))
      : [
        { name: 'Agreements', value: 'agreements', icon: 'fas fa-file-signature' },
        { name: 'HR', value: 'hr', icon: 'fas fa-users' },
        { name: 'IT', value: 'it', icon: 'fas fa-code' },
        { name: 'Finance', value: 'finance', icon: 'fas fa-chart-line' },
        { name: 'Legal', value: 'legal', icon: 'fas fa-gavel' },
      ]),
  ];

  const getFilteredDocuments = () => {
    let filtered = Array.isArray(documents) ? documents : [];
    if (currentFolder !== 'all') {
      filtered = filtered.filter(
        (doc) => (doc.folder || doc.type || '').toLowerCase() === currentFolder.toLowerCase()
      );
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          (doc.name || '').toLowerCase().includes(s) ||
          (doc.description || '').toLowerCase().includes(s) ||
          (doc.folder || '').toLowerCase().includes(s)
      );
    }
    return filtered;
  };

  const filteredDocuments = getFilteredDocuments();
  const totalFiltered = filteredDocuments.length;
  const totalPages = Math.ceil(totalFiltered / perPage);
  const start = (currentPage - 1) * perPage;
  const pageDocuments = filteredDocuments.slice(start, start + perPage);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditClick = (doc) => {
    setEditDocument(doc);
    setEditOpen(true);
  };

  // In Agreements.jsx — EditModal usage, pass onSave with file
  const handleEditSave = async (id, formValues) => {
    setEditLoading(true);
    try {
      const rawFolder = formValues.folder || '';
      const selectedFolder = folders.find(
        (f) =>
          (f.name || f) === rawFolder ||
          String(f.name || f).toLowerCase() === String(rawFolder).toLowerCase(),
      );

      const folderId = selectedFolder?.id ?? editDocument?.folder_id;
      const payload = {
        name: formValues.name,
        description: formValues.description ?? '',
        folder_id: folderId,
        expiry_date: formValues.expiry_date || '',
        type: editDocument?.type || 'agreements',
        share_with: formValues.share_with || [],      // ← from form now
        party_id: formValues.party_id || '',           // ← from form now
      };

      const result = await dispatch(updateDocument({ id, formData: payload }));
      if (updateDocument.fulfilled.match(result)) {
        showToast('Document updated successfully', 'success');
        setEditOpen(false);
        setEditDocument(null);
        dispatch(fetchDocuments());
      } else {
        showToast(
          typeof result.payload === 'string' ? result.payload : 'Failed to update document',
          'error',
        );
      }
    } catch {
      showToast('Failed to update document', 'error');
    }
    setEditLoading(false);
  };

  const handleDeleteClick = (document) => {
    setSelectedDocument(document);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    setDeleteLoading(true);
    const result = await dispatch(deleteDocument(selectedDocument.id));
    if (deleteDocument.fulfilled.match(result)) {
      showToast(`${selectedDocument.name} deleted successfully`, 'success');
      setConfirmOpen(false);
      setSelectedDocument(null);
      dispatch(fetchDocuments());
    } else {
      showToast('Failed to delete document', 'error');
    }
    setDeleteLoading(false);
  };

  const handleViewDocument = (filePath) => {
    if (filePath) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || window.location.origin;
      const cleanPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
      window.open(`${baseUrl}/storage/${cleanPath}`, '_blank');
    } else {
      showToast('No document file available', 'info');
    }
  };

  const handleDownloadDocument = (filePath, fileName) => {
    if (!filePath) {
      showToast('No document available', 'info');
      return;
    }
    const cleanPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^storage\//, '');
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || window.location.origin;
    const link = document.createElement('a');
    link.href = `${baseUrl}/storage/${cleanPath}`;
    link.download = fileName || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Expiry';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getExpiryClass = (expiryDate) => {
    if (!expiryDate) return '';
    const diffDays = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'text-red-500 font-semibold';
    if (diffDays <= 30) return 'text-amber-500 font-semibold';
    return '';
  };

  const getFolderClass = (folder) => {
    const classes = {
      agreements: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      hr: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      it: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      finance: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      legal: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return classes[folder?.toLowerCase()] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const total = documents.length;
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  let expiringSoon = 0;
  let expired = 0;
  documents.forEach((doc) => {
    if (doc.expiry_date) {
      const exp = new Date(doc.expiry_date);
      if (exp < today) expired++;
      else if (exp <= thirtyDaysFromNow) expiringSoon++;
    }
  });

  return (
    <div className="app flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 min-w-0 w-full overflow-x-hidden ${!isMobile ? 'md:ml-[72px]' : ''}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">

          {/* Stats Cards */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-alt text-green-600 dark:text-green-400 text-base md:text-xl"></i>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-green-600 dark:text-green-400">{total}</div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Total Documents</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-amber-600 dark:text-amber-400 text-base md:text-xl"></i>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{expiringSoon}</div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Expiring Soon (30 days)</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <i className="fas fa-calendar-times text-red-600 dark:text-red-400 text-base md:text-xl"></i>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-red-600 dark:text-red-400">{expired}</div>
              <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Expired</div>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
              Agreements Management
            </h2>
          </div>

          {/* Folder Tabs */}
          <div className="overflow-x-auto pb-2 mb-4 md:mb-5 -mx-4 px-4">
            <div className="flex gap-2 min-w-max border-b border-gray-200 dark:border-gray-700 pb-3">
              {folderList.map((folder) => (
                <button
                  key={folder.value}
                  onClick={() => { setCurrentFolder(folder.value); setCurrentPage(1); }}
                  className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${currentFolder === folder.value
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <i className={`${folder.icon} mr-1 text-[10px] md:text-xs`}></i>
                  <span className="hidden sm:inline">{folder.name}</span>
                  <span className="sm:hidden">{folder.name === 'All Files' ? 'All' : folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
            <EntriesSelector value={perPage} onChange={setPerPage} />
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search documents..." />
              <Link
                to="/agreements/add-agreement"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <i className="fas fa-plus-circle"></i> Upload Agreement
              </Link>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
            <div className="min-w-[800px] md:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Sl.No.</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Folder</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Description</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Share With</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Expiry Date</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageDocuments.length > 0 ? (
                    pageDocuments.map((document, idx) => (
                      <tr key={document.id || idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">{start + idx + 1}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                          <button
                            onClick={() => handleViewDocument(document.file_path)}
                            className="hover:text-green-500 transition-colors text-left"
                          >
                            {document.name || 'Untitled'}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${getFolderClass(document.folder || document.type)} whitespace-nowrap`}>
                            {document.folder_name || document.folder || document.type || '-'}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={document.description}>
                          {document.description || '-'}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span className="inline-flex items-center gap-1 md:gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap">
                            <i className="fas fa-share-alt text-gray-500 text-[8px] md:text-xs"></i>
                            <span>
                              {document.shared_users?.length > 0
                                ? document.shared_users.map((u) => u.name).join(', ')
                                : document.share_with?.length > 0
                                  ? document.share_with.join(', ')
                                  : '-'}
                            </span>
                          </span>
                        </td>
                        <td className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm ${getExpiryClass(document.expiry_date)} whitespace-nowrap`}>
                          {formatDate(document.expiry_date)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div className="flex gap-1 md:gap-2">
                            <button
                              onClick={() => handleViewDocument(document.file_path)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors"
                              title="View"
                            >
                              <i className="fas fa-eye text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(document.file_path, document.name)}
                              className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-500 transition-colors"
                              title="Download"
                            >
                              <i className="fas fa-download text-xs md:text-sm"></i>
                            </button>
                            {/* ── EDIT BUTTON — opens inline modal ── */}
                            <button
                              onClick={() => handleEditClick(document)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"
                              title="Edit"
                            >
                              <i className="fas fa-edit text-xs md:text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(document)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <i className="fas fa-trash text-xs md:text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No documents found. Click "Upload Agreement" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalFiltered > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalFiltered}
              itemsPerPage={perPage}
            />
          )}
        </main>
      </div>

      {/* ── Edit Modal ── */}
      <EditModal
        isOpen={editOpen}
        document={editDocument}
        folders={folders}
        shareableUsers={shareableUsers}  // ← add
        parties={parties}
        onClose={() => { setEditOpen(false); setEditDocument(null); }}
        onSave={handleEditSave}
        loading={editLoading}
      />

      {/* ── Delete Confirm Modal ── */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelectedDocument(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDocument?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Agreements;