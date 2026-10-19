import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (): Promise<NotificationState> => {
    const response = await api.get("/notifications");
    return {
      notifications: response.data.notifications,
      unreadCount: response.data.unreadCount,
    };
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`, {});
    return response.data.notification;
  },
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (item) => item.id === action.payload.id,
        );

        if (notification && !notification.read) {
          notification.read = action.payload.read;
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
