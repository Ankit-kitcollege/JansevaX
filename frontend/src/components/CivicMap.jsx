import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { ThumbsUp, Calendar, MapPin, ExternalLink } from 'lucide-react';

// Custom Marker Icons generator
const createCategoryIcon = (category, priorityScore) => {
  let color = '#0284c7';
  if (category === 'POTHOLE' || category === 'ROAD_DAMAGE') color = '#f97316';
  else if (category === 'GARBAGE') color = '#10b981';
  else if (category === 'DRAINAGE' || category === 'WATER_LEAKAGE') color = '#06b6d4';
  else if (category === 'STREETLIGHT') color = '#eab308';
  else if (category === 'FALLEN_TREE') color = '#84cc16';

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 11px;
    ">
      ${priorityScore || '!' }
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function CivicMap({ reports = [], clusters = [], onSupportReport }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredReports = reports.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  const centerLat = reports.length > 0 ? reports[0].latitude : 20.5937;
  const centerLng = reports.length > 0 ? reports[0].longitude : 78.9629;
  
  const indiaBounds = [
    [6.5, 68.0], // Southwest
    [38.0, 98.0] // Northeast
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-lg">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white text-[14px] font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 hover:border-slate-400 transition-all cursor-pointer shadow-sm"
        >
          <option value="ALL">All Categories</option>
          <option value="POTHOLE">Potholes</option>
          <option value="ROAD_DAMAGE">Road Damage</option>
          <option value="GARBAGE">Garbage</option>
          <option value="DRAINAGE">Drainage</option>
          <option value="WATER_LEAKAGE">Water Leakage</option>
          <option value="STREETLIGHT">Streetlight</option>
          <option value="FALLEN_TREE">Fallen Tree</option>
          <option value="PUBLIC_INFRASTRUCTURE">Public Infrastructure</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white text-[14px] font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 hover:border-slate-400 transition-all cursor-pointer shadow-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CITIZEN_VERIFICATION">Awaiting Verification</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={reports.length > 0 ? 13 : 5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        minZoom={4}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Cluster Circles Overlay */}
        {clusters.map(cluster => (
          <Circle
            key={`cluster-${cluster.id}`}
            center={[cluster.centerLatitude, cluster.centerLongitude]}
            radius={cluster.affectedAreaMeters || 150}
            pathOptions={{
              color: '#a855f7',
              fillColor: '#c084fc',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '4, 4'
            }}
          >
            <Popup>
              <div className="p-2 space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide block">Geographic Problem Cluster</span>
                <h4 className="text-xs font-bold text-white">Cluster #{cluster.id} - {cluster.category}</h4>
                <p className="text-[11px] text-slate-300">Contains {cluster.reportCount} linked citizen reports</p>
                <div className="text-[10px] text-slate-400">Priority Score: {cluster.priorityScore}/100</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Report Markers */}
        {filteredReports.map(report => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCategoryIcon(report.category, report.priorityScore)}
          >
            <Popup minWidth={260} maxWidth={320}>
              <div className="space-y-2.5 p-1">
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={report.status} />
                  <PriorityBadge score={report.priorityScore} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{report.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{report.description}</p>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800 pt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">{report.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-2.5">
                  {onSupportReport && (
                    <button
                      onClick={() => onSupportReport(report.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                        report.userSupported
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{report.supportCount || 0} Supports</span>
                    </button>
                  )}

                  <Link
                    to={`/reports/${report.id}`}
                    className="px-2.5 py-1 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 ml-auto"
                  >
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
