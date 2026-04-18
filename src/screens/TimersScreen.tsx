import { useState } from 'react';
import { Play, Pause, RotateCcw, Trash2, Plus, X } from 'lucide-react';
import { useTimers } from '../lib/TimerContext';
import { cn } from '../lib/utils';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TimersScreen() {
  const { timers, addTimer, removeTimer, toggleTimer, resetTimer } = useTimers();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('Bake');
  const [newHours, setNewHours] = useState(0);
  const [newMinutes, setNewMinutes] = useState(30);
  const [newSeconds, setNewSeconds] = useState(0);

  const handleAdd = () => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60) + newSeconds;
    if (totalSeconds > 0) {
      addTimer(newLabel, totalSeconds);
      setShowAdd(false);
    }
  };

  const PRESETS = [
    { label: 'Autolyse', min: 30 },
    { label: 'Fold', min: 45 },
    { label: 'Proof', min: 120 },
    { label: 'Bake', min: 40 },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] p-6 overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Timers</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-[var(--color-app-accent)] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative">
          <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-gray-400">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 mb-4">New Timer</h3>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Label</label>
              <input 
                type="text" 
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block text-center">Hours</label>
              <input 
                type="number" 
                min="0"
                value={newHours}
                onChange={(e) => setNewHours(Number(e.target.value))}
                className="w-full bg-gray-50 rounded-xl p-3 text-gray-800 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block text-center">Mins</label>
              <input 
                type="number" 
                min="0"
                max="59"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-full bg-gray-50 rounded-xl p-3 text-gray-800 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block text-center">Secs</label>
              <input 
                type="number" 
                min="0"
                max="59"
                value={newSeconds}
                onChange={(e) => setNewSeconds(Number(e.target.value))}
                className="w-full bg-gray-50 rounded-xl p-3 text-gray-800 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setNewLabel(p.label); setNewHours(Math.floor(p.min / 60)); setNewMinutes(p.min % 60); setNewSeconds(0); }}
                className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
              >
                <div className="text-sm font-bold text-gray-700">{p.label}</div>
                <div className="text-xs font-medium text-gray-400">{p.min}m</div>
              </button>
            ))}
          </div>

          <button 
            onClick={handleAdd}
            className="w-full py-4 bg-[var(--color-app-accent)] text-white rounded-2xl font-bold shadow-lg shadow-red-500/20"
          >
            Start Timer
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {timers.length === 0 && !showAdd && (
          <div className="text-center py-10">
            <p className="text-gray-400 font-medium">No active timers.</p>
          </div>
        )}
        {timers.map(timer => {
          const progress = ((timer.duration - timer.remaining) / timer.duration) * 100;
          const isDone = timer.remaining === 0;

          return (
            <div key={timer.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 h-1 bg-[var(--color-app-accent)] transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
              
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-600">{timer.label}</span>
                <button onClick={() => removeTimer(timer.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={cn(
                  "text-5xl font-bold tracking-tight",
                  isDone ? "text-red-500 animate-pulse" : "text-gray-800"
                )}>
                  {formatTime(timer.remaining)}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => resetTimer(timer.id)}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toggleTimer(timer.id)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg",
                      timer.isRunning ? "bg-amber-500 shadow-amber-500/30" : "bg-[var(--color-app-accent)] shadow-red-500/30"
                    )}
                  >
                    {timer.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
