# NOONA CINEMA

HTML, CSS, JavaScript(ES modules)로 만든 반응형 영화 소개 메인 페이지입니다. 빌드나 패키지 설치가 필요 없습니다.

## 실행

Node.js 22 이상을 사용합니다. 프로젝트 최상위의 `.env.local`에 다음 줄을 추가하세요. 기존 파일이 있다면 덮어쓰지 말고 아래 변수만 추가합니다.

```dotenv
TMDB_API_KEY=본인의_TMDB_API_키
```

변수 형식은 `.env.example`을 참고하세요. 실제 키는 `js/` 파일이나 Git에 넣지 않습니다. 기존 키는 이미 브라우저 코드와 GitHub에 노출되었으므로 TMDB에서 교체한 키를 사용하는 것을 권장합니다.

프로젝트 폴더에서 아래 명령을 실행한 후 http://localhost:3000 을 엽니다. 패키지 설치나 Vercel 로그인은 필요 없습니다.

```powershell
npm.cmd start
```

Windows PowerShell에서 실행 정책 때문에 `npm`이 막히면 위와 같이 `npm.cmd`를 사용하세요. 로컬 서버가 `.env.local`을 읽고 Vercel과 동일한 `api/tmdb.js` 함수를 실행합니다. 환경변수를 수정하면 서버를 Ctrl+C로 종료하고 다시 실행하세요. Live Server나 `python -m http.server`는 `/api/tmdb`를 실행하지 못하므로 영화 데이터 테스트에는 사용할 수 없습니다.

테스트는 `npm.cmd test`로 실행합니다. 요청 경로·필터 검증, 서버 환경변수 사용, 오류 응답에서 비밀정보 제거, 프론트엔드 캐시 및 기간 필터를 확인하며 실제 TMDB를 호출하지 않습니다.

## 구성

- `index.html`: 메인 페이지 및 접근성 마크업
- `css/globals.css`: 공통 디자인 변수와 레이아웃
- `css/components/`: 헤더, 추천 영화, 가로 영화 목록, 상세 모달
- `js/components/`: 영화 카드, 목록, 추천 영화, 상세 모달
- `js/services/`: TMDB 요청·캐시와 찜한 영화 저장
- `js/utils/`: 안전한 DOM 생성과 영화 정보 포맷
- `js/config.js`: 공개 이미지 주소와 장르 목록
- `js/app.js`: 컴포넌트 조립 및 검색
- `api/tmdb.js`: Vercel Node.js 서버 함수, 요청 검증과 서버 환경변수 인증
- `server.js`: 로컬 정적 파일 서버와 동일한 API 함수 연결
- `vercel.json`: 순수 정적 사이트 설정 및 공개 경로 제한
- `.vercelignore`: 배포 파일 제한 (`prompt.md`, 환경변수 파일, 백업, 테스트 등 제외)
- `.env.example`: 비밀 값이 없는 환경변수 예시

## 영화 목록 기준

- 일간: `/trending/movie/day`
- 주간: `/trending/movie/week`
- 월간: `/discover/movie`, 이번 달부터 오늘까지 개봉한 영화의 현재 인기순
- 연간: `/discover/movie`, 올해부터 오늘까지 개봉한 영화의 현재 인기순
- 장르: `/discover/movie`의 `with_genres` 필터, 현재 인기순

TMDB는 일간·주간 트렌딩만 제공합니다. 월간·연간 목록은 기간별 누적 인기 통계가 아니며, 개봉 기간으로 필터한 현재 인기 목록입니다. 월간·연간에는 최소 10개의 평가가 있는 영화를 표시합니다. 요청에 적힌 `/movie/changes`는 변경된 영화 ID 목록이므로 포스터·제목·평점을 제공하는 영화 조회 엔드포인트로 대체했습니다.

## 동작

가로 스와이프·스크롤 및 이전/다음 버튼, 검색, 영화 상세 모달, 로컬 저장소를 사용하는 찜 기능을 지원합니다. 장르 목록은 화면 근처에 도달할 때 불러오고 API 응답은 세션 내에서 15분간 캐시합니다. 오류나 빈 목록을 표시하고 목록별로 다시 시도할 수 있습니다. 포스터가 없거나 이미지 로드가 실패하면 대체 화면을 표시합니다.

## API 호출 구조

브라우저 → `/api/tmdb` → TMDB 순서로 요청합니다. 예를 들어 `/api/tmdb?endpoint=/trending/movie/day`, `/api/tmdb?endpoint=/search/movie&query=영화`를 호출합니다. 실제 키는 서버가 `process.env.TMDB_API_KEY`에서 읽어 TMDB 요청에만 추가합니다. 요청 캐시·중복 요청 병합·검색 취소 기능을 유지했습니다.

서버는 일간/주간 트렌딩, 인기 영화, Discover, 검색, 장르 목록, 양의 영화 ID를 사용하는 상세 조회만 허용합니다. 페이지, 검색어, 장르, 정렬, 개봉일, 최소 평가 수도 경로별로 검증합니다. 임의 URL, 인증 파라미터, 성인 필터 변경, 중복 파라미터는 거절합니다. 잘못된 요청은 400, GET 이외 메서드는 405, 서버 키 미설정은 500, TMDB 실패는 502, 제한 초과는 429, 없는 영화는 404, 시간 초과는 504로 응답합니다. TMDB 오류 원문과 요청 URL은 브라우저에 전달하지 않습니다.

현재 상세 모달은 목록 응답의 영화 정보를 사용하며 별도 상세 API를 호출하지 않습니다. 장르 이름도 기존 고정 목록을 유지합니다. 이미지 요청은 키가 필요 없는 `image.tmdb.org` 주소를 계속 사용합니다.

## 나중에 Vercel에서 테스트·배포할 때

현재 작업은 코드 수정만 진행하며 로그인, 프로젝트 생성, 환경변수 등록, 배포, Git push를 수행하지 않습니다.

배포할 때 Framework Preset은 **Other**, 프로젝트 루트는 이 폴더로 설정합니다. `vercel.json`은 빌드 없이 현재 정적 파일과 `api/tmdb.js` 함수를 사용하도록 구성합니다. 프로젝트 **Settings → Environment Variables**에서 이름 `TMDB_API_KEY`, 값 본인의 키를 등록하고 **Production**, **Preview**, 필요하면 **Development** 환경에 적용하세요. 환경변수를 등록하거나 변경한 뒤 배포를 새로 실행해야 적용됩니다. 브라우저용 공개 접두사는 붙이지 마세요.

Vercel 실행 환경 자체를 확인하고 싶다면, 사용자가 직접 올바른 프로젝트 연결을 확인한 뒤 `npx vercel dev`를 실행할 수 있습니다. 이 명령은 로그인이나 프로젝트 연결을 요구할 수 있으므로 현재 단계에서는 위의 `npm.cmd start`가 적합합니다. 현재 로컬 `.vercel/project.json`은 `noona-portfolio-website`라는 프로젝트를 가리키므로 나중에 CLI를 사용하기 전에 이 영화 프로젝트의 연결인지 확인하세요. 기존 연결은 수정하지 않았습니다.

배포 후 Chrome DevTools에서 **Network → Disable cache**를 켜고 **Application → Session storage**의 `noona:tmdb:` 캐시를 지운 뒤 새로고침하세요. 일간·주간·월간·연간, 장르, 검색, 상세 모달, 찜 기능을 확인합니다.

- 영화 JSON 요청이 같은 사이트의 `/api/tmdb?...`로 가고 상태가 200인지 확인합니다.
- 요청 URL·헤더·응답에 실제 키나 `api_key` 인증값이 없는지 확인합니다.
- 브라우저에서 `api.themoviedb.org`로 나가는 요청이 없는지 확인합니다. `image.tmdb.org` 이미지 요청은 정상입니다.
- `/prompt.md`, `/.env.local`, `/server.js`, `/api/tmdb.js`는 404인지 확인합니다.
- 키 미설정·TMDB 오류 시 화면에서 오류 메시지와 재시도가 표시되는지 확인합니다.

`prompt.md`에는 사용자가 입력한 키가 남아 있으므로 새 키를 적지 마세요. 서버와 배포 설정에서 이 파일의 공개를 차단하지만 기존 Git 기록의 키까지 제거하지는 않습니다.

참고: [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js), [환경변수](https://vercel.com/docs/environment-variables), [vercel dev](https://vercel.com/docs/cli/dev), [.vercelignore](https://vercel.com/docs/deployments/vercel-ignore).

영화 정보와 이미지는 [TMDB](https://www.themoviedb.org/)에서 제공하며 Netflix와 관련 없는 데모입니다. [인기·트렌딩 기준](https://developer.themoviedb.org/docs/popularity-and-trending), [Discover 문서](https://developer.themoviedb.org/reference/discover-movie).
