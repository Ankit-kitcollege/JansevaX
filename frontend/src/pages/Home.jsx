import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  Plus,
  FileText,
  CheckCircle2,
  BarChart3,
  Clock3,
  Navigation,
  Lightbulb,
  Trash2,
  Droplets,
  Car,
  Shield,
  Trees,
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronDown,
  ExternalLink,
  Grid2x2,
  Map,
  User,
} from "lucide-react";

import ProtectedButton from "../components/ProtectedButton";

import "./Home.css";

// Helper to create Leaflet Custom DivIcon Pins
const createCustomPin = (bgColor, emojiSymbol) => {
  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white;">${emojiSymbol}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const mapMarkersData = [
  {
    id: 1,
    title: "Large Pothole on Main Avenue",
    category: "Pothole",
    location: "Civil Lines, Kanpur",
    position: [26.4600, 80.3200],
    color: "#ef4444",
    emoji: "⚠️",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Streetlight Non-Functional",
    category: "Streetlight",
    location: "Swaroop Nagar, Kanpur",
    position: [26.4750, 80.3450],
    color: "#f59e0b",
    emoji: "💡",
    status: "Action Taken",
  },
  {
    id: 3,
    title: "Overflowing Garbage Dumpster",
    category: "Garbage",
    location: "Kakadeo, Kanpur",
    position: [26.4820, 80.3050],
    color: "#10b981",
    emoji: "🗑️",
    status: "Resolved",
  },
  {
    id: 4,
    title: "Water Pipeline Leakage",
    category: "Water Leakage",
    location: "Govind Nagar, Kanpur",
    position: [26.4350, 80.3550],
    color: "#0284c7",
    emoji: "💧",
    status: "In Progress",
  },
  {
    id: 5,
    title: "Heavy Traffic & Signal Failure",
    category: "Traffic",
    location: "Kalyanpur, Kanpur",
    position: [26.4950, 80.2850],
    color: "#dc2626",
    emoji: "🚘",
    status: "Reported",
  },
  {
    id: 6,
    title: "Broken Security Fence & Unlit Zone",
    category: "Public Safety",
    location: "Kidwai Nagar, Kanpur",
    position: [26.4250, 80.3350],
    color: "#4338ca",
    emoji: "🛡️",
    status: "Under Review",
  },
];

// Inner Leaflet Search Helper Component
function LocationFlyTo({ searchQuery, setSearching }) {
  const map = useMap();

  React.useEffect(() => {
    if (!searchQuery.trim()) return;

    const performSearch = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          map.flyTo([lat, lon], 14, { duration: 1.5 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [searchQuery]);

  return null;
}

const categories = [
  {
    name: "Roads & Potholes",
    count: "45 active",
    icon: Navigation,
    colorClass: "blue",
  },
  {
    name: "Streetlights",
    count: "64 active",
    icon: Lightbulb,
    colorClass: "yellow",
  },
  {
    name: "Waste Management",
    count: "42 active",
    icon: Trash2,
    colorClass: "green",
  },
  {
    name: "Water & Drainage",
    count: "37 active",
    icon: Droplets,
    colorClass: "blue",
  },
  {
    name: "Traffic",
    count: "29 active",
    icon: Car,
    colorClass: "red",
  },
  {
    name: "Public Safety",
    count: "18 active",
    icon: Shield,
    colorClass: "purple",
  },
  {
    name: "Parks & Cleanliness",
    count: "33 active",
    icon: Trees,
    colorClass: "green",
  },
];

const activityList = [
  {
    title: "Large pothole near Main Avenue",
    location: "Civic Lines",
    time: "12 min ago",
    status: "In Progress",
    statusClass: "progress",
    icon: AlertTriangle,
    iconBg: "#fee2e2",
    iconColor: "#ef4444",
  },
  {
    title: "Streetlight not working",
    location: "Swaroop Nagar",
    time: "23 min ago",
    status: "Action Taken",
    statusClass: "taken",
    icon: Lightbulb,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    title: "Garbage overflowing near market",
    location: "Kakadeo",
    time: "41 min ago",
    status: "Resolved",
    statusClass: "resolved",
    icon: Trash2,
    iconBg: "#e6f4ed",
    iconColor: "#159b68",
  },
  {
    title: "Water leakage on MG Road",
    location: "Govind Nagar",
    time: "1 hr ago",
    status: "In Progress",
    statusClass: "progress",
    icon: Droplets,
    iconBg: "#e0f2fe",
    iconColor: "#0284c7",
  },
  {
    title: "Heavy traffic near Kalyanpur",
    location: "Kalyanpur",
    time: "2 hr ago",
    status: "Reported",
    statusClass: "reported",
    icon: Car,
    iconBg: "#fee2e2",
    iconColor: "#ef4444",
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [liveMarkers, setLiveMarkers] = useState(mapMarkersData);

  const resolveCoords = (r) => {
    let lat = Number(r.latitude || r.lat);
    let lng = Number(r.longitude || r.lng);
    const address = (r.address || r.location || "").toLowerCase();

    if (!isNaN(lat) && !isNaN(lng) && lat >= 24.5 && lat <= 28.0 && lng >= 79.0 && lng <= 82.5) {
      return [lat, lng];
    }
    if (address.includes("rooma")) return [26.3533, 80.4578];
    if (address.includes("mall road") || address.includes("mallroad")) return [26.4670, 80.3500];
    if (address.includes("swaroop nagar")) return [26.4750, 80.3180];
    if (address.includes("arya nagar")) return [26.4608, 80.3497];
    if (address.includes("kakadeo") || address.includes("kakadev")) return [26.4850, 80.3150];
    if (address.includes("civil lines")) return [26.4630, 80.3460];
    if (address.includes("shastri nagar")) return [26.4720, 80.3610];
    if (address.includes("mangla vihar")) return [26.4250, 80.3550];
    if (address.includes("kidwai nagar")) return [26.4320, 80.3350];
    if (address.includes("barra")) return [26.4210, 80.3120];
    if (address.includes("govind nagar")) return [26.4400, 80.3100];
    if (address.includes("yashoda nagar")) return [26.4150, 80.3480];
    if (address.includes("kalyanpur")) return [26.4950, 80.2600];
    if (address.includes("chakeri")) return [26.4110, 80.4050];

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) return [lat, lng];

    const hash = String(r.id || "0").split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return [26.4499 + (((hash % 100) - 50) * 0.0003), 80.3319 + ((((hash * 3) % 100) - 50) * 0.0003)];
  };

  const loadLiveMapMarkers = async () => {
    let apiReports = [];
    try {
      const res = await reportApi.getAllReports();
      apiReports = res.data || [];
    } catch (e) {}

    const localAll = JSON.parse(localStorage.getItem("civicpulse_all_reports") || "[]");
    const localMy = JSON.parse(localStorage.getItem("civicpulse_my_reports") || "[]");

    const markerMap = new Map();
    mapMarkersData.forEach(m => markerMap.set(String(m.id), m));

    [...apiReports, ...localAll, ...localMy].forEach(r => {
      if (r && r.id != null) {
        const pos = resolveCoords(r);
        markerMap.set(String(r.id), {
          id: r.id,
          title: r.title,
          category: (r.category || "General").replace(/_/g, " "),
          location: r.address || "Kanpur Zone",
          position: pos,
          color: r.category === "POTHOLE" ? "#ef4444" : r.category === "WATER_LEAKAGE" ? "#0284c7" : r.category === "GARBAGE" ? "#10b981" : "#f59e0b",
          emoji: r.category === "POTHOLE" ? "⚠️" : r.category === "WATER_LEAKAGE" ? "💧" : r.category === "GARBAGE" ? "🗑️" : "💡",
          status: r.status || "Submitted",
        });
      }
    });

    setLiveMarkers(Array.from(markerMap.values()));
  };

  React.useEffect(() => {
    loadLiveMapMarkers();
    window.addEventListener("civicpulse-report-submitted", loadLiveMapMarkers);
    return () => {
      window.removeEventListener("civicpulse-report-submitted", loadLiveMapMarkers);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveSearch(searchInput);
      setSearching(true);
    }
  };

  return (
    <div className="civic-home">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="cp-navbar">

        <div className="cp-nav-inner">

          {/* LOGO */}

          <Link to="/" className="cp-logo">

            <div className="cp-logo-icon">
              <MapPin size={22} strokeWidth={2.5} />
            </div>

            <div>
              <div className="cp-logo-name">
                JansevaX
              </div>

              <div className="cp-logo-tagline">
                Stronger Cities, Together
              </div>
            </div>

          </Link>


          {/* NAV LINKS */}

          <nav className="cp-nav-links">

            <Link to="/" className="cp-nav-link active">
              Home
            </Link>

            <ProtectedButton destination="/map" className="cp-nav-link orange-nav-link">
              <Map size={18} />
              <span>City Map</span>
            </ProtectedButton>

            <ProtectedButton destination="/dashboard" className="cp-nav-link dashboard-link orange-nav-link">
              <Grid2x2 size={18} />
              <span>Dashboard</span>
            </ProtectedButton>

            <ProtectedButton destination="/clusters" className="cp-nav-link orange-nav-link">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </ProtectedButton>

            {user && (user.role === 'DEPARTMENT_OFFICER' || user.role === 'ADMIN') && (
              <ProtectedButton destination="/notifications" className="cp-nav-link orange-nav-link">
                <Bell size={18} />
                <span>Notifications</span>
              </ProtectedButton>
            )}

          </nav>


          {/* NAV RIGHT */}

          <div className="cp-nav-right">

            <ProtectedButton destination="/map" className="cp-icon-btn" title="Search">
              <Search size={18} />
            </ProtectedButton>

            {user && (user.role === 'DEPARTMENT_OFFICER' || user.role === 'ADMIN') && (
              <ProtectedButton destination="/notifications" className="cp-icon-btn" title="Notifications">
                <Bell size={18} />
                <span className="cp-notification-dot" />
              </ProtectedButton>
            )}

            {user ? (
              <Link to="/profile" className="cp-user-profile">
                <img
                  src={
                    localStorage.getItem("civicpulseProfilePhoto") ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }
                  alt="User Avatar"
                  className="cp-user-avatar"
                />

                <div className="cp-user-info">
                  <span className="cp-user-name">
                    {user.name}
                  </span>

                  <span className="cp-user-location">
                    Kanpur, India
                  </span>
                </div>

                <ChevronDown size={14} className="text-slate-400" />
              </Link>
            ) : (
              <Link to="/login" className="cp-auth-btn">
                <User size={15} />
                Login / Register
              </Link>
            )}

          </div>

        </div>

      </header>


      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <section className="cp-hero-section">

        <div className="cp-hero-bg" />

        <div className="cp-hero-overlay" />


        <div className="cp-hero-inner">

          {/* LEFT HERO */}

          <div className="cp-hero-content">

            <div className="cp-hero-pill">
              <span className="cp-hero-pill-dot" />
              Your City, Your Voice, Our Action.
            </div>

            <h1 className="cp-hero-title">
              Make Your City Better.
              <span>
                One <span>Report</span> at a Time.
              </span>
            </h1>

            <p className="cp-hero-desc">
              JansevaX helps you report local issues, track their status,
              and build a cleaner, safer and smarter city together.
            </p>

            <div className="cp-hero-actions">

              <ProtectedButton destination="/report" className="cp-btn-primary">
                <FileText size={18} />
                Report an Issue
              </ProtectedButton>

              <ProtectedButton destination="/map" className="cp-btn-secondary">
                <MapPin size={18} />
                Explore City Map
              </ProtectedButton>

            </div>

          </div>


          {/* RIGHT LIVE CITY OVERVIEW CARD */}

          <div className="cp-overview-card">

            <div className="cp-overview-header">

              <span className="cp-overview-title">
                Live City Overview
              </span>

              <span className="cp-live-badge">
                <span className="cp-live-badge-dot" />
                Live
              </span>

            </div>


            <div className="cp-overview-grid">

              <div className="cp-stat-box">

                <div className="cp-stat-icon green">
                  <FileText size={20} />
                </div>

                <div className="cp-stat-number">
                  318
                </div>

                <div className="cp-stat-label">
                  Active Issues
                </div>

                <div className="cp-stat-trend">
                  ↑ 12% this week
                </div>

              </div>


              <div className="cp-stat-box">

                <div className="cp-stat-icon blue">
                  <CheckCircle2 size={20} />
                </div>

                <div className="cp-stat-number">
                  76
                </div>

                <div className="cp-stat-label">
                  Resolved Today
                </div>

                <div className="cp-stat-trend">
                  ↑ 8% vs yesterday
                </div>

              </div>


              <div className="cp-stat-box">

                <div className="cp-stat-icon yellow">
                  <BarChart3 size={20} />
                </div>

                <div className="cp-stat-number">
                  1,248
                </div>

                <div className="cp-stat-label">
                  Reports This Week
                </div>

                <div className="cp-stat-trend">
                  ↑ 18% vs last week
                </div>

              </div>


              <div className="cp-stat-box">

                <div className="cp-stat-icon teal">
                  <Clock3 size={20} />
                </div>

                <div className="cp-stat-number">
                  24m
                </div>

                <div className="cp-stat-label">
                  Avg. Response Time
                </div>

                <div className="cp-stat-trend">
                  ↓ 22% faster
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          CATEGORIES ROW
      ========================================================= */}

      <section className="cp-categories-section">

        <div className="cp-section-top">

          <h2 className="cp-section-title">
            Report Anything. We're Here to Help.
          </h2>

          <Link to="/report" className="cp-section-link">
            View All Categories
            <ArrowRight size={15} />
          </Link>

        </div>


        <div className="cp-categories-row">

          {categories.map((cat, idx) => {
            const Icon = cat.icon;

            return (
              <Link to="/report" key={idx} className="cp-category-pill">

                <div className={`cp-category-icon-wrapper ${cat.colorClass}`}>
                  <Icon size={19} />
                </div>

                <div className="cp-category-text">
                  <span className="cp-category-name">
                    {cat.name}
                  </span>

                  <span className="cp-category-count">
                    {cat.count}
                  </span>
                </div>

              </Link>
            );
          })}

        </div>

      </section>


      {/* =========================================================
          MIDDLE TWO-COLUMN LAYOUT
      ========================================================= */}

      <section className="cp-middle-container">

        {/* LEFT COLUMN: LIVE ISSUES ON MAP (INTERACTIVE LEAFLET GIS) */}

        <div className="cp-card">

          <div className="cp-card-header">

            <span className="cp-card-title">
              <MapPin size={18} className="text-emerald-600" />
              Live Issues on Map
            </span>

            <Link to="/map" className="cp-map-btn">
              Open Full Map
              <ExternalLink size={13} />
            </Link>

          </div>


          <div className="cp-map-box">
            {/* Mobile Interactive Map Touch Hint Overlay */}
            <div className="cp-mobile-map-hint md:hidden">
              <span>📍 Tap & Drag to Explore Map</span>
            </div>

            <form className="cp-map-search-bar" onSubmit={handleSearchSubmit}>

              <Search size={15} className="text-slate-400 mr-2" />

              <input
                type="text"
                placeholder="Search location... (e.g., Kanpur, Mall Road)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <button type="submit" className="cp-map-search-btn" title="Search Location">
                <Search size={15} />
              </button>

            </form>


            {/* Real Interactive Leaflet OpenStreetMap Map */}

            <MapContainer
              center={[26.4499, 80.3319]}
              zoom={12}
              scrollWheelZoom={false}
              zoomControl={true}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationFlyTo searchQuery={activeSearch} setSearching={setSearching} />

              {liveMarkers.map((m) => (
                <Marker
                  key={m.id}
                  position={m.position}
                  icon={createCustomPin(m.color, m.emoji)}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px]">
                      <div className="font-bold text-xs text-slate-900">{m.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.location}</div>
                      <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {m.status}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

          </div>


          {/* Map Legend Bar */}

          <div className="cp-map-legend">

            <div className="cp-legend-item">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Pothole
            </div>

            <div className="cp-legend-item">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Streetlight
            </div>

            <div className="cp-legend-item">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Garbage
            </div>

            <div className="cp-legend-item">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Water Leakage
            </div>

            <div className="cp-legend-item">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              Traffic
            </div>

          </div>

        </div>


        {/* RIGHT COLUMN: RECENT CIVIC ACTIVITY */}

        <div className="cp-card">

          <div className="cp-card-header">

            <span className="cp-card-title">
              <BarChart3 size={18} className="text-emerald-600" />
              Recent Civic Activity
            </span>

            <Link to="/dashboard" className="cp-section-link">
              View All Activity
              <ArrowRight size={14} />
            </Link>

          </div>


          <div className="cp-activity-list">

            {activityList.map((act, idx) => {
              const Icon = act.icon;

              return (
                <div className="cp-activity-row" key={idx}>

                  <div
                    className="cp-activity-icon"
                    style={{ background: act.iconBg, color: act.iconColor }}
                  >
                    <Icon size={17} />
                  </div>

                  <div className="cp-activity-details">
                    <div className="cp-activity-name">
                      {act.title}
                    </div>

                    <div className="cp-activity-meta">
                      {act.location} • {act.time}
                    </div>
                  </div>

                  <span className={`cp-status-pill ${act.statusClass}`}>
                    {act.status}
                  </span>

                </div>
              );
            })}

          </div>


          <Link to="/dashboard" className="cp-view-all-btn">
            View All Activity
          </Link>

        </div>

      </section>


      {/* =========================================================
          BOTTOM HERO BANNER ("Be a Civic Hero")
      ========================================================= */}

      <section className="cp-banner-container">

        <div className="cp-hero-banner">

          <div className="cp-banner-overlay" />

          <div className="cp-banner-content">

            <h2 className="cp-banner-title">
              Be a Civic Hero
            </h2>

            <p className="cp-banner-desc">
              Your small report can bring a big change in our city.
              Together, we can build a cleaner, safer and better tomorrow.
            </p>

            <Link to="/report" className="cp-banner-btn">
              Report an Issue Now
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </section>

      {/* =========================================================
          MOBILE FLOATING QUICK ACTION BUTTON (FAB)
      ========================================================= */}

      <ProtectedButton destination="/report" className="cp-mobile-fab md:hidden">
        <Plus size={20} strokeWidth={2.8} />
        <span>Report Issue</span>
      </ProtectedButton>

      {/* =========================================================
          GLASSMORPHISM MOBILE BOTTOM NAVIGATION BAR
      ========================================================= */}

      <nav className="cp-mobile-bottom-nav md:hidden">
        <Link to="/" className="cp-mobile-nav-item active">
          <div className="cp-mobile-icon-wrapper">
            <MapPin size={20} />
            <span className="cp-nav-glow-dot" />
          </div>
          <span>Home</span>
        </Link>
        <ProtectedButton destination="/map" className="cp-mobile-nav-item">
          <div className="cp-mobile-icon-wrapper">
            <Map size={20} />
          </div>
          <span>City Map</span>
        </ProtectedButton>
        <ProtectedButton destination="/clusters" className="cp-mobile-nav-item">
          <div className="cp-mobile-icon-wrapper">
            <BarChart3 size={20} />
          </div>
          <span>Analytics</span>
        </ProtectedButton>
        <ProtectedButton destination="/dashboard" className="cp-mobile-nav-item">
          <div className="cp-mobile-icon-wrapper">
            <Grid2x2 size={20} />
          </div>
          <span>Dashboard</span>
        </ProtectedButton>
        {user && (user.role === 'DEPARTMENT_OFFICER' || user.role === 'ADMIN') && (
          <ProtectedButton destination="/notifications" className="cp-mobile-nav-item">
            <div className="cp-mobile-icon-wrapper">
              <Bell size={20} />
            </div>
            <span>Alerts</span>
          </ProtectedButton>
        )}
      </nav>

    </div>
  );
}

