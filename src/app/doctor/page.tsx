"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import {
  Stethoscope,
  Activity,
  ClipboardList,
  Microscope,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Printer,
  Copy,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  Pill,
  Ticket,
  Calendar,
  HeartPulse
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function DoctorPortalWorkspace() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");
  const [queueData, setQueueData] = useState<any>(null);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableTests, setAvailableTests] = useState<any[]>([]);

  // Active examination state
  const [vitals, setVitals] = useState({
    bp: "120/80",
    pulse: "72",
    weight: "70",
    sugar: "105",
    spo2: "98%"
  });
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [recommendedTests, setRecommendedTests] = useState<string[]>([]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"prescribe" | "previous_rx" | "lab_history">("prescribe");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Load doctors & tests list
  useEffect(() => {
    async function init() {
      try {
        const [doctorData, testList] = await Promise.all([
          user?.role === "DOCTOR" || user?.role === "PATHOLOGIST"
            ? fetchApi<any>("/doctors/me")
            : fetchApi<any[]>("/doctors"),
          fetchApi<any[]>("/catalog/tests"),
        ]);
        const docs = Array.isArray(doctorData) ? doctorData : [doctorData];
        setDoctors(docs);
        setAvailableTests(testList);
        if (docs.length > 0) {
          setActiveDoctorId(docs[0].id);
        }
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    }
    init();
  }, [user?.role]);

  // Load doctor queue whenever activeDoctorId changes
  const loadDoctorQueue = async (docId?: string) => {
    const id = docId || activeDoctorId;
    if (!id) return;
    setLoadingQueue(true);
    try {
      const q = await fetchApi<any>(`/doctors/${id}/queue`);
      setQueueData(q);
      
      // Auto-select first appointment in consultation or waiting if none selected
      if (q.appointments && q.appointments.length > 0) {
        const inConsult = q.appointments.find((a: any) => a.status === "IN_CONSULTATION");
        const waiting = q.appointments.find((a: any) => a.status === "WAITING");
        const toSelect = inConsult || waiting || q.appointments[0];
        if (!activeAppointment || !q.appointments.some((a: any) => a.id === activeAppointment.id)) {
          selectAppointment(toSelect);
        }
      } else {
        setActiveAppointment(null);
        setPatientHistory(null);
      }
    } catch (err) {
      console.error("Error loading doctor queue", err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeDoctorId) {
      loadDoctorQueue(activeDoctorId);
    }
    // Queue refreshes are triggered by explicit actions and doctor selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoctorId]);

  // Select an appointment & fetch previous prescriptions
  const selectAppointment = async (appt: any) => {
    setActiveAppointment(appt);
    setPrescriptionNotes(appt.prescription_notes || "");
    
    // Parse vitals if present
    if (appt.clinical_vitals) {
      // Keep or prefill
    }

    // Parse recommended tests if present
    if (appt.recommended_tests_json) {
      try {
        const parsed = JSON.parse(appt.recommended_tests_json);
        if (Array.isArray(parsed)) setRecommendedTests(parsed);
      } catch {
        setRecommendedTests([]);
      }
    } else {
      setRecommendedTests([]);
    }

    // Load patient's previous prescriptions and medical history
    const lookupKey = appt.patient_id || appt.phone;
    if (lookupKey) {
      setLoadingHistory(true);
      try {
        const hist = await fetchApi<any>(`/doctors/patient-prescriptions/${encodeURIComponent(lookupKey)}`);
        setPatientHistory(hist);
      } catch (err) {
        console.error("Failed to load patient history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  // Call Patient into Chamber
  const handleCallToChamber = async (appt: any) => {
    try {
      await fetchApi(`/doctors/appointments/${appt.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "IN_CONSULTATION" })
      });
      loadDoctorQueue();
      selectAppointment({ ...appt, status: "IN_CONSULTATION" });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Save Prescription & Mark Consulted
  const handleCompleteConsultation = async (orderLabTests: boolean = false) => {
    if (!activeAppointment) return;
    setSubmitting(true);
    try {
      const vitalsText = `BP: ${vitals.bp} mmHg, Pulse: ${vitals.pulse} bpm, Wt: ${vitals.weight} kg, Sugar: ${vitals.sugar} mg/dL, SpO2: ${vitals.spo2}`;

      // 1. Update appointment with vitals, prescription and tests
      await fetchApi(`/doctors/appointments/${activeAppointment.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "COMPLETED",
          clinical_vitals: vitalsText,
          prescription_notes: prescriptionNotes,
          recommended_tests: recommendedTests
        })
      });

      // 2. If recommended tests exist and orderLabTests requested, convert to Lab Order
      if (orderLabTests && recommendedTests.length > 0) {
        const labRes = await fetchApi<any>(`/doctors/appointments/${activeAppointment.id}/convert-to-lab-order`, {
          method: "POST"
        });
        alert(`Consultation Completed! Generated Lab Order #${labRes.order_number}`);
      } else {
        alert(`Consultation Completed for Serial #${activeAppointment.token_number} (${activeAppointment.patient_name})! Prescription saved to database.`);
      }

      // Reload queue and history
      loadDoctorQueue();
      if (activeAppointment.phone) {
        const hist = await fetchApi<any>(`/doctors/patient-prescriptions/${encodeURIComponent(activeAppointment.phone)}`);
        setPatientHistory(hist);
      }
    } catch (err: any) {
      alert(`Error saving consultation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Copy previous prescription note to current editor
  const handleCopyPreviousRx = (prevRx: any) => {
    if (prevRx.prescription_notes) {
      setPrescriptionNotes((prev) =>
        prev
          ? `${prev}\n\n[Previous Rx from ${prevRx.appointment_date} - ${prevRx.doctor?.name}]:\n${prevRx.prescription_notes}`
          : prevRx.prescription_notes
      );
      if (prevRx.recommended_tests && prevRx.recommended_tests.length > 0) {
        const prevIds = prevRx.recommended_tests.map((t: any) => t.id);
        setRecommendedTests((current) => Array.from(new Set([...current, ...prevIds])));
      }
      setActiveWorkspaceTab("prescribe");
    }
  };

  const activeDoc = queueData?.doctor || doctors.find((d) => d.id === activeDoctorId);
  const appointmentsList = queueData?.appointments || [];
  const filteredAppointments = appointmentsList.filter((a: any) => {
    if (filterStatus === "ALL") return true;
    return a.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans text-stone-800 antialiased selection:bg-[#8EA89B]/30 selection:text-[#1B3B2B]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Doctor Selection & Chamber Header */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B3B2B] text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Stethoscope className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded tracking-wider">
                  Doctor Chamber Console
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {queueData?.date || "Today"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#15241B] mt-1 tracking-tight">
                {activeDoc?.name || "Specialist Physician"}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {activeDoc?.specialization} • {activeDoc?.qualifications} • <strong>{activeDoc?.room_number}</strong>
              </p>
            </div>
          </div>

          {/* Doctor Switcher Dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 px-3.5 py-1.5 rounded-2xl">
              <span className="text-xs font-bold text-stone-600">Switch Doctor:</span>
              <select
                value={activeDoctorId}
                onChange={(e) => {
                  setActiveDoctorId(e.target.value);
                  setActiveAppointment(null);
                }}
                className="bg-transparent text-xs font-black text-[#15241B] focus:outline-none cursor-pointer"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} ({d.room_number})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => loadDoctorQueue()}
              disabled={loadingQueue}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2.5 rounded-xl transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loadingQueue ? "animate-spin text-[#1B3B2B]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Chamber Queue Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Patients Today</span>
            <span className="text-2xl font-black text-[#15241B]">{queueData?.stats?.total || 0}</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">Waiting in Lobby</span>
            <span className="text-2xl font-black text-amber-900">{queueData?.stats?.waiting || 0}</span>
          </div>
          <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-purple-800 block">In Chamber Now</span>
            <span className="text-2xl font-black text-purple-900">{queueData?.stats?.in_consultation || 0}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Consultations Done</span>
            <span className="text-2xl font-black text-emerald-900">{queueData?.stats?.completed || 0}</span>
          </div>
        </div>

        {/* Two-Column Clinical Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLUMNS: PATIENT SERIAL QUEUE */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-extrabold text-[#15241B]">Chamber Serial Queue</h3>
                <p className="text-[11px] text-stone-500">Live queue assigned by reception & online bookings</p>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-[11px] font-bold bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-700"
              >
                <option value="ALL">All ({appointmentsList.length})</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_CONSULTATION">In Chamber</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <Ticket className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-semibold">No appointments found for this doctor today.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                {filteredAppointments.map((appt: any) => {
                  const isSelected = activeAppointment?.id === appt.id;
                  return (
                    <div
                      key={appt.id}
                      onClick={() => selectAppointment(appt)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                          : "bg-[#FAF9F5]/70 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        {/* Big Serial / Token Callout */}
                        <div className="flex items-center space-x-2.5">
                          <span className="w-10 h-10 rounded-xl bg-[#1B3B2B] text-white flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <span className="text-[8px] text-emerald-300 uppercase leading-none">#</span>
                            <span className="text-base font-black leading-none">{appt.token_number}</span>
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-[#15241B]">{appt.patient_name}</h4>
                            <p className="text-[11px] text-stone-500">
                              {appt.gender}, {appt.age} Y • Ph: {appt.phone}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            appt.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : appt.status === "IN_CONSULTATION"
                              ? "bg-purple-100 text-purple-800 animate-pulse"
                              : appt.status === "WAITING"
                              ? "bg-amber-100 text-amber-800 font-extrabold"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      {/* Symptoms & Slot */}
                      <div className="flex justify-between items-center text-[11px] text-stone-600 pt-1 border-t border-stone-200/50">
                        <span className="font-mono text-[10px] text-stone-500">{appt.time_slot}</span>
                        {appt.symptoms ? (
                          <span className="truncate max-w-[200px] italic">"{appt.symptoms}"</span>
                        ) : (
                          <span className="text-stone-400">Regular Consultation</span>
                        )}
                      </div>

                      {/* Quick Call Button */}
                      <div className="flex justify-end pt-1">
                        {appt.status !== "COMPLETED" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallToChamber(appt);
                            }}
                            className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs flex items-center space-x-1"
                          >
                            <span>Call to Chamber →</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Consulted</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT 7 COLUMNS: ACTIVE CONSULTATION & PREVIOUS PRESCRIPTION DESK */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
            {activeAppointment ? (
              <div className="space-y-6">
                {/* Active Patient Clinical Banner */}
                <div className="bg-gradient-to-r from-[#1B3B2B] to-[#244837] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[8px] uppercase tracking-wider text-emerald-300 font-bold">SERIAL</span>
                      <span className="text-2xl font-black leading-none text-white">#{activeAppointment.token_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                        Patient Under Examination
                      </span>
                      <h3 className="text-xl font-black text-white">{activeAppointment.patient_name}</h3>
                      <p className="text-xs text-stone-200">
                        Age: {activeAppointment.age} Y • Gender: {activeAppointment.gender} • Ph: {activeAppointment.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {activeAppointment.status !== "IN_CONSULTATION" && (
                      <button
                        onClick={() => handleCallToChamber(activeAppointment)}
                        className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black px-3 py-1.5 rounded-xl text-xs shadow-xs"
                      >
                        Set In Chamber
                      </button>
                    )}
                  </div>
                </div>

                {/* Symptoms / Chief Complaints Alert */}
                {activeAppointment.symptoms && (
                  <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-xs text-amber-900">
                    <strong className="block text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">
                      Chief Complaint / Reported Symptoms:
                    </strong>
                    "{activeAppointment.symptoms}"
                  </div>
                )}

                {/* Desk Workspace Tabs */}
                <div className="flex border-b border-stone-200 space-x-4">
                  <button
                    onClick={() => setActiveWorkspaceTab("prescribe")}
                    className={`pb-3 text-xs font-extrabold flex items-center space-x-1.5 border-b-2 transition ${
                      activeWorkspaceTab === "prescribe"
                        ? "border-[#1B3B2B] text-[#1B3B2B]"
                        : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Prescription Pad</span>
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab("previous_rx")}
                    className={`pb-3 text-xs font-extrabold flex items-center space-x-1.5 border-b-2 transition ${
                      activeWorkspaceTab === "previous_rx"
                        ? "border-[#1B3B2B] text-[#1B3B2B]"
                        : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Previous Prescriptions</span>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {patientHistory?.prescriptions?.filter((p: any) => p.prescription_notes || p.status === "COMPLETED").length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab("lab_history")}
                    className={`pb-3 text-xs font-extrabold flex items-center space-x-1.5 border-b-2 transition ${
                      activeWorkspaceTab === "lab_history"
                        ? "border-[#1B3B2B] text-[#1B3B2B]"
                        : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    <span>Patient Lab History</span>
                    <span className="bg-stone-200 text-stone-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {patientHistory?.lab_history?.length || 0}
                    </span>
                  </button>
                </div>

                {/* TAB 1: ACTIVE DIGITAL PRESCRIPTION PAD */}
                {activeWorkspaceTab === "prescribe" && (
                  <div className="space-y-5">
                    {/* Clinical Vitals Section */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-700" />
                        <span>Clinical Vitals Measurement</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5">BP (mmHg)</label>
                          <input
                            type="text"
                            value={vitals.bp}
                            onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Pulse (bpm)</label>
                          <input
                            type="text"
                            value={vitals.pulse}
                            onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Weight (kg)</label>
                          <input
                            type="text"
                            value={vitals.weight}
                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Blood Sugar</label>
                          <input
                            type="text"
                            value={vitals.sugar}
                            onChange={(e) => setVitals({ ...vitals, sugar: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5">SpO2</label>
                          <input
                            type="text"
                            value={vitals.spo2}
                            onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prescription Medications Textarea */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-700" />
                          <span>Prescription Medications & Instructions (Rx)</span>
                        </h4>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPrescriptionNotes(
                                "Tab. Rosuvastatin 10mg OD HS x 30 days.\nTab. Telmisartan 40mg OD Morning.\nAdvised low salt diet, daily brisk walking 30 min."
                              )
                            }
                            className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold"
                          >
                            + Cardio Rx
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPrescriptionNotes(
                                "Tab. Metformin 500mg BD after meals.\nTab. Glimepiride 1mg OD before breakfast.\nAdvised HbA1c review after 3 months, low glycemic diet."
                              )
                            }
                            className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold"
                          >
                            + Diabetes Rx
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Write medications, dosages, frequency, dietary instructions and exercise advice..."
                        value={prescriptionNotes}
                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                        className="w-full p-3.5 border border-stone-300 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-[#1B3B2B] focus:outline-none"
                      />
                    </div>

                    {/* 1-Click Recommended Diagnostic Tests */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <Microscope className="w-3.5 h-3.5 text-teal-700" />
                          <span>Advise In-House Diagnostic Tests (1-Click Order)</span>
                        </h4>
                        <span className="text-xs font-bold text-emerald-800">
                          {recommendedTests.length} tests selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200 max-h-36 overflow-y-auto">
                        {availableTests.map((t) => (
                          <label
                            key={t.id}
                            className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer p-1 rounded hover:bg-white transition"
                          >
                            <input
                              type="checkbox"
                              checked={recommendedTests.includes(t.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecommendedTests([...recommendedTests, t.id]);
                                } else {
                                  setRecommendedTests(recommendedTests.filter((id) => id !== t.id));
                                }
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span className="truncate">{t.name} (${t.price})</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Consultation Finish Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => window.print()}
                        className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-600" />
                        <span>Print Prescription</span>
                      </button>

                      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleCompleteConsultation(false)}
                          disabled={submitting}
                          className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          {submitting ? "Saving..." : "Save Prescription"}
                        </button>
                        <button
                          onClick={() => handleCompleteConsultation(true)}
                          disabled={submitting}
                          className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete & Order Tests</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PREVIOUS PRESCRIPTIONS (CORE REQUIREMENT) */}
                {activeWorkspaceTab === "previous_rx" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase text-stone-700 tracking-wider">
                          Patient Prescription History
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Review previous medications, dosages, vitals, and physician advice
                        </p>
                      </div>
                    </div>

                    {loadingHistory ? (
                      <div className="p-8 text-center text-stone-400 text-xs">
                        Loading patient prescriptions...
                      </div>
                    ) : !patientHistory?.prescriptions ||
                      patientHistory.prescriptions.filter((p: any) => p.prescription_notes || p.status === "COMPLETED").length === 0 ? (
                      <div className="bg-stone-50 rounded-2xl p-6 text-center border border-dashed border-stone-300 text-xs text-stone-500 space-y-1">
                        <ClipboardList className="w-8 h-8 text-stone-300 mx-auto" />
                        <p className="font-bold">No previous prescriptions found for this patient.</p>
                        <p className="text-[11px] text-stone-400">
                          This is either a first-time consultation or previous notes were not recorded.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                        {patientHistory.prescriptions
                          .filter((p: any) => p.prescription_notes || p.status === "COMPLETED")
                          .map((prev: any) => (
                            <div
                              key={prev.appointment_id}
                              className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 shadow-2xs"
                            >
                              <div className="flex justify-between items-start border-b border-stone-200/60 pb-2">
                                <div>
                                  <span className="text-[10px] font-mono text-stone-500 font-bold">
                                    {prev.appointment_number} • {prev.appointment_date}
                                  </span>
                                  <h5 className="font-extrabold text-xs text-[#15241B]">
                                    {prev.doctor?.name} ({prev.doctor?.specialization})
                                  </h5>
                                </div>
                                <button
                                  onClick={() => handleCopyPreviousRx(prev)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                                  title="Copy medications to active prescription"
                                >
                                  <Copy className="w-3 h-3 text-emerald-700" />
                                  <span>Copy to Current Rx</span>
                                </button>
                              </div>

                              {prev.clinical_vitals && (
                                <div className="text-[11px] text-stone-700 bg-white p-2 rounded-xl border border-stone-200/60">
                                  <strong className="text-teal-900">Vitals Recorded: </strong>
                                  <span className="font-mono">{prev.clinical_vitals}</span>
                                </div>
                              )}

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-stone-500 block">
                                  Prescribed Medications:
                                </span>
                                <p className="text-xs text-stone-900 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200 font-sans leading-relaxed">
                                  {prev.prescription_notes || "No notes"}
                                </p>
                              </div>

                              {prev.recommended_tests && prev.recommended_tests.length > 0 && (
                                <div className="text-[11px]">
                                  <strong className="text-stone-600 block mb-1">Advised Investigations:</strong>
                                  <div className="flex flex-wrap gap-1.5">
                                    {prev.recommended_tests.map((t: any) => (
                                      <span
                                        key={t.id}
                                        className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                      >
                                        {t.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: PATIENT LAB TEST HISTORY */}
                {activeWorkspaceTab === "lab_history" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-stone-700 tracking-wider">
                      Diagnostic Laboratory History
                    </h4>

                    {!patientHistory?.lab_history || patientHistory.lab_history.length === 0 ? (
                      <div className="bg-stone-50 rounded-2xl p-6 text-center border border-dashed border-stone-300 text-xs text-stone-500">
                        No previous diagnostic lab orders found.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[550px] overflow-y-auto">
                        {patientHistory.lab_history.map((order: any) => (
                          <div
                            key={order.order_id}
                            className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2.5"
                          >
                            <div className="flex justify-between items-center border-b border-stone-200/60 pb-1.5">
                              <span className="font-mono font-bold text-xs text-teal-800">
                                {order.order_number} ({order.date})
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {order.tests.map((test: any, idx: number) => (
                                <div key={idx} className="bg-white p-2.5 rounded-xl border border-stone-200/60 text-xs">
                                  <strong className="text-[#15241B] block">{test.name}</strong>
                                  {test.result?.parameter_values && (
                                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                                      {test.result.parameter_values.map((pv: any, pIdx: number) => (
                                        <div key={pIdx} className="bg-stone-50 p-1.5 rounded text-[11px] flex justify-between">
                                          <span className="text-stone-600">{pv.parameter}:</span>
                                          <strong className="text-[#15241B]">
                                            {pv.value} {pv.unit}
                                          </strong>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-16 text-center text-stone-400 space-y-3">
                <Stethoscope className="w-12 h-12 mx-auto text-stone-300" />
                <h4 className="font-bold text-stone-800 text-base">No Patient Selected</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Select a patient from today's serial queue on the left to start examining, view previous prescriptions, and write digital Rx.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <ProtectedRoute roles={["DOCTOR", "PATHOLOGIST", "SUPER_ADMIN", "CENTER_ADMIN"]}>
      <DoctorPortalWorkspace />
    </ProtectedRoute>
  );
}
