export const TIERS = [
  { min: 0, max: 5, name: 'NAV-KISAN' },
  { min: 6, max: 20, name: 'JAGRUK KISAN' },
  { min: 21, max: 50, name: 'AGRO-EXPERT' },
  { min: 51, max: 100, name: 'HARVEST MASTER' },
  { min: 101, max: Infinity, name: 'ADARSH KISAN' },
];

export const calculateRank = (scans: number): string => {
  const tier = TIERS.find(t => scans >= t.min && scans <= t.max) || TIERS[0];
  return tier.name;
};
