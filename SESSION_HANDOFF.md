# CPH-TRIP 세션 이관 문서
_2026-06-03 세션 기준 (3차 업데이트)_

---

## 배포 상태

- **URL**: https://cph-trip.vercel.app
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **미배포 커밋**: 없음 (모두 push 완료)
- **최신 커밋**: `65e904e feat: 전시탭 브랜드 소개문 한국어 번역 완료`

---

## 이번 세션에서 완료한 작업

### 추천 탭 개선
| 커밋 | 내용 |
|---|---|
| `a3aef41` | 단일 클릭 시 장소 정보 패널 (sticky, info-mode) |
| `a3aef41` | 위시리스트 항목도 동선 비교 시스템 참여 |
| `a3aef41` | 위시리스트 ✏️ 수정 (인라인 폼) / ✕ 삭제 버튼 |

### 전시 탭 신규 추가
| 커밋 | 내용 |
|---|---|
| `6e5cfae` | `exhibitions-data.js` 생성 (552개 브랜드, 870개 이벤트) |
| `6e5cfae` | 전시(exh) 탭: 지구·카테고리·날짜 필터, 브랜드 검색 |
| `6e5cfae` | 브랜드 카드 클릭 → 이벤트 목록 펼치기 |
| `69e5888` | 이벤트 타이틀 한국어 번역 870개 (94.8%) |
| `69e5888` | 모바일 필터 레이아웃 → 3개 행 가로 스크롤 (nowrap) |
| `dc152dc` | 이벤트 행 + 버튼 → 날짜 선택 후 일정 추가 |
| `960eed7` | 지구명 영어 원문 복원 (Frederiksstaden 등) |
| `960eed7` | 이벤트 행 클릭 → AI 상세 팝업 (행사탭 구조 동일) |
| `65e904e` | 브랜드 소개문 한국어 번역 549/552개 완료 |

### 행사 탭 개선
| 커밋 | 내용 |
|---|---|
| `960eed7` | 점심(lunch) + 오후 음료(afternoon) → 🥂 브런치·음료 통합 |
| `69e5888` | 필터 3개 행 가로 스크롤 (모바일 공간 최적화) |

### 버그 수정
| 커밋 | 내용 |
|---|---|
| `7af814c` | 모바일 드로어 입력창 가로 overflow → `min-width:0 + width:0` |
| `0c7d00b` | 숙소복귀 이동 note 자동 재계산 (`recalcTransitNotes`) |
| `0c7d00b` | AI 추천 응답 → 식당/장소 요청 시 반드시 `<options>` 카드 반환 |

---

## 현재 파일 구조

```
cph-trip/
├── index.html              ← 앱 본체 (~5500줄)
├── events-data.js          ← 777개 행사 이벤트 (한국어, 카테고리 재분류)
├── exhibitions-data.js     ← 552개 브랜드 / 870개 이벤트 (한국어 번역)
├── sw.js                   ← Network First SW (cph-v4)
├── api/
│   ├── auth.js
│   ├── plan.js
│   ├── extract.js          ← Claude API 프록시
│   ├── events.js
│   └── transit.js
├── lib/
│   └── redis-session.js
├── generate_events.py      ← 행사 데이터 재생성 (로컬용)
├── generate_exhibitions.py ← 전시 데이터 재생성 (로컬용)
├── reclassify_events.py    ← 행사 카테고리 재분류
├── translate_events.py     ← 행사 이벤트 번역 (ANTHROPIC_API_KEY 필요)
├── translate_exhibitions.py← 전시 이벤트 타이틀 번역 (Vercel 프록시)
├── translate_exh_desc.py   ← 전시 브랜드 소개문 번역 (Vercel 프록시)
├── exh_title_cache.json    ← 이벤트 타이틀 번역 캐시 (524개)
├── exh_desc_cache.json     ← 브랜드 소개문 번역 캐시 (552개)
└── SESSION_HANDOFF.md
```

---

## 탭 구성 (현재 7개)

| 탭 | 키 | 내용 |
|---|---|---|
| 일정 | `plan` | 날짜별 타임라인, 드래그 정렬, 인라인 편집 |
| 추천 | `rec` | 위시리스트 + RECOMMEND 일정, 동선 비교 |
| 행사 | `fest` | 777개 이벤트, 필터/검색, AI 팝업 |
| 전시 | `exh` | 552개 브랜드, 870개 이벤트, AI 팝업, 일정 추가 |
| ＋장소 | `add` | 자유 텍스트 → AI 분석 → 일정 배치 |
| 지구 | `dist` | 8개 디자인 지구 목록 |
| 정보 | `info` | 행사 개요, 숙소, 항공편 |

---

## FEST_CATEGORIES (현재, brunch 통합)

```javascript
{key:'all',       label:'전체',        icon:'·'}
{key:'morning',   label:'아침·커피',   icon:'☕', color:'#8b5e3c'}  // ~11시
{key:'brunch',    label:'브런치·음료', icon:'🥂', color:'#9b7ab5'}  // lunch+afternoon 통합
{key:'dining',    label:'저녁 다이닝', icon:'🍽', color:'#c8492a'}
{key:'talk',      label:'토크·패널',   icon:'💬', color:'#2f6b6b'}
{key:'exhibition',label:'전시·오프닝', icon:'🏛', color:'#6d3b54'}
{key:'workshop',  label:'워크숍',      icon:'✂️', color:'#5d7456'}
{key:'tour',      label:'투어·워크',   icon:'🚶', color:'#3a4a5a'}
{key:'wellness',  label:'웰니스',      icon:'🧘', color:'#9c3318'}
{key:'launch',    label:'런칭',        icon:'🚀', color:'#d99021'}
```

*주의: events-data.js 원본은 여전히 `lunch`/`afternoon` 카테고리. renderFestList에서 brunch로 통합 매핑.*

---

## 핵심 데이터 구조 (index.html)

| 기능 | 위치 | 비고 |
|---|---|---|
| 숙소 | `STAY` 객체 ~1400줄 | Sommerstedgade 26, 1718 |
| 고정 일정 | `DEFAULT_PLAN` ~1500줄 | 9일치 |
| 추천 일정 | `RECOMMEND` ~2600줄 | DAY1–DAY7 |
| 행사 카테고리 | `FEST_CATEGORIES` ~2040줄 | 10개 (brunch 통합) |
| 전시 지구 | `EXH_DISTRICTS` ~3460줄 | 8개 (영어 원문) |
| 전시 카테고리 | `EXH_CATS` ~3470줄 | 6개 |
| 전시 AI 팝업 | `openExhEvModal` ~3310줄 | loadExhEvDetail 포함 |
| 이동 note 재계산 | `recalcTransitNotes` ~4010줄 | sortDayByTime에서 자동 호출 |
| AI 드로어 | `_drawerQuestion` ~4940줄 | <options> 강제 프롬프트 |
| 전시 렌더 | `renderExhibitions` ~3520줄 | buildExhCard 포함 |

---

## 번역 스크립트 사용 방법

```bash
# 전시 이벤트 타이틀 재번역 (Vercel 배포 필요)
python translate_exhibitions.py

# 전시 브랜드 소개문 재번역
python translate_exh_desc.py

# exhibitions-data.js 원본 재생성 (번역 제외)
python generate_exhibitions.py
# 이후 위 번역 스크립트 실행

# 행사 이벤트 재번역 (ANTHROPIC_API_KEY 환경변수 필요)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
python translate_events.py
```

---

## 알려진 이슈 / 미완성

- **전시탭 브랜드 소개문**: 3/552 영문 잔류 (특수문자 포함 항목)
- **이벤트 타이틀**: 45/870 영문 잔류 (ECLOS, DEKTON 등 브랜드명 자체가 영문)
- **위시리스트 Nominatim 검색**: 간혹 엉뚱한 결과 (덴마크 한정이지만 완벽하지 않음)
- **6/13 벨뷰·Louisiana, 6/15 크리스티아니아**: 시간 아직 `미정` 상태
- **미주 디바이스 테스트**: 로그인 + 일정 공유 동작 확인 필요

---

## 확정된 고정 일정

| 날짜 | 시간 | 내용 | 상태 |
|---|---|---|---|
| 6/8 | 22:25 | [미주] ICN→AMS 출발 KE5925 | `_fixed` |
| 6/8 | 23:35 | [상효] ICN→CPH 직항 출발 SAS SK0988 | `_fixed` |
| 6/9 | 06:00 | [상효] CPH(T3) 도착 | `_fixed` |
| 6/9 | 08:30 | [미주] CPH(T2) 도착 | `_fixed` |
| 6/9 | 11:30 | Hart Bageri (카다멈 크로아상) | `_fixed` |
| 6/9 | 13:30 | 디자인뮤지엄 덴마크 상설 전시 | `_fixed` |
| 6/9 | 16:00 | The Mechanics of Scent — Frama @ Apotek 57 (예약완료) | `_fixed` |
| 6/10 | 17:00 | Food & Music with SALU (QR코드 보유) | `_fixed` |
| 6/13 | 미정 | 벨뷰 해변 (아르네 야콥센 비치) | 날짜 확정 |
| 6/13 | 미정 | 루이지애나 현대미술관 | 날짜 확정 |
| 6/15 | 미정 | 프리타운 크리스티아니아 | 날짜 확정 |
| 6/16 | 16:40 | [미주] CPH→LHR 출발 SK1517 | `_fixed` |
| 6/16 | 23:55 | [상효] CPH→ICN 직항 출발 SAS SK0987 | `_fixed` |

---

## Redis 저장 구조

| 키 | 내용 |
|---|---|
| `plan` | 전체 일정 JSON (미주·상효 공유) |
| `favs:miju` / `favs:sanghyo` | 즐겨찾기 |
| `wishlist:miju` / `wishlist:sanghyo` | 가고싶은 곳 |

---

## 다음 세션 추천 작업

1. **시간 미정 항목 확정** — 6/13 벨뷰(오전) → Louisiana(오후), 6/15 크리스티아니아 시간 배정
2. **미주 디바이스 테스트** — 미주 폰에서 로그인 + 일정 공유 동작 확인
3. **여행 전 최종 점검** — 예약 필요 항목, 누락된 이동 시간, 전체 일정 흐름 리뷰
4. **전시탭 UX 보완** — 브랜드 카드 열린 상태 세션 유지, 지도 핀 연동
5. **행사탭 날짜 필터 기본값** — 현재 June 10 고정 → 오늘 날짜 기반 자동 전환

---

## Git / 배포

```bash
git push origin main   # origin = git@github-talo:talo-lab/cph-trip.git
git log --oneline -5   # 상태 확인
```
