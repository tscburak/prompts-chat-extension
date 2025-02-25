import { AI_MODELS } from "@/lib/constants";
import { Prompt, fetchPrompts } from "@/lib/utils/prompts";
import { useStorage } from "@/lib/utils/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isFavorite } from "../utils/favorites";

export type PromptsContextType = {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  isLoading: boolean;
  error: Error | null;
  query: string;
  devMode: boolean;
  selectedModel: string;
  isDarkMode: boolean;
  showFavorites: boolean;
  setIsDarkMode: (newValue: boolean) => Promise<void>;
  setQuery: (query: string) => void;
  setDevMode: (newValue: boolean) => Promise<void>;
  setSelectedModel: (newValue: string) => Promise<void>;
  setShowFavorites: (show: boolean) => void;
  favorites: Set<string>;
  toggleFavorite: (promptId: string) => boolean;
  activeTab: 'all' | 'favorites';
  setActiveTab: (tab: 'all' | 'favorites') => void;
};

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('promptFavorites');
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  const { value: selectedModel, setValue: setSelectedModel, isLoading: isModelLoading } = useStorage({
    key: 'selectedModel',
    defaultValue: AI_MODELS[0].id
  });

  const { value: devMode, setValue: setDevMode } = useStorage({
    key: 'isDevMode',
    defaultValue: false
  });

  const { value: isDarkMode, setValue: setIsDarkMode } = useStorage({
    key: 'isDarkMode',
    defaultValue: false
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setIsLoading(true);
    fetchPrompts()
      .then(setPrompts)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to fetch prompts')))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFavorite = (promptId: string): boolean => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(promptId)) {
        newFavorites.delete(promptId);
      } else {
        newFavorites.add(promptId);
      }
      localStorage.setItem('promptFavorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
    return !favorites.has(promptId);
  };

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;
    
    if (showFavorites) {
      filtered = filtered.filter(p => isFavorite(p.act));
    }
    
    if (query) {
      filtered = filtered.filter(
        prompt => {
          const matchesSearch = !query ||
            prompt.act.toLowerCase().includes(query.toLowerCase()) ||
            prompt.prompt.toLowerCase().includes(query.toLowerCase());

          const matchesDevMode = !devMode || prompt.for_devs === true;

          return matchesSearch && matchesDevMode;
        }
      );
    }
    
    return filtered.sort((a, b) => a.act.localeCompare(b.act));
  }, [prompts, query, showFavorites, devMode]);

  const value = useMemo(() => ({
    prompts,
    filteredPrompts,
    isLoading: isLoading || isModelLoading,
    error,
    query,
    devMode,
    selectedModel,
    isDarkMode,
    showFavorites,
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel,
    setShowFavorites,
    favorites,
    toggleFavorite,
    activeTab,
    setActiveTab,
  }), [
    prompts,
    filteredPrompts,
    isLoading,
    isModelLoading,
    error,
    query,
    devMode,
    selectedModel,
    isDarkMode,
    showFavorites,
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel,
    setShowFavorites,
    favorites,
    toggleFavorite,
    activeTab,
    setActiveTab
  ]);

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
