"use client";

import React, { useState } from "react";
import { Calendar, User, Phone, Mail, Clock, DollarSign, CheckCircle2, MapPin } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface BookingModalProps {
  doctor: any;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function BookingModal({ doctor, onClose, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    email: "",
    gender: "MALE",
    age: 35,
    appointment_date: new Date().toISOString().split("T")[0],
    time_slot: "05:30 PM",
    symptoms: "",
    payment_method: "CASH"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi<any>("/doctors/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          doctor_id: doctor.id,
          branch_id: doctor.branch_id,
          patient_name: form.patient_name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          age: Number(form.age),
          appointment_date: form.appointment_date,
          time_slot: form.time_slot,
          symptoms: form.symptoms,
          consultation_fee: doctor.consultation_fee,
          payment_method: form.payment_method
        })
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              Chamber OPD Appointment
            </span>
            <h3 className="font-extrabold text-lg text-slate-900 mt-1">Book Consultation</h3>
            <p className="text-xs text-teal-700 font-bold">
              {doctor.name} — {doctor.specialization} ({doctor.room_number})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Fee Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex justify-between items-center text-emerald-950">
            <div>
              <span className="font-bold block text-sm">Consultation Fee</span>
              <span className="text-[11px] text-emerald-700">Immediate Chamber Serial & Token generated</span>
            </div>
            <span className="text-2xl font-black text-[#008A5E]">৳ {doctor.consultation_fee?.toLocaleString()}</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Johnathan Doe"
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +1 (555) 0101"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Age *</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Visiting Date *</label>
              <input
                type="date"
                required
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Slot *</label>
              <select
                value={form.time_slot}
                onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="04:30 PM">04:30 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="06:30 PM">06:30 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="07:30 PM">07:30 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Consultation / Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g. Chronic chest tightness, shortness of breath, blood pressure check..."
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#008A5E] hover:bg-[#007550] text-white font-bold rounded-xl shadow-md transition"
            >
              {loading ? "Generating Token..." : "Confirm & Issue OPD Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
