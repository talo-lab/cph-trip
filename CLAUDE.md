# Copenhagen Trip Planner — 작업 가이드

코펜하겐 "3 Days of Design 2026" (6/10–12) 페스티벌 여행 플래너 웹앱.  
미주 & 상효 두 사람이 함께 사용하는 2인 협업 여행 계획 앱.

---

## 배포 정보

- **URL**: https://cph-trip.vercel.app
- **플랫폼**: Vercel (GitHub 자동 배포 — `main` 브랜치 push 시 즉시 배포)
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`

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
├── index.html          ← 앱 본체 (164KB, CSS+HTML+JS 통합)
├── events-data.js      ← 행사 이벤트 데이터 (228KB, 700+개 이벤트)
├── api/
│   ├── auth.js         ← 로그인/세션 (ioredis + REDIS_URL)
│   ├── plan.js         ← 일정 서버 저장/불러오기 (ioredis)
│   ├── extract.js      ← Claude API 프록시
│   ├── events.js       ← 3dod 공식 사이트 스크레이핑 (JS렌더링으로 제한적)
│   └── transit.js      ← Rejseplanen 대중교통 프록시
├── generate_events.py  ← 이벤트 데이터 재생성 스크립트 (로컬용)
├── manifest.json       ← PWA 설정
├── sw.js               ← 서비스 워커 (오프라인 지원)
└── package.json        ← ioredis 의존성
```

---

## Vercel 환경변수 (필수)

| 변수명 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API (장소 분석, AI 드로어) |
| `PASS_MIJU` | 미주 로그인 비밀번호 |
| `PASS_SANGHYO` | 상효 로그인 비밀번호 |
| `REDIS_URL` | Redis 연결 (세션 + 일정 공유 저장) |

> `REDIS_URL`은 ioredis가 직접 파싱 (`rediss://default:TOKEN@HOST:PORT` 형식).  
> `redis-pink-elephant` 데이터베이스가 현재 연결되어 있음 (Vercel Storage).

---

## 주요 기능

### 탭 구성
1. **일정** — 6/8~6/16 날짜별 타임라인. 드래그로 순서 변경, 인라인 편집
2. **추천** — 날짜별 추천 장소, 원클릭 일정 추가, 지도 경로 비교
3. **행사** — 3 Days of Design 796개 이벤트 (날짜·카테고리·지구 필터)
4. **＋장소** — 자유 텍스트 → Claude API 분석 → 일정 자동 배치
5. **지구** — 8개 디자인 지구 목록 (클릭 시 지도 이동)
6. **정보** — 코펜하겐 실용 여행 정보

### AI 드로어 (일정 항목 클릭 시)
- **질문 모드** (기본): AI가 답변 카드 생성 → 사용자가 "일정 추가" 버튼으로 확인
  - GPS 현재 위치 + 오늘 남은 일정을 컨텍스트로 포함
  - `<add>{"title":"...","time":"HH:MM","note":"...","day_index":N}</add>` 태그로 추가 제안
- **명령 모드** (`삭제해줘`, `이동해줘` 등): 플랜 JSON 직접 수정

### 2인 협업
- 미주/상효 로그인 → 세션 토큰(30일) → Redis 저장
- 일정에 참가자 태그 (함께/미주만/상효만) + 공개 설정
- Redis에 공유 저장 → 양쪽 기기에서 실시간 동기화

### 모바일 UX
- 지도 바텀 시트: 드래그 핸들로 3단계 스냅 (10% / 44% / 80%)
- 터치 기기에서 × 버튼 숨김, 드래그 핸들 항상 표시 (50% 불투명도)
- SortableJS `delay:150, delayOnTouchOnly:true` 로 스크롤과 드래그 구분

---

## 행사 이벤트 데이터 (`events-data.js`)

스크레이핑 출처: https://www.3daysofdesign.dk/events (2026-06-03 기준)

| 구분 | 개수 |
|---|---|
| June 10 일반 이벤트 | 309개 |
| June 11 일반 이벤트 | 295개 |
| June 12 일반 이벤트 | 96개 |
| Long Table Dinners | 8종 × 2일 = 16개 (650–900 DKK, 예약 필수) |
| Symposium (Entering the Now) | 5세션 + 2워크숍 = 7개 (250 DKK) |
| Design Walks | 10종 × 3일 × 2슬롯 = 60개 (250 DKK) |
| **합계** | **783개** |

이벤트 데이터 재생성 방법:
```bash
python generate_events.py
# 소스: C:\Users\DOJO_001\Documents\New project\output\3daysofdesign\
```

주목할 이벤트:
- **Claude for Creatives** (Workshop 01): 6/10 11:30–13:30 @ KLUB (Anthropic 공식 참여)
- **Entering the Now Symposium**: 매일 2세션, KLUB (Linnésgade 25)
- **Long Table Dinners**: 8개 지구에서 각각 6/10, 6/11 저녁

---

## 알려진 이슈 / 미완성 작업

### 현재 미배포 커밋 (로컬에만 있음)
`git push origin main` 필요 (권한은 `talo-lab` 계정으로):
- `de74609` Redis ioredis 연결 수정
- `cd52bb0` 지도 원형 음영 제거
- `31eb749` 드로어 Q&A 모드
- `5acac3e` 모바일 맵 바텀 시트
- `17c6656` 모바일 × 버튼 숨김 + 드래그 핸들 개선
- `ce5ab4f` 행사 이벤트 6/11, 6/12 추가
- `49716b2` events-data.js 분리 (현재 최신)

### 미완성 기능
- 모바일 빨간 동그라미 체크 이슈 → 원인 미확정 (`.item-x` 터치 호버 의심)
- 드로어 로그인 (미주/상효) 후 서버 연결 확인 필요
- `generate_events.py`는 로컬 전용 (repo에는 포함되나 배포 불필요)

---

## 자주 쓰는 Git 작업

```bash
# 변경 후 배포
git add -A && git commit -m "설명"
git push origin main  # talo-lab 계정으로

# 상태 확인
git log --oneline -10
git status
```

---

## 아키텍처 핵심 결정사항

1. **단일 HTML 파일**: 빠른 이터레이션. 복잡해지면 분리 고려
2. **이벤트 데이터 외부 파일**: `events-data.js` 분리로 index.html 경량화
3. **Redis URL 직접 파싱**: `REDIS_URL` 하나로 REST 없이 ioredis TCP 연결
4. **질문/명령 자동 판별**: 명확한 편집 지시어(`삭제해줘` 등)만 command, 나머지는 question
5. **localhost 저장 + 서버 동기화**: localStorage 즉시 → 1.5초 debounce 후 Redis 저장
