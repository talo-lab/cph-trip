# CPH-TRIP 세션 이관 문서
_2026-06-03 세션 기준_

---

## 배포 상태

- **URL**: https://cph-trip.vercel.app
- **GitHub**: `talo-lab/cph-trip` (public)
- **로컬 경로**: `C:\Users\DOJO_001\Documents\GitHub\cph-trip`
- **미배포 커밋**: 없음 (모두 push 완료)
- **최신 커밋**: `ebc3485 feat: 위치 수동 설정 + 영업시간 경고`

---

## 이번 세션에서 완료한 작업

### 버그픽스
| 커밋 | 내용 |
|---|---|
| `b3c3286` | 모바일 × 버튼 3중 방어 (hover:hover + pointer:coarse + JS is-touch 클래스) |
| `78218be` | SW 캐시 cph-v3 업그레이드 — events-data.js 53개로 고정되던 버그 수정 |
| `1747f88` | SW Network First 전략 전환 — 배포 후 브라우저 캐시 수동 삭제 불필요 |
| `6b59208` | 행사 카테고리 재분류 109개 (웰니스 0→33, 다이닝 376→323) |

### 신기능
| 커밋 | 내용 |
|---|---|
| `4f15c75` | 행사 데이터 777개 전체 한글 번역 (translate_events.py 스크립트) |
| `f46ad28~467bf38` | Google Maps 딥링크 📍/🧭 추가 (일정·행사·드로어) |
| `3c8fc93` | 이동 항목(→) 자동 감지 → Google Maps 경로(Directions) URL 생성 |
| `e7b587a` | PLACE_MAP 확장 + "역에서 도보" 감지 → 도보경로 자동 생성 |
| `ca99e30` | 드래그 시간 역순 경고 토스트 + 지구 탭 가이드 개편 |
| `8f0b8a1` | UI/UX 개선 6종 (행사 검색, Escape 키, 모달 버그, 날씨 타임아웃 등) |
| `94fd289` | API 레이어 리팩토링 — lib/redis-session.js 공유 helper 추출 |
| `ebc3485` | 위치 수동 설정 + 영업시간 경고 (VENUE_HOURS 9개 장소) |

---

## 현재 파일 구조

```
cph-trip/
├── index.html          ← 앱 본체 (CSS+HTML+JS 통합, ~3600줄)
├── events-data.js      ← 777개 이벤트 (한글 번역 완료)
├── sw.js               ← Network First SW (cph-v4)
├── api/
│   ├── auth.js         ← lib/redis-session.js 사용 (리팩토링 완료)
│   ├── plan.js         ← lib/redis-session.js 사용 (리팩토링 완료)
│   ├── extract.js      ← Claude API 프록시
│   ├── events.js       ← 3dod 스크레이핑
│   └── transit.js      ← Rejseplanen 대중교통
├── lib/
│   └── redis-session.js ← ★ 이번 세션 신설 — Redis+세션 공유 helper
├── translate_events.py ← 행사 한글 번역 스크립트 (로컬용)
├── reclassify_events.py← 행사 카테고리 재분류 스크립트 (로컬용)
├── package.json        ← npm run check 추가 (API 신택스 검증)
├── manifest.json, sw.js, generate_events.py
└── CLAUDE.md           ← 프로젝트 컨텍스트 (이전 세션 작성)
```

---

## 핵심 코드 위치 (index.html)

| 기능 | 함수/변수 | 줄 (대략) |
|---|---|---|
| Google Maps URL 생성 | `gMapsUrlForItem()`, `gMapsQuery()`, `PLACE_MAP` | ~850 |
| 영업시간 데이터/체크 | `VENUE_HOURS`, `getVenueWarning()` | ~830 |
| 드래그 시간 경고 | `checkDragOrder()`, `showDragToast()` | ~2600 |
| 행사 검색 | `festSearchQuery`, `renderFestList()` | ~1500 |
| 드로어 위치편집 | `drawerLocToggle`, `drawerLocSave` | ~2870 |
| SW 캐시 버전 | `cph-v4` | sw.js line 2 |

---

## 알려진 미완성 / 잠재적 이슈

### Google Maps 위치 정확도
- 일부 한글 제목 항목은 PLACE_MAP 매핑이 없어 "한글 제목 + Copenhagen" 으로 검색됨
- 사용자가 직접 📍 편집 기능으로 수동 보정 가능 (드로어 → 📍 버튼)
- `PLACE_MAP` 배열 (~850줄)에 항목 추가하면 즉시 반영

### 영업시간 데이터
- 현재 9개 장소만 커버 (Louisiana, Designmuseum, Torvehallerne, Tivoli, Reffen 등)
- 더 추가하려면 `VENUE_HOURS` 배열에 동일한 형식으로 추가
- 페스티벌 기간(6/10~12) 행사 이벤트는 별도 체크 없음 (이벤트 자체 시간 기준)

### cph-trip-v2 (리팩토링 레포)
- 경로: `C:\Users\DOJO_001\Documents\GitHub\cph-trip-v2`
- `codex/api-session-refactor` 브랜치 → main 병합 대기 중
- v2에서 작업하다가 v1(cph-trip)에 같은 내용 적용 요청 시: `MAIN_MIGRATION_GUIDE.md` 참조
- Redis 키 분리: v1 = `plan/session:*`, v2 = `v2:plan/v2:session:*` (같은 Redis 공유)

---

## Git 계정 설정 (중요)

```
로컬 git config: talo-lab (sanghyo@taloryyppy.kr)
Credential Manager: github-talo SSH alias로 push 성공 중

push 명령어:
  git push origin main   # origin = git@github-talo:talo-lab/cph-trip.git
  (또는 git push talo main → github-dojo 계정, 권한 없을 수 있음)
```

---

## 다음 세션 추천 작업

1. **Google Maps 위치 정확도 개선** — 자주 쓰는 장소 PLACE_MAP 추가
2. **영업시간 데이터 확충** — 식당, 관광지 등 추가
3. **cph-trip-v2 main 병합** — `MAIN_MIGRATION_GUIDE.md` 체크리스트 따라 PR 생성
4. **여행 전 최종 점검** — 출발 6/8 전 일정 확정, 고정 항목 검토
5. **미주 디바이스 테스트** — 미주 폰에서 로그인 + 일정 공유 동작 확인

---

## 빠른 참조

```bash
# 앱 상태 확인
git log --oneline -5
npm run check          # API 파일 신택스 검증

# 행사 데이터 재번역 (API 키 필요)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
python translate_events.py

# 카테고리 재분류
python reclassify_events.py
```
