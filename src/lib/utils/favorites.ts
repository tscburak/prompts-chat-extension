import { slugify } from './string';

const FAVORITES_KEY = 'favorite_prompts';

export function getFavorites(): string[] {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(actAs: string): boolean {
  const favorites = getFavorites();
  const id = slugify(actAs);
  const index = favorites.indexOf(id);
  
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return index === -1;
}

export function isFavorite(actAs: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(slugify(actAs));
}
