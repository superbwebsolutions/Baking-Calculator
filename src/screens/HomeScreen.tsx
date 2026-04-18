import { ChevronRight } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screenId: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const tools = [
    { 
      id: 'converter', 
      name: 'Ingredient Converter', 
      iconUrl: '/icons/scale.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'scaler', 
      name: 'Recipe Scaler', 
      iconUrl: '/icons/pie-chart.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'bakers_math', 
      name: 'Baker\'s Percentage', 
      iconUrl: '/icons/percentage.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'levain', 
      name: 'Levain Calculator', 
      iconUrl: '/icons/test-tube.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'ddt', 
      name: 'Dough Temp (DDT)', 
      iconUrl: '/icons/thermometer.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'yeast', 
      name: 'Yeast Converter', 
      iconUrl: '/icons/yeast.png',
      bg: 'bg-[#F8F9FA]' 
    },
    { 
      id: 'oven', 
      name: 'Oven Temperature', 
      iconUrl: '/icons/oven.png',
      bg: 'bg-[#F8F9FA]' 
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] px-6 pt-12 pb-24 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 text-left w-full"
          >
            <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center p-2.5`}>
              <img 
                src={tool.iconUrl} 
                alt={tool.name}
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-lg font-bold text-gray-800 flex-1">
              {tool.name}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
