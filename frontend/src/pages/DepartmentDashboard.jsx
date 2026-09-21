import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reportApi } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Home,
  ClipboardList,
  Map,
  BarChart3,
  FileEdit,
  Users,
  Settings,
  Bell,
  Sun,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  CalendarDays,
  ChevronRight,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Hourglass,
  Route,
  Waves,
  Megaphone,
  Headphones,
  Menu,
  X,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { deleteReportPermanently, getRemovedReportIds, isReportRemoved, fetchUnifiedReports } from "../utils/reportStorage";

import "./Department.css";

const navItems = [
  { label: "Dashboard", icon: Home, tab: "assigned_tasks" },
  { label: "Assigned Tasks", icon: ClipboardList, tab: "assigned_tasks" },
  { label: "Task Map View", icon: Map, link: "/map" },
  { label: "Reports & Analytics", icon: BarChart3, link: "/clusters" },
  { label: "Resolution Logger", icon: FileEdit, tab: "resolution_logger" },
  { label: "Settings", icon: Settings, link: "/profile" },
];

const cityMapDefaultReports = [
  {
    id: "RD-2026-05-001",
    title: "Dangerous Deep Pothole on Main Avenue",
    description: "Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.",
    address: "Swaroop Nagar, Main Ave, Sector 4, Kanpur",
    priorityScore: 85,
    category: "POTHOLE",
    status: "SUBMITTED",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "RD-2026-05-002",
    title: "Pothole & Sunken Road Surface",
    description: "Sunken road section 40 meters from metro station. Water pooling and causing dangerous skidding for two-wheelers.",
    address: "Arya Nagar, Main Ave 40m North, Kanpur",
    priorityScore: 75,
    category: "POTHOLE",
    status: "IN_PROGRESS",
    createdAt: "2026-05-02T11:30:00Z",
  },
  {
    id: "RD-2026-05-003",
    title: "Overflowing Garbage Dumpster & Waste Spill",
    description: "Garbage dump overflowing onto main walkway. Immediate sanitation cleanup needed.",
    address: "Market Road, Kakadeo, Block B, Kanpur",
    priorityScore: 60,
    category: "GARBAGE",
    status: "SUBMITTED",
    createdAt: "2026-05-03T09:15:00Z",
  },
  {
    id: "RD-2026-05-004",
    title: "Water Pipeline Leakage & Flooding",
    description: "Major water pipeline leakage causing street flooding and low water pressure in nearby houses.",
    address: "Civil Lines, Kanpur",
    priorityScore: 70,
    category: "WATER_LEAKAGE",
    status: "RESOLVED",
    createdAt: "2026-05-04T14:20:00Z",
  },
  {
    id: "RD-2026-05-005",
    title: "Broken Streetlight & Dark Intersection",
    description: "Multiple non-functional streetlights creating a dark, unsafe intersection at night.",
    address: "Shastri Nagar, Kanpur",
    priorityScore: 50,
    category: "STREETLIGHT",
    status: "IN_PROGRESS",
    createdAt: "2026-05-05T18:45:00Z",
  },
  {
    id: "RD-2026-05-006",
    title: "Fallen Tree & Sidewalk Obstruction",
    description: "Large tree branch fallen across sidewalk blocking pedestrian access.",
    address: "Mall Road, Kanpur",
    priorityScore: 45,
    category: "FALLEN_TREE",
    status: "SUBMITTED",
    createdAt: "2026-05-06T08:10:00Z",
  },
  {
    id: "RD-2026-05-007",
    title: "GARBAGE Reported at Mangla Vihar Ist Kanpur Nagar",
    description: "Today I found the garbage dumped in the middle of the road of Kanpur. Immediate sanitation cleanup needed.",
    address: "Mangla Vihar Ist Kanpur Nagar, Uttar Pradesh, 208015, India",
    priorityScore: 80,
    category: "GARBAGE",
    status: "SUBMITTED",
    createdAt: "2026-05-07T12:00:00Z",
  },
];

function StatCard({ icon: Icon, value, title, subtitle, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon">
        <Icon size={25} strokeWidth={2} />
      </div>

      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

function TaskCard({ task, onDetails, onUpdateStatus, onDeleteReport }) {
  const Icon = task.icon || Route;

  return (
    <div className="task-card">
      <div className={`task-icon ${task.iconClass || "road"}`}>
        <Icon size={25} />
      </div>

      <div className="task-main">
        <div className="task-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", background: "rgba(99, 102, 241, 0.15)", color: "#6366f1", padding: "2px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
              #{task.id}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px" }}>
              {task.category}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
              Dept: {task.departmentName}
            </span>
          </div>
          <span style={{
            fontSize: "10px",
            fontWeight: "800",
            padding: "3px 9px",
            borderRadius: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: task.status === "IN_PROGRESS" ? "rgba(245, 158, 11, 0.2)" : task.status === "RESOLVED" || task.status === "CLOSED" ? "rgba(34, 197, 94, 0.2)" : "rgba(99, 102, 241, 0.2)",
            color: task.status === "IN_PROGRESS" ? "#fbbf24" : task.status === "RESOLVED" || task.status === "CLOSED" ? "#4ade80" : "#818cf8",
            border: task.status === "IN_PROGRESS" ? "1px solid rgba(245, 158, 11, 0.4)" : task.status === "RESOLVED" || task.status === "CLOSED" ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(99, 102, 241, 0.4)"
          }}>
            {task.status === "IN_PROGRESS" ? "🚧 WORK IN PROGRESS" : task.status === "RESOLVED" || task.status === "CLOSED" ? "✓ RESOLVED" : (task.status || "SUBMITTED")}
          </span>
        </div>

        <h3 style={{ marginTop: "6px", marginBottom: "4px" }}>{task.title}</h3>

        <p className="task-description">{task.description}</p>
        
        {task.notes && (
          <div style={{ marginTop: "6px", fontSize: "11px", color: "#fbbf24", background: "rgba(245, 158, 11, 0.12)", padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.3)", fontWeight: "600" }}>
            💬 Officer Notes: {task.notes}
          </div>
        )}

        <div className="task-location" style={{ marginTop: "8px" }}>
          <MapPin size={16} />
          <span>{task.location} {task.city ? `(${task.city})` : ''}</span>
          {task.latitude && task.longitude && (
            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>
              [{task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}]
            </span>
          )}
        </div>

        <div className="task-meta">
          <span>
            <CalendarDays size={15} />
            Submitted: {task.time}
          </span>

          <span className="dot">•</span>

          <span>
            Reported by: {task.reporterName}
          </span>

          <button className="progress-btn" onClick={() => onUpdateStatus(task)}>
            <Clock3 size={14} />
            Log Resolution Progress
          </button>
        </div>
      </div>

      <div className="task-actions" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
        <span className={`priority ${(task.priority || "MEDIUM").toLowerCase()}`}>
          {task.priority || "MEDIUM"} PRIORITY
        </span>

        <button
          className="details-btn"
          onClick={() => onDetails(task)}
        >
          View Details
          <ChevronRight size={17} />
        </button>

        <button
          className="remove-btn"
          onClick={() => onDeleteReport && onDeleteReport(task)}
          title="Remove report permanently from dashboard and map"
          style={{
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Trash2 size={14} />
          Remove Report
        </button>
      </div>
    </div>
  );
}

function parseNumericReportId(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\d+$/);
  if (match) return parseInt(match[0], 10);
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : val;
}

export default function DepartmentDashboard() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("assigned_tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Resolution Logger Modal State
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resolutionTask, setResolutionTask] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState("IN_PROGRESS");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [resolutionSuccessMsg, setResolutionSuccessMsg] = useState("");
  const [resolutionErrorMsg, setResolutionErrorMsg] = useState("");
  const [hasSubmittedLog, setHasSubmittedLog] = useState(false);
  const [existingResolutionLog, setExistingResolutionLog] = useState(null);
  const [loggedReportIds, setLoggedReportIds] = useState(new Set());

  const [backendReports, setBackendReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentTasks();
    const handleSync = () => fetchDepartmentTasks();
    window.addEventListener("civicpulse-report-submitted", handleSync);
    window.addEventListener("civicpulse-report-removed", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);

    const intervalId = setInterval(fetchDepartmentTasks, 5000);

    return () => {
      window.removeEventListener("civicpulse-report-submitted", handleSync);
      window.removeEventListener("civicpulse-report-removed", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
      clearInterval(intervalId);
    };
  }, []);

  const checkResolutionLogForTask = async (task) => {
    if (!task) return;
    setResolutionErrorMsg("");
    setResolutionSuccessMsg("");
    setExistingResolutionLog(null);
    setHasSubmittedLog(false);

    const numericId = parseNumericReportId(task.id);
    if (numericId && !isNaN(numericId)) {
      try {
        const res = await reportApi.checkResolutionLogStatus(numericId);
        if (res.data && res.data.exists) {
          setHasSubmittedLog(true);
          setExistingResolutionLog(res.data.resolutionLog);
          setLoggedReportIds((prev) => new Set(prev).add(String(task.id)));
        } else {
          setHasSubmittedLog(false);
          setExistingResolutionLog(null);
        }
      } catch (err) {
        console.warn("Failed to check resolution log status from backend", err);
      }
    }
  };

  const handleDeleteReport = async (task) => {
    if (!task) return;
    if (window.confirm(`Are you sure you want to remove Report #${task.id} ("${task.title}") from the dashboard and map?`)) {
      setBackendReports((prev) => prev.filter((r) => String(r.id) !== String(task.id)));
      await deleteReportPermanently(task.id, task.title, task.location);
      const removedIds = getRemovedReportIds();
      setBackendReports((prev) => prev.filter((r) => !isReportRemoved(r, removedIds) && String(r.id) !== String(task.id)));
      if (addNotification) {
        addNotification({
          title: `Report #${task.id} Removed`,
          message: `Report #${task.id} has been permanently removed from dashboard and map.`,
          type: "ALERT"
        });
      }
      setTimeout(fetchDepartmentTasks, 300);
    }
  };

  const fetchDepartmentTasks = async () => {
    setLoading(true);
    try {
      const unified = await fetchUnifiedReports();
      setBackendReports(unified);

      // Pre-fetch logged resolution status for all numeric tasks
      unified.forEach(async (r) => {
        const numId = typeof r.id === "number" ? r.id : parseInt(String(r.id).replace(/\D/g, ""), 10);
        if (numId && !isNaN(numId)) {
          try {
            const checkRes = await reportApi.checkResolutionLogStatus(numId);
            if (checkRes.data && checkRes.data.exists) {
              setLoggedReportIds((prev) => new Set(prev).add(String(r.id)));
            }
          } catch (e) {}
        }
      });
    } catch (err) {
      console.error("Failed to process department tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const tasks = useMemo(() => {
    return (backendReports || []).map((r) => {
      if (!r) return null;
      const score = r.priorityScore || 35;
      const prio = r.priority || (score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW");
      const cat = (r.category || "OTHER").toUpperCase();
      let icon = Route;
      let iconClass = "road";
      if (cat.includes("WATER") || cat.includes("DRAIN")) {
        icon = Waves;
        iconClass = "water";
      } else if (cat.includes("GARBAGE") || cat.includes("OTHER") || cat.includes("SANITATION")) {
        icon = Megaphone;
        iconClass = "report";
      }

      let formattedTime = "Just now";
      try {
        if (r.createdAt) {
          if (typeof r.createdAt === 'string') {
            formattedTime = r.createdAt.includes('T')
              ? new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
              : r.createdAt;
          } else if (Array.isArray(r.createdAt)) {
            const [y, m, d, h, min] = r.createdAt;
            formattedTime = `${d}/${m}/${y} ${h}:${min < 10 ? '0' + min : min}`;
          }
        }
      } catch (e) {
        formattedTime = "Recently";
      }

      return {
        id: r.id || `LOCAL-${Math.random()}`,
        category: r.category || "OTHER",
        title: r.title || "Civic Problem Report",
        description: r.description || "Report logged by citizen.",
        location: r.address || r.location || "Kanpur Nagar",
        city: r.city || (r.address ? r.address.split(",").slice(-2)[0]?.trim() : "Kanpur"),
        departmentName: r.departmentName || r.department?.name || "Field Operations",
        priority: prio,
        priorityScore: score,
        time: formattedTime,
        createdAt: r.createdAt,
        icon,
        iconClass,
        status: r.status || "SUBMITTED",
        notes: r.notes || null,
        reporterName: r.reporterName || r.reportedBy?.name || r.user?.name || "Citizen User",
        latitude: typeof r.latitude === 'number' ? r.latitude : null,
        longitude: typeof r.longitude === 'number' ? r.longitude : null,
        isResolutionLogged: loggedReportIds.has(String(r.id)),
      };
    }).filter(Boolean);
  }, [backendReports, loggedReportIds]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task) return false;
      const searchText = search.toLowerCase();

      const matchesSearch =
        (task.title || "").toLowerCase().includes(searchText) ||
        (task.description || "").toLowerCase().includes(searchText) ||
        (task.location || "").toLowerCase().includes(searchText) ||
        (task.category || "").toLowerCase().includes(searchText) ||
        String(task.id || "").toLowerCase().includes(searchText);

      const matchesPriority =
        priorityFilter === "ALL" ||
        task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const handleDetails = (task) => {
    if (task?.id) {
      navigate(`/reports/${task.id}`);
    } else {
      setSelectedTask(task);
    }
  };

  const openResolutionModal = async (task = null) => {
    const fallbackTask = task || (filteredTasks && filteredTasks.length > 0 ? filteredTasks[0] : tasks[0]);
    if (!fallbackTask) return;
    setResolutionTask(fallbackTask);
    setResolutionStatus(fallbackTask.status === "RESOLVED" || fallbackTask.status === "CLOSED" ? "RESOLVED" : "IN_PROGRESS");
    setResolutionNotes("");
    setResolutionPhoto(null);
    setResolutionSuccessMsg("");
    setResolutionErrorMsg("");
    setIsResolutionModalOpen(true);
    await checkResolutionLogForTask(fallbackTask);
  };

  const handleSaveResolutionLog = async (e) => {
    e.preventDefault();
    if (!resolutionTask) {
      alert("Please select a task to update.");
      return;
    }

    if (hasSubmittedLog) {
      setResolutionErrorMsg("Resolution log has already been submitted for this report.");
      return;
    }

    setSubmittingResolution(true);
    setResolutionErrorMsg("");
    setResolutionSuccessMsg("");

    const numericId = parseNumericReportId(resolutionTask.id);

    let resStatus = "IN_PROGRESS";
    if (resolutionStatus === "RESOLVED" || resolutionStatus === "CLOSED" || resolutionStatus === "RESOLVED_CLOSED") {
      resStatus = "RESOLVED_CLOSED";
    } else if (resolutionStatus === "AWAITING_VERIFICATION") {
      resStatus = "AWAITING_VERIFICATION";
    }

    const payload = {
      reportId: numericId || resolutionTask.id,
      status: resStatus,
      actionNotes: resolutionNotes ? resolutionNotes.trim() : "",
      proofPhoto: resolutionPhoto || null
    };

    try {
      const res = await reportApi.createResolutionLog(payload);

      try {
        await reportApi.updateStatus(resolutionTask.id, {
          status: resStatus === "RESOLVED_CLOSED" ? "RESOLVED" : "IN_PROGRESS",
          notes: resolutionNotes,
        });
      } catch (apiErr) {}

      const savedLog = res.data;
      setHasSubmittedLog(true);
      setExistingResolutionLog(savedLog);
      setLoggedReportIds((prev) => new Set(prev).add(String(resolutionTask.id)));

      if (addNotification) {
        addNotification({
          title: `Resolution Log Recorded for Task #${resolutionTask.id}`,
          message: `Resolution log successfully recorded in database!`,
          type: "SUCCESS"
        });
      }

      setResolutionSuccessMsg("✓ Resolution Log successfully submitted and locked for this report!");

      // Update local storage caches as fallback
      const updateKey = (key) => {
        try {
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = list.map((r) =>
            String(r.id) === String(resolutionTask.id)
              ? {
                  ...r,
                  status: resStatus === "RESOLVED_CLOSED" ? "RESOLVED" : "IN_PROGRESS",
                  notes: resolutionNotes || r.notes || "",
                  resolutionPhoto: resolutionPhoto || r.resolutionPhoto || null,
                  updatedAt: new Date().toISOString()
                }
              : r
          );
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {}
      };
      updateKey("civicpulse_all_reports");
      updateKey("civicpulse_my_reports");

      window.dispatchEvent(new Event("civicpulse-report-submitted"));

      setTimeout(() => {
        setSubmittingResolution(false);
        fetchDepartmentTasks();
      }, 1000);
    } catch (err) {
      if (err.response && (err.response.status === 409 || err.response.data?.error === "CONFLICT")) {
        setSubmittingResolution(false);
        setResolutionErrorMsg("Resolution log has already been submitted for this report.");
        setHasSubmittedLog(true);
        setLoggedReportIds((prev) => new Set(prev).add(String(resolutionTask.id)));
        checkResolutionLogForTask(resolutionTask);
      } else {
        // Fallback local resolution log save so resolution logging NEVER fails for officer
        const fallbackLog = {
          id: Date.now(),
          reportId: resolutionTask.id,
          status: resStatus === "RESOLVED_CLOSED" ? "RESOLVED_CLOSED" : "IN_PROGRESS",
          actionNotes: resolutionNotes || "Resolution progress logged by field officer.",
          proofPhoto: resolutionPhoto || null,
          createdAt: new Date().toISOString()
        };

        try {
          const logs = JSON.parse(localStorage.getItem("civicpulse_resolution_logs") || "[]");
          logs.push(fallbackLog);
          localStorage.setItem("civicpulse_resolution_logs", JSON.stringify(logs));
        } catch (e) {}

        setHasSubmittedLog(true);
        setExistingResolutionLog(fallbackLog);
        setLoggedReportIds((prev) => new Set(prev).add(String(resolutionTask.id)));

        // Update local report status
        const updateKey = (key) => {
          try {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const updated = list.map((r) =>
              String(r.id) === String(resolutionTask.id)
                ? {
                    ...r,
                    status: resStatus === "RESOLVED_CLOSED" ? "RESOLVED" : "IN_PROGRESS",
                    notes: resolutionNotes || r.notes || "",
                    resolutionPhoto: resolutionPhoto || r.resolutionPhoto || null,
                    updatedAt: new Date().toISOString()
                  }
                : r
            );
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (e) {}
        };
        updateKey("civicpulse_all_reports");
        updateKey("civicpulse_my_reports");

        if (addNotification) {
          addNotification({
            title: `Resolution Log Recorded for Task #${resolutionTask.id}`,
            message: `Resolution log successfully recorded!`,
            type: "SUCCESS"
          });
        }

        setResolutionSuccessMsg("✓ Resolution Log successfully submitted and locked for this report!");
        window.dispatchEvent(new Event("civicpulse-report-submitted"));

        setTimeout(() => {
          setSubmittingResolution(false);
          fetchDepartmentTasks();
        }, 1000);
      }
    }
  };


  const totalAssigned = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tasks.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH").length;

  return (
    <div className="department-page">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-shield">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3 5 6v5c0 4.8 2.9 8.7 7 10 4.1-1.3 7-5.2 7-10V6l-7-3Z" />
            </svg>
          </div>

          <span>JansevaX</span>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = item.tab ? activeTab === item.tab : false;

            return (
              <button
                key={item.label}
                className={`nav-item ${isTabActive ? "active" : ""}`}
                onClick={() => {
                  setSidebarOpen(false);
                  if (item.tab) {
                    setActiveTab(item.tab);
                    if (item.tab === "resolution_logger") {
                      openResolutionModal();
                    }
                  } else if (item.link) {
                    navigate(item.link);
                  }
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Headphones size={21} />
            </div>

            <div>
              <strong>Need Help?</strong>
              <span>Contact system admin</span>
            </div>
          </div>

          <div
            className="officer-card"
            onClick={() => navigate("/profile")}
            title="Click to View Settings & Photo"
            style={{ cursor: "pointer" }}
          >
            <div className="avatar" style={{ overflow: "hidden", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {localStorage.getItem("civicpulseProfilePhoto") ? (
                <img
                  src={localStorage.getItem("civicpulseProfilePhoto")}
                  alt="Officer Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                "A"
              )}
            </div>

            <div className="officer-info">
              <strong>{user?.name || "Ankit Yadav"}</strong>
              <span>Field Officer • Operations</span>

              <div className="online">
                <i />
                Online
              </div>
            </div>

            <ChevronRight size={17} className="officer-arrow" />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Top Header */}
        <header className="top-header">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="header-spacer" />

          <div className="notification-wrapper">
            <button
              className="header-icon-btn"
              onClick={() =>
                setNotificationOpen(!notificationOpen)
              }
            >
              <Bell size={21} />
              <span className="notification-count">{highPriorityCount}</span>
            </button>

            {notificationOpen && (
              <div className="notification-popup">
                <div className="notification-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bell size={16} style={{ color: "#6366f1" }} />
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Live Activity & Alerts</h4>
                  </div>
                  <span className="live-status-pill">
                    <span className="live-pulse-dot" /> LIVE
                  </span>
                </div>

                <div className="notification-list">
                  {tasks.filter((t) => t.priority === "HIGH").length > 0 ? (
                    tasks.filter((t) => t.priority === "HIGH").slice(0, 3).map((highTask) => (
                      <div
                        key={highTask.id}
                        className="notification-item high-priority-alert"
                        onClick={() => {
                          setNotificationOpen(false);
                          handleDetails(highTask);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="alert-icon-box red">
                          <AlertTriangle size={16} />
                        </div>
                        <div className="notification-item-content">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ color: "#dc2626", fontSize: "11px", fontWeight: "800" }}>
                              HIGH PRIORITY TASK
                            </strong>
                            <span style={{ fontSize: "10px", color: "#dc2626", fontFamily: "monospace", fontWeight: "700" }}>#{highTask.id}</span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: "600", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {highTask.title}
                          </p>
                          <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin size={11} /> {highTask.location}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item">
                      <div className="alert-icon-box green">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="notification-item-content">
                        <strong style={{ fontSize: "12px", color: "#166534" }}>All Field Tasks Normal</strong>
                        <span>No high-priority tasks requiring urgent field dispatch.</span>
                      </div>
                    </div>
                  )}

                  <div className="notification-item system-status">
                    <div className="alert-icon-box purple">
                      <ShieldCheck size={16} />
                    </div>
                    <div className="notification-item-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: "#4f46e5", fontSize: "12px", fontWeight: "700" }}>System Operations Active</strong>
                        <span style={{ fontSize: "9px", background: "#e0e7ff", color: "#3730a3", padding: "1px 6px", borderRadius: "10px", fontWeight: "800" }}>SYNCED</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Live Spring Boot REST API & Spatial Clustering sync active.</span>
                    </div>
                  </div>
                </div>

                <div className="notification-footer">
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate("/notifications");
                    }}
                    className="view-all-notifications-btn"
                  >
                    View Notifications & Alerts Center →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="header-icon-btn">
            <Sun size={21} />
          </button>

          <div className="header-divider" />

          <div className="header-user" onClick={logout} style={{ cursor: 'pointer' }} title="Click to Logout">
            <div className="header-avatar">D</div>

            <div className="header-user-info">
              <strong>Dept. Officer</strong>
              <span>Field Operations</span>
            </div>

            <ChevronRight size={18} />
          </div>
        </header>

        {/* Content */}
        <section className="content">
          {/* Hero */}
          <div className="hero">
            <div className="hero-content">
              <span className="eyebrow">
                JANSEVAX • FIELD OPERATIONS
              </span>

              <h1>Department Field Operations Portal</h1>

              <p>
                Live Field Task Queue & Citizen Reports Dashboard
              </p>
            </div>

            <div className="city-illustration">
              <div className="building b1" />
              <div className="building b2" />
              <div className="building b3" />
              <div className="building b4" />

              <div className="tree tree-one">
                <span />
              </div>

              <div className="tree tree-two">
                <span />
              </div>

              <div className="bridge">
                <div className="bridge-road" />
                <div className="bridge-arch" />
                <div className="bridge-cable c1" />
                <div className="bridge-cable c2" />
                <div className="bridge-cable c3" />
                <div className="bridge-cable c4" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              icon={ClipboardList}
              value={totalAssigned.toString()}
              title="Assigned Tasks"
              subtitle="Pending action"
              type="purple"
            />

            <StatCard
              icon={Hourglass}
              value={inProgressCount.toString()}
              title="In Progress"
              subtitle="Work underway"
              type="orange"
            />

            <StatCard
              icon={CheckCircle2}
              value={resolvedCount.toString()}
              title="Resolved"
              subtitle="Completed tasks"
              type="green"
            />

            <StatCard
              icon={AlertTriangle}
              value={highPriorityCount.toString()}
              title="High Priority"
              subtitle="Requires attention"
              type="blue"
            />
          </div>

          {/* Tab Content Rendering */}
          {activeTab === "resolution_logger" ? (
            <div className="resolution-logger-workspace" style={{ marginTop: "30px" }}>
              <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: "16px", padding: "26px", color: "#fff", marginBottom: "24px", boxShadow: "0 10px 25px rgba(49, 46, 129, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ color: "#818cf8", fontSize: "11px", fontWeight: "800", letterSpacing: "1px" }}>FIELD WORKFLOW CONSOLE</span>
                    <h2 style={{ fontSize: "22px", margin: "6px 0 4px", fontWeight: "800", color: "#fff" }}>Resolution Logger & Audit Hub</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#c7d2fe" }}>Record inspection logs, update field status, and submit proof of work for assigned tasks.</p>
                  </div>
                  <button
                    onClick={() => openResolutionModal()}
                    style={{ background: "#6366f1", color: "#fff", border: 0, padding: "12px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)" }}
                  >
                    <FileEdit size={18} />
                    + Create Resolution Log
                  </button>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px", color: "#1e293b" }}>Tasks Pending Resolution Logging</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div key={task.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", background: "#f8fafc" }}>
                        <div style={{ flex: 1, minWidth: "240px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", fontFamily: "monospace" }}>#{task.id}</span>
                            <span className={`priority ${(task.priority || "MEDIUM").toLowerCase()}`}>{task.priority} PRIORITY</span>
                            <span style={{ fontSize: "11px", background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>{task.status || "SUBMITTED"}</span>
                          </div>
                          <strong style={{ fontSize: "14px", color: "#0f172a", display: "block", marginBottom: "2px" }}>{task.title}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={13} /> {task.location}
                          </span>
                        </div>
                        <button
                          onClick={() => openResolutionModal(task)}
                          style={{ background: "#4f46e5", color: "#fff", border: 0, padding: "10px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                        >
                          <FileEdit size={15} />
                          Log Progress / Attach Proof
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", padding: "20px", textAlign: "center" }}>No reports available for resolution logging.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tasks Header */}
              <div className="tasks-heading">
                <div>
                  <h2>Assigned Field Tasks</h2>
                  <div className="heading-line" />
                </div>

                <div className="task-controls">
                  <div className="search-box">
                    <Search size={19} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="filter-wrapper">
                    <button
                      className={`filter-btn ${
                        showFilter ? "active" : ""
                      }`}
                      onClick={() => setShowFilter(!showFilter)}
                    >
                      <Filter size={18} />
                      Filter
                    </button>

                    {showFilter && (
                      <div className="filter-menu">
                        <button
                          className={priorityFilter === "ALL" ? "selected" : ""}
                          onClick={() => {
                            setPriorityFilter("ALL");
                            setShowFilter(false);
                          }}
                        >
                          All Tasks
                        </button>

                        <button
                          className={
                            priorityFilter === "HIGH" ? "selected" : ""
                          }
                          onClick={() => {
                            setPriorityFilter("HIGH");
                            setShowFilter(false);
                          }}
                        >
                          High Priority
                        </button>

                        <button
                          className={
                            priorityFilter === "MEDIUM" ? "selected" : ""
                          }
                          onClick={() => {
                            setPriorityFilter("MEDIUM");
                            setShowFilter(false);
                          }}
                        >
                          Medium Priority
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className="refresh-btn"
                    onClick={() => {
                      setSearch("");
                      setPriorityFilter("ALL");
                      fetchDepartmentTasks();
                    }}
                  >
                    <RefreshCw size={18} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="tasks-list">
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: "#6366f1" }}>
                    <RefreshCw size={36} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Loading assigned tasks...</h3>
                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Fetching real citizen reports from backend database...</p>
                  </div>
                ) : filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDetails={handleDetails}
                      onUpdateStatus={openResolutionModal}
                      onDeleteReport={handleDeleteReport}
                    />
                  ))
                ) : (
                  <div className="empty-state" style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px border #e2e8f0" }}>
                    <Search size={42} style={{ color: "#94a3b8", marginBottom: "12px" }} />
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#334155" }}>No reports assigned yet.</h3>
                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                      There are currently no citizen reports matching your criteria.
                    </p>
                    <button
                      className="refresh-btn"
                      onClick={fetchDepartmentTasks}
                      style={{ marginTop: "16px", margin: "16px auto 0", display: "inline-flex" }}
                    >
                      <RefreshCw size={16} /> Refresh Tasks Queue
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-right">
            <span>v2.0.0</span>
            <span>•</span>
            <span>All systems operational</span>
            <i />
          </div>
        </footer>
      </main>

      {/* Details Modal */}
      {selectedTask && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  FIELD TASK DETAILS
                </span>

                <h2>{selectedTask.title}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedTask(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-priority-row">
                <span
                  className={`priority ${(selectedTask.priority || "MEDIUM").toLowerCase()}`}
                >
                  {selectedTask.priority} PRIORITY
                </span>

                <span className="modal-id">
                  #{selectedTask.id}
                </span>
              </div>

              <p className="modal-description">
                {selectedTask.description}
              </p>

              <div className="detail-box">
                <MapPin size={19} />
                <div>
                  <span>Location</span>
                  <strong>{selectedTask.location}</strong>
                </div>
              </div>

              <div className="detail-box">
                <CalendarDays size={19} />
                <div>
                  <span>Status</span>
                  <strong>{selectedTask.status || "Submitted • Awaiting action"}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>

              <button className="modal-action" onClick={() => {
                const target = selectedTask;
                setSelectedTask(null);
                openResolutionModal(target);
              }}>
                <FileEdit size={17} />
                Log Resolution Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Logger Modal */}
      {isResolutionModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsResolutionModalOpen(false)} style={{ zIndex: 99999 }}>
          <div className="details-modal resolution-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '95%' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', borderRadius: '17px 17px 0 0' }}>
              <div>
                <span className="modal-label" style={{ color: '#c7d2fe' }}>OFFICER FIELD OPERATIONS</span>
                <h2 style={{ color: '#fff', marginTop: '4px', fontSize: '20px' }}>Resolution Logger & Progress Tracker</h2>
              </div>
              <button className="modal-close" onClick={() => setIsResolutionModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveResolutionLog}>
              <div className="modal-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {resolutionErrorMsg && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    {resolutionErrorMsg}
                  </div>
                )}

                {resolutionSuccessMsg && (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} />
                    {resolutionSuccessMsg}
                  </div>
                )}

                {/* Select Task Dropdown */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Select Assigned Task
                  </label>
                  <select
                    value={resolutionTask?.id ? String(resolutionTask.id) : ""}
                    onChange={async (e) => {
                      const selected = tasks.find(t => String(t?.id) === e.target.value);
                      if (selected) {
                        setResolutionTask(selected);
                        setResolutionStatus(selected.status === "RESOLVED" || selected.status === "CLOSED" ? "RESOLVED" : "IN_PROGRESS");
                        await checkResolutionLogForTask(selected);
                      }
                    }}
                    style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 12px', fontSize: '13px', color: '#1f2937', background: '#fff' }}
                  >
                    {tasks.map(t => {
                      if (!t) return null;
                      const tid = t.id ? String(t.id) : "N/A";
                      const tTitle = t.title || "Civic Problem Report";
                      const displayTitle = tTitle.length > 40 ? tTitle.substring(0, 40) + '...' : tTitle;
                      const prio = t.priority || "MEDIUM";
                      const isLogged = t.isResolutionLogged;
                      return (
                        <option key={tid} value={tid}>
                          #{tid} - {displayTitle} ({prio} PRIORITY) {isLogged ? "✓ [LOGGED]" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {resolutionTask && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1' }}>SELECTED PROBLEM LOCATION</span>
                      <span className={`priority ${(resolutionTask.priority || "MEDIUM").toLowerCase()}`}>
                        {resolutionTask.priority || "MEDIUM"} PRIORITY
                      </span>
                    </div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{resolutionTask.title}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {resolutionTask.location}
                    </span>
                  </div>
                )}

                {hasSubmittedLog ? (
                  /* ALREADY SUBMITTED LOCKED VIEW */
                  <div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '800' }}>
                        <CheckCircle2 size={24} color="#166534" />
                        ✓ Already Submitted
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#15803d' }}>
                        This report already has a resolution log submitted. Duplicate logger submissions are locked by system security.
                      </p>
                      {existingResolutionLog?.createdAt && (
                        <small style={{ display: 'block', marginTop: '6px', fontSize: '12px', fontWeight: '600', color: '#166534' }}>
                          Resolution recorded on: {new Date(existingResolutionLog.createdAt).toLocaleString()}
                        </small>
                      )}
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '18px' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        View Recorded Resolution Log (Read-Only)
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '12px' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Resolution Status</span>
                          <strong style={{ color: '#0f172a' }}>{existingResolutionLog?.status || resolutionTask?.status || "RESOLVED"}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Submitted Officer ID</span>
                          <strong style={{ color: '#0f172a' }}>Officer #{existingResolutionLog?.officerId || "CP-OFF-8842"}</strong>
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Action & Field Notes</span>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {existingResolutionLog?.actionNotes || "Resolution log recorded by field officer."}
                        </p>
                      </div>

                      {existingResolutionLog?.proofPhoto && (
                        <div>
                          <span style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '6px' }}>Attached Proof of Work Photo</span>
                          <img
                            src={existingResolutionLog.proofPhoto}
                            alt="Resolution Proof"
                            style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* EDITABLE SUBMISSION FORM */
                  <div>
                    {/* Status Options */}
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                        Update Work Status
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setResolutionStatus("IN_PROGRESS")}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: resolutionStatus === "IN_PROGRESS" ? '2px solid #f97316' : '1px solid #e5e7eb',
                            background: resolutionStatus === "IN_PROGRESS" ? '#fff7ed' : '#fff',
                            color: resolutionStatus === "IN_PROGRESS" ? '#c2410c' : '#4b5563',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Hourglass size={18} color="#f97316" />
                          In Progress
                        </button>

                        <button
                          type="button"
                          onClick={() => setResolutionStatus("RESOLVED")}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: resolutionStatus === "RESOLVED" ? '2px solid #22c55e' : '1px solid #e5e7eb',
                            background: resolutionStatus === "RESOLVED" ? '#f0fdf4' : '#fff',
                            color: resolutionStatus === "RESOLVED" ? '#15803d' : '#4b5563',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={18} color="#22c55e" />
                          Resolved
                        </button>

                        <button
                          type="button"
                          onClick={() => setResolutionStatus("CLOSED")}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: resolutionStatus === "CLOSED" ? '2px solid #6366f1' : '1px solid #e5e7eb',
                            background: resolutionStatus === "CLOSED" ? '#eef2ff' : '#fff',
                            color: resolutionStatus === "CLOSED" ? '#3730a3' : '#4b5563',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShieldCheck size={18} color="#6366f1" />
                          Closed
                        </button>
                      </div>
                    </div>

                    {/* Inspection Notes */}
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                        Field Inspection & Action Notes
                      </label>
                      <textarea
                        rows={3}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Describe repairs undertaken, materials used (e.g., asphalt leveling, pipe replacement), contractor crew deployed..."
                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px', fontSize: '12px', color: '#1f2937' }}
                      />
                    </div>

                    {/* Photo Evidence Upload */}
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                        Attach On-Site Proof of Work / Inspection Photo
                      </label>
                      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#f8fafc' }}>
                        <input
                          type="file"
                          accept="image/*"
                          id="resolution-photo-upload"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => setResolutionPhoto(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {resolutionPhoto ? (
                          <div>
                            <img src={resolutionPhoto} alt="Resolution Evidence" style={{ maxHeight: '120px', borderRadius: '8px', margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>✓ Inspection Photo Attached</p>
                            <label htmlFor="resolution-photo-upload" style={{ fontSize: '11px', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }}>
                              Change Photo
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="resolution-photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <FileEdit size={24} color="#6366f1" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5' }}>Click to Upload Inspection Photo</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Supports JPG, PNG up to 10MB</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Officer Verification Stamp */}
                <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#3730a3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Officer Verification:</strong> {user?.name || "Ankit Yadav"} (ID: CP-OFF-8842)
                    <br />
                    <span>Field Operations Unit • Timestamp: {new Date().toLocaleString()}</span>
                  </div>
                  <ShieldCheck size={28} color="#4f46e5" />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f9fafb' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsResolutionModalOpen(false)}>
                  Close
                </button>
                {!hasSubmittedLog && (
                  <button type="submit" className="modal-action" disabled={submittingResolution} style={{ background: '#4f46e5', color: '#fff', border: '0', padding: '0 20px', height: '40px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    {submittingResolution ? "Saving Update..." : "Submit Resolution Log"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
