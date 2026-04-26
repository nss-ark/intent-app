"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { sampleMembers } from "@/data/sample-members";
import { MemberCard } from "@/components/member-card";
import { FilterPills } from "@/components/filter-pills";
import { FilterDrawer } from "@/components/filter-drawer";

/* ------------------------------------------------------------------ */
/* Filter pill options                                                 */
/* ------------------------------------------------------------------ */

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Class of 2018", value: "2018" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Climate", value: "climate" },
  { label: "VC/PE", value: "vcpe" },
  { label: "Fintech", value: "fintech" },
  { label: "Mumbai", value: "mumbai" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Simple client-side filtering for demo
  const filteredMembers = sampleMembers.filter((m) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.fullName.toLowerCase().includes(q) ||
        m.domain.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.currentCompany.toLowerCase().includes(q) ||
        m.intent.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    if (activeFilter === "all") return true;
    if (activeFilter === "2018") return m.classYear === 2018;
    if (activeFilter === "bangalore")
      return m.city.toLowerCase() === "bangalore";
    if (activeFilter === "climate")
      return m.domain.toLowerCase().includes("climate");
    if (activeFilter === "vcpe")
      return m.domain.toLowerCase().includes("vc") || m.domain.toLowerCase().includes("pe");
    if (activeFilter === "fintech")
      return m.domain.toLowerCase().includes("fintech");
    if (activeFilter === "mumbai")
      return m.city.toLowerCase() === "mumbai";
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          {/* Wordmark */}
          <h1 className="font-heading text-xl font-bold tracking-tight text-[var(--intent-text-primary)]">
            intent
          </h1>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white transition-colors hover:bg-[var(--muted)]"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <FilterDrawer resultCount={filteredMembers.length} />
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="mx-auto max-w-[1200px] px-4 pb-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 py-2">
              <Search size={16} className="shrink-0 text-[var(--intent-text-secondary)]" />
              <input
                type="text"
                placeholder="Search by name, domain, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="mx-auto max-w-[1200px]">
          <FilterPills
            pills={filterOptions}
            activeValue={activeFilter}
            onSelect={setActiveFilter}
          />
        </div>
      </header>

      {/* ── Card grid ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 py-4 md:py-6">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)]">
              <Search size={28} className="text-[var(--intent-amber)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--intent-text-primary)]">
              No members found
            </h3>
            <p className="mt-1 text-[14px] text-[var(--intent-text-secondary)]">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
