export function decimalToFraction(value: number): string {
  if (!value || Number.isNaN(value)) return "0";
  if (value === 0) return "0";

  const whole = Math.floor(value);
  const decimal = value - whole;

  if (decimal < 0.05) return whole > 0 ? whole.toString() : "0";
  if (decimal > 0.95) return (whole + 1).toString();

  const fractions = [
    { val: 1 / 8, text: "1/8" },
    { val: 1 / 4, text: "1/4" },
    { val: 1 / 3, text: "1/3" },
    { val: 3 / 8, text: "3/8" },
    { val: 1 / 2, text: "1/2" },
    { val: 5 / 8, text: "5/8" },
    { val: 2 / 3, text: "2/3" },
    { val: 3 / 4, text: "3/4" },
    { val: 7 / 8, text: "7/8" },
  ];

  let closest = fractions[0];
  let minDiff = Math.abs(decimal - fractions[0].val);

  for (let index = 1; index < fractions.length; index += 1) {
    const diff = Math.abs(decimal - fractions[index].val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = fractions[index];
    }
  }

  if (minDiff > 0.06) {
    return parseFloat(value.toFixed(2)).toString();
  }

  return whole > 0 ? `${whole} ${closest.text}` : closest.text;
}

export function createId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function parseNumber(value: string | number, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
