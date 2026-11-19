"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Ticket,
  Plus,
  Printer,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Pill,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminOPDPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedApptForSlip, setSelectedApptForSlip] = useState<any>(null);
  const [viewHistoryPatient, setViewHistoryPatient] = useState<any>(null);
  const [patientHistoryData, setPatientHistoryData] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filters
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [issueForm, setIssueForm] = useState({
    doctor_id: "",
    patient_name: "",
    phone: "",
    gender: "MALE",
    age: 35,
    appointment_date: new Date().toISOString().split("T")[0],
    time_slot: "05:30 PM",
    symptoms: "",
    payment_method: "CASH"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, docs, pts] = await Promise.all([
        fetchApi<any[]>("/doctors/appointments/list"),
        fetchApi<any[]>("/doctors"),
        fetchApi<any[]>("/patients"),
      ]);
      setAppointments(appts);
      setDoctors(docs);
      setPatients(pts);
      if (docs.length > 0 && !issueForm.doctor_id) {
        setIssueForm((prev) => ({ ...prev, doctor_id: docs[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // The initial queue load intentionally runs once; mutations refresh it explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doc = doctors.find((d) => d.id === issueForm.doctor_id);
      const res = await fetchApi<any>("/doctors/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          ...issueForm,
          branch_id: doc?.branch_id,
          consultation_fee: doc?.consultation_fee
        })
      });
      setShowIssueModal(false);
      setSelectedApptForSlip(res);
      loadData();
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Change appointment status (e.g. Check-In to WAITING, or Call to IN_CONSULTATION)
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await fetchApi(`/doctors/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // View patient's previous prescriptions
  const handleOpenPatientHistory = async (appt: any) => {
    setViewHistoryPatient(appt);
    setLoadingHistory(true);
    try {
      const hist = await fetchApi<any>(`/doctors/patient-prescriptions/${encodeURIComponent(appt.phone)}`);
      setPatientHistoryData(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchDoctor = selectedDoctorFilter === "ALL" || a.doctor_id === selectedDoctorFilter;
    const matchStatus = selectedStatusFilter === "ALL" || a.status === selectedStatusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      q === "" ||
      a.patient_name.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      a.appointment_number.toLowerCase().includes(q) ||
      a.doctor_name.toLowerCase().includes(q);
    return matchDoctor && matchStatus && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col font-sans">
      <AdminHeader
        title="OPD Reception Desk & Token Queue"
        subtitle="Live cross-chamber registry: dispatch sequential tokens, check-in patients to waiting room, and view prescription history"
      />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Controls Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Patient, Phone or Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Doctor Filter */}
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Doctors ({doctors.length})</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="WAITING">Waiting in Queue</option>
              <option value="IN_CONSULTATION">In Chamber</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-700" : ""}`} />
            </button>

            {/* Issue Token Button */}
            <button
              onClick={() => setShowIssueModal(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Walk-in Token</span>
            </button>
          </div>
        </div>

        {/* Live Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-13 h-13 bg-teal-50 border-2 border-teal-200 rounded-2xl flex flex-col items-center justify-center font-black text-teal-900 shadow-2xs">
                    <span className="text-[9px] uppercase tracking-wider text-teal-700 font-bold">SERIAL</span>
                    <span className="text-2xl font-black leading-none">#{appt.token_number}</span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${appt.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : appt.status === "IN_CONSULTATION"
                          ? "bg-purple-100 text-purple-800 animate-pulse"
                          : appt.status === "WAITING"
                            ? "bg-amber-100 text-amber-800 font-extrabold"
                            : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {appt.status === "WAITING" ? "Waiting in Queue" : appt.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{appt.patient_name}</h3>
                  <p className="text-xs font-bold text-teal-700">
                    Chamber: {appt.doctor_name} ({appt.doctor_room})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {appt.gender}, {appt.age} Y • Ph: {appt.phone}
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Appointment Ref:</span>
                    <strong className="font-mono text-slate-800">{appt.appointment_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slot:</span>
                    <strong className="text-slate-800">{appt.appointment_date} at {appt.time_slot}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee:</span>
                    <strong className="text-emerald-700">${appt.consultation_fee} ({appt.payment_status})</strong>
                  </div>
                  {appt.symptoms && (
                    <p className="italic text-slate-500 pt-1 border-t border-slate-200/60 line-clamp-1">
                      "{appt.symptoms}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {appt.status === "SCHEDULED" ? (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "WAITING")}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-2xs transition"
                    >
                      ✓ Check-In Patient
                    </button>
                  ) : appt.status === "WAITING" ? (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "IN_CONSULTATION")}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition"
                    >
                      Send to Chamber →
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500">
                      {appt.status === "COMPLETED" ? "Consultation Finished" : "In Chamber Now"}
                    </span>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenPatientHistory(appt)}
                      className="text-teal-700 hover:bg-teal-50 p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
                      title="View Previous Prescriptions"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>

                    <button
                      onClick={() => setSelectedApptForSlip(appt)}
                      className="text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1"
                      title="Print Token Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Appointments Found</h4>
            <p className="text-xs text-slate-500">Try adjusting your filters or issue a new walk-in token.</p>
          </div>
        )}

        {/* Modal: Issue Walk-In OPD Token */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    Walk-In Reception Desk
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-0.5">Issue Chamber Serial Token</h3>
                </div>
                <button onClick={() => setShowIssueModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleIssueToken} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Doctor Chamber *</label>
                  <select
                    value={issueForm.doctor_id}
                    onChange={(e) => setIssueForm({ ...issueForm, doctor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialization} ({d.room_number}) [Fee: ${d.consultation_fee}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Doe"
                    value={issueForm.patient_name}
                    onChange={(e) => setIssueForm({ ...issueForm, patient_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 0101"
                      value={issueForm.phone}
                      onChange={(e) => setIssueForm({ ...issueForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={issueForm.gender}
                      onChange={(e) => setIssueForm({ ...issueForm, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      value={issueForm.age}
                      onChange={(e) => setIssueForm({ ...issueForm, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Visiting Date *</label>
                    <input
                      type="date"
                      required
                      value={issueForm.appointment_date}
                      onChange={(e) => setIssueForm({ ...issueForm, appointment_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chief Symptoms / Reason</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of complaints..."
                    value={issueForm.symptoms}
                    onChange={(e) => setIssueForm({ ...issueForm, symptoms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    Generate Serial Token
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Print Slip */}
        {selectedApptForSlip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="border-2 border-dashed border-teal-300 p-5 rounded-2xl bg-teal-50/50 space-y-2">
                <span className="text-[10px] font-black uppercase bg-teal-700 text-white px-2.5 py-0.5 rounded">
                  CHAMBER SERIAL TOKEN
                </span>
                <p className="text-4xl font-black text-slate-900">SERIAL #{selectedApptForSlip.token_number}</p>
                <h4 className="font-extrabold text-sm text-slate-800">{selectedApptForSlip.patient_name}</h4>
                <p className="text-xs font-bold text-teal-800">
                  {selectedApptForSlip.doctor_name} ({selectedApptForSlip.doctor_room})
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedApptForSlip.appointment_date} at {selectedApptForSlip.time_slot}
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
                  <span>Fee Paid:</span>
                  <span className="text-emerald-700">${selectedApptForSlip.consultation_fee} (PAID)</span>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setSelectedApptForSlip(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setSelectedApptForSlip(null);
                  }}
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Print Token Slip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Patient Prescription History */}
        {viewHistoryPatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    Patient Medical & Prescription History
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">
                    {viewHistoryPatient.patient_name} ({viewHistoryPatient.phone})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setViewHistoryPatient(null);
                    setPatientHistoryData(null);
                  }}
                  className="text-slate-400 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading prescription records...</div>
              ) : !patientHistoryData?.prescriptions || patientHistoryData.prescriptions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No previous prescriptions found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {patientHistoryData.prescriptions.map((rx: any) => (
                    <div
                      key={rx.appointment_id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                        <div>
                          <strong className="text-slate-900">{rx.doctor?.name}</strong>
                          <span className="text-slate-500 text-[11px] block">{rx.doctor?.specialization}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-teal-800">
                          {rx.appointment_date} (Token #{rx.token_number})
                        </span>
                      </div>

                      {rx.clinical_vitals && (
                        <p className="text-[11px] font-mono text-teal-900 bg-white p-2 rounded-lg border border-slate-200">
                          <strong>Vitals: </strong>{rx.clinical_vitals}
                        </p>
                      )}

                      {rx.prescription_notes && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Medications:</span>
                          <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap">
                            {rx.prescription_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setViewHistoryPatient(null);
                    setPatientHistoryData(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
