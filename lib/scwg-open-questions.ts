import type { DecisionTaken, OpenQuestion } from "@/lib/scwg-types";

// Act 5 — decisions taken, then open questions. A reader sees what is settled
// before what is not. The three design conflicts are RESOLVED by decision and
// belong here as decisions, not as open items.

export const scwgDecisionsIntro =
  "Decisions taken. The three design conflicts the concept turns on — the CO deficit, CaS hydrolysis, and red mud's three assigned roles — are settled. Each is presented in Act 3 as problem → decision → what it cost. They are not open.";

export const scwgDecisionsTaken: DecisionTaken[] = [
  {
    conflict: "Conflict 1 — the salt separator",
    decision:
      "The salt separator (B3) is a purposeful product unit, not a protective device. Sodium removal is deliberate and metered, and red mud dosing is co-determined by its dealkalization/brine duty.",
  },
  {
    conflict: "Conflict 2 — the CO deficit",
    decision:
      "Bi-reforming (B6) is the design basis. Upstream methanation suppression — running B2 hotter and shorter — is evaluated and rejected. The flowsheet shows one committed architecture.",
  },
  {
    conflict: "Conflict 3 — sulfur capture",
    decision:
      "Calcium is removed from the flowsheet in favour of a conventional acid gas wash (Rectisol, B5). In-bed calcium capture fails in supercritical water via CaS hydrolysis.",
  },
];

export const scwgOpenQuestionsIntro =
  "Honest state of the work. These are the items that remain genuinely open — not the settled conflicts above.";

export const scwgOpenQuestions: OpenQuestion[] = [
  {
    title: "Rectisol versus MDEA is undecided",
    body: "Rectisol meets the OXZEO specification outright and handles CO₂ in the same unit; MDEA is far cheaper but needs the guard bed and gives no CO₂ control. This is the largest open capital question. The answer also determines whether CO₂ separation is free or a separate unit, which changes the Section 5 energy balance — so the capital comparison is needed before that balance is drafted.",
  },
  {
    title: "Measured ultimate analyses are missing",
    body: "For the specific douzha and straw sources, including sulfur and chloride. Three values in Section 1 are currently indicative. Sulfur now sets the acid gas removal duty and the liquid-redox unit size; chloride sets materials selection and the red mud bed sizing.",
  },
  {
    title: "Supercritical dealkalization is unvalidated",
    body: "At biomass-gasification residence times. This is the load-bearing claim of the whole concept and should be verified experimentally first. If it does not hold, the concept reverts to a conventional wet-biomass gasifier with a cheap iron catalyst — a much weaker proposition, and the report should say so.",
  },
  {
    title: "The ISO 14067 waste classification pathway is unconfirmed",
    body: "For bauxite residue in the relevant jurisdiction. It determines whether zero-burden entry is available and therefore which of two very different value propositions the work is built to defend — a low-carbon-olefin framing, or an avoided-disposal and residue-treatment framing. That choice changes whether the plant is optimized for olefin yield or for red mud throughput.",
  },
  {
    title: "Feedstock traceability must be designed in, not retrofitted",
    body: "ISCC certification integrity at the feedstock self-declaration stage is a known weak point, and douzha sourced from many small tofu and soymilk producers is precisely the fragmented, self-declared supply profile where that weakness bites. A traceability protocol belongs in the procurement model from the start rather than at audit.",
  },
  {
    title: "The EU Green Claims Directive status is contested",
    body: "Its status is inconsistent across secondary sources and must be verified against a primary Commission source before any statement about mandatory verification of environmental claims is made.",
  },
  {
    title: "Feedstock geography is unresolved",
    body: "No site holds red mud and douzha together at scale, and the Guangxi–Guangdong versus Henan trade-off is undecided.",
  },
];
