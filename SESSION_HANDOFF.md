# CPH-TRIP 세션 이관 문서
_2026-06-03 세션 기준 (4차 업데이트)_

---

## 배포 상태

- **URL**: https://cph-trip.vercel.app
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **미배포 커밋**: 없음 (모두 push 완료)
- **최신 커밋**: `4c712af feat: 전시 카드 탭 → 지도 핀 + 일정 추가 시 자동 지오코딩`

---

## 이번 세션에서 완료한 작업

### 일정 탭 개선
| 커밋 | 내용 |
|---|---|
| `a59a2d7` | 체크박스 → 지도 선택/해제 토글 (행 클릭 시 재클릭으로 해제) |
| `a59a2d7` | 시간 경과 항목 자동 음영 (`isPlanItemPast` + 1분 인터벌) |
| `a59a2d7` | 진행률 바 → 경과 시간 비율로 자동 계산 |
| `d57c94c` | 경로선 `_dk` 좌표 포함 (`getItemCoords` 통일 사용) |
| `d57c94c` | 다른 날 항목 선택 시 해당 날짜 핀 자동 전환 |

### AI 드로어 개선
| 커밋 | 내용 |
|---|---|
| `ea5dcaa` | 드로어 헤더 🗑 삭제 버튼 추가 (고정 항목 숨김) |
| `ea5dcaa` | AI 옵션 카드 `action:"delete"` 지원 → 클릭 시 실제 삭제 |
| `ea5dcaa` | AI 프롬프트에 삭제 케이스 형식 추가 |

### 전시 탭 버그 수정
| 커밋 | 내용 |
|---|---|
| `bb4cf0a` | SW `cph-v5` — `exhibitions-data.js` 사전 캐시 추가 |
| `bb4cf0a` | `renderExhibitionsList` 방어 코드 (EXHIBITIONS 미정의 시 안내) |
| `e560dc5` | `exhibitions-data.js` desc 필드 따옴표 구문 오류 11개 수정 |

### 지도 / 지구 탭 / 지오코딩
| 커밋 | 내용 |
|---|---|
| `3f04189` | 지구 탭 카드: 전시 브랜드 수 + 이벤트 수 표시 |
| `3f04189` | 지구 탭 카드: "전시 N개 ▸" 버튼 → 전시탭 해당 지구 필터 이동 |
| `4c712af` | 전시 카드 탭 → Nominatim 지오코딩 → 지도 핀 표시 |
| `4c712af` | 주소 `📍` 단독 탭 → 지도 핀 (이벤트 목록 토글 없이) |
| `4c712af` | 일정 추가(confirmAddBtn) 시 백그라운드 지오코딩 |
| `4c712af` | 제목 편집 완료(blur) 시 좌표 없는 항목 자동 지오코딩 |
| `4c712af` | 좌표 없는 항목 선택 시 "검색 중..." 표시 + 재시도 |

---

## 현재 파일 구조

```
cph-trip/
├── index.html              ← 앱 본체 (~5700줄)
├── events-data.js          ← 777개 행사 이벤트
├── exhibitions-data.js     ← 552개 브랜드 / 870개 이벤트 (구문 오류 수정 완료)
├── sw.js                   ← Network First SW (cph-v5, exhibitions-data.js 캐시 추가)
├── api/
│   ├── auth.js
│   ├── plan.js
│   ├── extract.js
│   ├── events.js
│   └── transit.js
├── lib/
│   └── redis-session.js
├── generate_events.py
├── generate_exhibitions.py
├── translate_events.py
├── translate_exhibitions.py
├── translate_exh_desc.py
├── exh_title_cache.json
├── exh_desc_cache.json
└── SESSION_HANDOFF.md
```

---

## 탭 구성 (현재 7개)

| 탭 | 키 | 내용 |
|---|---|---|
| 일정 | `plan` | 날짜별 타임라인, 드래그 정렬, 체크박스=지도 선택 |
| 추천 | `rec` | 위시리스트 + RECOMMEND 일정, 동선 비교 |
| 행사 | `fest` | 777개 이벤트, 필터/검색, AI 팝업 |
| 전시 | `exh` | 552개 브랜드, 870개 이벤트, 카드 탭 → 지도 핀 |
| ＋장소 | `add` | 자유 텍스트 → AI 분석 → 일정 배치 |
| 지구 | `dist` | 8개 지구 · 행사수/전시브랜드수 · 탭으로 각 탭 이동 |
| 정보 | `info` | 행사 개요, 숙소, 항공편 |

---

## 핵심 함수 위치 (index.html)

| 기능 | 함수/변수 | 위치 |
|---|---|---|
| 지도 선택 상태 | `selectedPlanKey` | ~1706줄 |
| 전시 지도 핀 | `showExhPin`, `clearExhPin`, `_placeExhPin` | ~1708줄 |
| 지오코딩 공통 | `nominatimGeocode` | ~1712줄 |
| 일정 지오코딩 | `geocodePlanItem` | ~1755줄 |
| 경과 시간 판별 | `isPlanItemPast`, `updatePastItems` | ~5640줄 |
| 지구 탭 렌더 | `renderDist` | ~3350줄 |
| 전시 카드 빌드 | `buildExhCard` | ~3780줄 |
| 드로어 삭제 버튼 | `drawerDeleteBtn` in `openDrawer` | ~4885줄 |

---

## 일정 탭 체크박스 동작 (새 방식)

- **체크박스** = 지도 선택 표시 (완료 표시 아님)
- 체크 → 해당 항목 지도에 노란 경로선 + 앞뒤 핀 표시
- 다시 클릭(행 클릭) → 선택 해제
- **자동 음영**: 해당 날짜의 시간이 지난 항목은 opacity 38%로 자동 처리 (1분 간격 갱신)
- **진행률 바**: 오늘 기준 경과 항목 비율로 자동 계산

---

## 전시 지도 핀 동작

1. 전시 카드 헤더 탭 → 지구 좌표로 즉시 핀 표시
2. 백그라운드 Nominatim 지오코딩 → 정확한 주소 좌표로 핀 이동
3. `exhGeoCache` 객체에 캐시 (페이지 세션 동안 유지)
4. 탭 전환 시 핀 자동 제거

---

## 일정 자동 지오코딩 흐름

```
AI 추천 카드 → 확정 버튼 클릭
           ↓
    geocodePlanItem(item, di)   ← 백그라운드 비동기
           ↓
    Nominatim: title + note 검색 (덴마크 한정)
           ↓
    item._lat, item._lng 저장 → savePlan() → updateDayViz()
```
- 제목 수동 편집 완료(blur) 시도 동일하게 실행
- 좌표 없는 항목 선택 시 드로어에 "검색 중..." + 자동 재시도

---

## 알려진 이슈 / 미완성

- **전시탭 브랜드 소개문**: 3/552 영문 잔류 (특수문자 포함 항목)
- **이벤트 타이틀**: 45/870 영문 잔류 (ECLOS, DEKTON 등 브랜드명)
- **6/13 벨뷰·Louisiana, 6/15 크리스티아니아**: 시간 아직 `미정`
- **미주 디바이스 테스트**: 로그인 + 일정 공유 동작 확인 필요
- **지오코딩 정확도**: Nominatim 결과가 항목에 따라 엉뚱할 수 있음 (덴마크 한정 파라미터 사용 중)
- **고정 일정 일부**: 내부 plan 저장본에 따라 `_lat`/`_lng` 없을 수 있음 (선택 시 지오코딩 시도)

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
2. **미주 디바이스 테스트** — 로그인 + 일정 공유 + 지오코딩 동작 확인
3. **여행 전 최종 점검** — 예약 필요 항목, 누락된 이동 시간, 전체 일정 흐름 리뷰
4. **전시탭 지도 핀 개선** — 핀 표시 후 지도 확대 수준 조정, 다중 핀 지원
5. **지오코딩 정확도 검증** — 추가된 항목들의 핀 위치 실제 확인
6. **행사탭 날짜 필터 기본값** — June 10 고정 → 오늘 날짜 기반 자동 전환

---

## Git / 배포

```bash
git push origin main   # origin = git@github-talo:talo-lab/cph-trip.git
git log --oneline -5   # 상태 확인
```
