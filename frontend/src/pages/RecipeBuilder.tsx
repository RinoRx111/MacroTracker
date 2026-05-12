import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Search, ChefHat, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNutrition } from '../hooks/useNutrition';
import { api } from '../api/client';

// ─── Small stat pill used in the recipe cards ───────────────────────────────
const StatPill = ({
  label,
  value,
  unit,
  colorClass,
}: {
  label: string;
  value: number;
  unit: string;
  colorClass: string;
}) => (
  <div className="flex flex-col items-center">
    <span className={`text-sm font-bold ${colorClass}`}>
      {Math.round(value)}
      <span className="text-xs font-normal text-zinc-500 ml-0.5">{unit}</span>
    </span>
    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</span>
  </div>
);

// ─── Live macro preview while building a recipe ─────────────────────────────
const MacroPreview = ({ ingredients }: { ingredients: any[] }) => {
  const totals = ingredients.reduce(
    (acc, ing) => {
      const r = ing.amount / 100;
      return {
        calories: acc.calories + ing.calories * r,
        protein: acc.protein + ing.protein * r,
        carbs: acc.carbs + ing.carbs * r,
        fats: acc.fats + ing.fats * r,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="flex items-center justify-around p-4 rounded-2xl bg-panel border border-border">
      <StatPill label="kcal"    value={totals.calories} unit=""  colorClass="text-white" />
      <div className="w-px h-8 bg-border" />
      <StatPill label="protein" value={totals.protein}  unit="g" colorClass="text-accent-protein" />
      <div className="w-px h-8 bg-border" />
      <StatPill label="carbs"   value={totals.carbs}    unit="g" colorClass="text-accent-carbs" />
      <div className="w-px h-8 bg-border" />
      <StatPill label="fats"    value={totals.fats}     unit="g" colorClass="text-accent-fats" />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const RecipeBuilder: React.FC = () => {
  const queryClient = useQueryClient();

  // ── Builder state ──
  const [recipeName, setRecipeName]   = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // ── Food search (reuse the shared hook) ──
  const { searchFood } = useNutrition();
  const { data: searchResults = [] } = searchFood(searchQuery);

  // ── Fetch saved recipes ──
  const { data: savedRecipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data } = await api.recipes.getRecipes();
      return data;
    },
  });

  // ── Save recipe mutation ──
  const saveMutation = useMutation({
    mutationFn: (payload: any) => api.recipes.createRecipe(payload),
    onSuccess: () => {
      // Refresh saved-recipes list
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      // Clear the builder
      setIngredients([]);
      setRecipeName('');
      setDescription('');
      // Show a brief success message
      setSaveMessage('Recipe saved! ✅');
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (err: any) => {
      setSaveMessage(`Error: ${err?.message || 'Could not save recipe'}`);
      setTimeout(() => setSaveMessage(null), 4000);
    },
  });

  // ── Handlers ──
  const addIngredient = (food: any) => {
    // Prevent duplicates
    if (ingredients.find((i) => i.id === food.id)) return;
    setIngredients([...ingredients, { ...food, amount: 100 }]);
    setSearchQuery('');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateAmount = (index: number, value: string) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return;
    const updated = [...ingredients];
    updated[index] = { ...updated[index], amount: parsed };
    setIngredients(updated);
  };

  const handleSave = () => {
    if (!recipeName.trim()) {
      alert('Please give your recipe a name.');
      return;
    }
    if (ingredients.length === 0) {
      alert('Add at least one ingredient before saving.');
      return;
    }

    saveMutation.mutate({
      name: recipeName.trim(),
      description: description.trim(),
      ingredients: ingredients.map((ing) => ({
        food_id: ing.id,
        amount: ing.amount,
      })),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 max-w-5xl">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recipe Builder</h2>
          <p className="text-zinc-500">Combine foods into a reusable meal template.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 disabled:opacity-50"
        >
          <Save size={18} />
          {saveMutation.isPending ? 'Saving…' : 'Save Recipe'}
        </button>
      </header>

      {/* ── Save feedback banner ──────────────────────────────────────────── */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-medium"
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Builder Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Search panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Add Ingredients</p>

            <div className="relative">
              <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
              <input
                className="w-full bg-panel border border-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-white transition-colors"
                placeholder="Search food…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {searchResults.length === 0 && searchQuery.length > 2 && (
                <p className="text-xs text-zinc-600 text-center py-4">No results found.</p>
              )}
              {searchResults.map((food: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => addIngredient(food)}
                  className="p-3 rounded-xl bg-panel border border-border hover:border-white cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium leading-tight">{food.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {food.calories} kcal · {food.protein}g P · {food.carbs}g C · {food.fats}g F
                      </p>
                    </div>
                    <Plus size={14} className="text-zinc-500 group-hover:text-white mt-0.5 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Recipe editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-8 rounded-3xl bg-surface border border-border space-y-6">

            {/* Recipe name */}
            <input
              className="text-2xl font-bold bg-transparent border-b border-border outline-none w-full placeholder-zinc-700 pb-2 focus:border-white transition-colors"
              placeholder="Recipe Name (e.g. Morning Smoothie)"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
            />

            {/* Optional description */}
            <input
              className="w-full bg-panel border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-white transition-colors placeholder-zinc-700"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Ingredient list */}
            {ingredients.length === 0 ? (
              <div className="text-center py-16 text-zinc-600 italic text-sm">
                Search for ingredients on the left and click to add them.
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ing, i) => {
                  const ratio = ing.amount / 100;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-panel border border-border"
                    >
                      <div className="flex flex-col flex-1 mr-4">
                        <span className="font-medium text-sm">{ing.name}</span>
                        <span className="text-xs text-zinc-500 mt-0.5">
                          {Math.round(ing.calories * ratio)} kcal ·{' '}
                          {Math.round(ing.protein * ratio)}g P ·{' '}
                          {Math.round(ing.carbs * ratio)}g C ·{' '}
                          {Math.round(ing.fats * ratio)}g F
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          className="w-20 bg-surface border border-border rounded-lg px-2 py-1 text-right text-sm outline-none focus:border-white transition-colors"
                          value={ing.amount}
                          min={1}
                          onChange={(e) => updateAmount(i, e.target.value)}
                        />
                        <span className="text-xs text-zinc-500">g</span>
                        <button
                          onClick={() => removeIngredient(i)}
                          className="text-zinc-600 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Live macro preview — only show when there are ingredients */}
            {ingredients.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Recipe Total</p>
                <MacroPreview ingredients={ingredients} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Saved Recipes ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ChefHat size={20} className="text-zinc-400" />
          <h3 className="text-xl font-bold">My Saved Recipes</h3>
          {!loadingRecipes && (
            <span className="text-xs text-zinc-600 bg-border px-2.5 py-1 rounded-full">
              {savedRecipes.length}
            </span>
          )}
        </div>

        {loadingRecipes ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface border border-border text-center">
            <p className="text-zinc-600 italic text-sm">
              No recipes saved yet. Build one above and hit Save Recipe!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRecipes.map((recipe: any) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-surface border border-border flex flex-col gap-4 transition-shadow hover:shadow-lg hover:shadow-black/30"
              >
                {/* Recipe name + description */}
                <div>
                  <h4 className="font-bold text-lg leading-tight">{recipe.name}</h4>
                  {recipe.description ? (
                    <p className="text-xs text-zinc-500 mt-1">{recipe.description}</p>
                  ) : null}
                </div>

                {/* Macro stats */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center justify-between col-span-2 p-3 rounded-xl bg-panel border border-border">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Flame size={14} />
                      <span className="text-xs">Calories</span>
                    </div>
                    <span className="font-bold text-white text-base">
                      {Math.round(recipe.total_calories)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-panel border border-border">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Beef size={12} />
                      <span className="text-xs">Protein</span>
                    </div>
                    <span className="font-bold text-accent-protein text-sm">
                      {Math.round(recipe.total_protein)}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-panel border border-border">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Wheat size={12} />
                      <span className="text-xs">Carbs</span>
                    </div>
                    <span className="font-bold text-accent-carbs text-sm">
                      {Math.round(recipe.total_carbs)}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-panel border border-border col-span-2">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Droplets size={12} />
                      <span className="text-xs">Fats</span>
                    </div>
                    <span className="font-bold text-accent-fats text-sm">
                      {Math.round(recipe.total_fats)}g
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
