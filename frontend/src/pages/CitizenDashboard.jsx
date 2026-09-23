import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid2x2, Bell, User } from "lucide-react";
import { reportApi } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { fetchUnifiedReports } from "../utils/reportStorage";
import "./Dashboard.css";

const icons = {
  pothole: "⚠",
  POTHOLE: "⚠",
  ROAD_DAMAGE: "⚠",
  drain: "♒",
  DRAINAGE: "♒",
  streetlight: "⚡",
  STREETLIGHT: "⚡",
  garbage: "🗑",
  GARBAGE: "🗑",
  water: "🚰",
  WATER_LEAKAGE: "🚰",
  FALLEN_TREE: "🌳",
  PUBLIC_INFRASTRUCTURE: "🏛",
  OTHER: "⚡",
};

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'DEPARTMENT_OFFICER') {
      navigate('/department', { replace: true });
    } else if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardReports();
    const handleSync = () => fetchDashboardReports();
    window.addEventListener("civicpulse-report-submitted", handleSync);
    window.addEventListener("civicpulse-report-removed", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("civicpulse-report-submitted", handleSync);
      window.removeEventListener("civicpulse-report-removed", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const fetchDashboardReports = async () => {
    try {
      const unified = await fetchUnifiedReports();
      setReports(unified);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };


  const getTypeKey = (category) => {
    if (!category) return "pothole";
    const catStr = category.toString().toLowerCase();
    if (catStr.includes("pothole") || catStr.includes("road")) return "pothole";
    if (catStr.includes("drain")) return "drain";
    if (catStr.includes("street")) return "streetlight";
    if (catStr.includes("garbage")) return "garbage";
    if (catStr.includes("water")) return "water";
    return "pothole";
  };

  const getCategoryFallbackImage = (category) => {
    if (!category) return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60";
    const cat = category.toString().toUpperCase();
    if (cat.includes("POTHOLE") || cat.includes("ROAD")) return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60";
    if (cat.includes("GARBAGE") || cat.includes("WASTE")) return "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60";
    if (cat.includes("DRAIN") || cat.includes("WATER")) return "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=60";
    if (cat.includes("STREET") || cat.includes("LIGHT")) return "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=60";
    return "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=60";
  };

  const totalCount = reports.length;
  const activeCount = reports.filter((r) => r.status !== "RESOLVED" && r.status !== "CLOSED").length;
  const verifyCount = reports.filter((r) => r.status === "VERIFICATION_REQUIRED" || r.status === "RESOLVED_PENDING").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length;

  return (
    <div className="dashboard">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <Link to="/" className="brand">
          <div className="brand-icon">🏛</div>
          <span className="brand-name">
            Civic<span>Pulse</span>
          </span>
        </Link>

        <div className="nav-divider"></div>

        <div className="nav-dashboard dashboard-link" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
          <Grid2x2 size={20} />
          <span>Dashboard</span>
        </div>

        <div className="nav-right">
          <button className="notification-btn" title="Notifications" onClick={() => navigate("/notifications")}>
            <Bell size={20} />
          </button>

          <div className="profile" onClick={() => navigate("/profile")} title="Click to View Settings">
            <User size={18} />
            <span>{user?.name || "Ankit Yadav"}</span>
            <span className="dropdown">⌄</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div>
            <h1>
              Welcome, Citizens! <span>👋</span>
            </h1>

            <p>Manage and track your submitted civic problem filings.</p>
          </div>

          <Link to="/report" className="new-report-btn">
            <span>＋</span>
            New Report
          </Link>
        </section>

        {/* ================= STAT CARDS ================= */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📄</div>

            <div>
              <p className="stat-title">TOTAL REPORTS</p>
              <h2>{totalCount}</h2>
              <p className="stat-subtitle">All time reports</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>

            <div>
              <p className="stat-title">VERIFY NEEDED</p>
              <h2>{verifyCount}</h2>
              <p className="stat-subtitle">Pending verification</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p className="stat-title">ACTIVE</p>
              <h2>{activeCount}</h2>
              <p className="stat-subtitle">In progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">✓</div>

            <div>
              <p className="stat-title">RESOLVED</p>
              <h2>{resolvedCount}</h2>
              <p className="stat-subtitle">Successfully resolved</p>
            </div>
          </div>
        </section>

        {/* ================= REPORTS ================= */}
        <section className="reports-container">
          <div className="reports-header">
            <div className="reports-title">
              <span className="reports-icon">▤</span>
              <h2>My Submitted Reports</h2>
            </div>

            <span className="items-count">{reports.length} item(s)</span>
          </div>

          {/* Report List */}
          <div className="reports-list">
            {loading ? (
              <div className="p-8 text-center text-slate-500 font-bold">Loading Submitted Reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold">No reports submitted yet.</div>
            ) : (
              reports.map((report) => {
                const typeKey = getTypeKey(report.category);
                const dateStr = report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString("en-GB")
                  : "23-06-2024";
                const imgSrc = report.imageUrl && report.imageUrl.trim() !== ""
                  ? report.imageUrl
                  : getCategoryFallbackImage(report.category);

                return (
                  <div className="report-row" key={report.id}>
                    {/* Report Image Thumbnail */}
                    <div className="report-image-thumb">
                      <img
                        src={imgSrc}
                        alt={report.title || "Civic Report"}
                        className="report-thumb-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getCategoryFallbackImage(report.category);
                        }}
                      />
                    </div>

                    {/* Issue Icon */}
                    <div className={`issue-icon ${typeKey}`}>
                      {icons[typeKey] || "⚠"}
                    </div>

                    {/* Report Information */}
                    <div className="report-info">
                      <h3>{report.title}</h3>

                      <p className="report-description">{report.description}</p>

                      <p className="report-location">
                        <span>⌖</span>
                        {report.address || "Metro Zone"}
                      </p>
                    </div>

                    {/* Date + Status */}
                    <div className="report-meta">
                      <div className="report-date">
                        <span>▣</span>
                        {dateStr}
                      </div>

                      <span className="status-badge">
                        {report.status || "SUBMITTED"}
                      </span>
                    </div>

                    {/* Details Button */}
                    <Link to={`/reports/${report.id}`} className="details-btn">
                      View Details
                      <span>→</span>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Footer */}
        <footer>© 2026 JansevaX. All rights reserved.</footer>
      </main>
    </div>
  );
}
