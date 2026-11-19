"use client";

import React from "react";
import { Building2, ShieldCheck, Activity, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E4EEE9] px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 z-20">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#008A5E] font-bold mb-1">MediBook workspace</p>
        <h1 className="text-xl font-extrabold text-[#15241B] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#71827A] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1.5 bg-[#F3FAF6] text-[#486057] border border-[#DCEDE4] px-3 py-1.5 rounded-full font-semibold">
          <Building2 className="w-3.5 h-3.5 text-[#008A5E]" />
          <span>Downtown Central Polyclinic & Lab</span>
        </div>

        <div className="flex items-center space-x-1 text-[#008A5E] bg-[#E8F8F0] border border-[#BFE5D0] px-2.5 py-1 rounded-full font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Session: {user?.role || "STAFF"}</span>
        </div>
      </div>
    </header>
  );
}
