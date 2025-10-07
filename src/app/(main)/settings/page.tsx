"use client";

import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { Settings, User, Building2, Shield, CreditCard, AlertTriangle, Save } from "lucide-react";

type Tab = "profile" | "business" | "security" | "billing";

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    jobTitle: user?.jobTitle || "",
  });

  const [companyData, setCompanyData] = useState({
    companyName: user?.companyName || "",
    companyWebsite: user?.companyWebsite || "",
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateUser(profileData);
    setIsSaving(false);
  };

  const handleSaveCompany = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateUser(companyData);
    setIsSaving(false);
  };

  const tabs = [
    { id: "profile" as Tab, name: "Profile", icon: User },
    { id: "business" as Tab, name: "Business", icon: Building2 },
    { id: "security" as Tab, name: "Security", icon: Shield },
    { id: "billing" as Tab, name: "Billing", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Account Settings
        </h1>
        <p className="text-slate-400">Manage your account preferences and configuration</p>
      </div>

      {/* Settings Container */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-white border-b-2 border-blue-500 bg-blue-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Personal Information</h2>
                <p className="text-sm text-slate-400">Update your personal details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Business Configuration</h2>
                <p className="text-sm text-slate-400">Manage your company information and test settings</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  value={companyData.companyWebsite}
                  onChange={(e) => setCompanyData({ ...companyData, companyWebsite: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Note:</strong> Detailed business testing configuration (location, aliases, query counts) is available on the Test page.
                </p>
              </div>

              <button
                onClick={handleSaveCompany}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Security Settings</h2>
                <p className="text-sm text-slate-400">Manage your password and security preferences</p>
              </div>

              <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-yellow-300">
                  🔒 Password management and two-factor authentication will be available after implementing full authentication system.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Change Password</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 opacity-50 cursor-not-allowed"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 opacity-50 cursor-not-allowed"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  disabled
                  className="px-6 py-3 bg-white/5 border border-white/10 text-slate-500 font-semibold rounded-xl cursor-not-allowed opacity-50"
                >
                  Update Password (Coming Soon)
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Billing & Subscription</h2>
                <p className="text-sm text-slate-400">Manage your subscription and payment methods</p>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                    <p className="text-sm text-slate-400">Free Tier</p>
                  </div>
                  <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
                    Active
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  You&apos;re currently on the free tier. Upgrade to unlock more features and increase your testing limits.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-sm text-purple-300">
                  💳 Subscription management and billing features will be available soon.
                </p>
              </div>

              <button
                disabled
                className="px-6 py-3 bg-white/5 border border-white/10 text-slate-500 font-semibold rounded-xl cursor-not-allowed opacity-50"
              >
                Upgrade Plan (Coming Soon)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-300 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              disabled
              className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all opacity-50 cursor-not-allowed"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
