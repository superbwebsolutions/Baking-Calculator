import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Droplets, ChevronDown } from 'lucide-react';
import { cn, decimalToFraction } from '../lib/utils';

const YEAST_TYPES = [
  { id: 'fresh', name: 'Fresh Yeast (Cake)', ratio: 1.0 },
  { id: 'ady', name: 'Active Dry Yeast (ADY)', ratio: 0.4 },
  { id: 'instant', name: 'Instant Yeast', ratio: 0.33 },
];

const YEAST_UNITS = [
  { id: 'tsp', name: 'tsp' },
  { id: 'tbsp', name: 'tbsp' },
  { id: 'g', name: 'grams' },
  { id: 'oz', name: 'oz' },
];

export function YeastConverter({ onBack }: { onBack: () => void }) {
  const [inputAmount, setInputAmount] = useState<string>('2.25');
  const [inputType, setInputType] = useState('ady'); // Default to ADY for US
  const [unit, setUnit] = useState('tsp'); // Default to tsp for US
  const [numberFormat, setNumberFormat] = useState<'fraction' | 'decimal'>('fraction');

  const amountNum = parseFloat(inputAmount) || 0;
  const inputRatio = YEAST_TYPES.find(y => y.id === inputType)?.ratio || 1;

  // Calculate base amount (Fresh Yeast equivalent)
  const baseAmount = amountNum / inputRatio;

  return (
    <ScreenLayout title="Yeast Converter" onBack={onBack}>
      
      {/* Input Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
          I have this recipe amount:
        </label>
        
        <div className="flex items-center gap-3 mb-5">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="w-1/2 text-3xl font-bold text-gray-800 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
            placeholder="0"
          />
          <div className="relative w-1/2">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full appearance-none bg-gray-50 rounded-2xl py-4 pl-4 pr-10 text-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
            >
              {YEAST_UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {YEAST_TYPES.map(yeast => (
            <button
              key={yeast.id}
              onClick={() => setInputType(yeast.id)}
              className={cn(
                "py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 text-left flex items-center justify-between",
                inputType === yeast.id 
                  ? "border-[var(--color-app-accent)] bg-red-50 text-[var(--color-app-accent)]" 
                  : "border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {yeast.name}
              {inputType === yeast.id && <Droplets className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section Header & Toggle */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Equivalent Amounts
        </h3>
        
        {/* Format Toggle */}
        <div className="flex bg-gray-200/50 rounded-lg p-0.5">
          <button
            onClick={() => setNumberFormat('fraction')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-md transition-all",
              numberFormat === 'fraction' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            Fraction
          </button>
          <button
            onClick={() => setNumberFormat('decimal')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-md transition-all",
              numberFormat === 'decimal' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            Decimal
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {YEAST_TYPES.filter(y => y.id !== inputType).map(yeast => {
            const result = baseAmount * yeast.ratio;
            
            const displayResult = numberFormat === 'fraction' && (unit === 'tsp' || unit === 'tbsp' || unit === 'oz')
              ? decimalToFraction(result)
              : parseFloat(result.toFixed(2)).toString();

            return (
              <div key={yeast.id} className="p-5 flex items-center justify-between">
                <span className="font-semibold text-gray-700">{yeast.name}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-[var(--color-app-accent)]">{displayResult}</span>
                  <span className="text-gray-400 font-medium">{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </ScreenLayout>
  );
}
