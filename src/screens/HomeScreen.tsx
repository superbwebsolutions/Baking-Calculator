import { Box, Scale, Thermometer, PieChart, Percent, Droplets, Beaker } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screenId: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const tools = [
    { id: 'converter', name: 'Ingredient Converter', icon: Box, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'scaler', name: 'Recipe Scaler', icon: PieChart, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'bakers_math', name: 'Baker\'s Percentage', icon: Percent, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'levain', name: 'Levain Calculator', icon: Beaker, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'ddt', name: 'Dough Temp (DDT)', icon: Thermometer, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'yeast', name: 'Yeast Converter', icon: Droplets, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'oven', name: 'Oven Temperature', icon: Scale, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] px-6 pt-12 pb-24 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all active:scale-95"
            >
              <div className={`p-4 rounded-2xl ${tool.bg}`}>
                <Icon className={`w-8 h-8 ${tool.color}`} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
