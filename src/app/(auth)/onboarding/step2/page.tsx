"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { ProgressBar } from "@/components/progress-bar";
import { NichePills } from "@/components/niche-pills";
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

const domains = [
  "Consulting",
  "Finance & Banking",
  "Technology",
  "Healthcare",
  "Consumer Goods",
  "Energy",
  "Real Estate",
  "Media & Entertainment",
  "Entrepreneurship",
  "Non-Profit / Social Impact",
  "Other",
];

const nicheOptions = [
  { value: "product_management", label: "Product Management" },
  { value: "venture_capital", label: "Venture Capital" },
  { value: "private_equity", label: "Private Equity" },
  { value: "investment_banking", label: "Investment Banking" },
  { value: "strategy_consulting", label: "Strategy Consulting" },
  { value: "data_science", label: "Data Science" },
  { value: "digital_marketing", label: "Digital Marketing" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "sustainability", label: "Sustainability" },
  { value: "fintech", label: "Fintech" },
  { value: "edtech", label: "EdTech" },
  { value: "healthtech", label: "HealthTech" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "brand_management", label: "Brand Management" },
  { value: "operations", label: "Operations" },
  { value: "people_ops", label: "People Ops / HR" },
];

interface PastExperience {
  company: string;
  title: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [pastExperiences, setPastExperiences] = useState<PastExperience[]>([]);
  const [domain, setDomain] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Load saved data
  useEffect(() => {
    try {
      const step2 = JSON.parse(localStorage.getItem("intent_step2") || "{}");
      if (step2.currentCompany) setCurrentCompany(step2.currentCompany);
      if (step2.currentTitle) setCurrentTitle(step2.currentTitle);
      if (step2.pastExperiences) setPastExperiences(step2.pastExperiences);
      if (step2.domain) setDomain(step2.domain);
      if (step2.niches) setNiches(step2.niches);
      if (step2.linkedinUrl) setLinkedinUrl(step2.linkedinUrl);
    } catch {
      // ignore
    }
  }, []);

  const addPastExperience = () => {
    setPastExperiences((prev) => [...prev, { company: "", title: "" }]);
  };

  const updatePastExperience = (
    index: number,
    field: keyof PastExperience,
    value: string
  ) => {
    setPastExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const removePastExperience = (index: number) => {
    setPastExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    localStorage.setItem(
      "intent_step2",
      JSON.stringify({
        currentCompany,
        currentTitle,
        pastExperiences,
        domain,
        niches,
        linkedinUrl,
      })
    );
    router.push("/onboarding/step3");
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
          <ProgressBar totalSteps={4} currentStep={2} />
          <p className="mt-3 text-xs text-[#6B6B66] font-medium tracking-wide">
            Step 2 of 4 &middot; Career
          </p>

          {/* Current Role */}
          <div className="mt-8">
            <h2 className="text-base font-heading font-semibold text-[#1A1A1A]">
              Current role
            </h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-[#1A1A1A]">
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="e.g. McKinsey & Company"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="h-11 rounded-xl bg-white text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-[#1A1A1A]">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Associate Partner"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  className="h-11 rounded-xl bg-white text-base"
                />
              </div>
            </div>
          </div>

          {/* Past Experience */}
          <div className="mt-8">
            <h2 className="text-base font-heading font-semibold text-[#1A1A1A]">
              Past experience
              <span className="text-[#6B6B66] font-normal text-sm ml-1">(optional)</span>
            </h2>

            {pastExperiences.map((exp, index) => (
              <div key={index} className="mt-4 relative">
                <div className="rounded-xl border border-[#D8DCE5] bg-white p-4 space-y-3">
                  <button
                    onClick={() => removePastExperience(index)}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[#EDF0F5] transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4 text-[#6B6B66]" />
                  </button>
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) =>
                      updatePastExperience(index, "company", e.target.value)
                    }
                    className="h-10 rounded-lg bg-[#F7F8FB] text-sm"
                  />
                  <Input
                    placeholder="Title"
                    value={exp.title}
                    onChange={(e) =>
                      updatePastExperience(index, "title", e.target.value)
                    }
                    className="h-10 rounded-lg bg-[#F7F8FB] text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addPastExperience}
              type="button"
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#1B3A5F] hover:text-[#2E6399] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add past experience
            </button>
          </div>

          {/* Domain */}
          <div className="mt-8 space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Domain
            </Label>
            <Select value={domain} onValueChange={(v) => setDomain(v ?? "")}>
              <SelectTrigger className="w-full h-11 rounded-xl bg-white text-base">
                <SelectValue placeholder="Select your domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Niche interests */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Niche interests
              <span className="text-[#6B6B66] font-normal ml-1">
                (pick up to 3)
              </span>
            </Label>
            <NichePills
              options={nicheOptions}
              selected={niches}
              onChange={setNiches}
              max={3}
            />
          </div>

          {/* LinkedIn */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium text-[#1A1A1A]">
              LinkedIn profile
              <span className="text-[#6B6B66] font-normal ml-1">(optional)</span>
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="h-11 rounded-xl bg-white text-base"
            />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-12 text-base font-medium rounded-xl border-[#D8DCE5] text-[#1A1A1A] hover:bg-[#EDF0F5]"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
