현재 이 프로젝트는 순수 HTML/CSS/JavaScript로 만든 영화 소개 웹페이지입니다.

현재 개발은 VSCode에서 진행 중이고,
GitHub에는 이미 push한 상태입니다.

아직 Vercel에는 배포하지 않았습니다.

현재 문제:
TMDB API를 프론트엔드 JavaScript에서 직접 호출하고 있어서,
브라우저 개발자도구 Network 탭에서 `api_key` 값이 노출됩니다.

Vercel에 배포하기 전에 이 문제를 해결하고 싶습니다.

목표:
브라우저에서는 TMDB API Key가 절대 노출되지 않고,
Vercel 서버를 통해서만 TMDB API를 호출하도록 프로젝트 구조를 변경해주세요.

진행 조건:

1. 현재 프로젝트 전체 구조를 먼저 분석해주세요.

2. TMDB API를 호출하는 모든 파일과 코드를 찾아주세요.
   예:

- config.js
- tmdb.js
- app.js
- hero.js
- movie-row.js
- movie-dialog.js
- 기타 JS 파일

3. 현재 프론트엔드에서 아래와 같은 형태로 TMDB를 직접 호출하는 코드를 모두 찾아주세요.

예:
fetch("https://api.themoviedb.org/3/fc4518dd260326a82104ab03046ff869")
또는
?api_key=fc4518dd260326a82104ab03046ff869

4. 프론트엔드에서는 TMDB API를 직접 호출하지 않도록 변경해주세요.

변경 후 구조는 다음처럼 해주세요.

브라우저
→ 내 Vercel API
→ TMDB API

5. Vercel Serverless Function을 사용해주세요.

예를 들어 프로젝트 최상위에:

api/
tmdb.js

같은 서버 파일을 만들어도 됩니다.

단, 현재 프로젝트에 가장 적합한 구조를 먼저 판단해서 구현해주세요.

6. 서버에서 TMDB API를 호출할 때 API Key 또는 토큰은 반드시 환경변수로 사용해주세요.

예:

process.env.TMDB_API_KEY

또는

process.env.TMDB_TOKEN

현재 프로젝트가 기존에 API Key 방식으로 만들어져 있다면,
불필요하게 전체 인증방식을 바꾸지 말고
기존 구조를 최대한 유지하면서 서버에서만 API Key를 사용하도록 변경해주세요.

7. 실제 API Key 값을 코드에 직접 작성하지 마세요.

8. `.env.local` 같은 로컬 환경변수 파일을 사용할 수 있도록 구조를 만들어주세요.

예:

TMDB_API_KEY=실제키

나의 api key값은 fc4518dd260326a82104ab03046ff869입니다.

9. `.env`
   `.env.local`
   `.env.production`
   등 환경변수 파일이 GitHub에 올라가지 않도록
   `.gitignore`를 확인하고 필요한 경우 수정해주세요.

10. 기존에 config.js 등에 API Key가 있다면 제거해주세요.

11. 현재 프로젝트에서 사용하는 영화 기능이 모두 그대로 동작해야 합니다.

예:

- 인기 영화
- Discover
- 검색
- 영화 상세정보
- 장르
- 영화 목록
- 기타 현재 구현된 TMDB 기능

12. UI 디자인은 변경하지 마세요.

13. 기존 기능을 임의로 삭제하지 마세요.

14. 현재 프로젝트가 순수 HTML/CSS/JavaScript 프로젝트라는 점을 고려해서
    지나치게 복잡한 백엔드 구조로 만들지 마세요.

15. 초보자가 이해하기 쉬운 구조를 유지해주세요.

16. 프론트엔드에서 `/api/...` 주소만 호출하도록 변경해주세요.

예:

기존:

fetch(
`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
)

변경:

fetch("/api/tmdb?endpoint=popular")

같은 방식입니다.

단 endpoint 구조는 현재 프로젝트를 분석해서 가장 적절하게 설계해주세요.

17. 서버에서 사용자가 임의의 TMDB URL을 전달해서 호출할 수 있는 구조는 피해주세요.

허용된 endpoint만 서버에서 처리하도록 구성해주세요.

18. 기본적인 API 오류 처리도 추가해주세요.

예:

- TMDB 요청 실패
- 잘못된 요청
- 서버 오류

19. 작업 후 프로젝트 전체를 다시 검색해서 아래 값이 프론트엔드에 남아있는지 확인해주세요.

검색 항목:

api_key
API_KEY
TMDB_API_KEY
TMDB_TOKEN
api.themoviedb.org
Bearer

20. `api.themoviedb.org`는 서버 파일 안에 존재하는 것은 괜찮지만,
    프론트엔드 JavaScript에서 직접 TMDB API를 호출하는 코드는 남아있으면 안 됩니다.

21. 아직 Vercel에는 배포하지 않은 상태입니다.

따라서 코드 수정까지만 진행해주세요.

Vercel 계정에 로그인하거나
Vercel 프로젝트를 만들거나
환경변수를 실제로 등록하거나
배포를 실행하지는 마세요.

22. GitHub에는 이미 현재 버전이 push되어 있습니다.

코드 수정 후에는 바로 git push하지 말고,
내가 변경 내용을 확인할 수 있도록 작업만 완료해주세요.

23. 기존 git history를 수정하거나
    reset, rebase, force push 같은 작업은 하지 마세요.

24. package.json이나 다른 설정파일을 새로 만들어야 한다면
    정말 필요한 경우에만 추가해주세요.

25. 로컬에서 테스트할 때 Live Server만으로 `/api` 서버 함수가 동작하지 않을 수 있으므로,
    필요하다면 Vercel CLI를 이용한 테스트 방법도 알려주세요.

작업이 끝난 후 반드시 아래 내용을 정리해서 알려주세요.

1. 현재 프로젝트에서 API Key가 노출되던 원인

2. 어떤 파일을 수정했는지

3. 어떤 파일을 새로 만들었는지

4. 어떤 코드를 삭제했는지

5. 프론트엔드 API 호출 구조가 어떻게 변경되었는지

6. 서버 API 구조가 어떻게 만들어졌는지

7. 내가 `.env.local`에 작성해야 하는 환경변수 이름

8. 내가 직접 해야 하는 작업

9. 로컬에서 테스트하는 정확한 방법

10. Vercel에 나중에 배포할 때 환경변수를 어떻게 등록해야 하는지

11. 배포 후 Chrome DevTools Network 탭에서 무엇을 확인해야 하는지

12. 현재 코드에서 API Key가 프론트엔드에 남아있는지 최종 점검 결과

13. 변경된 전체 파일 목록

분석 후 바로 코드 수정까지 진행해주세요.
