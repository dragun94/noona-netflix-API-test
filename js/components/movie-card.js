import { IMAGE_BASE } from '../config.js';
import { element, movieTitle, movieYear, movieScore } from '../utils/dom.js';

export function createMovieCard(movie, onSelect, rank) {
  const card = element('button', 'movie-card');
  card.type = 'button';
  card.setAttribute('aria-label', `${movieTitle(movie)}, ${movieYear(movie)}, 평점 ${movieScore(movie)}, 자세히 보기`);
  const poster = element('div', 'poster-wrap');
  const fallback = element('div', 'poster-fallback');
  fallback.setAttribute('aria-hidden', 'true');
  fallback.append(element('span', '', '▧'), element('p', '', '포스터 준비 중'));
  poster.append(fallback);
  if (movie.poster_path) {
    const image = element('img');
    image.src = `${IMAGE_BASE}w342${movie.poster_path}`;
    image.alt = `${movieTitle(movie)} 포스터`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => image.remove(), { once: true });
    poster.append(image);
  }
  poster.append(element('span', 'poster-rating', `★ ${movieScore(movie)}`));
  if (rank) poster.append(element('span', 'poster-rank', `TOP ${rank}`));
  const meta = element('div', 'card-meta');
  meta.append(element('span', '', movieYear(movie)), element('span', 'score', `★ ${movieScore(movie)}`));
  card.append(poster, element('h4', '', movieTitle(movie)), meta);
  card.addEventListener('click', () => onSelect(movie));
  return card;
}
