import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (type = "all", { rejectWithValue }) => {
    try {
      let endpoint = "/admin/notifications";
      if (type === "all") endpoint = "/admin/notifications/all";
      else if (type === "read") endpoint = "/admin/notifications/read";
      
      const res = await apiClient.get(endpoint);
      return res.data.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error");
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/notifications/${id}/mark-as-read`);
      return id; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error");
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/notifications/mark-all-as-read`);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error");
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // We can keep these synchronous reducers if we want to manually update state 
    // before the API call finishes, but it's usually better to just use extraReducers.
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = Array.isArray(action.payload) ? action.payload : [];
        state.notifications = payloadData.map((n) => {
          // Flatten nested data if it exists, sometimes it comes as a JSON string or an object
          const innerData = typeof n.data === 'string' ? JSON.parse(n.data) : (n.data || {});
          
          return {
            ...n,
            ...innerData,
            id: n.id, // preserve outer id
            type: innerData.type || n.type, // use inner type (e.g. employee_document)
            read: n.read_at !== null && n.read_at !== undefined, // read if read_at is set
          };
        });

        // calculate unread
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload,
        );

        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      });
  },
});

export const { markAsRead, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
