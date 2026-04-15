import { useState, useEffect } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { PAN_SHAPES, calculatePanArea, UNITS } from '../lib/bakingData';
import { ArrowRight, Plus, Trash2, BookOpen } from 'lucide-react';
import { cn, decimalToFraction } from '../lib/utils';
import { Recipe, RecipeIngredient, useRecipes } from '../lib/RecipeContext';
import { IngredientSelect } from '../components/IngredientSelect';

export function RecipeScaler({ onBack, initialRecipe, onNavigateToRecipes }: { onBack: () => void, initialRecipe?: Recipe | null, onNavigateToRecipes: () => void }) {
  const { recipes } = useRecipes();
  const [mode, setMode] = useState<'servings' | 'pan'>('servings');
  
  // Servings State
  const [originalServings, setOriginalServings] = useState(4);
  const [newServings, setNewServings] = useState(8);

  // Pan State
  const [origPanShape, setOrigPanShape] = useState('round');
  const [origPanDim1, setOrigPanDim1] = useState(8);
  const [origPanDim2, setOrigPanDim2] = useState(8);

  const [newPanShape, setNewPanShape] = useState('square');
  const [newPanDim1, setNewPanDim1] = useState(9);
  const [newPanDim2, setNewPanDim2] = useState(9);

  // Ingredients State
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients || [
      { id: '1', amount: '2', unit: 'cups', name: 'All-Purpose Flour' },
      { id: '2', amount: '0.5', unit: 'cup', name: 'Granulated Sugar' },
      { id: '3', amount: '100', unit: 'g', name: 'Butter' },
    ]
  );

  // Format State
  const [numberFormat, setNumberFormat] = useState<'fraction' | 'decimal'>('fraction');

  // Calculate Multiplier
  let multiplier = 1;
  if (mode === 'servings') {
    multiplier = newServings / (originalServings || 1);
  } else {
    const origArea = calculatePanArea(origPanShape, origPanDim1, origPanDim2);
    const newArea = calculatePanArea(newPanShape, newPanDim1, newPanDim2);
    multiplier = origArea > 0 ? newArea / origArea : 1;
  }

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { 
      id: Math.random().toString(36).substr(2, 9), 
      amount: '', 
      unit: 'cup', 
      name: '' 
    }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  return (
    <ScreenLayout title="Recipe Scaler" onBack={onBack}>
      
      {/* Mode Toggle */}
      <div className="flex bg-gray-200/50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode('servings')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === 'servings' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
          )}
        >
          By Servings
        </button>
        <button
          onClick={() => setMode('pan')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === 'pan' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
          )}
        >
          By Pan Size
        </button>
      </div>

      {/* Scaler Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        {mode === 'servings' ? (
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-4 font-medium">Adjust Servings</span>
            <div className="flex items-center justify-center gap-6">
              <input 
                type="number" 
                value={originalServings}
                onChange={(e) => setOriginalServings(Number(e.target.value))}
                className="w-16 text-4xl font-bold text-center text-gray-800 bg-gray-50 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
              <ArrowRight className="w-6 h-6 text-[var(--color-app-accent)]" />
              <input 
                type="number" 
                value={newServings}
                onChange={(e) => setNewServings(Number(e.target.value))}
                className="w-16 text-4xl font-bold text-center text-[var(--color-app-accent)] bg-red-50 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Original Pan */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Original Pan</label>
                <select 
                  value={origPanShape} 
                  onChange={(e) => setOrigPanShape(e.target.value)}
                  className="w-full bg-gray-50 rounded-lg p-2 text-sm font-medium text-gray-700 focus:outline-none"
                >
                  {PAN_SHAPES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-16">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Size (in)</label>
                  <input 
                    type="number" 
                    value={origPanDim1} 
                    onChange={(e) => setOrigPanDim1(Number(e.target.value))}
                    className="w-full bg-gray-50 rounded-lg p-2 text-sm font-medium text-center text-gray-800 focus:outline-none"
                  />
                </div>
                {['rectangle', 'loaf', 'oval'].includes(origPanShape) && (
                  <>
                    <div className="pb-2 text-gray-400 font-bold text-sm">×</div>
                    <div className="w-16">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">&nbsp;</label>
                      <input 
                        type="number" 
                        value={origPanDim2} 
                        onChange={(e) => setOrigPanDim2(Number(e.target.value))}
                        className="w-full bg-gray-50 rounded-lg p-2 text-sm font-medium text-center text-gray-800 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-[var(--color-app-accent)] rotate-90" />
            </div>

            {/* New Pan */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">New Pan</label>
                <select 
                  value={newPanShape} 
                  onChange={(e) => setNewPanShape(e.target.value)}
                  className="w-full bg-red-50 rounded-lg p-2 text-sm font-medium text-[var(--color-app-accent)] focus:outline-none"
                >
                  {PAN_SHAPES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-16">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Size (in)</label>
                  <input 
                    type="number" 
                    value={newPanDim1} 
                    onChange={(e) => setNewPanDim1(Number(e.target.value))}
                    className="w-full bg-red-50 rounded-lg p-2 text-sm font-medium text-center text-[var(--color-app-accent)] focus:outline-none"
                  />
                </div>
                {['rectangle', 'loaf', 'oval'].includes(newPanShape) && (
                  <>
                    <div className="pb-2 text-gray-400 font-bold text-sm">×</div>
                    <div className="w-16">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">&nbsp;</label>
                      <input 
                        type="number" 
                        value={newPanDim2} 
                        onChange={(e) => setNewPanDim2(Number(e.target.value))}
                        className="w-full bg-red-50 rounded-lg p-2 text-sm font-medium text-center text-[var(--color-app-accent)] focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-500 font-medium">Scaling Factor:</span>
          <span className="text-xl font-bold text-[var(--color-app-accent)]">{multiplier.toFixed(2)}x</span>
        </div>
      </div>

      {/* Ingredients List Header */}
      <div className="flex flex-col gap-3 mb-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Ingredients</h3>
          
          {/* Fraction / Decimal Toggle */}
          <div className="flex bg-gray-200/50 rounded-lg p-0.5">
            <button
              onClick={() => setNumberFormat('fraction')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                numberFormat === 'fraction' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
              )}
            >
              Fraction
            </button>
            <button
              onClick={() => setNumberFormat('decimal')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                numberFormat === 'decimal' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
              )}
            >
              Decimal
            </button>
          </div>
        </div>
        
        {/* Load Recipe Dropdown */}
        <div className="relative w-full">
          <select
            onChange={(e) => {
              if (e.target.value === 'add_new') {
                onNavigateToRecipes();
                return;
              }
              const recipe = recipes.find(r => r.id === e.target.value);
              if (recipe) {
                setIngredients(recipe.ingredients.map(ing => ({ ...ing, id: Math.random().toString(36).substr(2, 9) })));
              }
              e.target.value = "";
            }}
            className="w-full appearance-none bg-[var(--color-app-accent)]/10 text-[var(--color-app-accent)] text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Load Recipe...</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
            <option value="add_new">+ Add New Recipe</option>
          </select>
          <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-app-accent)] pointer-events-none" />
        </div>
      </div>

      {/* Editable Ingredients List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="divide-y divide-gray-50">
          {ingredients.map((ing) => {
            const amountNum = parseFloat(ing.amount);
            const scaledAmount = isNaN(amountNum) ? 0 : amountNum * multiplier;
            
            const displayScaled = numberFormat === 'fraction' 
              ? decimalToFraction(scaledAmount)
              : parseFloat(scaledAmount.toFixed(2)).toString();

            return (
              <div key={ing.id} className="p-4 flex flex-col gap-3">
                {/* Input Row */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
                    placeholder="Qty"
                    className="w-16 bg-gray-50 rounded-lg py-2 px-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                    className="w-24 bg-gray-50 rounded-lg py-2 px-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)] appearance-none"
                  >
                    {UNITS.map(u => <option key={u.id} value={u.id}>{u.short}</option>)}
                  </select>
                  <IngredientSelect
                    value={ing.name}
                    onChange={(val) => updateIngredient(ing.id, 'name', val)}
                    placeholder="Ingredient Name"
                    className="flex-1 bg-gray-50 rounded-lg py-2 pl-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
                  />
                  <button 
                    onClick={() => removeIngredient(ing.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Scaled Result Row */}
                <div className="flex items-center justify-between pl-2 pr-10">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Scaled</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[var(--color-app-accent)]">
                      {scaledAmount > 0 ? displayScaled : '-'}
                    </span>
                    <span className="text-sm font-medium text-gray-600">{ing.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Button */}
      <button 
        onClick={addIngredient}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Ingredient
      </button>

    </ScreenLayout>
  );
}
