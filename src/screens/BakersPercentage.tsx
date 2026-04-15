import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { IngredientSelect } from '../components/IngredientSelect';
import { useRecipes } from '../lib/RecipeContext';
import { INGREDIENTS, convertIngredient, UNITS } from '../lib/bakingData';

interface IngredientRow {
  id: string;
  name: string;
  weight: number; // in grams
}

export function BakersPercentage({ onBack }: { onBack: () => void }) {
  const { recipes } = useRecipes();
  const [flours, setFlours] = useState<IngredientRow[]>([
    { id: 'f1', name: 'Bread Flour', weight: 800 },
    { id: 'f2', name: 'Whole Wheat Flour', weight: 200 },
  ]);
  
  const [others, setOthers] = useState<IngredientRow[]>([
    { id: 'o1', name: 'Water', weight: 750 },
    { id: 'o2', name: 'Salt', weight: 20 },
    { id: 'o3', name: 'Yeast', weight: 10 },
  ]);

  const totalFlourWeight = flours.reduce((sum, i) => sum + i.weight, 0);
  const totalOtherWeight = others.reduce((sum, i) => sum + i.weight, 0);
  const totalDoughWeight = totalFlourWeight + totalOtherWeight;

  const updateItem = (list: 'flours'|'others', id: string, field: keyof IngredientRow, value: any) => {
    const setter = list === 'flours' ? setFlours : setOthers;
    setter(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const addItem = (list: 'flours'|'others') => {
    const setter = list === 'flours' ? setFlours : setOthers;
    setter(prev => [...prev, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: list === 'flours' ? 'New Flour' : 'New Ingredient', 
      weight: 0 
    }]);
  };

  const removeItem = (list: 'flours'|'others', id: string) => {
    const setter = list === 'flours' ? setFlours : setOthers;
    setter(prev => prev.filter(ing => ing.id !== id));
  };

  const handleLoadRecipe = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newFlours: IngredientRow[] = [];
    const newOthers: IngredientRow[] = [];

    recipe.ingredients.forEach(ing => {
      const knownIng = INGREDIENTS.find(i => i.name === ing.name || i.id === ing.name);
      const isFlour = knownIng?.category === 'Flours & Starches' || ing.name.toLowerCase().includes('flour');
      
      // Try to convert to grams
      let weightInGrams = parseFloat(ing.amount) || 0;
      const unitLower = ing.unit.toLowerCase();
      
      if (unitLower !== 'g' && unitLower !== 'grams' && unitLower !== 'gram') {
        // Try to find the unit in our UNITS array
        const knownUnit = UNITS.find(u => u.id === unitLower || u.short === unitLower || u.name.toLowerCase() === unitLower);
        if (knownUnit && knownIng) {
          weightInGrams = convertIngredient(weightInGrams, knownUnit.id, 'g', knownIng.id);
        }
      }

      const newRow = {
        id: Math.random().toString(36).substr(2, 9),
        name: ing.name,
        weight: Math.round(weightInGrams)
      };

      if (isFlour) newFlours.push(newRow);
      else newOthers.push(newRow);
    });

    setFlours(newFlours.length > 0 ? newFlours : [{ id: 'f1', name: 'Flour', weight: 0 }]);
    setOthers(newOthers);
  };

  const renderRow = (ing: IngredientRow, list: 'flours'|'others') => {
    const percentage = totalFlourWeight > 0 
      ? ((ing.weight / totalFlourWeight) * 100).toFixed(1) 
      : '0.0';

    return (
      <div key={ing.id} className="flex items-center px-4 py-2 gap-2 group border-b border-gray-50 last:border-0">
        <IngredientSelect
          value={ing.name}
          onChange={(val) => updateItem(list, ing.id, 'name', val)}
          placeholder="Ingredient Name"
          className="flex-1 font-semibold text-gray-800 bg-transparent focus:outline-none focus:border-b border-[var(--color-app-accent)]"
        />
        
        <input
          type="number"
          value={ing.weight || ''}
          onChange={(e) => updateItem(list, ing.id, 'weight', Number(e.target.value))}
          className="w-16 text-right font-bold text-gray-800 bg-gray-100 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
          placeholder="0"
        />
        <span className="text-xs text-gray-400 w-3">g</span>
        
        <div className="w-16 text-right font-bold text-[var(--color-app-accent)]">
          {percentage}%
        </div>

        <button 
          onClick={() => removeItem(list, ing.id)}
          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors ml-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <ScreenLayout title="Baker's Percentage" onBack={onBack}>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--color-app-accent)] text-white rounded-2xl p-3 shadow-md shadow-red-500/20">
          <div className="text-xs font-medium opacity-90 mb-1">Total Flour (100%)</div>
          <div className="text-xl font-bold">{totalFlourWeight}g</div>
        </div>
        <div className="bg-white text-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Total Dough</div>
          <div className="text-xl font-bold">{totalDoughWeight}g</div>
        </div>
      </div>

      {/* Load Recipe Dropdown */}
      {recipes.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <select
              onChange={(e) => {
                handleLoadRecipe(e.target.value);
                e.target.value = "";
              }}
              className="appearance-none bg-[var(--color-app-accent)]/10 text-[var(--color-app-accent)] text-sm font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>Load Recipe...</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-app-accent)] pointer-events-none" />
          </div>
        </div>
      )}

      {/* Flours Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flours</span>
          <button onClick={() => addItem('flours')} className="text-[var(--color-app-accent)] flex items-center gap-1 text-xs font-bold uppercase">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="flex flex-col">
          {flours.map(f => renderRow(f, 'flours'))}
        </div>
      </div>

      {/* Other Ingredients Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Other Ingredients</span>
          <button onClick={() => addItem('others')} className="text-[var(--color-app-accent)] flex items-center gap-1 text-xs font-bold uppercase">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="flex flex-col">
          {others.map(o => renderRow(o, 'others'))}
        </div>
      </div>

    </ScreenLayout>
  );
}
