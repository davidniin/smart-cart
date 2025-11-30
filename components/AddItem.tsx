import React, { useState, useRef } from 'react';
import { Camera, Type, Loader2, ArrowRight } from 'lucide-react';
import { analyzeImageForItems, parseTextToItems } from '../services/geminiService';
import { ShoppingItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AddItemProps {
  onAddItems: (newItems: ShoppingItem[]) => void;
  onClose: () => void;
}

const AddItem: React.FC<AddItemProps> = ({ onAddItems, onClose }) => {
  const [mode, setMode] = useState<'text' | 'camera'>('text');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processItems = (parsedItems: { name: string; category: string }[]) => {
    const newItems: ShoppingItem[] = parsedItems.map(p => ({
      id: uuidv4(),
      name: p.name,
      category: p.category,
      status: 'TO_BUY',
      price: 0
    }));
    onAddItems(newItems);
    onClose();
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const parsedItems = await parseTextToItems(textInput);
      processItems(parsedItems);
    } catch (err) {
      setError("No entendí bien. Intenta escribirlo más simple.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data url prefix for API
        const base64Data = base64String.split(',')[1];
        
        const analyzedItems = await analyzeImageForItems(base64Data, file.type);
        processItems(analyzedItems);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error al analizar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Agregar Productos
      </h2>

      {/* Mode Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => { setMode('text'); setTextInput(''); setError(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Type size={16} /> Escribir
          </span>
        </button>
        <button
          onClick={() => { setMode('camera'); setError(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'camera' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
           <span className="flex items-center justify-center gap-1">
            <Camera size={16} /> Foto
          </span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
            <p className="text-gray-500 text-sm animate-pulse">
              {mode === 'camera' ? 'Analizando imagen...' : 'Procesando lista...'}
            </p>
          </div>
        ) : mode === 'text' ? (
          <form onSubmit={handleTextSubmit} className="space-y-4 h-full flex flex-col">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Escribe tu lista rápida:
                </label>
                <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ej: Leche, 6 huevos, pan de molde..."
                className="w-full h-48 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-gray-50 text-lg"
                autoFocus
                />
            </div>
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              Agregar <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square max-w-[280px] border-3 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer group"
            >
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} className="text-emerald-500" />
              </div>
              <span className="text-gray-500 font-medium">Toca para subir foto</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              capture="environment"
            />
             <p className="text-xs text-center text-gray-400 max-w-xs">
              Sube una foto de tu despensa vacía o de un producto y la IA identificará qué falta.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center mt-4 animate-shake">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddItem;