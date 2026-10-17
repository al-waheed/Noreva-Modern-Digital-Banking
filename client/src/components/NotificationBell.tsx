import { useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  setNotifications,
  markNotificationAsRead,
} from "../store/slices/notificationSlice";
import { fetchDashboardData } from "../store/slices/dashboardSlice";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const NotificationBell = () => {
  const { token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const previousNotificationIds = useRef(
    notifications.map((notification) => notification.id),
  );

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      try {
        const response = await api.get("/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newNotifications = response.data.notifications;

        const previousIds = previousNotificationIds.current;

        const hasNewReceivedMoneyNotification =
          previousIds.length > 0 &&
          newNotifications.some(
            (notification: { id: string; title: string }) =>
              ["Money received", "Scheduled payment sent"].includes(
                notification.title,
              ) &&
              !previousIds.includes(notification.id),
          );

        dispatch(
          setNotifications({
            notifications: newNotifications,
            unreadCount: response.data.unreadCount,
          }),
        );

        previousNotificationIds.current = newNotifications.map(
          (notification: { id: string }) => notification.id,
        );

        // A new notification can mean the user received money.
        // Refresh the existing dashboard data and update Redux.
        if (hasNewReceivedMoneyNotification) {
          await dispatch(fetchDashboardData(token)).unwrap();
        }
      } catch (error) {
        console.error("Unable to load notifications:", error);
      }
    };

    load();

    const interval = setInterval(() => {
      load();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(
        `/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(markNotificationAsRead(id));
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-90 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-360px overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                  className={`block w-full cursor-pointer border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                    !notification.read ? "bg-slate-50" : "bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.read ? "bg-transparent" : "bg-slate-900"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleString(
                          "en-NG",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </p>
                    </div>

                    {!notification.read && (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
