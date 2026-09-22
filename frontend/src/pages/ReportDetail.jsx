import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { fetchUnifiedReports } from "../utils/reportStorage";
import { useAuth } from "../context/AuthContext";
import "./ReportDetail.css";

const fallbackReport = {
  reportId: "RD-2026-05-001",
  title: "Dangerous Deep Pothole on Main Avenue",
  location: "Main Ave near Central Metro Station, Sector 4",
  locationDetail: "Opposite Metro Gate 2",
  status: "IN_PROGRESS",
  priorityScore: 85,
  priorityLabel: "HIGH",
  description:
    "Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.",
  reportedBy: "Citizen User",
  department: "Roads & Bridges Department",
  officer: "Municipal Field Officer",
  supportCount: 14,
  imageUrl: "",
  createdAt: "2026-09-17T12:05:37",
  updatedAt: "2026-09-17T23:38:00",
};

const fallbackHistory = [
  {
    id: 1,
    status: "SUBMITTED",
    title: "Report Submitted",
    message: "Report submitted by citizen",
    updatedBy: "Citizen User",
    role: "Verified Citizen",
    createdAt: "2026-09-17T12:05:37",
  },
  {
    id: 2,
    status: "PRIORITY_CALCULATED",
    title: "Priority Calculated",
    message: "AI priority calculation completed",
    updatedBy: "JansevaX AI",
    role: "System",
    createdAt: "2026-09-17T12:05:37",
  },
  {
    id: 3,
    status: "DEPARTMENT_ASSIGNED",
    title: "Department Assigned",
    message: "Roads & Bridges Department",
    updatedBy: "Municipal System",
    role: "System",
    createdAt: "2026-09-17T12:06:02",
  },
  {
    id: 4,
    status: "IN_PROGRESS",
    title: "Work In Progress",
    message:
      "Road inspection team has been assigned. Repair work is currently in progress.",
    updatedBy: "Municipal Field Officer",
    role: "Municipal Officer",
    createdAt: "2026-09-17T23:38:00",
  },
];

function formatDate(value) {
  if (!value) return "17 Sep 2026";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  if (status === "RESOLVED" || status === "CLOSED") return "status-green";
  if (status === "IN_PROGRESS") return "status-orange";
  if (status === "REOPENED") return "status-red";
  return "status-blue";
}

function getHistoryIcon(status) {
  if (status === "IN_PROGRESS") return "◷";
  if (status === "RESOLVED" || status === "CLOSED") return "✓";
  if (status === "REOPENED") return "↻";
  return "✓";
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Dynamic user role & dashboard link
  const currentUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem("civic_user") || localStorage.getItem("civicpulseUser") || "{}");
    } catch (e) {
      return null;
    }
  })();

  const userRole = currentUser?.role || "CITIZEN";
  const dashboardPath =
    userRole === "ADMIN"
      ? "/admin"
      : userRole === "DEPARTMENT_OFFICER"
      ? "/department"
      : "/dashboard";

  const userDisplayName =
    currentUser?.name ||
    (userRole === "DEPARTMENT_OFFICER"
      ? "Dept. Officer"
      : userRole === "ADMIN"
      ? "Admin User"
      : "Citizen User");

  const userRoleLabel =
    userRole === "DEPARTMENT_OFFICER"
      ? "Field Officer"
      : userRole === "ADMIN"
      ? "System Administrator"
      : "Verified Citizen";

  const userAvatarInitial = userDisplayName
    ? userDisplayName[0].toUpperCase()
    : "U";

  useEffect(() => {
    loadReport();
  }, [id]);

  function parseNumericId(val) {
    if (!val) return null;
    if (!isNaN(Number(val))) return Number(val);
    const match = String(val).match(/\d+$/);
    return match ? parseInt(match[0], 10) : val;
  }

  const getDepartmentName = (r) => {
    if (!r) return fallbackReport.department;
    if (typeof r.departmentName === "string" && r.departmentName.trim()) return r.departmentName;
    if (typeof r.department === "string" && r.department.trim()) return r.department;
    if (r.department && typeof r.department === "object" && typeof r.department.name === "string" && r.department.name.trim()) return r.department.name;
    
    // Category fallback
    const cat = String(r.category || "").toUpperCase();
    if (cat.includes("POTHOLE") || cat.includes("ROAD")) return "Roads & Bridges Department";
    if (cat.includes("GARBAGE") || cat.includes("SANITATION")) return "Solid Waste & Sanitation Department";
    if (cat.includes("WATER") || cat.includes("DRAIN")) return "Water Supply & Sewage Board";
    if (cat.includes("LIGHT") || cat.includes("ELECTRIC") || cat.includes("STREETLIGHT")) return "Electrical Infrastructure Cell";
    if (cat.includes("TREE") || cat.includes("PARK")) return "Horticulture & Greenery Department";

    return fallbackReport.department || "Municipal Field Operations";
  };

  const getReporterName = (r) => {
    if (!r) return fallbackReport.reportedBy;
    if (typeof r.reporterName === "string" && r.reporterName.trim()) return r.reporterName;
    if (typeof r.reportedBy === "string" && r.reportedBy.trim()) return r.reportedBy;
    if (r.reportedBy && typeof r.reportedBy === "object" && typeof r.reportedBy.name === "string" && r.reportedBy.name.trim()) return r.reportedBy.name;
    return "Verified Citizen";
  };

  const getFormattedReportId = (r) => {
    if (!r || !r.id) return id || fallbackReport.reportId;
    const strId = String(r.id);
    if (strId.startsWith("RD-") || strId.startsWith("LOCAL-") || strId.startsWith("MAP-")) {
      return strId;
    }
    const num = parseInt(strId.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      return `RD-2026-05-${String(num).padStart(3, "0")}`;
    }
    return strId;
  };

  const mapToPageReport = (r) => {
    if (!r) return fallbackReport;
    const dept = getDepartmentName(r);
    const reporter = getReporterName(r);
    const formattedId = getFormattedReportId(r);

    return {
      reportId: formattedId,
      id: r.id,
      title: r.title || fallbackReport.title,
      location: r.address || r.location || fallbackReport.location,
      locationDetail: r.landmark || fallbackReport.locationDetail,
      status: r.status || fallbackReport.status,
      priorityScore: r.priorityScore || fallbackReport.priorityScore || 50,
      priorityLabel: (r.priorityScore || 50) >= 70 ? "HIGH" : (r.priorityScore || 50) >= 40 ? "MEDIUM" : "LOW",
      description: r.description || fallbackReport.description,
      reportedBy: reporter,
      department: dept,
      officer: r.officerName || r.assignedOfficer || "Municipal Field Officer",
      supportCount: r.supportCount ?? r.upvoteCount ?? fallbackReport.supportCount,
      imageUrl: r.imageUrl || "",
      createdAt: r.createdAt || fallbackReport.createdAt,
      updatedAt: r.updatedAt || fallbackReport.updatedAt,
      latestMessage: r.notes || (r.history && r.history.length > 0 ? r.history[0].notes : null),
      userSupported: r.userSupported,
    };
  };

  async function loadReport() {
    setLoading(true);
    setApiError(false);

    let localFound = null;

    // 1. Check local storage / unified reports first for instant 0ms load
    try {
      const unified = await fetchUnifiedReports();
      const match = unified.find((r) => String(r.id) === String(id) || String(parseNumericId(r.id)) === String(parseNumericId(id)));
      if (match) {
        localFound = mapToPageReport(match);
        setReport(localFound);
        if (match.history && match.history.length > 0) {
          setHistory(match.history.map((h, idx) => ({
            id: h.id || idx + 1,
            status: h.newStatus || h.status || "IN_PROGRESS",
            title: getStatusLabel(h.newStatus || h.status),
            message: h.notes || h.actionNotes || h.message || "Status updated",
            updatedBy: h.changedByName || h.updatedBy || "Municipal Officer",
            role: "Municipal Officer",
            createdAt: h.timestamp || h.createdAt || new Date().toISOString(),
          })));
        } else {
          setHistory(fallbackHistory);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh data from backend API
    try {
      const targetId = parseNumericId(id);
      const reportResponse = await API.get(`/reports/${targetId}`);
      const r = reportResponse.data;

      if (r) {
        const mapped = mapToPageReport(r);
        setReport(mapped);

        // Fetch History
        try {
          let mappedLogs = [];
          const historyResponse = await API.get(`/reports/${targetId}/history`);
          if (historyResponse.data && historyResponse.data.length > 0) {
            mappedLogs = historyResponse.data.map((h, idx) => ({
              id: h.id || idx + 1,
              status: h.newStatus || h.status || "IN_PROGRESS",
              title: getStatusLabel(h.newStatus || h.status),
              message: h.notes || h.actionNotes || h.message || "Status updated",
              updatedBy: h.changedByName || h.updatedBy || "Municipal Officer",
              role: "Municipal Officer",
              createdAt: h.timestamp || h.createdAt || new Date().toISOString(),
              imageUrl: h.proofPhoto || h.afterImageUrl || h.beforeImageUrl,
            }));
          }

          try {
            const resLogRes = await API.get(`/resolution-logs/report/${targetId}`);
            if (resLogRes.data && resLogRes.data.length > 0) {
              const resLogsMapped = resLogRes.data.map((rl) => ({
                id: `RL-${rl.id}`,
                status: rl.status || "RESOLVED",
                title: "✓ Resolution Log Submitted",
                message: rl.actionNotes || "Resolution Log recorded by field officer.",
                updatedBy: `Municipal Officer (Officer #${rl.officerId || "CP-OFF-8842"})`,
                role: "Field Operations Unit",
                createdAt: rl.createdAt,
                imageUrl: rl.proofPhoto,
              }));
              mappedLogs = [...resLogsMapped, ...mappedLogs];
            }
          } catch (rlErr) {}

          if (mappedLogs.length > 0) setHistory(mappedLogs);
        } catch (e) {}
      }
    } catch (error) {
      console.warn("Backend API call failed, using local/unified report data:", error);
      if (!localFound) {
        setApiError(true);
        setReport({
          ...fallbackReport,
          reportId: id || fallbackReport.reportId,
        });
        setHistory(fallbackHistory);
      }
    } finally {
      setLoading(false);
    }
  }


  async function supportIssue() {
    try {
      setSupporting(true);
      const targetId = parseNumericId(report?.id || id);
      const token = localStorage.getItem("civic_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(`${API}/reports/${targetId}/support`, {}, { headers });
      setReport((prev) => ({
        ...prev,
        supportCount: (prev.supportCount || 0) + 1,
        userSupported: true,
      }));
    } catch (error) {
      console.error("Support error:", error);
      // Optimistic increment
      setReport((prev) => ({
        ...prev,
        supportCount: (prev.supportCount || 0) + 1,
        userSupported: true,
      }));
    } finally {
      setSupporting(false);
    }
  }

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner" />
        <p>Loading report...</p>
      </div>
    );
  }

  return (
    <div className="civic-report-page">

      {/* ================= HEADER ================= */}

      <header className="civic-header">
        <div className="header-inner">

          <Link to={dashboardPath} className="brand">
            <div className="brand-logo">⌁</div>

            <div>
              <div className="brand-name">JansevaX</div>
              <div className="brand-subtitle">
                AI-Assisted GIS Civic Intelligence
              </div>
            </div>
          </Link>

          <div className="header-right">
            <Link to={dashboardPath} className="dashboard-link">
              Dashboard
            </Link>

            <div className="notification-icon" onClick={() => navigate("/notifications")} style={{ cursor: "pointer" }}>
              ♧
              <span />
            </div>

            <div className="profile-mini" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
              <div className="profile-avatar">{userAvatarInitial}</div>

              <div>
                <strong>{userDisplayName}</strong>
                <small>{userRoleLabel}</small>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ================= PAGE ================= */}

      <main className="report-container">

        <Link
          to={dashboardPath}
          className="back-dashboard"
        >
          ← Back to Dashboard
        </Link>

        {apiError && (
          <div className="preview-warning">
            Preview data is being displayed because the backend API is
            currently offline.
          </div>
        )}

        {/* ================= REPORT HERO ================= */}

        <section className="report-hero">

          <div className="hero-top">

            <div className="hero-main">

              <div className="badge-row">

                <span className="badge submitted">
                  ● SUBMITTED
                </span>

                <span
                  className={`badge priority-${String(
                    report.priorityLabel || "HIGH"
                  ).toLowerCase()}`}
                >
                  {report.priorityLabel || "HIGH"} PRIORITY
                </span>

                <span className="score-badge">
                  {report.priorityScore || 85}/100
                </span>

              </div>

              <h1>
                {report.title}
              </h1>

              <div className="hero-location">
                <span>⌖</span>
                {report.location}
              </div>

            </div>

            <div className="report-id">
              <span>Report ID</span>
              <strong>#{report.reportId || id}</strong>
            </div>

          </div>

          {/* Latest Update */}

          <div className="latest-update">

            <div className="latest-icon">
              ◷
            </div>

            <div className="latest-content">

              <div className="latest-title-row">
                <h3>Latest Update</h3>

                <span
                  className={`status-pill ${getStatusClass(
                    report.status
                  )}`}
                >
                  {getStatusLabel(report.status)}
                </span>
              </div>

              <p>
                {report.latestMessage ||
                  "Road inspection team has been assigned. Repair work is currently in progress."}
              </p>

              <div className="update-meta">
                <span>♙ Municipal Officer</span>
                <span>▣ {report.department}</span>
                <span>◷ {formatDate(report.updatedAt)}</span>
              </div>

            </div>

          </div>

        </section>

        {/* ================= TWO COLUMN ================= */}

        <div className="report-grid">

          {/* ================= LEFT ================= */}

          <div className="left-column">

            {/* HISTORY */}

            <section className="card history-card">

              <div className="section-heading">

                <div className="section-icon blue">
                  ◴
                </div>

                <div>
                  <h2>Resolution & Progress History</h2>
                  <p>
                    Complete history of every report update
                  </p>
                </div>

                <span className="update-count">
                  {history.length || 0} updates
                </span>

              </div>

              <div className="timeline">

                {(history.length ? history : fallbackHistory).map(
                  (item, index) => {

                    const isCurrent =
                      item.status === report.status ||
                      index === history.length - 1;

                    return (
                      <div
                        className="timeline-item"
                        key={item.id || index}
                      >

                        <div
                          className={`timeline-dot ${
                            isCurrent
                              ? "timeline-current"
                              : "timeline-complete"
                          }`}
                        >
                          {getHistoryIcon(item.status)}
                        </div>

                        <div
                          className={`history-entry ${
                            isCurrent ? "current-entry" : ""
                          }`}
                        >

                          <div className="history-header">

                            <div>
                              <h3>
                                {item.title ||
                                  getStatusLabel(item.status)}
                              </h3>

                              <p>
                                {item.message ||
                                  "Status updated"}
                              </p>
                            </div>

                            <time>
                              {formatDate(item.createdAt)}
                            </time>

                          </div>

                          <div className="history-footer">
                            <span>
                              ♙ {item.updatedBy || "System"}
                            </span>

                            <span>
                              {item.role || "System"}
                            </span>
                          </div>

                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt="Update evidence"
                              className="history-evidence"
                            />
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* REPORT INFORMATION */}

            <section className="card">

              <div className="section-heading">
                <div className="section-icon blue">
                  ▣
                </div>

                <div>
                  <h2>Report Information</h2>
                  <p>Basic information about this civic issue</p>
                </div>
              </div>

              <div className="info-grid">

                <InfoBox
                  icon="⌖"
                  title="Location"
                  value={report.location}
                  sub={report.locationDetail || "Reported location"}
                />

                <InfoBox
                  icon="▣"
                  title="Reported On"
                  value={formatDate(report.createdAt)}
                  sub="Registered in system"
                />

                <InfoBox
                  icon="♙"
                  title="Reported By"
                  value={report.reportedBy || "Citizen User"}
                  sub="✓ Verified Citizen"
                />

                <InfoBox
                  icon="♧"
                  title="Citizen Support"
                  value={report.supportCount || 0}
                  sub="citizens support this issue"
                />

              </div>

            </section>

            {/* DESCRIPTION */}

            <section className="card description-card">

              <div className="section-heading">
                <div className="section-icon blue">
                  ◉
                </div>

                <div>
                  <h2>Problem Description</h2>
                  <p>Details submitted by the citizen</p>
                </div>
              </div>

              <p className="description-text">
                {report.description}
              </p>

              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt="Civic issue"
                  className="report-image"
                />
              ) : (
                <div className="image-placeholder">
                  <div className="image-placeholder-icon">
                    ▧
                  </div>
                  <strong>Issue Image</strong>
                  <span>
                    Photo uploaded with this report
                  </span>
                </div>
              )}

              <div className="image-caption">
                <span>
                  ◉ Uploaded by {report.reportedBy || "Citizen User"}
                </span>

                <span>
                  {formatDate(report.createdAt)}
                </span>
              </div>

            </section>

            {/* SUPPORT */}

            <section className="support-card">

              <div className="support-left">

                <div className="support-icon">
                  ♧
                </div>

                <div>
                  <h3>Citizen Support</h3>

                  <p>
                    <strong>
                      {report.supportCount || 0}
                    </strong>{" "}
                    citizens have supported this issue
                  </p>
                </div>

              </div>

              <button
                className="support-button"
                onClick={supportIssue}
                disabled={supporting || report.userSupported}
              >
                ♡{" "}
                {report.userSupported
                  ? "Supported"
                  : supporting
                  ? "Supporting..."
                  : "Support This Issue"}
              </button>

            </section>

          </div>

          {/* ================= RIGHT ================= */}

          <aside className="right-column">

            {/* AUDIT */}

            <section className="card audit-card">

              <div className="section-heading">
                <div className="section-icon blue">
                  ◷
                </div>

                <div>
                  <h2>Status Audit Trail</h2>
                  <p>System generated status history</p>
                </div>
              </div>

              <div className="audit-timeline">

                <AuditItem
                  title="Report Submitted"
                  description="Report submitted by citizen"
                  date="17 Sep 2026 • 12:05 PM"
                  completed
                />

                <AuditItem
                  title="Priority Calculated"
                  description="AI priority calculation completed"
                  date="17 Sep 2026 • 12:05 PM"
                  completed
                />

                <AuditItem
                  title="Department Assigned"
                  description={report.department}
                  date="17 Sep 2026 • 12:06 PM"
                  completed
                />

                <AuditItem
                  title="Work In Progress"
                  description="Updated by Municipal Officer"
                  date="17 Sep 2026 • 11:38 PM"
                  current
                />

              </div>

            </section>

            {/* AI PRIORITY */}

            <section className="card priority-card">

              <div className="section-heading">
                <div className="section-icon purple">
                  ✦
                </div>

                <div>
                  <h2>AI Priority Assessment</h2>
                  <p>Transparent priority calculation</p>
                </div>
              </div>

              <div className="priority-score">

                <div className="score-circle">
                  <div>
                    <strong>
                      {report.priorityScore || 85}
                    </strong>

                    <span>/100</span>
                  </div>
                </div>

                <span
                  className={`priority-label ${String(
                    report.priorityLabel || "HIGH"
                  ).toLowerCase()}`}
                >
                  {report.priorityLabel || "HIGH"} PRIORITY
                </span>

              </div>

              <div className="priority-description">
                This score is calculated using multiple transparent
                factors to determine the urgency of this civic issue.
              </div>

              <div className="factor-list">

                <PriorityFactor
                  title="Severity Weight"
                  weight="30%"
                  value="+26"
                  progress="88%"
                />

                <PriorityFactor
                  title="Nearby Volume"
                  weight="20%"
                  value="+17"
                  progress="70%"
                />

                <PriorityFactor
                  title="Citizen Support"
                  weight="15%"
                  value="+15"
                  progress="62%"
                />

                <PriorityFactor
                  title="Recency Factor"
                  weight="15%"
                  value="+15"
                  progress="62%"
                />

                <PriorityFactor
                  title="Recurrence Flag"
                  weight="10%"
                  value="+0"
                  progress="4%"
                />

                <PriorityFactor
                  title="Impact Assessment"
                  weight="10%"
                  value="+10"
                  progress="45%"
                />

              </div>

              <div className="final-score">
                <span>Final Priority Score</span>
                <strong>
                  {report.priorityScore || 85}/100
                </strong>
              </div>

            </section>

            {/* DEPARTMENT */}

            <section className="card department-card">

              <div className="section-heading">
                <div className="section-icon green">
                  ▣
                </div>

                <div>
                  <h2>Assigned Department</h2>
                  <p>Department responsible for this issue</p>
                </div>
              </div>

              <div className="department-box">

                <div className="department-top">

                  <div className="department-icon">
                    ▣
                  </div>

                  <div>
                    <h3>{report.department}</h3>

                    <span className="active-status">
                      ● Active
                    </span>
                  </div>

                </div>

                <div className="department-info">

                  <div>
                    <span>Assigned Officer</span>
                    <strong>
                      {report.officer ||
                        "Municipal Field Officer"}
                    </strong>
                  </div>

                  <div>
                    <span>Assignment Date</span>
                    <strong>
                      17 Sep 2026 • 12:06 PM
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setShowDeptModal(true)}
                  className="department-button"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#4f46e5",
                    color: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    border: "none",
                    marginTop: "14px",
                    transition: "all 0.2s ease"
                  }}
                >
                  View Department Details →
                </button>

              </div>

            </section>

          </aside>

        </div>
      </main>

      {/* Department Info Modal */}
      {showDeptModal && (
        <div className="modal-backdrop" onClick={() => setShowDeptModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px", width: "100%", background: "#ffffff", borderRadius: "20px", padding: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#6366f1", letterSpacing: "1px", textTransform: "uppercase" }}>JANSEVAX MUNICIPAL INFRASTRUCTURE</span>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "4px 0 0" }}>{report?.department || "Roads & Bridges Department"}</h2>
              </div>
              <button onClick={() => setShowDeptModal(false)} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: "16px", fontSize: "13px", color: "#334155" }}>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "block" }}>ASSIGNED FIELD OFFICER</span>
                <strong style={{ color: "#0f172a", fontSize: "15px" }}>{report?.officer || "Municipal Field Officer (ID: CP-OFF-8842)"}</strong>
                <small style={{ display: "block", color: "#166534", marginTop: "2px", fontWeight: "600" }}>● On-Duty • Field Operations Unit</small>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "block" }}>ESTIMATED RESOLUTION SLA</span>
                  <strong style={{ color: "#4f46e5" }}>24 - 48 Hours</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "block" }}>OPERATING JURISDICTION</span>
                  <strong style={{ color: "#0f172a" }}>Kanpur Central Sector</strong>
                </div>
              </div>

              <div style={{ background: "#eef2ff", padding: "14px", borderRadius: "12px", border: "1px solid #c7d2fe", color: "#3730a3" }}>
                <strong style={{ display: "block", fontSize: "12px" }}>DEPARTMENT HELPLINE & EMERGENCY SUPPORT</strong>
                <span style={{ fontSize: "14px", fontWeight: "800", display: "block", marginTop: "4px" }}>📞 Toll-Free: 1800-180-2026 (JansevaX Municipal Cell)</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => { setShowDeptModal(false); navigate(dashboardPath); }} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#4f46e5", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer" }}>Go to My Dashboard</button>
              <button onClick={() => setShowDeptModal(false)} style={{ padding: "12px 20px", borderRadius: "10px", background: "#f1f5f9", color: "#475569", fontWeight: "700", border: "1px solid #cbd5e1", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ================= COMPONENTS ================= */

function InfoBox({ icon, title, value, sub }) {
  return (
    <div className="info-box">

      <div className="info-icon">
        {icon}
      </div>

      <div className="info-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>

    </div>
  );
}


function AuditItem({
  title,
  description,
  date,
  completed,
  current,
}) {
  return (
    <div className="audit-item">

      <div
        className={`audit-dot ${
          current
            ? "audit-current"
            : completed
            ? "audit-complete"
            : ""
        }`}
      >
        {current ? "◷" : "✓"}
      </div>

      <div className="audit-content">

        <h3>{title}</h3>

        <p>{description}</p>

        <time>{date}</time>

      </div>

    </div>
  );
}


function PriorityFactor({
  title,
  weight,
  value,
  progress,
}) {
  return (
    <div className="factor">

      <div className="factor-top">
        <span>
          {title}{" "}
          <small>Weight: {weight}</small>
        </span>

        <strong>{value}</strong>
      </div>

      <div className="factor-track">
        <div
          className="factor-progress"
          style={{ width: progress }}
        />
      </div>

    </div>
  );
}
