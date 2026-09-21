// Real-time Notification Storage Helper for JansevaX

const NOTIF_KEY = "jansevax_live_notifications";

const defaultSystemNotifications = [
  {
    id: "sys-1",
    type: "REPORT UPDATE",
    title: "Pothole Repair Scheduled",
    description: "Municipal field operations team assigned to Sector 4 Pothole report.",
    date: "Today, 02:30 PM",
    status: "In Progress",
    icon: "info",
    location: "Main Ave, Kanpur",
  },
  {
    id: "sys-2",
    type: "CIVIC ALERT",
    title: "Kanpur Water Pipeline Maintenance",
    description: "Scheduled pipeline maintenance in Shyam Nagar & Civil Lines zone.",
    date: "Today, 10:00 AM",
    status: "Alert",
    icon: "alert",
    location: "Shyam Nagar, Kanpur",
  },
  {
    id: "sys-3",
    type: "REPORT UPDATE",
    title: "Garbage Dump Cleared",
    description: "Sanitation squad completed clearance of reported garbage hotspot.",
    date: "Yesterday, 05:15 PM",
    status: "Resolved",
    icon: "success",
    location: "Mangla Vihar 1st, Kanpur",
  },
  {
    id: "sys-4",
    type: "SYSTEM UPDATE",
    title: "JansevaX AI Engine Upgrade",
    description: "Spatial DBSCAN clustering parameters updated for faster municipal resolution.",
    date: "Yesterday, 09:00 AM",
    status: "Info",
    icon: "info",
  },
];

export const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(defaultSystemNotifications));
      return defaultSystemNotifications;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultSystemNotifications;
  }
};

export const addLiveNotification = ({ type, title, description, status = "Info", location = "", icon = "info", link = "/dashboard" }) => {
  try {
    const current = getStoredNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: type || "REPORT UPDATE",
      title,
      description,
      date: "Just now",
      status: status || "In Progress",
      icon: icon || (status === "Resolved" ? "success" : status === "Alert" ? "alert" : "info"),
      location,
      link,
      isRead: false,
    };
    const updated = [newNotif, ...current];
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save notification:", e);
  }
};

export const getUnreadNotificationCount = () => {
  const notifs = getStoredNotifications();
  return notifs.filter((n) => !n.isRead).length;
};

export const markAllNotificationsRead = () => {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => ({ ...n, isRead: true, readStatus: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  return updated;
};

export const markSingleNotificationRead = (id) => {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true, readStatus: true } : n));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  return updated;
};

