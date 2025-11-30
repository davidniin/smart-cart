import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ShoppingList from './components/ShoppingList';
import AddItem from './components/AddItem';
import Inspiration from './components/Inspiration';
import { ShoppingItem, AppTab } from './types';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.LIST);
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    // Load from local storage
    const saved = localStorage.getItem('shopping-cart-items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic for old data format (completed boolean -> status)
        return parsed.map((item: any) => ({
          ...item,
          status: item.status || (item.completed ? 'IN_PANTRY' : 'TO_BUY'),
          price: item.price || 0
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('shopping-cart-items', JSON.stringify(items));
  }, [items]);

  const handleUpdateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleToggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'TO_BUY' ? 'IN_PANTRY' : 'TO_BUY';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItems = (newItems: ShoppingItem[]) => {
    setItems(prev => [...prev, ...newItems]);
  };

  const renderContent = () => {
    switch (currentTab) {
      case AppTab.LIST:
        return (
          <ShoppingList 
            items={items} 
            onUpdateItem={handleUpdateItem}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteItem} 
          />
        );
      case AppTab.ADD:
        return (
          <AddItem 
            onAddItems={(newItems) => {
              handleAddItems(newItems);
              setCurrentTab(AppTab.LIST);
            }} 
            onClose={() => setCurrentTab(AppTab.LIST)}
          />
        );
      case AppTab.INSPIRE:
        return (
          <Inspiration 
            onAddItems={(newItems) => {
              handleAddItems(newItems);
              setCurrentTab(AppTab.LIST);
            }}
            pantryItems={items.filter(i => i.status === 'IN_PANTRY')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;