"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ShieldCheck, CheckCircle2, Download, FileText, Activity } from "lucide-react";
import { apiUrl, fetchApi } from "@/lib/api";

export default function AdminPathologyPage() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<any>(null);
  const [summaryNotes, setSummaryNotes] = useState("Observed parameters correlate with clinical presentation. Approved.");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [pending, reps] = await Promise.all([
        fetchApi<any[]>("/reports/queue/pending-verification"),
        fetchApi<any[]>("/reports"),
      ]);
      setPendingOrders(pending);
      setReports(reps);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async () => {
    if (!selectedOrderForApproval) return;
    setLoading(true);
    try {
      const res = await fetchApi<any>(`/reports/orders/${selectedOrderForApproval.order_id}/approve`, {
        method: "POST",
        body: JSON.stringify({ clinical_summary: summaryNotes })
      });
      alert(`Report ${res.report_number} verified and approved! SHA-256: ${res.checksum_sha256.substring(0, 16)}...`);
      setSelectedOrderForApproval(null);
      loadData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Pathologist Verification & Report Approval"
        subtitle="Review observed analytical values against biological reference intervals and digitally sign reports"
      />

      <div className="p-6 sm:p-8 space-y-8">
        {/* Verification Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Orders Awaiting Pathologist Sign-off</span>
              </h3>
              <p className="text-xs text-slate-400">Enforcing strict separation of clinical duties</p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
              {pendingOrders.length} Pending
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders currently pending doctor verification.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((ord) => (
                <div key={ord.order_id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</span>
                      <h4 className="font-bold text-slate-800 mt-0.5">{ord.patient_name} ({ord.patient_uhid})</h4>
                      <p className="text-[11px] text-slate-500">Ref: {ord.referring_doctor}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                      RESULTS LOGGED
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <span className="font-bold text-slate-700 block text-[11px]">Laboratory Findings:</span>
                    {ord.tests.map((t: any, idx: number) => (
                      <div key={idx} className="text-[11px] space-y-0.5">
                        <span className="font-bold text-teal-800">{t.test_name}:</span>
                        <div className="text-slate-600 pl-2">
                          {t.parameters.map((p: any) => `${p.name}: ${p.value} ${p.unit || ''} [${p.flag}]`).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedOrderForApproval(ord);
                        setSummaryNotes("Observed clinical parameters correlate with diagnosis. Approved.");
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Review & Approve Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Reports Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Digitally Signed & QR-Verified Reports</span>
              </h3>
              <p className="text-xs text-slate-400">Cryptographically sealed PDF medical records</p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full border border-teal-200">
              {reports.length} Approved Reports
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.map((rep) => (
              <div key={rep.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{rep.report_number}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {rep.status}
                    </span>
                    <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      QR: {rep.verification_code}
                    </span>
                  </div>
                  <p className="text-slate-700 font-bold">
                    Patient: {rep.order?.patient_name} ({rep.order?.patient_uhid})
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Signed By: <strong>{rep.approved_by_name}</strong> | SHA256: {rep.checksum_sha256?.substring(0, 20)}...
                  </p>
                </div>

                <a
                  href={apiUrl(`/reports/${rep.id}/pdf?verification_code=${encodeURIComponent(rep.verification_code || "")}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Sign-off */}
        {selectedOrderForApproval && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Pathologist Digital Sign-off</h3>
                  <p className="text-xs text-slate-500">
                    Dr. Helena Cross, MD (Consultant Pathologist) — NABL / ISO 15189
                  </p>
                </div>
                <button onClick={() => setSelectedOrderForApproval(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p><strong>Order Ref:</strong> {selectedOrderForApproval.order_number}</p>
                <p><strong>Patient:</strong> {selectedOrderForApproval.patient_name} ({selectedOrderForApproval.patient_uhid})</p>
                <p><strong>Referring Clinician:</strong> {selectedOrderForApproval.referring_doctor}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pathologist Summary & Clinical Notes *
                </label>
                <textarea
                  rows={3}
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedOrderForApproval(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Generate PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
