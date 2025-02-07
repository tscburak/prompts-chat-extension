import { useEffect, useState } from 'react';
import { AI_MODELS } from '../constants';

export interface StorageData {
  selectedModel: string;
  isDarkMode: boolean;
  isDevMode: boolean;
}

interface UseStorageOptions<K extends keyof StorageData> {
  key: K;
  defaultValue: StorageData[K];
}

export function useStorage<K extends keyof StorageData>({
  key,
  defaultValue
}: UseStorageOptions<K>) {
  const [value, setValue] = useState<StorageData[K]>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    chrome.storage.sync.get(key).then(result => {
      if (isMounted) {
        setValue(result[key] ?? defaultValue);
        setIsLoading(false);
      }
    });

    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    chrome.storage.sync.onChanged.addListener(handleChange);

    return () => {
      isMounted = false;
      chrome.storage.sync.onChanged.removeListener(handleChange);
    };
  }, [key, defaultValue]);

  const updateValue = async (newValue: StorageData[K]) => {
    try {
      if (key === 'selectedModel' && !AI_MODELS.some(model => model.id === newValue)) {
        throw new Error('Invalid model ID');
      }
      await chrome.storage.sync.set({ [key]: newValue });
      setValue(newValue);
    } catch (error) {
      console.error(`Error saving storage value for ${key}:`, error);
      throw error;
    }
  };

  return { value, isLoading, setValue: updateValue };
}
