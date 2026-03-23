export const LAN = [
  "Blekinge",
  "Dalarna",
  "Gotland",
  "Gävleborg",
  "Halland",
  "Jämtland",
  "Jönköping",
  "Kalmar",
  "Kronoberg",
  "Norrbotten",
  "Skåne",
  "Stockholm",
  "Södermanland",
  "Uppsala",
  "Värmland",
  "Västerbotten",
  "Västernorrland",
  "Västmanland",
  "Västra Götaland",
  "Örebro",
  "Östergötland",
];

export const AGE_GROUPS = [
  { label: "18–25", min: 18, max: 25 },
  { label: "26–35", min: 26, max: 35 },
  { label: "36–45", min: 36, max: 45 },
  { label: "46–55", min: 46, max: 55 },
  { label: "56–65", min: 56, max: 65 },
  { label: "65+", min: 66, max: 999 },
];

export const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "kvinna", label: "Kvinna" },
  { value: "annat", label: "Annat / vill ej ange" },
];

export const PARTIES: Record<string, string> = {
  Socialdemokraterna: "#E8112d",
  Moderaterna: "#1B4F72",
  Sverigedemokraterna: "#5DADE2",
  Centerpartiet: "#27AE60",
  Vänsterpartiet: "#8B0000",
  Kristdemokraterna: "#154360",
  "Miljöpartiet de gröna": "#82E0AA",
  Liberalerna: "#85C1E9",
  "Annat parti": "#9B59B6",
  Osäker: "#F4D03F",
};

export const PARTY_LIST = Object.keys(PARTIES);

export function getAgeGroup(birthYear: number): string | null {
  const age = new Date().getFullYear() - birthYear;
  for (const g of AGE_GROUPS) {
    if (age >= g.min && age <= g.max) return g.label;
  }
  return null;
}

export function getBirthYearRange(groupLabel: string): { min: number; max: number } | null {
  const g = AGE_GROUPS.find((g) => g.label === groupLabel);
  if (!g) return null;
  const currentYear = new Date().getFullYear();
  return {
    min: currentYear - g.max,
    max: currentYear - g.min,
  };
}
