import type { ReactNode } from "react";

const parseYearValue = (value: string | number | (string | number)[]): number[] => {
  const rawValues: (string | number)[] = Array.isArray(value) ? value : [value];

  const years = rawValues
    .flatMap((entry) => {
      if (typeof entry === "number") {
        return entry;
      }

      return entry
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => Number.parseInt(part, 10));
    })
    .filter((entry): entry is number => Number.isFinite(entry));

  const unique = Array.from(new Set(years));

  return unique.sort((a, b) => a - b);
};

const formatYears = (years: number[]): string => {
  if (years.length === 0) {
    return "";
  }

  if (years.length === 1) {
    return years[0].toString();
  }

  const isSequential = years.every((year, index, array) => {
    if (index === 0) {
      return true;
    }
    return year - array[index - 1] === 1;
  });

  if (isSequential) {
    return `from ${years[0]} to ${years[years.length - 1]}`;
  }

  return years.join(" · ");
};

interface YearPillProps {
  value: string | number | (string | number)[];
  className?: string;
  renderEmpty?: () => ReactNode;
}

export const YearPill = ({ value, className, renderEmpty }: YearPillProps) => {
  const years = parseYearValue(value);
  const label = formatYears(years);

  if (!label) {
    return renderEmpty ? <>{renderEmpty()}</> : null;
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
};

export default YearPill;
