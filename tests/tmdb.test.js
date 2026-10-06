import test from 'node:test';
import assert from 'node:assert/strict';
import { popularCollections, request, localDate } from '../js/services/tmdb.js';
test('month and year filters handle the year boundary without UTC date shifts', () => {
  const date = new Date(2026,0,1,0,5);
  assert.equal(localDate(date),'2026-01-01');
  assert.equal(localDate(new Date(2024,1,29)),'2024-02-29');
  const urls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async url => { urls.push(new URL(url)); return { ok:true, json:async () => ({results:[]}) }; };
  return (async () => {
    try {
      const collections = popularCollections(date);
      await collections[2].load();
      await collections[3].load();
      assert.equal(urls[0].searchParams.get('primary_release_date.gte'),'2026-01-01');
      assert.equal(urls[1].searchParams.get('primary_release_date.lte'),'2026-01-01');
    } finally { globalThis.fetch = original; }
  })();
});
test('failed requests can be retried and successful requests are cached', async () => {
  const original = globalThis.fetch; let calls = 0;
  const storage = new Map();
  globalThis.sessionStorage = {getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
  globalThis.fetch = async () => { calls++; if (calls === 1) return { ok:false, status:503 }; return { ok:true, json:async () => ({ results:[{ id:1,adult:false }, { id:2,adult:true }] }) }; };
  try {
    await assert.rejects(request('/test-retry'));
    assert.deepEqual((await request('/test-retry')).results,[{ id:1,adult:false },{ id:2,adult:true }]);
    await request('/test-retry'); assert.equal(calls,2);
  } finally { globalThis.fetch = original; delete globalThis.sessionStorage; }
});
