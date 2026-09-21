// Centralized Robust Report Storage & Deletion Helper for JansevaX

import { reportApi } from "../api/reportApi";

const REMOVED_KEY = "civicpulse_removed_reports";

export const getRemovedReportIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) || "[]"));
  } catch (e) {
    return new Set();
  }
};

const normalizeStr = (str) => (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

export const isReportRemoved = (r, removedIdsSet) => {
  if (!r) return true;
  const strId = String(r.id || "");
  if (strId && removedIdsSet.has(strId)) return true;

  const cleanTitle = normalizeStr(r.title);
  const cleanAddr = normalizeStr(r.address || r.location);
  if (cleanTitle && removedIdsSet.has(`title:${cleanTitle}`)) return true;
  if (cleanTitle && cleanAddr && removedIdsSet.has(`title_addr:${cleanTitle}_${cleanAddr}`)) return true;

  return false;
};

export const deleteReportPermanently = async (reportId, reportTitle = "", reportAddress = "") => {
  const strId = String(reportId || "");
  const cleanTitle = normalizeStr(reportTitle);
  const cleanAddr = normalizeStr(reportAddress);

  // 1. Save to removed blacklist in localStorage
  try {
    const existing = Array.from(getRemovedReportIds());
    const newRemoved = new Set([...existing]);
    if (strId) newRemoved.add(strId);
    if (cleanTitle) newRemoved.add(`title:${cleanTitle}`);
    if (cleanTitle && cleanAddr) newRemoved.add(`title_addr:${cleanTitle}_${cleanAddr}`);
    
    localStorage.setItem(REMOVED_KEY, JSON.stringify(Array.from(newRemoved)));
  } catch (e) {
    console.warn("Failed to update removed reports blacklist", e);
  }

  // 2. Remove from local user reports cache
  try {
    const allReports = JSON.parse(localStorage.getItem("civicpulse_all_reports") || "[]");
    const myReports = JSON.parse(localStorage.getItem("civicpulse_my_reports") || "[]");

    const matchesReport = (r) => {
      if (!r) return true;
      if (strId && String(r.id) === strId) return true;
      const rTitle = normalizeStr(r.title);
      const rAddr = normalizeStr(r.address || r.location);
      if (cleanTitle && rTitle === cleanTitle) return true;
      if (cleanTitle && cleanAddr && rTitle === cleanTitle && rAddr === cleanAddr) return true;
      return false;
    };

    const filteredAll = allReports.filter((r) => !matchesReport(r));
    const filteredMy = myReports.filter((r) => !matchesReport(r));

    localStorage.setItem("civicpulse_all_reports", JSON.stringify(filteredAll));
    localStorage.setItem("civicpulse_my_reports", JSON.stringify(filteredMy));
  } catch (e) {
    console.warn("Failed to filter local storage reports", e);
  }

  // 3. Delete from backend database if numeric ID
  const isCustomPrefix = strId.startsWith("RD-") || strId.startsWith("MAP-") || strId.startsWith("REPORT-") || strId.startsWith("LOCAL-");
  const numId = typeof reportId === "number" ? reportId : (isCustomPrefix ? null : parseInt(strId.replace(/\D/g, ""), 10));
  
  if (numId && !isNaN(numId) && !isCustomPrefix) {
    try {
      await reportApi.deleteReport(numId);
    } catch (apiErr) {
      console.warn("Backend API report delete failed or already deleted", apiErr);
    }
  }

  // 4. Dispatch global events to update UI across all pages
  window.dispatchEvent(new Event("civicpulse-report-submitted"));
  window.dispatchEvent(new Event("civicpulse-report-removed"));
};

export const canonicalDefaultReports = [
  {
    id: "RD-2026-05-001",
    title: "Dangerous Deep Pothole on Main Avenue",
    description: "Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.",
    address: "Swaroop Nagar, Main Ave, Sector 4, Kanpur",
    location: "Swaroop Nagar, Main Ave, Sector 4, Kanpur",
    lat: 26.4750,
    lng: 80.3180,
    latitude: 26.4750,
    longitude: 80.3180,
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
    location: "Arya Nagar, Main Ave 40m North, Kanpur",
    lat: 26.4608,
    lng: 80.3497,
    latitude: 26.4608,
    longitude: 80.3497,
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
    location: "Market Road, Kakadeo, Block B, Kanpur",
    lat: 26.4850,
    lng: 80.3150,
    latitude: 26.4850,
    longitude: 80.3150,
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
    location: "Civil Lines, Kanpur",
    lat: 26.4630,
    lng: 80.3460,
    latitude: 26.4630,
    longitude: 80.3460,
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
    location: "Shastri Nagar, Kanpur",
    lat: 26.4720,
    lng: 80.3610,
    latitude: 26.4720,
    longitude: 80.3610,
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
    location: "Mall Road, Kanpur",
    lat: 26.4670,
    lng: 80.3500,
    latitude: 26.4670,
    longitude: 80.3500,
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
    location: "Mangla Vihar Ist Kanpur Nagar, Uttar Pradesh, 208015, India",
    lat: 26.4250,
    lng: 80.3550,
    latitude: 26.4250,
    longitude: 80.3550,
    priorityScore: 80,
    category: "GARBAGE",
    status: "SUBMITTED",
    createdAt: "2026-05-07T12:00:00Z",
  },
];

export const resolveReportCoords = (r) => {
  let lat = Number(r.latitude || r.lat);
  let lng = Number(r.longitude || r.lng);

  const address = (r.address || r.location || "").toLowerCase();

  if (!isNaN(lat) && !isNaN(lng) && lat >= 24.5 && lat <= 28.0 && lng >= 79.0 && lng <= 82.5) {
    return { lat, lng };
  }

  if (address.includes("naubasta")) return { lat: 26.4060, lng: 80.3340 };
  if (address.includes("rooma")) return { lat: 26.3533, lng: 80.4578 };
  if (address.includes("mall road") || address.includes("mallroad")) return { lat: 26.4670, lng: 80.3500 };
  if (address.includes("swaroop nagar")) return { lat: 26.4750, lng: 80.3180 };
  if (address.includes("arya nagar")) return { lat: 26.4608, lng: 80.3497 };
  if (address.includes("kakadeo") || address.includes("kakadev")) return { lat: 26.4850, lng: 80.3150 };
  if (address.includes("civil lines")) return { lat: 26.4630, lng: 80.3460 };
  if (address.includes("shastri nagar")) return { lat: 26.4720, lng: 80.3610 };
  if (address.includes("mangla vihar")) return { lat: 26.4250, lng: 80.3550 };
  if (address.includes("kidwai nagar")) return { lat: 26.4320, lng: 80.3350 };
  if (address.includes("barra")) return { lat: 26.4210, lng: 80.3120 };
  if (address.includes("govind nagar")) return { lat: 26.4400, lng: 80.3100 };
  if (address.includes("yashoda nagar")) return { lat: 26.4150, lng: 80.3480 };
  if (address.includes("kalyanpur")) return { lat: 26.4950, lng: 80.2600 };
  if (address.includes("chakeri")) return { lat: 26.4110, lng: 80.4050 };

  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }

  const idStr = String(r.id || "0");
  const hash = idStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offsetLat = ((hash % 100) - 50) * 0.0003;
  const offsetLng = (((hash * 3) % 100) - 50) * 0.0003;
  return { lat: 26.4499 + offsetLat, lng: 80.3319 + offsetLng };
};

export const fetchUnifiedReports = async () => {
  let apiReports = [];
  try {
    const res = await reportApi.getAllReports();
    apiReports = res.data || [];
  } catch (err) {}

  const localAll = JSON.parse(localStorage.getItem("civicpulse_all_reports") || "[]");
  const localMy = JSON.parse(localStorage.getItem("civicpulse_my_reports") || "[]");

  const map = new Map();

  canonicalDefaultReports.forEach((r) => {
    if (r && r.id != null) {
      const coords = resolveReportCoords(r);
      map.set(String(r.id), { ...r, lat: coords.lat, lng: coords.lng, latitude: coords.lat, longitude: coords.lng });
    }
  });

  apiReports.forEach((r) => {
    if (r && r.id != null) {
      const coords = resolveReportCoords(r);
      const key = String(r.id);
      const existing = map.get(key);
      const merged = existing ? { ...existing, ...r } : r;
      map.set(key, { ...merged, lat: coords.lat, lng: coords.lng, latitude: coords.lat, longitude: coords.lng });
    }
  });

  [...localAll, ...localMy].forEach((r) => {
    if (r && r.id != null) {
      const coords = resolveReportCoords(r);
      const key = String(r.id);
      const existing = map.get(key);
      const merged = existing ? { ...existing, ...r } : r;
      map.set(key, { ...merged, lat: coords.lat, lng: coords.lng, latitude: coords.lat, longitude: coords.lng });
    }
  });

  const removedIds = getRemovedReportIds();
  return Array.from(map.values()).filter((r) => !isReportRemoved(r, removedIds));
};
