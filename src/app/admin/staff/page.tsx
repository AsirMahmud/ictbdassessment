"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Edit3, KeyRound, Plus, ShieldCheck, UserCog, Users, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

const staffRoles = [
  ["CENTER_ADMIN", "Center Admin"],
  ["RECEPTIONIST", "Receptionist"],
  ["DOCTOR", "Doctor"],
  ["LAB_TECHNICIAN", "Lab Technician"],
  ["PATHOLOGIST", "Pathologist"],
  ["ACCOUNTANT", "Accountant"],
];

const emptyForm = { email: "", password: "", full_name: "", role: "RECEPTIONIST", phone: "", designation: "", branch_id: "", is_active: true };

export default function AdminStaffPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    const [staff, branchList] = await Promise.all([fetchApi<any[]>("/auth/users"), fetchApi<any[]>("/auth/branches")]);
    setUsers(staff);
    setBranches(branchList);
    if (!form.branch_id && branchList[0]) setForm((current) => ({ ...current, branch_id: branchList[0].id }));
  };

  useEffect(() => {
    loadData().catch(console.error);
    // Initial directory load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ ...emptyForm, branch_id: branches[0]?.id || "" });
    setShowModal(true);
  };

  const openEdit = (staff: any) => {
    setEditingUser(staff);
    setForm({ email: staff.email || "", password: "", full_name: staff.full_name || "", role: staff.role || "RECEPTIONIST", phone: staff.phone || "", designation: staff.designation || "", branch_id: staff.branch_id || "", is_active: staff.is_active });
    setShowModal(true);
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (editingUser && !payload.password) delete (payload as any).password;
      await fetchApi(editingUser ? `/auth/users/${editingUser.id}` : "/auth/users", { method: editingUser ? "PUT" : "POST", body: JSON.stringify(payload) });
      setShowModal(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || "Unable to save staff account");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (staff: any) => {
    try {
      await fetchApi(`/auth/users/${staff.id}`, { method: staff.is_active ? "DELETE" : "PUT", body: staff.is_active ? undefined : JSON.stringify({ is_active: true }) });
      await loadData();
    } catch (error: any) {
      alert(error.message || "Unable to update account status");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Staff & Access Management" subtitle="Create, update, and control clinical user accounts by branch" />
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><UserCog className="h-6 w-6" /></div><div><h2 className="text-base font-extrabold text-slate-900">Authorized staff accounts</h2><p className="text-xs text-slate-500">Edit roles, reset passwords, assign branches, or deactivate access.</p></div></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800"><Plus className="h-4 w-4" /> Add staff account</button></div>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="min-w-[780px]"><div className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_0.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500"><span>Staff member</span><span>Role</span><span>Branch / designation</span><span>Status</span><span>Actions</span></div><div className="divide-y divide-slate-100">{users.map((staff) => <div key={staff.id} className="grid grid-cols-[1.4fr_1fr_1.2fr_0.8fr_0.8fr] items-center gap-4 px-6 py-4 text-xs"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">{staff.full_name?.[0] || "U"}</div><div><p className="font-bold text-slate-900">{staff.full_name}</p><p className="text-[11px] text-slate-500">{staff.email}</p></div></div><span className="inline-flex w-fit items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800"><ShieldCheck className="h-3 w-3" />{staff.role}</span><div><p className="font-semibold text-slate-700">{branches.find((branch) => branch.id === staff.branch_id)?.name || "Unassigned branch"}</p><p className="text-[11px] text-slate-500">{staff.designation || "No designation"}</p></div><span className={staff.is_active ? "font-bold text-emerald-700" : "font-bold text-rose-600"}>{staff.is_active ? "Active" : "Disabled"}</span><div className="flex gap-1.5"><button onClick={() => openEdit(staff)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50" title="Edit account" aria-label={`Edit ${staff.full_name}`}><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => toggleUser(staff)} className={`rounded-lg border p-1.5 ${staff.is_active ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} title={staff.is_active ? "Deactivate account" : "Reactivate account"} aria-label={`${staff.is_active ? "Deactivate" : "Reactivate"} ${staff.full_name}`}>{staff.is_active ? "×" : "✓"}</button></div></div>)}</div></div></div>
        {users.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500"><Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />No staff accounts found.</div>}
      </div>

      {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4"><div><h3 className="text-lg font-black text-slate-900">{editingUser ? "Edit staff account" : "Create staff account"}</h3><p className="mt-1 text-xs text-slate-500">Accounts can sign in immediately after saving.</p></div><button onClick={() => setShowModal(false)} className="text-slate-400" aria-label="Close"><X className="h-4 w-4" /></button></div><form onSubmit={saveUser} className="space-y-3 text-xs"><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Full name<input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label><label className="font-bold text-slate-700">Designation<input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label></div><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label><label className="font-bold text-slate-700">{editingUser ? "New password (optional)" : "Temporary password"}<input required={!editingUser} minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label></div><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal">{staffRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="font-bold text-slate-700">Branch<select required value={form.branch_id} onChange={(event) => setForm({ ...form, branch_id: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label></div><label className="block font-bold text-slate-700">Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label>{editingUser && <label className="flex items-center gap-2 font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Account active</label>}<div className="flex justify-end gap-2 pt-3"><button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700">Cancel</button><button disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 font-bold text-white"><KeyRound className="h-3.5 w-3.5" />{loading ? "Saving..." : editingUser ? "Save changes" : "Create account"}</button></div></form></div></div>}
    </div>
  );
}
