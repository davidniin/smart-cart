import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowLeft, PlusCircle, ChefHat, UtensilsCrossed, Check } from 'lucide-react';
import { suggestRecipes, generateRecipeImage } from '../services/geminiService';
import { Recipe, ShoppingItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface InspirationProps {
  onAddItems: (newItems: ShoppingItem[]) => void;
  pantryItems: ShoppingItem[];
}

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchImage = async () => {
      // Small delay to allow text to render first
      await new Promise(r => setTimeout(r, 100));
      const url = await generateRecipeImage(recipe.title);
      if (mounted && url) setImageUrl(url);
    };
    fetchImage();
    return () => { mounted = false; };
  }, [recipe.title]);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-95 flex flex-col h-full"
    >
      <div className="h-32 bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
             <UtensilsCrossed size={32} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-1 leading-tight">{recipe.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{recipe.description}</p>
      </div>
    </div>
  );
};

const Inspiration: React.FC<InspirationProps> = ({ onAddItems, pantryItems }) => {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [selectedPantryIds, setSelectedPantryIds] = useState<Set<string>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const togglePantryItem = (id: string) => {
    const newSet = new Set(selectedPantryIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPantryIds(newSet);
  };

  const handleSuggest = async () => {
    const pantryNames = pantryItems
      .filter(item => selectedPantryIds.has(item.id))
      .map(item => item.name);
    
    const combinedIngredients = [ingredientsInput, ...pantryNames]
      .filter(Boolean)
      .join(', ');

    if (!combinedIngredients.trim()) {
      setError("Por favor, selecciona ingredientes o escribe algo.");
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);
    setSelectedRecipe(null);

    try {
      const suggestions = await suggestRecipes(combinedIngredients);
      setRecipes(suggestions);
    } catch (err: any) {
      setError(err.message || "No se pudieron generar recetas.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredients = () => {
    if (!selectedRecipe) return;
    const newItems: ShoppingItem[] = selectedRecipe.ingredients.map(ing => ({
      id: uuidv4(),
      name: ing,
      category: 'Otros', // Default category, user can organize later
      status: 'TO_BUY',
      price: 0
    }));
    onAddItems(newItems);
    // Optional: Show success feedback or close modal
    alert(`${newItems.length} ingredientes añadidos a la lista.`);
  };

  // Detailed Recipe View
  if (selectedRecipe) {
    return (
      <div className="h-full flex flex-col bg-white animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <button 
            onClick={() => setSelectedRecipe(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 truncate flex-1">{selectedRecipe.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
           <div className="mb-6">
             <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wide mb-3">Ingredientes</h3>
             <ul className="space-y-2">
               {selectedRecipe.ingredients.map((ing, idx) => (
                 <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0" />
                   {ing}
                 </li>
               ))}
             </ul>
           </div>

           <div>
             <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wide mb-3">Instrucciones</h3>
             <ol className="space-y-4">
               {selectedRecipe.instructions.map((step, idx) => (
                 <li key={idx} className="flex gap-3 text-gray-700 text-sm">
                   <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                     {idx + 1}
                   </span>
                   <p className="mt-0.5">{step}</p>
                 </li>
               ))}
             </ol>
           </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleAddIngredients}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Añadir Ingredientes
          </button>
        </div>
      </div>
    );
  }

  // Main Suggestion View
  return (
    <div className="h-full flex flex-col p-6 animate-fade-in bg-gradient-to-br from-indigo-50 to-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
          <ChefHat className="text-indigo-500" />
          Ideas de Cocina
        </h2>
        <p className="text-sm text-indigo-600/70">
          Selecciona lo que tienes en tu despensa o escribe ingredientes extra.
        </p>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Input Area */}
        <div className="mb-6 flex-shrink-0 space-y-4">
          
          {/* Pantry Selection */}
          {pantryItems.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">
                De tu despensa
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar mask-linear-fade">
                {pantryItems.map(item => {
                  const isSelected = selectedPantryIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => togglePantryItem(item.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Input */}
          <div>
            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">
              Algo más...
            </label>
            <textarea
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder="Ej: Tengo ganas de pasta..."
              className="w-full p-4 h-20 rounded-2xl border-none shadow-sm bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 resize-none text-sm"
            />
          </div>

          <button
            onClick={handleSuggest}
            disabled={loading || (ingredientsInput.trim() === '' && selectedPantryIds.size === 0)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Sugerir Recetas
          </button>
          
          {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 -mx-2 px-2">
          {recipes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {recipes.map((recipe, idx) => (
                <RecipeCard 
                  key={idx} 
                  recipe={recipe} 
                  onClick={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          ) : !loading && (
             <div className="flex flex-col items-center justify-center h-full text-indigo-200 pb-12">
               <ChefHat size={48} className="mb-2 opacity-50" />
               <p className="text-xs">Tus recetas aparecerán aquí</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inspiration;