// src/admin/store/slices/meetingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../utils/apiClient";

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
const unwrap = (body) => {
  if (!body) return { ok: true, data: null, message: "" };
  const hasFlag = body.status !== undefined || body.success !== undefined;
  const ok = !hasFlag || body.status === "success" || body.success === true;
  return { ok, data: body.data ?? body, message: body.message };
};

const flattenErrors = (e) => {
  const errs = e.response?.data?.errors;
  if (errs) return Object.values(errs).flat().join(", ");
  return e.response?.data?.message || null;
};

const extractList = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  if (d.data && Array.isArray(d.data.data)) return d.data.data;
  if (typeof d === "object") {
    const merged = [];
    Object.values(d).forEach((v) => {
      if (Array.isArray(v)) merged.push(...v);
    });
    if (merged.length) return merged;
  }
  return [];
};

// ----------------------------------------------------
// SHAPE CONVERTERS (FIXED for your API)
// ----------------------------------------------------
export const fromMeetingApi = (api = {}) => ({
  id: api.id,
  title: api.title || "",
  date: api.date || "",
  startTime: api.start_time || "",
  endTime: api.end_time || "",
  hostId: api.host_id,
  hostName: api.host?.username || api.host_name || "",
  hostAvatar: api.host?.avatar || null,
  participantIds: (api.participants || []).map((p) => p.id),
  participants: (api.participants || []).map((p) => ({
    id: p.id,
    name: p.username || p.name || "",
    avatar: p.avatar || null,
    designation: p.type || p.designation || "",
  })),
  relatedTo: api.related_to || "",
  clientName: api.client_name || "",
  clientEmail: api.client_email || "",
  description: api.description || "",
  meetingLink: api.meeting_link || "",
  status: api.status || "Scheduled",
});

export const fromFormOptionsApi = (api = {}) => ({
  currentUser: api.current_user
    ? {
        id: api.current_user.id,
        username: api.current_user.username,
        email: api.current_user.email,
        avatar: api.current_user.avatar,
      }
    : null,
  users: (api.users || []).map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    type: u.type,
  })),
  statuses: api.statuses || [],
});

// ----------------------------------------------------
// THUNKS
// ----------------------------------------------------
export const fetchMeetingFormOptions = createAsyncThunk(
  "meetings/fetchFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/meetings/form-options");
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load options");
      return fromFormOptionsApi(data);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load options");
    }
  }
);

export const searchMeetingParticipants = createAsyncThunk(
  "meetings/searchParticipants",
  async (search, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/admin/meetings/participants/search?search=${encodeURIComponent(search)}`
      );
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to search");
      return extractList(data).map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        type: u.type,
      }));
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to search");
    }
  }
);

export const fetchMeetings = createAsyncThunk(
  "meetings/fetchMeetings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) qs.set(k, v);
      });
      const url = qs.toString() ? `/admin/meetings?${qs}` : "/admin/meetings";
      const res = await apiClient.get(url);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load meetings");
      const list = extractList(data);
      return {
        data: list.map(fromMeetingApi),
        total: data.total || list.length,
      };
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load meetings");
    }
  }
);

export const fetchMeetingById = createAsyncThunk(
  "meetings/fetchMeetingById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/meetings/${id}`);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to load meeting");
      return fromMeetingApi(data);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to load meeting");
    }
  }
);

export const createMeeting = createAsyncThunk(
  "meetings/createMeeting",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/admin/meetings", payload);
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to create meeting");
      return fromMeetingApi(data);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to create meeting");
    }
  }
);

export const updateMeeting = createAsyncThunk(
  "meetings/updateMeeting",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/admin/meetings/${id}`, data);
      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update meeting");
      return fromMeetingApi(body);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update meeting");
    }
  }
);

export const patchMeeting = createAsyncThunk(
  "meetings/patchMeeting",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/admin/meetings/${id}`, data);
      const { ok, data: body, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update meeting");
      return fromMeetingApi(body);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update meeting");
    }
  }
);

export const patchMeetingStatus = createAsyncThunk(
  "meetings/patchMeetingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/admin/meetings/${id}/status`, { status });
      const { ok, data, message } = unwrap(res.data);
      if (!ok) return rejectWithValue(message || "Failed to update status");
      return fromMeetingApi(data);
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to update status");
    }
  }
);

export const deleteMeetingApi = createAsyncThunk(
  "meetings/deleteMeeting",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/admin/meetings/${id}`);
      const { ok, message } = unwrap(res.data);
      if (ok) return { id };
      return rejectWithValue(message || "Failed to delete meeting");
    } catch (e) {
      return rejectWithValue(flattenErrors(e) || "Failed to delete meeting");
    }
  }
);

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------
const initialState = {
  meetings: [],
  total: 0,
  loading: false,
  error: null,

  currentMeeting: null,
  currentMeetingLoading: false,
  currentMeetingError: null,

  formOptions: {
    currentUser: null,
    users: [],
    statuses: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
  },
  formOptionsLoading: false,

  searchResults: [],
  searching: false,

  submitting: false,
  submittingError: null,
};


const meetingSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    clearMeetingErrors: (s) => {
      s.error = null;
      s.submittingError = null;
    },
    clearSearchResults: (s) => {
      s.searchResults = [];
    },
    clearCurrentMeeting: (s) => {
      s.currentMeeting = null;
      s.currentMeetingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingFormOptions.pending, (s) => {
        s.formOptionsLoading = true;
      })
      .addCase(fetchMeetingFormOptions.fulfilled, (s, a) => {
        s.formOptionsLoading = false;
        s.formOptions = a.payload;
      })
      .addCase(fetchMeetingFormOptions.rejected, (s) => {
        s.formOptionsLoading = false;
      })

      .addCase(searchMeetingParticipants.pending, (s) => {
        s.searching = true;
      })
      .addCase(searchMeetingParticipants.fulfilled, (s, a) => {
        s.searching = false;
        s.searchResults = a.payload;
      })
      .addCase(searchMeetingParticipants.rejected, (s) => {
        s.searching = false;
      })

      .addCase(fetchMeetings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (s, a) => {
        s.loading = false;
        s.meetings = a.payload.data;
        s.total = a.payload.total;
      })
      .addCase(fetchMeetings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchMeetingById.pending, (s) => {
        s.currentMeetingLoading = true;
        s.currentMeetingError = null;
      })
      .addCase(fetchMeetingById.fulfilled, (s, a) => {
        s.currentMeetingLoading = false;
        s.currentMeeting = a.payload;
      })
      .addCase(fetchMeetingById.rejected, (s, a) => {
        s.currentMeetingLoading = false;
        s.currentMeetingError = a.payload;
      })

      .addCase(createMeeting.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(createMeeting.fulfilled, (s, a) => {
        s.submitting = false;
        s.meetings.push(a.payload);
      })
      .addCase(createMeeting.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      .addCase(updateMeeting.pending, (s) => {
        s.submitting = true;
        s.submittingError = null;
      })
      .addCase(updateMeeting.fulfilled, (s, a) => {
        s.submitting = false;
        const idx = s.meetings.findIndex((m) => m.id === a.payload.id);
        if (idx !== -1) s.meetings[idx] = a.payload;
      })
      .addCase(updateMeeting.rejected, (s, a) => {
        s.submitting = false;
        s.submittingError = a.payload;
      })

      .addCase(patchMeeting.fulfilled, (s, a) => {
        const idx = s.meetings.findIndex((m) => m.id === a.payload.id);
        if (idx !== -1) s.meetings[idx] = a.payload;
      })
      .addCase(patchMeetingStatus.fulfilled, (s, a) => {
        const idx = s.meetings.findIndex((m) => m.id === a.payload.id);
        if (idx !== -1) s.meetings[idx] = a.payload;
      })

      .addCase(deleteMeetingApi.fulfilled, (s, a) => {
        s.meetings = s.meetings.filter((m) => m.id !== a.payload.id);
      });
  },
});

export const {
  clearMeetingErrors,
  clearSearchResults,
  clearCurrentMeeting,
} = meetingSlice.actions;
export default meetingSlice.reducer;