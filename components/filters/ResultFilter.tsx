"use client";
import { AGE_GROUPS, GENDER_OPTIONS, LAN } from "@/lib/constants";

export interface FilterState {
  ageGroup: string;
  gender: string;
  lan: string;
}

interface Props {
  value: FilterState;
  onChange: (f: FilterState) => void;
  availableAgeGroups?: string[];
  availableGenders?: string[];
  availableLan?: string[];
  compact?: boolean;
}

export default function ResultFilter({
  value,
  onChange,
  availableAgeGroups,
  availableGenders,
  availableLan,
  compact = false,
}: Props) {
  const ageGroups = availableAgeGroups ?? AGE_GROUPS.map(g => g.label);
  const genders = availableGenders ?? GENDER_OPTIONS.map(g => g.value);
  const lans = availableLan ?? LAN;

  const genderLabel = (v: string) => GENDER_OPTIONS.find(g => g.value === v)?.label ?? v;

  const cls = compact
    ? "border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
    : "input text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {/* Age */}
      <select
        className={cls}
        value={value.ageGroup}
        onChange={e => onChange({ ...value, ageGroup: e.target.value })}
      >
        <option value="">Alla åldrar</option>
        {ageGroups.map(g => (
          <option key={g} value={g}>{g} år</option>
        ))}
      </select>

      {/* Gender */}
      <select
        className={cls}
        value={value.gender}
        onChange={e => onChange({ ...value, gender: e.target.value })}
      >
        <option value="">Alla kön</option>
        {genders.map(g => (
          <option key={g} value={g}>{genderLabel(g)}</option>
        ))}
      </select>

      {/* Lan */}
      <select
        className={cls}
        value={value.lan}
        onChange={e => onChange({ ...value, lan: e.target.value })}
      >
        <option value="">Alla län</option>
        {lans.map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {(value.ageGroup || value.gender || value.lan) && (
        <button
          onClick={() => onChange({ ageGroup: "", gender: "", lan: "" })}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded-lg bg-red-50"
        >
          Rensa filter
        </button>
      )}
    </div>
  );
}
