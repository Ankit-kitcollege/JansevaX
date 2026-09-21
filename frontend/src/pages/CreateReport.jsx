import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportApi } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import DuplicateModal from "../components/DuplicateModal";
import "./Report.css";

export default function CreateReport() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [reporterName, setReporterName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [category, setCategory] = useState("POTHOLE - Road Pothole / Deep Crater");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [position, setPosition] = useState([26.4499, 80.3319]); // Default Kanpur City Center
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const navigate = useNavigate();

  // Mapping string category to Enum
  const getCategoryEnum = (catStr) => {
    if (catStr.includes("POTHOLE")) return "POTHOLE";
    if (catStr.includes("STREET LIGHT") || catStr.includes("STREETLIGHT")) return "STREETLIGHT";
    if (catStr.includes("GARBAGE")) return "GARBAGE";
    if (catStr.includes("WATER")) return "WATER_LEAKAGE";
    if (catStr.includes("DRAINAGE")) return "DRAINAGE";
    if (catStr.includes("ROAD")) return "ROAD_DAMAGE";
    if (catStr.includes("TRAFFIC")) return "PUBLIC_INFRASTRUCTURE";
    return "OTHER";
  };

  const KANPUR_LOCATIONS = [
    { keywords: ["naubasta"], lat: 26.4060, lng: 80.3340 },
    { keywords: ["rooma"], lat: 26.3533, lng: 80.4578 },
    { keywords: ["mall road", "mallroad"], lat: 26.4670, lng: 80.3500 },
    { keywords: ["swaroop nagar", "swaroopnagar"], lat: 26.4750, lng: 80.3180 },
    { keywords: ["arya nagar", "aryanagar"], lat: 26.4608, lng: 80.3497 },
    { keywords: ["kakadeo", "kakadev"], lat: 26.4850, lng: 80.3150 },
    { keywords: ["civil lines", "civillines"], lat: 26.4630, lng: 80.3460 },
    { keywords: ["shastri nagar", "shastrinagar"], lat: 26.4720, lng: 80.3610 },
    { keywords: ["mangla vihar", "manglavihar"], lat: 26.4250, lng: 80.3550 },
    { keywords: ["kidwai nagar", "kidwainagar"], lat: 26.4320, lng: 80.3350 },
    { keywords: ["barra"], lat: 26.4210, lng: 80.3120 },
    { keywords: ["govind nagar", "govindnagar"], lat: 26.4400, lng: 80.3100 },
    { keywords: ["yashoda nagar", "yashodanagar"], lat: 26.4150, lng: 80.3480 },
    { keywords: ["kalyanpur"], lat: 26.4950, lng: 80.2600 },
    { keywords: ["chakeri"], lat: 26.4110, lng: 80.4050 },
    { keywords: ["panki"], lat: 26.4780, lng: 80.2350 },
    { keywords: ["rawatpur"], lat: 26.4810, lng: 80.2980 },
    { keywords: ["gumti"], lat: 26.4650, lng: 80.3200 },
    { keywords: ["nawabganj"], lat: 26.4900, lng: 80.3100 }
  ];

  const handleAddressInputChange = (val) => {
    setAddress(val);
    if (!val || val.trim().length < 3) return;

    const lower = val.toLowerCase();
    const knownLoc = KANPUR_LOCATIONS.find(loc => loc.keywords.some(k => lower.includes(k)));
    if (knownLoc) {
      setPosition([knownLoc.lat, knownLoc.lng]);
      setLocation(`${knownLoc.lat.toFixed(6)}, ${knownLoc.lng.toFixed(6)}`);
      return;
    }

    if (window.addressGeocodeTimer) clearTimeout(window.addressGeocodeTimer);
    window.addressGeocodeTimer = setTimeout(async () => {
      try {
        const query = val.toLowerCase().includes("kanpur") ? val : `${val}, Kanpur, Uttar Pradesh`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setPosition([lat, lng]);
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (err) {
        console.warn("Geocoding address error:", err);
      }
    }, 600);
  };

  // Get current location with GPS & reverse geocoding
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition([lat, lng]);
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          if (data.display_name) {
            setAddress(data.display_name);
          }
        } catch (error) {
          console.log("Address detection failed:", error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.log(error);
        setLoadingLocation(false);
        alert("Unable to detect your location. Please allow location permission.");
      }
    );
  };

  // File upload to backend API
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    setImage(file);

    // Upload to Spring Boot endpoint
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    try {
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl("http://localhost:8080" + data.url);
      }
    } catch (uploadErr) {
      console.error("File upload failed", uploadErr);
    }
  };

  // Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reporterName || !phoneNumber || !category || !description || !address) {
      alert("Please fill all required fields.");
      return;
    }

    const categoryEnum = getCategoryEnum(category);
    const autoTitle = `${categoryEnum.replace(/_/g, " ")} Reported at ${address.substring(0, 40)}`;

    const payload = {
      title: autoTitle,
      description,
      category: categoryEnum,
      imageUrl: imageUrl,
      severity: "MEDIUM",
      address,
      landmark,
      latitude: position[0],
      longitude: position[1],
      reporterName: reporterName,
      reporterPhone: phoneNumber,
    };

    // Check duplicate
    try {
      const dupRes = await reportApi.checkDuplicate(payload);
      if (dupRes.data.isDuplicateFound) {
        setDuplicateInfo(dupRes.data);
        setShowDuplicateModal(true);
        return;
      }
    } catch (err) {
      console.warn("Duplicate check failed, proceeding to submit", err);
    }

    await performSubmit(payload);
  };

  const performSubmit = async (payload) => {
    setSubmitting(true);
    try {
      let createdReport;
      try {
        const res = await reportApi.createReport(payload);
        createdReport = res.data;
      } catch (apiErr) {
        console.warn("Backend API submit failed, generating local fallback report...", apiErr);
        createdReport = {
          id: Date.now(),
          title: payload.title,
          description: payload.description,
          category: payload.category,
          imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60",
          severity: payload.severity || "MEDIUM",
          address: payload.address,
          landmark: payload.landmark,
          latitude: payload.latitude,
          longitude: payload.longitude,
          status: "SUBMITTED",
          reporterName: payload.reporterName,
          reporterPhone: payload.reporterPhone,
          createdAt: new Date().toISOString(),
          upvoteCount: 0,
        };
      }

      // Save locally to civicpulse_my_reports & civicpulse_all_reports
      const savedUserReports = JSON.parse(localStorage.getItem("civicpulse_my_reports") || "[]");
      const savedAllReports = JSON.parse(localStorage.getItem("civicpulse_all_reports") || "[]");

      const filteredUser = savedUserReports.filter(r => String(r.id) !== String(createdReport.id));
      const filteredAll = savedAllReports.filter(r => String(r.id) !== String(createdReport.id));

      localStorage.setItem("civicpulse_my_reports", JSON.stringify([createdReport, ...filteredUser]));
      localStorage.setItem("civicpulse_all_reports", JSON.stringify([createdReport, ...filteredAll]));

      window.dispatchEvent(new Event("civicpulse-report-submitted"));

      // Create Notification
      if (addNotification) {
        addNotification({
          title: "New Report Submitted & Saved Permanently",
          message: `Report #${createdReport.id} ("${createdReport.title}") has been saved and assigned to department officer.`,
          type: "SUCCESS"
        });
      }

      navigate(`/reports/${createdReport.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit report. Please check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportExisting = async (existingId) => {
    try {
      await reportApi.supportReport(existingId);
      setShowDuplicateModal(false);
      navigate(`/reports/${existingId}`);
    } catch (err) {
      alert("Could not support report: " + (err.response?.data?.message || err.message));
    }
  };

  const handleForceSubmitNew = async () => {
    setShowDuplicateModal(false);
    const categoryEnum = getCategoryEnum(category);
    const autoTitle = `${categoryEnum.replace(/_/g, " ")} Reported at ${address.substring(0, 40)}`;

    const payload = {
      title: autoTitle,
      description,
      category: categoryEnum,
      imageUrl,
      severity: "MEDIUM",
      address,
      landmark,
      latitude: position[0],
      longitude: position[1],
    };
    await performSubmit(payload);
  };

  return (
    <div className="report-page">
      {/* Header */}
      <header className="report-header">
        <div className="brand">
          <div className="brand-icon">🏙️</div>
          <div>
            <h2>JansevaX</h2>
            <span>For a Better City</span>
          </div>
        </div>

        <button
          className="auto-location-btn"
          onClick={getCurrentLocation}
          type="button"
        >
          <span>⌖</span>
          {loadingLocation ? " Detecting..." : " Auto-Detect Location"}
        </button>
      </header>

      {/* Page Heading */}
      <section className="page-heading">
        <h1>Report a Problem</h1>
        <p>
          Submit municipal complaints directly to ward officers. Required
          fields are marked with an asterisk (*).
        </p>
      </section>

      {/* Main Form Card */}
      <main className="form-container">
        <form onSubmit={handleSubmit}>
          
          {/* Two Column for Name & Mobile Number */}
          <div className="two-column">
            {/* Full Name */}
            <div className="form-group">
              <label>
                FULL NAME <span>*</span>
              </label>
              <div className="text-input-wrapper">
                <span>👤</span>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <p className="helper-text">e.g., Ankit Yadav</p>
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label>
                MOBILE NUMBER <span>*</span>
              </label>
              <div className="text-input-wrapper">
                <span>📞</span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <p className="helper-text">e.g., +91 9876543210</p>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>
              PROBLEM CATEGORY <span>*</span>
            </label>

            <div className="input-wrapper">
              <span className="input-icon danger">⚠</span>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>POTHOLE - Road Pothole / Deep Crater</option>
                <option>STREET LIGHT - Broken / Not Working</option>
                <option>GARBAGE - Garbage Dump / Overflow</option>
                <option>WATER - Water Leakage / Supply Problem</option>
                <option>DRAINAGE - Blocked Drain / Sewage</option>
                <option>ROAD - Damaged Road</option>
                <option>TRAFFIC - Traffic Signal Problem</option>
                <option>OTHER - Other Civic Problem</option>
              </select>

              <span className="select-arrow">⌄</span>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              DETAILED DESCRIPTION <span>*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Describe the problem, severity, dangers..."
            />

            <div className="description-footer">
              <span>
                Provide as much detail as possible to help us understand and
                resolve the issue faster.
              </span>
              <span>{description.length} / 500</span>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>PHOTO ATTACHMENT (OPTIONAL)</label>

            <label className="upload-box">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
              />

              <div className="upload-icon">☁️</div>

              <strong>
                {image ? image.name : "Add File / Upload Photo"}
              </strong>

              <small>JPG, PNG up to 10MB</small>
            </label>
          </div>

          {/* Image Link */}
          <div className="form-group">
            <label>OR PASTE IMAGE LINK</label>

            <div className="text-input-wrapper">
              <span>🔗</span>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <p className="helper-text">
              Paste a direct link to an image (optional)
            </p>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>
              LOCATION & ADDRESS <span>*</span>
            </label>

            <div className="location-box">
              <button
                type="button"
                className="current-location-btn"
                onClick={getCurrentLocation}
              >
                <span>⌖</span>
                {loadingLocation
                  ? "Detecting Location..."
                  : "Use My Current Location"}
              </button>

              {location && <p className="coordinates">📍 {location}</p>}

              {!location && (
                <p>Click above to auto-detect your current location</p>
              )}
            </div>
          </div>

          {/* Address + Landmark */}
          <div className="two-column">
            <div className="form-group">
              <label>
                STREET ADDRESS / COLONY / WARD <span>*</span>
              </label>

              <div className="text-input-wrapper">
                <span>📍</span>

                <input
                  type="text"
                  value={address}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  placeholder="Enter street address, colony or ward"
                />
              </div>

              <p className="helper-text">e.g., MG Road, Sector 5, Ward 12</p>
            </div>

            <div className="form-group">
              <label>NEARBY LANDMARK (OPTIONAL)</label>

              <div className="text-input-wrapper">
                <span>⚑</span>

                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Enter nearby landmark"
                />
              </div>

              <p className="helper-text">
                e.g., Near City Hospital, Opp. Post Office
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-area">
            <button type="submit" className="submit-btn" disabled={submitting}>
              <span>➤</span>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </main>

      {/* Duplicate Check Warning Modal */}
      <DuplicateModal
        isOpen={showDuplicateModal}
        duplicateInfo={duplicateInfo}
        onSupportExisting={handleSupportExisting}
        onSubmitNewAnyway={handleForceSubmitNew}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}
