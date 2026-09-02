"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAgencyConfig,
  updateBranding,
  createServicePackage,
  deleteServicePackage,
  updateRolesPermissions,
  updateWhatsAppTemplates,
} from "../api/agencyOsApi";

export default function AgencySettingsPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("packages");
  const [toastMsg, setToastMsg] = useState("");

  // Modal State for Package
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [pkgForm, setPkgForm] = useState({
    name: "",
    category: "SMM",
    monthlyFee: 35000,
    description: "",
    deliverables: {
      reelsCount: 15,
      shootsCount: 2,
      carouselsCount: 5,
      storiesCount: 15,
    },
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAgencyConfig();
      if (res.data?.success) {
        setConfig(res.data.config);
        if (res.data.config?.faviconUrl && typeof document !== "undefined") {
          let link = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = res.data.config.faviconUrl;
        }
      }
    } catch (err) {
      console.error("Error loading agency config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Add Package
  const handleAddPackage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createServicePackage(pkgForm);
      showToast("New service package created! 📦");
      setShowPkgModal(false);
      setPkgForm({
        name: "",
        category: "SMM",
        monthlyFee: 35000,
        description: "",
        deliverables: { reelsCount: 15, shootsCount: 2, carouselsCount: 5, storiesCount: 15 },
      });
      loadConfig();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service package?")) return;
    try {
      await deleteServicePackage(id);
      showToast("Service package removed.");
      loadConfig();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove package");
    }
  };

  // Toggle Role Permission Checkbox
  const handleTogglePermission = (roleIdx, field) => {
    if (!config?.rolesPermissions) return;
    const updated = [...config.rolesPermissions];
    updated[roleIdx][field] = !updated[roleIdx][field];
    setConfig({ ...config, rolesPermissions: updated });
  };

  // Save Roles
  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      await updateRolesPermissions(config.rolesPermissions);
      showToast("Role permissions updated successfully! 🔒");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // Save WhatsApp Templates
  const handleSaveTemplates = async () => {
    setSaving(true);
    try {
      await updateWhatsAppTemplates(config.whatsAppTemplates);
      showToast("WhatsApp templates saved! 💬");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save templates");
    } finally {
      setSaving(false);
    }
  };

    // Upload Logo from Device
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev) => ({ ...prev, logoUrl: reader.result }));
      showToast("Logo selected! Click Save Agency Branding below to apply. ✨");
    };
    reader.readAsDataURL(file);
  };

  // Upload Favicon from Device
  const handleFaviconFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image smaller than 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setConfig((prev) => ({ ...prev, faviconUrl: result }));
      if (typeof document !== "undefined") {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = result;
      }
      showToast("Favicon selected & updated in tab! Click Save below to persist. ✨");
    };
    reader.readAsDataURL(file);
  };

  // Save Branding
  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateBranding(config);
      if (res.data?.config?.faviconUrl && typeof document !== "undefined") {
        let link = document.querySelector("link[rel*='icon']");
        if (link) link.href = res.data.config.faviconUrl;
      }
      showToast("Branding, Logo & Favicon saved to database! 🎨");
      loadConfig();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24 text-slate-900">
      {/* ── SLEEK FLOATING ISLAND TOAST ── */}
      {toastMsg && (
        <div className="fixed top-5 left-4 right-4 max-w-md mx-auto z-50 p-4 bg-slate-900/95 text-white font-black text-xs rounded-2xl shadow-2xl backdrop-blur-xl border border-slate-700 flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">✓</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* ── TOP HEADER HERO ── */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 text-[#FF5200] rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <span>Zero-Code Agency OS Settings</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>⚙️ Agency OS Master Settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-xl">
            Configure dynamic service packages, team role permissions, automated WhatsApp templates, and agency branding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPkgModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>+</span>
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* ── HORIZONTAL SWIGGY TABS ── */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-2xl">
        {[
          { id: "packages", label: "Service Packages", icon: "📦" },
          { id: "roles", label: "Roles & Permissions", icon: "🔒" },
          { id: "whatsapp", label: "WhatsApp Automation", icon: "💬" },
          { id: "branding", label: "White-Label SaaS", icon: "🎨" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#FF5200] text-white shadow-md shadow-orange-500/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5200]"></div>
        </div>
      ) : (
        <>
          {/* ── TAB 1: SERVICE PACKAGES MASTER ── */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {config?.servicesMaster?.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 bg-orange-50 text-[#FF5200] border border-orange-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {pkg.category}
                        </span>
                        <button
                          onClick={() => handleDeletePackage(pkg._id)}
                          className="text-slate-400 hover:text-red-600 text-xs font-bold transition-colors"
                          title="Delete Package"
                        >
                          ✕
                        </button>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{pkg.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 mb-5">{pkg.description || "Monthly agency retainer package."}</p>

                      <div className="p-4 bg-slate-50/80 rounded-2xl space-y-2 border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">Reels Delivery:</span>
                          <span className="text-[#FF5200] font-mono font-black">{pkg.deliverables?.reelsCount || 0} Reels</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">Monthly Shoots:</span>
                          <span className="text-emerald-700 font-mono font-black">{pkg.deliverables?.shootsCount || 0} Shoots</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">Carousels / Posts:</span>
                          <span className="text-indigo-700 font-mono font-black">{pkg.deliverables?.carouselsCount || 0} Posts</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Retainer</span>
                      <span className="text-2xl font-black font-mono text-slate-900">
                        ₹{Number(pkg.monthlyFee || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: ROLES & PERMISSIONS MATRIX (FIXED ROLES DISPLAY) ── */}
          {activeTab === "roles" && (
            <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Team Role Permissions Matrix</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Control which features each staff role can view and operate.</p>
                </div>
                <button
                  disabled={saving}
                  onClick={handleSaveRoles}
                  className="px-6 py-3 bg-[#FF5200] hover:bg-[#E04800] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Permissions ✓"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                      <th className="py-3 px-4">Staff Role</th>
                      <th className="py-3 px-4 text-center">Edit Reels</th>
                      <th className="py-3 px-4 text-center">Assign Tasks</th>
                      <th className="py-3 px-4 text-center">Access Shoots</th>
                      <th className="py-3 px-4 text-center">Manage Clients</th>
                      <th className="py-3 px-4 text-center">View Invoices</th>
                      <th className="py-3 px-4 text-center">Manage Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config?.rolesPermissions?.map((roleItem, idx) => (
                      <tr key={roleItem.roleKey || roleItem._id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {roleItem.roleName || roleItem.roleKey?.toUpperCase() || "Role"}
                          </span>
                          <span className="text-[11px] text-[#FF5200] font-mono font-bold block">
                            @{roleItem.roleKey}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canEditProduction)}
                            onChange={() => handleTogglePermission(idx, "canEditProduction")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canAssignTasks)}
                            onChange={() => handleTogglePermission(idx, "canAssignTasks")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canAccessAllShoots)}
                            onChange={() => handleTogglePermission(idx, "canAccessAllShoots")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canManageClients)}
                            onChange={() => handleTogglePermission(idx, "canManageClients")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canViewInvoices)}
                            onChange={() => handleTogglePermission(idx, "canViewInvoices")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(roleItem.canManageStaff)}
                            onChange={() => handleTogglePermission(idx, "canManageStaff")}
                            className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: WHATSAPP AUTOMATION TEMPLATES ── */}
          {activeTab === "whatsapp" && (
            <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">WhatsApp Notification Templates</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Customize automatic 1-click WhatsApp messages sent to clients.</p>
                </div>
                <button
                  disabled={saving}
                  onClick={handleSaveTemplates}
                  className="px-6 py-3 bg-[#FF5200] hover:bg-[#E04800] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
                >
                  {saving ? "Saving..." : "Save Templates ✓"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Shoot Reminder Message
                  </label>
                  <textarea
                    rows={2}
                    value={config?.whatsAppTemplates?.shootReminder || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        whatsAppTemplates: { ...config.whatsAppTemplates, shootReminder: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5200]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Content Approval Request Message
                  </label>
                  <textarea
                    rows={2}
                    value={config?.whatsAppTemplates?.contentApproval || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        whatsAppTemplates: { ...config.whatsAppTemplates, contentApproval: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5200]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Invoice Overdue / Reminder Message
                  </label>
                  <textarea
                    rows={2}
                    value={config?.whatsAppTemplates?.invoiceReminder || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        whatsAppTemplates: { ...config.whatsAppTemplates, invoiceReminder: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5200]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: WHITE-LABEL BRANDING & LOGO / FAVICON ── */}
          {activeTab === "branding" && (
            <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">White-Label SaaS & Agency Branding</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Customize your agency name, company logo, favicon icon, GST number, and contact info.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6 max-w-2xl">
                {/* Logo & Favicon Direct Upload Card */}
                <div className="p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Direct File Upload • Agency Logo & Favicon</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">તમે સીધી તમારી કમ્પ્યુટર અથવા મોબાઈલ ગેલેરીમાંથી ઇમેજ પસંદ કરીને અપલોડ કરી શકો છો.</p>
                  </div>

                  {/* Logo Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="relative group cursor-pointer w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      <img
                        src={config?.logoUrl || "/logo.jpg"}
                        alt="Agency Logo"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => { e.target.src = "/logo.jpg"; }}
                      />
                      <label className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1">
                        Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileUpload} />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-4 py-2.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                          <span>📁</span>
                          <span>Upload Logo from Device (ઈમેજ પસંદ કરો)</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileUpload} />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Or direct image URL (https://... or /logo.jpg)"
                        value={config?.logoUrl || ""}
                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono font-medium focus:outline-none focus:border-[#FF5200]"
                      />
                    </div>
                  </div>

                  {/* Favicon Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4 border-t border-slate-200/80">
                    <div className="relative group cursor-pointer w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      <img
                        src={config?.faviconUrl || "/favicon.ico"}
                        alt="Favicon"
                        className="w-8 h-8 object-contain"
                        onError={(e) => { e.target.src = "/favicon.ico"; }}
                      />
                      <label className="absolute inset-0 bg-black/60 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-0.5">
                        Change
                        <input type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconFileUpload} />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                          <span>📁</span>
                          <span>Upload Favicon Icon (ફેવિકોન પસંદ કરો)</span>
                          <input type="file" accept="image/*,.ico" className="hidden" onChange={handleFaviconFileUpload} />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Or direct favicon URL (https://... or /favicon.ico)"
                        value={config?.faviconUrl || ""}
                        onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono font-medium focus:outline-none focus:border-[#FF5200]"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Agency Brand Name</label>
                    <input
                      type="text"
                      value={config?.agencyName || ""}
                      onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF5200]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Agency Tagline</label>
                    <input
                      type="text"
                      value={config?.tagline || ""}
                      onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5200]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Mobile</label>
                    <input
                      type="text"
                      value={config?.contactMobile || ""}
                      onChange={(e) => setConfig({ ...config, contactMobile: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF5200]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">GST / Business Tax Number</label>
                    <input
                      type="text"
                      value={config?.gstNumber || ""}
                      onChange={(e) => setConfig({ ...config, gstNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-[#FF5200]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    {saving ? "Updating..." : "Save Agency Branding & Logo ✓"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ── MODAL: CREATE SERVICE PACKAGE ── */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4">✨ Create Service Retainer Package</h3>

            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diamond Retainer Plan"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.monthlyFee}
                    onChange={(e) => setPkgForm({ ...pkgForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={pkgForm.category}
                    onChange={(e) => setPkgForm({ ...pkgForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  >
                    <option value="SMM">SMM Retainer</option>
                    <option value="Production">Video Production</option>
                    <option value="Editing">Editing Only</option>
                    <option value="Ads">Performance Ads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Package Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of client deliverables..."
                  value={pkgForm.description}
                  onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reels Count</label>
                  <input
                    type="number"
                    value={pkgForm.deliverables.reelsCount}
                    onChange={(e) =>
                      setPkgForm({
                        ...pkgForm,
                        deliverables: { ...pkgForm.deliverables, reelsCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shoots Count</label>
                  <input
                    type="number"
                    value={pkgForm.deliverables.shootsCount}
                    onChange={(e) =>
                      setPkgForm({
                        ...pkgForm,
                        deliverables: { ...pkgForm.deliverables, shootsCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md"
                >
                  Create Package ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
