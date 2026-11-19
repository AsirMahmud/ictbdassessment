"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Ticket,
  ClipboardCheck,
  Users,
  Microscope,
  FileCheck2,
  Receipt,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  HeartPulse,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hasPortalAccess } from "@/lib/permissions";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Specialist Doctors", href: "/admin/doctors", icon: Stethoscope },
    { label: "Staff & Access", href: "/admin/staff", icon: UserCog },
    { label: "OPD Token Desk", href: "/admin/opd", icon: Ticket },
    { label: "Chamber Consultations", href: "/admin/consultations", icon: ClipboardCheck },
    { label: "Patient Registry", href: "/admin/patients", icon: Users },
    { label: "Laboratory & Barcodes", href: "/admin/lab", icon: Microscope },
    { label: "Pathology Verification", href: "/admin/pathology", icon: FileCheck2 },
    { label: "Billing & Cashier", href: "/admin/billing", icon: Receipt },
    { label: "Audit Trail", href: "/admin/audit", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-white text-[#486057] flex flex-col justify-between shrink-0 border-r border-[#E4EEE9] min-h-screen sticky top-0 h-screen">
      <div className="space-y-4">
        {/* Brand */}
        <div className="p-5 border-b border-[#EAF2EE] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#008A5E] flex items-center justify-center text-white font-black shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-[#15241B] tracking-tight text-sm">Medi<span className="text-[#008A5E]">Book</span></h2>
            <p className="text-[10px] text-[#6B7D75] font-semibold tracking-normal">
              Clinical operations
            </p>
          </div>
        </div>

        {/* Current User & Role Switcher */}
        <div className="px-4">
          <div className="bg-[#F3FAF6] border border-[#DCEDE4] rounded-2xl p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#DDF4E8] text-[#008A5E] font-black flex items-center justify-center text-xs">
                {user?.full_name ? user.full_name[0] : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#15241B] truncate">{user?.full_name || "Admin User"}</p>
                <span className="text-[10px] bg-white text-[#008A5E] border border-[#BFE5D0] px-1.5 py-0.5 rounded font-mono font-semibold">
                  {user?.role || "CENTER_ADMIN"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.filter((item) => hasPortalAccess(user?.role, item.href)).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-[#E8F8F0] text-[#008A5E] shadow-sm"
                    : "text-[#6B7D75] hover:text-[#15241B] hover:bg-[#F5FAF7]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#008A5E]" : "text-[#92A39B]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#EAF2EE] space-y-2">
        <Link
          href="/doctor"
          className="flex items-center space-x-2 text-xs text-[#008A5E] hover:text-[#007550] transition font-bold px-2 py-2 bg-[#F3FAF6] border border-[#DCEDE4] rounded-xl"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Chamber Portal</span>
        </Link>
        <Link
          href="/customer"
          className="flex items-center space-x-2 text-xs text-[#008A5E] hover:text-[#007550] transition font-bold px-2 py-2 bg-[#F3FAF6] border border-[#DCEDE4] rounded-xl"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer / Patient Portal</span>
        </Link>
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs text-[#82938B] hover:text-[#008A5E] transition font-medium px-2 py-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-1.5 bg-[#15241B] hover:bg-[#0D241A] text-white text-xs font-bold py-2.5 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
