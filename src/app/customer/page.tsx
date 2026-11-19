"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import BookingModal from "@/components/public/BookingModal";
import {
  User,
  Phone,
  Stethoscope,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Receipt,
  Search,
  ArrowLeft,
  Printer,
  Activity,
  Microscope,
  Pill,
  Sparkles,
  Ticket,
  ChevronRight,
  Plus
} from "lucide-react";
import { apiUrl, fetchApi } from "@/lib/api";

function CustomerPortalContent() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";

  const [phoneQuery, setPhoneQuery] = useState(initialPhone);
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"appointments" | "prescriptions" | "reports" | "book">("appointments");
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [selectedPrescriptionSlip, setSelectedPrescriptionSlip] = useState<any>(null);
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);

  const searchPatient = async (phoneToSearch?: string) => {
    const target = phoneToSearch || phoneQuery;
    if (!target.trim()) return;
    setLoading(true);
    try {
      // 1. Fetch patient
      const p = await fetchApi<any>(`/patients/by-phone/${encodeURIComponent(target.trim())}`);
      setPatient(p);

      // 2. Fetch appointments
      const appts = await fetchApi<any[]>(`/doctors/appointments/list?phone=${encodeURIComponent(target.trim())}`);
      setAppointments(appts);

      // 3. Fetch full prescriptions and diagnostic history
      const rxData = await fetchApi<any>(`/doctors/patient-prescriptions/${encodeURIComponent(target.trim())}`);
      setPrescriptions(rxData.prescriptions || []);

      // 4. Fetch diagnostic orders if patient exists
      if (p?.id) {
        const ords = await fetchApi<any[]>(`/orders?phone=${encodeURIComponent(p.phone)}`);
        setOrders(ords);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Error loading patient data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load doctors list for booking tab
    fetchApi<any[]>("/doctors")
      .then(setDoctors)
      .catch(console.error);

    if (initialPhone) searchPatient(initialPhone);
    // This hydrates the page from the URL once; user-driven searches are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="portal-theme min-h-screen bg-[#F8FBF9] flex flex-col font-sans text-[#486057] antialiased selection:bg-[#008A5E]/20 selection:text-[#008A5E]">
      <Navbar onBookClick={() => setActiveTab("book")} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Banner */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full tracking-wide">
                Patient Self-Service Portal
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Database Synced</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15241B] mt-1.5 tracking-tight">
              Customer Medical & Chamber Desk
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Track your chamber serial/token, view digital prescriptions, and check approved laboratory reports.
            </p>
          </div>

          {/* Phone Lookup & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter registered phone number"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                className="pl-8 pr-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#1B3B2B] focus:outline-none w-full sm:w-56"
              />
            </div>
            <button
              onClick={() => searchPatient()}
              disabled={loading}
              className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition shrink-0"
            >
              {loading ? "Searching..." : "Lookup"}
            </button>
            <Link
              href="/customer/signup"
              className="bg-[#008A5E] hover:bg-[#007550] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition shrink-0 flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Patient Sign Up</span>
            </Link>
          </div>
        </div>

        {/* Verified Patient Profile Header */}
        {patient ? (
          <div className="bg-gradient-to-r from-[#1B3B2B] to-[#2B4B3B] text-white p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase text-emerald-300 font-extrabold tracking-wider">
                Verified Patient Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">{patient.name}</h2>
              <p className="text-xs text-stone-200">
                UHID: <strong className="text-white font-mono bg-black/20 px-2 py-0.5 rounded">{patient.uhid}</strong> • Phone: {patient.phone} • Age: {patient.age || "N/A"} Y ({patient.gender}) • Blood Group: {patient.blood_group || "Not recorded"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab("book")}
                className="bg-emerald-400 hover:bg-emerald-300 text-[#15241B] px-4 py-2 rounded-full text-xs font-extrabold shadow-sm flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Another Doctor</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div>
              <strong>No saved registry profile for phone: {phoneQuery || "Not specified"}</strong>
              <p className="text-stone-600 mt-0.5">
                Appointments booked online are still shown below. You can also create an official patient profile and receive a permanent UHID.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Link
                href="/customer/signup"
                className="bg-[#008A5E] hover:bg-[#007550] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition"
              >
                Sign Up as New Patient
              </Link>
              <button
                onClick={() => setActiveTab("book")}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition"
              >
                Book Consultation
              </button>
            </div>
          </div>
        )}

        {/* Portal Tabs Navigation */}
        <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === "appointments"
                ? "border-[#1B3B2B] text-[#1B3B2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Chamber Serials & Appointments</span>
            <span className="bg-stone-200 text-stone-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === "prescriptions"
                ? "border-[#1B3B2B] text-[#1B3B2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Doctor Prescriptions</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {prescriptions.filter((p) => p.prescription_notes || p.status === "COMPLETED").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === "reports"
                ? "border-[#1B3B2B] text-[#1B3B2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Microscope className="w-4 h-4" />
            <span>Laboratory Test Reports</span>
            <span className="bg-stone-200 text-stone-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("book")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === "book"
                ? "border-[#1B3B2B] text-[#1B3B2B]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Book Doctor Consultation</span>
          </button>
        </div>

        {/* TAB 1: CHAMBER APPOINTMENTS & SERIAL NUMBERS */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-[#15241B]">
                  Your Chamber Appointments & Token Serials
                </h3>
                <p className="text-xs text-stone-500">
                  Present your token serial number at the doctor's chamber on your appointment date.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("book")}
                className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Ticket className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-800 text-base">No Chamber Appointments Found</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  You do not have any registered chamber appointments for phone number <strong>{phoneQuery}</strong>.
                </p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="bg-[#1B3B2B] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs"
                >
                  Book a Specialist Doctor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Big Serial Token Callout */}
                      <div className="flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-[#1B3B2B] text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0">
                          <span className="text-[9px] uppercase font-bold text-emerald-300 tracking-wider">
                            SERIAL
                          </span>
                          <span className="text-2xl font-black leading-none">
                            #{appt.token_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 font-bold">
                            {appt.appointment_number}
                          </span>
                          <h4 className="text-base font-bold text-[#15241B]">{appt.doctor_name}</h4>
                          <p className="text-xs text-stone-500 font-medium">
                            {appt.doctor_specialization} • {appt.doctor_room}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          appt.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : appt.status === "IN_CONSULTATION"
                            ? "bg-purple-100 text-purple-800 animate-pulse"
                            : appt.status === "WAITING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {appt.status === "IN_CONSULTATION"
                          ? "In Chamber Now"
                          : appt.status === "WAITING"
                          ? "Waiting in Queue"
                          : appt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block uppercase">Appointment Date</span>
                        <span className="font-bold text-stone-800">{appt.appointment_date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block uppercase">Time Slot</span>
                        <span className="font-bold text-stone-800">{appt.time_slot}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block uppercase">Consultation Fee</span>
                        <span className="font-bold text-emerald-800">${appt.consultation_fee} ({appt.payment_status})</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block uppercase">Patient Name</span>
                        <span className="font-bold text-stone-800 truncate block">{appt.patient_name}</span>
                      </div>
                    </div>

                    {appt.symptoms && (
                      <p className="text-xs text-stone-600 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl italic">
                        "Symptoms: {appt.symptoms}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-[11px] text-stone-400">
                        Chamber OPD Token • Metropolis
                      </span>
                      <div className="flex items-center space-x-2">
                        {appt.prescription_notes && (
                          <button
                            onClick={() => {
                              setSelectedPrescriptionSlip(appt);
                              setActiveTab("prescriptions");
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Pill className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Rx</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSlip(appt)}
                          className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition flex items-center space-x-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>Serial Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCTOR PRESCRIPTIONS */}
        {activeTab === "prescriptions" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#15241B]">
                Your Digital Prescriptions & Doctor Advice
              </h3>
              <p className="text-xs text-stone-500">
                Official prescriptions written by specialist physicians during your chamber consultations.
              </p>
            </div>

            {prescriptions.filter((p) => p.prescription_notes || p.status === "COMPLETED").length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Pill className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-800 text-base">No Prescriptions Issued Yet</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Once your specialist doctor completes your consultation, your digital prescription, medication dosage instructions, and advised tests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {prescriptions
                  .filter((p) => p.prescription_notes || p.status === "COMPLETED")
                  .map((rx) => (
                    <div
                      key={rx.appointment_id}
                      className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6"
                    >
                      {/* Prescription Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-200 gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase bg-[#1B3B2B] text-white px-2 py-0.5 rounded">
                              OFFICIAL DIGITAL PRESCRIPTION
                            </span>
                            <span className="text-xs font-mono text-stone-500 font-bold">
                              {rx.appointment_number}
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-[#15241B] mt-1">
                            {rx.doctor?.name || "Consultant Physician"}
                          </h4>
                          <p className="text-xs text-stone-600 font-medium">
                            {rx.doctor?.specialization} • {rx.doctor?.qualifications} • {rx.doctor?.room_number}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-stone-500 block uppercase">Consultation Date</span>
                          <span className="text-sm font-extrabold text-[#15241B]">{rx.appointment_date} ({rx.time_slot})</span>
                          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                            Token #{rx.token_number}
                          </span>
                        </div>
                      </div>

                      {/* Patient & Vitals Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                        <div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Patient Details</span>
                          <p className="text-xs text-stone-900 font-bold">
                            {rx.patient?.name} ({rx.patient?.gender}, {rx.patient?.age} Y)
                          </p>
                          <p className="text-[11px] text-stone-600">
                            UHID: {rx.patient?.uhid} • Phone: {rx.patient?.phone}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                            Recorded Clinical Vitals
                          </span>
                          <p className="text-xs font-mono font-bold text-[#1B3B2B]">
                            {rx.clinical_vitals || "Vitals measured in chamber"}
                          </p>
                        </div>
                      </div>

                      {/* Chief Symptoms */}
                      {rx.symptoms && (
                        <div>
                          <span className="text-xs font-bold text-stone-600 uppercase block mb-1">
                            Chief Complaints / Symptoms:
                          </span>
                          <p className="text-xs text-stone-800 bg-amber-50/50 p-3 rounded-xl border border-amber-200/40">
                            {rx.symptoms}
                          </p>
                        </div>
                      )}

                      {/* Medication Rx Box */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-serif font-black text-[#1B3B2B] italic">Rx</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                            Prescribed Medications & Instructions
                          </span>
                        </div>
                        <div className="bg-[#FAF9F5] border-2 border-stone-200 p-5 rounded-2xl font-sans text-xs text-stone-900 whitespace-pre-wrap leading-relaxed shadow-2xs">
                          {rx.prescription_notes || "No prescription notes recorded."}
                        </div>
                      </div>

                      {/* Advised Tests */}
                      {rx.recommended_tests && rx.recommended_tests.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                            <Microscope className="w-3.5 h-3.5 text-teal-700" />
                            <span>Advised Diagnostic Investigations:</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rx.recommended_tests.map((test: any) => (
                              <div
                                key={test.id}
                                className="bg-teal-50/60 border border-teal-200 p-3 rounded-xl flex justify-between items-center text-xs"
                              >
                                <div>
                                  <strong className="text-teal-950 block">{test.name}</strong>
                                  <span className="text-[10px] text-teal-700 font-mono">Sample: {test.sample_type || "Blood"}</span>
                                </div>
                                <span className="font-extrabold text-teal-900">${test.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Print Prescription Button */}
                      <div className="flex justify-end pt-2 border-t border-stone-100">
                        <button
                          onClick={() => window.print()}
                          className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Prescription</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIAGNOSTIC LAB REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#15241B]">
                Your Laboratory Test Reports & Orders
              </h3>
              <p className="text-xs text-stone-500">
                NABL Accredited Laboratory reports with digital pathologist verification code.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-800 text-base">No Diagnostic Orders Found</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Any diagnostic orders prescribed by your doctor or ordered walk-in will be listed here with downloadable PDF reports.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {ord.order_number}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#15241B]">
                        Diagnostic Panel ({ord.items ? ord.items.map((i: any) => i.name).join(", ") : "Tests"})
                      </h4>
                      <p className="text-xs text-stone-500">
                        Referring Doctor: <strong>{ord.referring_doctor}</strong> • Date: {ord.created_at ? ord.created_at.split("T")[0] : "Today"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                      {ord.report ? (
                        <a
                          href={apiUrl(`/reports/${ord.report.id}/download?phone=${encodeURIComponent(patient?.phone || phoneQuery)}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Verified PDF Report</span>
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl">
                          Processing in Laboratory
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BOOK DOCTOR CONSULTATION */}
        {activeTab === "book" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#15241B]">
                Book Consultation with Metropolis Specialists
              </h3>
              <p className="text-xs text-stone-500">
                Select a doctor to generate your sequential chamber token number and schedule your appointment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start space-x-3.5">
                    {doc.avatar_url ? (
                      <img
                        src={doc.avatar_url}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-stone-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0 text-lg">
                        {doc.name[4] || "D"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-[#15241B]">{doc.name}</h4>
                      <p className="text-xs text-teal-800 font-bold">{doc.specialization}</p>
                      <p className="text-[11px] text-stone-500">{doc.qualifications}</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Chamber:</span>
                      <strong className="text-stone-900">{doc.room_number}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Available:</span>
                      <strong className="text-stone-900">{doc.available_days}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Time:</span>
                      <strong className="text-stone-900">{doc.available_time}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block">CONSULTATION FEE</span>
                      <span className="text-base font-black text-[#1B3B2B]">${doc.consultation_fee}</span>
                    </div>
                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="bg-[#1B3B2B] hover:bg-[#132A1F] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs transition flex items-center space-x-1"
                    >
                      <span>Book Token</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* POPUP: PRINTABLE CONSULTATION SERIAL PASS / SLIP */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  OPD Chamber Token Slip
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">Metropolis Health City</h3>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-1">
              <span className="text-xs uppercase tracking-widest font-bold text-stone-500">
                CHAMBER SERIAL NUMBER
              </span>
              <div className="text-5xl font-black text-[#1B3B2B]">
                #{selectedSlip.token_number}
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 block">
                {selectedSlip.appointment_number}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-stone-100 py-1">
                <span className="text-stone-500">Patient:</span>
                <strong className="text-stone-900">{selectedSlip.patient_name}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-1">
                <span className="text-stone-500">Doctor:</span>
                <strong className="text-stone-900">{selectedSlip.doctor_name}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-1">
                <span className="text-stone-500">Chamber Room:</span>
                <strong className="text-teal-900">{selectedSlip.doctor_room}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-1">
                <span className="text-stone-500">Date & Slot:</span>
                <strong className="text-stone-900">{selectedSlip.appointment_date} at {selectedSlip.time_slot}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-1">
                <span className="text-stone-500">Payment:</span>
                <strong className="text-emerald-700">${selectedSlip.consultation_fee} (PAID)</strong>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              Please arrive 15 minutes before your time slot. Doctor will call patients sequentially based on <strong>Serial #{selectedSlip.token_number}</strong>.
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-[#1B3B2B] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOKING DIALOG */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={(res) => {
            setSelectedSlip(res);
            searchPatient(res.phone);
            setActiveTab("appointments");
          }}
        />
      )}
    </div>
  );
}

export default function CustomerPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F5]" />}>
      <CustomerPortalContent />
    </Suspense>
  );
}
