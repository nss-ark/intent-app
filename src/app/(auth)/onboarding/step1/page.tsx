"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const programs = [
  "PGP",
  "PGPPro",
  "PGPMAX",
  "MFAB",
  "YLP",
  "FPM",
  "EFPM",
  "AMPBA",
  "AMPHP",
  "AMPIM",
  "AMPPP",
  "AMPOS",
  "ISB Online",
  "EEP",
  "IVI",
  "Other",
];

const currentYear = new Date().getFullYear();
const classYears = Array.from({ length: currentYear + 4 - 1996 + 1 }, (_, i) =>
  (currentYear + 4 - i).toString()
);

function getYearLabel(program: string): string {
  if (["PGP", "PGPPro", "PGPMAX", "MFAB", "YLP"].includes(program)) return "Class of";
  if (["FPM", "EFPM"].includes(program)) return "Cohort";
  if (["AMPBA", "AMPHP", "AMPIM", "AMPPP", "AMPOS", "IVI"].includes(program)) return "Batch of";
  if (["EEP", "ISB Online"].includes(program)) return "Year";
  if (program === "Other") return "Year at ISB";
  return "Class year";
}

const specializations = [
  "Finance",
  "Marketing",
  "Operations",
  "Strategy",
  "IT & Systems",
  "Leadership",
  "Entrepreneurship",
  "Healthcare",
  "Other",
];

export default function OnboardingStep1() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [classYear, setClassYear] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [customSpecializations, setCustomSpecializations] = useState<string[]>([]);

  // Load saved data and fetch custom specializations
  useEffect(() => {
    try {
      const signup = JSON.parse(sessionStorage.getItem("intent_signup") || "{}");
      if (signup.fullName) setFullName(signup.fullName);

      const step1 = JSON.parse(localStorage.getItem("intent_step1") || "{}");
      if (step1.fullName) setFullName(step1.fullName);
      if (step1.program) setProgram(step1.program);
      if (step1.classYear) setClassYear(step1.classYear);
      if (step1.specialization) setSpecialization(step1.specialization);
      if (step1.customSpecialization) setCustomSpecialization(step1.customSpecialization);
      if (step1.photoPreview) setPhotoPreview(step1.photoPreview);
    } catch {
      // ignore parse errors
    }

    // Fetch custom specializations
    fetch("/api/custom-options?type=SPECIALIZATION")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCustomSpecializations(json.data.map((o: { label: string }) => o.label));
        }
      })
      .catch(() => {});
  }, []);

  const isValid = fullName.trim() !== "" && program !== "" && classYear !== "";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    if (!isValid) return;

    const finalSpecialization = specialization === "Other" && customSpecialization.trim()
      ? customSpecialization.trim()
      : specialization;

    // Persist custom specialization to backend
    if (specialization === "Other" && customSpecialization.trim()) {
      fetch("/api/custom-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "SPECIALIZATION", label: customSpecialization.trim() }),
      }).catch(() => {});
    }

    localStorage.setItem(
      "intent_step1",
      JSON.stringify({ fullName, program, classYear, specialization: finalSpecialization, customSpecialization, photoPreview })
    );
    router.push("/onboarding/step2");
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      {/* Header */}
      <div className="w-full max-w-[560px] mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#6B6B66] hover:text-[#1A1A1A] transition-colors -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center flex-1 mt-6 md:mt-8">
        <IntentWordmark size="md" />

        <div className="w-full max-w-[560px] mt-6 md:mt-8">
          {/* Progress */}
          <ProgressBar totalSteps={4} currentStep={1} />
          <p className="mt-3 text-xs text-[#6B6B66] font-medium tracking-wide">
            Step 1 of 4 &middot; About you
          </p>

          {/* Photo upload */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-[#EDF0F5] border-2 border-dashed border-[#D8DCE5] flex items-center justify-center overflow-hidden hover:border-[#1B3A5F]/50 transition-colors group"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-[#6B6B66] group-hover:text-[#1B3A5F] transition-colors" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[#6B6B66]">
            Add a photo
          </p>

          {/* Form */}
          <div className="mt-8 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#1A1A1A]">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl bg-white text-base"
                required
              />
            </div>

            {/* Program */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Program
              </Label>
              <Select value={program} onValueChange={(v) => setProgram(v ?? "")}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-white text-base">
                  <SelectValue placeholder="Select your program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                {program ? getYearLabel(program) : "Class year"}
              </Label>
              <Select value={classYear} onValueChange={(v) => setClassYear(v ?? "")}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-white text-base">
                  <SelectValue placeholder={`Select ${program ? getYearLabel(program).toLowerCase() : "year"}`} />
                </SelectTrigger>
                <SelectContent>
                  {classYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Specialization
                <span className="text-[#6B6B66] font-normal ml-1">(optional)</span>
              </Label>
              <Select value={specialization} onValueChange={(v) => { setSpecialization(v ?? ""); if (v !== "Other") setCustomSpecialization(""); }}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-white text-base">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  {customSpecializations
                    .filter((cs) => !specializations.includes(cs))
                    .map((cs) => (
                      <SelectItem key={cs} value={cs}>
                        {cs}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {specialization === "Other" && (
                <Input
                  type="text"
                  placeholder="Enter your specialization"
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value.slice(0, 50))}
                  className="h-11 rounded-xl bg-white text-base mt-2"
                  maxLength={50}
                />
              )}
            </div>
          </div>

          {/* Continue */}
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
