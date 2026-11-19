"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  User,
  Phone,
  Mail,
  Lock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Stethoscope,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function CustomerSignUpPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "MALE",
    age: "",
    dob: "",
    blood_group: "",
    address: "",
    medical_history: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredPatient, setRegisteredPatient] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!form.phone.trim()) {
      setError("Please enter a valid phone number");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password || undefined,
        gender: form.gender,
        age: form.age ? parseInt(form.age, 10) : undefined,
        dob: form.dob || undefined,
        blood_group: form.blood_group || undefined,
        address: form.address.trim() || undefined,
        medical_history: form.medical_history.trim() || undefined,
      });

      setRegisteredPatient(res.patient);
    } catch (err: any) {
      setError(err.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBF9] text-[#15241B] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#008A5E] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Success Card */}
        {registeredPatient ? (
          <div className="max-w-xl mx-auto bg-white border border-[#DCEDE4] rounded-3xl p-8 sm:p-10 shadow-xl shadow-[#BFDCCB]/30 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#E8F8F0] text-[#008A5E] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full tracking-wider">
              Registration Successful
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15241B] mt-4 mb-2">
              Welcome, {registeredPatient.name}!
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Your patient profile has been created and registered in the hospital database.
            </p>

            <div className="bg-[#F8FBF9] border border-[#DCEDE4] rounded-2xl p-4 sm:p-5 mb-8 text-left space-y-2.5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Assigned UHID (Patient ID)</span>
                <span className="font-mono text-sm font-bold text-[#008A5E] bg-[#E8F8F0] px-2.5 py-0.5 rounded-lg">
                  {registeredPatient.uhid}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Registered Phone</span>
                <span className="text-xs font-semibold text-gray-800">{registeredPatient.phone}</span>
              </div>
              {registeredPatient.email && (
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs text-gray-500 font-medium">Email</span>
                  <span className="text-xs font-semibold text-gray-800">{registeredPatient.email}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">Gender & Age</span>
                <span className="text-xs font-semibold text-gray-800">
                  {registeredPatient.gender} {registeredPatient.age ? `• ${registeredPatient.age} yrs` : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/customer?phone=${encodeURIComponent(registeredPatient.phone)}`}
                className="flex-1 bg-[#008A5E] hover:bg-[#007550] text-white py-3 px-5 rounded-xl font-bold text-sm shadow-md shadow-[#008A5E]/20 transition flex items-center justify-center space-x-2"
              >
                <span>Open Customer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-5 rounded-xl font-semibold text-sm transition flex items-center justify-center"
              >
                Find & Book Doctors
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Benefits & Trust */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-[#E8F8F0] text-[#008A5E] px-3 py-1 rounded-full text-xs font-extrabold mb-3">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Patient Sign Up</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#15241B] tracking-tight leading-tight">
                  Your Health Journey, <br />
                  <span className="text-[#008A5E]">All In One Place</span>
                </h1>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  Join thousands of patients who book doctor chamber visits, track live OPD serial tokens, and view verified digital prescriptions and lab tests with MediBook.
                </p>
              </div>

              {/* Benefit Cards */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">Instant UHID Generation</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Receive an official hospital medical record ID linked across all departments and visits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008A5E] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">Live OPD Queue Tokens</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Never wait in crowded waiting rooms. See your exact serial queue position in real time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">Digital Prescriptions & Reports</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Instant 1-click PDF download for approved pathology findings and doctor consultation slips.
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Account Box */}
              <div className="bg-[#E8F8F0]/70 border border-[#DCEDE4] p-5 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-[#15241B] block">Already have an account?</span>
                <p className="text-gray-600">
                  If you have already booked or registered in person, your phone is already on file.
                </p>
                <div className="pt-1 flex items-center space-x-3">
                  <Link
                    href="/customer/login"
                    className="font-bold text-[#008A5E] hover:underline flex items-center space-x-1"
                  >
                    <span>Sign in to Customer Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-7 bg-white border border-[#DCEDE4] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#BFDCCB]/30">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-[#15241B]">Create Patient Account</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in your details below to register. Fields marked with * are required.
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Email Address (Optional)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="sarah@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Create Password (Optional)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender & Age & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Age (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Blood Group</label>
                    <select
                      value={form.blood_group}
                      onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                    >
                      <option value="">Select (Optional)</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Residential Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apartment 4B, 45 Central Avenue"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#CFE2D7] rounded-xl text-gray-900 focus:ring-2 focus:ring-[#008A5E]/30 focus:border-[#008A5E] focus:outline-none"
                  />
                </div>

                {/* Terms agreement note */}
                <p className="text-[11px] text-gray-500 pt-1">
                  By clicking Register, your patient profile will be created and linked with your telephone number for all future medical visits, prescriptions, and laboratory reports.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#008A5E] hover:bg-[#007550] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-[#008A5E]/20 transition flex items-center justify-center space-x-2 text-sm mt-2"
                >
                  {loading ? (
                    <span>Registering Patient...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Get UHID</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Secondary Footnotes */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
                <span>
                  Already registered?{" "}
                  <Link href="/customer/login" className="text-[#008A5E] font-bold hover:underline">
                    Sign In
                  </Link>
                </span>
                <Link href="/admin/login" className="text-gray-400 hover:text-gray-600 transition">
                  Hospital Staff / Doctor Login →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
