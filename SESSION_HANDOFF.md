# CPH-TRIP 세션 이관 문서
_2026-06-03 세션 기준_

---

## 배포 상태

- **URL**: https://cph-trip.vercel.app
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **미배포 커밋**: 없음 (모두 push 완료)
- **최신 커밋**: `6a4523a fix: 모바일 반응형 개선`

---

## 이번 세션에서 완료한 작업

### 데이터 업데이트
| 커밋 | 내용 |
|---|---|
| `c0c0bad` | PLACE_MAP 40개 항목 추가 (지하철역, 코펜하겐 명소, 3DoD 장소, 식당) |
| `c0c0bad` | VENUE_HOURS 7개 장소 추가 (로젠보르, 아마리엔보르, 크리스티안스보르 등) |
| `0379e21` | CSV 일정 전체 반영 — 숙소 확정 + 미주 관심 장소 |
| `d82095e` | 날짜 확정 항목 고정 일정 이동 (오전 12:00 = 날짜만 확정, 시간 미정) |
| `836e527` | 주소 3건 수정 (숙소 1718, Frama→Apotek57, SALU 1720) |

### 신기능
| 커밋 | 내용 |
|---|---|
| `f005f92` | AI 재조율 버튼 — 일정 탭 날짜 헤더에 `✦ 재조율` 버튼 |
| `e6d422e` | 추천탭 plan 동기화 — plan에 있는 항목 자동 제외, 삭제 시 복원 |
| `e6d422e` | +장소 탭 위시리스트 — 날짜 미정 장소 저장/관리 |
| `150a81d` | 위시리스트 Redis 서버 동기화 (기기간 공유) |

### 버그픽스
| 커밋 | 내용 |
|---|---|
| `50ce036` | 행사 일정추가 후 자동으로 일정탭 이동 + 중복 피드백 |
| `6a4523a` | 모바일 반응형 개선 — 범례 토글, overflow 보정 |

---

## 현재 파일 구조

```
cph-trip/
├── index.html          ← 앱 본체 (~4100줄)
├── events-data.js      ← 777개 이벤트 (한글 번역 완료)
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
├── reclassify_events.py
└── SESSION_HANDOFF.md
```

---

## 핵심 데이터 구조 (index.html)

| 기능 | 위치 | 비고 |
|---|---|---|
| 숙소 | `STAY` 객체 ~1277줄 | Sommerstedgade 26, 1718 København |
| Google Maps 매핑 | `PLACE_MAP` ~977줄 | 70개 항목 |
| 영업시간 | `VENUE_HOURS` ~1060줄 | 15개 장소 |
| 고정 일정 | `DEFAULT_PLAN` ~1290줄 | 9일치 |
| 추천 일정 | `RECOMMEND` ~2185줄 | DAY1–DAY7 |
| 위시리스트 | `WISH_KEY`, `wishlist` ~3955줄 | localStorage + Redis |
| AI 재조율 | `triggerReschedule()` ~3510줄 | 날짜 헤더 ✦ 버튼 |
| 행사 추가 | `addFestSelected()` ~2045줄 | 추가 후 자동 일정탭 이동 |
| 추천 추가 | `applyRecItems()` ~2650줄 | plan 동기화, 추가 후 이동 |

---

## 확정된 고정 일정

| 날짜 | 시간 | 내용 | 상태 |
|---|---|---|---|
| 6/8 | 22:25 | [미주] ICN→AMS 출발 KE5925 | `_fixed` |
| 6/8 | 23:35 | [상효] ICN→CPH 직항 출발 SAS SK0988 | `_fixed` |
| 6/9 | 06:00 | [상효] CPH(T3) 도착 | `_fixed` |
| 6/9 | 08:30 | [미주] CPH(T2) 도착 KE5925→KL1267 | `_fixed` |
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

| 키 | 내용 | 공유 방식 |
|---|---|---|
| `plan` | 전체 일정 JSON | 미주·상효 공유 |
| `favs:miju` / `favs:sanghyo` | 즐겨찾기 | 개인별 |
| `wishlist:miju` / `wishlist:sanghyo` | 가고싶은 곳 | 개인별 |

> SW unregister는 localStorage 데이터에 영향 없음

---

## 알려진 이슈 / 미완성

- 모바일 범례 토글은 구현됐으나 데스크탑에서는 항상 열림 (정상)
- 위시리스트는 "→ 일정에 추가" 시 날짜만 선택 가능, 시간 입력 없음 (추후 개선 가능)
- PLACE_MAP에 없는 한글 장소명은 "제목 + Copenhagen"으로 fallback 검색
- 6/14(일) 추천 일정은 아직 Louisiana 흔적이 일부 남아있을 수 있음

---

## 다음 세션 추천 작업

1. **미주 디바이스 테스트** — 미주 폰에서 로그인 + 일정 공유 동작 확인
2. **시간 미정 항목 일괄 확정** — 6/13 벨뷰·Louisiana, 6/15 크리스티아니아 시간 배정
3. **여행 전 최종 점검** — 출발 6/8까지 일정 확정, 예약 필요 항목 확인
4. **cph-trip-v2 병합** — v2 리팩토링 레포 main 병합 (`MAIN_MIGRATION_GUIDE.md` 참조)

---

## Git / 배포

```bash
git push origin main   # origin = git@github-talo:talo-lab/cph-trip.git
```

---

## 빠른 참조

```bash
# 상태 확인
git log --oneline -5

# 행사 데이터 재번역
$env:ANTHROPIC_API_KEY = "sk-ant-..."
python translate_events.py

# 카테고리 재분류
python reclassify_events.py
```
