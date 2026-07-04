export type MajorId = "cheme-process" | "bem" | "cs" | "cs-minor" | "math";

export type Major = {
  id: MajorId;
  label: string;
};

// The only majors/minors with a real, catalog-sourced requirement set so far. Add more here —
// and the matching categories/templates below — as they get transcribed; nothing else
// in the app needs to change to support a new one.
export const majors: Major[] = [
  { id: "cheme-process", label: "Chemical Engineering (process track)" },
  { id: "bem", label: "Business, Economics & Management" },
  { id: "cs", label: "Computer Science" },
  { id: "cs-minor", label: "Computer Science (minor)" },
  { id: "math", label: "Mathematics" },
];

export type RequirementCategoryId = "cheme" | "bem" | "cs" | "cs-minor" | "math" | "core-science" | "humanities" | "social-science" | "pe" | "elective";

export type RequirementCategory = {
  id: RequirementCategoryId;
  label: string;
  shortLabel: string;
  color: string;
  note: string;
  /** Which major this category belongs to; omitted for categories shared by every major (institute core, humanities, etc.). */
  majorId?: MajorId;
};

// A fixed-order categorical palette, validated with the six-checks method (lightness band,
// chroma floor, all-pairs CVD separation, contrast) against this site's paper background —
// see scripts/validate_palette.js in the dataviz skill. All-pairs (not just adjacent) matters
// here because a single class's small requirement tags can put any two categories side by side.
// "Free electives & other" is deliberately neutral gray rather than a 9th categorical hue: it's
// a genuine overflow/"other" bucket, not a named domain, so it doesn't need identity competing
// with the real ones.
export const requirementCategories: RequirementCategory[] = [
  {
    id: "cheme",
    label: "Chemical Engineering (process track)",
    shortLabel: "ChemE",
    color: "#008300",
    note: "Core option requirements plus the process-systems track, per the Caltech catalog.",
    majorId: "cheme-process",
  },
  {
    id: "bem",
    label: "Business, Economics & Management",
    shortLabel: "BEM",
    color: "#eb6834",
    note: "BEM option requirements, including its elective menus.",
    majorId: "bem",
  },
  {
    id: "cs",
    label: "Computer Science",
    shortLabel: "CS",
    color: "#2a78d6",
    note: "CS option (major) requirements: fundamentals, intermediate CS, a project sequence, advanced CS, and breadth.",
    majorId: "cs",
  },
  {
    id: "cs-minor",
    label: "Computer Science (minor)",
    shortLabel: "CS minor",
    color: "#2a78d6",
    note: "The CS minor's shorter requirement set — shares the CS major's color since almost nobody declares both at once.",
    majorId: "cs-minor",
  },
  {
    id: "math",
    label: "Mathematics",
    shortLabel: "Math",
    color: "#4a3aa7",
    note: "Ma option (major) requirements, including the full Ma 5/10/108/109 sequence and advanced Ma/ACM electives.",
    majorId: "math",
  },
  {
    id: "core-science",
    label: "Institute core — math & science",
    shortLabel: "Core science",
    color: "#1baf7a",
    note: "Freshman math, physics, chemistry, biology, lab, and programming requirements shared by all options.",
  },
  {
    id: "humanities",
    label: "Humanities",
    shortLabel: "Humanities",
    color: "#eda100",
    note: "36 units minimum, including two first-year courses in different disciplines, 18 units of advanced humanities, and 3 writing-intensive courses on grades (sophomore–senior) — usually the same courses as the advanced humanities and flex-elective tags, not extra ones.",
  },
  {
    id: "social-science",
    label: "Social sciences",
    shortLabel: "Social science",
    color: "#e87ba4",
    note: "27 units minimum. One introductory slot is commonly satisfied by Ec 11, which also counts toward BEM.",
  },
  {
    id: "pe",
    label: "Physical education",
    shortLabel: "PE",
    color: "#e34948",
    note: "9 units total, via PE coursework or intercollegiate athletics.",
  },
  {
    id: "elective",
    label: "Free electives & other",
    shortLabel: "Elective",
    color: "#78766c",
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

  // Computer Science — option (major) requirements
  { id: "cs-fund-1", categoryId: "cs", label: "CS 1 (or CS 1 x)" },
  { id: "cs-fund-2", categoryId: "cs", label: "CS 2" },
  { id: "cs-fund-3", categoryId: "cs", label: "CS 3 x" },
  { id: "cs-fund-4", categoryId: "cs", label: "CS 18" },
  { id: "cs-fund-5", categoryId: "cs", label: "CS 4" },
  { id: "cs-inter-1", categoryId: "cs", label: "CS 21" },
  { id: "cs-inter-2", categoryId: "cs", label: "CS 24" },
  { id: "cs-inter-3", categoryId: "cs", label: "CS 38" },
  // Project sequence: thesis (CS 80abc), a two-quarter project (CS 81abc/82), or a three-course
  // track (graphics, learning & vision, networks, quantum/molecular computing, robotics, or
  // programming languages) — pick whichever path and tag its courses here.
  { id: "cs-project-1", categoryId: "cs", label: "CS project sequence course" },
  { id: "cs-project-2", categoryId: "cs", label: "CS project sequence course" },
  { id: "cs-project-3", categoryId: "cs", label: "CS project sequence course" },
  { id: "cs-adv-core", categoryId: "cs", label: "Core advanced CS (CS 124/137/139/142/143/144/150 a/151)" },
  { id: "cs-adv-1", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-adv-2", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-adv-3", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-adv-4", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-adv-5", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-adv-6", categoryId: "cs", label: "Advanced CS elective (114+)" },
  { id: "cs-ma2", categoryId: "cs", label: "Ma 2 (or Ma 102)" },
  { id: "cs-ma3", categoryId: "cs", label: "Ma 3 (or Ma 103)" },
  { id: "cs-13", categoryId: "cs", label: "CS 13 (or Ma/CS 6 a or Ma 121 a)" },
  { id: "cs-sec10", categoryId: "cs", label: "SEC 10" },
  { id: "cs-sec-oral", categoryId: "cs", label: "SEC 11, 12, or 13 (choose one)" },
  { id: "cs-sci-core-1", categoryId: "cs", label: "Scientific core elective (BE/Bi 25, Bi 8/9, Ch 21/41 abc, or Ph 2/12 abc)" },
  { id: "cs-sci-core-2", categoryId: "cs", label: "Scientific core elective (BE/Bi 25, Bi 8/9, Ch 21/41 abc, or Ph 2/12 abc)" },
  { id: "cs-breadth-macs-1", categoryId: "cs", label: "Breadth: Ma/ACM/CS elective (30 units)" },
  { id: "cs-breadth-macs-2", categoryId: "cs", label: "Breadth: Ma/ACM/CS elective (30 units)" },
  { id: "cs-breadth-macs-3", categoryId: "cs", label: "Breadth: Ma/ACM/CS elective (30 units)" },
  { id: "cs-breadth-eas-1", categoryId: "cs", label: "Breadth: EAS or Ma elective (18 units)" },
  { id: "cs-breadth-eas-2", categoryId: "cs", label: "Breadth: EAS or Ma elective (18 units)" },
  { id: "cs-breadth-gen", categoryId: "cs", label: "Breadth: general elective, non-PE/PVA/SA (9 units)" },

  // Computer Science — minor
  { id: "csmin-fund-1", categoryId: "cs-minor", label: "CS 1 (or CS 1 x)" },
  { id: "csmin-fund-2", categoryId: "cs-minor", label: "CS 2" },
  { id: "csmin-fund-3", categoryId: "cs-minor", label: "CS 3 x" },
  { id: "csmin-fund-4", categoryId: "cs-minor", label: "CS 18" },
  { id: "csmin-ma2", categoryId: "cs-minor", label: "Ma 2" },
  { id: "csmin-ma3", categoryId: "cs-minor", label: "Ma 3" },
  { id: "csmin-13", categoryId: "cs-minor", label: "CS 13 (or Ma/CS 6 a or Ma 121 a)" },
  { id: "csmin-inter-1", categoryId: "cs-minor", label: "CS 21" },
  { id: "csmin-inter-2", categoryId: "cs-minor", label: "CS 24" },
  { id: "csmin-inter-3", categoryId: "cs-minor", label: "CS 38" },
  { id: "csmin-adv", categoryId: "cs-minor", label: "Advanced CS elective (114+, not double-counted with your major)" },

  // Mathematics — option (major) requirements
  { id: "math-ma2", categoryId: "math", label: "Ma 2" },
  { id: "math-ma3", categoryId: "math", label: "Ma 3 (or Ma 140 a)" },
  { id: "math-ph2b", categoryId: "math", label: "Ph 2 b (or Ph 12 b)" },
  { id: "math-ph2c", categoryId: "math", label: "Ph 2 c (or Ph 12 c)" },
  { id: "math-ma5a", categoryId: "math", label: "Ma 5 a" },
  { id: "math-ma5b", categoryId: "math", label: "Ma 5 b" },
  { id: "math-ma5c", categoryId: "math", label: "Ma 5 c" },
  { id: "math-ma10", categoryId: "math", label: "Ma 10" },
  { id: "math-ma108a", categoryId: "math", label: "Ma 108 a" },
  { id: "math-ma108b", categoryId: "math", label: "Ma 108 b" },
  { id: "math-ma108c", categoryId: "math", label: "Ma 108 c" },
  { id: "math-ma109a", categoryId: "math", label: "Ma 109 a" },
  { id: "math-ma109b", categoryId: "math", label: "Ma 109 b" },
  { id: "math-ma109c", categoryId: "math", label: "Ma 109 c" },
  { id: "math-6a", categoryId: "math", label: "Ma/CS 6 a (or Ma 121 a)" },
  { id: "math-6c", categoryId: "math", label: "Ma/CS 6 c (or Ma 116 a or Ma/CS 117 a)" },
  // The "two quarters of a single 110-190 course" stipulation is normally satisfied by two of
  // the electives below being the same sequence — tag both tags onto those two classes rather
  // than scheduling separate courses for them.
  { id: "math-sequence-1", categoryId: "math", label: "Two-quarter sequence, same 110–190 course (part 1)" },
  { id: "math-sequence-2", categoryId: "math", label: "Two-quarter sequence, same 110–190 course (part 2)" },
  { id: "math-elective-1", categoryId: "math", label: "Advanced Ma/ACM elective (Ma 110–190 or ACM 95+)" },
  { id: "math-elective-2", categoryId: "math", label: "Advanced Ma/ACM elective (Ma 110–190 or ACM 95+)" },
  { id: "math-elective-3", categoryId: "math", label: "Advanced Ma/ACM elective (Ma 110–190 or ACM 95+)" },
  { id: "math-elective-4", categoryId: "math", label: "Advanced Ma/ACM elective (Ma 110–190 or ACM 95+)" },
  { id: "math-elective-5", categoryId: "math", label: "Advanced Ma/ACM elective (Ma 110–190 or ACM 95+)" },

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
  // Writing intensive: 3 courses on grades, sophomore through senior year. Usually the same
  // physical courses as 2x advanced humanities + 1x flex elective above — tick both tags on
  // that one class rather than scheduling a 4th/5th/6th course for these.
  { id: "hum-wi-1", categoryId: "humanities", label: "Writing intensive course (on grades)" },
  { id: "hum-wi-2", categoryId: "humanities", label: "Writing intensive course (on grades)" },
  { id: "hum-wi-3", categoryId: "humanities", label: "Writing intensive course (on grades)" },

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

/** Categories visible to someone in the given majors: every shared/universal category, plus each selected major's own. */
export function categoriesForMajors(selectedMajorIds: MajorId[]): RequirementCategory[] {
  return requirementCategories.filter((category) => !category.majorId || selectedMajorIds.includes(category.majorId));
}

/** Requirement templates visible to someone in the given majors. */
export function templatesForMajors(selectedMajorIds: MajorId[]): RequirementTemplate[] {
  const visibleCategoryIds = new Set(categoriesForMajors(selectedMajorIds).map((category) => category.id));
  return requirementTemplates.filter((template) => visibleCategoryIds.has(template.categoryId));
}
