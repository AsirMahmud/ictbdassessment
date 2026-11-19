"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { defaultPortalForRole } from "@/lib/permissions";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      router.push(searchParams.get("next") || defaultPortalForRole(loggedInUser.role));
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBF9] text-[#15241B] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-[#E8F8F0] blur-3xl opacity-80" />
      <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-[#DDF4E8] blur-3xl opacity-70" />
      <div className="relative max-w-md w-full space-y-8 bg-white border border-[#DCEDE4] p-8 rounded-3xl shadow-xl shadow-[#BFDCCB]/30">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#008A5E] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-[#008A5E]/20">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#15241B]">Medi<span className="text-[#008A5E]">Book</span></h2>
          <p className="text-xs text-[#008A5E] font-bold uppercase tracking-wider">
            Staff & Clinical Administration Console
          </p>
        </div>

        {/* Patient Notice Banner */}
        <div className="bg-[#E8F8F0] border border-[#DCEDE4] p-3.5 rounded-2xl text-xs space-y-1.5 text-[#15241B]">
          <div className="font-bold flex items-center justify-between">
            <span>Are you a Patient?</span>
            <Link
              href="/customer/signup"
              className="text-[#008A5E] font-extrabold hover:underline bg-white px-2.5 py-0.5 rounded-lg border border-[#DCEDE4]"
            >
              Sign Up Here →
            </Link>
          </div>
          <p className="text-[11px] text-[#486057]">
            Looking to book or view doctor appointments and lab reports? Visit the{" "}
            <Link href="/customer" className="font-bold text-[#008A5E] hover:underline">
              Patient Portal
            </Link>{" "}
            or{" "}
            <Link href="/customer/login" className="font-bold text-[#008A5E] hover:underline">
              Patient Sign In
            </Link>.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#486057] font-bold mb-1">Staff Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#92A39B] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-[#15241B] focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#486057] font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#92A39B] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-[#15241B] focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008A5E] hover:bg-[#007550] text-white font-extrabold py-3 rounded-xl shadow-lg shadow-[#008A5E]/20 transition flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-[#71827A] hover:text-[#008A5E] transition">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FBF9]" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
