import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// Helper function to transform form data for API
const transformDocumentForAPI = (formData, file) => {
  const formDataToSend = new FormData();
  
  // Add document fields
  formDataToSend.append('name', formData.name);
  formDataToSend.append('type', formData.folder || 'general');
  formDataToSend.append('description', formData.description || '');
  formDataToSend.append('folder', formData.folder || 'general');
  formDataToSend.append('expiry_date', formData.expiryDate || '');
  
  // Handle share_with (can be array or comma-separated string)
  if (formData.share_with) {
    if (Array.isArray(formData.share_with)) {
      formDataToSend.append('share_with', formData.share_with.join(','));
    } else {
      formDataToSend.append('share_with', formData.share_with);
    }
  }
  
  // Add file
  if (file) {
    formDataToSend.append('file_path', file);
  }
  
  return formDataToSend;
};

// Helper to transform API response to frontend format
const transformDocumentFromAPI = (doc) => {
  // Handle the dynamic field structure from API
  const getFieldValue = (key, defaultValue = '') => {
    const field = doc.find(f => f.key === key);
    if (!field) return defaultValue;
    if (field.type === 'file') {
      return field.value?.[0] || defaultValue;
    }
    return field.value || defaultValue;
  };
  
  return {
    id: doc[0]?.uuid || Math.random(),
    name: getFieldValue('name'),
    type: getFieldValue('type'),
    description: getFieldValue('description'),
    file_path: getFieldValue('file_path'),
    folder: getFieldValue('folder'),
    party_id: getFieldValue('party_id'),
    share_with: getFieldValue('share_with'),
    expiry_date: getFieldValue('expiry_date'),
    status: getFieldValue('status', 'active'),
    created_at: getFieldValue('created_at'),
    updated_at: getFieldValue('updated_at'),
  };
};

// Fetch all documents
export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/documents');
      // Handle the array of field objects response
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].key) {
        // This is a single document response in field format
        return [transformDocumentFromAPI(response.data)];
      }
      // Handle array of documents
      if (Array.isArray(response.data)) {
        return response.data.map(doc => transformDocumentFromAPI(doc));
      }
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

// Fetch single document by ID
export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/documents/${id}`);
      if (Array.isArray(response.data) && response.data[0]?.key) {
        return transformDocumentFromAPI(response.data);
      }
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    }
  }
);

// Upload/Store new document
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ formData, file }, { rejectWithValue }) => {
    try {
      const dataToSend = transformDocumentForAPI(formData, file);
      const response = await apiClient.post('/admin/documents', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Update document
export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ id, formData, file }, { rejectWithValue }) => {
    try {
      const dataToSend = transformDocumentForAPI(formData, file);
      const response = await apiClient.post(`/admin/documents/${id}?_method=PUT`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update document');
    }
  }
);

// Delete document
export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/documents/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

// Get document folders
export const fetchDocumentFolders = createAsyncThunk(
  'documents/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/documents-folders');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folders');
    }
  }
);

// Get shareable users
export const fetchShareableUsers = createAsyncThunk(
  'documents/fetchShareableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/shareable-users');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    currentDocument: null,
    folders: [],
    shareableUsers: [],
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
        state.totalCount = action.payload?.length || 0;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        state.currentDocument = action.payload;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        state.totalCount -= 1;
      })
      
      // Fetch folders
      .addCase(fetchDocumentFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
      })
      
      // Fetch shareable users
      .addCase(fetchShareableUsers.fulfilled, (state, action) => {
        state.shareableUsers = action.payload;
      });
  },
});

export const { clearError, clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;