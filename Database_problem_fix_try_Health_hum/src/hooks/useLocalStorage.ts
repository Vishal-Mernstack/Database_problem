import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T[]) {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);

  const addItem = useCallback((item: T) => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      (item as any).id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setData(prev => prev.filter(item => (item as any).id !== id));
  }, []);

  const getById = useCallback((id: string) => {
    return data.find(item => (item as any).id === id);
  }, [data]);

  return {
    data,
    setData,
    addItem,
    updateItem,
    deleteItem,
    getById,
  };
}
