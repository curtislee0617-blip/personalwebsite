export type RequirementCategoryId = "cheme" | "bem" | "core-science" | "humanities" | "social-science" | "pe" | "elective";

export type RequirementCategory = {
  id: RequirementCategoryId;
  label: string;
  shortLabel: string;
  color: string;
  note: string;
};

// Colors chosen as a fixed-order categorical palette (validated for CVD-safe
// adjacency and contrast against the site's paper background).
export const requirementCategories: RequirementCategory[] = [
  {
    id: "cheme",
    label: "Chemical Engineering (process track)",
    shortLabel: "ChemE",
    color: "#3f7d3a",
    note: "Core option requirements plus the process-systems track, per the Caltech catalog.",
  },
  {
    id: "bem",
    label: "Business, Economics & Management",
    shortLabel: "BEM",
    color: "#d77a55",
    note: "BEM option requirements, including its elective menus.",
  },
  {
    id: "core-science",
    label: "Institute core — math & science",
    shortLabel: "Core science",
    color: "#2f6ba8",
    note: "Freshman math, physics, chemistry, biology, lab, and programming requirements shared by all options.",
  },
  {
    id: "humanities",
    label: "Humanities",
    shortLabel: "Humanities",
    color: "#b98b2a",
    note: "36 units minimum, including two first-year courses in different disciplines and 18 units of advanced humanities.",
  },
  {
    id: "social-science",
    label: "Social sciences",
    shortLabel: "Social science",
    color: "#7a4fae",
    note: "27 units minimum. One introductory slot is commonly satisfied by Ec 11, which also counts toward BEM.",
  },
  {
    id: "pe",
    label: "Physical education",
    shortLabel: "PE",
    color: "#0f9484",
    note: "9 units total, via PE coursework or intercollegiate athletics.",
  },
  {
    id: "elective",
    label: "Free electives & other",
    shortLabel: "Elective",
    color: "#b6524f",
    note: "Unallocated units toward the ~486-unit graduation total — use these to soak up overlap or extra courses.",
  },
];

export type RequirementTemplate = {
  id: string;
  categoryId: RequirementCategoryId;
  label: string;
};

export const requirementTemplates: RequirementTemplate[] = [
  // Chemical Engineering — core option requirements
  { id: "cheme-ma2", categoryId: "cheme", label: "Ma 2" },
  { id: "cheme-ph2a", categoryId: "cheme", label: "Ph 2 a" },
  { id: "cheme-ch-che-9", categoryId: "cheme", label: "Ch/ChE 9" },
  { id: "cheme-che15", categoryId: "cheme", label: "ChE 15" },
  { id: "cheme-ch21a", categoryId: "cheme", label: "Ch 21 a" },
  { id: "cheme-ch21b", categoryId: "cheme", label: "Ch 21 b" },
  { id: "cheme-ch41a", categoryId: "cheme", label: "Ch 41 a" },
  { id: "cheme-ch41b", categoryId: "cheme", label: "Ch 41 b" },
  { id: "cheme-che62", categoryId: "cheme", label: "ChE 62" },
  { id: "cheme-che63a", categoryId: "cheme", label: "ChE 63 a" },
  { id: "cheme-che63b", categoryId: "cheme", label: "ChE 63 b" },
  { id: "cheme-ch-che-91", categoryId: "cheme", label: "Ch/ChE 91 (or En/Wr 84)" },
  { id: "cheme-acm95a", categoryId: "cheme", label: "ACM 95 a" },
  { id: "cheme-acm95b", categoryId: "cheme", label: "ACM 95 b" },
  { id: "cheme-che101", categoryId: "cheme", label: "ChE 101" },
  { id: "cheme-che103a", categoryId: "cheme", label: "ChE 103 a" },
  { id: "cheme-che103b", categoryId: "cheme", label: "ChE 103 b" },
  { id: "cheme-che103c", categoryId: "cheme", label: "ChE 103 c" },
  { id: "cheme-che105", categoryId: "cheme", label: "ChE 105" },
  { id: "cheme-che126", categoryId: "cheme", label: "ChE 126" },
  { id: "cheme-econ-req", categoryId: "cheme", label: "Econ requirement (Ec 111, BEM 102, or BEM 103)" },
  // Chemical Engineering — process systems track
  { id: "cheme-che118", categoryId: "cheme", label: "ChE 118" },
  { id: "cheme-che120", categoryId: "cheme", label: "ChE 120" },
  { id: "cheme-che128", categoryId: "cheme", label: "ChE 128 (or ChE 90 c)" },
  { id: "cheme-track-1", categoryId: "cheme", label: "Process track elective" },
  { id: "cheme-track-2", categoryId: "cheme", label: "Process track elective" },
  { id: "cheme-track-3", categoryId: "cheme", label: "Process track elective" },

  // BEM — required courses
  { id: "bem-ec11", categoryId: "bem", label: "Ec 11" },
  { id: "bem-ec122", categoryId: "bem", label: "Ec 122" },
  { id: "bem-ma3", categoryId: "bem", label: "Ma 3 (or ACM/EE/IDS 116)" },
  { id: "bem-ps-ec172", categoryId: "bem", label: "PS/Ec 172" },
  { id: "bem-102", categoryId: "bem", label: "BEM 102" },
  { id: "bem-103", categoryId: "bem", label: "BEM 103" },
  { id: "bem-elective-1", categoryId: "bem", label: "BEM elective (104+)" },
  { id: "bem-elective-2", categoryId: "bem", label: "BEM elective (104+)" },
  { id: "bem-elective-3", categoryId: "bem", label: "BEM elective (104+)" },
  { id: "bem-oral-comm", categoryId: "bem", label: "Oral communication course" },
  { id: "bem-menu-1", categoryId: "bem", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-menu-2", categoryId: "bem", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-menu-3", categoryId: "bem", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-menu-4", categoryId: "bem", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-menu-5", categoryId: "bem", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-additional-1", categoryId: "bem", label: "Science/math/eng elective (BEM)" },
  { id: "bem-additional-2", categoryId: "bem", label: "Science/math/eng elective (BEM)" },
  { id: "bem-additional-3", categoryId: "bem", label: "Science/math/eng elective (BEM)" },
  { id: "bem-additional-4", categoryId: "bem", label: "Science/math/eng elective (BEM)" },

  // Institute core — math & science
  { id: "core-ma1a", categoryId: "core-science", label: "Ma 1 a" },
  { id: "core-ma1b", categoryId: "core-science", label: "Ma 1 b" },
  { id: "core-ma1c", categoryId: "core-science", label: "Ma 1 c" },
  { id: "core-ph1a", categoryId: "core-science", label: "Ph 1 a" },
  { id: "core-ph1b", categoryId: "core-science", label: "Ph 1 b" },
  { id: "core-ph1c", categoryId: "core-science", label: "Ph 1 c" },
  { id: "core-ch1a", categoryId: "core-science", label: "Ch 1 a" },
  { id: "core-ch1b", categoryId: "core-science", label: "Ch 1 b" },
  { id: "core-ch3", categoryId: "core-science", label: "Chem lab (Ch 3 a or 3 x)" },
  { id: "core-bio", categoryId: "core-science", label: "Biology (Bi 1 or Bi 8+9)" },
  { id: "core-menu-science", categoryId: "core-science", label: "Science elective (Ay 1/EE 1/ESE 1/Ge 1/IST 4)" },
  { id: "core-cs1", categoryId: "core-science", label: "Intro programming (CS 1 or CS 1 x)" },
  { id: "core-intro-lab", categoryId: "core-science", label: "Intro lab elective (e.g. APh/EE 9)" },

  // Humanities
  { id: "hum-intro-1", categoryId: "humanities", label: "Humanities intro (1st year)" },
  { id: "hum-intro-2", categoryId: "humanities", label: "Humanities intro (1st year)" },
  { id: "hum-adv-1", categoryId: "humanities", label: "Advanced humanities" },
  { id: "hum-adv-2", categoryId: "humanities", label: "Advanced humanities" },
  { id: "hum-flex-1", categoryId: "humanities", label: "Humanities/social science elective" },
  { id: "hum-flex-2", categoryId: "humanities", label: "Humanities/social science elective" },

  // Social sciences
  { id: "ss-intro-1", categoryId: "social-science", label: "Social science intro (Ec 11/PS 12/Psy 13)" },
  { id: "ss-intro-2", categoryId: "social-science", label: "Social science intro (Ec 11/PS 12/Psy 13)" },
  { id: "ss-adv-1", categoryId: "social-science", label: "Advanced social science" },
  { id: "ss-adv-2", categoryId: "social-science", label: "Advanced social science" },

  // Physical education
  { id: "pe-1", categoryId: "pe", label: "Physical education" },
  { id: "pe-2", categoryId: "pe", label: "Physical education" },
  { id: "pe-3", categoryId: "pe", label: "Physical education" },

  // Free electives
  { id: "elective-1", categoryId: "elective", label: "Free elective" },
  { id: "elective-2", categoryId: "elective", label: "Free elective" },
  { id: "elective-3", categoryId: "elective", label: "Free elective" },
  { id: "elective-4", categoryId: "elective", label: "Free elective" },
  { id: "elective-5", categoryId: "elective", label: "Free elective" },
  { id: "elective-6", categoryId: "elective", label: "Free elective" },
];
