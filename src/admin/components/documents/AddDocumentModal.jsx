// src/components/documents/AddDocumentModal.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../common/Toast';
import { updateDocument, fetchDocumentFolders } from '../../store/slices/documentsSlice';

const AddDocumentModal = ({ isOpen, onClose, onDocumentAdded, editingDocument }) => {
  const dispatch = useDispatch();
  const { folders = [] } = useSelector((state) => state.documents);
  
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fileType, setFileType] = useState('others');
  const [folderId, setFolderId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [existingFileUrl, setExistingFileUrl] = useState(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  // Get base URL for file access
  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
  };

  // Fetch folders when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDocumentFolders());
      
      // If editing, populate form with existing data
      if (editingDocument) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileName(editingDocument.name || '');
        setFileDescription(editingDocument.description || '');
        setFileType(editingDocument.type || 'others');
        setFolderId(editingDocument.folder_id || '');
        setExpiryDate(editingDocument.expiry_date || '');
        
        // Set existing file URL
        if (editingDocument.file_path) {
          const baseUrl = getBaseUrl();
          const fileUrl = `${baseUrl}/storage/${editingDocument.file_path.replace(/^\/+/, '')}`;
          setExistingFileUrl(fileUrl);
        }
      } else {
        // eslint-disable-next-line react-hooks/immutability
        resetForm();
      }
    }
  }, [isOpen, editingDocument, dispatch]);

  const resetForm = () => {
    setFileName('');
    setFileDescription('');
    setSelectedFile(null);
    setFileType('others');
    setFolderId('');
    setExpiryDate('');
    setExistingFileUrl(null);
    setIsReplacingFile(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      setSelectedFile(file);
      setIsReplacingFile(true);
    }
  };

  const handleRemoveNewFile = () => {
    setSelectedFile(null);
    setIsReplacingFile(false);
    // Reset file input value
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleCancelReplace = () => {
    setSelectedFile(null);
    setIsReplacingFile(false);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    if (!fileName.trim()) {
      showToast('Document name is required', 'error');
      return;
    }

    if (!folderId) {
      showToast('Please select a folder', 'error');
      return;
    }

    setIsUpdating(true);
    
    try {
      const formData = {
        name: fileName.trim(),
        type: fileType,
        description: fileDescription,
        folder_id: folderId,
        expiry_date: expiryDate || '',
      };
      
      let result;
      if (editingDocument) {
        // Update existing document - pass the new file if selected, otherwise undefined to keep existing
        result = await dispatch(updateDocument({ 
          id: editingDocument.id, 
          formData, 
          file: selectedFile || undefined // Only send file if a new one is selected
        }));
        
        if (updateDocument.fulfilled.match(result)) {
          showToast('Document updated successfully', 'success');
          onDocumentAdded?.();
          handleClose();
        } else {
          showToast(result.payload || 'Failed to update document', 'error');
        }
      }
      
    } catch (error) {
      console.error('Error updating document:', error);
      showToast('Failed to update document', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get file extension and icon
  const getFileIcon = (fileName) => {
    if (!fileName) return 'fas fa-file-alt';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'fas fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fas fa-file-excel';
    if (['ppt', 'pptx'].includes(ext)) return 'fas fa-file-powerpoint';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fas fa-file-image';
    if (['txt'].includes(ext)) return 'fas fa-file-alt';
    return 'fas fa-file';
  };

  const getFileColor = (fileName) => {
    if (!fileName) return 'text-gray-500';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'text-red-500';
    if (['doc', 'docx'].includes(ext)) return 'text-blue-500';
    if (['xls', 'xlsx'].includes(ext)) return 'text-green-500';
    if (['ppt', 'pptx'].includes(ext)) return 'text-orange-500';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'text-purple-500';
    return 'text-gray-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[95%] md:w-full p-6 shadow-soft-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            <i className="fas fa-edit text-green-500 mr-2"></i>
            Edit Document
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Enter document name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Folder <span className="text-red-500">*</span>
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">Select Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
              placeholder="Enter document description"
            />
          </div>

          {/* Current File Section */}
          {existingFileUrl && !isReplacingFile && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fas fa-file-alt text-green-500 mr-2"></i>
                Current File
              </label>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <i className={`${getFileIcon(editingDocument?.name)} ${getFileColor(editingDocument?.name)} text-2xl`}></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {editingDocument?.file_path?.split('/').pop() || 'Document file'}
                    </p>
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1 mt-1"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      View File
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReplacingFile(true)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <i className="fas fa-sync-alt"></i>
                  Replace
                </button>
              </div>
            </div>
          )}

          {/* Replace File Section */}
          {isReplacingFile && (
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fas fa-upload text-blue-500 mr-2"></i>
                Upload New File
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Optional - leave as is to keep current file)</span>
              </label>
              
              {!selectedFile ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-500"></i>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>Choose a new file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <i className={`${getFileIcon(selectedFile.name)} ${getFileColor(selectedFile.name)} text-2xl`}></i>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelReplace}
                        className="text-gray-500 hover:text-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRemoveNewFile}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {existingFileUrl && !selectedFile && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setIsReplacingFile(false)}
                    className="text-sm text-gray-500 hover:text-gray-600"
                  >
                    <i className="fas fa-arrow-left mr-1"></i>
                    Keep current file
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Show current file info when not replacing */}
          {existingFileUrl && !isReplacingFile && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <i className="fas fa-info-circle mr-1"></i>
              Click "Replace" to upload a new version of this file
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isUpdating ? (
              <><i className="fas fa-spinner fa-spin"></i> Saving...</>
            ) : (
              <><i className="fas fa-save"></i> Update Document</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;