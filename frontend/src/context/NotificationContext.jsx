import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from './AuthContext';
import {
  getStoredNotifications,
  addLiveNotification,
  markAllNotificationsRead,
  markSingleNotificationRead,
} from '../utils/notificationStorage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(() => {
    return getStoredNotifications();
  });

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (user) {
        const res = await adminApi.getNotifications();
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
          return;
        }
      }
    } catch (err) {
      console.log('Using local notifications fallback system');
    }
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead && !n.readStatus).length;
    setUnreadCount(unread);
  }, [notifications]);

  const addNotification = (notif) => {
    const updated = addLiveNotification({
      type: notif.type || "REPORT UPDATE",
      title: notif.title || notif.message,
      description: notif.message || notif.description || "Your report details have been updated.",
      status: notif.status || (notif.type === "SUCCESS" ? "Resolved" : "In Progress"),
      location: notif.location || "Kanpur Nagar",
      icon: notif.icon || (notif.type === "SUCCESS" ? "success" : "info"),
      link: notif.link || "/dashboard",
    });
    if (updated) {
      setNotifications(updated);
    }
  };

  const markRead = (id) => {
    const updated = markSingleNotificationRead(id);
    if (updated) {
      setNotifications(updated);
    } else {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readStatus: true } : n))
      );
    }
  };


  const markAllRead = () => {
    const updated = markAllNotificationsRead();
    setNotifications(updated);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
