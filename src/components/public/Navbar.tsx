"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart, Plus, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { defaultPortalForRole } from "@/lib/permissions";

interface NavbarProps {
  onBookClick?: () => void;
  onSearchClick?: () => void;
}

export default function Navbar({ onBookClick, onSearchClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 whitespace-nowrap gap-4">
          {/* Brand Logo - MediBook Doctor Appointment Platform */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#008A5E] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform relative">
              {/* Medical Heart with Cross */}
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-xs font-black leading-none mb-1">+</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-gray-900 leading-none">
                Medi<span className="text-[#008A5E]">Book</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-normal mt-0.5">
                Doctor Appointment Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Matching reference) */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-gray-600">
            <Link
              href="/"
              className="bg-[#E8F8F0] text-[#008A5E] font-semibold px-4 py-1.5 rounded-full transition-colors"
            >
              Home
            </Link>
            <a
              href="#doctors"
              className="hover:text-[#008A5E] transition-colors py-1 font-medium text-gray-600"
            >
              Find Doctors
            </a>
            <a
              href="#specialties"
              className="hover:text-[#008A5E] transition-colors py-1 font-medium text-gray-600"
            >
              Specialties
            </a>
            <a
              href="#hospitals"
              className="hover:text-[#008A5E] transition-colors py-1 font-medium text-gray-600"
            >
              Hospitals
            </a>
            <a
              href="#about"
              className="hover:text-[#008A5E] transition-colors py-1 font-medium text-gray-600"
            >
              About
            </a>
            <Link
              href="/customer"
              className="hover:text-[#008A5E] transition-colors py-1 font-medium text-gray-600"
            >
              Customer Portal
            </Link>
          </nav>

          {/* Right Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={user.role === "PATIENT" ? (user.phone ? `/customer?phone=${encodeURIComponent(user.phone)}` : "/customer") : defaultPortalForRole(user.role)}
                  className="bg-[#E8F8F0] hover:bg-[#D4F2E3] text-[#008A5E] px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-1.5 transition"
                >
                  <User className="w-4 h-4" />
                  <span>{user.full_name?.split(" ")[0] || "Account"}</span>
                  <span className="text-[10px] bg-[#008A5E] text-white px-1.5 py-0.2 rounded-md font-semibold">
                    {user.role === "PATIENT" ? "Patient" : user.role}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-rose-600 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/customer/login"
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  href="/customer/signup"
                  className="bg-[#008A5E] hover:bg-[#007550] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>

              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#E8F8F0] text-[#008A5E] font-semibold px-4 py-2.5 rounded-xl text-sm"
            >
              Home
            </Link>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-[#008A5E] px-4 py-2 text-sm font-medium transition-colors"
            >
              Find Doctors
            </a>
            <a
              href="#specialties"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-[#008A5E] px-4 py-2 text-sm font-medium transition-colors"
            >
              Specialties
            </a>
            <Link
              href="/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-[#008A5E] px-4 py-2 text-sm font-medium transition-colors"
            >
              Customer Portal
            </Link>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-[#008A5E] px-4 py-2 text-sm font-medium transition-colors"
            >
              About
            </a>
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2.5">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={user.role === "PATIENT" ? "/customer" : defaultPortalForRole(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#008A5E] text-white py-2.5 rounded-xl text-sm font-bold block"
                >
                  My Portal ({user.full_name})
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/customer/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-gray-300 text-gray-700 hover:border-gray-400 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Patient Sign In
                </Link>
                <Link
                  href="/customer/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#008A5E] hover:bg-[#007550] text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  Patient Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
