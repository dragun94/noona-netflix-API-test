import { IMAGE_BASE, GENRES } from '../config.js';
import { movieTitle, movieYear, movieScore, element } from '../utils/dom.js';

export function renderHero(movie, onSelect) {
  if (!movie) return;
  document.querySelector('#hero-title').textContent = movieTitle(movie);
  document.querySelector('#hero-kicker').textContent = '오늘의 트렌딩 · 지금 가장 주목받는 이야기';
  document.querySelector('#hero-overview').textContent = movie.overview || '오늘의 인기 영화입니다. 자세히 살펴보고 다음에 볼 영화로 찜해 보세요.';
  const meta = document.querySelector('#hero-meta');
  meta.replaceChildren(element('span', 'rating', `★ ${movieScore(movie)}`), element('span', '', movieYear(movie)));
  const genres = GENRES.filter(genre => movie.genre_ids?.includes(genre.id)).map(genre => genre.name);
  if (genres.length) meta.append(element('span', '', genres.slice(0, 2).join(' · ')));
  if (movie.backdrop_path) {
    const image = new Image();
    image.onload = () => { document.querySelector('#hero-backdrop').style.backgroundImage = `url("${image.src}")`; };
    image.src = `${IMAGE_BASE}original${movie.backdrop_path}`;
  }
  const button = document.querySelector('#hero-details');
  button.disabled = false;
  button.onclick = () => onSelect(movie);
}
