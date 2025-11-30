import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Globe } from 'lucide-react';
import { searchProductInfo } from '../services/geminiService';
import { SearchResult } from '../types';

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchProductInfo(query);
      setResult(data);
    } catch (err) {
      setError("No pudimos completar la búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Globe className="text-blue-500" />
          Info Producto
        </h2>
        <p className="text-sm text-blue-800/60">
          Consulta precios, temporada o información nutricional.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué vino va bien con pasta?..."
          className="w-full py-4 pl-12 pr-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-400 bg-white"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                {error}
            </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Respuesta</h3>
            <div className="prose prose-sm text-gray-700 leading-relaxed mb-6">
              <p>{result.text}</p>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Fuentes</h4>
                <div className="grid gap-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600">
                        <ExternalLink size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate flex-1 group-hover:text-blue-800">
                        {source.title || source.uri}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!result && !loading && !error && (
            <div className="text-center mt-12 opacity-40">
                <Globe size={64} className="mx-auto text-gray-400 mb-4" />
                <p>Busca información actualizada usando Google.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;