"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAgencyConfig,
  updateBranding,
  addServicePackage,
  deleteServicePackage,
  updateRolesPermissions,
  updateWhatsAppTemplates,
} from "../api/agencyOsApi";
import { useAuth } from "../context/AuthContext";

export default function AgencySettingsPage() {
  const { user, isAdmin } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("packages"); // "packages", "roles", "whatsapp", "branding"
  const [toastMsg, setToastMsg] = useState("");

  // New package modal
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [pkgForm, setPkgForm] = useState({
    name: "",
    category: "SMM",
    monthlyFee: 45000,
    description: "",
    deliverables: { reelsCount: 30, shootsCount: 4, carouselsCount: 10, storiesCount: 30 },
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAgencyConfig();
      if (res.data?.success) setConfig(res.data.config);
    } catch (err) {
      console.error("Error fetching agency config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Add Package
  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      await addServicePackage(pkgForm);
      showToast("New service package created successfully! ✨");
      setShowPkgModal(false);
      setPkgForm({
        name: "",
        category: "SMM",
        monthlyFee: 45000,
        description: "",
        deliverables: { reelsCount: 30, shootsCount: 4, carouselsCount: 10, storiesCount: 30 },
      });
      loadConfig();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create package");
    }
  };

  // Delete Package
  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to remove this package?")) return;
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

  // Save Branding
  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBranding(config);
      showToast("Branding & white-label settings updated! 🎨");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <span className="px-3 py-1 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
          Zero-Code Control Panel
        </span>
        <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
          ⚙️ Agency OS Master Settings
        </h1>
        <p className="text-sm text-slate-400">
          Configure dynamic service packages, role permissions, WhatsApp templates & white-label SaaS branding.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-8 max-w-xl">
        {[
          { id: "packages", label: "Service Packages", icon: "📦" },
          { id: "roles", label: "Roles & Permissions", icon: "🔒" },
          { id: "whatsapp", label: "WhatsApp Automation", icon: "💬" },
          { id: "branding", label: "White-Label SaaS", icon: "🎨" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* ── TAB 1: SERVICE PACKAGES MASTER ── */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Dynamic Service Packages</h3>
                  <p className="text-xs text-slate-400">Add or modify deliverables without touching any code.</p>
                </div>
                <button
                  onClick={() => setShowPkgModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+</span>
                  <span>Create Package</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {config?.servicesMaster?.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-black uppercase">
                          {pkg.category}
                        </span>
                        <button
                          onClick={() => handleDeletePackage(pkg._id)}
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      <h4 className="font-extrabold text-white text-base">{pkg.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{pkg.description || "No description."}</p>

                      <div className="my-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reels Quota:</span>
                          <span className="font-mono font-bold text-amber-400">{pkg.deliverables?.reelsCount || 0} Reels</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Shoots Quota:</span>
                          <span className="font-mono font-bold text-emerald-400">{pkg.deliverables?.shootsCount || 0} Shoots</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Carousels / Posts:</span>
                          <span className="font-mono font-bold text-indigo-400">{pkg.deliverables?.carouselsCount || 0} Posts</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Monthly Retainer</span>
                      <span className="text-lg font-black font-mono text-white">₹{pkg.monthlyFee?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: ROLES & PERMISSIONS MATRIX (RBAC) ── */}
          {activeTab === "roles" && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Role-Based Access Control (RBAC)</h3>
                  <p className="text-xs text-slate-400">Toggle checkboxes to give or restrict access to team members.</p>
                </div>
                <button
                  disabled={saving}
                  onClick={handleSaveRoles}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Permissions ✓"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-4">Role Name</th>
                      <th className="py-3 px-3 text-center">Manage Clients</th>
                      <th className="py-3 px-3 text-center">View Invoices</th>
                      <th className="py-3 px-3 text-center">Assign Tasks</th>
                      <th className="py-3 px-3 text-center">Edit Production</th>
                      <th className="py-3 px-3 text-center">Manage Staff</th>
                      <th className="py-3 px-3 text-center">Access All Shoots</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {config?.rolesPermissions?.map((role, idx) => (
                      <tr key={role.roleKey} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{role.roleName}</div>
                          <span className="text-[10px] font-mono text-indigo-400">{role.roleKey}</span>
                        </td>
                        {[
                          "canManageClients",
                          "canViewInvoices",
                          "canAssignTasks",
                          "canEditProduction",
                          "canManageStaff",
                          "canAccessAllShoots",
                        ].map((field) => (
                          <td key={field} className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(role[field])}
                              onChange={() => handleTogglePermission(idx, field)}
                              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: WHATSAPP AUTOMATION TEMPLATES ── */}
          {activeTab === "whatsapp" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Dynamic WhatsApp Templates</h3>
                  <p className="text-xs text-slate-400">
                    Placeholders available: <code className="text-indigo-400">{"{client_name}"}</code>,{" "}
                    <code className="text-indigo-400">{"{shoot_date}"}</code>,{" "}
                    <code className="text-indigo-400">{"{shoot_time}"}</code>,{" "}
                    <code className="text-indigo-400">{"{reels_count}"}</code>,{" "}
                    <code className="text-indigo-400">{"{drive_link}"}</code>,{" "}
                    <code className="text-indigo-400">{"{preview_link}"}</code>
                  </p>
                </div>
                <button
                  disabled={saving}
                  onClick={handleSaveTemplates}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Templates ✓"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {config?.whatsAppTemplates?.map((tmpl, idx) => (
                  <div key={tmpl.key} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm">{tmpl.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{tmpl.key}</span>
                    </div>

                    <textarea
                      rows={4}
                      value={tmpl.text}
                      onChange={(e) => {
                        const updated = [...config.whatsAppTemplates];
                        updated[idx].text = e.target.value;
                        setConfig({ ...config, whatsAppTemplates: updated });
                      }}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: WHITE-LABEL SAAS BRANDING ── */}
          {activeTab === "branding" && (
            <div className="p-7 bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl">
              <h3 className="text-lg font-black text-white mb-1">🎨 White-Label SaaS Branding</h3>
              <p className="text-xs text-slate-400 mb-6">
                Sell this software to other agencies! When another agency purchases it, customize their brand info here.
              </p>

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Agency Name</label>
                    <input
                      type="text"
                      value={config?.agencyName || ""}
                      onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Primary Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config?.primaryColor || "#6366F1"}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config?.primaryColor || "#6366F1"}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={config?.tagline || ""}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Official WhatsApp / Mobile</label>
                    <input
                      type="text"
                      value={config?.contactMobile || ""}
                      onChange={(e) => setConfig({ ...config, contactMobile: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={config?.contactEmail || ""}
                      onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save Branding Changes ✓"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ── CREATE PACKAGE MODAL ── */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">📦 Add Dynamic Service Package</h3>

            <form onSubmit={handleAddPackage} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30 Reels Viral Growth"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.monthlyFee}
                    onChange={(e) => setPkgForm({ ...pkgForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                  <select
                    value={pkgForm.category}
                    onChange={(e) => setPkgForm({ ...pkgForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="SMM">SMM Retainer</option>
                    <option value="Production">Production</option>
                    <option value="Editing">Video Editing</option>
                    <option value="Ads">Meta Ads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Reels Quota</label>
                  <input
                    type="number"
                    value={pkgForm.deliverables.reelsCount}
                    onChange={(e) =>
                      setPkgForm({
                        ...pkgForm,
                        deliverables: { ...pkgForm.deliverables, reelsCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Shoots</label>
                  <input
                    type="number"
                    value={pkgForm.deliverables.shootsCount}
                    onChange={(e) =>
                      setPkgForm({
                        ...pkgForm,
                        deliverables: { ...pkgForm.deliverables, shootsCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Posts</label>
                  <input
                    type="number"
                    value={pkgForm.deliverables.carouselsCount}
                    onChange={(e) =>
                      setPkgForm({
                        ...pkgForm,
                        deliverables: { ...pkgForm.deliverables, carouselsCount: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
