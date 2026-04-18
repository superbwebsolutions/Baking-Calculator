import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BakingTimer {
  id: string;
  label: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
}

interface TimerContextType {
  timers: BakingTimer[];
  addTimer: (label: string, duration: number) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<BakingTimer[]>(() => {
    const saved = localStorage.getItem('baking_timers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'default1', label: 'Autolyse', duration: 1800, remaining: 1800, isRunning: false },
      { id: 'default2', label: 'Bake', duration: 2700, remaining: 2700, isRunning: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('baking_timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isRunning && timer.remaining > 0) {
          return { ...timer, remaining: timer.remaining - 1 };
        }
        if (timer.isRunning && timer.remaining === 0) {
          return { ...timer, isRunning: false };
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = (label: string, duration: number) => {
    setTimers(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      label,
      duration,
      remaining: duration,
      isRunning: true
    }]);
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: !t.isRunning && t.remaining > 0 } : t
    ));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t
    ));
  };

  return (
    <TimerContext.Provider value={{ timers, addTimer, removeTimer, toggleTimer, resetTimer }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimers must be used within TimerProvider');
  return context;
}
