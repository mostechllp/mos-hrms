import { useState } from "react";
import { showToast } from "./Toast";

const DocumentModal = ({ isOpen, onClose, onSave, uploading }) => {
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 5) {
      showToast("File must be less than 5MB", "error");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview("pdf");
    }
  };

  const handleSave = () => {
    if (!documentName.trim()) {
      showToast("Please enter document name", "error");
      return;
    }
    if (!selectedFile) {
      showToast("Please select a file", "error");
      return;
    }
    onSave({ name: documentName, file: selectedFile });
    setDocumentName("");
    setSelectedFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    setDocumentName("");
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-black bg-opacity-75 dark:bg-opacity-70"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  <i className="fas fa-plus-circle text-green-500 dark:text-green-400 mr-2"></i>
                  Add Document
                </h3>

                {/* Document Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., CV, Degree Certificate, Experience Letter"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Document *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-green-400 dark:hover:border-green-500 transition-colors bg-white dark:bg-gray-700/30">
                    <div className="space-y-1 text-center">
                      {preview ? (
                        preview === "pdf" ? (
                          <div className="mb-3">
                            <i className="fas fa-file-pdf text-red-500 dark:text-red-400 text-5xl"></i>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {selectedFile?.name}
                            </p>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <img
                              src={preview}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {selectedFile?.name}
                            </p>
                          </div>
                        )
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt text-gray-400 dark:text-gray-500 text-4xl mb-3"></i>
                          <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                            <label
                              htmlFor="document-upload"
                              className="relative cursor-pointer bg-white dark:bg-transparent rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="document-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, PDF, DOC up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/40 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={uploading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 dark:bg-green-600 text-base font-medium text-white hover:bg-green-700 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Add Document
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;