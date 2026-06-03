#!/usr/bin/env python3
"""
exhibitions-data.js 브랜드 소개문(desc) 한국어 번역
Vercel /api/extract 프록시 사용
"""
import json, re, sys, time, os
sys.stdout.reconfigure(encoding='utf-8')

INPUT_JS   = r"C:\Users\DOJO_001\Documents\GitHub\cph-trip\exhibitions-data.js"
CACHE_FILE = r"C:\Users\DOJO_001\Documents\GitHub\cph-trip\exh_desc_cache.json"
VERCEL_URL = "https://cph-trip.vercel.app/api/extract"

import urllib.request

def translate_descs(pairs: list) -> dict:
    """[(slug, eng_desc), ...] → {eng: ko} 딕셔너리"""
    numbered = "\n".join(f"{i+1}. {d}" for i,(s,d) in enumerate(pairs))
    prompt = f"""다음은 코펜하겐 3 Days of Design 2026에 참가하는 디자인 브랜드 소개문입니다.
각 소개문을 한국어로 자연스럽게 번역해주세요.

번역 규칙:
- 브랜드명·사람이름·지역명은 영어 그대로 유지
- 자연스러운 한국어 문장으로 번역
- 원문이 잘린 경우 자연스럽게 마무리
- 번호와 함께 번역문만 출력

소개문 목록:
{numbered}

출력 형식 (번호. 한국어 번역):"""

    body = json.dumps({
        "system": "You are a professional Korean translator for a design festival guide.",
        "input": prompt,
        "max_tokens": 4096
    }).encode('utf-8')
    req = urllib.request.Request(VERCEL_URL, data=body,
        headers={"Content-Type":"application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    text = data.get("text","").strip()
    result = {}
    for line in text.split('\n'):
        m = re.match(r'(\d+)\.\s*(.+)', line.strip())
        if m:
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(pairs):
                result[pairs[idx][1]] = m.group(2).strip()
    return result

# ── 캐시 로드 ──
cache = {}
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, encoding='utf-8') as f:
        cache = json.load(f)
    print(f"캐시: {len(cache)}개")

# ── desc 추출 ──
with open(INPUT_JS, encoding='utf-8') as f:
    content = f.read()

# desc:'...' 패턴 추출
descs_raw = re.findall(r"desc:'([^']*)'", content)
unique_descs = list(dict.fromkeys(d for d in descs_raw if d.strip()))
print(f"전체 brand: {len(descs_raw)}, 고유 desc: {len(unique_descs)}")

to_do = [(str(i), d) for i,d in enumerate(unique_descs) if d not in cache]
print(f"번역 필요: {len(to_do)}개")

BATCH = 30
for i in range(0, len(to_do), BATCH):
    batch = to_do[i:i+BATCH]
    print(f"  번역 중 {i+1}–{min(i+BATCH,len(to_do))}/{len(to_do)}…", end=" ", flush=True)
    try:
        translated = translate_descs(batch)
        cache.update(translated)
        for _,d in batch:
            if d not in cache: cache[d] = d  # fallback
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print(f"✓ ({len(translated)}개)")
        time.sleep(0.4)
    except Exception as e:
        print(f"오류: {e}")
        for _,d in batch:
            if d not in cache: cache[d] = d
        time.sleep(2)

# ── desc 교체 ──
def replace_desc(m):
    orig = m.group(1)
    ko = cache.get(orig, orig)
    ko_esc = ko.replace("\\","\\\\").replace("'","\\'")
    return f"desc:'{ko_esc}'"

new_content = re.sub(r"desc:'([^']*)'", replace_desc, content)
new_content = new_content.replace(
    '/* exhibitions-data.js — 3 Days of Design 2026 브랜드·전시 데이터 (한국어 번역) */',
    '/* exhibitions-data.js — 3 Days of Design 2026 브랜드·전시 데이터 (한국어 번역 완료) */'
)
with open(INPUT_JS, 'w', encoding='utf-8') as f:
    f.write(new_content)

size = os.path.getsize(INPUT_JS)
print(f"\n완료! {size//1024}KB | 캐시: {len(cache)}개")
