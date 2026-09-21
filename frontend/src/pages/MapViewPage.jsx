import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Search,
  RefreshCw,
  MapPin,
  LocateFixed,
  Maximize2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  X,
  Navigation,
  Trash2,
} from "lucide-react";
import { reportApi } from "../api/reportApi";
import { deleteReportPermanently, getRemovedReportIds, fetchUnifiedReports } from "../utils/reportStorage";

import "./Map.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const initialReports = [
  {
    id: "RD-2026-05-001",
    title: "Dangerous Deep Pothole on Main Avenue",
    category: "Potholes",
    status: "Submitted",
    lat: 26.4750,
    lng: 80.3180,
    location: "Swaroop Nagar, Main Ave, Sector 4, Kanpur",
    description: "Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.",
    date: "01 May 2026",
  },
  {
    id: "RD-2026-05-002",
    title: "Pothole & Sunken Road Surface",
    category: "Potholes",
    status: "In Progress",
    lat: 26.4608,
    lng: 80.3497,
    location: "Arya Nagar, Main Ave 40m North, Kanpur",
    description: "Sunken road section 40 meters from metro station. Water pooling and causing dangerous skidding for two-wheelers.",
    date: "02 May 2026",
  },
  {
    id: "RD-2026-05-003",
    title: "Overflowing Garbage Dumpster & Waste Spill",
    category: "Garbage",
    status: "Submitted",
    lat: 26.4850,
    lng: 80.3150,
    location: "Market Road, Kakadeo, Block B, Kanpur",
    description: "Garbage dump overflowing onto main walkway. Immediate sanitation cleanup needed.",
    date: "03 May 2026",
  },
  {
    id: "RD-2026-05-004",
    title: "Water Pipeline Leakage & Flooding",
    category: "Water Leakage",
    status: "Resolved",
    lat: 26.4630,
    lng: 80.3460,
    location: "Civil Lines, Kanpur",
    description: "Major water pipeline leakage causing street flooding and low water pressure in nearby houses.",
    date: "04 May 2026",
  },
  {
    id: "RD-2026-05-005",
    title: "Broken Streetlight & Dark Intersection",
    category: "Streetlight",
    status: "In Progress",
    lat: 26.4720,
    lng: 80.3610,
    location: "Shastri Nagar, Kanpur",
    description: "Multiple non-functional streetlights creating a dark, unsafe intersection at night.",
    date: "05 May 2026",
  },
  {
    id: "RD-2026-05-006",
    title: "Fallen Tree & Sidewalk Obstruction",
    category: "Fallen Tree",
    status: "Submitted",
    lat: 26.4670,
    lng: 80.3500,
    location: "Mall Road, Kanpur",
    description: "Large tree branch fallen across sidewalk blocking pedestrian access.",
    date: "06 May 2026",
  },
  {
    id: "RD-2026-05-007",
    title: "GARBAGE Reported at Mangla Vihar Ist Kanpur Nagar",
    category: "Garbage",
    status: "Submitted",
    lat: 26.4250,
    lng: 80.3550,
    location: "Mangla Vihar Ist Kanpur Nagar, Uttar Pradesh, 208015, India",
    description: "Today I found the garbage dumped in the middle of the road of Kanpur. Immediate sanitation cleanup needed.",
    date: "07 May 2026",
  },
];

const KANPUR_CENTER = [26.4499, 80.3319];

const statusColors = {
  Submitted: "#2563eb",
  SUBMITTED: "#2563eb",
  "In Progress": "#f59e0b",
  IN_PROGRESS: "#f59e0b",
  "Awaiting Verification": "#8b5cf6",
  VERIFICATION_REQUIRED: "#8b5cf6",
  Resolved: "#16a34a",
  RESOLVED: "#16a34a",
  Closed: "#64748b",
  CLOSED: "#64748b",
};

function createMarker(status) {
  const color = statusColors[status] || "#2563eb";

  return L.divIcon({
    className: "civic-marker-wrapper",
    html: `
      <div
        class="civic-marker"
        style="
          background:${color};
          box-shadow:0 0 0 5px ${color}22, 0 5px 15px ${color}55;
        "
      >
        <span>!</span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });
}

function MapController({ selectedReport }) {
  const map = useMap();

  React.useEffect(() => {
    if (selectedReport && selectedReport.lat && selectedReport.lng) {
      map.flyTo([selectedReport.lat, selectedReport.lng], 16, {
        duration: 1.2,
      });
    }
  }, [selectedReport, map]);

  return null;
}

function LocateButton() {
  const map = useMap();

  const locateUser = () => {
    map.locate({
      setView: true,
      maxZoom: 16,
    });
  };

  return (
    <button
      className="map-floating-button"
      onClick={locateUser}
      title="My Location"
    >
      <LocateFixed size={19} />
    </button>
  );
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

// --------------------------------------------------
// LOCATION SEARCH COMPONENT
// --------------------------------------------------
function LocationSearch({ query, onResult, onError, setSearching }) {
  const map = useMap();

  const searchLocation = async () => {
    if (!query.trim()) return;

    setSearching(true);
    onError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        onError(`"${query}" location nahi mili.`);
        setSearching(false);
        return;
      }

      const result = data[0];

      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      map.flyTo([lat, lon], 14, {
        duration: 1.5,
      });

      onResult({
        lat,
        lng: lon,
        displayName: result.display_name,
      });
    } catch (error) {
      console.error("Location search error:", error);
      onError("Location search failed. Internet connection check karo.");
    } finally {
      setSearching(false);
    }
  };

  React.useEffect(() => {
    window.civicPulseSearchLocation = searchLocation;

    return () => {
      delete window.civicPulseSearchLocation;
    };
  });

  return null;
}

export default function MapViewPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(initialReports);
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackendReports();
    const handleSync = () => fetchBackendReports();
    window.addEventListener("civicpulse-report-submitted", handleSync);
    window.addEventListener("civicpulse-report-removed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("civicpulse-report-submitted", handleSync);
      window.removeEventListener("civicpulse-report-removed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleRemoveReport = async (reportId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove Report #${reportId} from the map and dashboard?`)) {
      await deleteReportPermanently(reportId);
      setSelectedReport(null);
      fetchBackendReports();
    }
  };

  const fetchBackendReports = async () => {
    try {
      const unified = await fetchUnifiedReports();
      const formatted = unified.map((r) => ({
        id: r.id,
        title: r.title,
        category: (r.category || "General").replace(/_/g, " "),
        status: r.status || "Submitted",
        lat: r.lat || r.latitude,
        lng: r.lng || r.longitude,
        location: r.address || r.location || "Kanpur Zone",
        description: r.description,
        date: r.createdAt ? (typeof r.createdAt === 'string' ? (r.createdAt.includes('T') ? new Date(r.createdAt).toLocaleDateString("en-GB") : r.createdAt) : "Today") : "Today",
      }));
      setReports(formatted);
    } catch (err) {
      console.warn("Failed to fetch map reports", err);
    }
  };

  const handleLocationSearch = () => {
    if (!search.trim()) return;

    // First search civic reports
    const reportMatches = reports.filter((report) => {
      const text = `
        ${report.title}
        ${report.category}
        ${report.location}
        ${report.description}
      `.toLowerCase();

      return text.includes(search.toLowerCase());
    });

    // If civic report found, select it
    if (reportMatches.length > 0) {
      setSelectedReport(reportMatches[0]);
    }

    // Then search actual geographical location
    if (window.civicPulseSearchLocation) {
      window.civicPulseSearchLocation();
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const norm = (str) =>
        (str || "")
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/s$/, "")
          .trim();

      const catSelectNorm = norm(category);
      const reportCatNorm = norm(report.category);

      const categoryMatch =
        category === "All Categories" ||
        reportCatNorm.includes(catSelectNorm) ||
        catSelectNorm.includes(reportCatNorm);

      const statusMatch =
        status === "All Statuses" ||
        report.status.toLowerCase() === status.toLowerCase();

      const searchLower = search.toLowerCase().trim();
      const searchMatch =
        !searchLower ||
        report.title.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower) ||
        report.category.toLowerCase().includes(searchLower);

      return categoryMatch && statusMatch && searchMatch;
    });
  }, [reports, category, status, search]);

  const statistics = {
    total: reports.length,
    submitted: reports.filter((r) => r.status === "Submitted" || r.status === "SUBMITTED").length,
    progress: reports.filter((r) => r.status === "In Progress" || r.status === "IN_PROGRESS").length,
    resolved: reports.filter((r) => r.status === "Resolved" || r.status === "RESOLVED").length,
  };

  const refreshMap = () => {
    setLoading(true);
    fetchBackendReports();
    setTimeout(() => {
      setLoading(false);
    }, 700);
  };

  return (
    <div
      className={`civic-map-page ${
        fullscreen ? "fullscreen-map-page" : ""
      }`}
    >
      {/* HEADER */}
      <header className="map-header">
        <Link to="/" className="brand-area">
          <div className="brand-icon">
            <MapPin size={24} />
          </div>

          <div>
            <h1>JansevaX</h1>
            <span>SMART GIS NETWORK</span>
          </div>
        </Link>

        <div className="header-actions">
          <button className="header-button" onClick={refreshMap}>
            <RefreshCw size={17} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="header-button primary"
            onClick={() => setFullscreen(!fullscreen)}
          >
            <Maximize2 size={17} />
            {fullscreen ? "Exit" : "Full Screen"}
          </button>
        </div>
      </header>

      {/* PAGE TITLE */}
      <section className="page-intro">
        <div>
          <div className="title-row">
            <MapPin size={30} />

            <h2>Interactive GIS Civic Problem Map</h2>
          </div>

          <p>
            Real-time spatial visualization of citizen reports and automated problem clusters.
          </p>
        </div>

        <div className="live-status">
          <span></span>
          Live Map
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="filter-panel">
        <div className="filter-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search city, area or civic problem..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLocationSearch();
              }
            }}
          />

          <button
            type="button"
            className="search-button"
            onClick={handleLocationSearch}
            disabled={searching || !search.trim()}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Potholes</option>
          <option>Road Damage</option>
          <option>Garbage</option>
          <option>Drainage</option>
          <option>Water Leakage</option>
          <option>Streetlight</option>
          <option>Fallen Tree</option>
          <option>Public Infrastructure</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Awaiting Verification</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      </section>

      {/* SEARCH NOTIFICATION BANNERS */}
      {searchError && (
        <div className="search-error">
          ⚠️ {searchError}
        </div>
      )}

      {searchedLocation && !searchError && (
        <div className="search-result">
          📍 Found: {searchedLocation.displayName}
        </div>
      )}

      {/* DASHBOARD */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock3 size={20} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{statistics.progress}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Navigation size={20} />
          </div>

          <div>
            <span>Submitted</span>
            <strong>{statistics.submitted}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{statistics.resolved}</strong>
          </div>
        </div>
      </section>

      {/* MAP AREA */}
      <section className="map-layout">
        {/* MAP */}
        <div className="map-card">
          <MapContainer
            center={KANPUR_CENTER}
            zoom={13}
            minZoom={5}
            maxZoom={19}
            scrollWheelZoom={true}
            zoomControl={true}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationSearch
              query={search}
              setSearching={setSearching}
              onResult={(location) => {
                setSearchedLocation(location);
                setSearchError("");
              }}
              onError={(error) => {
                setSearchError(error);
              }}
            />

            <LocateButton />

            <MapController selectedReport={selectedReport} />

            <MapClickHandler onLocationSelect={setSelectedLocation} />

            {/* REPORT MARKERS */}
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={createMarker(report.status)}
                eventHandlers={{
                  click: () => setSelectedReport(report),
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <div className="popup-top">
                      <span
                        className="popup-status"
                        style={{
                          background:
                            statusColors[report.status] || "#2563eb",
                        }}
                      >
                        {report.status}
                      </span>

                      <span>#{report.id}</span>
                    </div>

                    <h3>{report.title}</h3>

                    <p className="popup-category">{report.category}</p>

                    <p className="popup-location">
                      <MapPin size={14} />
                      {report.location}
                    </p>

                    <p className="popup-description">{report.description}</p>

                    <div className="popup-date">Reported: {report.date}</div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button
                        className="popup-details-button"
                        style={{ flex: 1, margin: 0 }}
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        View Details
                      </button>

                      <button
                        onClick={(e) => handleRemoveReport(report.id, e)}
                        title="Remove Report (Officer Access)"
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
                          gap: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* SEARCHED LOCATION MARKER */}
            {searchedLocation && (
              <Marker
                position={[
                  searchedLocation.lat,
                  searchedLocation.lng,
                ]}
              >
                <Popup>
                  <div className="popup-card">
                    <strong>📍 Searched Location</strong>

                    <p style={{ marginTop: "8px" }}>
                      {searchedLocation.displayName}
                    </p>

                    <small>
                      Latitude: {searchedLocation.lat.toFixed(5)}
                      <br />
                      Longitude: {searchedLocation.lng.toFixed(5)}
                    </small>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* SELECTED LOCATION */}
            {selectedLocation && (
              <Marker
                position={[
                  selectedLocation.lat,
                  selectedLocation.lng,
                ]}
              >
                <Popup>
                  <strong>Selected Location</strong>
                  <br />
                  Latitude: {selectedLocation.lat.toFixed(5)}
                  <br />
                  Longitude: {selectedLocation.lng.toFixed(5)}
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* MAP LEGEND */}
          <div className="map-legend">
            <div className="legend-title">
              <Layers size={16} />
              Problem Status
            </div>

            {Object.entries({
              Submitted: "#2563eb",
              "In Progress": "#f59e0b",
              "Awaiting Verification": "#8b5cf6",
              Resolved: "#16a34a",
              Closed: "#64748b",
            }).map(([name, color]) => (
              <div className="legend-item" key={name}>
                <span style={{ background: color }}></span>
                {name}
              </div>
            ))}
          </div>

          {/* MAP INFO */}
          <div className="map-info">
            Showing <strong>{filteredReports.length}</strong> of {reports.length} civic reports
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="reports-panel">
          <div className="reports-header">
            <div>
              <h3>Nearby Reports</h3>
              <span>{filteredReports.length} issues found</span>
            </div>

            <div className="reports-count">{filteredReports.length}</div>
          </div>

          <div className="reports-list">
            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <Search size={35} />
                <h4>No reports found</h4>
                <p>Try changing your filters.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <button
                  className={`report-item ${
                    selectedReport?.id === report.id ? "active" : ""
                  }`}
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                >
                  <div
                    className="report-marker"
                    style={{
                      background:
                        statusColors[report.status] || "#2563eb",
                    }}
                  >
                    !
                  </div>

                  <div className="report-content">
                    <div className="report-title">{report.title}</div>

                    <div className="report-location">
                      <MapPin size={13} />
                      {report.location}
                    </div>

                    <div className="report-bottom">
                      <span
                        style={{
                          color:
                            statusColors[report.status] || "#2563eb",
                        }}
                      >
                        {report.status}
                      </span>

                      <small>{report.date}</small>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </section>

      {/* FLOATING SELECTED REPORT CARD ON MAP */}
      {selectedReport && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            left: "28px",
            zIndex: 9999,
            width: "360px",
            maxWidth: "calc(100vw - 56px)",
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(244, 63, 94, 0.2)",
            color: "#ffffff"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                padding: "4px 10px",
                borderRadius: "20px",
                background: statusColors[selectedReport.status] || "#2563eb",
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {selectedReport.status}
            </span>

            <button
              onClick={() => setSelectedReport(null)}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#94a3b8", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              title="Close card"
            >
              <X size={16} />
            </button>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px", color: "#ffffff" }}>{selectedReport.title}</h3>
          
          <div style={{ fontSize: "12px", color: "#fb7185", fontWeight: "600", marginBottom: "8px" }}>
            🏷️ {selectedReport.category}
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <MapPin size={14} style={{ color: "#f43f5e" }} />
            {selectedReport.location}
          </div>

          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "14px", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {selectedReport.description}
          </p>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => navigate(`/reports/${selectedReport.id}`)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #e11d48, #7c3aed)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Navigation size={15} />
              View Details
            </button>

            <button
              onClick={(e) => handleRemoveReport(selectedReport.id, e)}
              title="Remove Report (Officer Access)"
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="map-footer">
        <span>Powered by AI • OpenStreetMap</span>
      </footer>
    </div>
  );
}
