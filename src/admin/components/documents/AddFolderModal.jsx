import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../components/common/Toast';
import { addDocumentFolder } from '../../store/slices/documentsSlice';

const AddFolderModal = ({ isOpen, onClose, onFolderAdded }) => {
  const dispatch = useDispatch();
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!folderName.trim()) {
      showToast('Folder name is required', 'error');
      return;
    }

    setIsCreating(true);
    
    try {
      const result = await dispatch(addDocumentFolder({ name: folderName }));
      if (addDocumentFolder.fulfilled.match(result)) {
        const newFolder = result.payload;
        showToast('Folder created successfully', 'success');
        onFolderAdded?.(newFolder);
        onClose();
        setFolderName('');
      } else {
        showToast(result.payload || 'Failed to create folder', 'error');
      }
    } catch (error) {
      showToast('Failed to create folder', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[95%] md:w-full p-6 shadow-soft-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            <i className="fas fa-folder-plus text-green-500 mr-2"></i>
            Create New Folder
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Enter folder name"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="px-4 py-2 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isCreating ? (
              <><i className="fas fa-spinner fa-spin"></i> Creating...</>
            ) : (
              <><i className="fas fa-folder-plus"></i> Create Folder</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFolderModal;
