#!/usr/bin/env python3
"""
translate_events.py — events-data.js 한글 번역
title, desc 필드를 Claude API로 한국어 번역 후 덮어씁니다.

실행 전 환경변수 설정:
  $env:ANTHROPIC_API_KEY = "sk-ant-..."

실행:
  python translate_events.py
"""

import re, json, os, sys, time
import anthropic
from script_paths import EVENTS_JS

INPUT = str(EVENTS_JS)
BATCH_SIZE = 40  # 한 번에 번역할 이벤트 수

# ── API 클라이언트 ──────────────────────────────────────────────────
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    print("[ERROR] ANTHROPIC_API_KEY not set.")
    print("  PowerShell: $env:ANTHROPIC_API_KEY = 'sk-ant-...'")
    sys.exit(1)

client = anthropic.Anthropic(api_key=api_key)

# ── 파일 읽기 ──────────────────────────────────────────────────────
with open(INPUT, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 이벤트 라인 수집 (각 이벤트는 한 줄)
event_lines = [
    (i, line) for i, line in enumerate(lines)
    if re.match(r'\s*\{title:', line)
]
print(f"[OK] {len(event_lines)}개 이벤트 발견")

def extract(line, field):
    m = re.search(rf"{field}:'((?:[^'\\]|\\.)*?)'", line)
    return m.group(1) if m else ''

events = [(i, extract(line, 'title'), extract(line, 'desc'))
          for i, line in event_lines]

# ── 번역 함수 ──────────────────────────────────────────────────────
def translate_batch(batch):
    numbered = "\n".join(
        f"{j+1}. TITLE: {t}\n   DESC: {d}"
        for j, (_, t, d) in enumerate(batch)
    )

    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=8192,
        messages=[{
            "role": "user",
            "content": f"""코펜하겐 '3 Days of Design 2026' 행사 데이터를 한국어로 번역하세요.

규칙:
- 브랜드명·인명·고유 장소명은 원어 그대로 (예: Fritz Hansen, KLUB, Nyhavn, Georg Jensen)
- TITLE: 간결하고 자연스러운 한국어 (50자 이내)
- DESC: 핵심 내용만 60자 이내
- 작은따옴표(') 절대 사용 금지 → 큰따옴표나 다른 표현으로 대체
- 응답은 JSON 배열만, 번호 순서 유지:
  [{{"t":"번역제목","d":"번역설명"}}, ...]

번역할 항목:
{numbered}"""
        }]
    )

    text = resp.content[0].text.strip()
    m = re.search(r'\[.*?\]', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass
    return None

# ── 배치 번역 실행 ─────────────────────────────────────────────────
translated_map = {}  # line_index → (title_kr, desc_kr)
n_total = (len(events) + BATCH_SIZE - 1) // BATCH_SIZE

for b_start in range(0, len(events), BATCH_SIZE):
    batch = events[b_start:b_start + BATCH_SIZE]
    b_num = b_start // BATCH_SIZE + 1
    print(f"  배치 {b_num}/{n_total} 번역 중... ({len(batch)}개)", end='', flush=True)

    result = None
    for attempt in range(3):  # 최대 3회 재시도
        try:
            result = translate_batch(batch)
            if result and len(result) >= len(batch):
                break
        except Exception as e:
            print(f" [오류: {e}]", end='')
            time.sleep(2)

    if result and len(result) >= len(batch):
        for j, (line_idx, orig_t, orig_d) in enumerate(batch):
            t = result[j].get('t', orig_t)
            d = result[j].get('d', orig_d)
            translated_map[line_idx] = (t, d)
        print(f" done")
    else:
        print(f" FAILED, keeping original")
        for (line_idx, orig_t, orig_d) in batch:
            translated_map[line_idx] = (orig_t, orig_d)

    time.sleep(0.3)  # rate limit 방지

# ── 파일 치환 ──────────────────────────────────────────────────────
new_lines = lines[:]

for line_idx, (title_kr, desc_kr) in translated_map.items():
    line = new_lines[line_idx]

    if title_kr:
        safe_title = title_kr.replace("'", " ").replace("\\", "")
        line = re.sub(r"title:'(?:[^'\\]|\\.)*?'", f"title:'{safe_title}'", line)

    if desc_kr:
        safe_desc = desc_kr.replace("'", " ").replace("\\", "")
        line = re.sub(r"desc:'(?:[^'\\]|\\.)*?'", f"desc:'{safe_desc}'", line)

    new_lines[line_idx] = line

# 백업
backup = INPUT + '.bak'
with open(backup, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f"\n[OK] 백업: {backup}")

# 저장
with open(INPUT, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"[OK] 번역 완료: {len(translated_map)}개 이벤트")
print(f"[OK] 저장: {INPUT}")
print("\n--- 다음 단계 ---")
print("git add events-data.js")
print("git commit -m 'feat: 행사 데이터 한글 번역'")
print("git push origin main")
