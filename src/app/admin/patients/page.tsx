"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { CalendarDays, Pencil, Plus, Search, Trash2, UserRoundCheck, Users, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Patient = {
  id: string;
  uhid: string;
  name: string;
  phone: string;
  gender: string;
  age?: number;
  email?: string;
  blood_group?: string;
  address?: string;
  medical_history?: string;
  created_at: string;
};

const emptyPatient = {
  name: "",
  phone: "",
  gender: "MALE",
  age: 30,
  email: "",
  blood_group: "O+",
  address: "Metropolis City",
  medical_history: "",
};

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminPatientsPage() {
  const { user } = useAuth();
  const canManagePatients = ["SUPER_ADMIN", "CENTER_ADMIN", "RECEPTIONIST"].includes(user?.role || "");
  const canDeletePatients = ["SUPER_ADMIN", "CENTER_ADMIN"].includes(user?.role || "");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [assignmentPatient, setAssignmentPatient] = useState<Patient | null>(null);
  const [assignedAppointments, setAssignedAppointments] = useState<any[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyPatient);
  const [assignmentForm, setAssignmentForm] = useState({ doctor_id: "", appointment_date: today(), time_slot: "05:00 PM", symptoms: "" });
  const [loading, setLoading] = useState(false);

  const loadPatients = async () => {
    try {
      const data = await fetchApi<Patient[]>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDoctors = async () => {
    try {
      setDoctors(await fetchApi<any[]>("/doctors"));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPatients();
    loadDoctors();
    // Search is intentionally the only dependency for the registry query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingPatient(null);
    setForm(emptyPatient);
    setShowPatientModal(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      age: patient.age || 0,
      email: patient.email || "",
      blood_group: patient.blood_group || "",
      address: patient.address || "",
      medical_history: patient.medical_history || "",
    });
    setShowPatientModal(true);
  };

  const savePatient = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await fetchApi(editingPatient ? `/patients/${editingPatient.id}` : "/patients", {
        method: editingPatient ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setShowPatientModal(false);
      await loadPatients();
    } catch (error: any) {
      alert(error.message || "Unable to save patient");
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patient: Patient) => {
    if (!window.confirm(`Delete ${patient.name}? Patients with diagnostic orders cannot be deleted.`)) return;
    try {
      await fetchApi(`/patients/${patient.id}`, { method: "DELETE" });
      await loadPatients();
    } catch (error: any) {
      alert(error.message || "Unable to delete patient");
    }
  };

  const openAssignment = async (patient: Patient) => {
    setAssignmentPatient(patient);
    setAssignmentForm({ doctor_id: doctors[0]?.id || "", appointment_date: today(), time_slot: "05:00 PM", symptoms: "" });
    try {
      setAssignedAppointments(await fetchApi<any[]>(`/doctors/appointments/list?patient_id=${encodeURIComponent(patient.id)}`));
    } catch (error) {
      console.error(error);
      setAssignedAppointments([]);
    }
  };

  const assignDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignmentPatient) return;
    setLoading(true);
    try {
      const doctor = doctors.find((item) => item.id === assignmentForm.doctor_id);
      await fetchApi("/doctors/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          doctor_id: assignmentForm.doctor_id,
          branch_id: doctor?.branch_id,
          patient_name: assignmentPatient.name,
          phone: assignmentPatient.phone,
          email: assignmentPatient.email || undefined,
          gender: assignmentPatient.gender,
          age: assignmentPatient.age || 0,
          appointment_date: assignmentForm.appointment_date,
          time_slot: assignmentForm.time_slot,
          symptoms: assignmentForm.symptoms || undefined,
          payment_method: "PENDING",
        }),
      });
      await openAssignment(assignmentPatient);
    } catch (error: any) {
      alert(error.message || "Unable to assign doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Patient Medical Records & Registry" subtitle="Create, update, assign, and manage permanent patient records" />
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
            <input type="search" placeholder="Search by UHID, phone, or name..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" aria-label="Search patients" />
          </div>
          {canManagePatients && <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"><Plus className="w-4 h-4" aria-hidden="true" /><span>Register Patient</span></button>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase"><tr><th className="p-4">UHID</th><th className="p-4">Patient</th><th className="p-4">Age / Gender</th><th className="p-4">Phone</th><th className="p-4">Blood Group</th><th className="p-4">Medical History</th><th className="p-4">Registered</th><th className="p-4">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => <tr key={patient.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono font-bold text-teal-800">{patient.uhid}</td>
                <td className="p-4"><p className="font-bold text-slate-900">{patient.name}</p><p className="text-[11px] text-slate-500">{patient.email || "No email"}</p></td>
                <td className="p-4 text-slate-600">{patient.age} Y / {patient.gender}</td><td className="p-4 text-slate-700 font-semibold">{patient.phone}</td><td className="p-4 font-bold text-rose-700">{patient.blood_group || "N/A"}</td><td className="p-4 text-slate-500 truncate max-w-xs">{patient.medical_history || "None recorded"}</td><td className="p-4 text-slate-400">{new Date(patient.created_at).toLocaleDateString()}</td>
                <td className="p-4"><div className="flex items-center gap-1.5">
                  {canManagePatients && <button onClick={() => openAssignment(patient)} className="rounded-lg border border-teal-200 bg-teal-50 p-1.5 text-teal-700 hover:bg-teal-100" title="Assign doctor" aria-label={`Assign doctor to ${patient.name}`}><UserRoundCheck className="h-3.5 w-3.5" /></button>}
                  {canManagePatients && <button onClick={() => openEdit(patient)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50" title="Edit patient" aria-label={`Edit ${patient.name}`}><Pencil className="h-3.5 w-3.5" /></button>}
                  {canDeletePatients && <button onClick={() => deletePatient(patient)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100" title="Delete patient" aria-label={`Delete ${patient.name}`}><Trash2 className="h-3.5 w-3.5" /></button>}
                </div></td>
              </tr>)}
            </tbody>
          </table>
          {patients.length === 0 && <div className="p-12 text-center text-sm text-slate-500"><Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />No patients found.</div>}
        </div>
      </div>

      {showPatientModal && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3"><div><h3 className="font-extrabold text-base text-slate-900">{editingPatient ? "Edit Patient Record" : "Register New Patient"}</h3><p className="text-xs text-slate-500 mt-1">{editingPatient ? editingPatient.uhid : "A UHID will be generated automatically"}</p></div><button onClick={() => setShowPatientModal(false)} className="text-slate-400" aria-label="Close"><X className="h-4 w-4" /></button></div>
        <form onSubmit={savePatient} className="space-y-3 text-xs">
          <label className="block font-bold text-slate-700">Full Name *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Phone *<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div>
          <div className="grid grid-cols-3 gap-3"><label className="font-bold text-slate-700">Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label><label className="font-bold text-slate-700">Age<input type="number" min="0" required value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Blood Group<input value={form.blood_group} onChange={(event) => setForm({ ...form, blood_group: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div>
          <label className="block font-bold text-slate-700">Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="block font-bold text-slate-700">Medical History<textarea rows={3} value={form.medical_history} onChange={(event) => setForm({ ...form, medical_history: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label>
          <div className="pt-2 flex justify-end gap-2"><button type="button" onClick={() => setShowPatientModal(false)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">Cancel</button><button type="submit" disabled={loading} className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow">{loading ? "Saving..." : editingPatient ? "Save Changes" : "Save & Generate UHID"}</button></div>
        </form>
      </div></div>}

      {assignmentPatient && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3"><div><p className="text-[10px] uppercase tracking-wider font-black text-teal-700">Doctor assignment</p><h3 className="font-extrabold text-lg text-slate-900">{assignmentPatient.name}</h3><p className="text-xs text-slate-500">{assignmentPatient.uhid} · {assignmentPatient.phone}</p></div><button onClick={() => setAssignmentPatient(null)} className="text-slate-400" aria-label="Close"><X className="h-4 w-4" /></button></div>
        <form onSubmit={assignDoctor} className="space-y-3 text-xs"><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Doctor<select required value={assignmentForm.doctor_id} onChange={(event) => setAssignmentForm({ ...assignmentForm, doctor_id: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal"><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.specialization}</option>)}</select></label><label className="font-bold text-slate-700">Date<input required type="date" value={assignmentForm.appointment_date} onChange={(event) => setAssignmentForm({ ...assignmentForm, appointment_date: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Time slot<input required value={assignmentForm.time_slot} onChange={(event) => setAssignmentForm({ ...assignmentForm, time_slot: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label><label className="font-bold text-slate-700">Reason / symptoms<input value={assignmentForm.symptoms} onChange={(event) => setAssignmentForm({ ...assignmentForm, symptoms: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl font-normal" /></label></div><div className="flex justify-end"><button type="submit" disabled={loading || !doctors.length} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 font-bold text-white">{loading ? "Assigning..." : "Assign Doctor & Create Token"}</button></div></form>
        <div><h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600"><CalendarDays className="h-3.5 w-3.5 text-teal-700" />Existing assignments</h4>{assignedAppointments.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">No doctor assignments yet.</p> : <div className="space-y-2">{assignedAppointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs"><div><p className="font-bold text-slate-900">{appointment.doctor_name}</p><p className="text-slate-500">{appointment.appointment_date} · {appointment.time_slot} · Token #{appointment.token_number}</p></div><span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">{appointment.status}</span></div>)}</div>}</div>
      </div></div>}
    </div>
  );
}
