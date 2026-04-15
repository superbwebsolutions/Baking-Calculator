import { useState } from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { INGREDIENTS, UNITS, convertIngredient } from '../lib/bakingData';
import { ArrowDownUp, ChevronDown } from 'lucide-react';
import { IngredientSelect } from '../components/IngredientSelect';

export function IngredientConverter({ onBack }: { onBack: () => void }) {
  const [ingredientName, setIngredientName] = useState(INGREDIENTS[0].name);
  const [inputAmount, setInputAmount] = useState<string>('1');
  
  // Default to Imperial for US market
  const [inputUnitId, setInputUnitId] = useState('cup');
  const [outputUnitId, setOutputUnitId] = useState('oz');

  const amountNum = parseFloat(inputAmount) || 0;
  
  // Find ingredient ID by name
  const ingredient = INGREDIENTS.find(i => i.name === ingredientName);
  const ingredientId = ingredient ? ingredient.id : INGREDIENTS[0].id;
  
  // Calculate main result
  const mainResult = convertIngredient(amountNum, inputUnitId, outputUnitId, ingredientId);
  const formattedMainResult = mainResult === 0 ? '0' : parseFloat(mainResult.toFixed(2)).toString();

  const handleSwap = () => {
    setInputUnitId(outputUnitId);
    setOutputUnitId(inputUnitId);
    setInputAmount(formattedMainResult);
  };

  // Other units for the "Also equals" section
  const otherUnits = UNITS.filter(u => u.id !== inputUnitId && u.id !== outputUnitId);

  return (
    <ScreenLayout title="Ingredient Converter" onBack={onBack} className="pb-6">
      
      {/* Ingredient Selector */}
      <div className="mb-4">
        <IngredientSelect 
          value={ingredientName}
          onChange={setIngredientName}
          className="w-full bg-white rounded-xl py-3 pl-4 text-gray-800 font-medium shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]"
        />
      </div>

      {/* Main Converter Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4 flex flex-col relative">
        
        {/* FROM */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 mb-2">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="text-3xl font-bold w-1/2 bg-transparent focus:outline-none text-gray-800"
            placeholder="0"
          />
          <div className="relative w-1/2 max-w-[130px]">
            <select
              value={inputUnitId}
              onChange={(e) => setInputUnitId(e.target.value)}
              className="w-full appearance-none bg-white rounded-xl py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:outline-none"
            >
              {UNITS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwap}
            className="bg-[var(--color-app-accent)] text-white p-2.5 rounded-full shadow-md hover:bg-[var(--color-app-accent-hover)] transition-colors active:scale-95"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* TO */}
        <div className="flex items-center justify-between bg-red-50/50 rounded-2xl p-3 mt-2">
          <div className="text-3xl font-bold w-1/2 text-[var(--color-app-accent)] truncate pr-2">
            {formattedMainResult}
          </div>
          <div className="relative w-1/2 max-w-[130px]">
            <select
              value={outputUnitId}
              onChange={(e) => setOutputUnitId(e.target.value)}
              className="w-full appearance-none bg-white rounded-xl py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:outline-none"
            >
              {UNITS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Also Equals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Also Equals</span>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {otherUnits.map((unit) => {
            const result = convertIngredient(amountNum, inputUnitId, unit.id, ingredientId);
            const formattedResult = result === 0 ? '0' : parseFloat(result.toFixed(2)).toString();
            
            return (
              <div key={unit.id} className="flex items-baseline justify-between p-4">
                <span className="text-xl font-bold text-gray-800">{formattedResult}</span>
                <span className="text-base font-medium text-gray-500 ml-2">{unit.name}</span>
              </div>
            );
          })}
        </div>
      </div>

    </ScreenLayout>
  );
}
