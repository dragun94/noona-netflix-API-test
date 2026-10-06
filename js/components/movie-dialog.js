import { IMAGE_BASE } from '../config.js';
import { element, movieTitle, movieYear, movieScore } from '../utils/dom.js';
import { getWatchlist, isSaved, toggleSaved } from '../services/watchlist.js';
import { createMovieCard } from './movie-card.js';

export function setupDialog(toast) {
  const dialog = document.querySelector('#movie-dialog');
  const content = document.querySelector('#dialog-content');
  let previousFocus;
  function show() {
    if (!dialog.open) {
      previousFocus = document.activeElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }
    dialog.scrollTop = 0;
    dialog.querySelector('.dialog-close').focus();
  }
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; previousFocus?.focus(); });
  function openMovie(movie) {
    content.replaceChildren();
    const imagePath = movie.backdrop_path || movie.poster_path;
    if (imagePath) {
      const image = element('img', 'dialog-cover');
      image.src = `${IMAGE_BASE}w780${imagePath}`;
      image.alt = movieTitle(movie);
      image.addEventListener('error', () => image.remove(), { once: true });
      content.append(image);
    }
    const body = element('div', 'dialog-body');
    const meta = element('div', 'dialog-meta');
    meta.append(element('span', '', movieYear(movie)), element('span', 'rating', `★ ${movieScore(movie)} / 10`));
    const save = element('button', 'button button-primary');
    const update = () => { save.textContent = isSaved(movie.id) ? '✓ 내가 찜한 영화' : '+ 내가 찜한 영화에 추가'; save.setAttribute('aria-pressed', String(isSaved(movie.id))); };
    update();
    save.addEventListener('click', () => {
      const result = toggleSaved(movie);
      update();
      toast(result.persisted ? (result.saved ? '찜한 영화에 추가했어요.' : '찜한 영화에서 삭제했어요.') : '현재 페이지에 저장했어요. 브라우저 저장 공간을 사용할 수 없습니다.');
    });
    const title = element('h2', '', movieTitle(movie));
    title.id = 'dialog-title';
    body.append(title, meta, element('p', 'dialog-overview', movie.overview || '아직 등록된 한국어 줄거리가 없습니다.'), save);
    content.append(body);
    show();
  }
  function openWatchlist() {
    const body = element('div', 'dialog-list');
    const title = element('h2', '', '내가 찜한 영화');
    title.id = 'dialog-title';
    body.append(title);
    const movies = getWatchlist();
    const track = element('div', 'movie-track');
    track.append(...movies.map(movie => createMovieCard(movie, openMovie)));
    if (!movies.length) track.append(element('p', 'row-state', '마음에 드는 영화의 상세 화면에서 찜해 보세요.'));
    body.append(track);
    content.replaceChildren(body);
    show();
  }
  return { openMovie, openWatchlist };
}
