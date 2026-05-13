import { useState } from 'react';
import { showToast } from '../common/Toast';
// import { addDocumentFile } from '../../store/slices/documentsSlice'; // Uncomment when API is ready

const AddFileModal = ({ isOpen, onClose, onFileAdded }) => {
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [fileType, setFileType] = useState('other');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate filename if empty
      if (!fileName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFileName(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async () => {
    if (!fileName.trim()) {
      showToast('File name is required', 'error');
      return;
    }

    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', fileName);
      formData.append('description', fileDescription);
      formData.append('type', fileType);
      formData.append('file', selectedFile);
      
      // Uncomment when API is ready
      // const result = await dispatch(addDocumentFile(formData));
      // if (addDocumentFile.fulfilled.match(result)) {
      //   const newFile = result.payload;
      //   showToast('File added successfully', 'success');
      //   onFileAdded?.(newFile);
      //   handleClose();
      // } else {
      //   showToast(result.payload || 'Failed to add file', 'error');
      // }
      
      // Temporary mock success
      setTimeout(() => {
        showToast('File added successfully', 'success');
        onFileAdded?.({ name: fileName, description: fileDescription, type: fileType });
        handleClose();
      }, 500);
      
    } catch (error) {
      showToast('Failed to add file', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFileName('');
    setFileDescription('');
    setSelectedFile(null);
    setFileType('other');
    setIsCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-[95%] md:w-full p-6 shadow-soft-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            <i className="fas fa-file-alt text-green-500 mr-2"></i>
            Add New File
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
              File Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Enter file name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              File Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            >
              <option value="document">Document</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="presentation">Presentation</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="other">Other</option>
            </select>
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
              placeholder="Enter file description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center">
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-500"></i>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
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
            {selectedFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <i className="fas fa-check-circle"></i>
                <span>Selected: {selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-600 ml-auto"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
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
              <><i className="fas fa-spinner fa-spin"></i> Adding...</>
            ) : (
              <><i className="fas fa-plus"></i> Add File</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;