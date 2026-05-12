// components/common/GlobalUploadStatus.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUploadStatus, removeUpload } from '../../store/slices/attendanceSlice';
import { showToast } from '../../../components/common/Toast';

const GlobalUploadStatus = () => {
  const dispatch = useDispatch();
  const { uploads } = useSelector((state) => state.attendance);
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    // Poll for upload status every 5 seconds
    const intervals = {};
    
    uploads.forEach(upload => {
      if (upload.status === 'processing' && !intervals[upload.id]) {
        intervals[upload.id] = setInterval(async () => {
          try {
            const result = await dispatch(fetchUploadStatus(upload.id)).unwrap();
            
            if (result.status === 'completed') {
              clearInterval(intervals[upload.id]);
              showToast(`File "${upload.fileName}" processed successfully!`, 'success');
              // Optionally refresh attendance data
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else if (result.status === 'failed') {
              clearInterval(intervals[upload.id]);
              showToast(`Failed to process "${upload.fileName}"`, 'error');
            }
          } catch (error) {
            console.error('Failed to fetch status:', error);
          }
        }, 5000);
      }
    });
    
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [uploads, dispatch]);

  const pendingUploads = uploads.filter(u => u.status === 'processing');
  
  if (pendingUploads.length === 0 || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {pendingUploads.map(upload => (
        <div key={upload.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin text-blue-500"></i>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {upload.fileName}
              </span>
            </div>
            <button
              onClick={() => {
                dispatch(removeUpload(upload.id));
                setVisible(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Processing in background...
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            <i className="fas fa-info-circle mr-1"></i>
            You can continue working while this processes
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalUploadStatus;
