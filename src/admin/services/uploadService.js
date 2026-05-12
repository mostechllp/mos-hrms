// services/uploadService.js
import { store } from '@admin/store';
import { fetchUploadStatus } from '@admin/store/slices/attendanceSlice';
import { showToast } from '@admin/components/common/Toast';

class UploadService {
  constructor() {
    this.intervals = {};
    this.isPolling = false;
    this.setupPolling();
  }

  setupPolling() {
    // Poll every 5 seconds for all pending uploads
    setInterval(() => {
      const state = store.getState();
      const pendingUploads = state.attendance.uploads.filter(
        upload => upload.status === 'processing'
      );
      
      pendingUploads.forEach(upload => {
        this.checkUploadStatus(upload.id);
      });
    }, 5000);
  }

  async checkUploadStatus(uploadId) {
    try {
      const result = await store.dispatch(fetchUploadStatus(uploadId)).unwrap();
      if (result.status === 'completed') {
        showToast(`Attendance file processed successfully!`, 'success');
        // Refresh attendance data
        store.dispatch({ type: 'attendance/refreshData' });
      } else if (result.status === 'failed') {
        showToast(`Failed to process attendance file`, 'error');
      }
    } catch (error) {
      console.error('Failed to check upload status:', error);
    }
  }

  addUpload(upload) {
    // Start polling for this upload
    this.checkUploadStatus(upload.id);
  }
}

export default new UploadService();
