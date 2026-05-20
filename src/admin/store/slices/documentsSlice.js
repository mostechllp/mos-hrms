import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// Helper function to transform form data for API
// const transformDocumentForAPI = (formData, file) => {
//   const formDataToSend = new FormData();

//   formDataToSend.append("name", formData.name);
//   formDataToSend.append("type", formData.type || "all");
//   formDataToSend.append("description", formData.description || "");
//   formDataToSend.append("folder_id", formData.folder_id || "");
//   formDataToSend.append("expiry_date", formData.expiry_date || "");
//   if (formData.party_id) {
//     formDataToSend.append("party_id", formData.party_id);
//   }

//   // if (formData.share_with && Array.isArray(formData.share_with)) {
//   //   formData.share_with.forEach((id, index) => {
//   //     formDataToSend.append(`share_with[${index}]`, id);
//   //   });
//   // }
//   if (formData.share_with) {
//     const shareArray = Array.isArray(formData.share_with)
//       ? formData.share_with
//       : formData.share_with.split(",");

//     shareArray.forEach((id, index) => {
//       formDataToSend.append(`share_with[${index}]`, id);
//     });
//   }
//   if (file) {
//     formDataToSend.append("file_path", file);
//   }

//   return formDataToSend;
// };
const transformDocumentForAPI = (formData, file) => {
  const formDataToSend = new FormData();

  formDataToSend.append("name", formData.name);
  formDataToSend.append("type", formData.type || "agreements");

  if (formData.description) {
    formDataToSend.append("description", formData.description);
  }

  formDataToSend.append("folder_id", formData.folder_id || "");

  if (formData.expiry_date) {
    formDataToSend.append("expiry_date", formData.expiry_date);
  }

  // Only append party_id if it has a value
  if (formData.party_id) {
    formDataToSend.append("party_id", formData.party_id);
  }

  if (formData.share_with) {
    const shareArray = Array.isArray(formData.share_with)
      ? formData.share_with
      : formData.share_with.split(",");

    shareArray.forEach((id, index) => {
      formDataToSend.append(`share_with[${index}]`, id);
    });
  }

  if (file) {
    formDataToSend.append("file_path", file);
  }

  return formDataToSend;
};

// Helper to transform API response to frontend format
const transformDocumentFromAPI = (doc) => {
  const getFieldValue = (key, defaultValue = "") => {
    const field = doc.find((f) => f.key === key);
    if (!field) return defaultValue;
    if (field.type === "file") {
      return field.value?.[0] || defaultValue;
    }
    return field.value || defaultValue;
  };

  return {
    id: doc[0]?.uuid || Math.random(),
    name: getFieldValue("name"),
    type: getFieldValue("type"),
    description: getFieldValue("description"),
    file_path: getFieldValue("file_path"),
    folder_id: getFieldValue("folder_id"),
    party_id: getFieldValue("party_id"),
    share_with: getFieldValue("share_with"),
    expiry_date: getFieldValue("expiry_date"),
    status: getFieldValue("status", "active"),
    created_at: getFieldValue("created_at"),
    updated_at: getFieldValue("updated_at"),
  };
};

// Fetch all documents
// export const fetchDocuments = createAsyncThunk(
//   "documents/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get("/admin/documents");
//       if (
//         Array.isArray(response.data) &&
//         response.data.length > 0 &&
//         response.data[0].key
//       ) {
//         return [transformDocumentFromAPI(response.data)];
//       }
//       if (Array.isArray(response.data)) {
//         return response.data.map((doc) => transformDocumentFromAPI(doc));
//       }
//       return response.data.data || [];
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch documents",
//       );
//     }
//   },
// );
export const fetchDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/documents");
      // Handle paginated response: { status, message, data: { data: [...], total, ... } }
      if (response.data?.data?.data) {
        return response.data.data.data;
      }
      if (response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch documents",
      );
    }
  },
);

// Fetch single document by ID
export const fetchDocumentById = createAsyncThunk(
  "documents/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/documents/${id}`);
      if (Array.isArray(response.data) && response.data[0]?.key) {
        return transformDocumentFromAPI(response.data);
      }
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch document",
      );
    }
  },
);

// Upload/Store new document
export const uploadDocument = createAsyncThunk(
  "documents/upload",
  async ({ formData, file }, { rejectWithValue }) => {
    try {
      const dataToSend = transformDocumentForAPI(formData, file);
      console.log("Uploading document data:");
      for (let [key, value] of dataToSend.entries()) {
        console.log(key, ":", value);
      }
      const response = await apiClient.post("/admin/documents", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.log("422 error details:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload document",
      );
    }
  },
);

// Update document
export const updateDocument = createAsyncThunk(
  "documents/update",
  async ({ id, formData, file }, { rejectWithValue }) => {
    try {
      const dataToSend = transformDocumentForAPI(formData, file);
      const response = await apiClient.post(
        `/admin/documents/${id}?_method=PUT`,
        dataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update document",
      );
    }
  },
);

// Delete document
export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/documents/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document",
      );
    }
  },
);

// Get document folders
// In your documentsSlice.js, update the folder endpoint:

// Get document folders
export const fetchDocumentFolders = createAsyncThunk(
  "documents/fetchFolders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/folders");

      // Handle paginated response: { data: { data: [...] } }
      if (response.data?.data?.data) {
        return response.data.data.data;
      }
      // Handle: { data: [...] }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Handle direct array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch folders",
      );
    }
  },
);
// Folder CRUD operations
export const addDocumentFolder = createAsyncThunk(
  "documents/addFolder",
  async (folderData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/folders", folderData); // Changed from documents-folders to folders
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add folder",
      );
    }
  },
);

export const deleteDocumentFolder = createAsyncThunk(
  "documents/deleteFolder",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/folders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete folder",
      );
    }
  },
);
export const updateDocumentFolder = createAsyncThunk(
  "documents/updateFolder",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/folders/${id}`, { name });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update folder",
      );
    }
  },
);

// Get shareable users
// In your documentsSlice.js
export const fetchShareableUsers = createAsyncThunk(
  "documents/fetchShareableUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/shareable-users");
      // Handle different response structures
      const users = response.data.data || response.data;
      // Ensure each user has a name property
      return users.map((user) => ({
        ...user,
        name: user.name || user.email || user.username,
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Party CRUD operations
// Update the fetchParties thunk in your documentsSlice.js

export const fetchParties = createAsyncThunk(
  "documents/fetchParties",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/admin/parties");
      console.log("Fetch parties response:", response.data);
      console.log("Full response:", JSON.stringify(response.data));

      // Handle paginated response: { status, message, data: { current_page, data: [...] } }
      if (response.data?.data?.data) {
        return response.data.data.data;
      }
      // Handle non-paginated response with data array directly
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Handle direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Handle response where data is at root level
      if (response.data?.data && !Array.isArray(response.data.data)) {
        return [];
      }
      return [];
    } catch (error) {
      console.error("Fetch parties error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parties",
      );
    }
  },
);

export const addParty = createAsyncThunk(
  "documents/addParty",
  async (partyData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/admin/parties", partyData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add party",
      );
    }
  },
);

export const updateParty = createAsyncThunk(
  "documents/updateParty",
  async ({ id, partyData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/parties/${id}`, partyData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update party",
      );
    }
  },
);

export const deleteParty = createAsyncThunk(
  "documents/deleteParty",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/parties/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete party",
      );
    }
  },
);

const documentsSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    currentDocument: null,
    folders: [],
    parties: [],
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
        const index = state.documents.findIndex(
          (doc) => doc.id === action.payload.id,
        );
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
        state.documents = state.documents.filter(
          (doc) => doc.id !== action.payload,
        );
        state.totalCount -= 1;
      })

      // Fetch folders
      .addCase(fetchDocumentFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
      })

      // Fetch shareable users
      .addCase(fetchShareableUsers.fulfilled, (state, action) => {
        state.shareableUsers = action.payload;
      })

      // Fetch parties
      .addCase(fetchParties.fulfilled, (state, action) => {
        state.parties = action.payload;
      })

      // Add party
      .addCase(addParty.fulfilled, (state, action) => {
        state.parties.push(action.payload);
        state.shareableUsers.push(action.payload);
      })

      // Update party
      .addCase(updateParty.fulfilled, (state, action) => {
        const index = state.parties.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.parties[index] = action.payload;
        }
        const userIndex = state.shareableUsers.findIndex(
          (u) => u.id === action.payload.id,
        );
        if (userIndex !== -1) {
          state.shareableUsers[userIndex] = action.payload;
        }
      })

      // Delete party
      .addCase(deleteParty.fulfilled, (state, action) => {
        state.parties = state.parties.filter((p) => p.id !== action.payload);
        state.shareableUsers = state.shareableUsers.filter(
          (u) => u.id !== action.payload,
        );
      })

      // Add folder
      .addCase(addDocumentFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      })
      .addCase(updateDocumentFolder.fulfilled, (state, action) => {
        const index = state.folders.findIndex(
          (folder) => folder.id === action.payload.id,
        );
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
