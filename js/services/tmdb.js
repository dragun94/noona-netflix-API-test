const pending = new Map();
const CACHE_TTL = 15 * 60 * 1000;

export async function request(path, params = {}, { signal } = {}) {
  const query = new URLSearchParams({ ...params, endpoint: path });
  const url = `/api/tmdb?${query}`;
  const cacheKey = `noona:tmdb:${path}:${JSON.stringify(params)}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey));
    if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
  } catch { /* Storage can be unavailable in private browsing. */ }
  if (!signal && pending.has(url)) return pending.get(url);
  const task = (async () => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 12000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        if (response.status === 400) throw new Error('잘못된 영화 정보 요청입니다.');
        if (response.status === 429) throw new Error('요청이 많습니다. 잠시 후 다시 시도해 주세요.');
        throw new Error('영화 정보를 가져오지 못했습니다.');
      }
      const data = await response.json();
      try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data })); } catch { /* Cache is optional. */ }
      return data;
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error.name === 'AbortError') throw new Error('연결 시간이 초과됐습니다. 다시 시도해 주세요.');
      if (error instanceof TypeError) throw new Error('인터넷 연결을 확인하고 다시 시도해 주세요.');
      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  })();
  if (!signal) pending.set(url, task);
  try { return await task; } finally { if (!signal) pending.delete(url); }
}

export function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function popularCollections(now = new Date()) {
  const end = localDate(now);
  const discover = { sort_by: 'popularity.desc', 'primary_release_date.lte': end, 'vote_count.gte': 10 };
  return [
    { id: 'daily', title: '오늘의 인기 영화', tag: 'DAILY TOP 20', description: '오늘 가장 주목받는 영화', load: () => request('/trending/movie/day') },
    { id: 'weekly', title: '이번 주 인기 영화', tag: 'WEEKLY', description: '지난 7일간의 트렌딩', load: () => request('/trending/movie/week') },
    { id: 'monthly', title: '이번 달 인기 영화', tag: 'MONTHLY', description: '이번 달 개봉작 · 현재 인기순', load: () => request('/discover/movie', { ...discover, 'primary_release_date.gte': localDate(new Date(now.getFullYear(), now.getMonth(), 1)) }) },
    { id: 'yearly', title: '올해의 인기 영화', tag: String(now.getFullYear()), description: '올해 개봉작 · 현재 인기순', load: () => request('/discover/movie', { ...discover, 'primary_release_date.gte': `${now.getFullYear()}-01-01` }) },
  ];
}

export const genreMovies = id => request('/discover/movie', { with_genres: id, sort_by: 'popularity.desc', 'primary_release_date.lte': localDate(new Date()) });
export const searchMovies = (query, signal) => request('/search/movie', { query }, { signal });
