export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export const movieTitle = movie => movie.title || movie.original_title || '제목 없음';
export const movieYear = movie => movie.release_date?.slice(0, 4) || '개봉일 미정';
export const movieScore = movie => movie.vote_count > 0 && Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : '평가 없음';
