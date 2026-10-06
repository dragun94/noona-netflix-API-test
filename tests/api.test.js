import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/tmdb.js';

async function call(query, method = 'GET') {
  const response = { headers: {}, setHeader(name, value) { this.headers[name] = value; },
    writeHead(status, headers) { this.status = status; Object.assign(this.headers, headers); },
    end(body) { this.body = JSON.parse(body); } };
  await handler({ method, url: `/api/tmdb?${query}` }, response);
  return response;
}

test('proxy restricts endpoints, credentials, filters and methods before fetching', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { assert.fail('Invalid requests must not reach TMDB'); };
  try {
    for (const query of [
      '', 'endpoint=https://example.com', 'endpoint=/movie/1/videos',
      'endpoint=/search/movie', 'endpoint=/search/movie&query=%20',
      'endpoint=/discover/movie&api_key=injected', 'endpoint=/discover/movie&url=https://example.com',
      'endpoint=/discover/movie&endpoint=/search/movie', 'endpoint=/discover/movie&page=501',
      'endpoint=/discover/movie&with_genres=28&page=1&page=2',
      'endpoint=/discover/movie&primary_release_date.gte=2026-02-30',
      'endpoint=/trending/movie/day&include_adult=true',
    ]) assert.equal((await call(query)).status, 400, query);
    const result = await call('endpoint=/movie/popular', 'POST');
    assert.equal(result.status, 405);
    assert.equal(result.headers.Allow, 'GET');
  } finally { globalThis.fetch = original; }
});

test('proxy forwards supported requests with server credentials and hides failure details', async () => {
  const original = globalThis.fetch;
  const key = process.env.TMDB_API_KEY;
  process.env.TMDB_API_KEY = 'server-only-test-secret';
  const payload = { results: [{ id: 1, title: '테스트' }] };
  const urls = [];
  globalThis.fetch = async (url, options) => {
    urls.push(new URL(url));
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    return { ok: true, json: async () => payload };
  };
  try {
    for (const endpoint of ['/trending/movie/day', '/trending/movie/week', '/movie/popular', '/genre/movie/list', '/movie/123']) {
      assert.deepEqual((await call(new URLSearchParams({ endpoint }))).body, payload);
    }
    await call('endpoint=/discover/movie&with_genres=28&sort_by=popularity.desc&primary_release_date.gte=2026-10-01&primary_release_date.lte=2026-10-06&vote_count.gte=10&page=2');
    await call(new URLSearchParams({ endpoint: '/search/movie', query: '한국 영화 & test' }));
    assert.equal(urls.at(-1).searchParams.get('query'), '한국 영화 & test');
    assert.equal(urls.at(-2).searchParams.get('with_genres'), '28');
    assert.equal(urls.at(-2).searchParams.get('page'), '2');
    for (const url of urls) {
      assert.equal(url.origin, 'https://api.themoviedb.org');
      assert.equal(url.searchParams.get('api_key'), 'server-only-test-secret');
      assert.equal(url.searchParams.get('language'), 'ko-KR');
      assert.equal(url.searchParams.get('include_adult'), 'false');
    }
    for (const [upstream, expected] of [[401,502], [403,502], [404,404], [429,429], [500,502]]) {
      globalThis.fetch = async () => ({ ok: false, status: upstream, json: async () => ({ secret: process.env.TMDB_API_KEY }) });
      const result = await call('endpoint=/movie/popular');
      assert.equal(result.status, expected);
      assert.ok(!JSON.stringify(result.body).includes(process.env.TMDB_API_KEY));
    }
    for (const [name, status] of [['TimeoutError',504], ['TypeError',502]]) {
      globalThis.fetch = async () => { throw Object.assign(new Error('secret upstream URL'), { name }); };
      assert.equal((await call('endpoint=/movie/popular')).status, status);
    }
    delete process.env.TMDB_API_KEY;
    globalThis.fetch = async () => assert.fail('Missing credentials must not fetch');
    assert.equal((await call('endpoint=/movie/popular')).status, 500);
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.TMDB_API_KEY; else process.env.TMDB_API_KEY = key;
  }
});
