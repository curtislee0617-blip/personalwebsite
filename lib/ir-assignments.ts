export type IrReferenceBand = {
  low: number;
  high: number;
  assignment: string;
  vibration: string;
  region: "3 μ / X-H" | "Triple-bond" | "Double-bond" | "Fingerprint";
  reliability: "higher" | "context" | "tentative";
  note: string;
};

export type IrAssignmentSuggestion = IrReferenceBand & { distance: number };

export const irReferenceBands: IrReferenceBand[] = [
  { low: 3400, high: 3600, assignment: "O-H", vibration: "stretch", region: "3 μ / X-H", reliability: "context", note: "Free O-H is sharper near 3600 cm⁻¹; hydrogen-bonded O-H is broader near 3400 cm⁻¹." },
  { low: 3200, high: 3400, assignment: "N-H", vibration: "stretch", region: "3 μ / X-H", reliability: "context", note: "Free N-H is sharper near 3400 cm⁻¹; associated N-H is broader near 3200 cm⁻¹. Primary NH₂ often gives two bands." },
  { low: 3270, high: 3335, assignment: "terminal alkyne ≡C-H", vibration: "stretch", region: "3 μ / X-H", reliability: "higher", note: "Usually sharp and close to 3300 cm⁻¹." },
  { low: 3020, high: 3120, assignment: "alkene =C-H", vibration: "stretch", region: "3 μ / X-H", reliability: "context", note: "Often weak; the reference places a typical olefinic C-H band near 3080 cm⁻¹." },
  { low: 3000, high: 3100, assignment: "aromatic C-H", vibration: "stretch", region: "3 μ / X-H", reliability: "context", note: "Typically near 3050 cm⁻¹ and should be checked with aromatic ring bands near 1600 and 1500 cm⁻¹." },
  { low: 2850, high: 3000, assignment: "aliphatic sp³ C-H", vibration: "stretch", region: "3 μ / X-H", reliability: "higher", note: "Common alkyl C-H envelope; the reference highlights a representative value near 2890-2900 cm⁻¹." },
  { low: 2750, high: 2900, assignment: "aldehyde C-H", vibration: "stretch", region: "3 μ / X-H", reliability: "context", note: "One or two weak bands may accompany an aldehyde carbonyl." },
  { low: 2225, high: 2250, assignment: "C≡N nitrile", vibration: "stretch", region: "Triple-bond", reliability: "higher", note: "Near 2250 cm⁻¹ when unconjugated and nearer 2225 cm⁻¹ when conjugated." },
  { low: 2100, high: 2150, assignment: "C≡C alkyne", vibration: "stretch", region: "Triple-bond", reliability: "context", note: "May be very weak or absent for a nearly symmetrical alkyne." },
  { low: 2250, high: 2275, assignment: "N=C=O isocyanate", vibration: "asymmetric stretch", region: "Triple-bond", reliability: "higher", note: "Expected to be very strong." },
  { low: 2125, high: 2175, assignment: "C=C=O ketene", vibration: "stretch", region: "Triple-bond", reliability: "context", note: "Reference value approximately 2150 cm⁻¹." },
  { low: 1925, high: 1975, assignment: "C=C=C allene", vibration: "asymmetric stretch", region: "Triple-bond", reliability: "context", note: "Reference value approximately 1950 cm⁻¹." },
  { low: 1780, high: 1820, assignment: "acid chloride C=O", vibration: "stretch", region: "Double-bond", reliability: "higher", note: "Reference value near 1800 cm⁻¹; conjugation lowers the frequency." },
  { low: 1790, high: 1830, assignment: "acid anhydride C=O", vibration: "asymmetric stretch", region: "Double-bond", reliability: "higher", note: "Anhydrides normally show a pair, approximately 1810 and 1760 cm⁻¹." },
  { low: 1740, high: 1780, assignment: "acid anhydride C=O", vibration: "symmetric stretch", region: "Double-bond", reliability: "higher", note: "Look for the companion higher-frequency anhydride carbonyl band." },
  { low: 1720, high: 1760, assignment: "ester C=O", vibration: "stretch", region: "Double-bond", reliability: "higher", note: "Reference value near 1740 cm⁻¹; conjugation can lower it toward 1710 cm⁻¹." },
  { low: 1680, high: 1745, assignment: "aldehyde or ketone C=O", vibration: "stretch", region: "Double-bond", reliability: "higher", note: "Acyclic unconjugated carbonyls are near 1710 cm⁻¹. Conjugation lowers and ring strain raises the band." },
  { low: 1680, high: 1725, assignment: "carboxylic acid C=O", vibration: "stretch", region: "Double-bond", reliability: "higher", note: "Reference value near 1700 cm⁻¹; often accompanied by a very broad O-H envelope." },
  { low: 1635, high: 1680, assignment: "amide C=O", vibration: "stretch", region: "Double-bond", reliability: "higher", note: "Reference value near 1660 cm⁻¹; conjugation can lower it." },
  { low: 1600, high: 1655, assignment: "alkene C=C", vibration: "stretch", region: "Double-bond", reliability: "context", note: "Often weak near 1650 cm⁻¹; conjugation can strengthen and lower it toward 1610 cm⁻¹." },
  { low: 1610, high: 1660, assignment: "C=N", vibration: "stretch", region: "Double-bond", reliability: "context", note: "Reference value near 1640 cm⁻¹ and often weak." },
  { low: 1575, high: 1615, assignment: "aromatic ring", vibration: "C=C skeletal stretch", region: "Double-bond", reliability: "context", note: "A band near 1600 cm⁻¹ normally appears with another near 1500 cm⁻¹." },
  { low: 1470, high: 1525, assignment: "aromatic ring", vibration: "C=C skeletal stretch", region: "Fingerprint", reliability: "context", note: "Use together with the aromatic band near 1600 cm⁻¹ and out-of-plane bands." },
  { low: 1580, high: 1620, assignment: "primary amine / NH₂", vibration: "bend", region: "Double-bond", reliability: "context", note: "Use with the N-H stretching pattern in the 3 μ region." },
  { low: 1515, high: 1565, assignment: "N-H", vibration: "bend", region: "Fingerprint", reliability: "context", note: "Can support a secondary amine or monosubstituted amide; may be weak." },
  { low: 1490, high: 1550, assignment: "NO₂", vibration: "asymmetric stretch", region: "Fingerprint", reliability: "higher", note: "Usually an intense pair with the symmetric NO₂ band near 1350 cm⁻¹." },
  { low: 1320, high: 1380, assignment: "NO₂", vibration: "symmetric stretch", region: "Fingerprint", reliability: "higher", note: "Look for the coupled intense band near 1520 cm⁻¹." },
  { low: 1440, high: 1485, assignment: "CH₂", vibration: "bend", region: "Fingerprint", reliability: "tentative", note: "Reference value near 1465 cm⁻¹." },
  { low: 1390, high: 1430, assignment: "CH₂ next to C=O", vibration: "bend", region: "Fingerprint", reliability: "tentative", note: "Reference value near 1410 cm⁻¹." },
  { low: 1430, high: 1470, assignment: "CH₃", vibration: "asymmetric bend", region: "Fingerprint", reliability: "tentative", note: "Pair with the lower-frequency methyl bend near 1375 cm⁻¹." },
  { low: 1355, high: 1395, assignment: "CH₃", vibration: "symmetric bend", region: "Fingerprint", reliability: "context", note: "A gem-dimethyl group may give a characteristic pair around 1385 and 1365 cm⁻¹." },
  { low: 1295, high: 1345, assignment: "C-H", vibration: "bend", region: "Fingerprint", reliability: "tentative", note: "Weak and often unreliable according to the reference." },
  { low: 1000, high: 1250, assignment: "C-O", vibration: "stretch / bend", region: "Fingerprint", reliability: "tentative", note: "One or more strong bands occur for alcohols, ethers and esters, but precise structural assignments are approximate." },
  { low: 1020, high: 1080, assignment: "sulfoxide S=O", vibration: "stretch", region: "Fingerprint", reliability: "context", note: "Reference value near 1050 cm⁻¹ and usually strong." },
  { low: 1310, high: 1350, assignment: "sulfone S=O", vibration: "asymmetric stretch", region: "Fingerprint", reliability: "context", note: "Strong coupled pair with a second band near 1140 cm⁻¹." },
  { low: 1120, high: 1160, assignment: "sulfone S=O", vibration: "symmetric stretch", region: "Fingerprint", reliability: "context", note: "Look for the companion band near 1330 cm⁻¹." },
  { low: 1150, high: 1190, assignment: "sulfonate ester S=O", vibration: "symmetric stretch", region: "Fingerprint", reliability: "context", note: "Strong pair with another band near 1380 cm⁻¹." },
  { low: 950, high: 995, assignment: "trans-disubstituted alkene", vibration: "=C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "A strong band near 975 cm⁻¹." },
  { low: 890, high: 930, assignment: "terminal vinyl group", vibration: "=C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "A strong band near 910 cm⁻¹, usually accompanied by one near 975 cm⁻¹." },
  { low: 870, high: 910, assignment: "vinylidene =CH₂", vibration: "out-of-plane bend", region: "Fingerprint", reliability: "context", note: "Reference value near 890 cm⁻¹." },
  { low: 680, high: 720, assignment: "cis-disubstituted alkene", vibration: "=C-H out-of-plane bend", region: "Fingerprint", reliability: "tentative", note: "Often obscured by solvent or other absorptions." },
  { low: 730, high: 770, assignment: "monosubstituted aromatic ring", vibration: "C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "Often paired with a strong band near 690 cm⁻¹." },
  { low: 680, high: 710, assignment: "monosubstituted aromatic ring", vibration: "C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "Use together with the band near 750 cm⁻¹." },
  { low: 765, high: 795, assignment: "meta-disubstituted aromatic ring", vibration: "C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "Reference pattern includes bands around 780 and 700 cm⁻¹." },
  { low: 805, high: 845, assignment: "para-disubstituted aromatic ring", vibration: "C-H out-of-plane bend", region: "Fingerprint", reliability: "context", note: "Reference value near 825 cm⁻¹." },
];

export function suggestIrAssignments(wavenumber: number, limit = 4): IrAssignmentSuggestion[] {
  return irReferenceBands
    .filter((band) => wavenumber >= band.low && wavenumber <= band.high)
    .map((band) => ({ ...band, distance: Math.abs(wavenumber - (band.low + band.high) / 2) / Math.max(1, band.high - band.low) }))
    .sort((a, b) => {
      const reliability = { higher: 0, context: 1, tentative: 2 };
      return reliability[a.reliability] - reliability[b.reliability] || a.distance - b.distance;
    })
    .slice(0, limit);
}
