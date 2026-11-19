"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartPulse,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/customer";

  const { login, loginCustomerByPhone } = useAuth();

  const [authMode, setAuthMode] = useState<"phone" | "credentials">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("Please enter your registered phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await loginCustomerByPhone(phone.trim(), name.trim() || undefined);
      const cleanPhone = encodeURIComponent(res.patient?.phone || phone.trim());
      router.push(`/customer?phone=${cleanPhone}`);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrPhone.trim()) {
      setError("Please enter your email or registered phone");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const user = await login(emailOrPhone.trim(), password);
      if (user.role === "PATIENT") {
        const phoneParam = user.phone ? `?phone=${encodeURIComponent(user.phone)}` : "";
        router.push(`/customer${phoneParam}`);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBF9] text-[#15241B] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Back link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#008A5E] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Home
            </Link>
          </div>

          <div className="bg-white border border-[#DCEDE4] p-7 sm:p-9 rounded-3xl shadow-xl shadow-[#BFDCCB]/30 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-13 h-13 bg-[#E8F8F0] text-[#008A5E] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-[#15241B] tracking-tight">
                Patient Sign In
              </h1>
              <p className="text-xs text-gray-500">
                Sign in to view your appointments, prescriptions, and lab tests.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#F8FBF9] p-1 rounded-2xl border border-gray-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode("phone"); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition text-center ${
                  authMode === "phone"
                    ? "bg-[#008A5E] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Instant Phone Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("credentials"); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition text-center ${
                  authMode === "credentials"
                    ? "bg-[#008A5E] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Password Sign In
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {authMode === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Registered Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 234-5678 or 017..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Use the same phone number provided during appointment booking.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#008A5E] hover:bg-[#007550] text-white font-extrabold py-3 rounded-xl shadow-lg shadow-[#008A5E]/20 transition flex items-center justify-center space-x-1.5 text-xs"
                >
                  <span>{loading ? "Verifying..." : "Sign In to Patient Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. sarah@example.com or phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#008A5E] hover:bg-[#007550] text-white font-extrabold py-3 rounded-xl shadow-lg shadow-[#008A5E]/20 transition flex items-center justify-center space-x-1.5 text-xs"
                >
                  <span>{loading ? "Authenticating..." : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Prompt to Sign Up */}
            <div className="bg-[#E8F8F0]/80 border border-[#DCEDE4] p-4 rounded-2xl text-center space-y-1.5">
              <span className="text-xs font-bold text-[#15241B] block">
                No account yet?
              </span>
              <p className="text-[11px] text-gray-600">
                Register once to get your permanent UHID and book instant chamber appointments.
              </p>
              <Link
                href="/customer/signup"
                className="inline-flex items-center space-x-1 text-xs font-extrabold text-[#008A5E] hover:underline pt-1"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>Create New Patient Account</span>
              </Link>
            </div>

            {/* Link to Hospital Staff */}
            <div className="text-center pt-1 border-t border-gray-100">
              <Link
                href="/admin/login"
                className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Are you a Doctor or Hospital Staff? Sign In Here →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FBF9]" />}>
      <CustomerLoginContent />
    </Suspense>
  );
}
