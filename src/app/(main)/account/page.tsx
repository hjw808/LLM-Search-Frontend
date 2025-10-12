"use client";

import { User, Mail, Phone, Building2, Edit, LogOut } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  // Mock user data - will be replaced with real data later
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    phone: "+1 (555) 000-0000",
    company: "Your Company",
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-75"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-slate-400">{userData.email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <Link
              href="/login"
              className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>

          <div className="space-y-6">
            {/* First Name */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                First Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-white">{userData.firstName}</span>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Last Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-white">{userData.lastName}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <Mail className="w-5 h-5 text-purple-400" />
                <span className="text-white">{userData.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Company */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Contact & Company</h2>

          <div className="space-y-6">
            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Phone Number
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-white">{userData.phone}</span>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Company Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span className="text-white">{userData.company}</span>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Member Since
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-white">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>

        <div className="space-y-4">
          {/* Change Password */}
          <button className="w-full flex items-center justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group">
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-sm text-slate-400">Update your password to keep your account secure</p>
            </div>
            <Edit className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Notification Preferences */}
          <button className="w-full flex items-center justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group">
            <div>
              <p className="text-white font-medium">Notification Preferences</p>
              <p className="text-sm text-slate-400">Manage your email and notification settings</p>
            </div>
            <Edit className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Delete Account */}
          <button className="w-full flex items-center justify-between px-4 py-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-left group">
            <div>
              <p className="text-red-400 font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Edit className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
