"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import HealthcareHeroVisual from "@/components/public/HealthcareHeroVisual";
import BookingModal from "@/components/public/BookingModal";
import {
  Search,
  LayoutGrid,
  MapPin,
  Calendar,
  ShieldCheck,
  Video,
  HeartPulse,
  Activity,
  Baby,
  Stethoscope,
  Ear,
  Eye,
  Sparkles,
  Zap,
  Lock,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Printer,
  Smartphone,
  Check
} from "lucide-react";
import { fetchApi } from "@/lib/api";

// Top Specialties definition matching reference design
const SPECIALTIES = [
  {
    id: "cardiology",
    name: "Cardiology",
    filterKey: "Cardio",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5v4l2 2" strokeOpacity="0.4" />
      </svg>
    )
  },
  {
    id: "dermatology",
    name: "Dermatology",
    filterKey: "Derma",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeOpacity="0.4" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    filterKey: "Ortho",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M8 11v6a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-6" />
        <circle cx="12" cy="18" r="2" fill="currentColor" fillOpacity="0.2" />
      </svg>
    )
  },
  {
    id: "gynecology",
    name: "Gynecology",
    filterKey: "Gyne",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="6" />
        <path d="M12 15v7M9 19h6" />
      </svg>
    )
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    filterKey: "Pediatric",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 10h.01M15 10h.01" strokeWidth="3" />
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      </svg>
    )
  },
  {
    id: "medicine",
    name: "Medicine",
    filterKey: "Medicine",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    )
  },
  {
    id: "ent",
    name: "ENT",
    filterKey: "ENT",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
        <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0" />
      </svg>
    )
  },
  {
    id: "eyecare",
    name: "Eye Care",
    filterKey: "Eye",
    icon: (
      <svg className="w-8 h-8 text-[#008A5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
];

// Fallback curated top doctors matching the reference design exactly
const CURATED_TOP_DOCTORS = [
  {
    id: "doc-faisal",
    name: "Dr. Faisal Rahman",
    specialization: "Cardiologist",
    department: "Cardiology",
    qualifications: "MBBS, MD (Cardiology)",
    experience_years: 14,
    consultation_fee: 1200,
    rating: 4.9,
    review_count: "1.2k",
    room_number: "Chamber 301 (3rd Floor)",
    available_days: "Daily (Sun to Thu)",
    available_time: "05:00 PM - 09:00 PM",
    avatar_url: "/doctor-1.jpg",
    bio: "Senior Consultant Cardiologist specializing in preventive cardiology, hypertension and clinical interventions."
  },
  {
    id: "doc-nusrat",
    name: "Dr. Nusrat Jahan",
    specialization: "Gynecologist",
    department: "Gynecology & Obstetrics",
    qualifications: "MBBS, FCPS (OBGYN)",
    experience_years: 12,
    consultation_fee: 1200,
    rating: 4.8,
    review_count: "980",
    room_number: "Chamber 205 (2nd Floor)",
    available_days: "Sat to Thu",
    available_time: "04:00 PM - 08:30 PM",
    avatar_url: "/doctor-2.jpg",
    bio: "Specialist in maternal fetal medicine, high-risk pregnancies, infertility and laparoscopic gynecology."
  },
  {
    id: "doc-rafid",
    name: "Dr. Rafid Hasan",
    specialization: "Orthopedic Surgeon",
    department: "Orthopedics",
    qualifications: "MBBS, MS (Orthopedics)",
    experience_years: 15,
    consultation_fee: 1500,
    rating: 4.9,
    review_count: "1.1k",
    room_number: "Chamber 402 (4th Floor)",
    available_days: "Mon, Wed, Fri, Sat",
    available_time: "06:00 PM - 09:30 PM",
    avatar_url: "/doctor-3.jpg",
    bio: "Specialist in joint replacement surgery, sports arthroscopy, trauma and spinal disorders."
  },
  {
    id: "doc-sadia",
    name: "Dr. Sadia Karim",
    specialization: "Dermatologist",
    department: "Dermatology",
    qualifications: "MBBS, DDV",
    experience_years: 10,
    consultation_fee: 1500,
    rating: 4.8,
    review_count: "860",
    room_number: "Chamber 108 (1st Floor)",
    available_days: "Sun, Tue, Thu",
    available_time: "03:00 PM - 07:00 PM",
    avatar_url: "/doctor-4.jpg",
    bio: "Expert clinical dermatologist and aesthetic consultant specialized in chronic skin diseases and laser therapy."
  }
];

// Testimonials data
const TESTIMONIALS = [
  {
    quote: "Very easy to book an appointment. The doctor was excellent and the whole process was smooth and professional.",
    name: "Tanvir Ahmed",
    location: "Dhaka",
    avatar: "/patient-tanvir.jpg",
    rating: 5
  },
  {
    quote: "Got instant chamber serial #12 without standing in any hospital queue. Doctor Faisal Rahman was very thorough and polite.",
    name: "Nabila Hossain",
    location: "Gulshan, Dhaka",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5
  },
  {
    quote: "MediBook saved us so much time. We found Dr. Sadia Karim within 2 minutes and consultation was on point.",
    name: "Farhan Kabir",
    location: "Uttara, Dhaka",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    rating: 5
  }
];

export default function PublicLandingPage() {
  const [doctors, setDoctors] = useState<any[]>(CURATED_TOP_DOCTORS);
  const [tests, setTests] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("ALL");
  const [doctorSearch, setDoctorSearch] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("Dhaka");
  const [bookingModalDoctor, setBookingModalDoctor] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [testimonialIndex, setTestimonialIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"doctors" | "labs">("doctors");

  useEffect(() => {
    async function loadData() {
      try {
        const [docsData, testsData, pkgsData] = await Promise.all([
          fetchApi<any[]>("/doctors").catch(() => []),
          fetchApi<any[]>("/catalog/tests").catch(() => []),
          fetchApi<any[]>("/catalog/packages").catch(() => []),
        ]);

        if (docsData && docsData.length > 0) {
          // Merge curated doctors with backend doctors so database IDs are matched
          const merged = [...docsData];
          // Ensure the top 4 exist in the list
          CURATED_TOP_DOCTORS.forEach((curated) => {
            const foundIndex = merged.findIndex(
              (d) => d.name.toLowerCase() === curated.name.toLowerCase()
            );
            if (foundIndex >= 0) {
              merged[foundIndex] = { ...curated, ...merged[foundIndex], avatar_url: curated.avatar_url };
            } else {
              merged.unshift(curated);
            }
          });
          setDoctors(merged);
        }
        if (testsData) setTests(testsData);
        if (pkgsData) setPackages(pkgsData);
      } catch (err) {
        console.error("Failed to load public data", err);
      }
    }
    loadData();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchSpecialty =
      selectedSpecialty === "ALL" ||
      doc.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      doc.department?.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchSearch =
      doctorSearch === "" ||
      doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.department?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.room_number?.toLowerCase().includes(doctorSearch.toLowerCase());

    return matchSpecialty && matchSearch;
  });

  const handleSpecialtyClick = (filterKey: string) => {
    setSelectedSpecialty(filterKey);
    const elem = document.getElementById("doctors");
    elem?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const elem = document.getElementById("doctors");
    elem?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBookNow = (doc: any) => {
    setBookingModalDoctor(doc);
  };

  const currentTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800 antialiased selection:bg-[#008A5E]/20 selection:text-[#008A5E]">
      {/* 1. PROFESSIONAL NAVBAR */}
      <Navbar
        onBookClick={() => handleBookNow(doctors[0] || CURATED_TOP_DOCTORS[0])}
        onSearchClick={() => {
          const el = document.getElementById("hero-search-input");
          el?.focus();
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />

      <main className="flex-1 space-y-20 sm:space-y-24 pb-24">
        {/* ========================================================================= */}
        {/* 2. HERO SECTION — EXACT DESIGN MATCHING REFERENCE                         */}
        {/* ========================================================================= */}
        <section className="relative pt-6 sm:pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              {/* Massive Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.12]">
                Find the Right Doctor & <br />
                Book Your Appointment <br />
                <span className="text-[#008A5E]">in Minutes</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Consult trusted and verified doctors, choose your preferred time, and book appointments online — fast, easy and hassle-free.
              </p>

              {/* 3 Feature Badges Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm font-semibold text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F8F0] flex items-center justify-center text-[#008A5E]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>Book Instantly</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F8F0] flex items-center justify-center text-[#008A5E]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Verified Doctors</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F8F0] flex items-center justify-center text-[#008A5E]">
                    <Video className="w-4 h-4" />
                  </div>
                  <span>Online & In-Person</span>
                </div>
              </div>

              {/* Search Bar Container Card */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-lg shadow-gray-200/50 flex flex-col sm:flex-row items-center gap-2 mt-4 transition-all focus-within:border-[#008A5E]/60 focus-within:ring-2 focus-within:ring-[#008A5E]/20"
              >
                {/* Search Text Input */}
                <div className="flex items-center space-x-2.5 px-3 py-2 flex-1 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Search doctor, specialty or condition"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Vertical Divider 1 */}
                <div className="hidden sm:block w-px h-6 bg-gray-200 shrink-0" />

                {/* Specialty Dropdown */}
                <div className="flex items-center space-x-2 px-3 py-2 w-full sm:w-auto">
                  <LayoutGrid className="w-4 h-4 text-[#008A5E] shrink-0" />
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="text-xs sm:text-sm text-gray-700 font-medium bg-transparent focus:outline-none cursor-pointer w-full"
                  >
                    <option value="ALL">All Specialties</option>
                    <option value="Cardio">Cardiology</option>
                    <option value="Derma">Dermatology</option>
                    <option value="Ortho">Orthopedics</option>
                    <option value="Gyne">Gynecology</option>
                    <option value="Pediatric">Pediatrics</option>
                    <option value="Medicine">Medicine</option>
                    <option value="ENT">ENT</option>
                    <option value="Eye">Eye Care</option>
                  </select>
                </div>

                {/* Vertical Divider 2 */}
                <div className="hidden sm:block w-px h-6 bg-gray-200 shrink-0" />

                {/* Location Dropdown */}
                <div className="flex items-center space-x-2 px-3 py-2 w-full sm:w-auto">
                  <MapPin className="w-4 h-4 text-[#008A5E] shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="text-xs sm:text-sm text-gray-700 font-medium bg-transparent focus:outline-none cursor-pointer w-full"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                  </select>
                </div>

                {/* Find Doctor Action Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#008A5E] hover:bg-[#007550] text-white px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center space-x-2 shrink-0 group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Find Doctor</span>
                </button>
              </form>
            </div>

            {/* Right Visual Column — High Quality Doctor Visual with Mint Backdrop */}
            <div className="lg:col-span-6">
              <HealthcareHeroVisual
                onBookClick={() => handleBookNow(CURATED_TOP_DOCTORS[0])}
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TOKEN CONFIRMATION BANNER (IF BOOKED)                                     */}
        {/* ========================================================================= */}
        {bookingSuccess && (
          <div id="booking-confirmation-banner" className="max-w-4xl mx-auto px-4 my-6">
            <div className="bg-[#E8F8F0] border-2 border-[#008A5E]/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 bg-[#008A5E] rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-md shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                    SERIAL #
                  </span>
                  <span className="text-3xl leading-none font-black">
                    {bookingSuccess.token_number}
                  </span>
                  <span className="text-[9px] text-emerald-100 mt-0.5">CHAMBER</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-[#008A5E]" />
                    <h3 className="font-extrabold text-xl text-gray-900">
                      Chamber Serial #{bookingSuccess.token_number} Confirmed!
                    </h3>
                  </div>
                  <p className="text-xs text-gray-800 mt-1">
                    Patient: <strong className="text-black">{bookingSuccess.patient_name}</strong> | Doctor:{" "}
                    <strong className="text-[#008A5E]">{bookingSuccess.doctor_name}</strong> ({bookingSuccess.doctor_room})
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Date: <strong>{bookingSuccess.appointment_date}</strong> at <strong>{bookingSuccess.time_slot}</strong> | Ref: <span className="font-mono">{bookingSuccess.appointment_number}</span> | Fee: ৳ {bookingSuccess.consultation_fee?.toLocaleString()} (Paid)
                  </p>
                  <div className="mt-2 text-[11px] bg-white text-[#008A5E] border border-emerald-200 px-3 py-1 rounded-lg inline-flex items-center space-x-1 font-semibold">
                    <span>✓ Doctor chamber slot confirmed. Present your Serial #{bookingSuccess.token_number} at the desk.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href={`/customer?phone=${encodeURIComponent(bookingSuccess.phone)}`}
                  className="bg-[#008A5E] hover:bg-[#007550] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm flex items-center space-x-1.5 transition"
                >
                  <span>Customer Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => window.print()}
                  className="bg-white border border-gray-300 text-gray-800 px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-gray-50 flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-600" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3.5 py-2.5 rounded-full text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. BROWSE BY SPECIALTIES — EXACT 8 CARDS ROW MATCHING REFERENCE           */}
        {/* ========================================================================= */}
        <section id="specialties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Browse by <span className="text-[#008A5E]">Specialties</span>
            </h2>
            <button
              onClick={() => {
                setSelectedSpecialty("ALL");
                const el = document.getElementById("doctors");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs sm:text-sm font-semibold text-[#008A5E] hover:text-[#007550] flex items-center space-x-1 transition-colors group"
            >
              <span>View All Specialties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 8 Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialty === spec.filterKey;
              return (
                <div
                  key={spec.id}
                  onClick={() => handleSpecialtyClick(spec.filterKey)}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? "bg-[#E2F7ED] border-[#008A5E] shadow-sm scale-102"
                      : "bg-[#F0FAF5] hover:bg-[#E3F5EC] border-[#E0F2E9] hover:border-[#A7E7CB] shadow-2xs hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {spec.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2.5">
                    {spec.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. HOW IT WORKS? — EXACT 3 SIMPLE STEPS CARD MATCHING REFERENCE           */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F0FAF5] border border-[#E0F2E9] rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Title & Subtitle */}
            <div className="lg:w-1/4 shrink-0 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                How It <span className="text-[#008A5E]">Works?</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-normal">
                Book your doctor appointment in 3 simple steps.
              </p>
            </div>

            {/* Divider Line (Desktop) */}
            <div className="hidden lg:block w-px h-16 bg-emerald-200/80 shrink-0" />

            {/* 3 Step Flow */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-5 items-center gap-4">
              {/* Step 1 */}
              <div className="md:col-span-1 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#008A5E]/20 flex items-center justify-center text-[#008A5E] shadow-xs shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-900">1. Search Doctor</h3>
                  <p className="text-[11px] text-gray-600 leading-tight">
                    Find a doctor by specialty, name or condition.
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center items-center text-[#008A5E]">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Step 2 */}
              <div className="md:col-span-1 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#008A5E]/20 flex items-center justify-center text-[#008A5E] shadow-xs shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-900">2. Choose Time</h3>
                  <p className="text-[11px] text-gray-600 leading-tight">
                    Select a convenient date and time.
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center items-center text-[#008A5E]">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Step 3 */}
              <div className="md:col-span-1 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#008A5E]/20 flex items-center justify-center text-[#008A5E] shadow-xs shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-900">3. Book Appointment</h3>
                  <p className="text-[11px] text-gray-600 leading-tight">
                    Confirm your booking and get instant confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. MEET OUR TOP DOCTORS — EXACT 4 DOCTOR CARDS MATCHING REFERENCE        */}
        {/* ========================================================================= */}
        <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Meet Our <span className="text-[#008A5E]">Top Doctors</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Experienced, trusted and highly rated doctors.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {selectedSpecialty !== "ALL" && (
                <button
                  onClick={() => setSelectedSpecialty("ALL")}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
                >
                  Clear Filter ({selectedSpecialty})
                </button>
              )}
              <a
                href="#doctors"
                onClick={() => setSelectedSpecialty("ALL")}
                className="text-xs sm:text-sm font-semibold text-[#008A5E] hover:text-[#007550] flex items-center space-x-1 group"
              >
                <span>View All Doctors</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-lg hover:border-[#008A5E]/40 transition-all flex flex-col justify-between group"
              >
                {/* Doctor Head Info */}
                <div className="space-y-3">
                  {/* Doctor Avatar Logo Container */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-tr from-[#E8F8F0] via-[#F0FAF5] to-white relative border border-emerald-100/80 flex flex-col items-center justify-center p-4">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#008A5E] to-[#0D9488] flex flex-col items-center justify-center text-white shadow-md shadow-emerald-700/20">
                        <Stethoscope className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                        <span className="text-[10px] sm:text-xs font-black tracking-wider mt-0.5">
                          {(doc.name || "").replace("Dr. ", "").split(" ").map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "DR"}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-[#008A5E]" />
                      </div>
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
                      {doc.department || "Specialist"}
                    </span>
                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-700 shadow-2xs flex items-center space-x-1 border border-gray-100">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating || "4.9"}</span>
                      <span className="text-gray-400 font-normal">({doc.review_count || "1.2k"})</span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#008A5E] transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {doc.qualifications}
                    </p>
                  </div>

                  {/* Chamber Availability Badge */}
                  <div className="bg-[#F0FAF5] text-[11px] text-gray-600 rounded-lg p-2 space-y-0.5 border border-[#E0F2E9]">
                    <div className="font-medium text-gray-800 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#008A5E]" />
                      <span>{doc.room_number || "Chamber OPD"}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {doc.available_days} • {doc.available_time}
                    </div>
                  </div>
                </div>

                {/* Consultation Fee & Book Now Button */}
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                      Consultation Fee
                    </span>
                    <span className="text-base font-extrabold text-gray-900">
                      ৳ {doc.consultation_fee?.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookNow(doc)}
                    className="border border-[#008A5E] text-[#008A5E] hover:bg-[#008A5E] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. WHY CHOOSE MEDIBOOK? — EXACT 4 HORIZONTAL FEATURES                     */}
        {/* ========================================================================= */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Title Left */}
              <div className="lg:w-1/4 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  Why Choose <br />
                  <span className="text-[#008A5E]">MediBook?</span>
                </h2>
              </div>

              {/* 4 Features */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#008A5E] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Verified Doctors</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Qualified and experienced professionals
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#008A5E] shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Quick Booking</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Book in less than a minute
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#008A5E] shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Multiple Options</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      In-person or online consultation
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#008A5E] shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Secure & Private</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Your health data stays confidential
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. PATIENTS SAY + APP PROMO BANNER (DUAL ROW EXACTLY AS IN IMAGE)        */}
        {/* ========================================================================= */}
        <section id="download-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: What Our Patients Say */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  What Our <span className="text-[#008A5E]">Patients Say</span>
                </h2>
              </div>

              {/* Testimonial Card */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between h-full relative">
                {/* Quote Icon */}
                <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#008A5E] font-serif text-2xl font-bold mb-4">
                  “
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-gray-700 font-normal leading-relaxed mb-6">
                  {currentTestimonial.quote}
                </p>

                {/* Author Info & Rating */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      className="w-11 h-11 rounded-full object-cover border border-emerald-100"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {currentTestimonial.location}
                      </p>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center space-x-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between pt-5 mt-2">
                  {/* Arrows */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setTestimonialIndex(
                          (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                        )
                      }
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)
                      }
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dots */}
                  <div className="flex items-center space-x-1.5">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTestimonialIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === testimonialIndex
                            ? "w-6 bg-[#008A5E]"
                            : "w-2 bg-gray-300"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Book Appointments Anywhere, Anytime (App Promo) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-[#008A5E] via-[#007A53] to-[#00553A] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              {/* App Content Left */}
              <div className="space-y-4 max-w-sm z-10">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Book Appointments Anywhere, Anytime
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Get the MediBook app for a faster and smoother experience.
                </p>

                {/* Download Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* Google Play */}
                  <div className="bg-black/90 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center space-x-2.5 cursor-pointer shadow-md transition-transform hover:scale-103">
                    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 20.5v-17c0-.86.95-1.37 1.66-.91l13.5 8.5c.74.47.74 1.55 0 2.02l-13.5 8.5c-.71.46-1.66-.05-1.66-.91z" />
                    </svg>
                    <div className="text-left">
                      <span className="block text-[8px] uppercase font-bold tracking-wider text-gray-400 leading-none">
                        GET IT ON
                      </span>
                      <span className="text-xs font-bold leading-tight">Google Play</span>
                    </div>
                  </div>

                  {/* App Store */}
                  <div className="bg-black/90 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center space-x-2.5 cursor-pointer shadow-md transition-transform hover:scale-103">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.92 1.07.08 2.14-.56 2.79-1.32z" />
                    </svg>
                    <div className="text-left">
                      <span className="block text-[8px] uppercase font-bold tracking-wider text-gray-400 leading-none">
                        Download on the
                      </span>
                      <span className="text-xs font-bold leading-tight">App Store</span>
                    </div>
                  </div>
                </div>
              </div>

                {/* Phone Mockup Right */}
              <div className="relative z-10 w-48 sm:w-56 shrink-0 aspect-[9/18] bg-gray-900 rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-800 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                {/* Phone Screen Container */}
                <div className="w-full h-full bg-white rounded-[28px] overflow-hidden flex flex-col justify-between text-gray-900 select-none">
                  {/* Phone Header */}
                  <div className="p-3 bg-[#E8F8F0] border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#008A5E] flex items-center justify-center text-white text-[10px] font-black">
                        +
                      </div>
                      <span className="text-xs font-extrabold text-gray-900">MediBook</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#008A5E]" />
                  </div>

                  {/* Phone Screen Mockup Body */}
                  <div className="p-2.5 space-y-2.5 flex-1 overflow-hidden">
                    <div className="bg-gray-100 rounded-lg p-1.5 flex items-center space-x-1 text-[9px] text-gray-500">
                      <Search className="w-2.5 h-2.5" />
                      <span>Find Doctor...</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-gray-700">Categories</span>
                      <div className="grid grid-cols-2 gap-1 text-[8px]">
                        <div className="bg-[#E8F8F0] text-[#008A5E] font-semibold p-1.5 rounded-lg flex items-center space-x-1">
                          <HeartPulse className="w-2.5 h-2.5" />
                          <span>Cardio</span>
                        </div>
                        <div className="bg-[#E8F8F0] text-[#008A5E] font-semibold p-1.5 rounded-lg flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Derma</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-2 bg-white shadow-2xs space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <img
                          src="/doctor-1.jpg"
                          alt="Doctor"
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-[9px] font-bold text-gray-900 leading-tight">Dr. Faisal</p>
                          <p className="text-[7px] text-gray-500">Cardiologist</p>
                        </div>
                      </div>
                      <div className="w-full bg-[#008A5E] text-white text-[8px] font-bold text-center py-1 rounded-md">
                        Book Serial #
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav bar */}
                  <div className="h-6 bg-gray-50 border-t border-gray-100 flex items-center justify-around text-[9px] text-gray-400">
                    <span className="text-[#008A5E] font-bold">•</span>
                    <span>•</span>
                    <span>•</span>
                  </div>
                </div>
              </div>

              {/* Decorative Background Circles */}
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. DIAGNOSTIC CATALOG & TESTS (CLEAN INTEGRATED SECTION)                  */}
        {/* ========================================================================= */}
        {packages.length > 0 && (
          <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-100 scroll-mt-24">
            <div className="flex items-center mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Diagnostic Packages & Lab Profiles
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated laboratory tests with certified pathologist verification
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.slice(0, 2).map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#E8F8F0] text-[#008A5E] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Health Package
                      </span>
                      <div className="text-right">
                        <span className="text-xs line-through text-gray-400 mr-2">
                          ৳ {pkg.regular_price}
                        </span>
                        <span className="text-xl font-extrabold text-[#008A5E]">
                          ৳ {pkg.discounted_price}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{pkg.name}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{pkg.description}</p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {pkg.tests?.map((t: any) => (
                        <span
                          key={t.id}
                          className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {t.code}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Includes {pkg.tests?.length || 0} Complete Lab Tests
                    </span>
                    <Link
                      href="/customer"
                      className="bg-[#008A5E] text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#007550] transition"
                    >
                      Book Package
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 9. PROFESSIONAL FOOTER */}
      <Footer />

      {/* 10. CHAMBER APPOINTMENT BOOKING MODAL */}
      {bookingModalDoctor && (
        <BookingModal
          doctor={bookingModalDoctor}
          onClose={() => setBookingModalDoctor(null)}
          onSuccess={(res) => setBookingSuccess(res)}
        />
      )}
    </div>
  );
}
