import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, ArrowLeft, Trash2, Scale, BookOpen, Edit2 } from 'lucide-react';
import { useRecipes, Recipe, RecipeIngredient, DEFAULT_RECIPES } from '../lib/RecipeContext';
import { IngredientSelect } from '../components/IngredientSelect';
import { UNITS } from '../lib/bakingData';

export function RecipesScreen({ onScaleRecipe }: { onScaleRecipe: (recipe: Recipe) => void }) {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateNew = () => {
    setEditingRecipe({
      id: '',
      name: '',
      yieldAmount: '1 batch',
      ingredients: [{ id: Math.random().toString(36).substr(2, 9), amount: '1', unit: 'cup', name: '' }]
    });
    setView('edit');
    setShowAddMenu(false);
  };

  const handleAddDefault = (defaultRecipe: Recipe) => {
    // Create a copy with a new ID
    const newRecipe = {
      ...defaultRecipe,
      id: '', // Will be assigned in addRecipe
      ingredients: defaultRecipe.ingredients.map(ing => ({ ...ing, id: Math.random().toString(36).substr(2, 9) }))
    };
    setEditingRecipe(newRecipe);
    setView('edit');
    setShowAddMenu(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setView('edit');
  };

  const handleSave = () => {
    if (!editingRecipe) return;
    if (editingRecipe.id) {
      updateRecipe(editingRecipe.id, editingRecipe);
    } else {
      addRecipe(editingRecipe);
    }
    setView('list');
  };

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: string) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    });
  };

  const addIngredient = () => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, { id: Math.random().toString(36).substr(2, 9), amount: '', unit: 'cup', name: '' }]
    });
  };

  const removeIngredient = (id: string) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter(ing => ing.id !== id)
    });
  };

  if (view === 'edit' && editingRecipe) {
    return (
      <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] overflow-y-auto no-scrollbar pb-32">
        <div className="sticky top-0 bg-[var(--color-app-bg)]/90 backdrop-blur-md z-10 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView('list')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-[var(--color-app-accent)] text-white rounded-xl font-bold shadow-sm">
            Save
          </button>
        </div>

        <div className="px-6">
          <input 
            type="text"
            value={editingRecipe.name}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
            className="w-full text-3xl font-bold text-gray-800 bg-transparent focus:outline-none mb-2"
            placeholder="Recipe Name"
            autoFocus
          />
          <div className="flex items-center gap-2 mb-8">
            <span className="text-gray-400 font-medium">Yield:</span>
            <input 
              type="text"
              value={editingRecipe.yieldAmount}
              onChange={(e) => setEditingRecipe({ ...editingRecipe, yieldAmount: e.target.value })}
              className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
              placeholder="e.g. 12 cookies"
            />
          </div>

          <h3 className="text-sm font-bold text-gray-800 mb-3">Ingredients</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="divide-y divide-gray-50">
              {editingRecipe.ingredients.map((ing) => (
                <div key={ing.id} className="p-4 flex flex-col gap-2">
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
                    <button 
                      onClick={() => removeIngredient(ing.id)}
                      className="p-2 text-gray-300 hover:text-red-500 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <IngredientSelect 
                    value={ing.name}
                    onChange={(val) => updateIngredient(ing.id, 'name', val)}
                    placeholder="Ingredient Name"
                    className="w-full bg-gray-50 rounded-lg py-2 pl-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={addIngredient}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mb-8"
          >
            <Plus className="w-5 h-5" />
            Add Ingredient
          </button>

          {editingRecipe.id && (
            <button 
              onClick={() => { deleteRecipe(editingRecipe.id); setView('list'); }}
              className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Recipe
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] p-6 overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Recipes</h2>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-10 h-10 bg-[var(--color-app-accent)] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95"
          >
            <Plus className={`w-6 h-6 transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
          </button>
          
          {showAddMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-20 py-2">
              <button
                onClick={handleCreateNew}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 text-[var(--color-app-accent)] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Blank Recipe</div>
                  <div className="text-xs text-gray-500">Create a custom recipe</div>
                </div>
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Templates</div>
              
              {DEFAULT_RECIPES.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleAddDefault(recipe)}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-gray-700 text-sm truncate">
                    {recipe.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {recipes.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 font-medium">No saved recipes yet.</p>
          </div>
        )}
        {recipes.map(recipe => {
          const isExpanded = expandedRecipeId === recipe.id;
          return (
            <div key={recipe.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 transition-all">
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{recipe.name}</h3>
                  <p className="text-sm text-gray-400">Yield: {recipe.yieldAmount} • {recipe.ingredients.length} ingredients</p>
                </div>
                <button 
                  className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-app-accent)]"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-6 space-y-2">
                    {recipe.ingredients.map(ing => {
                      const unitObj = UNITS.find(u => u.id === ing.unit);
                      const unitDisplay = unitObj ? unitObj.short : ing.unit;
                      return (
                        <div key={ing.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{ing.name || 'Unnamed Ingredient'}</span>
                          <span className="font-medium text-gray-800">{ing.amount} {unitDisplay}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(recipe); }}
                      className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onScaleRecipe(recipe); }}
                      className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Scale className="w-4 h-4" />
                      Scale
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if(window.confirm('Are you sure you want to delete this recipe?')) {
                          deleteRecipe(recipe.id); 
                        }
                      }}
                      className="py-2.5 px-4 bg-gray-50 text-red-500 rounded-xl font-bold flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
