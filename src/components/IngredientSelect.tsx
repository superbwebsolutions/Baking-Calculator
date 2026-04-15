import { useState } from 'react';
import { INGREDIENTS } from '../lib/bakingData';
import { ChevronDown, X } from 'lucide-react';

interface IngredientSelectProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export function IngredientSelect({ value, onChange, className, placeholder = "Select ingredient..." }: IngredientSelectProps) {
  // Check if the current value is a known ingredient
  const isKnown = INGREDIENTS.some(i => i.name === value || i.id === value);
  const [isCustom, setIsCustom] = useState(!isKnown && value !== '');

  // Group ingredients by category
  const grouped = INGREDIENTS.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {} as Record<string, typeof INGREDIENTS>);

  if (isCustom) {
    return (
      <div className="relative flex items-center w-full">
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder="Custom ingredient..."
          className={className}
          autoFocus
        />
        <button 
          onClick={() => { setIsCustom(false); onChange(''); }}
          className="absolute right-3 p-1 text-gray-400 hover:text-gray-600"
          title="Cancel custom ingredient"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <select 
        value={value} 
        onChange={e => {
          if (e.target.value === '__custom__') {
            setIsCustom(true);
            onChange('');
          } else {
            onChange(e.target.value);
          }
        }}
        className={`${className} appearance-none pr-8`}
      >
        <option value="" disabled>{placeholder}</option>
        {Object.entries(grouped).map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map(item => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </optgroup>
        ))}
        <optgroup label="Other">
          <option value="__custom__">+ Custom Ingredient</option>
        </optgroup>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
