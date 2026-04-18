import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ScreenLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  className?: string;
}

export function ScreenLayout({ title, onBack, children, className }: ScreenLayoutProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-6 py-6 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-200/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold ml-4 text-gray-800">{title}</h1>
      </header>

      {/* Content */}
      <main className={cn("flex-1 overflow-y-auto no-scrollbar px-6 pb-24", className)}>
        {children}
      </main>
    </div>
  );
}
