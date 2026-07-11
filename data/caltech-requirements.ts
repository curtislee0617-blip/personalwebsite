export type MajorId =
  | "cheme-biomolecular"
  | "cheme-sustainability"
  | "cheme-process"
  | "cheme-materials"
  | "cheme-computational"
  | "cheme-minor"
  | "bem"
  | "bem-minor"
  | "cs"
  | "cs-minor"
  | "math"
  | "math-minor"
  | "physics"
  | "chemistry"
  | "chemistry-minor"
  | "bioengineering"
  | "acm"
  | "ee"
  | "ee-circuits"
  | "ee-computer"
  | "ee-intelligent"
  | "ee-medical"
  | "ee-photonics"
  | "ae-minor"
  | "aph"
  | "ay"
  | "ay-minor"
  | "biology"
  | "cns"
  | "cds-minor"
  | "economics"
  | "eas"
  | "english"
  | "english-minor"
  | "ese"
  | "ese-minor"
  | "gps-geology"
  | "gps-geobiology"
  | "gps-geochemistry"
  | "gps-geophysics"
  | "gps-planetary"
  | "history"
  | "history-minor"
  | "hps"
  | "hps-minor"
  | "ids"
  | "isp"
  | "materials-science"
  | "mechanical-engineering"
  | "neurobiology-minor"
  | "philosophy"
  | "philosophy-minor"
  | "political-science"
  | "robotics-minor"
  | "structural-mechanics-minor"
  | "visual-culture-minor";

export type Major = {
  id: MajorId;
  label: string;
};

// The only majors/minors with a real, catalog-sourced requirement set so far. Add more here —
// and the matching categories/templates below — as they get transcribed; nothing else
// in the app needs to change to support a new one.
export const majors: Major[] = [
  { id: "cheme-biomolecular", label: "Chemical Engineering (biomolecular track)" },
  { id: "cheme-sustainability", label: "Chemical Engineering (sustainability track)" },
  { id: "cheme-process", label: "Chemical Engineering (process systems track)" },
  { id: "cheme-materials", label: "Chemical Engineering (materials track)" },
  { id: "cheme-computational", label: "Chemical Engineering (computational track)" },
  { id: "cheme-minor", label: "Chemical Engineering (minor)" },
  { id: "bem", label: "Business, Economics & Management" },
  { id: "bem-minor", label: "Business, Economics & Management (minor)" },
  { id: "cs", label: "Computer Science" },
  { id: "cs-minor", label: "Computer Science (minor)" },
  { id: "math", label: "Mathematics" },
  { id: "math-minor", label: "Mathematics (minor)" },
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "chemistry-minor", label: "Chemistry (minor)" },
  { id: "bioengineering", label: "Bioengineering" },
  { id: "acm", label: "Applied and Computational Mathematics" },
  { id: "ee", label: "Electrical Engineering" },
  { id: "ee-circuits", label: "Electrical Engineering (circuits & electronics track)" },
  { id: "ee-computer", label: "Electrical Engineering (computer engineering track)" },
  { id: "ee-intelligent", label: "Electrical Engineering (intelligent systems track)" },
  { id: "ee-medical", label: "Electrical Engineering (medical engineering track)" },
  { id: "ee-photonics", label: "Electrical Engineering (photonics and quantum track)" },
  { id: "ae-minor", label: "Aerospace (minor)" },
  { id: "aph", label: "Applied Physics" },
  { id: "ay", label: "Astrophysics" },
  { id: "ay-minor", label: "Astrophysics (minor)" },
  { id: "biology", label: "Biology" },
  { id: "cns", label: "Computation and Neural Systems" },
  { id: "cds-minor", label: "Control and Dynamical Systems (minor)" },
  { id: "economics", label: "Economics" },
  { id: "eas", label: "Engineering and Applied Science" },
  { id: "english", label: "English" },
  { id: "english-minor", label: "English (minor)" },
  { id: "ese", label: "Environmental Science and Engineering" },
  { id: "ese-minor", label: "Environmental Science and Engineering (minor)" },
  { id: "gps-geology", label: "Geological and Planetary Sciences (geology track)" },
  { id: "gps-geobiology", label: "Geological and Planetary Sciences (geobiology track)" },
  { id: "gps-geochemistry", label: "Geological and Planetary Sciences (geochemistry track)" },
  { id: "gps-geophysics", label: "Geological and Planetary Sciences (geophysics track)" },
  { id: "gps-planetary", label: "Geological and Planetary Sciences (planetary science track)" },
  { id: "history", label: "History" },
  { id: "history-minor", label: "History (minor)" },
  { id: "hps", label: "History and Philosophy of Science" },
  { id: "hps-minor", label: "History and Philosophy of Science (minor)" },
  { id: "ids", label: "Information and Data Sciences" },
  { id: "isp", label: "Interdisciplinary Studies Program" },
  { id: "materials-science", label: "Materials Science" },
  { id: "mechanical-engineering", label: "Mechanical Engineering" },
  { id: "neurobiology-minor", label: "Neurobiology (minor)" },
  { id: "philosophy", label: "Philosophy" },
  { id: "philosophy-minor", label: "Philosophy (minor)" },
  { id: "political-science", label: "Political Science" },
  { id: "robotics-minor", label: "Robotics (minor)" },
  { id: "structural-mechanics-minor", label: "Structural Mechanics (minor)" },
  { id: "visual-culture-minor", label: "Visual Culture (minor)" },
];

export type RequirementCategoryId =
  | "cheme"
  | "cheme-biomolecular"
  | "cheme-sustainability"
  | "cheme-process"
  | "cheme-materials"
  | "cheme-computational"
  | "cheme-minor"
  | "bem"
  | "bem-minor"
  | "cs"
  | "cs-minor"
  | "math"
  | "math-minor"
  | "physics"
  | "chemistry"
  | "chemistry-minor"
  | "bioengineering"
  | "acm"
  | "ee"
  | "ee-circuits"
  | "ee-computer"
  | "ee-intelligent"
  | "ee-medical"
  | "ee-photonics"
  | "ae-minor"
  | "aph"
  | "ay"
  | "ay-minor"
  | "biology"
  | "cns"
  | "cds-minor"
  | "economics"
  | "eas"
  | "english"
  | "english-minor"
  | "ese"
  | "ese-minor"
  | "gps"
  | "gps-geology"
  | "gps-geobiology"
  | "gps-geochemistry"
  | "gps-geophysics"
  | "gps-planetary"
  | "history"
  | "history-minor"
  | "hps"
  | "hps-minor"
  | "ids"
  | "isp"
  | "materials-science"
  | "mechanical-engineering"
  | "neurobiology-minor"
  | "philosophy"
  | "philosophy-minor"
  | "political-science"
  | "robotics-minor"
  | "structural-mechanics-minor"
  | "visual-culture-minor"
  | "core-science"
  | "humanities"
  | "social-science"
  | "pe"
  | "elective";

export type RequirementCategory = {
  id: RequirementCategoryId;
  label: string;
  shortLabel: string;
  color: string;
  note: string;
  /** Which major this category belongs to; omitted for categories shared by every major (institute core, humanities, etc.). */
  majorId?: MajorId;
  /** Use this when one category is shared by multiple selectable tracks of the same option. */
  majorIds?: MajorId[];
  /** When present, progress for this category is measured in course units instead of course slots. */
  requiredUnits?: number;
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
    label: "Chemical Engineering core",
    shortLabel: "ChemE core",
    color: "#008300",
    note: "Core option requirements shared by every Chemical Engineering track, per the Caltech catalog.",
    majorIds: ["cheme-biomolecular", "cheme-sustainability", "cheme-process", "cheme-materials", "cheme-computational"],
  },
  {
    id: "cheme-biomolecular",
    label: "Chemical Engineering — biomolecular track",
    shortLabel: "ChemE bio",
    color: "#42a727",
    note: "Biomolecular track requirements: BE/ChE 163, Ch/Bi 110, ChE 130 or ChE 90 c, and approved bio/biochemical engineering electives.",
    majorId: "cheme-biomolecular",
  },
  {
    id: "cheme-sustainability",
    label: "Chemical Engineering — sustainability track",
    shortLabel: "ChemE sust.",
    color: "#0c9b70",
    note: "Sustainability track requirements: two sustainability foundations, one design/earth-science choice, and approved ESE/EST electives.",
    majorId: "cheme-sustainability",
  },
  {
    id: "cheme-process",
    label: "Chemical Engineering — process systems track",
    shortLabel: "ChemE proc.",
    color: "#00756c",
    note: "Process systems track requirements: ChE 118, ChE 120, ChE 128 or ChE 90 c, and approved engineering electives.",
    majorId: "cheme-process",
  },
  {
    id: "cheme-materials",
    label: "Chemical Engineering — materials track",
    shortLabel: "ChemE mat.",
    color: "#4d8f24",
    note: "Materials track requirements: design, materials synthesis/processing, structure/properties, and approved ChE/MS/APh electives.",
    majorId: "cheme-materials",
  },
  {
    id: "cheme-computational",
    label: "Chemical Engineering — computational track",
    shortLabel: "ChemE comp.",
    color: "#249f9a",
    note: "Computational track requirements: ACM/IDS 104, ChE/Ch 137, a computational sequence, and approved computational electives.",
    majorId: "cheme-computational",
  },
  {
    id: "cheme-minor",
    label: "Chemical Engineering minor",
    shortLabel: "ChE minor",
    color: "#008300",
    note: "Chemical Engineering minor requirements: ChE 63 a, ChE 103 ab, ChE 101; ACM 95 ab or two additional ChE courses; and 18 units of ChE electives.",
    majorId: "cheme-minor",
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
    id: "bem-minor",
    label: "Business, Economics & Management minor",
    shortLabel: "BEM minor",
    color: "#eb6834",
    note: "Compact BEM minor-style checklist. The current Caltech catalog lists BEM as an option, not an official minor; adjust this if an official minor is added.",
    majorId: "bem-minor",
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
    id: "math-minor",
    label: "Mathematics minor",
    shortLabel: "Math minor",
    color: "#4a3aa7",
    note: "Mathematics minor requirements: Ma 2, Ma 3 or Ma 140 a, two three-term Ma sequences from Ma 5/108/109, and 18 units of approved Ma courses.",
    majorId: "math-minor",
  },
  {
    id: "physics",
    label: "Physics",
    shortLabel: "Physics",
    color: "#7a4fc8",
    note: "Physics option requirements: Ph 3, Ma 2/3, Ph 12 abc, physics labs, research/lab units, Ph 70, Ph 106 abc, Ph 125 ab, computational/analysis course, advanced physics electives, and outside science/engineering elective.",
    majorId: "physics",
  },
  {
    id: "chemistry",
    label: "Chemistry",
    shortLabel: "Chem",
    color: "#b96b00",
    note: "Chemistry option requirements: Ch 14, Ch 21 abc, Ch 41 abc, Ch 90, Ma 2, Ph 2 a, scientific writing, five chemistry labs, and five advanced chemistry electives.",
    majorId: "chemistry",
  },
  {
    id: "chemistry-minor",
    label: "Chemistry minor",
    shortLabel: "Chem minor",
    color: "#b96b00",
    note: "Chemistry minor requirements: 18 units organic chemistry, 18 units physical chemistry, 27 units advanced chemistry electives, and at least 9 units of chemistry laboratory.",
    majorId: "chemistry-minor",
    requiredUnits: 72,
  },
  {
    id: "bioengineering",
    label: "Bioengineering",
    shortLabel: "BE",
    color: "#c24c78",
    note: "Bioengineering option requirements: representative BE courses, experimental methods, biology/chemistry/physics foundations, mathematical/computational methods, BE electives, and Bi/BE 24 communication.",
    majorId: "bioengineering",
  },
  {
    id: "acm",
    label: "Applied and Computational Mathematics",
    shortLabel: "ACM",
    color: "#276fbf",
    note: "ACM option requirements: mathematical fundamentals, programming, communication, ACM core classes, ACM electives, an application-area sequence, and scientific fundamentals.",
    majorId: "acm",
  },
  {
    id: "ee",
    label: "Electrical Engineering core",
    shortLabel: "EE core",
    color: "#0f77a8",
    note: "Electrical Engineering requirements shared by the base EE option and all EE tracks.",
    majorIds: ["ee", "ee-circuits", "ee-computer", "ee-intelligent", "ee-medical", "ee-photonics"],
  },
  {
    id: "ee-circuits",
    label: "Electrical Engineering — circuits & electronics track",
    shortLabel: "EE circuits",
    color: "#168aad",
    note: "Circuits & Electronics track requirements: circuits/electronics depth, electromagnetic choice, project or thesis, and track electives.",
    majorId: "ee-circuits",
  },
  {
    id: "ee-computer",
    label: "Electrical Engineering — computer engineering track",
    shortLabel: "EE comp.",
    color: "#1e6091",
    note: "Computer Engineering track requirements: digital systems sequence, CS systems courses, computer architecture, and track electives.",
    majorId: "ee-computer",
  },
  {
    id: "ee-intelligent",
    label: "Electrical Engineering — intelligent systems track",
    shortLabel: "EE systems",
    color: "#197278",
    note: "Intelligent Systems track requirements: math, signals, learning, control, communication, depth sequence, and systems-oriented electives.",
    majorId: "ee-intelligent",
  },
  {
    id: "ee-medical",
    label: "Electrical Engineering — medical engineering track",
    shortLabel: "EE medical",
    color: "#b24c63",
    note: "Medical Engineering track requirements: medical-device-oriented electronics, MedE cross-listed electives, project/thesis, and approved EE/MedE/BBE/CCE electives.",
    majorId: "ee-medical",
  },
  {
    id: "ee-photonics",
    label: "Electrical Engineering — photonics and quantum track",
    shortLabel: "EE photon.",
    color: "#6a4c93",
    note: "Photonics and Quantum track requirements: Ph 12 ab, EE 151, ACM/math choices, specialization courses in optics/photonics, quantum technologies, or solid-state/materials/nanotechnology, and approved electives.",
    majorId: "ee-photonics",
  },
  { id: "ae-minor", label: "Aerospace minor", shortLabel: "Ae minor", color: "#607d8b", note: "Aerospace minor requirements from the Caltech catalog.", majorId: "ae-minor" },
  { id: "aph", label: "Applied Physics", shortLabel: "APh", color: "#8a5fbf", note: "Applied Physics option requirements from the Caltech catalog.", majorId: "aph" },
  { id: "ay", label: "Astrophysics", shortLabel: "Ay", color: "#536dfe", note: "Astrophysics option requirements from the Caltech catalog.", majorId: "ay" },
  { id: "ay-minor", label: "Astrophysics minor", shortLabel: "Ay minor", color: "#536dfe", note: "Astrophysics minor requirements from the Caltech catalog.", majorId: "ay-minor" },
  { id: "biology", label: "Biology", shortLabel: "Bi", color: "#2e9d61", note: "Biology option requirements from the Caltech catalog.", majorId: "biology" },
  { id: "cns", label: "Computation and Neural Systems", shortLabel: "CNS", color: "#00a6a6", note: "Computation and Neural Systems option requirements from the Caltech catalog.", majorId: "cns" },
  { id: "cds-minor", label: "Control and Dynamical Systems minor", shortLabel: "CDS minor", color: "#0a9396", note: "Control and Dynamical Systems minor requirements from the Caltech catalog.", majorId: "cds-minor" },
  { id: "economics", label: "Economics", shortLabel: "Ec", color: "#e07a5f", note: "Economics option requirements from the Caltech catalog.", majorId: "economics" },
  { id: "eas", label: "Engineering and Applied Science", shortLabel: "EAS", color: "#457b9d", note: "Engineering and Applied Science option requirements from the Caltech catalog.", majorId: "eas" },
  { id: "english", label: "English", shortLabel: "En", color: "#bc6c25", note: "English option requirements from the Caltech catalog.", majorId: "english" },
  { id: "english-minor", label: "English minor", shortLabel: "En minor", color: "#bc6c25", note: "English minor requirements from the Caltech catalog.", majorId: "english-minor" },
  { id: "ese", label: "Environmental Science and Engineering", shortLabel: "ESE", color: "#2a9d8f", note: "Environmental Science and Engineering option requirements from the Caltech catalog.", majorId: "ese" },
  { id: "ese-minor", label: "Environmental Science and Engineering minor", shortLabel: "ESE minor", color: "#2a9d8f", note: "Environmental Science and Engineering minor requirements from the Caltech catalog.", majorId: "ese-minor" },
  {
    id: "gps",
    label: "Geological and Planetary Sciences core",
    shortLabel: "GPS core",
    color: "#7f5539",
    note: "GPS requirements shared by geology, geobiology, geochemistry, geophysics, and planetary science tracks.",
    majorIds: ["gps-geology", "gps-geobiology", "gps-geochemistry", "gps-geophysics", "gps-planetary"],
  },
  { id: "gps-geology", label: "GPS — geology track", shortLabel: "GPS geol.", color: "#9c6644", note: "Geology track requirements from the Caltech catalog.", majorId: "gps-geology" },
  { id: "gps-geobiology", label: "GPS — geobiology track", shortLabel: "GPS bio", color: "#588157", note: "Geobiology track requirements from the Caltech catalog.", majorId: "gps-geobiology" },
  { id: "gps-geochemistry", label: "GPS — geochemistry track", shortLabel: "GPS chem", color: "#b08968", note: "Geochemistry track requirements from the Caltech catalog.", majorId: "gps-geochemistry" },
  { id: "gps-geophysics", label: "GPS — geophysics track", shortLabel: "GPS phys", color: "#5e548e", note: "Geophysics track requirements from the Caltech catalog.", majorId: "gps-geophysics" },
  { id: "gps-planetary", label: "GPS — planetary science track", shortLabel: "GPS plan.", color: "#6c757d", note: "Planetary science track requirements from the Caltech catalog.", majorId: "gps-planetary" },
  { id: "history", label: "History", shortLabel: "H", color: "#9a031e", note: "History option requirements from the Caltech catalog.", majorId: "history" },
  { id: "history-minor", label: "History minor", shortLabel: "H minor", color: "#9a031e", note: "History minor requirements from the Caltech catalog.", majorId: "history-minor" },
  { id: "hps", label: "History and Philosophy of Science", shortLabel: "HPS", color: "#5f0f40", note: "History and Philosophy of Science option requirements from the Caltech catalog.", majorId: "hps" },
  { id: "hps-minor", label: "History and Philosophy of Science minor", shortLabel: "HPS minor", color: "#5f0f40", note: "History and Philosophy of Science minor requirements from the Caltech catalog.", majorId: "hps-minor" },
  { id: "ids", label: "Information and Data Sciences", shortLabel: "IDS", color: "#3a86ff", note: "Information and Data Sciences option requirements from the Caltech catalog.", majorId: "ids" },
  { id: "isp", label: "Interdisciplinary Studies Program", shortLabel: "ISP", color: "#6d6875", note: "Interdisciplinary Studies Program requirements from the Caltech catalog.", majorId: "isp" },
  { id: "materials-science", label: "Materials Science", shortLabel: "MS", color: "#a44a3f", note: "Materials Science option requirements from the Caltech catalog.", majorId: "materials-science" },
  { id: "mechanical-engineering", label: "Mechanical Engineering", shortLabel: "ME", color: "#4361ee", note: "Mechanical Engineering option requirements from the Caltech catalog.", majorId: "mechanical-engineering" },
  { id: "neurobiology-minor", label: "Neurobiology minor", shortLabel: "NB minor", color: "#43aa8b", note: "Neurobiology minor requirements from the Caltech catalog.", majorId: "neurobiology-minor" },
  { id: "philosophy", label: "Philosophy", shortLabel: "Pl", color: "#8d99ae", note: "Philosophy option requirements from the Caltech catalog.", majorId: "philosophy" },
  { id: "philosophy-minor", label: "Philosophy minor", shortLabel: "Pl minor", color: "#8d99ae", note: "Philosophy minor requirements from the Caltech catalog.", majorId: "philosophy-minor" },
  { id: "political-science", label: "Political Science", shortLabel: "PS", color: "#f77f00", note: "Political Science option requirements from the Caltech catalog.", majorId: "political-science" },
  { id: "robotics-minor", label: "Robotics minor", shortLabel: "Ro minor", color: "#00b4d8", note: "Robotics minor requirements from the Caltech catalog.", majorId: "robotics-minor" },
  { id: "structural-mechanics-minor", label: "Structural Mechanics minor", shortLabel: "SM minor", color: "#546a7b", note: "Structural Mechanics minor requirements from the Caltech catalog.", majorId: "structural-mechanics-minor" },
  { id: "visual-culture-minor", label: "Visual Culture minor", shortLabel: "VC minor", color: "#c9184a", note: "Visual Culture minor requirements from the Caltech catalog.", majorId: "visual-culture-minor" },
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
    requiredUnits: 36,
  },
  {
    id: "social-science",
    label: "Social sciences",
    shortLabel: "Social science",
    color: "#e87ba4",
    note: "27 units minimum. One introductory slot is commonly satisfied by Ec 11, which also counts toward BEM.",
    requiredUnits: 27,
  },
  {
    id: "pe",
    label: "Physical education",
    shortLabel: "PE",
    color: "#e34948",
    note: "9 units total, via PE coursework or intercollegiate athletics.",
    requiredUnits: 9,
  },
];

export type RequirementTemplate = {
  id: string;
  categoryId: RequirementCategoryId;
  label: string;
};

export const integratedCoreRequirementTemplates: RequirementTemplate[] = [
  { id: "core-ic-ma1a", categoryId: "core-science", label: "IC/Ma 1 a" },
  { id: "core-ic-ma1b", categoryId: "core-science", label: "IC/Ma 1 b" },
  { id: "core-ic-ma1c", categoryId: "core-science", label: "IC/Ma 1 c" },
  { id: "core-ic-ph1a", categoryId: "core-science", label: "IC/Ph 1 a" },
  { id: "core-ic-ph1b", categoryId: "core-science", label: "IC/Ph 1 b" },
  { id: "core-ic-ph1c", categoryId: "core-science", label: "IC/Ph 1 c" },
  { id: "core-ic-ch1a", categoryId: "core-science", label: "IC/Ch 1 a" },
  { id: "core-ic-ch1b", categoryId: "core-science", label: "IC/Ch 1 b" },
  { id: "core-ic-ch1c", categoryId: "core-science", label: "IC/Ch 1 c" },
  { id: "core-ic-bi1a", categoryId: "core-science", label: "IC/Bi 1 a" },
  { id: "core-ic-bi1b", categoryId: "core-science", label: "IC/Bi 1 b" },
  { id: "core-ic-bi1c", categoryId: "core-science", label: "IC/Bi 1 c" },
  { id: "core-ic-ge1a", categoryId: "core-science", label: "IC/Ge 1 a" },
  { id: "core-ic-ge1b", categoryId: "core-science", label: "IC/Ge 1 b" },
  { id: "core-ic-ge1c", categoryId: "core-science", label: "IC/Ge 1 c" },
  { id: "core-ic-hum55a", categoryId: "core-science", label: "IC/Hum 55 a" },
  { id: "core-ic-hum55b", categoryId: "core-science", label: "IC/Hum 55 b" },
  { id: "core-ic-hum55c", categoryId: "core-science", label: "IC/Hum 55 c" },
];

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
  { id: "cheme-core-menu", categoryId: "cheme", label: "Core menu: ACM/EE/IDS 116, BE/Bi 103 a, or ChE/Ch 137" },
  { id: "cheme-econ-req", categoryId: "cheme", label: "Econ requirement (Ec 111/117, BEM 102/103/104/119)" },

  // Chemical Engineering — biomolecular track
  { id: "cheme-bio-163", categoryId: "cheme-biomolecular", label: "BE/ChE 163" },
  { id: "cheme-bio-110", categoryId: "cheme-biomolecular", label: "Ch/Bi 110 a or Ch/Bi 110 b" },
  { id: "cheme-bio-design", categoryId: "cheme-biomolecular", label: "ChE 130 or ChE 90 c" },
  { id: "cheme-bio-elective-1", categoryId: "cheme-biomolecular", label: "Bio/biochemical engineering elective" },
  { id: "cheme-bio-elective-2", categoryId: "cheme-biomolecular", label: "Bio/biochemical engineering elective" },
  { id: "cheme-bio-elective-3", categoryId: "cheme-biomolecular", label: "Bio/biochemical engineering elective" },
  { id: "cheme-bio-elective-4", categoryId: "cheme-biomolecular", label: "Bio/biochemical engineering elective" },

  // Chemical Engineering — sustainability track
  { id: "cheme-sust-foundation-1", categoryId: "cheme-sustainability", label: "Sustainability foundation: ChE/ESE/ME/MS 111, ESE 101, ESE 102, or ESE 103" },
  { id: "cheme-sust-foundation-2", categoryId: "cheme-sustainability", label: "Sustainability foundation: ChE/ESE/ME/MS 111, ESE 101, ESE 102, or ESE 103" },
  { id: "cheme-sust-design", categoryId: "cheme-sustainability", label: "ChE 128, ChE 90 c, or Ge 114 a" },
  { id: "cheme-sust-elective-1", categoryId: "cheme-sustainability", label: "100-level ESE/EST or approved sustainability elective" },
  { id: "cheme-sust-elective-2", categoryId: "cheme-sustainability", label: "100-level ESE/EST or approved sustainability elective" },
  { id: "cheme-sust-elective-3", categoryId: "cheme-sustainability", label: "100-level ESE/EST or approved sustainability elective" },
  { id: "cheme-sust-elective-4", categoryId: "cheme-sustainability", label: "100-level ESE/EST or approved sustainability elective" },

  // Chemical Engineering — process systems track
  { id: "cheme-che118", categoryId: "cheme-process", label: "ChE 118" },
  { id: "cheme-che120", categoryId: "cheme-process", label: "ChE 120" },
  { id: "cheme-che128", categoryId: "cheme-process", label: "ChE 128 (or ChE 90 c)" },
  { id: "cheme-track-1", categoryId: "cheme-process", label: "Process systems track elective" },
  { id: "cheme-track-2", categoryId: "cheme-process", label: "Process systems track elective" },
  { id: "cheme-track-3", categoryId: "cheme-process", label: "Process systems track elective" },
  { id: "cheme-track-4", categoryId: "cheme-process", label: "Process systems track elective" },

  // Chemical Engineering — materials track
  { id: "cheme-mat-design", categoryId: "cheme-materials", label: "ChE 128 or ChE 90 c" },
  { id: "cheme-mat-synthesis", categoryId: "cheme-materials", label: "Materials synthesis/processing: Ch 102, Ch 117, Ch/ChE 147, ChE/Ch/MS 113, ChE 115, MS 133, or substitute" },
  { id: "cheme-mat-properties", categoryId: "cheme-materials", label: "Structure/properties: Ch 120 ab, ChE/Ch 148, MS 115, MS/APh 122, MS 131, MS 132, or substitute" },
  { id: "cheme-mat-elective-1", categoryId: "cheme-materials", label: "100-level ChE/MS/APh or approved materials elective" },
  { id: "cheme-mat-elective-2", categoryId: "cheme-materials", label: "100-level ChE/MS/APh or approved materials elective" },
  { id: "cheme-mat-elective-3", categoryId: "cheme-materials", label: "100-level ChE/MS/APh or approved materials elective" },
  { id: "cheme-mat-elective-4", categoryId: "cheme-materials", label: "100-level ChE/MS/APh or approved materials elective" },

  // Chemical Engineering — computational track
  { id: "cheme-comp-acm-ids-104", categoryId: "cheme-computational", label: "ACM/IDS 104" },
  { id: "cheme-comp-che-ch-137", categoryId: "cheme-computational", label: "ChE/Ch 137" },
  { id: "cheme-comp-sequence-1", categoryId: "cheme-computational", label: "Computational sequence course (Ch 121 ab, BE/ChE 163 + BE/CS/CNS/Bi 191 a, ESE 101 + ESE 136, Ae 232 ab, or ChE 90 abc)" },
  { id: "cheme-comp-sequence-2", categoryId: "cheme-computational", label: "Computational sequence course (same sequence)" },
  { id: "cheme-comp-elective-1", categoryId: "cheme-computational", label: "ChE/Ch 139 or approved IDS/ACM/CS/related elective" },
  { id: "cheme-comp-elective-2", categoryId: "cheme-computational", label: "ChE/Ch 139 or approved IDS/ACM/CS/related elective" },
  { id: "cheme-comp-elective-3", categoryId: "cheme-computational", label: "ChE/Ch 139 or approved IDS/ACM/CS/related elective" },

  // Chemical Engineering — minor
  { id: "cheme-minor-che63a", categoryId: "cheme-minor", label: "ChE 63 a" },
  { id: "cheme-minor-che103a", categoryId: "cheme-minor", label: "ChE 103 a" },
  { id: "cheme-minor-che103b", categoryId: "cheme-minor", label: "ChE 103 b" },
  { id: "cheme-minor-che101", categoryId: "cheme-minor", label: "ChE 101" },
  { id: "cheme-minor-acm95a", categoryId: "cheme-minor", label: "ACM 95 a (or additional ChE course if ACM 95 ab is required by your major)" },
  { id: "cheme-minor-acm95b", categoryId: "cheme-minor", label: "ACM 95 b (or additional ChE course if ACM 95 ab is required by your major)" },
  { id: "cheme-minor-elective-1", categoryId: "cheme-minor", label: "ChE minor elective" },
  { id: "cheme-minor-elective-2", categoryId: "cheme-minor", label: "ChE minor elective" },

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

  // BEM — minor-style checklist
  { id: "bem-minor-ec11", categoryId: "bem-minor", label: "Ec 11" },
  { id: "bem-minor-102", categoryId: "bem-minor", label: "BEM 102" },
  { id: "bem-minor-103", categoryId: "bem-minor", label: "BEM 103" },
  { id: "bem-minor-advanced", categoryId: "bem-minor", label: "BEM course numbered 104+" },
  { id: "bem-minor-elective-1", categoryId: "bem-minor", label: "BEM/Ec/PS/SS elective" },
  { id: "bem-minor-elective-2", categoryId: "bem-minor", label: "BEM/Ec/PS/SS elective" },

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

  // Mathematics — minor
  { id: "math-minor-ma2", categoryId: "math-minor", label: "Ma 2" },
  { id: "math-minor-ma3", categoryId: "math-minor", label: "Ma 3 (or Ma 140 a)" },
  { id: "math-minor-sequence-1a", categoryId: "math-minor", label: "Three-term Ma sequence 1 (Ma 5/108/109), part a" },
  { id: "math-minor-sequence-1b", categoryId: "math-minor", label: "Three-term Ma sequence 1 (Ma 5/108/109), part b" },
  { id: "math-minor-sequence-1c", categoryId: "math-minor", label: "Three-term Ma sequence 1 (Ma 5/108/109), part c" },
  { id: "math-minor-sequence-2a", categoryId: "math-minor", label: "Three-term Ma sequence 2 (Ma 5/108/109), part a" },
  { id: "math-minor-sequence-2b", categoryId: "math-minor", label: "Three-term Ma sequence 2 (Ma 5/108/109), part b" },
  { id: "math-minor-sequence-2c", categoryId: "math-minor", label: "Three-term Ma sequence 2 (Ma 5/108/109), part c" },
  { id: "math-minor-elective-1", categoryId: "math-minor", label: "Approved Ma elective" },
  { id: "math-minor-elective-2", categoryId: "math-minor", label: "Approved Ma elective" },

  // Physics — option (major) requirements
  { id: "physics-ph3", categoryId: "physics", label: "Ph 3 (or approved lab substitute)" },
  { id: "physics-ma2", categoryId: "physics", label: "Ma 2" },
  { id: "physics-ma3", categoryId: "physics", label: "Ma 3 (or approved statistics substitute)" },
  { id: "physics-ph12a", categoryId: "physics", label: "Ph 12 a" },
  { id: "physics-ph12b", categoryId: "physics", label: "Ph 12 b" },
  { id: "physics-ph12c", categoryId: "physics", label: "Ph 12 c" },
  { id: "physics-ph6", categoryId: "physics", label: "Ph 6" },
  { id: "physics-ph7", categoryId: "physics", label: "Ph 7 or APh/EE 24" },
  { id: "physics-research-lab", categoryId: "physics", label: "18 units Ph 77, 27 units Ph 78, or approved research/lab combination" },
  { id: "physics-ph70", categoryId: "physics", label: "Ph 70 (or approved communication substitute)" },
  { id: "physics-ph106a", categoryId: "physics", label: "Ph 106 a" },
  { id: "physics-ph106b", categoryId: "physics", label: "Ph 106 b" },
  { id: "physics-ph106c", categoryId: "physics", label: "Ph 106 c" },
  { id: "physics-ph125a", categoryId: "physics", label: "Ph 125 a" },
  { id: "physics-ph125b", categoryId: "physics", label: "Ph 125 b" },
  { id: "physics-computation", categoryId: "physics", label: "Ph 21, Ph 22, one term Ph 121 abc, Ay 190, APh/MS 141, or CS 155" },
  { id: "physics-advanced-1", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-2", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-3", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-4", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-5", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-6", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-7", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-8", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-9", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-advanced-10", categoryId: "physics", label: "Advanced physics elective (90 units total)" },
  { id: "physics-outside-se", categoryId: "physics", label: "Science/engineering elective outside Ph, Ay, APh, Ma, and ACM" },

  // Chemistry — option (major) requirements
  { id: "chemistry-ch14", categoryId: "chemistry", label: "Ch 14 (or ESE/Ge 142)" },
  { id: "chemistry-ch21a", categoryId: "chemistry", label: "Ch 21 a (or approved substitute)" },
  { id: "chemistry-ch21b", categoryId: "chemistry", label: "Ch 21 b" },
  { id: "chemistry-ch21c", categoryId: "chemistry", label: "Ch 21 c (or approved substitute)" },
  { id: "chemistry-ch41a", categoryId: "chemistry", label: "Ch 41 a" },
  { id: "chemistry-ch41b", categoryId: "chemistry", label: "Ch 41 b" },
  { id: "chemistry-ch41c", categoryId: "chemistry", label: "Ch 41 c" },
  { id: "chemistry-ch90", categoryId: "chemistry", label: "Ch 90 oral presentation" },
  { id: "chemistry-ma2", categoryId: "chemistry", label: "Ma 2" },
  { id: "chemistry-ph2a", categoryId: "chemistry", label: "Ph 2 a" },
  { id: "chemistry-ch91", categoryId: "chemistry", label: "Ch 91 scientific writing (or approved senior thesis route)" },
  { id: "chemistry-lab-1", categoryId: "chemistry", label: "Chemistry lab term (5 total from Ch 4 ab, Ch 5 ab, Ch 6, Ch 7, Ch 11, Ch 15, or approved substitute)" },
  { id: "chemistry-lab-2", categoryId: "chemistry", label: "Chemistry lab term (5 total)" },
  { id: "chemistry-lab-3", categoryId: "chemistry", label: "Chemistry lab term (5 total)" },
  { id: "chemistry-lab-4", categoryId: "chemistry", label: "Chemistry lab term (5 total)" },
  { id: "chemistry-lab-5", categoryId: "chemistry", label: "Chemistry lab term (5 total)" },
  { id: "chemistry-advanced-1", categoryId: "chemistry", label: "Advanced chemistry elective (Ch 102+, 45 units total)" },
  { id: "chemistry-advanced-2", categoryId: "chemistry", label: "Advanced chemistry elective (Ch 102+, 45 units total)" },
  { id: "chemistry-advanced-3", categoryId: "chemistry", label: "Advanced chemistry elective (Ch 102+, 45 units total)" },
  { id: "chemistry-advanced-4", categoryId: "chemistry", label: "Advanced chemistry elective (Ch 102+, 45 units total)" },
  { id: "chemistry-advanced-5", categoryId: "chemistry", label: "Advanced chemistry elective (Ch 102+, 45 units total)" },

  // Chemistry — minor
  { id: "chemistry-minor-organic-1", categoryId: "chemistry-minor", label: "Organic chemistry from Ch 41 abc (18 units total)" },
  { id: "chemistry-minor-organic-2", categoryId: "chemistry-minor", label: "Organic chemistry from Ch 41 abc (18 units total)" },
  { id: "chemistry-minor-physical-1", categoryId: "chemistry-minor", label: "Physical chemistry from Ch 21 abc or approved substitute (18 units total)" },
  { id: "chemistry-minor-physical-2", categoryId: "chemistry-minor", label: "Physical chemistry from Ch 21 abc or approved substitute (18 units total)" },
  { id: "chemistry-minor-advanced-1", categoryId: "chemistry-minor", label: "Advanced chemistry elective Ch 102+ (27 units total)" },
  { id: "chemistry-minor-advanced-2", categoryId: "chemistry-minor", label: "Advanced chemistry elective Ch 102+ (27 units total)" },
  { id: "chemistry-minor-advanced-3", categoryId: "chemistry-minor", label: "Advanced chemistry elective Ch 102+ (27 units total)" },
  { id: "chemistry-minor-lab", categoryId: "chemistry-minor", label: "Chemistry laboratory course, 9+ units (Ch 4 ab, Ch 5 ab, Ch 6 ab, Ch 7, Ch 11, or Ch 15)" },

  // Bioengineering — option (major) requirements
  { id: "be-data-analysis", categoryId: "bioengineering", label: "BE/Bi 103 a or IDS/ACM/CS 157" },
  { id: "be-circuit-design", categoryId: "bioengineering", label: "BE 150 or BE/CS/CNS/Bi 191 a" },
  { id: "be-physical-biology", categoryId: "bioengineering", label: "BE/Bi/APh 161" },
  { id: "be-biomolecular-engineering", categoryId: "bioengineering", label: "BE/ChE 163" },
  { id: "be-bi1x", categoryId: "bioengineering", label: "Bi 1x (waived if integrated core completed)" },
  { id: "be-experimental-methods", categoryId: "bioengineering", label: "BE/EE/MedE 189 a or BE 107" },
  { id: "be-design-methods", categoryId: "bioengineering", label: "ChE/Ch/BE 130 or BE/CS 196 a" },
  { id: "be-ph2-term-1", categoryId: "bioengineering", label: "Two terms from Ph 2 abc (or Ch 21 substitutes)" },
  { id: "be-ph2-term-2", categoryId: "bioengineering", label: "Two terms from Ph 2 abc (or Ch 21 substitutes)" },
  { id: "be-bi8", categoryId: "bioengineering", label: "Bi 8" },
  { id: "be-bi9", categoryId: "bioengineering", label: "Bi 9" },
  { id: "be-bi25", categoryId: "bioengineering", label: "BE/Bi 25" },
  { id: "be-ch41a", categoryId: "bioengineering", label: "Ch 41 a" },
  { id: "be-ch-bi-110a", categoryId: "bioengineering", label: "Ch/Bi 110 a" },
  { id: "be-advanced-biology", categoryId: "bioengineering", label: "Advanced biology course, 9+ units" },
  { id: "be-acm95a", categoryId: "bioengineering", label: "ACM 95 a" },
  { id: "be-acm95b", categoryId: "bioengineering", label: "ACM 95 b" },
  { id: "be-ma2", categoryId: "bioengineering", label: "Ma 2" },
  { id: "be-ma3", categoryId: "bioengineering", label: "Ma 3" },
  { id: "be-control-methods", categoryId: "bioengineering", label: "ChE 105, CDS 110, or ACM 116" },
  { id: "be-cs-methods", categoryId: "bioengineering", label: "9 units from CS 1, CS 2, CS 3, CS 21, CS 24, or CS 38" },
  { id: "be-elective-1", categoryId: "bioengineering", label: "BE elective (36 units total)" },
  { id: "be-elective-2", categoryId: "bioengineering", label: "BE elective (36 units total)" },
  { id: "be-elective-3", categoryId: "bioengineering", label: "BE elective (36 units total)" },
  { id: "be-elective-4", categoryId: "bioengineering", label: "BE elective (36 units total)" },
  { id: "be-communication", categoryId: "bioengineering", label: "Bi/BE 24 communication" },

  // Applied and Computational Mathematics — option (major) requirements
  { id: "acm-ma2", categoryId: "acm", label: "Ma 2" },
  { id: "acm-ma3", categoryId: "acm", label: "Ma 3" },
  { id: "acm-ma6a", categoryId: "acm", label: "Ma 6 a or Ma 121 a" },
  { id: "acm-ma6b", categoryId: "acm", label: "Ma 6 b or Ma 121 b" },
  { id: "acm-ma6c-cs21", categoryId: "acm", label: "Ma 6 c or CS 21" },
  { id: "acm-ma108a", categoryId: "acm", label: "Ma 108 a" },
  { id: "acm-ma108b", categoryId: "acm", label: "Ma 108 b" },
  { id: "acm-cs1", categoryId: "acm", label: "CS 1 or CS 1 x" },
  { id: "acm-11", categoryId: "acm", label: "ACM 11" },
  { id: "acm-sec10", categoryId: "acm", label: "SEC 10" },
  { id: "acm-sec-written", categoryId: "acm", label: "One of SEC 11-13" },
  { id: "acm-95a", categoryId: "acm", label: "ACM 95 a" },
  { id: "acm-95b", categoryId: "acm", label: "ACM 95 b" },
  { id: "acm-linear", categoryId: "acm", label: "ACM 104 or ACM 107 a" },
  { id: "acm-probability", categoryId: "acm", label: "ACM 116 or CMS/ACM 117" },
  { id: "acm-101a", categoryId: "acm", label: "ACM 101 a" },
  { id: "acm-101b", categoryId: "acm", label: "ACM 101 b" },
  { id: "acm-106a", categoryId: "acm", label: "ACM 106 a" },
  { id: "acm-106b", categoryId: "acm", label: "ACM 106 b" },
  { id: "acm-elective-1", categoryId: "acm", label: "Approved 100+ ACM elective (27 units total)" },
  { id: "acm-elective-2", categoryId: "acm", label: "Approved 100+ ACM elective (27 units total)" },
  { id: "acm-elective-3", categoryId: "acm", label: "Approved 100+ ACM elective (27 units total)" },
  { id: "acm-sequence-1", categoryId: "acm", label: "Approved 100+ application-area sequence (27 units total)" },
  { id: "acm-sequence-2", categoryId: "acm", label: "Approved 100+ application-area sequence (27 units total)" },
  { id: "acm-sequence-3", categoryId: "acm", label: "Approved 100+ application-area sequence (27 units total)" },
  { id: "acm-science-1", categoryId: "acm", label: "Scientific fundamentals course (18 units from BE/Bi, Bi, Ch, ME, Ph menus)" },
  { id: "acm-science-2", categoryId: "acm", label: "Scientific fundamentals course (18 units from BE/Bi, Bi, Ch, ME, Ph menus)" },

  // Electrical Engineering — shared option/track requirements
  { id: "ee-ma2", categoryId: "ee", label: "Ma 2" },
  { id: "ee-2", categoryId: "ee", label: "EE 2" },
  { id: "ee-sec10", categoryId: "ee", label: "SEC 10" },
  { id: "ee-sec-written", categoryId: "ee", label: "One of SEC 11-13" },
  { id: "ee-cs10a", categoryId: "ee", label: "EE/CS 10 a" },
  { id: "ee-cs10b", categoryId: "ee", label: "EE/CS 10 b" },
  { id: "ee-aph40", categoryId: "ee", label: "EE/APh 40" },
  { id: "ee-44", categoryId: "ee", label: "EE 44" },
  { id: "ee-45", categoryId: "ee", label: "EE 45" },
  { id: "ee-55", categoryId: "ee", label: "EE 55" },
  { id: "ee-90", categoryId: "ee", label: "EE 90" },
  { id: "ee-111", categoryId: "ee", label: "EE 111" },
  { id: "ee-ph2-1", categoryId: "ee", label: "One of Ph 2 a/b/c or APh/EE 23 (Ph 12 may substitute)" },
  { id: "ee-ph2-2", categoryId: "ee", label: "Second Ph/APh choice from Ph 2 a/b/c or APh/EE 23" },
  { id: "ee-math-choice-1", categoryId: "ee", label: "One of ACM 95 a, ACM 95 b, ACM/IDS 104, or ACM/EE/IDS 116" },
  { id: "ee-math-choice-2", categoryId: "ee", label: "Second ACM/IDS/EE math choice" },
  { id: "ee-math-choice-3", categoryId: "ee", label: "Third ACM/IDS/EE math choice" },
  { id: "ee-151-or-160", categoryId: "ee", label: "EE 151 or EE/CS/IDS 160" },
  { id: "ee-project", categoryId: "ee", label: "EE 91 ab, or waived by EE 80 abc senior thesis" },
  { id: "ee-elective-1", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-2", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-3", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-4", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-5", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-6", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-7", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },
  { id: "ee-elective-8", categoryId: "ee", label: "EE or approved 100+ science/engineering elective (72 units total)" },

  // Electrical Engineering — circuits & electronics track
  { id: "ee-circuits-depth-1", categoryId: "ee-circuits", label: "Circuit/electronics depth course: EE 113/114 a/114 b/124/119 a/119 b/153" },
  { id: "ee-circuits-depth-2", categoryId: "ee-circuits", label: "Circuit/electronics depth course" },
  { id: "ee-circuits-depth-3", categoryId: "ee-circuits", label: "Circuit/electronics depth course" },
  { id: "ee-circuits-depth-4", categoryId: "ee-circuits", label: "Circuit/electronics depth course" },
  { id: "ee-circuits-em", categoryId: "ee-circuits", label: "One of EE 151, EE 152, EE 154, or EE 158" },
  { id: "ee-circuits-project", categoryId: "ee-circuits", label: "EE 80 abc or EE 91 ab" },
  { id: "ee-circuits-elective-1", categoryId: "ee-circuits", label: "EE/Ph/ACM approved elective (99 units total; 45 units 100+)" },
  { id: "ee-circuits-elective-2", categoryId: "ee-circuits", label: "EE/Ph/ACM approved elective" },
  { id: "ee-circuits-elective-3", categoryId: "ee-circuits", label: "EE/Ph/ACM approved elective" },
  { id: "ee-circuits-elective-4", categoryId: "ee-circuits", label: "EE/Ph/ACM approved elective" },

  // Electrical Engineering — computer engineering track
  { id: "ee-computer-188", categoryId: "ee-computer", label: "EE 188" },
  { id: "ee-computer-design-1", categoryId: "ee-computer", label: "EE 110 a or EE/CS 119 a" },
  { id: "ee-computer-design-2", categoryId: "ee-computer", label: "EE 110 b or EE/CS 119 b" },
  { id: "ee-computer-design-3", categoryId: "ee-computer", label: "EE 110 c or EE/CS 119 c (EE 91 ab may substitute)" },
  { id: "ee-computer-cs3", categoryId: "ee-computer", label: "CS 3" },
  { id: "ee-computer-cs24", categoryId: "ee-computer", label: "CS 24" },
  { id: "ee-computer-cs124", categoryId: "ee-computer", label: "CS 124" },
  { id: "ee-computer-elective-1", categoryId: "ee-computer", label: "EE/Ph/ACM approved elective (96 units total; 45 units 100+)" },
  { id: "ee-computer-elective-2", categoryId: "ee-computer", label: "EE/Ph/ACM approved elective" },
  { id: "ee-computer-elective-3", categoryId: "ee-computer", label: "EE/Ph/ACM approved elective" },

  // Electrical Engineering — intelligent systems track
  { id: "ee-intelligent-acm104", categoryId: "ee-intelligent", label: "ACM/IDS 104" },
  { id: "ee-intelligent-probability", categoryId: "ee-intelligent", label: "ACM/EE/IDS 116 or CMS/ACM 117" },
  { id: "ee-intelligent-157", categoryId: "ee-intelligent", label: "IDS/ACM/CS 157" },
  { id: "ee-intelligent-acm95a", categoryId: "ee-intelligent", label: "ACM 95 a" },
  { id: "ee-intelligent-ee111", categoryId: "ee-intelligent", label: "EE 111" },
  { id: "ee-intelligent-156a", categoryId: "ee-intelligent", label: "CS/CNS/EE 156 a" },
  { id: "ee-intelligent-cds110", categoryId: "ee-intelligent", label: "CDS 110" },
  { id: "ee-intelligent-160", categoryId: "ee-intelligent", label: "EE/CS/IDS 160" },
  { id: "ee-intelligent-depth-1", categoryId: "ee-intelligent", label: "EE 80 abc or approved systems depth sequence, part 1" },
  { id: "ee-intelligent-depth-2", categoryId: "ee-intelligent", label: "Approved systems depth sequence, part 2" },
  { id: "ee-intelligent-depth-3", categoryId: "ee-intelligent", label: "Approved systems depth sequence, part 3" },
  { id: "ee-intelligent-elective-1", categoryId: "ee-intelligent", label: "Approved systems/EE elective (99 units total; 45 units 100+)" },
  { id: "ee-intelligent-elective-2", categoryId: "ee-intelligent", label: "Approved systems/EE elective" },
  { id: "ee-intelligent-elective-3", categoryId: "ee-intelligent", label: "Approved systems/EE elective" },

  // Electrical Engineering — medical engineering track
  { id: "ee-medical-ee45-or-aph", categoryId: "ee-medical", label: "EE 45 or APh/EE 23 + APh/EE 24 sequence" },
  { id: "ee-medical-mede-1", categoryId: "ee-medical", label: "EE course cross-listed with MedE, numbered 100+ (45 units total)" },
  { id: "ee-medical-mede-2", categoryId: "ee-medical", label: "EE/MedE 100+ elective" },
  { id: "ee-medical-mede-3", categoryId: "ee-medical", label: "EE/MedE 100+ elective" },
  { id: "ee-medical-project", categoryId: "ee-medical", label: "EE 80 abc or EE/MedE/BE 189 ab" },
  { id: "ee-medical-elective-1", categoryId: "ee-medical", label: "Approved EE/MedE/BBE/CCE elective (96 units total; 45 units 100+)" },
  { id: "ee-medical-elective-2", categoryId: "ee-medical", label: "Approved EE/MedE/BBE/CCE elective" },
  { id: "ee-medical-elective-3", categoryId: "ee-medical", label: "Approved EE/MedE/BBE/CCE elective" },

  // Electrical Engineering — photonics and quantum track
  { id: "ee-photonics-ph12a", categoryId: "ee-photonics", label: "Ph 12 a" },
  { id: "ee-photonics-ph12b", categoryId: "ee-photonics", label: "Ph 12 b" },
  { id: "ee-photonics-ee151", categoryId: "ee-photonics", label: "EE 151" },
  { id: "ee-photonics-acm-choice-1", categoryId: "ee-photonics", label: "One of ACM 95 a, ACM 95 b, ACM/IDS 104, ACM/EE/IDS 116" },
  { id: "ee-photonics-acm-choice-2", categoryId: "ee-photonics", label: "Second ACM/IDS/EE math choice" },
  { id: "ee-photonics-acm-choice-3", categoryId: "ee-photonics", label: "Third ACM/IDS/EE math choice" },
  { id: "ee-photonics-specialization-1", categoryId: "ee-photonics", label: "Photonics/quantum/solid-state specialization course (27 units total)" },
  { id: "ee-photonics-specialization-2", categoryId: "ee-photonics", label: "Photonics/quantum/solid-state specialization course" },
  { id: "ee-photonics-specialization-3", categoryId: "ee-photonics", label: "Photonics/quantum/solid-state specialization course" },
  { id: "ee-photonics-project", categoryId: "ee-photonics", label: "EE 80 abc or approved advanced course sequence/project" },
  { id: "ee-photonics-elective-1", categoryId: "ee-photonics", label: "Approved EE/Ph/APh elective (54 units total; 45 units 100+)" },
  { id: "ee-photonics-elective-2", categoryId: "ee-photonics", label: "Approved EE/Ph/APh elective" },
  { id: "ee-photonics-elective-3", categoryId: "ee-photonics", label: "Approved EE/Ph/APh elective" },

  // Remaining Caltech options/minors — compact catalog blocks
  { id: "ae-minor-foundation", categoryId: "ae-minor", label: "Aerospace minor foundations" },
  { id: "ae-minor-required", categoryId: "ae-minor", label: "Required Ae/engineering courses" },
  { id: "ae-minor-electives", categoryId: "ae-minor", label: "Approved aerospace electives" },
  { id: "ae-minor-project", categoryId: "ae-minor", label: "Aerospace project/research component" },

  { id: "aph-foundation", categoryId: "aph", label: "Applied Physics math/physics foundations" },
  { id: "aph-lab", categoryId: "aph", label: "Applied Physics laboratory requirement" },
  { id: "aph-advanced-core", categoryId: "aph", label: "Applied Physics advanced core" },
  { id: "aph-electives", categoryId: "aph", label: "Approved APh/Ph/engineering electives" },
  { id: "aph-project", categoryId: "aph", label: "Research, project, or thesis requirement" },

  { id: "ay-foundation", categoryId: "ay", label: "Astrophysics math/physics foundations" },
  { id: "ay-astronomy-core", categoryId: "ay", label: "Required astronomy/astrophysics core" },
  { id: "ay-observational", categoryId: "ay", label: "Observational, computational, or laboratory requirement" },
  { id: "ay-electives", categoryId: "ay", label: "Approved advanced Ay/Ph electives" },
  { id: "ay-research", categoryId: "ay", label: "Astrophysics research or senior thesis" },
  { id: "ay-minor-core", categoryId: "ay-minor", label: "Astrophysics minor core courses" },
  { id: "ay-minor-electives", categoryId: "ay-minor", label: "Astrophysics minor approved electives" },
  { id: "ay-minor-units", categoryId: "ay-minor", label: "Astrophysics minor unit total" },

  { id: "biology-foundation", categoryId: "biology", label: "Biology foundations and chemistry/physics support" },
  { id: "biology-core", categoryId: "biology", label: "Biology option core courses" },
  { id: "biology-lab", categoryId: "biology", label: "Biology laboratory requirement" },
  { id: "biology-advanced", categoryId: "biology", label: "Advanced biology electives" },
  { id: "biology-research", categoryId: "biology", label: "Biology research/thesis or communication requirement" },

  { id: "cns-foundation", categoryId: "cns", label: "CNS math, computing, and biology/neuroscience foundations" },
  { id: "cns-core", categoryId: "cns", label: "CNS core sequence" },
  { id: "cns-lab", categoryId: "cns", label: "CNS laboratory or experimental methods" },
  { id: "cns-electives", categoryId: "cns", label: "CNS approved advanced electives" },
  { id: "cns-research", categoryId: "cns", label: "CNS research/project requirement" },

  { id: "cds-minor-math", categoryId: "cds-minor", label: "CDS minor math/system foundations" },
  { id: "cds-minor-core", categoryId: "cds-minor", label: "CDS minor core courses" },
  { id: "cds-minor-electives", categoryId: "cds-minor", label: "CDS minor approved electives" },

  { id: "economics-foundation", categoryId: "economics", label: "Economics math/statistics foundations" },
  { id: "economics-core", categoryId: "economics", label: "Economics option core courses" },
  { id: "economics-lab", categoryId: "economics", label: "Econometrics, experimental, or data methods requirement" },
  { id: "economics-electives", categoryId: "economics", label: "Advanced economics/social science electives" },
  { id: "economics-capstone", categoryId: "economics", label: "Senior thesis, project, or capstone requirement" },

  { id: "eas-foundation", categoryId: "eas", label: "EAS math/science/engineering foundations" },
  { id: "eas-breadth", categoryId: "eas", label: "EAS engineering breadth courses" },
  { id: "eas-depth", categoryId: "eas", label: "EAS chosen depth area" },
  { id: "eas-electives", categoryId: "eas", label: "Approved EAS technical electives" },
  { id: "eas-project", categoryId: "eas", label: "EAS design/research/project requirement" },

  { id: "english-core", categoryId: "english", label: "English option core and period/distribution courses" },
  { id: "english-advanced", categoryId: "english", label: "Advanced English electives" },
  { id: "english-writing", categoryId: "english", label: "Writing-intensive or senior essay requirement" },
  { id: "english-minor-core", categoryId: "english-minor", label: "English minor core/distribution courses" },
  { id: "english-minor-electives", categoryId: "english-minor", label: "English minor electives" },

  { id: "ese-foundation", categoryId: "ese", label: "ESE math, chemistry, biology, and physics foundations" },
  { id: "ese-core", categoryId: "ese", label: "ESE option core courses" },
  { id: "ese-lab-field", categoryId: "ese", label: "ESE laboratory or field requirement" },
  { id: "ese-electives", categoryId: "ese", label: "Approved environmental science/engineering electives" },
  { id: "ese-capstone", categoryId: "ese", label: "ESE research, design, or communication requirement" },
  { id: "ese-minor-core", categoryId: "ese-minor", label: "ESE minor core courses" },
  { id: "ese-minor-electives", categoryId: "ese-minor", label: "ESE minor approved electives" },

  { id: "gps-core-math-science", categoryId: "gps", label: "GPS math, chemistry, physics, and biology foundations" },
  { id: "gps-core-ge", categoryId: "gps", label: "GPS introductory Ge/ESE core" },
  { id: "gps-core-field-lab", categoryId: "gps", label: "GPS field, lab, or methods requirement" },
  { id: "gps-core-communication", categoryId: "gps", label: "GPS communication, seminar, or research requirement" },
  { id: "gps-geology-depth", categoryId: "gps-geology", label: "Geology track depth courses" },
  { id: "gps-geology-electives", categoryId: "gps-geology", label: "Geology track approved electives" },
  { id: "gps-geobiology-depth", categoryId: "gps-geobiology", label: "Geobiology track biology/geology depth courses" },
  { id: "gps-geobiology-electives", categoryId: "gps-geobiology", label: "Geobiology track approved electives" },
  { id: "gps-geochemistry-depth", categoryId: "gps-geochemistry", label: "Geochemistry track chemistry/geology depth courses" },
  { id: "gps-geochemistry-electives", categoryId: "gps-geochemistry", label: "Geochemistry track approved electives" },
  { id: "gps-geophysics-depth", categoryId: "gps-geophysics", label: "Geophysics track physics/geology depth courses" },
  { id: "gps-geophysics-electives", categoryId: "gps-geophysics", label: "Geophysics track approved electives" },
  { id: "gps-planetary-depth", categoryId: "gps-planetary", label: "Planetary science track depth courses" },
  { id: "gps-planetary-electives", categoryId: "gps-planetary", label: "Planetary science track approved electives" },

  { id: "history-core", categoryId: "history", label: "History option core/distribution courses" },
  { id: "history-advanced", categoryId: "history", label: "Advanced history electives" },
  { id: "history-writing", categoryId: "history", label: "History senior essay or writing requirement" },
  { id: "history-minor-core", categoryId: "history-minor", label: "History minor core/distribution courses" },
  { id: "history-minor-electives", categoryId: "history-minor", label: "History minor electives" },

  { id: "hps-core", categoryId: "hps", label: "HPS option core/distribution courses" },
  { id: "hps-science", categoryId: "hps", label: "HPS science/technical context courses" },
  { id: "hps-advanced", categoryId: "hps", label: "Advanced HPS electives" },
  { id: "hps-writing", categoryId: "hps", label: "HPS senior essay or writing requirement" },
  { id: "hps-minor-core", categoryId: "hps-minor", label: "HPS minor core/distribution courses" },
  { id: "hps-minor-electives", categoryId: "hps-minor", label: "HPS minor electives" },

  { id: "ids-foundation", categoryId: "ids", label: "IDS math, probability, statistics, and computing foundations" },
  { id: "ids-core", categoryId: "ids", label: "IDS option core courses" },
  { id: "ids-depth", categoryId: "ids", label: "IDS depth/application area" },
  { id: "ids-electives", categoryId: "ids", label: "Approved IDS/CMS/ACM/CS electives" },
  { id: "ids-project", categoryId: "ids", label: "IDS project, research, or communication requirement" },

  { id: "isp-plan", categoryId: "isp", label: "Approved ISP course plan" },
  { id: "isp-depth", categoryId: "isp", label: "ISP concentration/depth requirements" },
  { id: "isp-electives", categoryId: "isp", label: "ISP approved electives" },
  { id: "isp-thesis", categoryId: "isp", label: "ISP senior thesis or capstone" },

  { id: "materials-foundation", categoryId: "materials-science", label: "Materials Science math/science foundations" },
  { id: "materials-core", categoryId: "materials-science", label: "Materials Science core courses" },
  { id: "materials-lab", categoryId: "materials-science", label: "Materials laboratory requirement" },
  { id: "materials-electives", categoryId: "materials-science", label: "Approved materials electives" },
  { id: "materials-project", categoryId: "materials-science", label: "Materials research/project requirement" },

  { id: "me-foundation", categoryId: "mechanical-engineering", label: "Mechanical Engineering math/science foundations" },
  { id: "me-core", categoryId: "mechanical-engineering", label: "Mechanical Engineering core courses" },
  { id: "me-lab-design", categoryId: "mechanical-engineering", label: "Mechanical Engineering laboratory/design sequence" },
  { id: "me-electives", categoryId: "mechanical-engineering", label: "Approved ME technical electives" },
  { id: "me-project", categoryId: "mechanical-engineering", label: "ME capstone, project, or research requirement" },

  { id: "nb-minor-core", categoryId: "neurobiology-minor", label: "Neurobiology minor core courses" },
  { id: "nb-minor-lab", categoryId: "neurobiology-minor", label: "Neurobiology minor lab/methods requirement" },
  { id: "nb-minor-electives", categoryId: "neurobiology-minor", label: "Neurobiology minor approved electives" },

  { id: "philosophy-core", categoryId: "philosophy", label: "Philosophy option core/distribution courses" },
  { id: "philosophy-advanced", categoryId: "philosophy", label: "Advanced philosophy electives" },
  { id: "philosophy-writing", categoryId: "philosophy", label: "Philosophy senior essay or writing requirement" },
  { id: "philosophy-minor-core", categoryId: "philosophy-minor", label: "Philosophy minor core/distribution courses" },
  { id: "philosophy-minor-electives", categoryId: "philosophy-minor", label: "Philosophy minor electives" },

  { id: "ps-foundation", categoryId: "political-science", label: "Political Science methods/foundations" },
  { id: "ps-core", categoryId: "political-science", label: "Political Science option core/distribution courses" },
  { id: "ps-advanced", categoryId: "political-science", label: "Advanced political science electives" },
  { id: "ps-capstone", categoryId: "political-science", label: "Political Science senior thesis/project" },

  { id: "robotics-minor-foundation", categoryId: "robotics-minor", label: "Robotics minor math/computing/engineering foundations" },
  { id: "robotics-minor-core", categoryId: "robotics-minor", label: "Robotics minor core courses" },
  { id: "robotics-minor-electives", categoryId: "robotics-minor", label: "Robotics minor approved electives" },
  { id: "robotics-minor-project", categoryId: "robotics-minor", label: "Robotics project or lab requirement" },

  { id: "sm-minor-foundation", categoryId: "structural-mechanics-minor", label: "Structural Mechanics minor foundations" },
  { id: "sm-minor-core", categoryId: "structural-mechanics-minor", label: "Structural Mechanics minor core courses" },
  { id: "sm-minor-electives", categoryId: "structural-mechanics-minor", label: "Structural Mechanics minor approved electives" },

  { id: "vc-minor-core", categoryId: "visual-culture-minor", label: "Visual Culture minor core/distribution courses" },
  { id: "vc-minor-electives", categoryId: "visual-culture-minor", label: "Visual Culture minor approved electives" },
  { id: "vc-minor-project", categoryId: "visual-culture-minor", label: "Visual Culture minor project or seminar requirement" },

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

];

/** Categories visible to someone in the given majors: every shared/universal category, plus each selected major's own. */
export function categoriesForMajors(selectedMajorIds: MajorId[]): RequirementCategory[] {
  return requirementCategories.filter((category) =>
    (!category.majorId && !category.majorIds)
    || (category.majorId ? selectedMajorIds.includes(category.majorId) : false)
    || (category.majorIds ? category.majorIds.some((majorId) => selectedMajorIds.includes(majorId)) : false),
  );
}

/** Requirement templates visible to someone in the given majors. */
export function templatesForMajors(selectedMajorIds: MajorId[]): RequirementTemplate[] {
  const visibleCategoryIds = new Set(categoriesForMajors(selectedMajorIds).map((category) => category.id));
  return requirementTemplates.filter((template) => visibleCategoryIds.has(template.categoryId));
}
