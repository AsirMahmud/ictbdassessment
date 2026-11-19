"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { rolesForPath } from "@/lib/permissions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <ProtectedRoute roles={rolesForPath(pathname)}>
      <div className="admin-theme min-h-screen bg-[#F8FBF9] flex font-sans text-[#15241B]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FBF9]">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
