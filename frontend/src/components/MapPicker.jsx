import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `
    <div style="
      background-color: #0284c7;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 20px #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  className: 'custom-pin-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={pinIcon} /> : null;
}

export default function MapPicker({ position, setPosition }) {
  const [locating, setLocating] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        alert('Could not get your location: ' + err.message);
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-400" /> Select Exact Location on Map *
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="px-3 py-1.5 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          {locating ? 'Locating...' : 'Use My Location'}
        </button>
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
        <MapContainer
          center={position || [28.6139, 77.2090]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>

        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-xs flex items-center justify-between text-slate-300">
          <span>Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Location Pinned
          </span>
        </div>
      </div>
    </div>
  );
}
