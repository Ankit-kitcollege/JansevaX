import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Bell,
  Map,
  FileText,
  Shield,
  Palette,
  Info,
  ChevronRight,
  Save,
  Moon,
  Sun,
  MapPin,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  QrCode,
  Download,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import "./Settings.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  const [activeSection, setActiveSection] = useState("profile");

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Password modal form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwdText, setShowPwdText] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMsg, setTwoFactorMsg] = useState("");

  // Privacy state
  const [maskContactInfo, setMaskContactInfo] = useState(true);
  const [hidePublicGis, setHidePublicGis] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState("");

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("civicpulseSettings");
    const savedPhoto = localStorage.getItem("civicpulseProfilePhoto");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (savedPhoto) parsed.profilePhoto = savedPhoto;
        return parsed;
      } catch (e) {}
    }
    return {
      name: user?.name || "Ankit Yadav",
      email: user?.email || "ankityadav100320@gmail.com",
      phone: user?.phone || "+91 9876543210",
      profilePhoto: savedPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

      emailNotifications: true,
      pushNotifications: true,
      reportUpdates: true,
      resolutionUpdates: true,

      defaultLocation: "Kanpur, Uttar Pradesh",
      showResolved: true,
      showClusters: true,
      mapType: "Street",

      autoLocation: true,
      anonymousReports: false,
      confirmation: true,

      darkMode: false,
      compactMode: false,
    };
  });

  // Apply dark mode on document body
  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [settings.darkMode]);

  const handlePhotoFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Photo = event.target.result;
      updateSetting("profilePhoto", base64Photo);
      localStorage.setItem("civicpulseProfilePhoto", base64Photo);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUrlPrompt = () => {
    const url = prompt("Enter Image URL for profile photo:", settings.profilePhoto || "");
    if (url !== null && url.trim() !== "") {
      updateSetting("profilePhoto", url.trim());
      localStorage.setItem("civicpulseProfilePhoto", url.trim());
    }
  };

  const handleRemovePhoto = () => {
    updateSetting("profilePhoto", "");
    localStorage.removeItem("civicpulseProfilePhoto");
  };

  const [saved, setSaved] = useState(false);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "civicpulseSettings",
      JSON.stringify(settings)
    );
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword) {
      setPwdMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwdMsg({ type: "success", text: "Password changed successfully!" });
    setTimeout(() => {
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdMsg({ type: "", text: "" });
    }, 1500);
  };

  const handleVerify2FA = (e) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      setTwoFactorMsg("Please enter all 6 digits of the authenticator code.");
      return;
    }
    setTwoFactorEnabled(!twoFactorEnabled);
    setTwoFactorMsg(!twoFactorEnabled ? "✓ Two-Factor Authentication Enabled!" : "✓ Two-Factor Authentication Disabled.");
    setTimeout(() => {
      setShowTwoFactorModal(false);
      setTwoFactorCode("");
      setTwoFactorMsg("");
    }, 1500);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `JansevaX_Settings_Data_${settings.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "map", label: "Map Preferences", icon: Map },
    { id: "reports", label: "Report Preferences", icon: FileText },
    { id: "security", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "about", label: "About JansevaX", icon: Info },
  ];

  return (
    <div className="settings-page">
      {/* HEADER */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your JansevaX account and application preferences.</p>
        </div>

        <button className="save-button" onClick={saveSettings}>
          {saved ? (
            <>
              <CheckCircle2 size={17} />
              Saved
            </>
          ) : (
            <>
              <Save size={17} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="settings-layout">
        {/* SIDEBAR */}
        <aside className="settings-sidebar">
          <div className="settings-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  className={`settings-menu-item ${
                    activeSection === item.id ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <ChevronRight size={15} className="menu-arrow" />
                </button>
              );
            })}
          </div>

          <div className="settings-help">
            <div className="help-icon">
              <Info size={18} />
            </div>
            <strong>Need help?</strong>
            <p>Contact JansevaX support if you have any issues.</p>
            <button onClick={() => alert("Support Team: support@jansevax.org\nEmergency Helpline: 1800-JANSEVAX")}>
              Contact Support
            </button>
          </div>
        </aside>

        {/* SETTINGS CONTENT */}
        <main className="settings-content">
          {/* PROFILE */}
          {activeSection === "profile" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon blue">
                  <User size={20} />
                </div>
                <div>
                  <h2>Profile Settings</h2>
                  <p>Manage your personal account information.</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoFileChange}
              />

              <div className="profile-section">
                <div
                  className="profile-avatar"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Click to Upload Photo"
                  style={{ cursor: "pointer", overflow: "hidden", position: "relative" }}
                >
                  {settings.profilePhoto ? (
                    <img
                      src={settings.profilePhoto}
                      alt="Profile Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    (settings.name || "C").charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h3>{settings.name}</h3>
                  <p>JansevaX Verified Citizen & Officer</p>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      📁 Upload Photo
                    </button>

                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handlePhotoUrlPrompt}
                    >
                      🌐 Image URL
                    </button>

                    {settings.profilePhoto && (
                      <button
                        className="secondary-button"
                        type="button"
                        style={{ color: "#ef4444", borderColor: "#fca5a5" }}
                        onClick={handleRemovePhoto}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={17} />
                    <input
                      value={settings.name}
                      onChange={(e) => updateSetting("name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={17} />
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Smartphone size={17} />
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={settings.phone}
                      onChange={(e) => updateSetting("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon orange">
                  <Bell size={20} />
                </div>
                <div>
                  <h2>Notification Settings</h2>
                  <p>Choose how JansevaX keeps you updated.</p>
                </div>
              </div>

              <SettingToggle
                icon={<Mail size={18} />}
                title="Email Notifications"
                description="Receive important JansevaX updates through email."
                checked={settings.emailNotifications}
                onChange={(value) => updateSetting("emailNotifications", value)}
              />

              <SettingToggle
                icon={<Smartphone size={18} />}
                title="Push Notifications"
                description="Receive notifications directly on your device."
                checked={settings.pushNotifications}
                onChange={(value) => updateSetting("pushNotifications", value)}
              />

              <SettingToggle
                icon={<FileText size={18} />}
                title="Report Status Updates"
                description="Get notified whenever your report status changes."
                checked={settings.reportUpdates}
                onChange={(value) => updateSetting("reportUpdates", value)}
              />

              <SettingToggle
                icon={<CheckCircle2 size={18} />}
                title="Resolution Updates"
                description="Get notified when a reported issue is resolved."
                checked={settings.resolutionUpdates}
                onChange={(value) => updateSetting("resolutionUpdates", value)}
              />
            </section>
          )}

          {/* MAP PREFERENCES */}
          {activeSection === "map" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon green">
                  <Map size={20} />
                </div>
                <div>
                  <h2>Map Preferences</h2>
                  <p>Customize how the JansevaX GIS map behaves.</p>
                </div>
              </div>

              <div className="form-group full">
                <label>Default Map Location</label>
                <div className="input-wrapper">
                  <MapPin size={17} />
                  <input
                    value={settings.defaultLocation}
                    onChange={(e) => updateSetting("defaultLocation", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Map View Mode</label>
                <select
                  value={settings.mapType}
                  onChange={(e) => updateSetting("mapType", e.target.value)}
                >
                  <option value="Street">Street Map View</option>
                  <option value="Satellite">Satellite Imagery View</option>
                  <option value="Terrain">Terrain Topographic View</option>
                </select>
              </div>

              <SettingToggle
                icon={<CheckCircle2 size={18} />}
                title="Show Resolved Reports"
                description="Display resolved civic issues on the GIS map."
                checked={settings.showResolved}
                onChange={(value) => updateSetting("showResolved", value)}
              />

              <SettingToggle
                icon={<Map size={18} />}
                title="Show Report Clusters"
                description="Group nearby reports into spatial problem clusters."
                checked={settings.showClusters}
                onChange={(value) => updateSetting("showClusters", value)}
              />
            </section>
          )}

          {/* REPORT PREFERENCES */}
          {activeSection === "reports" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon purple">
                  <FileText size={20} />
                </div>
                <div>
                  <h2>Report Preferences</h2>
                  <p>Customize how civic reports are submitted.</p>
                </div>
              </div>

              <SettingToggle
                icon={<MapPin size={18} />}
                title="Automatic Geolocation Detection"
                description="Automatically detect your GPS location while filing a report."
                checked={settings.autoLocation}
                onChange={(value) => updateSetting("autoLocation", value)}
              />

              <SettingToggle
                icon={<EyeOff size={18} />}
                title="Anonymous Reporting"
                description="Allow reports to be submitted without displaying your full name publicly."
                checked={settings.anonymousReports}
                onChange={(value) => updateSetting("anonymousReports", value)}
              />

              <SettingToggle
                icon={<CheckCircle2 size={18} />}
                title="Submission Confirmation Alert"
                description="Show a confirmation modal after successfully submitting a report."
                checked={settings.confirmation}
                onChange={(value) => updateSetting("confirmation", value)}
              />
            </section>
          )}

          {/* PRIVACY & SECURITY */}
          {activeSection === "security" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon red">
                  <Shield size={20} />
                </div>
                <div>
                  <h2>Privacy & Security</h2>
                  <p>Keep your JansevaX account secure and private.</p>
                </div>
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Lock size={19} />
                </div>
                <div>
                  <h3>Account Password</h3>
                  <p>Change your login password securely.</p>
                </div>
                <button className="secondary-button" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Smartphone size={19} />
                </div>
                <div>
                  <h3>Two-Factor Authentication (2FA)</h3>
                  <p>Status: {twoFactorEnabled ? <strong style={{ color: "#16a34a" }}>Enabled</strong> : "Disabled"}</p>
                </div>
                <button className="secondary-button" onClick={() => setShowTwoFactorModal(true)}>
                  {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                </button>
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Eye size={19} />
                </div>
                <div>
                  <h3>Data Privacy & Protection</h3>
                  <p>Manage contact masking and export account data.</p>
                </div>
                <button className="secondary-button" onClick={() => setShowPrivacyModal(true)}>
                  Privacy Controls
                </button>
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeSection === "appearance" && (
            <section className="settings-card">
              <div className="section-heading">
                <div className="heading-icon pink">
                  <Palette size={20} />
                </div>
                <div>
                  <h2>Appearance & Theme</h2>
                  <p>Customize the look and feel of JansevaX.</p>
                </div>
              </div>

              <div className="appearance-options">
                <button
                  className={`theme-option ${!settings.darkMode ? "selected" : ""}`}
                  onClick={() => updateSetting("darkMode", false)}
                >
                  <Sun size={24} />
                  <strong>Light Mode</strong>
                  <span>Clean, crisp, and bright interface</span>
                </button>

                <button
                  className={`theme-option ${settings.darkMode ? "selected" : ""}`}
                  onClick={() => updateSetting("darkMode", true)}
                >
                  <Moon size={24} />
                  <strong>Dark Mode</strong>
                  <span>Sleek dark theme, easy on eyes at night</span>
                </button>
              </div>

              <SettingToggle
                icon={<Palette size={18} />}
                title="Compact View Mode"
                description="Reduce padding to fit more information on screen."
                checked={settings.compactMode}
                onChange={(value) => updateSetting("compactMode", value)}
              />
            </section>
          )}

          {/* ABOUT */}
          {activeSection === "about" && (
            <section className="settings-card about-card">
              <div className="about-logo">
                <MapPin size={32} />
              </div>
              <h2>JansevaX</h2>
              <p>AI-Assisted GIS Civic Problem Intelligence Platform</p>
              <div className="version">Version 2.0.0 • Operational</div>

              <div className="about-info">
                <div>
                  <span>Platform</span>
                  <strong>Civic Intelligence</strong>
                </div>
                <div>
                  <span>Map Engine</span>
                  <strong>OpenStreetMap & Leaflet GIS</strong>
                </div>
                <div>
                  <span>System Status</span>
                  <strong className="online">● All Systems Operational</strong>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)} style={{ zIndex: 9999 }}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <span className="modal-label">ACCOUNT SECURITY</span>
                <h2>Change Password</h2>
              </div>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-content">
                {pwdMsg.text && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: pwdMsg.type === "success" ? "#dcfce7" : "#fee2e2",
                    color: pwdMsg.type === "success" ? "#166534" : "#991b1b",
                    border: pwdMsg.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5"
                  }}>
                    {pwdMsg.text}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showPwdText ? "text" : "password"}
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showPwdText ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showPwdText ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={() => setShowPwdText(!showPwdText)}
                >
                  {showPwdText ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPwdText ? "Hide Password Text" : "Show Password Text"}
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-action" style={{ background: "#2563eb", color: "#fff" }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA MODAL */}
      {showTwoFactorModal && (
        <div className="modal-backdrop" onClick={() => setShowTwoFactorModal(false)} style={{ zIndex: 9999 }}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <span className="modal-label">TWO-FACTOR AUTHENTICATION</span>
                <h2>{twoFactorEnabled ? "Manage 2FA Security" : "Enable 2FA Authenticator"}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowTwoFactorModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVerify2FA}>
              <div className="modal-content" style={{ textAlign: "center" }}>
                {twoFactorMsg && (
                  <div style={{ padding: "10px", borderRadius: "8px", background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: "600", marginBottom: "14px" }}>
                    {twoFactorMsg}
                  </div>
                )}

                {!twoFactorEnabled && (
                  <>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                      <QrCode size={80} color="#2563eb" style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 6px" }}>Scan QR code with Google Authenticator or Authy app</p>
                      <strong style={{ fontSize: "13px", color: "#1e293b", fontFamily: "monospace" }}>KEY: CP-2FA-8849-CIVIC</strong>
                    </div>

                    <div className="form-group" style={{ textAlign: "left", marginBottom: "14px" }}>
                      <label>Enter 6-Digit Authenticator Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        style={{ textAlign: "center", fontSize: "18px", letterSpacing: "4px", fontWeight: "700" }}
                      />
                    </div>
                  </>
                )}

                {twoFactorEnabled && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                    <ShieldCheck size={48} color="#16a34a" style={{ margin: "0 auto 10px" }} />
                    <h3 style={{ fontSize: "15px", color: "#15803d", margin: "0 0 4px" }}>2FA Protection Active</h3>
                    <p style={{ fontSize: "11px", color: "#166534", margin: 0 }}>Your account is secured with 2-Factor Authentication.</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowTwoFactorModal(false)}>
                  Close
                </button>
                <button type="submit" className="modal-action" style={{ background: twoFactorEnabled ? "#dc2626" : "#16a34a", color: "#fff" }}>
                  {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIVACY CONTROLS MODAL */}
      {showPrivacyModal && (
        <div className="modal-backdrop" onClick={() => setShowPrivacyModal(false)} style={{ zIndex: 9999 }}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <span className="modal-label">DATA & PRIVACY CONTROLS</span>
                <h2>Privacy & Data Settings</h2>
              </div>
              <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {privacyMsg && (
                <div style={{ padding: "10px", borderRadius: "8px", background: "#dcfce7", color: "#166534", fontSize: "12px", fontWeight: "600", marginBottom: "14px" }}>
                  {privacyMsg}
                </div>
              )}

              <SettingToggle
                icon={<Shield size={18} />}
                title="Mask Contact Info on Public Reports"
                description="Hides your phone number and email address on public civic issue view."
                checked={maskContactInfo}
                onChange={(val) => setMaskContactInfo(val)}
              />

              <SettingToggle
                icon={<EyeOff size={18} />}
                title="Hide Reports from Search Engines"
                description="Prevent search engine indexing of your submitted reports."
                checked={hidePublicGis}
                onChange={(val) => setHidePublicGis(val)}
              />

              <div style={{ marginTop: "18px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <h4 style={{ fontSize: "12px", color: "#1e293b", margin: "0 0 6px" }}>Account Data Export</h4>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 10px" }}>Download a copy of your personal settings, preferences, and report history.</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleExportData}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={15} /> Download Account Data (JSON)
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={() => setShowPrivacyModal(false)}>
                Close
              </button>
              <button
                type="button"
                className="modal-action"
                onClick={() => {
                  setPrivacyMsg("✓ Privacy settings updated!");
                  setTimeout(() => {
                    setShowPrivacyModal(false);
                    setPrivacyMsg("");
                  }, 1200);
                }}
                style={{ background: "#2563eb", color: "#fff" }}
              >
                Save Privacy Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE TOAST */}
      {saved && (
        <div className="save-toast">
          <CheckCircle2 size={18} />
          Settings saved successfully.
        </div>
      )}
    </div>
  );
}

function SettingToggle({ icon, title, description, checked, onChange }) {
  return (
    <div className="toggle-setting">
      <div className="toggle-left">
        <div className="toggle-icon">{icon}</div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <button
        className={`toggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-label={title}
      >
        <span></span>
      </button>
    </div>
  );
}

