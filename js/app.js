import { GENRES } from './config.js';
import { popularCollections, genreMovies, searchMovies } from './services/tmdb.js';
import { getWatchlist } from './services/watchlist.js';
import { createMovieRow } from './components/movie-row.js';
import { setupDialog } from './components/movie-dialog.js';
import { renderHero } from './components/hero.js';
import { createMovieCard } from './components/movie-card.js';
import { element } from './utils/dom.js';

let toastTimeout;
function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => node.classList.remove('visible'), 3000);
}
const { openMovie, openWatchlist } = setupDialog(toast);
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
const updateCount = () => { document.querySelector('#watchlist-count').textContent = getWatchlist().length; };
updateCount();
document.addEventListener('watchlistchange', updateCount);
document.querySelector('#watchlist-button').addEventListener('click', openWatchlist);

const rows = popularCollections().map((config, index) => {
  const row = createMovieRow({ ...config, rank: index === 0, onLoaded: index === 0 ? movies => renderHero(movies[0], openMovie) : undefined }, openMovie);
  document.querySelector('#popular-rows').append(row.section);
  return row;
});
// Keep the first four lists responsive without sending every genre request at once.
rows.forEach(row => row.load());
const genreObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      genreObserver.unobserve(entry.target);
      genreLoaders.get(entry.target)?.();
    }
  }
}, { rootMargin: '500px' });
const genreLoaders = new Map();
for (const genre of GENRES) {
  const id = `genre-${genre.id}`;
  const link = element('a', '', genre.name);
  link.href = `#${id}`;
  document.querySelector('#genre-links').append(link);
  const row = createMovieRow({ id, title: genre.name, description: genre.subtitle, load: () => genreMovies(genre.id) }, openMovie);
  document.querySelector('#genre-rows').append(row.section);
  genreLoaders.set(row.section, row.load);
  genreObserver.observe(row.section);
}

const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#search-input');
let searchController;
let searchVersion = 0;
document.querySelector('#search-toggle').addEventListener('click', () => {
  searchPanel.hidden = false;
  searchPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  searchInput.focus({ preventScroll: true });
});
document.querySelector('#search-close').addEventListener('click', () => {
  searchController?.abort();
  searchVersion++;
  searchPanel.hidden = true;
  document.querySelector('#search-toggle').focus();
});
document.querySelector('#search-form').addEventListener('submit', async event => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  searchController?.abort();
  searchController = new AbortController();
  const version = ++searchVersion;
  const result = document.querySelector('#search-results');
  result.replaceChildren(element('p', 'row-state', '영화를 찾고 있어요…'));
  try {
    const data = await searchMovies(query, searchController.signal);
    if (version !== searchVersion) return;
    const movies = (data.results || []).filter(movie => !movie.adult);
    const track = element('div', 'movie-track');
    track.append(...movies.map(movie => createMovieCard(movie, openMovie)));
    result.replaceChildren(element('p', 'row-description', `“${query}” 검색 결과 · ${movies.length}편 표시`), track);
    if (!movies.length) result.append(element('p', 'row-state', '검색 결과가 없습니다. 다른 제목으로 검색해 보세요.'));
  } catch (error) {
    if (version !== searchVersion || searchController.signal.aborted) return;
    result.replaceChildren(element('p', 'row-state', error.message));
  }
});
