import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{
        notifications: Notification[];
        unreadCount: number;
      }>,
    ) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (item) => item.id === action.payload,
      );

      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, markNotificationAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
