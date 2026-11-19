"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Calendar, Clock, Edit3, MapPin, Plus, Stethoscope, Trash2, UserCheck, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

const emptyDoctor = {
  user_id: "",
  name: "",
  specialization: "",
  department: "General Medicine",
  qualifications: "MBBS, MD",
  experience_years: 10,
  consultation_fee: 50,
  room_number: "Chamber 208",
  available_days: "Mon, Wed, Fri",
  available_time: "05:00 PM - 09:00 PM",
  bio: "",
  branch_id: "",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyDoctor);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [doctorList, staff, branchList] = await Promise.all([
        fetchApi<any[]>("/doctors"),
        fetchApi<any[]>("/auth/users"),
        fetchApi<any[]>("/auth/branches"),
      ]);
      setDoctors(doctorList);
      setStaffUsers(staff.filter((user) => ["DOCTOR", "PATHOLOGIST"].includes(user.role)));
      setBranches(branchList);
      if (!form.branch_id && branchList[0]) setForm((current) => ({ ...current, branch_id: branchList[0].id }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
    // Initial admin directory load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingDoctor(null);
    setForm({ ...emptyDoctor, branch_id: branches[0]?.id || doctors[0]?.branch_id || "" });
    setShowModal(true);
  };

  const openEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setForm({
      user_id: doctor.user_id || "",
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      department: doctor.department || "General Medicine",
      qualifications: doctor.qualifications || "MBBS, MD",
      experience_years: doctor.experience_years || 0,
      consultation_fee: doctor.consultation_fee || 0,
      room_number: doctor.room_number || "",
      available_days: doctor.available_days || "",
      available_time: doctor.available_time || "",
      bio: doctor.bio || "",
      branch_id: doctor.branch_id || "",
    });
    setShowModal(true);
  };

  const saveDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await fetchApi(editingDoctor ? `/doctors/${editingDoctor.id}` : "/doctors", {
        method: editingDoctor ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setShowModal(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || "Unable to save doctor");
    } finally {
      setLoading(false);
    }
  };

  const deactivateDoctor = async (doctor: any) => {
    if (!window.confirm(`Deactivate ${doctor.name}? Existing appointments will remain available.`)) return;
    try {
      await fetchApi(`/doctors/${doctor.id}`, { method: "DELETE" });
      await loadData();
    } catch (error: any) {
      alert(error.message || "Unable to deactivate doctor");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Specialist Doctor Chambers & Schedules" subtitle="Create, update, deactivate, and link doctor profiles to staff accounts" />
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center gap-4"><div><h2 className="text-base font-extrabold text-slate-900">Registered Center Consultants</h2><p className="text-xs text-slate-500">{doctors.length} active specialist profiles</p></div><button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"><Plus className="w-4 h-4" /><span>Add Doctor Chamber</span></button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => <div key={doctor.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"><div className="flex justify-between items-start"><div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 overflow-hidden flex items-center justify-center"><img src={doctor.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"} alt={doctor.name} className="w-full h-full object-cover" /></div><span className="bg-teal-50 text-teal-800 text-xs font-black px-2.5 py-1 rounded-md border border-teal-200">${doctor.consultation_fee}</span></div><div><h3 className="font-extrabold text-slate-900 text-sm">{doctor.name}</h3><p className="text-xs font-bold text-teal-700">{doctor.specialization}</p><p className="text-[11px] text-slate-400">{doctor.qualifications}</p></div><div className="bg-slate-50 rounded-2xl p-2.5 text-[11px] space-y-1 border border-slate-100"><div className="flex items-center text-slate-800 font-bold"><MapPin className="w-3.5 h-3.5 text-teal-600 mr-1.5" />{doctor.room_number}</div><div className="flex items-center text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5" />{doctor.available_days}</div><div className="flex items-center text-slate-600"><Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />{doctor.available_time}</div></div><div className="flex items-center justify-between text-[11px] text-slate-500"><span>Max: <strong className="text-slate-800">{doctor.max_patients_per_day} tokens</strong></span><div className="flex gap-1.5"><button onClick={() => openEdit(doctor)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50" title="Edit doctor" aria-label={`Edit ${doctor.name}`}><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => deactivateDoctor(doctor)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100" title="Deactivate doctor" aria-label={`Deactivate ${doctor.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div></div></div>)}
        </div>
        {doctors.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500"><Stethoscope className="mx-auto mb-2 h-8 w-8 text-slate-300" />No active doctors found.</div>}
      </div>

      {showModal && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-start border-b border-slate-100 pb-3"><div><h3 className="font-extrabold text-base text-slate-900">{editingDoctor ? "Edit Doctor Chamber" : "Add Doctor Chamber"}</h3><p className="text-xs text-slate-500 mt-1">Keep chamber and login ownership in sync.</p></div><button onClick={() => setShowModal(false)} className="text-slate-400" aria-label="Close"><X className="h-4 w-4" /></button></div><form onSubmit={saveDoctor} className="space-y-3 text-xs">
        <label className="block font-bold text-slate-700">Doctor Name *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Specialization *<input required value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div>
        <label className="block font-bold text-slate-700">Linked login account<select value={form.user_id} onChange={(event) => setForm({ ...form, user_id: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"><option value="">No linked account</option>{staffUsers.map((staff) => <option key={staff.id} value={staff.id}>{staff.full_name} · {staff.role}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Qualifications<input value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Branch<select required value={form.branch_id} onChange={(event) => setForm({ ...form, branch_id: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label></div>
        <div className="grid grid-cols-3 gap-3"><label className="font-bold text-slate-700">Room<input required value={form.room_number} onChange={(event) => setForm({ ...form, room_number: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Fee<input type="number" min="0" required value={form.consultation_fee} onChange={(event) => setForm({ ...form, consultation_fee: Number(event.target.value) })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Experience<input type="number" min="0" required value={form.experience_years} onChange={(event) => setForm({ ...form, experience_years: Number(event.target.value) })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Visiting Days<input value={form.available_days} onChange={(event) => setForm({ ...form, available_days: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Visiting Hours<input value={form.available_time} onChange={(event) => setForm({ ...form, available_time: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div>
        <label className="block font-bold text-slate-700">Profile notes<textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><div className="pt-2 flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">Cancel</button><button type="submit" disabled={loading} className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow">{loading ? "Saving..." : editingDoctor ? "Save Changes" : "Save Chamber"}</button></div>
      </form></div></div>}
    </div>
  );
}
