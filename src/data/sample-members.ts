/**
 * Hardcoded sample member data for discovery feed.
 * Will be replaced with API calls once backend is wired up.
 */

export interface SampleMember {
  id: string;
  fullName: string;
  classYear: number;
  yearsOfExperience: number;
  domain: string;
  city: string;
  currentRole: string;
  currentCompany: string;
  previousCompanies: string[];
  program: string;
  intent: string;
  niches: string[];
  asks: number;
  offers: number;
  isVerified: boolean;
  isFounder: boolean;
  /** Gradient colors for avatar placeholder */
  gradientFrom: string;
  gradientTo: string;
  badges: string[];
  experience: { company: string; role: string; period: string; isCurrent: boolean }[];
  education: string;
  askSignals: string[];
  offerSignals: string[];
}

export const sampleMembers: SampleMember[] = [
  {
    id: "1",
    fullName: "Ananya Krishnan",
    classYear: 2018,
    yearsOfExperience: 8,
    domain: "Climate Investing",
    city: "Bangalore",
    currentRole: "Principal",
    currentCompany: "Lightspeed",
    previousCompanies: ["McKinsey"],
    program: "PGP",
    intent:
      "Building Series A bridges for Indian climate startups. Looking for operators who've scaled hardware in Tier 2 markets.",
    niches: ["Climate Tech", "Venture Capital", "Impact Investing"],
    asks: 2,
    offers: 3,
    isVerified: true,
    isFounder: false,
    gradientFrom: "#B8762A",
    gradientTo: "#D4A053",
    badges: ["Verified Alumni", "Top Contributor"],
    experience: [
      { company: "Lightspeed", role: "Principal", period: "2021 - Present", isCurrent: true },
      { company: "McKinsey & Company", role: "Engagement Manager", period: "2018 - 2021", isCurrent: false },
    ],
    education: "PGP, Class of 2018",
    askSignals: ["Looking for a mentor in this domain", "Want to chat about a career switch"],
    offerSignals: ["Open to mentoring someone in my domain", "Open to discussing my company", "Open to giving referrals"],
  },
  {
    id: "2",
    fullName: "Vikram Subramanian",
    classYear: 2014,
    yearsOfExperience: 12,
    domain: "Fintech",
    city: "Mumbai",
    currentRole: "Founder & CEO",
    currentCompany: "FinAxis",
    previousCompanies: ["BCG"],
    program: "PGP",
    intent:
      "Scaling fraud detection for sub-prime lending. Looking for a product co-founder with scale experience.",
    niches: ["Fintech", "Fraud Detection", "Lending"],
    asks: 1,
    offers: 2,
    isVerified: false,
    isFounder: true,
    gradientFrom: "#2D4A3A",
    gradientTo: "#3D6B52",
    badges: ["Founder", "Verified Alumni"],
    experience: [
      { company: "FinAxis", role: "Founder & CEO", period: "2020 - Present", isCurrent: true },
      { company: "BCG", role: "Project Leader", period: "2014 - 2020", isCurrent: false },
    ],
    education: "PGP, Class of 2014",
    askSignals: ["Looking for a co-founder"],
    offerSignals: ["Open to mentoring someone in my domain", "Open to discussing my company"],
  },
  {
    id: "3",
    fullName: "Priya Reddy",
    classYear: 2020,
    yearsOfExperience: 5,
    domain: "Finance",
    city: "Hyderabad",
    currentRole: "Vice President",
    currentCompany: "Goldman Sachs",
    previousCompanies: [],
    program: "PGP",
    intent:
      "Exploring the pivot from banking to tech investing. Looking for VCs who made the switch.",
    niches: ["Investment Banking", "Tech Investing", "Career Transitions"],
    asks: 3,
    offers: 1,
    isVerified: false,
    isFounder: false,
    gradientFrom: "#8B5CF6",
    gradientTo: "#A78BFA",
    badges: ["Verified Alumni"],
    experience: [
      { company: "Goldman Sachs", role: "Vice President", period: "2020 - Present", isCurrent: true },
    ],
    education: "PGP, Class of 2020",
    askSignals: ["Looking for a mentor in this domain", "Want to chat about a career switch", "Curious about working at your company"],
    offerSignals: ["Open to an informal coffee chat"],
  },
  {
    id: "4",
    fullName: "Rohan Kapoor",
    classYear: 2016,
    yearsOfExperience: 8,
    domain: "VC/PE",
    city: "Mumbai",
    currentRole: "Director",
    currentCompany: "Tiger Global",
    previousCompanies: ["Bain"],
    program: "PGP",
    intent:
      "Growth investing in Indian SaaS. Open to mentoring current students exploring PE/VC.",
    niches: ["Growth Equity", "SaaS", "Private Equity"],
    asks: 1,
    offers: 3,
    isVerified: false,
    isFounder: false,
    gradientFrom: "#0EA5E9",
    gradientTo: "#38BDF8",
    badges: ["Verified Alumni", "Mentor"],
    experience: [
      { company: "Tiger Global", role: "Director", period: "2019 - Present", isCurrent: true },
      { company: "Bain & Company", role: "Senior Manager", period: "2016 - 2019", isCurrent: false },
    ],
    education: "PGP, Class of 2016",
    askSignals: ["Curious about working at your company"],
    offerSignals: ["Open to mentoring someone in my domain", "Open to giving referrals", "Open to an informal coffee chat"],
  },
  {
    id: "5",
    fullName: "Rajesh Iyer",
    classYear: 2010,
    yearsOfExperience: 16,
    domain: "Strategy & Consulting",
    city: "Mumbai",
    currentRole: "Partner",
    currentCompany: "Bain & Company",
    previousCompanies: [],
    program: "PGP",
    intent:
      "Helping the next generation of consultants think about operating roles. Open to structured mentorship.",
    niches: ["Strategy Consulting", "Leadership", "Operating Roles"],
    asks: 0,
    offers: 4,
    isVerified: false,
    isFounder: false,
    gradientFrom: "#6B6B66",
    gradientTo: "#9B9B94",
    badges: ["Verified Alumni", "Mentor of the Month"],
    experience: [
      { company: "Bain & Company", role: "Partner", period: "2010 - Present", isCurrent: true },
    ],
    education: "PGP, Class of 2010",
    askSignals: [],
    offerSignals: ["Open to mentoring someone in my domain", "Open to discussing career switches into my domain", "Open to giving referrals", "Open to an informal coffee chat"],
  },
];

/** The current logged-in user */
export const currentUser: SampleMember = {
  id: "6",
  fullName: "Arjun Mehta",
  classYear: 2026,
  yearsOfExperience: 6,
  domain: "Tech/Product",
  city: "Hyderabad",
  currentRole: "Senior Product Manager",
  currentCompany: "Flipkart",
  previousCompanies: [],
  program: "PGP",
  intent:
    "Pre-MBA PM at Flipkart looking to break into early-stage venture.",
  niches: ["Product Management", "Early-Stage VC", "Consumer Tech"],
  asks: 2,
  offers: 1,
  isVerified: false,
  isFounder: false,
  gradientFrom: "#B8762A",
  gradientTo: "#2D4A3A",
  badges: ["Current Student"],
  experience: [
    { company: "Flipkart", role: "Senior Product Manager", period: "2020 - Present", isCurrent: true },
  ],
  education: "PGP, Class of 2026",
  askSignals: ["Looking for a mentor in this domain", "Want to chat about a career switch"],
  offerSignals: ["Open to an informal coffee chat"],
};
