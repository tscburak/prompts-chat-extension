import { AI_MODELS } from "@/lib/constants";
import { Prompt, fetchPrompts } from "@/lib/utils/prompts";
import { useStorage } from "@/lib/utils/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface PromptsContextType {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  isLoading: boolean;
  error: Error | null;
  query: string;
  devMode: boolean;
  selectedModel: string;
  isDarkMode: boolean;
  setIsDarkMode: (newValue: boolean) => Promise<void>;
  setQuery: (query: string) => void;
  setDevMode: (newValue: boolean) => Promise<void>;
  setSelectedModel: (newValue: string) => Promise<void>;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState("");

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

  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = !query ||
        prompt.act.toLowerCase().includes(query.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(query.toLowerCase());

      const matchesDevMode = !devMode || prompt.for_devs === true;

      return matchesSearch && matchesDevMode;
    })
    .sort((a, b) => a.act.localeCompare(b.act));

  const value = useMemo(() => ({
    prompts,
    filteredPrompts,
    isLoading: isLoading || isModelLoading,
    error,
    query,
    devMode,
    selectedModel,
    isDarkMode,
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel,
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
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel
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
