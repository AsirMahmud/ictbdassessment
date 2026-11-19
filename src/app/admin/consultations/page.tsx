"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Stethoscope,
  Activity,
  ClipboardList,
  Microscope,
  CheckCircle2,
  User,
  ArrowRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminConsultationsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previousRxList, setPreviousRxList] = useState<any[]>([]);
  const [showPrevRxModal, setShowPrevRxModal] = useState(false);

  const [vitalsForm, setVitalsForm] = useState({
    bp: "120/80",
    pulse: "72",
    weight: "70",
    sugar: "110",
    spo2: "98%"
  });
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [recommendedTestIds, setRecommendedTestIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [docs, appts, testList] = await Promise.all([
        fetchApi<any[]>("/doctors"),
        fetchApi<any[]>("/doctors/appointments/list"),
        fetchApi<any[]>("/catalog/tests"),
      ]);
      setDoctors(docs);
      setAppointments(appts);
      setTests(testList);
      if (docs.length > 0 && !activeDoctorId) {
        setActiveDoctorId(docs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    // The initial load intentionally runs once; subsequent updates are triggered by explicit actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartConsultation = async (appt: any) => {
    setActiveConsultation(appt);
    setPrescriptionNotes(appt.prescription_notes || "");
    setRecommendedTestIds([]);
    try {
      await fetchApi(`/doctors/appointments/${appt.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "IN_CONSULTATION" })
      });
      // Fetch patient's previous prescriptions
      const rxRes = await fetchApi<any>(`/doctors/patient-prescriptions/${encodeURIComponent(appt.phone)}`);
      setPreviousRxList(rxRes?.prescriptions?.filter((p: any) => p.prescription_notes || p.status === "COMPLETED") || []);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishAndPrescribe = async () => {
    if (!activeConsultation) return;
    setLoading(true);
    try {
      const vitalsText = `BP: ${vitalsForm.bp} mmHg, Pulse: ${vitalsForm.pulse} bpm, Wt: ${vitalsForm.weight} kg, Sugar: ${vitalsForm.sugar} mg/dL, SpO2: ${vitalsForm.spo2}`;

      // Update appointment
      await fetchApi(`/doctors/appointments/${activeConsultation.id}`, {
        method: "PUT",
        body: JSON.stringify({
          clinical_vitals: vitalsText,
          prescription_notes: prescriptionNotes,
          recommended_tests: recommendedTestIds
        })
      });

      // Convert recommended tests to Diagnostic Order
      const res = await fetchApi<any>(`/doctors/appointments/${activeConsultation.id}/convert-to-lab-order`, {
        method: "POST"
      });

      alert(`Consultation completed! Automatically generated Diagnostic Order ${res.order_number}`);
      setActiveConsultation(null);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const doctorQueue = appointments.filter((a) => a.doctor_id === activeDoctorId);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Doctor Chamber Consultation Cockpit"
        subtitle="Examine patient, record vitals, write digital prescription, and 1-click order laboratory tests"
      />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Doctor Chamber Selector */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-800">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Active Consultation Chamber</h2>
              <p className="text-xs text-slate-500">Select which specialist chamber is examining patients</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Consultant:</span>
            <select
              value={activeDoctorId}
              onChange={(e) => {
                setActiveDoctorId(e.target.value);
                setActiveConsultation(null);
              }}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({d.room_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Screen: Left (Queue) and Right (Consultation Desk) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: CHAMBER QUEUE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-900">Chamber Patient Queue</h3>
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold">
                {doctorQueue.length} Patients
              </span>
            </div>

            <div className="space-y-3">
              {doctorQueue.map((appt) => (
                <div
                  key={appt.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    activeConsultation?.id === appt.id
                      ? "bg-teal-50 border-teal-400 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="bg-teal-800 text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                      TOKEN #{appt.token_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : appt.status === "IN_CONSULTATION"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{appt.patient_name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {appt.gender}, {appt.age} Y | Ph: {appt.phone}
                  </p>
                  {appt.symptoms && (
                    <p className="text-xs text-slate-600 italic mt-1 line-clamp-1">
                      "{appt.symptoms}"
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                    {appt.status !== "COMPLETED" ? (
                      <button
                        onClick={() => handleStartConsultation(appt)}
                        className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                      >
                        Call to Chamber →
                      </button>
                    ) : (
                      <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Consulted</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ACTIVE CONSULTATION DESK */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {activeConsultation ? (
              <div className="space-y-6">
                {/* Active Patient Banner */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-800">In Chamber Examination</span>
                    <h3 className="text-xl font-black text-slate-900">{activeConsultation.patient_name}</h3>
                    <p className="text-xs text-slate-600">
                      Token #{activeConsultation.token_number} | Age: {activeConsultation.age}Y | Gender: {activeConsultation.gender} | Phone: {activeConsultation.phone}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPrevRxModal(true)}
                      className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Previous Prescriptions ({previousRxList.length})</span>
                    </button>
                    <span className="bg-amber-400 text-slate-900 font-black text-xs px-3 py-1 rounded-lg uppercase">
                      In Consultation
                    </span>
                  </div>
                </div>

                {/* Vitals Recording */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Clinical Vitals Measurement</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">BP (mmHg)</label>
                      <input
                        type="text"
                        value={vitalsForm.bp}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Pulse (bpm)</label>
                      <input
                        type="text"
                        value={vitalsForm.pulse}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                      <input
                        type="text"
                        value={vitalsForm.weight}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Blood Sugar</label>
                      <input
                        type="text"
                        value={vitalsForm.sugar}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, sugar: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">SpO2</label>
                      <input
                        type="text"
                        value={vitalsForm.spo2}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Digital Prescription Notes */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    <span>Prescription Medications & Dietary Advice</span>
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="e.g. Tab. Rosuvastatin 10mg OD HS x 30 days. Tab. Telmisartan 40mg Morning. Advised low salt diet, 30 min brisk walk..."
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* 1-Click Recommended Diagnostic Tests */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Microscope className="w-4 h-4 text-teal-600" />
                      <span>Recommend In-House Diagnostic Tests (1-Click Order)</span>
                    </h4>
                    <span className="text-[11px] text-teal-700 font-bold">
                      {recommendedTestIds.length} tests selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
                    {tests.map((t) => (
                      <label key={t.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-white transition">
                        <input
                          type="checkbox"
                          checked={recommendedTestIds.includes(t.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecommendedTestIds([...recommendedTestIds, t.id]);
                            } else {
                              setRecommendedTestIds(recommendedTestIds.filter((id) => id !== t.id));
                            }
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="truncate font-semibold">{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={() => setActiveConsultation(null)}
                    className="text-slate-500 hover:text-slate-700 text-xs font-bold"
                  >
                    Cancel Consultation
                  </button>

                  <button
                    onClick={handleFinishAndPrescribe}
                    disabled={loading}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md flex items-center space-x-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation & Auto-Issue Lab Order</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <User className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No Patient Currently in Chamber</p>
                <p className="text-xs text-slate-400">
                  Select a patient token from the chamber queue on the left to start examination.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: View Previous Prescriptions */}
      {showPrevRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Patient Prescription History
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {activeConsultation?.patient_name} ({activeConsultation?.phone})
                </h3>
              </div>
              <button
                onClick={() => setShowPrevRxModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {previousRxList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No previous prescriptions on file for this patient.
              </div>
            ) : (
              <div className="space-y-4">
                {previousRxList.map((rx: any) => (
                  <div
                    key={rx.appointment_id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                      <div>
                        <strong className="text-slate-900">{rx.doctor?.name}</strong>
                        <span className="text-slate-500 text-[11px] block">{rx.doctor?.specialization}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-teal-800">
                          {rx.appointment_date}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPrescriptionNotes((prev) =>
                              prev ? `${prev}\n\n[Previous Rx]:\n${rx.prescription_notes}` : rx.prescription_notes
                            );
                            setShowPrevRxModal(false);
                          }}
                          className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded text-[10px] font-bold"
                        >
                          Copy to Notes
                        </button>
                      </div>
                    </div>

                    {rx.clinical_vitals && (
                      <p className="text-[11px] font-mono text-teal-900 bg-white p-2 rounded-lg border border-slate-200">
                        <strong>Vitals: </strong>{rx.clinical_vitals}
                      </p>
                    )}

                    {rx.prescription_notes && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Medications:</span>
                        <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
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
                type="button"
                onClick={() => setShowPrevRxModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
