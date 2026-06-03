#!/usr/bin/env python3
"""
reclassify_events.py — 행사 카테고리 재분류
키워드 기반으로 잘못 분류된 카테고리를 수정합니다.

실행: python reclassify_events.py
"""
import re
from collections import Counter
from script_paths import EVENTS_JS

INPUT = str(EVENTS_JS)

# ── 카테고리 키워드 (우선순위 순) ────────────────────────────────────
RULES = [
    # (category, title_keywords, desc_keywords)
    ('wellness', [
        'breathwork', 'breath work', 'yoga', 'pilates', 'meditation',
        'mindfulness', 'wellness', 'wellbeing', 'well-being',
        '호흡 운동', '호흡운동', '명상', '요가', '필라테스', '웰니스',
        '브레스워크', '조용한 시작',
    ], [
        'breathwork', 'yoga', 'pilates', 'meditation', 'mindfulness',
        '호흡', '명상', '요가', '필라테스', '웰니스',
    ]),

    ('exhibition', [
        # 영어 전시/공간 키워드
        'press viewing', 'press view', 'exhibition', 'collection',
        'collectors edit', 'gallery', 'vernissage', 'pavilion',
        'showroom', 'open house', 'pop-up', 'pop up', 'installation',
        'display', 'showcase', 'retrospective', 'premiere showing',
        # 한국어
        '전시회 관람', '보도진', '전시 개막', '전시회 개막',
        '컬렉터', '갤러리', '전시 오프닝', '파빌리온', '쇼룸',
        '설치 작품', '인스톨레이션', '팝업', '팝-업',
        '개막', '개막 리셉션', '개막 행사', '오프닝', '오프닝 파티',
        '오픈', '리셉션', '밍글', '아티스트 밍글',
        '한국 생활', '오픈 스튜디오', '베르니사주',
    ], [
        'exhibition', 'press viewing', 'gallery', 'vernissage',
        'pavilion', 'showroom', 'installation', 'showcase',
        '전시회', '전시 관람', '갤러리', '파빌리온', '쇼룸',
        '전시를', '전시와', '전시에', '전시의',          # "전시를 탐방", "전시에 초대" etc.
        '전시 개막', '개막식', '개막을', '개막과',        # "개막을 기념", "개막과 라이브" etc.
    ]),

    ('workshop', [
        'workshop', 'sketchbook', 'bookbinding', 'binding', 'crafts',
        'craft session', 'hands-on', 'hands on', 'make your own',
        'create your', 'diy', 'screenprint', 'screen print',
        '워크숍', '제본', '스케치북', '제작', '만들기', '핸즈온',
    ], [
        'workshop', 'craft', 'binding', 'hands-on', 'make your',
        '워크숍', '제본', '제작', '만들기',
    ]),

    ('talk', [
        'talk:', 'talks:', 'panel', 'discussion', 'conversation',
        'lecture', 'symposium', 'keynote', 'interview',
        'in conversation', 'fireside', 'design talk',
        'morning talk', 'breakfast talk', 'breakfast chat',
        'artist talk', 'q&a', 'roundtable', 'round table',
        '토크', '패널', '강연', '대담', '심포지엄', '토론',
        '디자인 토크', '아침 대화', '디자인 대화', '대화와',
        '오픈 대화', '아티스트 토크', 'q&a', '라운드테이블',
    ], [
        'panel discussion', 'keynote', 'symposium', 'fireside chat',
        'roundtable', 'artist talk',
        '패널', '심포지엄', '강연', '대담',
    ]),

    ('tour', [
        'design walk', 'guided walk', 'guided tour', 'walking tour',
        'neighbourhood walk', 'neighborhood walk',
        '디자인 워크', '가이드 투어', '워킹 투어', '산책',
    ], [
        'guided walk', 'walking tour', 'design walk',
        '가이드 투어', '워킹 투어',
    ]),

    ('launch', [
        'launch:', 'launches:', 'grand opening', 'world premiere',
        'debut', 'introducing', 'unveiling', 'reveal', 'new collection',
        'new product', 'new arrival', 'first look',
        '런칭', '론칭', '데뷔', '공개', '그랜드 오프닝',
        '공식 개막', '신제품', '개관', '새로운 컬렉션',
    ], [
        'grand opening', 'world premiere', 'unveiling',
        '공식 개막', '개관', '신제품 출시',
    ]),
]

# 저녁 다이닝으로 강제 유지할 타이틀 키워드 (저녁/야간 성격)
FORCE_DINING_EVENING = [
    'long table dinner', 'dinner', '저녁 식사', '롱 테이블 디너',
    '클로징 파티', 'closing party', 'after party', '애프터파티',
]

# 시간 문자열 → 시작 시간(시) 추출
def parse_start_hour(time_str: str) -> int:
    """'18:00-22:00' → 18, '9:00' → 9, 파싱 실패 → -1"""
    if not time_str:
        return -1
    start = time_str.split('-')[0].strip()
    m = re.match(r'(\d{1,2}):', start)
    return int(m.group(1)) if m else -1

# dining 이벤트를 시간대로 세분화
def refine_dining_by_time(hour: int) -> str:
    """dining 카테고리를 시작 시간에 따라 세분화"""
    if hour < 0:
        return 'dining'       # 시간 불명 → 유지
    if hour < 11:
        return 'morning'      # ~10:59 → 아침·커피
    if hour < 14:
        return 'lunch'        # 11:00~13:59 → 점심
    if hour < 17:
        return 'afternoon'    # 14:00~16:59 → 오후 음료
    return 'dining'           # 17:00~ → 저녁 다이닝 유지

def get_category(title: str, desc: str, original: str, time_str: str = '') -> str:
    t = title.lower()
    d = desc.lower()

    # 저녁 다이닝 강제 유지 (타이틀 키워드)
    for kw in FORCE_DINING_EVENING:
        if kw in t:
            return 'dining'

    # 우선순위 규칙 적용 (dining 외 카테고리로 재분류)
    for cat, title_kws, desc_kws in RULES:
        for kw in title_kws:
            if kw.lower() in t:
                return cat
        for kw in desc_kws:
            if kw.lower() in d:
                return cat

    # dining이면 시간대로 세분화
    if original == 'dining':
        hour = parse_start_hour(time_str)
        return refine_dining_by_time(hour)

    return original  # 변경 없음

# ── 파일 처리 ─────────────────────────────────────────────────────
with open(INPUT, encoding='utf-8') as f:
    lines = f.readlines()

changed = 0
before_counts = Counter()
after_counts = Counter()

new_lines = []
for line in lines:
    if not re.match(r'\s*\{title:', line):
        new_lines.append(line)
        continue

    t_m = re.search(r"title:'((?:[^'\\]|\\.)*?)'", line)
    d_m = re.search(r"desc:'((?:[^'\\]|\\.)*?)'", line)
    c_m = re.search(r"category:'(\w+)'", line)
    tm_m = re.search(r"time:'((?:[^'\\]|\\.)*?)'", line)

    if not c_m:
        new_lines.append(line)
        continue

    title    = t_m.group(1) if t_m else ''
    desc     = d_m.group(1) if d_m else ''
    orig     = c_m.group(1)
    time_str = tm_m.group(1) if tm_m else ''

    before_counts[orig] += 1
    new_cat = get_category(title, desc, orig, time_str)
    after_counts[new_cat] += 1

    if new_cat != orig:
        line = re.sub(r"category:'\w+'", f"category:'{new_cat}'", line)
        changed += 1

    new_lines.append(line)

# 백업 후 저장
with open(INPUT + '.cat_bak', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open(INPUT, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

# 결과 출력
print("=== 재분류 전 ===")
for k, v in sorted(before_counts.items(), key=lambda x: -x[1]):
    print(f"  {k:12s}: {v}")

print(f"\n=== 재분류 후 ({changed}개 변경) ===")
for k, v in sorted(after_counts.items(), key=lambda x: -x[1]):
    diff = v - before_counts.get(k, 0)
    sign = f"+{diff}" if diff > 0 else str(diff)
    print(f"  {k:12s}: {v}  ({sign})")

print(f"\n[OK] 저장 완료: {INPUT}")
print(f"[OK] 백업: {INPUT}.cat_bak")
