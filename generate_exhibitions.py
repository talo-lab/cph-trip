#!/usr/bin/env python3
"""
exhibitions-data.js 생성 스크립트
3dod_exhibitions_with_events_2026.json → exhibitions-data.js
"""
import json, re, sys
from script_paths import get_data_dir, EXHIBITIONS_JS
sys.stdout.reconfigure(encoding='utf-8')

INPUT_JSON = get_data_dir() / '3dod_exhibitions_with_events_2026.json'
OUTPUT_JS  = EXHIBITIONS_JS

# 카테고리 → 아이콘·한국어·색상
CAT_MAP = {
    'Drinks & Food':  {'key':'drinks',   'label':'음료·식음', 'icon':'🍷', 'color':'#8b5e3c'},
    'Talk':           {'key':'talk',     'label':'토크·패널', 'icon':'💬', 'color':'#2f6b6b'},
    'Workshop':       {'key':'workshop', 'label':'워크숍',    'icon':'✂️', 'color':'#5d7456'},
    'Product Launch': {'key':'launch',   'label':'런칭',      'icon':'🚀', 'color':'#d99021'},
    'Guided Tour':    {'key':'tour',     'label':'가이드 투어','icon':'🚶', 'color':'#3a4a5a'},
}

# 지구 한국어 + 색상
DISTRICT_MAP = {
    'Frederiksstaden': {'ko':'프레데릭스타덴', 'color':'#2f6b6b'},
    'Kongens Nytorv':  {'ko':'코넨스 뉘토르', 'color':'#6d3b54'},
    'Rosengård':       {'ko':'로센고르',       'color':'#c8492a'},
    'Christianshavn':  {'ko':'크리스티안스하운','color':'#3a4a5a'},
    'Nordhavn':        {'ko':'노드하운',        'color':'#5d7456'},
    'Holmen':          {'ko':'홀멘',            'color':'#d99021'},
    'Kultur':          {'ko':'쿨투르',          'color':'#9b7ab5'},
    'Islands Brygge':  {'ko':'아일란스 브뤼게', 'color':'#8b5e3c'},
    '':                {'ko':'미정',            'color':'#888'},
}

def parse_day(day_str):
    """'10 Jun' → 10"""
    m = re.match(r'(\d+)', day_str or '')
    return int(m.group(1)) if m else 0

def parse_cats(cat_str):
    """'Drinks & Food ; Talk' → [cat_info, ...]"""
    result = []
    for c in cat_str.split(';'):
        c = c.strip()
        if c in CAT_MAP:
            result.append(CAT_MAP[c])
    return result

def esc_js(s):
    """JS 문자열 이스케이프"""
    s = str(s or '').replace('\\','\\\\').replace("'","\\'").replace('\n',' ').replace('\r','')
    return s

with open(INPUT_JSON, encoding='utf-8') as f:
    raw = json.load(f)

exhibitions = []
for item in raw:
    brand = item.get('brand','').strip()
    if not brand:
        continue

    district = item.get('district','') or ''
    address  = item.get('venue_address','') or ''
    url      = item.get('exhibition_url','') or ''
    desc_raw = item.get('meta_description','') or ''
    desc     = desc_raw[:120].rstrip()
    if len(desc_raw) > 120:
        desc = desc.rsplit(' ', 1)[0] + '…'

    d_info = DISTRICT_MAP.get(district, DISTRICT_MAP[''])

    # 이벤트 가공
    events = []
    for ev in item.get('events', []):
        title     = ev.get('event_title', '').strip()
        day_num   = parse_day(ev.get('event_day',''))
        start     = ev.get('start_time','') or ''
        end       = ev.get('end_time','') or ''
        ev_url    = ev.get('event_url','') or ''
        relation  = ev.get('relation','main')
        cats_info = parse_cats(ev.get('event_categories',''))
        ev_location = ev.get('event_location','') or ''
        diff_loc = ev_location if ev_location and ev_location != address else ''

        if not title or not day_num:
            continue

        primary = cats_info[0] if cats_info else {'key':'exhibition','label':'전시','icon':'🏛','color':'#6d3b54'}

        # URL에서 이벤트 ID만 추출
        ev_id = ev_url.split('/')[-1] if ev_url else ''

        ev_obj = {
            'day':   day_num,
            'start': start,
            'end':   end,
            'title': title,
            'icon':  primary['icon'],
            'color': primary['color'],
            'label': primary['label'],
            'id':    ev_id,
        }
        if cats_info and len(cats_info) > 1:
            ev_obj['cats'] = [c['key'] for c in cats_info]
        if diff_loc:
            ev_obj['location'] = diff_loc
        if relation == 'joint':
            ev_obj['joint'] = True

        events.append(ev_obj)

    # 이벤트 정렬 (날짜 → 시간)
    events.sort(key=lambda e: (e['day'], e['start']))

    exhibitions.append({
        'brand':    brand,
        'district': district,
        'district_ko': d_info['ko'],
        'district_color': d_info['color'],
        'address':  address,
        'url':      url,
        'desc':     desc,
        'events':   events,
    })

# 이벤트 많은 순 정렬, 없는 건 알파벳순 후미
exhibitions.sort(key=lambda x: (-len(x['events']), x['brand'].lower()))

print(f'Total brands: {len(exhibitions)}')
print(f'Brands with events: {sum(1 for x in exhibitions if x["events"])}')
print(f'Total events: {sum(len(x["events"]) for x in exhibitions)}')

# JS 파일 생성
lines = []
lines.append('/* exhibitions-data.js — 3 Days of Design 2026 브랜드·전시 데이터 */')
lines.append('/* 자동 생성: generate_exhibitions.py (2026-06-03) */')
lines.append('/* 총 {}개 브랜드, {}개 이벤트 */'.format(
    len(exhibitions), sum(len(x['events']) for x in exhibitions)))
lines.append('')
lines.append('const EXHIBITIONS = [')

for ex in exhibitions:
    lines.append('  {')
    lines.append(f"    brand:'{esc_js(ex['brand'])}',")
    lines.append(f"    district:'{esc_js(ex['district'])}',")
    lines.append(f"    districtKo:'{esc_js(ex['district_ko'])}',")
    lines.append(f"    districtColor:'{ex['district_color']}',")
    lines.append(f"    address:'{esc_js(ex['address'])}',")
    # URL에서 슬러그만 추출
    slug = ex['url'].split('/')[-1] if ex['url'] else ''
    lines.append(f"    slug:'{esc_js(slug)}',")
    lines.append(f"    desc:'{esc_js(ex['desc'])}',")
    if ex['events']:
        lines.append('    events:[')
        for ev in ex['events']:
            parts = [
                f"day:{ev['day']}",
                f"start:'{ev['start']}'",
                f"end:'{ev['end']}'",
                f"title:'{esc_js(ev['title'])}'",
                f"icon:'{ev['icon']}'",
                f"color:'{ev['color']}'",
                f"label:'{ev['label']}'",
                f"id:'{ev['id']}'",
            ]
            if ev.get('cats'):
                parts.append('cats:[' + ','.join(f"'{c}'" for c in ev['cats']) + ']')
            if ev.get('location'):
                parts.append(f"location:'{esc_js(ev['location'])}'")
            if ev.get('joint'):
                parts.append('joint:true')
            lines.append('      {' + ','.join(parts) + '},')
        lines.append('    ],')
    else:
        lines.append('    events:[],')
    lines.append('  },')

lines.append('];')
lines.append('')

output = '\n'.join(lines)
with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Written: {OUTPUT_JS}')
import os
size = os.path.getsize(OUTPUT_JS)
print(f'File size: {size//1024}KB ({size} bytes)')
