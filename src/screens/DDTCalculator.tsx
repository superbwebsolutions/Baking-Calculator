import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Thermometer, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function DDTCalculator({ onBack }: { onBack: () => void }) {
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  
  // Defaults in Fahrenheit
  const [desiredTemp, setDesiredTemp] = useState<number>(78);
  const [roomTemp, setRoomTemp] = useState<number>(72);
  const [flourTemp, setFlourTemp] = useState<number>(72);
  const [frictionFactor, setFrictionFactor] = useState<number>(24); // 24F for stand mixer, ~6F for hand

  const [mixingMethod, setMixingMethod] = useState<'machine' | 'hand'>('machine');

  // Handle mixing method change to auto-update friction factor
  const handleMethodChange = (method: 'machine' | 'hand') => {
    setMixingMethod(method);
    if (unit === 'F') {
      setFrictionFactor(method === 'machine' ? 24 : 6);
    } else {
      setFrictionFactor(method === 'machine' ? 13 : 3);
    }
  };

  // Handle unit toggle
  const toggleUnit = () => {
    if (unit === 'F') {
      setUnit('C');
      setDesiredTemp(Math.round((desiredTemp - 32) * 5 / 9));
      setRoomTemp(Math.round((roomTemp - 32) * 5 / 9));
      setFlourTemp(Math.round((flourTemp - 32) * 5 / 9));
      setFrictionFactor(mixingMethod === 'machine' ? 13 : 3);
    } else {
      setUnit('F');
      setDesiredTemp(Math.round((desiredTemp * 9 / 5) + 32));
      setRoomTemp(Math.round((roomTemp * 9 / 5) + 32));
      setFlourTemp(Math.round((flourTemp * 9 / 5) + 32));
      setFrictionFactor(mixingMethod === 'machine' ? 24 : 6);
    }
  };

  // DDT Formula: Water Temp = (Desired * 3) - (Room + Flour + Friction)
  // Note: This is for a straight dough (no preferment). 
  const waterTemp = (desiredTemp * 3) - (roomTemp + flourTemp + frictionFactor);

  return (
    <ScreenLayout title="Dough Temp (DDT)" onBack={onBack}>
      
      {/* Inputs */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 mb-6">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <span className="font-semibold text-gray-700">Desired Dough Temp</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={desiredTemp}
              onChange={(e) => setDesiredTemp(Number(e.target.value))}
              className="w-20 text-right font-bold text-xl text-[var(--color-app-accent)] bg-red-50 rounded-lg py-1 px-2 focus:outline-none"
            />
            <span className="text-gray-400 font-medium w-6">°{unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <span className="font-semibold text-gray-700">Room Temp</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={roomTemp}
              onChange={(e) => setRoomTemp(Number(e.target.value))}
              className="w-20 text-right font-bold text-xl text-gray-800 bg-gray-50 rounded-lg py-1 px-2 focus:outline-none"
            />
            <span className="text-gray-400 font-medium w-6">°{unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <span className="font-semibold text-gray-700">Flour Temp</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={flourTemp}
              onChange={(e) => setFlourTemp(Number(e.target.value))}
              className="w-20 text-right font-bold text-xl text-gray-800 bg-gray-50 rounded-lg py-1 px-2 focus:outline-none"
            />
            <span className="text-gray-400 font-medium w-6">°{unit}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700">Friction Factor</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={frictionFactor}
                onChange={(e) => setFrictionFactor(Number(e.target.value))}
                className="w-20 text-right font-bold text-xl text-gray-800 bg-gray-50 rounded-lg py-1 px-2 focus:outline-none"
              />
              <span className="text-gray-400 font-medium w-6">°{unit}</span>
            </div>
          </div>
          
          {/* Mixing Method Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleMethodChange('machine')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                mixingMethod === 'machine' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
              )}
            >
              Stand Mixer
            </button>
            <button
              onClick={() => handleMethodChange('hand')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                mixingMethod === 'hand' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
              )}
            >
              Hand Knead
            </button>
          </div>
        </div>

      </div>

      {/* Toggle & Results Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Required Water Temp
        </h3>
        <div className="flex bg-gray-200/50 rounded-lg p-0.5">
          <button
            onClick={() => { if (unit !== 'F') toggleUnit(); }}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-md transition-all",
              unit === 'F' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            °F
          </button>
          <button
            onClick={() => { if (unit !== 'C') toggleUnit(); }}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-md transition-all",
              unit === 'C' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            °C
          </button>
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-[var(--color-app-accent)] text-white rounded-3xl p-6 shadow-lg shadow-red-500/20 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
        <Thermometer className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
        <div className="text-6xl font-bold tracking-tight relative z-10">
          {waterTemp}°{unit}
        </div>
      </div>

    </ScreenLayout>
  );
}
