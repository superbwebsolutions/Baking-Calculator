import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Calculator, Timer, BookOpen } from 'lucide-react';
import { HomeScreen } from './screens/HomeScreen';
import { IngredientConverter } from './screens/IngredientConverter';
import { RecipeScaler } from './screens/RecipeScaler';
import { BakersPercentage } from './screens/BakersPercentage';
import { DDTCalculator } from './screens/DDTCalculator';
import { YeastConverter } from './screens/YeastConverter';
import { OvenTempConverter } from './screens/OvenTempConverter';
import { LevainCalculator } from './screens/LevainCalculator';
import { TimersScreen } from './screens/TimersScreen';
import { RecipesScreen } from './screens/RecipesScreen';
import { TimerProvider } from './lib/TimerContext';
import { RecipeProvider, Recipe } from './lib/RecipeContext';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [recipeToScale, setRecipeToScale] = useState<Recipe | null>(null);

  const handleNavigate = (screenId: string) => {
    setActiveScreen(screenId);
  };

  const handleBack = () => {
    setActiveScreen(null);
  };

  const handleScaleRecipe = (recipe: Recipe) => {
    setRecipeToScale(recipe);
    setActiveScreen('scaler');
    setActiveTab('home');
  };

  // Render the appropriate screen based on state
  const renderScreen = () => {
    if (activeScreen === 'converter') return <IngredientConverter onBack={handleBack} />;
    if (activeScreen === 'scaler') return <RecipeScaler key={recipeToScale?.id || 'default'} onBack={handleBack} initialRecipe={recipeToScale} onNavigateToRecipes={() => { setActiveScreen(null); setActiveTab('recipes'); }} />;
    if (activeScreen === 'bakers_math') return <BakersPercentage onBack={handleBack} />;
    if (activeScreen === 'ddt') return <DDTCalculator onBack={handleBack} />;
    if (activeScreen === 'yeast') return <YeastConverter onBack={handleBack} />;
    if (activeScreen === 'oven') return <OvenTempConverter onBack={handleBack} />;
    if (activeScreen === 'levain') return <LevainCalculator onBack={handleBack} />;
    
    // Placeholder for other screens
    if (activeScreen) {
      return (
        <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-gray-500 text-center mb-8">This calculator is currently under development.</p>
          <button 
            onClick={handleBack}
            className="bg-[var(--color-app-accent)] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-500/30"
          >
            Go Back
          </button>
        </div>
      );
    }

    // Tabs
    if (activeTab === 'home') return <HomeScreen onNavigate={handleNavigate} />;
    if (activeTab === 'timers') return <TimersScreen />;
    if (activeTab === 'recipes') return <RecipesScreen onScaleRecipe={handleScaleRecipe} />;
    
    return null;
  };

  return (
    <TimerProvider>
      <RecipeProvider>
        <div className="relative w-full h-screen max-w-md mx-auto bg-[var(--color-app-bg)] overflow-hidden shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-10 sm:border-[8px] sm:border-gray-900">
          
          {/* Screen Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen || activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 pb-6 z-50">
            <div className="flex justify-between items-center">
              <NavButton 
                icon={Home} 
                label="Home" 
                isActive={activeTab === 'home' && !activeScreen} 
                onClick={() => { setActiveTab('home'); setActiveScreen(null); }} 
              />
              <NavButton 
                icon={Calculator} 
                label="Convert" 
                isActive={activeScreen === 'converter'} 
                onClick={() => { setActiveTab('home'); setActiveScreen('converter'); }} 
              />
              <NavButton 
                icon={Timer} 
                label="Timers" 
                isActive={activeTab === 'timers'} 
                onClick={() => { setActiveTab('timers'); setActiveScreen(null); }} 
              />
              <NavButton 
                icon={BookOpen} 
                label="Recipes" 
                isActive={activeTab === 'recipes'} 
                onClick={() => { setActiveTab('recipes'); setActiveScreen(null); }} 
              />
            </div>
          </div>
        </div>
      </RecipeProvider>
    </TimerProvider>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center w-16 gap-1"
    >
      <Icon 
        className={cn(
          "w-6 h-6 transition-colors duration-200",
          isActive ? "text-[var(--color-app-accent)]" : "text-gray-400"
        )} 
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span 
        className={cn(
          "text-[10px] font-semibold transition-colors duration-200",
          isActive ? "text-[var(--color-app-accent)]" : "text-gray-400"
        )}
      >
        {label}
      </span>
    </button>
  );
}
