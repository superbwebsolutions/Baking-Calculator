import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Info } from 'lucide-react';

export function LevainCalculator({ onBack }: { onBack: () => void }) {
  const [targetWeight, setTargetWeight] = useState<string>('200');
  const [ratioStarter, setRatioStarter] = useState<string>('1');
  const [ratioFlour, setRatioFlour] = useState<string>('2');
  const [ratioWater, setRatioWater] = useState<string>('2');

  const weightNum = parseFloat(targetWeight) || 0;
  const starterNum = parseFloat(ratioStarter) || 0;
  const flourNum = parseFloat(ratioFlour) || 0;
  const waterNum = parseFloat(ratioWater) || 0;

  const totalParts = starterNum + flourNum + waterNum;
  const partWeight = totalParts > 0 ? weightNum / totalParts : 0;

  const starterWeight = partWeight * starterNum;
  const flourWeight = partWeight * flourNum;
  const waterWeight = partWeight * waterNum;

  return (
    <ScreenLayout title="Levain Calculator" onBack={onBack}>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Target Levain Weight (g)</label>
          <input 
            type="number" 
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full text-4xl font-bold text-gray-800 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
          />
        </div>

        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 block">Feeding Ratio</label>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <div className="text-xs text-gray-400 font-medium mb-1 text-center">Starter</div>
            <input 
              type="number" 
              value={ratioStarter}
              onChange={(e) => setRatioStarter(e.target.value)}
              className="w-full text-xl font-bold text-center text-gray-800 bg-gray-50 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
            />
          </div>
          <div className="text-2xl font-bold text-gray-300 mt-4">:</div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 font-medium mb-1 text-center">Flour</div>
            <input 
              type="number" 
              value={ratioFlour}
              onChange={(e) => setRatioFlour(e.target.value)}
              className="w-full text-xl font-bold text-center text-gray-800 bg-gray-50 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
            />
          </div>
          <div className="text-2xl font-bold text-gray-300 mt-4">:</div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 font-medium mb-1 text-center">Water</div>
            <input 
              type="number" 
              value={ratioWater}
              onChange={(e) => setRatioWater(e.target.value)}
              className="w-full text-xl font-bold text-center text-gray-800 bg-gray-50 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
            />
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-800 mb-3 px-2">Required Amounts</h3>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="divide-y divide-gray-50">
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-gray-700">Mature Starter</span>
            <span className="text-xl font-bold text-[var(--color-app-accent)]">{starterWeight.toFixed(1)}g</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-gray-700">Flour</span>
            <span className="text-xl font-bold text-[var(--color-app-accent)]">{flourWeight.toFixed(1)}g</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-gray-700">Water</span>
            <span className="text-xl font-bold text-[var(--color-app-accent)]">{waterWeight.toFixed(1)}g</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 font-medium leading-relaxed">
          A 1:2:2 ratio means 1 part starter, 2 parts flour, and 2 parts water. Higher ratios (like 1:5:5) take longer to peak, which is useful for overnight builds.
        </p>
      </div>
    </ScreenLayout>
  );
}
