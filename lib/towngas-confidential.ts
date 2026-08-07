import "server-only";

// Lightly restricted V7 values. Keep this module server-only so unauthenticated
// page responses and client bundles never receive the precise source annex.

export const towngasConfidentialOpex = [
  { label: "Electricity", value: 18.8, basis: "≈50.9 GWh/year at the supplied RMB 0.37/kWh reference tariff" },
  { label: "Biomass thermal energy", value: 31.0, basis: "≈682,650 GJ/year; RMB 600/t pellets with stated LHV and efficiency assumptions" },
  { label: "Maintenance and inspection", value: 70.0, basis: "Project allowance; reference methanol maintenance is RMB 54.0m/year" },
  { label: "Labour and site services", value: 32.0, basis: "Project headcount allowance; source cost note intentionally excludes HR" },
  { label: "Catalysts, ZnO, methanol and chemicals", value: 32.0, basis: "Project allowance; reference methanol catalysts and auxiliaries are RMB 26.1m/year" },
  { label: "Water, purge treatment and disposal", value: 15.0, basis: "Project allowance; source production-water tariff is separated from treatment and disposal" },
  { label: "Insurance, administration and certification", value: 15.0, basis: "Owner cost, assurance, and routine audits" },
  { label: "Operating tax at the 55% product case", value: 1.7, basis: "RMB 30/t product convention transferred from the reference methanol cost note" },
] as const;

export const towngasMethanolReferenceCosts = [
  { item: "Biomass pellets for ASU and all plant steam", consumption: "0.6 t/t methanol", unitPrice: "RMB 600/t", perTonne: 360.0, annual: 108.00 },
  { item: "Catalysts and chemical auxiliaries", consumption: "—", unitPrice: "—", perTonne: 87.0, annual: 26.10 },
  { item: "Production water", consumption: "9 t/t methanol", unitPrice: "RMB 17/t", perTonne: 153.0, annual: 45.90 },
  { item: "Production electricity", consumption: "750 kWh/t methanol", unitPrice: "RMB 0.37/kWh", perTonne: 277.5, annual: 83.25 },
  { item: "Maintenance", consumption: "—", unitPrice: "—", perTonne: 180.0, annual: 54.00 },
  { item: "Operating taxes", consumption: "—", unitPrice: "—", perTonne: 30.0, annual: 9.00 },
  { item: "Disclosed subtotal", consumption: "—", unitPrice: "—", perTonne: 1087.5, annual: 326.25 },
] as const;

export const towngasConfidentialSources = [
  { id: "36", description: "Confidential correspondence, ‘Dear Curtis’, supplying average cash-cost data for a 300,000 t/year methanol plant; access restricted to the project and named supervisors." },
  { id: "37", description: "Inner Mongolia Sanwei methanol project, Gasification Material Balance Sheet 703, with detailed-design stream data for gasifier raw gas, quenched/washed gas, and black water." },
  { id: "38", description: "Inner Mongolia methanol project, Shift Material Balance, with four pages of detailed stream balances for shift inlet/outlet gas and high-/low-temperature condensates." },
  { id: "39", description: "KDON-30000/16160 air-separation material balance and operating information, including oxygen product, main air compressor, booster, steam, and cooling-water data." },
  { id: "40", description: "KDON-12000/5000 air-separation material balance and operating information, including the 12,000 Nm³/h oxygen system." },
  { id: "41", description: "Gasification and shift safety operating procedures, upper volume, controlled copy; process ratios, condensate washing, ammonia control, and reuse practices." },
  { id: "42", description: "Gasification safety operating procedures, lower volume, controlled copy; equipment duties, oxygen/slurry operation, quench/grey-water systems, and quality limits." },
  { id: "43", description: "Gas-source station operating procedures (2025), controlled copy; 12,000 Nm³/h ASU equipment, performance, turndown, and backup-storage information." },
  { id: "44", description: "Water-supply and drainage operating procedures, upper and lower volumes, controlled copies; reclaimed-water, UF/RO, deep-demineralisation, and reuse systems." },
  { id: "45", description: "Intern training presentation, corporate greenhouse-gas calculation method, and reference electricity/heat factors." },
  { id: "46", description: "Discharge-permit duplicate supplied in the confidential source package; site-specific compliance evidence requiring permit-boundary review before transfer to the proposed site." },
] as const;
