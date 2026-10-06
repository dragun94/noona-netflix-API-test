import { element } from '../utils/dom.js';
import { createMovieCard } from './movie-card.js';

export function createMovieRow(config, onSelect) {
  const section = element('section', 'movie-row');
  section.id = config.id;
  section.setAttribute('aria-labelledby', `${config.id}-title`);
  const heading = element('div', 'row-heading');
  const titles = element('div', 'row-title-group');
  const title = element('h3', '', config.title);
  title.id = `${config.id}-title`;
  titles.append(title);
  if (config.tag) titles.append(element('span', 'row-tag', config.tag));
  if (config.description) titles.append(element('span', 'row-description', config.description));
  const arrows = element('div', 'row-arrows');
  const previous = element('button', 'row-arrow', '‹');
  const next = element('button', 'row-arrow', '›');
  previous.setAttribute('aria-label', `${config.title} 이전 영화`);
  next.setAttribute('aria-label', `${config.title} 다음 영화`);
  previous.disabled = next.disabled = true;
  arrows.append(previous, next);
  heading.append(titles, arrows);
  const track = element('div', 'movie-track');
  track.setAttribute('aria-busy', 'true');
  section.append(heading, track);
  const updateArrows = () => {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  previous.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * .85, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * .85, behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows, { passive: true });
  new ResizeObserver(updateArrows).observe(track);
  async function load() {
    track.replaceChildren(...Array.from({ length: 8 }, () => element('div', 'skeleton')));
    track.setAttribute('aria-busy', 'true');
    try {
      const data = await config.load();
      const movies = (data.results || []).filter(movie => !movie.adult);
      track.replaceChildren(...movies.map((movie, index) => createMovieCard(movie, onSelect, config.rank ? index + 1 : undefined)));
      if (!movies.length) track.append(element('div', 'row-state', '아직 이 목록에 표시할 영화가 없습니다.'));
      config.onLoaded?.(movies);
    } catch (error) {
      const state = element('div', 'row-state');
      state.setAttribute('role', 'status');
      const retry = element('button', 'button button-secondary', '다시 시도');
      retry.addEventListener('click', load);
      state.append(element('p', '', error.message), retry);
      track.replaceChildren(state);
    } finally {
      track.setAttribute('aria-busy', 'false');
      requestAnimationFrame(updateArrows);
    }
  }
  return { section, load };
}
