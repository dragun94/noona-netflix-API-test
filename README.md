# NOONA CINEMA

HTML, CSS, JavaScript(ES modules)로 만든 반응형 영화 소개 메인 페이지입니다. 빌드나 패키지 설치가 필요 없습니다.

## 실행

프로젝트 폴더에서 `npm start`를 실행하고 http://localhost:3000 을 엽니다. 패키지 설치는 필요 없습니다. 또는 `python -m http.server 5500`으로 http://localhost:5500 에서 실행할 수 있습니다. ES modules를 사용하므로 파일을 직접 더블 클릭하지 말고 HTTP 서버로 열어 주세요. VS Code Live Server도 사용할 수 있습니다.

## 구성

- `index.html`: 메인 페이지 및 접근성 마크업
- `css/globals.css`: 공통 디자인 변수와 레이아웃
- `css/components/`: 헤더, 추천 영화, 가로 영화 목록, 상세 모달
- `js/components/`: 영화 카드, 목록, 추천 영화, 상세 모달
- `js/services/`: TMDB 요청·캐시와 찜한 영화 저장
- `js/utils/`: 안전한 DOM 생성과 영화 정보 포맷
- `js/config.js`: API 설정과 장르 목록
- `js/app.js`: 컴포넌트 조립 및 검색

## 영화 목록 기준

- 일간: `/trending/movie/day`
- 주간: `/trending/movie/week`
- 월간: `/discover/movie`, 이번 달부터 오늘까지 개봉한 영화의 현재 인기순
- 연간: `/discover/movie`, 올해부터 오늘까지 개봉한 영화의 현재 인기순
- 장르: `/discover/movie`의 `with_genres` 필터, 현재 인기순

TMDB는 일간·주간 트렌딩만 제공합니다. 월간·연간 목록은 기간별 누적 인기 통계가 아니며, 개봉 기간으로 필터한 현재 인기 목록입니다. 월간·연간에는 최소 10개의 평가가 있는 영화를 표시합니다. 요청에 적힌 `/movie/changes`는 변경된 영화 ID 목록이므로 포스터·제목·평점을 제공하는 영화 조회 엔드포인트로 대체했습니다.

## 동작

가로 스와이프·스크롤 및 이전/다음 버튼, 검색, 영화 상세 모달, 로컬 저장소를 사용하는 찜 기능을 지원합니다. 장르 목록은 화면 근처에 도달할 때 불러오고 API 응답은 세션 내에서 15분간 캐시합니다. 오류나 빈 목록을 표시하고 목록별로 다시 시도할 수 있습니다. 포스터가 없거나 이미지 로드가 실패하면 대체 화면을 표시합니다.

테스트용으로 제공된 API 키는 `js/config.js`에 있습니다. 브라우저 앱의 키는 사용자에게 보이므로 공개 서비스에서는 서버 프록시와 서버 환경변수로 옮기세요.

영화 정보와 이미지는 [TMDB](https://www.themoviedb.org/)에서 제공하며 Netflix와 관련 없는 데모입니다. [인기·트렌딩 기준](https://developer.themoviedb.org/docs/popularity-and-trending), [Discover 문서](https://developer.themoviedb.org/reference/discover-movie).
