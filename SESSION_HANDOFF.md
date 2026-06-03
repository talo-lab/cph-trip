# CPH-TRIP 세션 이관 문서
_2026-06-03 세션 기준 (2차 업데이트)_

---

## 배포 상태

- **URL**: https://cph-trip.vercel.app
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **미배포 커밋**: 없음 (모두 push 완료)
- **최신 커밋**: `03fa033 feat: 다이닝 카테고리 시간대별 세분화`

---

## 이번 세션에서 완료한 작업

### 일정탭 개선
| 커밋 | 내용 |
|---|---|
| `0783e72` | 시간 필드 인라인 편집 (클릭 → contenteditable, HH:MM 자동 포맷) |
| `0783e72` | + 일정 추가 시 이전 항목 기준 이동시간 note 자동 삽입 + 포커스 |

### AI 드로어 UX 재설계
| 커밋 | 내용 |
|---|---|
| `44266db` | `<options>` 태그로 2~4개 선택형 카드 렌더링 |
| `44266db` | 카드 선택 → 하단 확정 바 (제목·시간·날짜 인라인 편집) |
| `44266db` | 시간 미정 시 17:00~21:00 시간 칩 자동 출현 |
| `44266db` | 단일 추천은 기존 `<add>` 태그 fallback 유지 |

### 위시리스트 (가고싶은 곳 목록) 전면 개선
| 커밋 | 내용 |
|---|---|
| `0245ae9` | Nominatim 실시간 검색 + 추천탭 위시리스트 섹션 |
| `58c188f` | Google Maps 링크 탭 추가, 카테고리 자동 분류, 검색 덴마크 한정 |
| `3dd363d` | 링크 모드 장소명 직접 입력 필드, 일정추가 시간칩+이동거리 패널 |
| `b206ff6` | 3DoD 기간(6/10~12) 방문 여부 토글 + 🎪 뱃지 |

### 지도 핀 + 범례 시인성 개선
| 커밋 | 내용 |
|---|---|
| `9df3f03` | 핀: 순번+카테고리 아이콘 카드형, 고정 항목 🔒 구분 |
| `9df3f03` | 범례: 날짜 컬러 뱃지, 지구 정사각 블록, 섹션 헤더 |

### 이벤트 카테고리 수정
| 커밋 | 내용 |
|---|---|
| `db450c7` | reclassify_events.py 규칙 추가 → dining→exhibition 109건 수정 |
| `03fa033` | 다이닝 시간대별 세분화: 아침☕/점심🥗/오후음료🥂/저녁🍽 |

---

## 현재 파일 구조

```
cph-trip/
├── index.html          ← 앱 본체 (~4500줄)
├── events-data.js      ← 777개 이벤트 (카테고리 재분류 완료)
├── sw.js               ← Network First SW (cph-v4)
├── api/
│   ├── auth.js
│   ├── plan.js         ← GET/POST plan+favs+wishlist (Redis)
│   ├── extract.js      ← Claude API 프록시
│   ├── events.js
│   └── transit.js
├── lib/
│   └── redis-session.js
├── translate_events.py
├── reclassify_events.py  ← 카테고리 재분류 스크립트 (개선됨)
└── SESSION_HANDOFF.md
```

---

## 핵심 데이터 구조 (index.html)

| 기능 | 위치 | 비고 |
|---|---|---|
| 숙소 | `STAY` 객체 ~1277줄 | Sommerstedgade 26, 1718 |
| Google Maps 매핑 | `PLACE_MAP` ~977줄 | 70개 항목 |
| 고정 일정 | `DEFAULT_PLAN` ~1290줄 | 9일치 |
| 추천 일정 | `RECOMMEND` ~2330줄 | DAY1–DAY7 |
| 이벤트 카테고리 | `FEST_CATEGORIES` ~1807줄 | 11개 (다이닝 4분류) |
| 위시리스트 렌더 | `renderWishList()` ~3480줄 | 검색/링크/3DoD토글 |
| AI 드로어 | `_drawerQuestion()` ~3820줄 | 선택형 카드 UX |
| 드로어 렌더 | `_renderDrawerOptions()` ~3880줄 | 카드·칩·확정 바 |
| 지도 핀 | `renderPlanMarkers()` ~1553줄 | ppv2 클래스, 순번 |
| 범례 렌더 | ~4520줄 | leg-day-badge, leg-dist-sq |

---

## FEST_CATEGORIES (현재)

```javascript
{key:'all',       label:'전체',       icon:'·' }
{key:'morning',   label:'아침·커피',  icon:'☕', color:'#8b5e3c'}  // ~11시, 56건
{key:'lunch',     label:'점심',       icon:'🥗', color:'#5d7456'}  // 11~14시, 51건
{key:'afternoon', label:'오후 음료',  icon:'🥂', color:'#9b7ab5'}  // 14~17시, 88건
{key:'dining',    label:'저녁 다이닝',icon:'🍽', color:'#c8492a'}  // 17시~, 46건
{key:'talk',      label:'토크·패널',  icon:'💬', color:'#2f6b6b'}  // 177건
{key:'exhibition',label:'전시·오프닝',icon:'🏛', color:'#6d3b54'}  // 130건
{key:'workshop',  label:'워크숍',     icon:'✂️', color:'#5d7456'}  // 92건
{key:'tour',      label:'투어·워크',  icon:'🚶', color:'#3a4a5a'}  // 85건
{key:'wellness',  label:'웰니스',     icon:'🧘', color:'#9c3318'}  // 33건
{key:'launch',    label:'런칭',       icon:'🚀', color:'#d99021'}  // 20건
```

---

## 위시리스트 아이템 구조

```javascript
{
  title: '장소명',
  note: '메모',
  addedBy: 'sanghyo' | 'miju',
  addedAt: timestamp,
  _lat: 55.664,        // Nominatim 또는 GMaps 파싱
  _lng: 12.622,
  _gmapsUrl: 'https://...',
  address: '주소 텍스트',
  _festOnly: true,     // 3DoD 기간(6/10~12) 방문 필요
}
```

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

## 알려진 이슈 / 미완성

- 위시리스트 Nominatim 검색: 덴마크 한정이지만 간혹 엉뚱한 결과 나올 수 있음
- 추천탭 위시리스트 섹션: 고정 일정 기반 날짜 제안이 있으나 정밀도 보완 가능
- 6/13 벨뷰·Louisiana, 6/15 크리스티아니아 시간 아직 `미정` 상태

---

## 다음 세션 추천 작업

1. **시간 미정 항목 확정** — 6/13 벨뷰(오전) → Louisiana(오후), 6/15 크리스티아니아 시간 배정
2. **미주 디바이스 테스트** — 미주 폰에서 로그인 + 일정 공유 동작 확인
3. **여행 전 최종 점검** — 예약 필요 항목, 누락된 이동 시간 등 전반 리뷰
4. **cph-trip-v2 병합** — v2 리팩토링 레포 참고 (`MAIN_MIGRATION_GUIDE.md`)

---

## Git / 배포

```bash
git push origin main   # origin = git@github-talo:talo-lab/cph-trip.git
git log --oneline -5   # 상태 확인
```
