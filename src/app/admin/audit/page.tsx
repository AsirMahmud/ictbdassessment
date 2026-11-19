"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>("/audit");
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Regulatory Clinical Audit Trail"
        subtitle="Immutable electronic trail of all appointment bookings, result entries, price overrides, and sign-offs"
      />

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">System Activity Records</h2>
            <p className="text-xs text-slate-500">Non-repudiation audit logging compliant with clinical governance</p>
          </div>
          <button
            onClick={loadLogs}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-800 font-semibold">{log.details}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    User: <strong>{log.user_email}</strong> | Role: {log.user_role} | Entity: {log.entity_type} ({log.entity_id})
                  </p>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
