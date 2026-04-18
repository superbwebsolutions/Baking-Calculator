import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Flame } from 'lucide-react';
import { cn } from '../lib/utils';

const PRESETS = [
  { f: 275, label: 'Very Low' },
  { f: 325, label: 'Low' },
  { f: 350, label: 'Moderate' },
  { f: 375, label: 'Med-High' },
  { f: 400, label: 'High' },
  { f: 450, label: 'Very High' },
];

export function OvenTempConverter({ onBack }: { onBack: () => void }) {
  const [tempF, setTempF] = useState<number>(350);
  const [tempC, setTempC] = useState<number>(175);
  const [gasMark, setGasMark] = useState<number | string>(4);

  // Helper to calculate Gas Mark from Fahrenheit
  // Formula: Gas Mark 1 = 275°F, each mark adds 25°F.
  const calculateGas = (f: number) => {
    if (f < 225) return 0;
    if (f === 225) return 0.25; // Gas 1/4
    if (f === 250) return 0.5;  // Gas 1/2
    return Math.round((f - 250) / 25);
  };

  // Update C and Gas when F changes
  const handleFChange = (val: number) => {
    setTempF(val);
    setTempC(Math.round((val - 32) * 5 / 9));
    setGasMark(calculateGas(val));
  };

  // Update F and Gas when C changes
  const handleCChange = (val: number) => {
    setTempC(val);
    const f = Math.round((val * 9 / 5) + 32);
    setTempF(f);
    setGasMark(calculateGas(f));
  };

  // Update F and C when Gas changes
  const handleGasChange = (val: number) => {
    setGasMark(val);
    const f = Math.round((val * 25) + 250);
    setTempF(f);
    setTempC(Math.round((f - 32) * 5 / 9));
  };

  return (
    <ScreenLayout title="Oven Temperature" onBack={onBack}>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <Flame className="w-10 h-10 text-[var(--color-app-accent)] mb-6" />

        <div className="flex items-center justify-center w-full">
          {/* Fahrenheit */}
          <div className="flex flex-col items-center flex-1">
            <input
              type="number"
              value={tempF}
              onChange={(e) => handleFChange(Number(e.target.value))}
              className="text-3xl sm:text-4xl font-bold text-gray-800 bg-transparent text-center w-full focus:outline-none focus:text-[var(--color-app-accent)] transition-colors"
            />
            <span className="text-sm font-bold text-gray-400 mt-1">°F</span>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          {/* Celsius */}
          <div className="flex flex-col items-center flex-1">
            <input
              type="number"
              value={tempC}
              onChange={(e) => handleCChange(Number(e.target.value))}
              className="text-3xl sm:text-4xl font-bold text-gray-800 bg-transparent text-center w-full focus:outline-none focus:text-[var(--color-app-accent)] transition-colors"
            />
            <span className="text-sm font-bold text-gray-400 mt-1">°C</span>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          {/* Gas Mark */}
          <div className="flex flex-col items-center flex-1">
            <input
              type="number"
              step="0.5"
              value={gasMark}
              onChange={(e) => handleGasChange(Number(e.target.value))}
              className="text-3xl sm:text-4xl font-bold text-gray-800 bg-transparent text-center w-full focus:outline-none focus:text-[var(--color-app-accent)] transition-colors"
            />
            <span className="text-sm font-bold text-gray-400 mt-1">Gas</span>
          </div>
        </div>

        {/* Slider */}
        <div className="w-full mt-8 relative">
          <input 
            type="range" 
            min="200" 
            max="550" 
            step="5"
            value={tempF}
            onChange={(e) => handleFChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-app-accent)]"
          />
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-3 px-1">
            <span>200°F</span>
            <span>550°F</span>
          </div>
        </div>
      </div>

      {/* Presets */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
        Common Baking Temps
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {PRESETS.map((preset) => {
          const c = Math.round((preset.f - 32) * 5 / 9);
          const gas = calculateGas(preset.f);
          const isActive = tempF === preset.f;
          
          return (
            <button
              key={preset.f}
              onClick={() => handleFChange(preset.f)}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl transition-all border-2",
                isActive 
                  ? "border-[var(--color-app-accent)] bg-red-50" 
                  : "border-transparent bg-white shadow-sm hover:border-gray-200"
              )}
            >
              <span className={cn(
                "font-semibold",
                isActive ? "text-[var(--color-app-accent)]" : "text-gray-600"
              )}>
                {preset.label}
              </span>
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                <span className={cn("font-bold", isActive ? "text-[var(--color-app-accent)]" : "text-gray-800")}>
                  {preset.f}°F
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-bold text-gray-500">
                  {c}°C
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-bold text-gray-500">
                  Gas {gas}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </ScreenLayout>
  );
}
