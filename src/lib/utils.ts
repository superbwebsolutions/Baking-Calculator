export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function decimalToFraction(value: number): string {
  if (!value || isNaN(value)) return '0';
  if (value === 0) return '0';
  
  const whole = Math.floor(value);
  const decimal = value - whole;

  // If it's practically a whole number
  if (decimal < 0.05) return whole > 0 ? whole.toString() : '0';
  // If it's practically the next whole number
  if (decimal > 0.95) return (whole + 1).toString();

  // Standard baking fractions
  const fractions = [
    { val: 1/8, text: '1/8' },
    { val: 1/4, text: '1/4' },
    { val: 1/3, text: '1/3' },
    { val: 3/8, text: '3/8' },
    { val: 1/2, text: '1/2' },
    { val: 5/8, text: '5/8' },
    { val: 2/3, text: '2/3' },
    { val: 3/4, text: '3/4' },
    { val: 7/8, text: '7/8' },
  ];

  let closest = fractions[0];
  let minDiff = Math.abs(decimal - fractions[0].val);

  for (let i = 1; i < fractions.length; i++) {
    const diff = Math.abs(decimal - fractions[i].val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = fractions[i];
    }
  }

  // If it doesn't cleanly map to a standard baking fraction (diff > 0.06), fallback to decimal
  if (minDiff > 0.06) {
    return parseFloat(value.toFixed(2)).toString();
  }

  if (whole > 0) {
    return `${whole} ${closest.text}`;
  }
  return closest.text;
}
