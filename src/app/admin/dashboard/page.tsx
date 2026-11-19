"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Stethoscope,
  Ticket,
  Users,
  Microscope,
  Receipt,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck2
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, appts, ords] = await Promise.all([
          fetchApi<any>("/dashboard/metrics"),
          fetchApi<any[]>("/doctors/appointments/list"),
          fetchApi<any[]>("/orders"),
        ]);
        setMetrics(m);
        setDoctorAppointments(appts);
        setOrders(ords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Executive Overview & Clinical Operations"
        subtitle="Real-time multi-branch metrics, chamber queues, and diagnostic pipelines"
      />

      <div className="p-6 sm:p-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Doctor Tokens</span>
            <p className="text-2xl font-black text-slate-900">{loading ? "—" : metrics?.doctor_appointments_today ?? 0}</p>
            <span className="text-[10px] text-teal-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Active Chamber Queue
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Registered Patients</span>
            <p className="text-2xl font-black text-teal-700">{loading ? "—" : metrics?.total_patients ?? 0}</p>
            <span className="text-[10px] text-slate-400 font-medium">Permanent UHIDs</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Diagnostic Orders</span>
            <p className="text-2xl font-black text-indigo-700">{loading ? "—" : metrics?.total_orders ?? 0}</p>
            <span className="text-[10px] text-slate-400 font-medium">In-House Lab Volume</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Today's Revenue</span>
            <p className="text-2xl font-black text-emerald-700">{loading ? "—" : `$${(metrics?.revenue_today ?? 0).toFixed(2)}`}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Cash & POS Settled</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Doctor Review</span>
            <p className="text-2xl font-black text-rose-600">{loading ? "—" : metrics?.pending_doctor_approvals ?? 0}</p>
            <span className="text-[10px] text-rose-500 font-semibold">Pathology Sign-off</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Completed Reports</span>
            <p className="text-2xl font-black text-teal-800">{loading ? "—" : metrics?.total_approved_reports ?? 0}</p>
            <span className="text-[10px] text-teal-600 font-medium">QR Verified PDFs</span>
          </div>
        </div>

        {/* Live Operations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Chamber OPD Tokens */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Live Doctor Chamber Token Dispatches</span>
                </h3>
                <p className="text-xs text-slate-400">Patients waiting or in consultation</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                {doctorAppointments.length} Tokens Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {doctorAppointments.map((appt) => (
                <div key={appt.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-xl flex flex-col items-center justify-center font-bold text-teal-800">
                      <span className="text-[9px]">TOKEN</span>
                      <span className="text-base leading-none">#{appt.token_number}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{appt.patient_name}</p>
                      <p className="text-slate-500 text-[11px]">
                        Consultant: <strong className="text-teal-700">{appt.doctor_name}</strong> ({appt.doctor_room})
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        {appt.appointment_date} at {appt.time_slot} | Ph: {appt.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : appt.status === "IN_CONSULTATION"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                    <p className="text-xs font-bold text-slate-900">${appt.consultation_fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Orders Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                  <Microscope className="w-4 h-4 text-indigo-600" />
                  <span>Recent Diagnostic Test Orders</span>
                </h3>
                <p className="text-xs text-slate-400">Specimens and clinical test requests</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {orders.length} Orders
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {orders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "RESULTS_ENTERED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold mt-0.5">{ord.patient_name} ({ord.patient_uhid})</p>
                    <p className="text-slate-400 text-[10px]">
                      Referred By: {ord.referring_doctor}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-900">${ord.invoice?.total?.toFixed(2) || "0.00"}</p>
                    <span className="text-[10px] text-slate-400">
                      {ord.items?.length || 0} Investigations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
