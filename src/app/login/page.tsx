"use client";

import Link from "next/link";
import { Sparkles, BarChart3, TrendingUp, Zap, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If successful, the signIn function will redirect to /test
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      {/* Gradient overlay effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-75"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Visibility
                </h1>
                <p className="text-sm text-slate-400 font-medium">Testing Platform</p>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Track Your Business in the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Era
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400">
                Measure and optimize how AI platforms like ChatGPT, Claude, and Gemini recommend your business.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Real-Time Testing</p>
                  <p className="text-sm text-slate-500">Test across multiple AI platforms instantly</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Competitor Analysis</p>
                  <p className="text-sm text-slate-500">See who else is being recommended</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Actionable Insights</p>
                  <p className="text-sm text-slate-500">Get detailed reports and recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 w-full max-w-md">
              <div className="space-y-6">
                {/* Title */}
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Get Started
                  </h3>
                  <p className="text-slate-400">
                    Start tracking your AI visibility today
                  </p>
                </div>

{!showSignIn ? (
                  <>
                    {/* Sign Up Button */}
                    <Link
                      href="/sign-up"
                      className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all text-center flex items-center justify-center gap-2 group"
                    >
                      Sign Up
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-sm text-slate-400">or</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Sign In Button */}
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="block w-full px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-center"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Sign In Form */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          placeholder="john@company.com"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          placeholder="Enter your password"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignIn(false);
                          setError("");
                          setFormData({ email: "", password: "" });
                        }}
                        className="w-full px-6 py-3 text-slate-400 hover:text-white transition-all text-center text-sm"
                      >
                        Back
                      </button>
                    </form>
                  </>
                )}

                {/* Footer Text */}
                <p className="text-center text-xs text-slate-500 mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
