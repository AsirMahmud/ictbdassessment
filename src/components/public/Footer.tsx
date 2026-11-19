import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, Clock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0D241A] text-stone-300 pt-16 pb-12 border-t border-[#163829] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#008A5E] flex items-center justify-center text-white shadow-sm relative">
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
              <div>
                <span className="text-2xl font-bold tracking-tight text-white leading-none">
                  Medi<span className="text-[#34D399]">Book</span>
                </span>
                <p className="text-[10px] text-[#A7F3D0] font-semibold uppercase tracking-wider mt-0.5">
                  Doctor Appointment Platform
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm font-normal">
              MediBook connects patients with qualified, verified specialist doctors across Bangladesh. Book in-person or video consultations with instant confirmed chamber serial tokens in under a minute.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#34D399] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>BMDC Verified Doctors & 100% Encrypted Health Records</span>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Popular Specialties
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Cardiology & Heart Care</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Dermatology & Skin Care</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Orthopedic Surgery</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Gynecology & Obstetrics</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Pediatrics & Child Care</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">Internal Medicine</a></li>
              <li><a href="#specialties" className="hover:text-emerald-400 transition-colors">ENT & Eye Care</a></li>
            </ul>
          </div>

          {/* For Patients */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              For Patients
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#doctors" className="hover:text-emerald-400 transition-colors">Find Top Doctors</a></li>
              <li><Link href="/customer/signup" className="text-emerald-400 font-semibold hover:underline">Patient Sign Up</Link></li>
              <li><Link href="/customer/login" className="hover:text-emerald-400 transition-colors">Patient Sign In</Link></li>
              <li><Link href="/customer" className="hover:text-emerald-400 transition-colors">Customer Chamber Portal</Link></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How Booking Works</a></li>
              <li><a href="#testimonials" className="hover:text-emerald-400 transition-colors">Patient Reviews</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Help & Location
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span>Road 11, Banani & Dhanmondi, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>+880 (9610) 555-DOCS</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>support@medibook.health</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>Chamber Bookings: 24/7 Online</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1A4231] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} MediBook Doctor Appointment Platform. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-stone-300 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-stone-300 cursor-pointer transition">BMDC Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
