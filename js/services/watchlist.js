const KEY = 'noona:watchlist';
let movies = [];
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (Array.isArray(saved)) movies = saved.filter(movie => movie && Number.isInteger(movie.id));
} catch { /* Keep the watchlist usable when storage is unavailable. */ }
export const getWatchlist = () => [...movies];
export const isSaved = id => movies.some(movie => movie.id === id);
export function toggleSaved(movie) {
  const existed = isSaved(movie.id);
  movies = existed ? movies.filter(item => item.id !== movie.id) : [...movies, movie];
  let persisted = true;
  try { localStorage.setItem(KEY, JSON.stringify(movies)); } catch { persisted = false; }
  document.dispatchEvent(new Event('watchlistchange'));
  return { saved: !existed, persisted };
}
