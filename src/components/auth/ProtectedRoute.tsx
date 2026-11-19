"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { StaffRole } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: StaffRole[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center text-sm">
        Verifying your secure session…
      </div>
    );
  }

  if (roles && !roles.includes(user.role as StaffRole) && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-xl font-black text-slate-900">Access restricted</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account does not have permission to open this workspace.
          </p>
          <Link href="/admin/dashboard" className="mt-6 inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
