// frontend/src/components/features/logging/FoodSearchModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import { useNutrition } from '../../../hooks/useNutrition';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { searchFood, logFoodMutation } = useNutrition();
  const { data: results, isLoading } = searchFood(query);

  // Handle "Enter" key to close or search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLog = async (food: any) => {
    await api.nutrition.log({
  food_id: selectedFood.id,
  amount: amount,
  meal_type: mealType,
  log_date: new Date().toISOString().split('T')[0],
  // ADD THESE — pass the real nutrient data:
  food_name: selectedFood.name,
  food_calories: selectedFood.calories,
  food_protein: selectedFood.protein,
  food_carbs: selectedFood.carbs,
  food_fats: selectedFood.fats,
});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Window */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <Search className="text-zinc-500" size={20} />
              <input 
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder-zinc-600"
                placeholder="Search for a food or brand..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-500 animate-pulse">Searching for nutrients...</div>
              ) : results && results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((food: any, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleLog(food)}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-border cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium group-hover:text-white transition-colors">{food.name}</span>
                        <span className="text-xs text-zinc-500">{food.brand || 'Generic'} • {food.calories} kcal / 100g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-accent-protein">P: {food.protein}g</span>
                          <span className="text-accent-carbs">C: {food.carbs}g</span>
                          <span className="text-accent-fats">F: {food.fats}g</span>
                        </div>
                        <Plus size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : query.length > 2 ? (
                <div className="p-8 text-center text-zinc-500">No foods found. Try a different search.</div>
              ) : (
                <div className="p-8 text-center text-zinc-50 own-zinc-500">Type at least 3 characters to start searching...</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
