import React, { useMemo, useState } from 'react';
import { ShoppingItem, CATEGORIES } from '../types';
import { 
  Trash2, CheckCircle2, Circle, PackageOpen, Archive, ShoppingBag, 
  Banana, Carrot, Beef, Fish, Sandwich, Egg, Croissant, Wheat, 
  ChefHat, Soup, Cookie, Droplet, Wine, Snowflake, SprayCan, 
  Smile, Baby, Dog, MoreHorizontal 
} from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleStatus: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Frutas': <Banana size={18} className="text-yellow-500" />,
  'Verduras y Hortalizas': <Carrot size={18} className="text-orange-500" />,
  'Carne y Aves': <Beef size={18} className="text-red-500" />,
  'Pescado y Marisco': <Fish size={18} className="text-blue-500" />,
  'Charcutería y Quesos': <Sandwich size={18} className="text-amber-600" />,
  'Lácteos y Huevos': <Egg size={18} className="text-yellow-400" />,
  'Panadería y Pastelería': <Croissant size={18} className="text-amber-500" />,
  'Pasta, Arroz y Legumbres': <Wheat size={18} className="text-yellow-600" />,
  'Aceites, Salsas y Especias': <ChefHat size={18} className="text-red-400" />,
  'Conservas y Caldos': <Soup size={18} className="text-orange-600" />,
  'Desayuno y Dulces': <Cookie size={18} className="text-pink-500" />,
  'Agua, Refrescos y Zumos': <Droplet size={18} className="text-blue-400" />,
  'Vinos y Licores': <Wine size={18} className="text-purple-600" />,
  'Congelados': <Snowflake size={18} className="text-cyan-500" />,
  'Limpieza y Hogar': <SprayCan size={18} className="text-indigo-500" />,
  'Cuidado Personal': <Smile size={18} className="text-teal-500" />,
  'Bebé': <Baby size={18} className="text-pink-400" />,
  'Mascotas': <Dog size={18} className="text-amber-700" />,
  'Otros': <MoreHorizontal size={18} className="text-gray-400" />
};

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggleStatus, onUpdateItem, onDelete }) => {
  const [viewMode, setViewMode] = useState<'TO_BUY' | 'IN_PANTRY'>('TO_BUY');

  const filteredItems = useMemo(() => {
    return items.filter(item => item.status === viewMode);
  }, [items, viewMode]);

  const sortedCategories = useMemo(() => {
    const grouped: Record<string, ShoppingItem[]> = {};
    
    // Initialize standard categories
    CATEGORIES.forEach(c => grouped[c] = []);
    grouped['Otros'] = [];

    filteredItems.forEach(item => {
      // Normalize category (if old category exists, try to keep it, otherwise default to Otros)
      const cat = item.category && CATEGORIES.includes(item.category) ? item.category : 'Otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    return Object.entries(grouped).filter(([_, groupItems]) => groupItems.length > 0);
  }, [filteredItems]);

  const totalEstimated = useMemo(() => {
    return items
      .filter(i => i.status === 'TO_BUY')
      .reduce((acc, curr) => acc + (curr.price || 0), 0);
  }, [items]);

  const handlePriceChange = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdateItem(id, { price: num });
    }
  };

  return (
    <div className="h-full flex flex-col pt-6 bg-gray-50">
      
      {/* Header & Tabs */}
      <div className="px-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
           {viewMode === 'TO_BUY' ? '🛒 Lista de Compra' : '📦 Mi Despensa'}
        </h1>

        <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
          <button
            onClick={() => setViewMode('TO_BUY')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'TO_BUY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag size={16} /> Por Comprar
            <span className="bg-gray-100 text-xs px-2 py-0.5 rounded-full text-gray-600">
               {items.filter(i => i.status === 'TO_BUY').length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('IN_PANTRY')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'IN_PANTRY' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Archive size={16} /> Despensa
            <span className="bg-gray-100 text-xs px-2 py-0.5 rounded-full text-gray-600">
               {items.filter(i => i.status === 'IN_PANTRY').length}
            </span>
          </button>
        </div>

        {viewMode === 'TO_BUY' && totalEstimated > 0 && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex justify-between items-center text-sm text-emerald-800 animate-fade-in">
            <span className="font-medium">Total estimado:</span>
            <span className="font-bold text-lg">{totalEstimated.toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
            {viewMode === 'TO_BUY' ? (
              <>
                <ShoppingBag size={48} className="mb-4 text-gray-200" />
                <p>Tu lista está vacía.</p>
                <p className="text-xs mt-2">Revisa tu despensa o agrega productos.</p>
              </>
            ) : (
              <>
                <PackageOpen size={48} className="mb-4 text-gray-200" />
                <p>Tu despensa está vacía.</p>
                <p className="text-xs mt-2">¡Hora de ir a comprar!</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategories.map(([category, categoryItems]) => (
              <div key={category} className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2 px-1 sticky top-0 bg-gray-50 py-2 z-10">
                   <div className="bg-white p-1 rounded-full shadow-sm">
                      {CATEGORY_ICONS[category] || CATEGORY_ICONS['Otros']}
                   </div>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {category}
                  </h3>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {categoryItems.map((item, idx) => (
                    <div 
                      key={item.id}
                      className={`group flex items-center justify-between p-3 sm:p-4 transition-colors ${
                        idx !== categoryItems.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      {/* Left: Check & Name */}
                      <div className="flex items-center flex-1 gap-3 overflow-hidden">
                        <button 
                          onClick={() => onToggleStatus(item.id)}
                          className="flex-shrink-0 transition-transform active:scale-90"
                        >
                          {viewMode === 'TO_BUY' ? (
                            <Circle className="text-gray-300 hover:text-emerald-500 transition-colors" size={24} strokeWidth={1.5} />
                          ) : (
                            <CheckCircle2 className="text-emerald-500 hover:text-gray-400 transition-colors" size={24} strokeWidth={1.5} />
                          )}
                        </button>
                        
                        <div className="flex flex-col truncate">
                          <span className={`text-base font-medium truncate ${viewMode === 'IN_PANTRY' ? 'text-gray-500' : 'text-gray-800'}`}>
                            {item.name}
                          </span>
                        </div>
                      </div>

                      {/* Right: PriceWiz Input & Delete */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                         {viewMode === 'TO_BUY' && (
                           <div className="relative flex items-center">
                              <span className="absolute left-2 text-gray-400 text-xs">€</span>
                              <input 
                                type="number" 
                                placeholder="0.00"
                                className="w-16 py-1 pl-4 pr-1 text-right text-sm bg-gray-50 border border-transparent hover:border-gray-200 focus:border-emerald-400 focus:bg-white rounded-md transition-all outline-none text-gray-600 placeholder-gray-300"
                                defaultValue={item.price || ''}
                                onBlur={(e) => handlePriceChange(item.id, e.target.value)}
                              />
                           </div>
                         )}

                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;