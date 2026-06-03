# Copenhagen Trip Planner — 작업 가이드

코펜하겐 "3 Days of Design 2026" (6/10–12) 페스티벌 여행 플래너 웹앱.  
미주 & 상효 두 사람이 함께 사용하는 2인 협업 여행 계획 앱.

---

## 배포 정보

- **URL**: https://cph-trip.vercel.app
- **플랫폼**: Vercel (GitHub 자동 배포 — `main` 브랜치 push 시 즉시 배포)
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **최신 커밋**: `e4d5d10` (API 공통화·세션 안정화·Python 경로 독립화)

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | 순수 HTML/CSS/JS (프레임워크 없음, 단일 파일) |
| 지도 | Leaflet.js |
| 드래그앤드롭 | SortableJS |
| 백엔드 | Vercel Serverless Functions (`/api/`) |
| AI | Claude API (`claude-sonnet-4-5` 모델) |
| 대중교통 | Rejseplanen 덴마크 공식 API |
| 저장소 | localStorage + Redis (ioredis, `REDIS_URL`) |
| 배포 | Vercel |

---

## 파일 구조

```
cph-trip/
├── index.html              ← 앱 본체 (~6,000줄, CSS+HTML+JS 통합)
├── events-data.js          ← 3DoD 공식 프로그램 데이터 (783개)
├── exhibitions-data.js     ← 브랜드·쇼룸 데이터 (552개 브랜드)
├── api/
│   ├── auth.js             ← 로그인/세션
│   ├── plan.js             ← 일정 서버 저장/불러오기
│   ├── extract.js          ← Claude API 프록시
│   ├── events.js           ← 3DoD 사이트 스크레이핑
│   └── transit.js          ← Rejseplanen 대중교통 프록시
├── lib/
│   ├── http.js             ← API 공통 유틸 (CORS, 메서드 검사, 오류 응답, fetch 타임아웃)
│   └── redis-session.js    ← Redis 연결 + Bearer 세션 헬퍼
├── script_paths.py         ← Python 스크립트 경로 공통 유틸
├── generate_events.py      ← events-data.js 재생성 (로컬용)
├── generate_exhibitions.py ← exhibitions-data.js 재생성 (로컬용)
├── translate_events.py     ← 이벤트 한국어 번역
├── translate_exhibitions.py← 전시 타이틀 한국어 번역
├── translate_exh_desc.py   ← 전시 설명 한국어 번역
├── reclassify_events.py    ← 카테고리 재분류
├── manifest.json           ← PWA 설정
├── sw.js                   ← 서비스 워커 (오프라인 지원)
└── package.json            ← ioredis 의존성 + npm run check
```

---

## Vercel 환경변수 (필수)

| 변수명 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API (장소 분석, AI 드로어) |
| `PASS_MIJU` | 미주 로그인 비밀번호 |
| `PASS_SANGHYO` | 상효 로그인 비밀번호 |
| `REDIS_URL` | Redis 연결 (세션 + 일정 공유 저장) |

> `redis-pink-elephant` 데이터베이스 (Vercel Storage).

---

## 주요 기능

### 탭 구성 (현재)
1. **일정** (`plan`) — 6/8~6/16 날짜별 타임라인. 드래그 순서 변경, 인라인 편집
2. **추천** (`rec`) — 날짜별 추천 장소, 원클릭 일정 추가, 지도 경로 비교
3. **3DoD** (`fest`) — 3 Days of Design 783개 공식 프로그램 (날짜·카테고리·지구 필터)
4. **쇼룸** (`exh`) — 552개 브랜드·쇼룸 (12개 제품 카테고리 필터 + 지구 필터)
5. **＋장소** (`add`) — 자유 텍스트 → Claude API 분석 → 일정 자동 배치 + 위시리스트
6. **지구** (`dist`) — 8개 디자인 지구 목록 (클릭 시 지도 이동)
7. **정보** (`info`) — 코펜하겐 실용 여행 정보

### 쇼룸 탭 제품 카테고리 (getBrandProdCats 함수)
3DoD 공식 12개: 가구/조명/주방/욕실/액세서리/소재/러그·바닥/오디오비주얼/침실/오피스/아웃도어/벽·표면  
키워드 매칭 자동 분류, 분류 안 되면 액세서리로 fallback.

### AI 드로어 (일정 항목 클릭 시)
- **질문 모드** (기본): AI 답변 카드 → 사용자가 "일정 추가" 확인
- **명령 모드** (`삭제해줘`, `이동해줘` 등): 플랜 JSON 직접 수정
- GPS 현재 위치 + 오늘 남은 일정 컨텍스트 포함

### 2인 협업
- 미주/상효 로그인 → 세션 토큰(30일) → Redis
- 일정 참가자 태그 (함께/미주만/상효만) + 공개 설정
- Redis 공유 저장 → 양쪽 기기 동기화

### 일정 특이사항
- 숙소: Sommerstedgade 26, 1718 København (55.6671, 12.5519)
- 아침 달리기 코스: 6/10~6/15 매일 07:00 (5km×3, 7km×3)
  - `_runningCourse:true` 플래그로 식별, patchRunningCourses()로 기존 플랜에 자동 주입

### 지오코딩 핵심 로직 (geocodePlanItem)
1. 숙소/체크인 키워드 → STAY 좌표 즉시
2. 한국어·이모지·이동시간 표현 제거 후 덴마크 주소 추출
3. 4단계 쿼리: 주소만 → 이름+주소 → 이름+정제노트 → 이름만

### 지오코딩 알려진 한계 (향후 개선 필요)
- showFestMarker(): 실제 venue 좌표가 아닌 지구 중심 + 해시 분산 (시각적 분산용)
- Nominatim 클라이언트 직접 호출 (서버 프록시 /api/geocode 미구현)
- AI 반환 좌표 검증 없음

---

## 데이터 재생성

```powershell
# 환경변수 선택 (없으면 ../output/3daysofdesign 자동 탐색)
$env:CPH_TRIP_DATA_DIR = "C:\Users\DOJO_001\Documents\New project\output\3daysofdesign"

python generate_events.py        # events-data.js 재생성
python generate_exhibitions.py   # exhibitions-data.js 재생성
```

---

## 자주 쓰는 Git 작업

```bash
# 변경 후 배포
git add -A && git commit -m "설명"
git push origin main  # talo-lab 계정으로

# 상태 확인
git log --oneline -10
git status

# 문법 검사
npm run check
```

---

## 아키텍처 핵심 결정사항

1. **단일 HTML 파일**: 빠른 이터레이션. 향후 app.js + styles.css 분리 고려
2. **이벤트/전시 데이터 외부 파일**: index.html 경량화
3. **Redis URL 직접 파싱**: REDIS_URL 하나로 ioredis TCP 연결
4. **질문/명령 자동 판별**: 명확한 편집 지시어만 command, 나머지는 question
5. **localStorage 즉시 + Redis debounce**: 로컬 즉시 저장 → 1.5초 후 서버 동기화
6. **lib/http.js 공통화**: API 5개 파일 CORS/메서드/오류 응답 통일

---

## 주목할 이벤트

- **Claude for Creatives** (Workshop 01): 6/10 11:30–13:30 @ KLUB (Anthropic 공식)
- **Entering the Now Symposium**: 매일 2세션, KLUB (Linnésgade 25)
- **Long Table Dinners**: 8개 지구 각 6/10, 6/11 저녁 (650–900 DKK, 예약 필수)
