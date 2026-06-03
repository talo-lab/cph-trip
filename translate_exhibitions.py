#!/usr/bin/env python3
"""
exhibitions-data.js 이벤트 타이틀 한국어 번역
524개 고유 영어 제목 → Claude API 배치 번역 → exhibitions-data.js 재생성
"""
import json, re, sys, time, os
from script_paths import EXHIBITIONS_JS, REPO_ROOT
sys.stdout.reconfigure(encoding='utf-8')

INPUT_JS  = str(EXHIBITIONS_JS)
CACHE_FILE = str(REPO_ROOT / 'exh_title_cache.json')

# ── Vercel API 프록시 사용 (로컬 API 키 불필요) ──
import urllib.request, urllib.error
VERCEL_EXTRACT = "https://cph-trip.vercel.app/api/extract"

def translate_batch(titles: list[str]) -> dict[str, str]:
    """영어 타이틀 배치 → 한국어 번역 딕셔너리 반환 (Vercel 프록시)"""
    numbered = "\n".join(f"{i+1}. {t}" for i,t in enumerate(titles))
    prompt = f"""다음은 코펜하겐 3 Days of Design 2026 디자인 페스티벌의 이벤트/행사 제목 목록입니다.
각 제목을 한국어로 자연스럽게 번역해주세요.

번역 규칙:
- 브랜드명·디자이너명·장소명은 영어 그대로 유지
- 디자인 전문 용어는 가능하면 한국어로, 어색하면 영어 유지
- 원어 뉘앙스를 살린 자연스러운 한국어
- 번호와 함께 번역문만 출력 (설명 없이)

이벤트 제목 목록:
{numbered}

출력 형식 (번호. 한국어 번역):"""

    body = json.dumps({
        "system": "You are a professional Korean translator specializing in design and culture events.",
        "input": prompt,
        "max_tokens": 4096
    }).encode('utf-8')

    req = urllib.request.Request(
        VERCEL_EXTRACT,
        data=body,
        headers={"Content-Type":"application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    text = data.get("text","").strip()
    result = {}
    for line in text.split('\n'):
        m = re.match(r'(\d+)\.\s*(.+)', line.strip())
        if m:
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(titles):
                result[titles[idx]] = m.group(2).strip()
    return result

# ── 1. 기존 캐시 로드 ──
cache = {}
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, encoding='utf-8') as f:
        cache = json.load(f)
    print(f"캐시 로드: {len(cache)}개 번역")

# ── 2. 고유 타이틀 추출 ──
with open(INPUT_JS, encoding='utf-8') as f:
    content = f.read()

all_titles = re.findall(r"title:'((?:[^'\\]|\\.)*)'", content)
unique_titles = sorted(set(all_titles))
print(f"전체 이벤트: {len(all_titles)}개, 고유 타이틀: {len(unique_titles)}개")

# ── 3. 미번역 타이틀 배치 번역 ──
to_translate = [t for t in unique_titles if t not in cache]
print(f"번역 필요: {len(to_translate)}개")

BATCH = 40
for i in range(0, len(to_translate), BATCH):
    batch = to_translate[i:i+BATCH]
    print(f"  번역 중 {i+1}–{min(i+BATCH, len(to_translate))}/{len(to_translate)}…", end=" ", flush=True)
    try:
        translated = translate_batch(batch)
        cache.update(translated)
        # 결과 확인: 누락된 것은 원문 유지
        for t in batch:
            if t not in cache:
                cache[t] = t
                print(f"[미번역 원문 유지: {t[:40]}]", end=" ")
        # 중간 저장
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print(f"✓ ({len(translated)}개)")
        time.sleep(0.5)
    except Exception as e:
        print(f"오류: {e}")
        for t in batch:
            if t not in cache:
                cache[t] = t
        time.sleep(2)

# ── 4. exhibitions-data.js 타이틀 교체 ──
def replace_title(m):
    orig = m.group(1)
    # 이스케이프 복원
    key = orig.replace("\\'","'")
    ko = cache.get(key, cache.get(orig, orig))
    # 재이스케이프
    ko_esc = ko.replace("\\","\\\\").replace("'","\\'")
    return f"title:'{ko_esc}'"

new_content = re.sub(r"title:'((?:[^'\\]|\\.)*)'", replace_title, content)

# 헤더 업데이트
new_content = new_content.replace(
    '/* exhibitions-data.js — 3 Days of Design 2026 브랜드·전시 데이터 */',
    '/* exhibitions-data.js — 3 Days of Design 2026 브랜드·전시 데이터 (한국어 번역) */'
)

with open(INPUT_JS, 'w', encoding='utf-8') as f:
    f.write(new_content)

import os as _os
size = _os.path.getsize(INPUT_JS)
print(f"\n완료! exhibitions-data.js 업데이트됨 ({size//1024}KB)")
print(f"번역 캐시: {len(cache)}개 항목 ({CACHE_FILE})")
