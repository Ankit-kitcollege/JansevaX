import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Info,
  Search,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

import "./Notifications.css";

function NotificationIcon({ type }) {
  if (type === "success" || type === "SUCCESS") {
    return (
      <div className="notification-icon success">
        <CheckCircle2 size={34} strokeWidth={1.8} />
      </div>
    );
  }

  if (type === "alert" || type === "ALERT" || type === "CIVIC ALERT") {
    return (
      <div className="notification-icon alert">
        <CircleAlert size={34} strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <div className="notification-icon info">
      <Info size={34} strokeWidth={1.8} />
    </div>
  );
}

function StatusBadge({ status }) {
  const className = (status || "info").toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`status-badge ${className}`}>
      {status === "Resolved" && <CheckCircle2 size={15} />}
      {status === "Alert" && <CircleAlert size={15} />}
      {(status === "In Progress" || status === "Submitted") && <Info size={15} />}
      {status === "Info" && <Info size={15} />}
      {status || "Active"}
    </span>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      (item.title || item.message || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(search.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Alerts") return matchesSearch && (item.status === "Alert" || item.type === "CIVIC ALERT");
    if (activeTab === "Updates")
      return (
        matchesSearch &&
        (item.status === "In Progress" || item.status === "Submitted" || item.status === "Info" || item.type === "REPORT UPDATE")
      );
    if (activeTab === "Resolved")
      return matchesSearch && (item.status === "Resolved" || item.type === "SUCCESS");

    return matchesSearch;
  });

  const alertsCount = notifications.filter((n) => n.status === "Alert" || n.type === "CIVIC ALERT").length;
  const updatesCount = notifications.filter(
    (n) => n.status === "In Progress" || n.status === "Submitted" || n.status === "Info" || n.type === "REPORT UPDATE"
  ).length;
  const resolvedCount = notifications.filter((n) => n.status === "Resolved" || n.type === "SUCCESS").length;

  return (
    <div className="notifications-page">
      {/* TOP HEADER */}
      <header className="top-header">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <MapPin size={22} color="white" />
          </div>
          <span>JansevaX</span>
        </Link>

        <div className="header-right">
          <div
            className="header-notification flex items-center gap-1 cursor-pointer"
            onClick={() => navigate("/notifications")}
            title="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && <span className="bg-rose-500 text-white font-bold rounded-full px-1.5 py-0.5 text-xs">{unreadCount}</span>}
          </div>

          <div
            className="user cursor-pointer"
            onClick={() => navigate("/profile")}
            title="View Profile Settings"
          >
            <div className="avatar">
              {localStorage.getItem("civicpulseProfilePhoto") ? (
                <img
                  src={localStorage.getItem("civicpulseProfilePhoto")}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "A"
              )}
            </div>
            <span>{user?.name || "Ankit Yadav"}</span>
            <span className="down">⌄</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TITLE */}
        <section className="page-heading">
          <div className="heading-icon">
            <Bell size={30} />
          </div>

          <div>
            <div className="title-row">
              <h1>Notifications & Alerts Center</h1>
              <span className="live-badge">Live</span>
            </div>

            <p>
              Real-time updates regarding your civic problem reports and
              municipal system alerts.
            </p>
          </div>
        </section>

        {/* FILTER AREA */}
        <section className="filter-section">
          <div className="tabs">
            <button
              className={activeTab === "All" ? "tab active" : "tab"}
              onClick={() => setActiveTab("All")}
            >
              All <span>{notifications.length}</span>
            </button>

            <button
              className={activeTab === "Alerts" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Alerts")}
            >
              <CircleAlert size={16} />
              Alerts <span>{alertsCount}</span>
            </button>

            <button
              className={activeTab === "Updates" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Updates")}
            >
              <Info size={16} />
              Updates <span>{updatesCount}</span>
            </button>

            <button
              className={activeTab === "Resolved" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Resolved")}
            >
              <CheckCircle2 size={16} />
              Resolved <span>{resolvedCount}</span>
            </button>
          </div>

          <div className="tools">
            <div className="search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="filter-button cursor-pointer flex items-center gap-2"
              onClick={markAllRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={18} />
              Mark All Read
            </button>
          </div>
        </section>

        {/* NOTIFICATIONS LIST */}
        <section className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <Bell size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 mt-1">
                New updates and alerts regarding submitted civic reports will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div
                className={`notification-card ${!notification.isRead && !notification.readStatus ? "bg-emerald-50/40 border-emerald-200" : ""}`}
                key={notification.id || index}
                onClick={() => notification.id && markRead(notification.id)}
              >
                <NotificationIcon type={notification.icon || notification.type} />

                <div className="notification-content">
                  <span className={`notification-type ${notification.icon || "info"}`}>
                    {notification.type || "REPORT UPDATE"}
                  </span>

                  <h2>{notification.title || notification.message}</h2>

                  <p>{notification.description || notification.message}</p>

                  <div className="notification-meta">
                    <span>
                      <CalendarDays size={15} />
                      {notification.date || notification.timestamp || "Today"}
                    </span>

                    {notification.location && (
                      <span>
                        <MapPin size={15} />
                        {notification.location}
                      </span>
                    )}

                    {notification.status && notification.status !== "Alert" &&
                      notification.status !== "Info" && (
                        <span className="small-status">
                          <CheckCircle2 size={14} />
                          {notification.status}
                        </span>
                      )}
                  </div>
                </div>

                <div className="card-right">
                  <StatusBadge status={notification.status || "Active"} />

                  <button
                    className="view-report cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (notification.id) markRead(notification.id);
                      navigate(notification.link || "/dashboard");
                    }}
                  >
                    View Details
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* FOOTER PAGINATION */}
        <div className="pagination">
          <span>
            Showing 1 to {filteredNotifications.length} of{" "}
            {notifications.length} notifications
          </span>

          <div className="pagination-buttons">
            <button disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="current">1</button>
            <button disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
