import React from 'react';
import { ShoppingCart, PlusCircle, Sparkles } from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="max-w-md mx-auto min-h-full bg-white shadow-xl relative">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-6">
          <button
            onClick={() => onTabChange(AppTab.LIST)}
            className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-colors ${
              currentTab === AppTab.LIST ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingCart size={24} strokeWidth={currentTab === AppTab.LIST ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Lista</span>
          </button>

          <button
            onClick={() => onTabChange(AppTab.ADD)}
            className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-colors ${
              currentTab === AppTab.ADD ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-full transition-all ${
               currentTab === AppTab.ADD ? 'bg-emerald-100' : 'bg-transparent'
            }`}>
               <PlusCircle size={28} strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={() => onTabChange(AppTab.INSPIRE)}
            className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-colors ${
              currentTab === AppTab.INSPIRE ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles size={24} strokeWidth={currentTab === AppTab.INSPIRE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Ideas</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;