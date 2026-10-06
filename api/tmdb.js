// Only these TMDB paths and their filters can be requested by the browser.
const endpoints = new Map([
  ["/trending/movie/day", []],
  ["/trending/movie/week", []],
  ["/movie/popular", []],
  [
    "/discover/movie",
    [
      "with_genres",
      "sort_by",
      "primary_release_date.gte",
      "primary_release_date.lte",
      "vote_count.gte",
    ],
  ],
  ["/search/movie", ["query"]],
  ["/genre/movie/list", []],
]);

function validParameter(name, value) {
  if (name === "query") return value.trim().length > 0 && value.length <= 200;
  if (name === "page")
    return /^[1-9]\d{0,2}$/.test(value) && Number(value) <= 500;
  if (name === "with_genres") return /^[1-9]\d{0,5}$/.test(value);
  if (name === "sort_by") return value === "popularity.desc";
  if (name === "vote_count.gte") return /^\d{1,6}$/.test(value);
  if (name.startsWith("primary_release_date.")) {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
    );
  }
  return false;
}

export default async function handler(request, response) {
  const send = (status, data) => {
    response.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(JSON.stringify(data));
  };
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return send(405, { error: "GET 요청만 허용됩니다." });
  }
  try {
    const input = new URL(request.url, "http://localhost").searchParams;
    const endpoint = input.get("endpoint");
    // A positive movie ID is also allowed for movie details.
    const detail = /^\/movie\/[1-9]\d{0,9}$/.test(endpoint || "");
    if (!endpoints.has(endpoint) && !detail)
      return send(400, { error: "허용되지 않은 endpoint입니다." });
    const allowed = new Set([
      "endpoint",
      ...(detail ? [] : endpoints.get(endpoint)),
      ...(endpoint === "/genre/movie/list" || detail ? [] : ["page"]),
    ]);
    const params = new URLSearchParams({
      language: "ko-KR",
      include_adult: "false",
    });
    for (const [name, value] of input) {
      if (
        !allowed.has(name) ||
        input.getAll(name).length !== 1 ||
        (name !== "endpoint" && !validParameter(name, value))
      ) {
        return send(400, { error: "잘못된 요청 파라미터입니다." });
      }
      if (name !== "endpoint") params.set(name, value);
    }
    if (endpoint === "/search/movie" && !params.has("query"))
      return send(400, { error: "검색어가 필요합니다." });
    const key = process.env.TMDB_API_KEY?.trim();
    if (!key)
      return send(500, { error: "서버의 영화 정보 설정이 필요합니다." });
    params.set("api_key", key);
    const upstream = await fetch(
      `https://api.themoviedb.org/3${endpoint}?${params}`,
      {
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      },
    );
    if (!upstream.ok) {
      const status =
        upstream.status === 429 ? 429 : upstream.status === 404 ? 404 : 502;
      return send(status, {
        error:
          status === 429
            ? "요청이 많습니다. 잠시 후 다시 시도해 주세요."
            : "영화 정보를 가져오지 못했습니다.",
      });
    }
    // Do not forward upstream headers or upstream error bodies containing request details.
    return send(200, await upstream.json());
  } catch (error) {
    return send(
      error.name === "TimeoutError" || error.name === "AbortError" ? 504 : 502,
      {
        error:
          "영화 정보 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
    );
  }
}
