"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Calendar, Clock, Star, MapPin } from "lucide-react";

interface HealthcareHeroVisualProps {
  onBookClick?: () => void;
}

export default function HealthcareHeroVisual({ onBookClick }: HealthcareHeroVisualProps) {
  return (
    <div className="relative mx-auto max-w-lg lg:max-w-none flex items-center justify-center select-none">
      {/* Background Organic Mint Shape & Hospital Aesthetic */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[1.15/1] max-w-[560px] flex items-center justify-center">
        {/* Organic Soft Mint Teal Fluid Shape (matching reference) */}
        <div
          className="absolute inset-0 rounded-[48px] sm:rounded-[60px] bg-gradient-to-tr from-[#98E2C6]/85 via-[#D0F3E5]/70 to-[#EBF9F3]/90 transform -rotate-1 shadow-xl overflow-hidden"
          style={{
            clipPath: "polygon(0% 12%, 15% 0%, 88% 0%, 100% 15%, 100% 88%, 85% 100%, 12% 100%, 0% 85%)"
          }}
        >
          {/* Subtle Hospital Building Architectural Line Art / Backdrop */}
          <div className="absolute top-0 right-0 w-3/5 h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 400 500" fill="none" className="w-full h-full text-emerald-800" xmlns="http://www.w3.org/2000/svg">
              <rect x="180" y="50" width="200" height="400" rx="16" fill="currentColor" fillOpacity="0.15" />
              <rect x="200" y="80" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="245" y="80" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="290" y="80" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="335" y="80" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="200" y="130" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="245" y="130" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="290" y="130" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="335" y="130" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="200" y="180" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="245" y="180" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="290" y="180" width="30" height="30" rx="4" fill="currentColor" />
              <rect x="335" y="180" width="30" height="30" rx="4" fill="currentColor" />
              {/* Medical Cross on Hospital Top */}
              <rect x="270" y="15" width="20" height="20" rx="4" fill="#008A5E" />
              <path d="M280 20v10M275 25h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Soft Lighting Radial Bloom */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Doctor Photo (Professional verified doctor in lab coat with stethoscope) */}
        <div className="relative z-10 w-[88%] h-[92%] rounded-[38px] overflow-hidden shadow-2xl border-2 border-white/80 bg-white">
          <img
            src="/hero-doctor.jpg"
            alt="MediBook Confident Verified Doctor"
            className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-500"
          />

          {/* Subtle Bottom Gradient for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Floating Verified Doctor Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center space-x-2 border border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-800">Verified Specialist</span>
            <ShieldCheck className="w-4 h-4 text-[#008A5E]" />
          </div>

          {/* Quick Book pill on bottom right */}
          <div
            onClick={onBookClick}
            className="absolute bottom-4 right-4 bg-[#008A5E] hover:bg-[#007550] text-white px-4 py-2 rounded-xl shadow-lg cursor-pointer flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold">Book Instantly</span>
          </div>

          {/* Rating tag on bottom left */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5 border border-gray-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-800">4.9</span>
            <span className="text-[10px] text-gray-500">(1.2k+ reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
