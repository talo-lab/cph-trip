/* Google Maps Places Search URL */
function gMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/* Google Maps 경로 URL (이동 항목용) */
function gMapsDir(origin, destination, mode) {
  return `https://www.google.com/maps/dir/?api=1`
    + `&origin=${encodeURIComponent(origin)}`
    + `&destination=${encodeURIComponent(destination)}`
    + `&travelmode=${mode}`;
}

/* 이동수단 감지 (note 텍스트 기반) */
function detectTravelMode(note) {
  const n = (note || '').toLowerCase();
  if (/도보|걸어|walk/.test(n))                              return 'walking';
  if (/자전거|bike|cycling/.test(n))                         return 'bicycling';
  if (/메트로|지하철|s-tog|기차|버스|transit|대중교통/.test(n)) return 'transit';
  return 'transit';
}

/* 장소명 정규화 매핑 — 한글/약어 → Google Maps 검색어 */
const PLACE_MAP = [
  // 숙소 / 이동 기점
  ['숙소',                'Sommerstedgade 26, 1718 København'],
  ['airbnb',              'Sommerstedgade 26, 1718 København'],
  ['sommerstedgade',      'Sommerstedgade 26, 1718 København'],
  // 공항
  ['공항',                'Copenhagen Airport, Kastrup'],
  ['코펜하겐 공항',        'Copenhagen Airport CPH'],
  // 기차역
  ['중앙역',              'Copenhagen Central Station'],
  ['코펜하겐 중앙역',      'Copenhagen Central Station'],
  // 코펜하겐 명소
  ['뉘하운',              'Nyhavn, Copenhagen'],
  ['티볼리',              'Tivoli Gardens, Copenhagen'],
  ['인어공주',            'The Little Mermaid, Copenhagen'],
  ['둥근탑',              'Rundetårn, Copenhagen'],
  ['torvehallerne',       'Torvehallerne, Copenhagen'],
  ['토르베할레너',         'Torvehallerne, Copenhagen'],
  // 해변
  ['벨뷰 해변',           'Bellevue Strand, Klampenborg, Denmark'],
  ['bellevue',            'Bellevue Strand, Klampenborg, Denmark'],
  ['islands brygge',      'Islands Brygge Harbor Bath, Copenhagen'],
  ['하버바스',            'Islands Brygge Harbor Bath, Copenhagen'],
  // 근교
  ['louisiana',           'Louisiana Museum of Modern Art, Humlebæk, Denmark'],
  ['루이지애나',           'Louisiana Museum of Modern Art, Humlebæk, Denmark'],
  ['charlottenlund',      'Charlottenlund Fort Beach, Denmark'],
  ['찰롯텐룬드',          'Charlottenlund Fort Beach, Denmark'],
  ['reffen',              'Reffen, Copenhagen Street Food, Copenhagen'],
  // 주요 지하철역 / 교통 허브
  ['nørreport',           'Nørreport Station, Copenhagen'],
  ['노레포르',            'Nørreport Station, Copenhagen'],
  ['외스터포르',          'Østerport Station, Copenhagen'],
  ['østerport',           'Østerport Station, Copenhagen'],
  ['kongens nytorv',      'Kongens Nytorv Metro Station, Copenhagen'],
  ['콩겐스 뉘토르우',     'Kongens Nytorv Metro Station, Copenhagen'],
  ['flintholm',           'Flintholm Station, Copenhagen'],
  ['klampenborg',         'Klampenborg Station, Denmark'],
  ['humlebæk',            'Humlebæk Station, Denmark'],
  // 코펜하겐 추가 명소
  ['로젠보르',            'Rosenborg Castle, Øster Voldgade 4A, Copenhagen'],
  ['rosenborg',           'Rosenborg Castle, Øster Voldgade 4A, Copenhagen'],
  ['아마리엔보르',        'Amalienborg Palace, Copenhagen'],
  ['amalienborg',         'Amalienborg Palace, Copenhagen'],
  ['크리스티안스보르',    'Christiansborg Palace, Copenhagen'],
  ['christiansborg',      'Christiansborg Palace, Copenhagen'],
  ['크리스티아니아',      'Freetown Christiania, Copenhagen'],
  ['christiania',         'Freetown Christiania, Copenhagen'],
  ['국립박물관',          'Nationalmuseet, Ny Vestergade 10, Copenhagen'],
  ['nationalmuseet',      'Nationalmuseet, Ny Vestergade 10, Copenhagen'],
  ['카스텔레',            'Kastellet, Copenhagen'],
  ['kastellet',           'Kastellet, Copenhagen'],
  ['보태닉',              'Botanisk Have, Øster Farimagsgade 2B, Copenhagen'],
  ['botanisk',            'Botanisk Have, Øster Farimagsgade 2B, Copenhagen'],
  ['스트로이에',          'Strøget, Copenhagen'],
  ['strøget',             'Strøget, Copenhagen'],
  ['글립토테크',          'Ny Carlsberg Glyptotek, Dantes Plads 7, Copenhagen'],
  ['glyptotek',           'Ny Carlsberg Glyptotek, Dantes Plads 7, Copenhagen'],
  ['ny carlsberg',        'Ny Carlsberg Glyptotek, Dantes Plads 7, Copenhagen'],
  ['토르발센',            'Thorvaldsens Museum, Bertel Thorvaldsens Plads 2, Copenhagen'],
  ['thorvaldsens',        'Thorvaldsens Museum, Bertel Thorvaldsens Plads 2, Copenhagen'],
  ['원형항구',            'Nyhavn, Copenhagen'],
  ['뉘하운',              'Nyhavn, Copenhagen'],
  ['페리',                'Nyhavn Ferry, Copenhagen'],
  // 디자인 페스티벌 장소
  ['klub',                'KLUB, Linnésgade 25, Copenhagen'],
  ['designmuseum',        'Designmuseum Danmark, Bredgade 68, Copenhagen'],
  ['folkehuset absalon',  'Folkehuset Absalon, Sønder Blvd. 73, 1720 København'],
  ['pp møbler',           'PP Møbler, Bryggernes Plads 11, Copenhagen'],
  ['fritz hansen',        'Fritz Hansen Store, Bredgade 95, Copenhagen'],
  ['fanzi',               'FANZI, Posten 6, 1577 Copenhagen'],
  ['house of finn juhl',  'House of Finn Juhl, Gothersgade 9, 1123 Copenhagen'],
  ['finn juhl',           'House of Finn Juhl, Gothersgade 9, 1123 Copenhagen'],
  ['bang & olufsen',      'Bang & Olufsen, Strandgade 26, 1401 Copenhagen'],
  ['bang and olufsen',    'Bang & Olufsen, Strandgade 26, 1401 Copenhagen'],
  ['뱅앤올룹센',          'Bang & Olufsen, Strandgade 26, 1401 Copenhagen'],
  ['gubi',                'GUBI, Orientkaj 18, 2150 Copenhagen'],
  ['ferm living',         'Ferm Living, Kongens Nytorv 16F, 1050 Copenhagen'],
  ['vipp',                'Vipp, Snorresgade 22, 2300 Copenhagen'],
  ['carl hansen',         'Carl Hansen & Søn, Flaskehalsen 2, 1799 Copenhagen'],
  ['카를 한센',           'Carl Hansen & Søn, Flaskehalsen 2, 1799 Copenhagen'],
  ['umage',               'UMAGE, Havnegade 29, 1058 Copenhagen'],
  ['cosentino',           'Cosentino City Copenhagen, Danneskiold-Samsøes Allé 11, 1434 Copenhagen'],
  ['gammel dok',          'Gammel Dok, Strandgade 27B, 1410 Copenhagen'],
  ['ocee',                'Ocee & Four Design, Frederiksholms Kanal 28E, 1473 Copenhagen'],
  ['nordhus',             'Nordhus, Århusgade 124A, 2150 Copenhagen'],
  ['the conary',          'The Conary, Dronningens Tværgade 26, 1302 Copenhagen'],
  // 식당 / 마켓
  ['파피뢰엔',            'Papirøen, Copenhagen Street Food, Copenhagen'],
  ['papirøen',            'Papirøen, Copenhagen Street Food, Copenhagen'],
  ['코펜하겐 스트리트푸드','Reffen, Copenhagen Street Food, Copenhagen'],
  ['hart bageri',         'Hart Bageri, Gammel Kongevej 109, Copenhagen'],
  ['하트 베이커리',       'Hart Bageri, Gammel Kongevej 109, Copenhagen'],
];

/* 원시 장소명 → Google Maps 최적 검색어 */
function normPlace(raw) {
  const k = raw.trim().toLowerCase();
  for(const [key, val] of PLACE_MAP){
    if(k.includes(key.toLowerCase())) return val;
  }
  return raw.trim() + ', Copenhagen';
}

/* note에서 "X역에서 도보" 패턴 추출 → 역 이름 반환 */
function extractStationWalk(note) {
  const m = (note||'').match(/([A-Za-z가-힣ÆæØøÅå]+)\s*역에서\s*도보|([A-Za-z가-힣ÆæØøÅå]+)역\s*하차/i);
  if (!m) return null;
  return (m[1]||m[2]).trim();
}

/* 항목에 맞는 Google Maps URL 반환:
 * _gmapsUrl 수동 지정이 있으면 최우선 사용
 * ① 제목에 "→"      → 경로(origin → dest) URL
 * ② note에 "역에서 도보" → 역 → 목적지 도보 경로
 * ③ 나머지          → 장소 검색 URL */
function gMapsUrlForItem(it) {
  if (it._gmapsUrl) return it._gmapsUrl;
  const title = it.title || '';
  const note  = it.note  || '';

  // ① 이동 항목: "A → B" 패턴
  if (title.includes('→')) {
    const idx     = title.indexOf('→');
    const fromRaw = title.slice(0, idx).replace(/\s*(출발|에서의?|에서)?\s*$/, '').trim();
    const toRaw   = title.slice(idx + 1).replace(/\s*(으로|로)?\s*이동.*$/,'').trim();
    return gMapsDir(normPlace(fromRaw), normPlace(toRaw), detectTravelMode(note));
  }

  // ② 역 → 목적지 도보 (note에 "X역에서 도보" 있는 경우)
  const station = extractStationWalk(note);
  if (station) {
    const dest = gMapsQuery(it);
    return gMapsDir(`${station} Station, Denmark`, dest, 'walking');
  }

  // ③ 일반 장소 검색
  return gMapsUrl(gMapsQuery(it));
}

/* 일정 항목에서 최적 검색어 추출
 * 우선순위: PLACE_MAP → note 주소 → 제목 영문 → 제목 */
function gMapsQuery(it) {
  const title = it.title || '';
  const note  = it.note  || '';
  const all   = (title + ' ' + note).toLowerCase();

  // 1순위: PLACE_MAP 키워드 매칭
  for(const [key, val] of PLACE_MAP){
    if(all.includes(key.toLowerCase())) return val;
  }

  const parts = note.split(/\s*[·—–·]\s*/).map(p=>p.trim()).filter(Boolean);

  // 2순위: note에서 숫자+영문 (도로명 주소)
  const addr = parts.find(p => /\d/.test(p) && /[a-zA-Z]{2,}/.test(p));
  if (addr) return addr + ', Copenhagen';

  // 3순위: 제목에서 영문 장소명
  const titleEng = title.match(/[A-Z][A-Za-z\s&'.-]{3,}/);
  if (titleEng) return titleEng[0].trim() + ', Copenhagen';

  // 4순위: note에서 영문
  const engPart = parts.find(p => /[a-zA-Z]{4,}/.test(p));
  if (engPart) return engPart + ', Copenhagen';

  return title + ', Copenhagen';
}

/* ── 영업시간 데이터 (closed: 0=일,1=월,...,6=토) ── */
const VENUE_HOURS = [
  { keys:['louisiana','루이지애나'],
    open:'11:00', close:'22:00', closed:[1],
    note:'월요일 휴관 ⚠ 6/15(월) 방문 불가' },
  { keys:['designmuseum','디자인뮤지엄'],
    open:'10:00', close:'20:00', closed:[1],
    note:'월요일 휴관 ⚠ 6/15(월) 방문 불가' },
  { keys:['ny carlsberg','니 칼스버그','글립토테크'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관' },
  { keys:['torvehallerne','토르베'],
    open:'10:00', close:'19:00', closed:[],
    satClose:'18:00', sunOpen:'11:00', sunClose:'17:00',
    note:'일요일 단축 운영 (11–17시)' },
  { keys:['tivoli','티볼리'],
    open:'11:00', close:'23:00', closed:[],
    note:'계절 운영 (4–9월)' },
  { keys:['rundetårn','rundetaarn','둥근탑'],
    open:'10:00', close:'20:00', closed:[],
    note:'여름 시즌 운영' },
  { keys:['reffen','레펜'],
    open:'12:00', close:'22:00', closed:[1,2,3],
    note:'목–일요일만 운영 (시즌제)' },
  { keys:['charlottenlund'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관' },
  { keys:['statens museum','smk'],
    open:'10:00', close:'18:00', closed:[1],
    note:'월요일 휴관' },
  { keys:['rosenborg','로젠보르'],
    open:'10:00', close:'17:00', closed:[],
    note:'여름 시즌 매일 운영 (6–8월)' },
  { keys:['amalienborg','아마리엔보르'],
    open:'10:00', close:'16:00', closed:[1],
    note:'왕궁 박물관 — 월요일 휴관' },
  { keys:['christiansborg','크리스티안스보르'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관 (타워는 매일 10–20시)' },
  { keys:['nationalmuseet','국립박물관'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관 · 입장 무료' },
  { keys:['thorvaldsens','토르발센'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관 · 입장 무료' },
  { keys:['glyptotek','글립토테크','ny carlsberg'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관' },
  { keys:['ny carlsberg glyptotek'],
    open:'10:00', close:'17:00', closed:[1],
    note:'월요일 휴관' },
  { keys:['gammel dok','dac','danish architecture'],
    open:'10:00', close:'18:00', closed:[],
    note:'매일 운영' },
  { keys:['hart bageri','hart'],
    open:'07:30', close:'18:00', closed:[],
    satClose:'19:00', sunClose:'18:00',
    note:'금-토 07:30–19:00' },
  { keys:['hay house','hay '],
    open:'10:00', close:'18:00', closed:[],
    sunOpen:'11:00', sunClose:'17:00',
    note:'일요일 단축 운영 (11–17시)' },
  { keys:['wendelbo'],
    open:'10:00', close:'18:00', closed:[],
    note:'페스티벌 기간 (6/10–12) · 6/10 저녁 17:00–22:00 파티' },
  { keys:['folkehuset absalon','absalon'],
    open:'07:30', close:'00:00', closed:[],
    note:'일–목 07:30–00:00 · 금–토 07:30–02:00' },
];

/* 영업시간 경고 체크 → {type:'closed'|'early'|'late', msg} | null */
function getVenueWarning(it, di) {
  const dateStr = TRIP_DATES[di];
  if (!dateStr) return null;
  const dow = new Date(dateStr).getDay(); // 0=일,1=월,...
  const combined = ((it.title||'')+' '+(it.note||'')).toLowerCase();

  for (const v of VENUE_HOURS) {
    if (!v.keys.some(k => combined.includes(k.toLowerCase()))) continue;

    // 휴관일 체크
    if (v.closed.includes(dow)) return { type:'closed', msg: v.note };

    // 시간 체크
    const t = timeToMin(it.time);
    if (t < 9000) {
      // 일요일 단축운영
      const open  = timeToMin(dow===0 && v.sunOpen  ? v.sunOpen  : v.open);
      const close = timeToMin(dow===6 && v.satClose ? v.satClose :
                              dow===0 && v.sunClose ? v.sunClose : v.close);
      if (t < open)       return { type:'early', msg:`개관 전 (${v.open} 개관)` };
      if (t >= close - 30)return { type:'late',  msg:`마감 임박 (${v.close} 마감)` };
    }
    return null;
  }
  return null;
}

/* 터치 기기 감지: CSS 미디어쿼리가 오작동하는 기기 대비 */
if('ontouchstart' in window || navigator.maxTouchPoints > 0){
  document.documentElement.classList.add('is-touch');
}

/* ---------- USER ---------- */
let currentUser = null; // 'miju' | 'sanghyo'
const USER_LABELS = { miju:'미주', sanghyo:'상효' };

function loadUserPref(){
  currentUser = localStorage.getItem('cph_user') || null;
}
function saveUserPref(user){
  currentUser = user;
  try{ localStorage.setItem('cph_user', user); }catch(e){}
}
function updateUserSelector(){
  document.querySelectorAll('.user-sel-btn').forEach(btn=>{
    const isActive = btn.dataset.user === currentUser;
    btn.className = 'user-sel-btn' + (isActive ? ' active '+btn.dataset.user : '');
  });
}

/* ---------- DATA ---------- */
const DISTRICTS = [
  {key:'kongens', name:'Kongens Nytorv', color:'#c8492a', lat:55.680523, lng:12.585957, desc:'도심 핵심 광장 · Arper 등 주요 쇼룸 밀집', when:'Day 3 (6/10)'},
  {key:'frederik', name:'Frederiksstaden', color:'#d99021', lat:55.685312, lng:12.586381, desc:'왕실 지구 · Designmuseum Danmark 인접', when:'Day 3 (6/10)'},
  {key:'nordhavn', name:'Nordhavn', color:'#2f6b6b', lat:55.712579, lng:12.592704, desc:'페스티벌 발상지 · 미래지향 산업항 재생', when:'Day 4 (6/11)'},
  {key:'islands', name:'Islands Brygge', color:'#5d7456', lat:55.664052, lng:12.573073, desc:'하버프론트 · 산업지구 도시재생', when:'Day 4 (6/11)'},
  {key:'christ', name:'Christianshavn', color:'#6d3b54', lat:55.673658, lng:12.589203, desc:'17세기 운하 지구 · "city within a city"', when:'Day 5 (6/12)'},
  {key:'holmen', name:'Holmen', color:'#3a4a5a', lat:55.688482, lng:12.611017, desc:'옛 해군기지 섬 · 건축·예술 명소', when:'Day 5 (6/12)'},
  {key:'kultur', name:'Kultur', color:'#9c3318', lat:55.6845, lng:12.5790, desc:'문화 지구 · 디자인 토크 & 전시', when:'Day 5 (6/12)'},
  {key:'rosen', name:'Rosengård', color:'#7a6a3a', lat:55.682292, lng:12.572735, desc:'Fritz Hansen 등 · 도심 북서 골목', when:'Day 3 (6/10)'},
];

// 숙소 (Airbnb · 베스테르브로 · Sommerstedgade 26)
const STAY = {
  name:'우리 숙소 (Airbnb)',
  lat:55.6671, lng:12.5519,
  desc:'베스테르브로 · Sommerstedgade 26, 1718 København · 코펜하겐 중앙역 도보 15분',
  meta:'체크인 6/9 15:00~ · 체크아웃 6/16 11:00 전',
  url:'https://www.airbnb.co.kr/rooms/1565348100263330857'
};

/* ---------- 달리기 코스 경로 데이터 ---------- */
// _routePts → Leaflet 폴리라인 웨이포인트 [[lat,lng],...]
// gmaps → Google Maps 걷기 경로 URL
const RUNNING_ROUTES = {
  2:{ // 6/10 호수 이스트 루프 5km
    pts:[[55.6671,12.5519],[55.6748,12.5541],[55.6812,12.5600],[55.6855,12.5638],[55.6870,12.5692],[55.6830,12.5700],[55.6760,12.5568],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6812,12.5600|55.6855,12.5638|55.6870,12.5692|55.6760,12.5568&destination=55.6671,12.5519&travelmode=walking'
  },
  3:{ // 6/11 3대 호수 풀 루프 7km
    pts:[[55.6671,12.5519],[55.6748,12.5541],[55.6855,12.5638],[55.6950,12.5618],[55.7038,12.5580],[55.7038,12.5525],[55.6950,12.5525],[55.6810,12.5530],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6855,12.5638|55.6950,12.5618|55.7038,12.5580|55.6950,12.5525|55.6810,12.5530&destination=55.6671,12.5519&travelmode=walking'
  },
  4:{ // 6/12 프레데릭스베르 공원 루프 5km
    pts:[[55.6671,12.5519],[55.6720,12.5412],[55.6750,12.5280],[55.6754,12.5158],[55.6812,12.5202],[55.6828,12.5290],[55.6780,12.5368],[55.6710,12.5390],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6750,12.5280|55.6754,12.5158|55.6812,12.5202|55.6828,12.5290|55.6710,12.5390&destination=55.6671,12.5519&travelmode=walking'
  },
  5:{ // 6/13 하버&운하 루프 7km
    pts:[[55.6671,12.5519],[55.6697,12.5626],[55.6690,12.5742],[55.6667,12.5818],[55.6710,12.5884],[55.6743,12.5893],[55.6773,12.5877],[55.6800,12.5826],[55.6755,12.5693],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6690,12.5742|55.6710,12.5884|55.6773,12.5877|55.6800,12.5826&destination=55.6671,12.5519&travelmode=walking'
  },
  6:{ // 6/14 베스테르브로&시청광장 루프 5km
    pts:[[55.6671,12.5519],[55.6715,12.5578],[55.6753,12.5655],[55.6759,12.5682],[55.6791,12.5726],[55.6792,12.5765],[55.6735,12.5731],[55.6695,12.5640],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6759,12.5682|55.6791,12.5726|55.6792,12.5765|55.6695,12.5640&destination=55.6671,12.5519&travelmode=walking'
  },
  7:{ // 6/15 프레데릭스베르 확장 루프 7km
    pts:[[55.6671,12.5519],[55.6720,12.5412],[55.6755,12.5332],[55.6754,12.5158],[55.6830,12.5210],[55.6840,12.5320],[55.6810,12.5390],[55.6762,12.5355],[55.6700,12.5338],[55.6671,12.5519]],
    gmaps:'https://www.google.com/maps/dir/?api=1&origin=55.6671,12.5519&waypoints=55.6755,12.5332|55.6754,12.5158|55.6830,12.5210|55.6840,12.5320|55.6700,12.5338&destination=55.6671,12.5519&travelmode=walking'
  }
};

const DEFAULT_PLAN = [
  // DAY 0 — 6/8
  {date:'6/8 (월)', tag:'인천 출발', fest:false, items:[
    {time:'22:25', title:'[미주] ICN → AMS 출발', note:'KE5925 (KLM 운항·B787-9) · 13h45m · 암스테르담 경유', dist:'', _fixed:true, _lat:37.4692, _lng:126.4503},
    {time:'23:35', title:'[상효] ICN(T2) → CPH 직항 출발', note:'SAS SK0988 · 13h25m · 좌석 31F', dist:'', _fixed:true, _lat:37.4692, _lng:126.4503},
  ]},
  // DAY 1 — 6/9
  {date:'6/9 (화)', tag:'코펜하겐 도착', fest:false, items:[
    {time:'06:00', title:'[상효] CPH(T3) 도착', note:'SAS 직항 · 메트로 M2로 도심 이동', dist:'', _fixed:true, _lat:55.6180, _lng:12.6560},
    {time:'08:30', title:'[미주] CPH(T2) 도착', note:'KE5925 → KL1267 환승 후 도착 · 터미널2 · 공항에서 합류', dist:'', _fixed:true, _lat:55.6180, _lng:12.6560},
    {time:'11:00', title:'숙소 이동 및 짐 보관', note:'Sommerstedgade 26, 1718 København · 체크인은 15:00부터', dist:'', _lat:55.6671, _lng:12.5519},
    {time:'11:30', title:'Hart Bageri', note:'카다멈 크로아상 · Gammel Kongevej 109, Frederiksberg', tag:'🍽 식사', dist:'', _lat:55.6755, _lng:12.5436, _fixed:true},
    {time:'13:30', title:'디자인뮤지엄 덴마크 — 상설 전시', note:'Bredgade 68 · 페스티벌 기간 행사도 다수 · 미주', dist:'', _lat:55.6866, _lng:12.5928, _fixed:true},
    {time:'15:00', title:'Airbnb 체크인', note:'Sommerstedgade 26, 1718 København · 베스테르브로', dist:'', _lat:55.6671, _lng:12.5519},
    {time:'16:00', title:'The Mechanics of Scent — Frama @ Apotek 57 (예약 완료)', note:'Fredericiagade 57, 1310 København (Apotek 57) · 16:00–16:30 · 미주 예약 완료', dist:'', _lat:55.6844, _lng:12.5903, _fixed:true},
    {time:'오후', title:'시차 적응 산책 · 뉘하운(Nyhavn)', note:'무리하지 않기 · 가벼운 도심 워킹', dist:''},
  ]},
  // DAY 2 — 6/10 (Festival Day 1)
  {date:'6/10 (수)', tag:'페스티벌 1일차', fest:true, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 호수 이스트 루프 5km', note:'숙소 → Åboulevard → 상트요르겐스 호수 북쪽 → 페블링에 호수 동쪽 반바퀴 → 귀숙 · 약 30분 · 완전 평탄 포장', dist:'', _lat:55.6801, _lng:12.5631, _runningCourse:true, ...RUNNING_ROUTES[2]},
    {time:'17:00', title:'🍽 Food & Music with SALU (예약 완료)', note:'소셜 다이닝 3명 · Folkehuset Absalon, Sønder Blvd. 73, 1720 København · 17:00–20:00 · QR코드 보유 · 숙소 도보권', dist:'고정 일정', _lat:55.665398, _lng:12.550298, _fixed:true},
  ]},
  // DAY 3 — 6/11 (Festival Day 2)
  {date:'6/11 (목)', tag:'페스티벌 2일차', fest:true, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 3대 호수 풀 루프 7km', note:'숙소 → 상트요르겐스 → 페블링에 → 소르테담 호수 끝까지 → 반대편 돌아 귀숙 · 약 42분 · 코펜하겐 최고 인기 러닝 코스', dist:'', _lat:55.6855, _lng:12.5686, _runningCourse:true, ...RUNNING_ROUTES[3]},
  ]},
  // DAY 4 — 6/12 (Festival Day 3)
  {date:'6/12 (금)', tag:'페스티벌 3일차', fest:true, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 프레데릭스베르 공원 루프 5km', note:'숙소 → Gammel Kongevej → 프레데릭스베르 Have 메인게이트 → 공원 내부 루프 → 귀숙 · 약 30분 · 왕실 정원 자갈길', dist:'', _lat:55.6762, _lng:12.5265, _runningCourse:true, ...RUNNING_ROUTES[4]},
  ]},
  // DAY 5 — 6/13
  {date:'6/13 (토)', tag:'자유 관광', fest:false, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 하버 & 운하 루프 7km', note:'숙소 → 중앙역 → Langebro 다리 → Amager Blvd → 크리스티안스하운 운하 → Knippelsbro → 귀숙 · 약 42분 · 운하·항구 파노라마', dist:'', _lat:55.6700, _lng:12.5755, _runningCourse:true, ...RUNNING_ROUTES[5]},
    {time:'미정', title:'벨뷰 해변 (아르네 야콥센 비치)', note:'Bellevue Strand, Klampenborg — 야콥센 설계 라이프가드 타워 · 북유럽 모더니즘 해변', dist:'', _lat:55.7766, _lng:12.5780},
    {time:'미정', title:'루이지애나 현대미술관', note:'GL Strandvej 13, Humlebæk — 해안절벽 위 건축 · 북유럽 최고 미술관 · 토–일 11:00–18:00', dist:'', _lat:55.9695, _lng:12.5430},
  ]},
  // DAY 6 — 6/14
  {date:'6/14 (일)', tag:'근교 / 미술관', fest:false, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 베스테르브로 & 시청광장 루프 5km', note:'숙소 → Vesterbrogade → Rådhuspladsen 시청광장 → H.C. Andersens Blvd → Istedgade → 귀숙 · 약 30분 · 아침 코펜하겐 도심 분위기', dist:'', _lat:55.6757, _lng:12.5680, _runningCourse:true, ...RUNNING_ROUTES[6]},
  ]},
  // DAY 7 — 6/15
  {date:'6/15 (월)', tag:'자유 일정', fest:false, items:[
    {time:'07:00', title:'🏃 아침 달리기 — 프레데릭스베르 확장 루프 7km', note:'숙소 → Gammel Kongevej → 프레데릭스베르 Have → Frederiksberg Allé → 주택가 골목 → 귀숙 · 약 42분 · 왕실 정원 + 고급 주거지구', dist:'', _lat:55.6780, _lng:12.5200, _runningCourse:true, ...RUNNING_ROUTES[7]},
    {time:'미정', title:'프리타운 크리스티아니아', note:'Christiania, Christianshavn — 자유 공동체 마을 · 그래피티·갤러리·카페 산책 · 매일 24시간', dist:'', _lat:55.6729, _lng:12.5946},
  ]},
  // DAY 8 — 6/16
  {date:'6/16 (화)', tag:'귀국 (출국일)', fest:false, items:[
    {time:'~11:00', title:'Airbnb 체크아웃', note:'체크아웃 11:00 전 · 짐 정리', dist:''},
    {time:'오전', title:'마지막 산책 · 기념품', note:'14시 이전까지 도심에서 함께', dist:''},
    {time:'~14:30', title:'[미주] 공항 이동', note:'16:40 출발편 · 2시간 전 도착 권장', dist:'', _fixed:true, _lat:55.6180, _lng:12.6560},
    {time:'16:40', title:'[미주] CPH → LHR 출발', note:'SK1517 · 런던 경유 후 6/17 16:15 ICN 도착', dist:'', _fixed:true, _lat:55.6180, _lng:12.6560},
    {time:'오후~저녁', title:'[상효] 도심 자유시간', note:'미주 출발 후 늦은 출국까지 여유', dist:''},
    {time:'~21:30', title:'[상효] 공항 이동 (CPH·T3)', note:'23:55 출발편 · 2시간 전 도착', dist:'', _fixed:true},
    {time:'23:55', title:'[상효] CPH → ICN 직항 출발', note:'SAS SK0987 · 11h40m · 6/17 18:35 ICN 도착', dist:'', _fixed:true, _lat:55.6180, _lng:12.6560},
  ]},
];

/* ---------- AUTH ---------- */
const AUTH_KEY='cph_auth_v1';
let authToken=localStorage.getItem(AUTH_KEY)||null;

function clearToken(){ authToken=null; localStorage.removeItem(AUTH_KEY); }

async function serverGet(){
  if(!authToken) return null;
  try{
    const r=await fetch('/api/plan',{headers:{Authorization:`Bearer ${authToken}`}});
    if(r.status===401){ clearToken(); return null; }
    return r.ok ? r.json() : null;
  }catch{ return null; }
}

let _sst; const _pending={};
function queueServerSave(upd){
  Object.assign(_pending,upd);
  clearTimeout(_sst);
  _sst=setTimeout(async()=>{
    if(!authToken) return;
    const body={..._pending}; for(const k in _pending) delete _pending[k];
    try{ await fetch('/api/plan',{method:'POST',headers:{Authorization:`Bearer ${authToken}`,'Content-Type':'application/json'},body:JSON.stringify(body)}); }catch{}
  },1500);
}

async function doLogin(user,pw){
  const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,password:pw})});
  const d=await r.json();
  if(!r.ok) throw new Error(d.error||'로그인 실패');
  authToken=d.token; localStorage.setItem(AUTH_KEY,d.token);
  return d;
}

/* ---------- STATE / PERSISTENCE ---------- */
const STORE_KEY = 'cph_design_plan_v4';
let plan;

async function loadPlan(){
  let loaded = null;
  try{ const raw=localStorage.getItem(STORE_KEY); if(raw) loaded=JSON.parse(raw); }catch(e){}
  plan = loaded || structuredClone(DEFAULT_PLAN);
}

let saveTimer;
async function savePlan(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(plan)); }catch(e){}
  queueServerSave({plan});
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{
    const s=document.getElementById('saver');
    if(s){ s.classList.add('show'); setTimeout(()=>s.classList.remove('show'),1400); }
  },400);
}

function saveFavs(){
  try{ localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); }catch(e){}
  queueServerSave({favs:[...favorites]});
}

/* ---------- PLAN MAP VISUALIZATION ---------- */
let routeLayer = null;
let planPinLayer = [];
let selRouteLayer = null;
let runRouteLayers = [];   // 달리기 코스 폴리라인 (날짜 전환 시 초기화)
let planSelItems = []; // [{di,ii,lat,lng,title}] max 2
let selectedPlanKey = null; // 현재 지도 선택된 plan item "di-ii"
let exhPinLayer = null;     // 전시탭 지도 핀
const exhGeoCache = {};     // address -> {lat,lng}

function clearRunRouteLayers(){
  runRouteLayers.forEach(l=>map.removeLayer(l));
  runRouteLayers=[];
}

/* ---------- 공통 Nominatim 지오코딩 (서버 프록시 경유) ---------- */
async function nominatimGeocode(query){
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if(!res.ok) return null;
  return await res.json(); // {lat, lng} | null
}

/* 전시 카드 클릭 → 지도에 핀 표시 */
function clearExhPin(){ if(exhPinLayer){ map.removeLayer(exhPinLayer); exhPinLayer=null; } }

async function showExhPin(ex){
  clearExhPin();
  const distD = EXH_DISTRICTS.find(d=>d.key===ex.district)||{color:'#888'};
  const color = distD.color||'#888';

  let lat, lng;
  const cacheKey = ex.address||ex.brand;
  if(exhGeoCache[cacheKey]){
    ({lat,lng} = exhGeoCache[cacheKey]);
  } else {
    // 지구 좌표로 즉시 임시 핀
    const dist = DISTRICTS.find(d=>d.name===ex.district);
    if(dist){ lat=dist.lat; lng=dist.lng; }
    // Nominatim 지오코딩 (백그라운드)
    const query = ex.address || (ex.brand + ' ' + (ex.district||''));
    nominatimGeocode(query).then(c=>{
      if(!c) return;
      exhGeoCache[cacheKey] = c;
      clearExhPin();
      _placeExhPin(ex, c.lat, c.lng, color);
      map.flyTo([c.lat, c.lng], 16, {duration:.5});
    }).catch(()=>{});
  }
  if(lat && lng) _placeExhPin(ex, lat, lng, color);
}

function _placeExhPin(ex, lat, lng, color){
  const icon = L.divIcon({
    className:'',
    html:`<div style="background:${color};color:#fff;padding:3px 8px;border-radius:4px;font-size:10.5px;font-family:'Space Mono',monospace;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35);max-width:180px;overflow:hidden;text-overflow:ellipsis">${ex.brand}</div>`,
    iconAnchor:[0,0]
  });
  exhPinLayer = L.marker([lat,lng],{icon}).addTo(map);
  exhPinLayer.bindPopup(
    `<div class="pop-name">🏛 ${ex.brand}</div>` +
    `<div class="pop-desc">📍 ${ex.address||ex.district}<br><span style="background:${color};color:#fff;font-size:9px;padding:1px 5px;font-family:'Space Mono',monospace;border-radius:2px">${ex.district}</span></div>`
  ).openPopup();
  map.flyTo([lat,lng], 15, {duration:.5});
}

/* 일정 아이템 백그라운드 지오코딩 — 다중 전략 순차 시도 */
async function geocodePlanItem(item, di){
  if(item._lat && item._lng) return;

  // 1. 숙소/복귀 키워드 → STAY 좌표 즉시
  const stayKw = /숙소|체크인|체크아웃|airbnb|에어비앤비|호텔|hotel|check.?in|check.?out/i;
  if(stayKw.test(item.title) || stayKw.test(item.note||'')){
    item._lat = STAY.lat; item._lng = STAY.lng;
    savePlan();
    if(activeTab==='plan'){ updateDayViz(di); renderPlan(); }
    return;
  }

  // 2. 헬퍼: 한국어 및 이모지·이동시간 표현 제거
  const clean = s => s
    .replace(/←[^·\n]*/g,'')          // "← X에서 🚌 ~15분" 제거
    .replace(/[가-힣]+/g,' ')          // 한국어 제거
    .replace(/[\u{1F300}-\u{1FFFF}]/gu,' ') // 이모지 제거
    .replace(/~\d+분/g,' ')            // ~15분 제거
    .replace(/\s{2,}/g,' ').trim();

  // 3. note에서 덴마크 주소 패턴 추출 (도로명+번지+우편번호+도시)
  const rawNote = (item.note||'').split('·')[0];
  const addrM = rawNote.match(/([A-Za-zÆØÅæøåÉé\s]+\s+\d+[A-Za-z]?[,\s]+\d{4}\s+[A-Za-zÆØÅæøå]+)/);
  const addrOnly = addrM ? addrM[1].trim() : null;

  // 4. 제목 클린 (괄호·태그 제거 + 한국어 제거)
  const cleanTitle = clean(item.title.replace(/\[.*?\]/g,'').replace(/\(.*?\)/g,''));
  const cleanNote  = clean(rawNote);

  // 5. 쿼리 후보 목록 (빈 것 제외, 중복 제외)
  const seen = new Set();
  const queries = [
    addrOnly,                                         // 주소만 (가장 정확)
    cleanTitle + (addrOnly?' '+addrOnly:''),          // 이름 + 주소
    cleanTitle + (cleanNote?' '+cleanNote:''),         // 이름 + 정제 노트
    cleanTitle,                                       // 이름만
  ].filter(q=>{ if(!q||!q.trim()) return false; const k=q.trim(); if(seen.has(k))return false; seen.add(k); return true; });

  try{
    for(const query of queries){
      const c = await nominatimGeocode(query);
      if(c){
        item._lat = c.lat; item._lng = c.lng;
        savePlan();
        if(activeTab==='plan'){ updateDayViz(di); renderPlan(); }
        return;
      }
    }
  }catch(e){}
}

function getItemCoords(it){
  if(it._lat && it._lng) return {lat:it._lat, lng:it._lng};
  if(it._dk){
    const d = DISTRICTS.find(x=>x.key===it._dk);
    if(d) return {lat:d.lat, lng:d.lng};
  }
  return null;
}

function clearPlanPins(){
  planPinLayer.forEach(m=>map.removeLayer(m));
  planPinLayer=[];
}

function renderPlanMarkers(di){
  clearPlanPins();
  const dayColor = DAY_COLORS[di]||'#c8492a';
  let seq = 0;
  plan[di].items.forEach((it)=>{
    const coords = getItemCoords(it);
    if(!coords) return;
    seq++;
    const catIcon = getCategoryIcon(it);
    const isFixed = !!it._fixed;
    // 색상 우선순위: ①_dk 지구색 → ②좌표 기준 가장 가까운 지구색(5km 이내) → ③날짜색
    let distObj = it._dk ? DISTRICTS.find(d=>d.key===it._dk) : null;
    if(!distObj && coords){
      const nd = nearestDistrict(coords.lat, coords.lng);
      if(nd.dist_km <= 5) distObj = nd.district;
    }
    const pinColor = distObj ? distObj.color : dayColor;
    const borderColor = isFixed ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.3)';
    const numLabel = isFixed ? '🔒' : seq;
    const icon = L.divIcon({
      className:'',
      html:`<div class="ppv2${isFixed?' fixed-pin':''}" style="--ppbg:${pinColor};background:${pinColor};border-color:${borderColor}">
        <span class="ppv2-num">${numLabel}</span>
        <span class="ppv2-ico">${catIcon}</span>
      </div>`,
      iconSize:[36,44], iconAnchor:[18,44], popupAnchor:[0,-46]
    });
    const m = L.marker([coords.lat,coords.lng],{icon}).addTo(map);
    m.bindPopup(`<div class="pop-name">${catIcon} ${it.title}</div><div class="pop-desc">${it.time?`<b>${it.time}</b> · `:''}${it.note||''}<br><span style="display:inline-block;margin-top:4px;background:${pinColor};color:#fff;padding:1px 6px;font-family:'Space Mono',monospace;font-size:10px;border-radius:1px">${plan[di].date}</span></div>`);
    planPinLayer.push(m);
  });

  // 달리기 코스 경로 폴리라인 자동 표시
  clearRunRouteLayers();
  plan[di].items.forEach(it=>{
    if(!it._runningCourse || !it.pts) return;
    const line = L.polyline(it.pts, {color:'#e05c2a', weight:3, opacity:.75, dashArray:'8 5'}).addTo(map);
    const startM = L.circleMarker(it.pts[0], {radius:6, color:'#e05c2a', fillColor:'#fff', fillOpacity:1, weight:2}).addTo(map);
    const endM   = L.circleMarker(it.pts[it.pts.length-1], {radius:5, color:'#e05c2a', fillColor:'#e05c2a', fillOpacity:.7, weight:2}).addTo(map);
    runRouteLayers.push(line, startM, endM);
  });
}

function updateDayViz(di){
  if(routeLayer){ map.removeLayer(routeLayer); routeLayer=null; }
  // _dk 좌표(지구 기반)까지 포함
  const pts = plan[di].items.map(it=>getItemCoords(it)).filter(Boolean).map(c=>[c.lat,c.lng]);
  if(pts.length>=2){
    routeLayer = L.polyline(pts,{color:'#c8492a',weight:3,opacity:.7,dashArray:'6 5'}).addTo(map);
    map.fitBounds(routeLayer.getBounds(),{padding:[40,40],maxZoom:15});
  }
  renderPlanMarkers(di);
}

/* ---------- TRANSPORT MODE ---------- */
function getTransportMode(km){
  if(km < 0.7) return {icon:'🚶', label:'도보',     speed:5,  extra:0};
  if(km < 2.5) return {icon:'🚴', label:'자전거',   speed:14, extra:0};
  if(km < 6)   return {icon:'🚌', label:'대중교통', speed:18, extra:5};
  return              {icon:'🚇', label:'지하철',   speed:28, extra:8};
}

function transportBetween(coordA, coordB){
  const km = haversineKm(coordA.lat, coordA.lng, coordB.lat, coordB.lng);
  const m = getTransportMode(km);
  const mins = Math.max(1, Math.round(km/m.speed*60) + m.extra);
  return {km, mins, ...m};
}

/* ---------- ITEM ROUTE VISUALIZATION (click) ---------- */
function showItemRoute(di, ii){
  if(selRouteLayer){ map.removeLayer(selRouteLayer); selRouteLayer=null; }
  // 다른 날 선택 시 해당 날짜 핀으로 전환
  if(di !== currentVisDay){ currentVisDay=di; updateDayViz(di); }
  const items = plan[di].items;
  const coords = getItemCoords(items[ii]);

  // 좌표 없는 항목: 백그라운드 지오코딩 시도 (_user 또는 _addedBy 있는 항목)
  if(!coords && (items[ii]._user || items[ii]._addedBy) && items[ii].title){
    const st2=document.getElementById('drawerStatus');
    if(st2){ st2.className='drawer-status show'; st2.textContent='📍 지도 좌표 검색 중...'; }
    geocodePlanItem(items[ii], di).then(()=>{
      const c2=getItemCoords(items[ii]);
      if(c2){ showItemRoute(di,ii); } // 좌표 생기면 재시도
      else if(st2){ st2.className='drawer-status show err'; st2.textContent='📍 지도 좌표를 찾지 못했어요. 제목/메모를 더 구체적으로 입력해보세요.'; }
    });
  }

  // 이전/다음 좌표 있는 항목 탐색
  let prevC=null, prevIt=null, nextC=null, nextIt=null;
  for(let i=ii-1;i>=0;i--){ const c=getItemCoords(items[i]); if(c){prevC=c;prevIt=items[i];break;} }
  for(let i=ii+1;i<items.length;i++){ const c=getItemCoords(items[i]); if(c){nextC=c;nextIt=items[i];break;} }

  // 경로선 그리기
  const pts=[];
  if(prevC) pts.push([prevC.lat,prevC.lng]);
  if(coords) pts.push([coords.lat,coords.lng]);
  if(nextC) pts.push([nextC.lat,nextC.lng]);

  if(pts.length>=2){
    selRouteLayer=L.polyline(pts,{color:'#d99021',weight:3,opacity:.9,dashArray:'4 4'}).addTo(map);
    map.fitBounds(L.latLngBounds(pts),{padding:[55,55],maxZoom:15});
  } else if(coords){
    map.flyTo([coords.lat,coords.lng],15,{duration:.8});
    const pin=planPinLayer.find(m=>{const ll=m.getLatLng();return Math.abs(ll.lat-coords.lat)<.0001&&Math.abs(ll.lng-coords.lng)<.0001;});
    if(pin) pin.openPopup();
  }

  // 드로어 상태에 이동수단 정보 표시
  const parts=[];
  if(prevC && coords){
    const t=transportBetween(prevC,coords);
    parts.push(`← ${t.icon} ${t.label} ~${t.mins}분 (${t.km.toFixed(1)}km)`);
  }
  if(coords && nextC){
    const t=transportBetween(coords,nextC);
    parts.push(`${t.icon} ${t.label} ~${t.mins}분 → (${t.km.toFixed(1)}km)`);
  }
  const st=document.getElementById('drawerStatus');
  if(st && parts.length){
    st.className='drawer-status show ok';
    // 실시간 대중교통 조회 버튼
    const transitBtn = coords && nextC
      ? `<button onclick="fetchTransit(${coords.lat},${coords.lng},${nextC.lat},${nextC.lng})" style="margin-left:8px;font-size:9px;font-family:Space Mono,monospace;padding:2px 6px;border:1px solid var(--teal);color:var(--teal);background:none;cursor:pointer">🚌 실시간 경로</button>`
      : '';
    st.innerHTML = parts.join('   ·   ') + transitBtn;
  }
}

// Rejseplanen 실시간 대중교통 조회
async function fetchTransit(fromLat, fromLng, toLat, toLng){
  const st = document.getElementById('drawerStatus');
  if(st){ st.innerHTML+=' <span style="opacity:.6">조회 중...</span>'; }
  try{
    // 출발지 정류장 검색
    const fromR = await fetch(`/api/transit?type=location&lat=${fromLat}&lng=${fromLng}`);
    const fromD = await fromR.json();
    const fromStop = fromD.LocationList?.StopLocation?.[0] || fromD.CoordLocation?.[0];

    // 도착지 정류장 검색
    const toR = await fetch(`/api/transit?type=location&lat=${toLat}&lng=${toLng}`);
    const toD = await toR.json();
    const toStop = toD.LocationList?.StopLocation?.[0] || toD.CoordLocation?.[0];

    if(!fromStop || !toStop) throw new Error('정류장 없음');

    // 경로 조회
    const tripR = await fetch(`/api/transit?type=trip&originId=${fromStop.id}&destId=${toStop.id}`);
    const tripD = await tripR.json();
    const leg = tripD.TripList?.Trip?.[0]?.Leg;
    const legs = Array.isArray(leg) ? leg : (leg ? [leg] : []);

    if(!legs.length) throw new Error('경로 없음');

    const summary = legs.map(l=>l.name||l.type).join(' → ');
    const first = legs[0], last = legs[legs.length-1];
    const dur = first?.Origin?.time && last?.Destination?.time
      ? ` (${first.Origin.time}~${last.Destination.time})`
      : '';

    if(st){ st.innerHTML=`🚌 ${fromStop.name} → ${toStop.name}<br><b>${summary}</b>${dur}`; }
  }catch(e){
    if(st){ st.innerHTML+=` <span style="color:var(--rust)">조회 실패: ${e.message}</span>`; }
  }
}

/* ---------- DAY GAP SUGGESTIONS ---------- */
// 해당 날 RECOMMEND 항목 중 아직 plan에 없는 것 반환
function getDayGapItems(di){
  const day = RECOMMEND.find(r=>r.dayIdx===di);
  if(!day) return [];
  return day.items.filter(it=>!plan[di].items.some(p=>p.title===it.title)).slice(0,4);
}

function renderDayGap(di, body){
  const gaps = getDayGapItems(di);
  if(!gaps.length) return;

  const sec = document.createElement('div');
  sec.className='day-gap-section';
  sec.innerHTML=`<div class="day-gap-title">💡 빈 시간 추천</div>`;
  const list=document.createElement('div'); list.className='day-gap-list';

  gaps.forEach(it=>{
    const row=document.createElement('div'); row.className='day-gap-item';
    row.innerHTML=`
      <span class="day-gap-time">${it.time}</span>
      <span class="day-gap-name">${it.title}</span>
      <span class="day-gap-add">＋</span>`;
    row.addEventListener('click',async()=>{
      if(plan[di].items.some(p=>p.title===it.title)) return;
      plan[di].items.push({time:it.time,title:it.title,note:it.note,dist:it.tag||'',_user:true,_lat:it._lat,_lng:it._lng});
      sortDayByTime(di);
      await savePlan();
      renderPlan();
    });
    list.appendChild(row);
  });

  const titleEl=sec.querySelector('.day-gap-title');
  titleEl.onclick=()=>{ list.style.display=list.style.display==='none'?'flex':'none'; };
  sec.appendChild(list);
  body.appendChild(sec);
}

// 2개 항목 선택 시 지도에 거리선 표시
function togglePlanSel(di, ii, lat, lng, title, dotEl){
  const key = `${di}-${ii}`;
  const idx = planSelItems.findIndex(x=>x.key===key);
  if(idx>=0){
    planSelItems.splice(idx,1);
    dotEl.classList.remove('on');
  } else {
    if(planSelItems.length>=2){
      // 기존 첫 번째 제거
      const old = planSelItems.shift();
      document.querySelector(`[data-selkey="${old.key}"]`)?.classList.remove('on');
    }
    planSelItems.push({key,di,ii,lat,lng,title});
    dotEl.classList.add('on');
  }
  // 선택 경로 업데이트
  if(selRouteLayer){ map.removeLayer(selRouteLayer); selRouteLayer=null; }
  if(planSelItems.length===2){
    const a=planSelItems[0], b=planSelItems[1];
    selRouteLayer = L.polyline([[a.lat,a.lng],[b.lat,b.lng]],
      {color:'#d99021',weight:3,opacity:.9,dashArray:'4 4'}).addTo(map);
    const t = transportBetween({lat:a.lat,lng:a.lng},{lat:b.lat,lng:b.lng});
    selRouteLayer.bindPopup(
      `<div class="pop-name">📍 ${a.title} → ${b.title}</div>` +
      `<div class="pop-desc">직선 ${t.km.toFixed(2)}km · ${t.icon} ${t.label} 약 ${t.mins}분</div>`
    ).openPopup();
    map.fitBounds([[a.lat,a.lng],[b.lat,b.lng]],{padding:[60,60],maxZoom:15});
  }
}

/* ---------- FESTIVAL EVENTS DATA ---------- */
// DISTRICTS 배열에서 색상 조회 (별도 DISTRICT_COLORS 객체 제거)
function districtColor(name){ return DISTRICTS.find(d=>d.name===name)?.color||'#888'; }
// 날짜→plan 인덱스 매핑 (plan[2]=6/10, plan[3]=6/11, plan[4]=6/12)
const FEST_DATE_MAP = {'June 10':2,'June 11':3,'June 12':4};

const FEST_CATEGORIES = [
  {key:'all',       label:'전체',       icon:'·',  color:'#1a1714'},
  {key:'morning',   label:'아침·커피',  icon:'☕', color:'#8b5e3c'},
  {key:'brunch',    label:'브런치·음료',icon:'🥂', color:'#9b7ab5'},  // lunch + afternoon 통합
  {key:'dining',    label:'저녁 다이닝',icon:'🍽', color:'#c8492a'},
  {key:'talk',      label:'토크·패널',  icon:'💬', color:'#2f6b6b'},
  {key:'exhibition',label:'전시·오프닝',icon:'🏛', color:'#6d3b54'},
  {key:'workshop',  label:'워크숍',     icon:'✂️', color:'#5d7456'},
  {key:'tour',      label:'투어·워크',  icon:'🚶', color:'#3a4a5a'},
  {key:'wellness',  label:'웰니스',     icon:'🧘', color:'#9c3318'},
  {key:'launch',    label:'런칭',       icon:'🚀', color:'#d99021'},
];

/* FESTIVAL_EVENTS loaded from /events-data.js */

/* ---------- RENDER: FESTIVAL EVENTS ---------- */
let festDateFilter = 'June 10';
let festDistFilter = 'all';
let festCatFilter = 'all';
let festChecked = new Set();
let festSearchQuery = '';
const evDetailCache = {};

/* ---------- EVENT DETAIL MODAL ---------- */
function openEvModal(ev, id){
  // 모든 기존 오버레이 제거 (중복 방지)
  document.querySelectorAll('.ev-overlay').forEach(el=>el.remove());
  const existing = null;
  if(existing){
    existing.remove();
    // 같은 이벤트 재클릭이면 닫기만 (토글)
    if(existing.dataset.evId === id) return;
  }

  const dkColor = districtColor(ev.district);
  const overlay = document.createElement('div');
  overlay.className='ev-overlay'; overlay.id='evOverlay';
  overlay.dataset.evId = id;

  overlay.innerHTML=`
    <div class="ev-modal" id="evModal">
      <div class="ev-header">
        <button class="ev-close" id="evClose">✕</button>
        <div class="ev-hed-title">${ev.title}</div>
        <div class="ev-hed-meta">
          <span class="ev-hed-time">${ev.time}</span>
          <span>${ev.venue}</span>
          <span class="ev-hed-dk" style="background:${dkColor}">${ev.district}</span>
        </div>
      </div>
      <div class="ev-photo-placeholder">
        <div class="ev-photo-icon">🏛</div>
        <div class="ev-photo-vname">${ev.venue.toUpperCase()}</div>
      </div>
      <div class="ev-body" id="evBody">
        <div class="ev-section">
          <div class="ev-section-label">행사 설명</div>
          <div class="ev-section-body">${ev.desc}</div>
        </div>
        <div id="evDetail">
          <div class="ev-loading"><div class="ev-spin"></div>상세 정보를 불러오는 중...</div>
        </div>
      </div>
      <div class="ev-add-row">
        <button class="ev-add-btn ${festChecked.has(id)?'done':''}" id="evAddBtn">
          ${festChecked.has(id)?'✓ 일정에 추가됨':'＋ 일정에 추가'}
        </button>
      </div>
    </div>`;

  // 닫기
  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
  overlay.querySelector('#evClose').onclick = ()=>overlay.remove();

  // 일정 추가 버튼
  overlay.querySelector('#evAddBtn').onclick = ()=>{
    const btn = overlay.querySelector('#evAddBtn');
    if(festChecked.has(id)){
      festChecked.delete(id);
      btn.textContent='＋ 일정에 추가'; btn.classList.remove('done');
    } else {
      festChecked.add(id);
      btn.textContent='✓ 일정에 추가됨'; btn.classList.add('done');
    }
    updateFestBar();
  };

  document.body.appendChild(overlay);

  // 상세 정보 로드
  loadEvDetail(ev, id);
}

async function loadEvDetail(ev, id){
  const detailEl = document.getElementById('evDetail');
  if(!detailEl) return;

  if(evDetailCache[id]){
    renderEvDetail(evDetailCache[id], detailEl);
    return;
  }

  const sys = `너는 코펜하겐 3 Days of Design 2026 페스티벌 전문가다. 행사 정보를 받아 JSON만 출력한다. 마크다운·설명 절대 금지.

예약 분류 기준 (매우 중요):
- "불필요": 쇼룸 방문, 전시 관람, 브렉퍼스트/커피/토크/워크숍 등 브랜드가 무료로 여는 행사. 3 Days of Design 행사의 90% 이상이 여기에 해당. 브랜드 초대 행사, 오프닝, 가이드 투어 등 모두 불필요.
- "티켓 필요": 공식 홈페이지 Shop(https://www.3daysofdesign.dk/shop)에서 유료 티켓을 판매하는 행사만. 대표 예: Long Table Dinner, Entering the Now Symposium, 유료 워크숍. 행사명이나 설명에 "ticket", "티켓", "유료", "dinner" 등 명확한 근거가 있을 때만 선택.
- "사전등록 권장": 위 두 경우가 아닌, 무료이지만 인원 제한으로 사전 온라인 등록이 필요하다고 명시된 경우에만. 근거 없으면 "불필요"로 분류.

출력 형식:
{
  "detail": "3~4문장 상세 설명 (한국어, 행사 성격·볼거리·분위기)",
  "reservation": "불필요" | "사전등록 권장" | "티켓 필요",
  "reservationNote": "예약 관련 한 줄 안내. 불필요이면 빈 문자열",
  "bookingUrl": "티켓 필요인 경우 https://www.3daysofdesign.dk/shop, 사전등록 권장인 경우 https://www.3daysofdesign.dk/events, 불필요이면 빈 문자열",
  "items": ["준비물1","준비물2",...],
  "duration": "예상 소요시간 (예: 30분~1시간)",
  "tips": "현장 팁 한 문장"
}`;

  const input = `행사명: ${ev.title}
장소: ${ev.venue} (${ev.address})
날짜/시간: ${ev.date} ${ev.time}
지구: ${ev.district}
설명: ${ev.desc}`;

  try{
    const resp = await fetch('/api/extract',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({system:sys, input, max_tokens:600})
    });
    if(!resp.ok) throw new Error(resp.status);
    const data = await resp.json();
    const txt = (data.text||'').replace(/```json|```/g,'').trim();
    const obj = JSON.parse(txt);
    evDetailCache[id] = obj;
    if(document.getElementById('evDetail')) renderEvDetail(obj, document.getElementById('evDetail'));
  } catch(e){
    if(detailEl){
      detailEl.innerHTML=`<div style="font-size:12px;color:var(--slate)">상세 정보를 불러올 수 없어요.</div>`;
      const retryBtn = document.createElement('button');
      retryBtn.textContent='↻ 다시 시도';
      retryBtn.style.cssText='margin-top:6px;font-size:11px;padding:3px 10px;border:1px solid var(--line);background:none;cursor:pointer;border-radius:3px;color:var(--sage)';
      retryBtn.onclick=()=>loadEvDetail(ev, id);
      detailEl.appendChild(retryBtn);
    }
  }
}

function renderEvDetail(d, el){
  const resClass = d.reservation==='불필요'?'ok': d.reservation==='사전등록 권장'?'warn':'req';
  const resIcon = d.reservation==='불필요'?'✓': d.reservation==='사전등록 권장'?'⚠':'🎫';
  el.innerHTML=`
    <div class="ev-section">
      <div class="ev-section-label">상세 정보</div>
      <div class="ev-section-body">${d.detail||''}</div>
    </div>
    <div class="ev-section">
      <div class="ev-section-label">사전예약</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="ev-badge ${resClass}">${resIcon} ${d.reservation}</div>
        ${d.bookingUrl&&d.reservation!=='불필요'?`<a href="${d.bookingUrl}" target="_blank" rel="noopener" class="ev-booking-link">🔗 예약하기 ↗</a>`:''}
      </div>
      ${d.reservationNote?`<div style="font-size:11.5px;color:var(--slate);margin-top:5px">${d.reservationNote}</div>`:''}
    </div>
    <div class="ev-section">
      <div class="ev-section-label">준비물</div>
      <div class="ev-items-list">
        ${(d.items||[]).map(it=>`<span class="ev-chip">${it}</span>`).join('')||'<span style="font-size:12px;color:var(--slate)">특별한 준비물 없음</span>'}
      </div>
    </div>
    <div class="ev-section">
      <div class="ev-section-label">소요시간 · 팁</div>
      <div class="ev-section-body">⏱ ${d.duration||'미정'}<br><span style="opacity:.8">💡 ${d.tips||''}</span></div>
    </div>`;
}

function renderFest(){
  const el = document.getElementById('scroll');
  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'fest-wrap';
  wrap.style.cssText = 'display:flex;flex-direction:column;height:100%';

  // ── 상단: 새로고침 버튼
  const topBar = document.createElement('div');
  topBar.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:7px 14px;border-bottom:1px solid var(--line);background:rgba(93,116,86,.06)';
  topBar.innerHTML=`<span style="font-size:11px;color:var(--slate)">3DoD 공식 프로그램 · ${FESTIVAL_EVENTS.length}개 로드됨</span>
    <button id="festRefreshBtn" style="font-size:10px;font-family:Space Mono,monospace;padding:3px 8px;border:1px solid var(--line);background:none;cursor:pointer;color:var(--sage)">↻ 새로고침</button>`;
  wrap.appendChild(topBar);

  topBar.querySelector('#festRefreshBtn').onclick = async()=>{
    const btn = topBar.querySelector('#festRefreshBtn');
    btn.textContent='불러오는 중...'; btn.disabled=true;
    try{
      const r = await fetch('/api/events');
      const data = await r.json();
      if(data.source==='live' && data.events?.length>0){
        const newCount = data.events.filter(e=>!FESTIVAL_EVENTS.some(f=>f.title===e.title)).length;
        topBar.querySelector('span').textContent = newCount>0
          ? `✦ 신규 ${newCount}개 이벤트 발견! 공식 사이트에서 확인하세요.`
          : `최신 상태 · ${data.events.length}개 이벤트`;
        topBar.querySelector('span').style.color = newCount>0 ? 'var(--rust)' : 'var(--sage)';
      } else {
        topBar.querySelector('span').textContent = '현재 하드코딩 데이터가 최신 상태입니다';
      }
    }catch(e){ topBar.querySelector('span').textContent = '새로고침 실패 — 나중에 다시 시도해주세요'; }
    finally{ btn.textContent='↻ 새로고침'; btn.disabled=false; }
  };

  // ── 행 1: 날짜 + 즐겨찾기
  const row1 = document.createElement('div');
  row1.className = 'fest-filters';

  ['June 10','June 11','June 12'].forEach(d=>{
    const b = document.createElement('button');
    b.className = 'fest-filter-btn' + (festDateFilter===d?' active':'');
    b.textContent = d.replace('June ','6/');
    b.onclick = ()=>{ festDateFilter=d; renderFest(); };
    row1.appendChild(b);
  });

  const favBtn = document.createElement('button');
  favBtn.className = 'fest-filter-btn' + (festFavFilter?' fav-active':'');
  favBtn.innerHTML = (festFavFilter ? '♥' : '♡') + ' 즐겨찾기';
  favBtn.onclick = ()=>{ festFavFilter=!festFavFilter; renderFest(); };
  row1.appendChild(favBtn);

  // 날짜+즐겨찾기 상태 요약 (활성 필터 있으면 리셋 버튼)
  if(festDateFilter||festFavFilter){
    const rst = document.createElement('button');
    rst.style.cssText='font-family:Space Mono,monospace;font-size:9px;padding:2px 7px;border:1px solid var(--line);background:none;cursor:pointer;color:var(--slate);border-radius:2px;flex-shrink:0;margin-left:auto';
    rst.textContent='초기화';
    rst.onclick=()=>{festDateFilter='';festCatFilter='all';festDistFilter='all';festFavFilter=false;renderFest();};
    row1.appendChild(rst);
  }

  // ── 행 2: 카테고리
  const row2 = document.createElement('div');
  row2.className = 'fest-filters';
  FEST_CATEGORIES.forEach(cat=>{
    const b = document.createElement('button');
    const isActive = festCatFilter===cat.key;
    b.className = 'fest-filter-btn cat-btn' + (isActive?' active':'');
    b.textContent = cat.key==='all' ? cat.label : `${cat.icon} ${cat.label}`;
    if(cat.key!=='all') b.style.cssText=`border-color:${cat.color};${isActive?`background:${cat.color};color:#fff`:`color:${cat.color}`}`;
    b.onclick = ()=>{ festCatFilter=cat.key; renderFest(); };
    row2.appendChild(b);
  });

  // ── 행 3: 지구
  const row3 = document.createElement('div');
  row3.className = 'fest-filters';
  const distNames = ['all',...DISTRICTS.map(d=>d.name)];
  distNames.forEach(d=>{
    const b = document.createElement('button');
    const c = districtColor(d);
    b.className = 'fest-filter-btn dist-btn' + (festDistFilter===d?' active':'');
    b.textContent = d==='all'?'전체':d;
    if(d!=='all') b.style.cssText=`border-color:${c};${festDistFilter===d?'':'color:'+c}`;
    b.onclick = ()=>{ festDistFilter=d; renderFest(); };
    row3.appendChild(b);
  });

  // ── 검색창
  const searchWrap = document.createElement('div');
  searchWrap.className = 'fest-search-wrap';
  searchWrap.innerHTML = `<input class="fest-search-input" id="festSearchInput" type="text" placeholder="행사·장소 검색..." value="${festSearchQuery.replace(/"/g,'&quot;')}">`;
  wrap.appendChild(searchWrap);
  wrap.appendChild(row1);
  wrap.appendChild(row2);
  wrap.appendChild(row3);

  // ── 이벤트 목록 컨테이너 (renderFestList로 채움)
  const list = document.createElement('div');
  list.className = 'fest-list';
  list.id = 'festList';

  wrap.appendChild(list);

  // 하단 추가 바
  const bar = document.createElement('div');
  bar.className = 'fest-add-bar';
  bar.id = 'festBar';
  const cnt = document.createElement('span');
  cnt.className = 'fest-count';
  cnt.id = 'festCount';
  const btn = document.createElement('button');
  btn.className = 'fest-add-btn';
  btn.id = 'festAddBtn';
  btn.onclick = addFestSelected;
  bar.appendChild(cnt);
  bar.appendChild(btn);
  wrap.appendChild(bar);

  el.appendChild(wrap);
  el.style.overflow = 'hidden';
  el.style.padding = '0';

  // 검색 리스너 (DOM 삽입 후)
  const searchEl = document.getElementById('festSearchInput');
  if(searchEl){
    let searchTimer;
    searchEl.addEventListener('input', e=>{
      festSearchQuery = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderFestList, 200);
    });
    // Escape → 검색 초기화
    searchEl.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ festSearchQuery=''; searchEl.value=''; renderFestList(); }
    });
  }

  updateFestBar();
  renderFestList(); // 리스트 최초 렌더
}

/* 행사 리스트만 재렌더 (검색/필터 변경 시) */
function renderFestList(){
  const list = document.getElementById('festList');
  if(!list) return;
  list.innerHTML = '';

  const q = festSearchQuery.toLowerCase().trim();
  const filtered = FESTIVAL_EVENTS.filter(e=>{
    if(e.date !== festDateFilter) return false;
    if(festCatFilter!=='all'){
      // brunch = lunch + afternoon 통합 필터
      if(festCatFilter==='brunch'){
        if(e.category!=='lunch' && e.category!=='afternoon') return false;
      } else {
        if(e.category!==festCatFilter) return false;
      }
    }
    if(festDistFilter!=='all' && e.district!==festDistFilter) return false;
    if(festFavFilter && !favorites.has(`fest-${e.date}-${e.title}`)) return false;
    if(q && !e.title.toLowerCase().includes(q) &&
           !e.venue.toLowerCase().includes(q) &&
           !(e.desc||'').toLowerCase().includes(q)) return false;
    return true;
  });

  if(filtered.length===0){
    list.innerHTML=`<div style="padding:24px;text-align:center;color:var(--slate);font-size:13px">${
      q?`"${festSearchQuery}" 검색 결과가 없습니다`:'해당 날짜/지구에 등록된 행사가 없습니다'
    }</div>`;
    return;
  }

  filtered.forEach((ev)=>{
    const id = `fest-${ev.date}-${ev.title}`;
    const isChecked = festChecked.has(id);
    const row = document.createElement('div');
    row.className = 'fest-event' + (isChecked?' checked':'');
    const dkColor = districtColor(ev.district);
    // lunch/afternoon → brunch로 통합 표시
    const catKey = (ev.category==='lunch'||ev.category==='afternoon') ? 'brunch' : ev.category;
    const catInfo = FEST_CATEGORIES.find(c=>c.key===catKey)||FEST_CATEGORIES[0];
    const isFav = favorites.has(id);
    row.innerHTML = `
      <input type="checkbox" class="fest-cb" ${isChecked?'checked':''}>
      <div class="fest-body">
        <div class="fest-title fest-title-link">${ev.title}</div>
        <div class="fest-meta">
          <span class="fest-time">${ev.time}</span>
          <span class="fest-venue">${ev.venue}</span>
          <span class="fest-cat-badge" style="background:${catInfo.color}">${catInfo.icon} ${catInfo.label}</span>
          <span class="fest-dk" style="background:${dkColor}">${ev.district}</span>
        </div>
        <div class="fest-desc">${ev.desc}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:center;flex-shrink:0">
        <button class="fav-btn" title="즐겨찾기">${isFav?'♥':'♡'}</button>
        <a href="${gMapsUrl((ev.venue||ev.title)+' '+(ev.address||'Copenhagen'))}" target="_blank" title="Google Maps로 열기" style="font-size:12px;text-decoration:none;opacity:.5" onclick="event.stopPropagation()">📍</a>
      </div>`;
    const cb = row.querySelector('.fest-cb');
    const titleEl = row.querySelector('.fest-title-link');
    cb.onchange = ()=>{
      if(cb.checked){ festChecked.add(id); showFestMarker(ev, id); }
      else { festChecked.delete(id); hideFestMarker(id); }
      row.classList.toggle('checked', cb.checked);
      updateFestBar();
    };
    if(isChecked) showFestMarker(ev, id);
    row.querySelector('.fav-btn').addEventListener('click', e=>{
      e.stopPropagation();
      if(favorites.has(id)){ favorites.delete(id); row.querySelector('.fav-btn').textContent='♡'; }
      else { favorites.add(id); row.querySelector('.fav-btn').textContent='♥'; }
      saveFavs();
    });
    titleEl.addEventListener('click', e=>{ e.stopPropagation(); openEvModal(ev, id); });
    row.addEventListener('click', e=>{
      if(e.target===cb || e.target===titleEl) return;
      cb.checked=!cb.checked; cb.onchange();
    });
    list.appendChild(row);
  });
}

function updateFestBar(){
  const cnt = document.getElementById('festCount');
  const btn = document.getElementById('festAddBtn');
  if(!cnt||!btn) return;
  const n = festChecked.size;
  cnt.textContent = n>0 ? `${n}개 선택됨` : '';
  btn.textContent = n>0 ? `일정에 추가 →` : '행사를 선택하세요';
  btn.disabled = n===0;
}

async function addFestSelected(){
  const toAdd = [];
  FESTIVAL_EVENTS.forEach((ev)=>{
    const id = `fest-${ev.date}-${ev.title}`;
    if(festChecked.has(id)) toAdd.push(ev);
  });

  const hoursWarnings = [];
  let addedCount = 0;
  let firstDi = null;
  const skippedTitles = [];

  toAdd.forEach(ev=>{
    const di = FEST_DATE_MAP[ev.date];
    if(di==null) return;
    if(plan[di].items.some(it=>it.title===ev.title)){
      skippedTitles.push(ev.title.slice(0,16));
      return;
    }
    const newIt = {
      time: ev.time.split('-')[0],
      title: ev.title,
      note: `${ev.venue} · ${ev.address} · ${ev.desc}`,
      dist: ev.district,
      _user: true, _addedBy: currentUser,
      _personal: false, _with: ['miju','sanghyo'],
    };
    plan[di].items.push(newIt);
    sortDayByTime(di);
    addedCount++;
    if(firstDi===null) firstDi=di;
    const w = getVenueWarning(newIt, di);
    if(w) hoursWarnings.push(`⚠ ${ev.title.slice(0,20)}: ${w.msg}`);
  });

  if(hoursWarnings.length) showHoursToast(hoursWarnings);

  await savePlan();
  festChecked.clear();
  clearFestMarkers();

  if(addedCount===0 && skippedTitles.length>0){
    // 전부 중복 — 이미 있다고 알려주고 탭 이동
    const btn=document.getElementById('festAddBtn');
    if(btn){ btn.textContent='이미 일정에 있어요'; btn.disabled=true; }
    setTimeout(()=>{ setTab('plan'); },800);
    return;
  }

  // 성공 — 일정 탭으로 이동 후 해당 날짜 스크롤
  setTab('plan');
  if(firstDi!==null){
    requestAnimationFrame(()=>{
      const dayEl=document.getElementById(`body-${firstDi}`)?.closest('.day');
      if(dayEl) dayEl.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  // 추가 완료 토스트
  const msg = skippedTitles.length
    ? `✓ ${addedCount}개 추가 · ${skippedTitles.length}개는 이미 있음`
    : `✓ ${addedCount}개 일정에 추가됐어요`;
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2e6b2e;color:#fff;padding:10px 18px;border-radius:6px;font-size:12px;font-family:Space Mono,monospace;z-index:9999;pointer-events:none';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}

/* ---------- RENDER: PLAN ---------- */
let currentVisDay = 0;
function renderPlan(){
  const el = document.getElementById('scroll');
  el.innerHTML = '';
  if(selRouteLayer){ map.removeLayer(selRouteLayer); selRouteLayer=null; }

  // 날씨 비동기 로드 → 렌더 후 삽입
  fetchWeather().then(wmap=>{
    if(!wmap) return;
    document.querySelectorAll('.day-weather-slot').forEach(slot=>{
      const di = +slot.dataset.di;
      const w = wmap[di];
      if(!w) return;
      slot.innerHTML=`<span class="day-weather-icon">${w.icon}</span><span class="day-weather-temp">${w.max}°/${w.min}°</span>`;
      slot.title=`${w.label}${w.rain>0?' · 강수 '+w.rain+'mm':''}`;
    });
  });

  plan.forEach((day,di)=>{
    const d = document.createElement('div'); d.className='day';
    const hasItems = day.items.length > 0;
    d.innerHTML = `
      <div class="day-head">
        <span class="day-num ${day.fest?'fest':''}">${day.fest?'FEST':'DAY'} ${di}</span>
        <span class="day-date">${day.date}</span>
        <span class="day-weather day-weather-slot" data-di="${di}"></span>
        <span class="day-tag">${day.tag}</span>
        ${hasItems?`<button class="reschedule-btn" id="reschedule-btn-${di}" onclick="triggerReschedule(${di});event.stopPropagation()" title="AI가 이 날 일정을 분석하고 최적화를 제안합니다">✦ 재조율</button>`:''}
      </div>
      <div class="day-progress"><div class="day-progress-bar" id="prog-${di}" style="width:0%"></div></div>
      <div class="day-body" id="body-${di}" data-di="${di}"></div>
      <div class="reschedule-slot" id="reschedule-slot-${di}"></div>`;
    el.appendChild(d);
    const body = d.querySelector(`#body-${di}`);

    day.items.forEach((it,ii)=>{
      // 다른 사람의 개인 일정 숨김
      if(it._personal && it._addedBy && it._addedBy !== currentUser) return;

      const coords = getItemCoords(it);
      const row = document.createElement('div');
      row.className='item'+(it._user?' user-added':'')+(it._fixed?' fixed':'');
      row.dataset.di=di; row.dataset.ii=ii;
      if(coords) row.style.cursor='pointer';
      if(selectedPlanKey===`${di}-${ii}`) row.classList.add('sel-active');

      // 사용자 태그 생성
      const tags=[];
      if(it._addedBy) tags.push(`<span class="item-tag by-${it._addedBy}">${USER_LABELS[it._addedBy]}</span>`);
      if(it._personal) tags.push(`<span class="item-tag personal">🔒 나만</span>`);
      else if(it._with?.length===1) tags.push(`<span class="item-tag with-only">${USER_LABELS[it._with[0]]}만</span>`);
      const tagsHtml = tags.length?`<div class="item-tags">${tags.join('')}</div>`:'';
      const vWarn = getVenueWarning(it, di);
      const warnHtml = vWarn ? `<span class="item-hours-warn ${vWarn.type}" title="${vWarn.msg}">${vWarn.type==='closed'?'🔴 휴관':'⚠ '+vWarn.msg}</span>` : '';

      const gmapHref = it._gmapsUrl || gMapsUrlForItem(it);
      const gmapIcon = it._gmapsUrl ? '🔗' : (it.title&&it.title.includes('→')?'🧭':'📍');

      row.innerHTML = `
        ${it._fixed?'':`<span class="drag-handle" title="드래그로 순서 변경">⠿</span>`}
        <input type="checkbox" class="item-sel-cb" ${selectedPlanKey===`${di}-${ii}`?'checked':''} title="지도에서 선택/해제">
        <div class="item-time${it._fixed?'':' item-time-edit'}" ${it._fixed?'':'contenteditable spellcheck="false" data-placeholder="시간"'} title="${it._fixed?'':'클릭하여 시간 편집 (예: 14:30)'}">${it.time||''}</div>
        <div class="item-main">
          <div class="item-title" contenteditable spellcheck="false">${it.title||''}</div>
          <div class="item-note" contenteditable spellcheck="false">${it.note||''}</div>
          ${it.dist?`<span class="item-dist">${it.dist}</span>`:''}
          ${it._runningCourse&&it.gmaps?`<a href="${it.gmaps}" target="_blank" rel="noopener" class="item-src run-route-link" onclick="event.stopPropagation()" style="color:var(--teal);text-decoration:none">🗺 Google Maps 경로</a>`:''}
          ${it._user?`<span class="item-src">＋ 내가 추가</span>`:''}
          ${it._fixed?`<span class="item-src lock">🔒 예약 확정 · 고정</span>`:''}
          ${tagsHtml}${warnHtml}
        </div>
        <a class="item-gmap" href="${gmapHref}" target="_blank" title="Google Maps로 열기" onclick="event.stopPropagation()">${gmapIcon}</a>
        <button class="item-x" title="${it._fixed?'고정 일정':'삭제'}" ${it._fixed?'disabled':''}>${it._fixed?'🔒':'×'}</button>`;

      // 선택 체크박스 (지도 경로 연동)
      const selCb = row.querySelector('.item-sel-cb');
      selCb.addEventListener('change', e=>{
        e.stopPropagation();
        const key = `${di}-${ii}`;
        if(selCb.checked){
          // 이전 선택 해제
          if(selectedPlanKey && selectedPlanKey!==key){
            const [pdi,pii]=selectedPlanKey.split('-').map(Number);
            const prevRow=document.querySelector(`.item[data-di="${pdi}"][data-ii="${pii}"]`);
            if(prevRow){prevRow.querySelector('.item-sel-cb').checked=false;prevRow.classList.remove('sel-active');}
          }
          selectedPlanKey=key; row.classList.add('sel-active'); showItemRoute(di,ii);
        } else {
          selectedPlanKey=null; row.classList.remove('sel-active');
          if(selRouteLayer){map.removeLayer(selRouteLayer);selRouteLayer=null;}
        }
      });

      const t=row.querySelector('.item-title'), n=row.querySelector('.item-note');
      t.addEventListener('input',()=>{plan[di].items[ii].title=t.textContent;savePlan()});
      t.addEventListener('blur',()=>{
        // 좌표 없는 항목: 제목 편집 완료 후 자동 지오코딩
        if(!plan[di].items[ii]._lat && t.textContent.trim().length>2)
          geocodePlanItem(plan[di].items[ii], di);
      });
      n.addEventListener('input',()=>{plan[di].items[ii].note=n.textContent;savePlan()});

      // 시간 필드 인라인 편집
      if(!it._fixed){
        const tm=row.querySelector('.item-time-edit');
        if(tm){
          tm.addEventListener('focus',()=>{ if(!tm.textContent.trim()) tm.textContent=''; });
          tm.addEventListener('blur',()=>{
            let v=tm.textContent.trim();
            // HH:MM 자동 포맷
            const m=v.match(/^(\d{1,2})[:\.]?(\d{2})$/);
            if(m) v=m[1].padStart(2,'0')+':'+m[2];
            plan[di].items[ii].time=v;
            tm.textContent=v;
            savePlan();
          });
          tm.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();tm.blur();} });
        }
      }

      const xb=row.querySelector('.item-x');
      if(!it._fixed) xb.addEventListener('click',e=>{
        e.stopPropagation();
        plan[di].items.splice(ii,1);savePlan();renderPlan();
      });

      // 행 클릭 → 선택/해제 토글 + 드로어 열기
      row.addEventListener('click', e=>{
        if(e.target.matches('[contenteditable],[contenteditable] *,.item-x,.item-sel-cb,.item-gmap')) return;
        const key = `${di}-${ii}`;
        if(selectedPlanKey===key){
          // 같은 항목 재클릭 → 선택 해제
          selectedPlanKey=null; selCb.checked=false; row.classList.remove('sel-active');
          if(selRouteLayer){map.removeLayer(selRouteLayer);selRouteLayer=null;}
        } else {
          // 새 항목 선택
          if(selectedPlanKey){
            const [pdi,pii]=selectedPlanKey.split('-').map(Number);
            const prevRow=document.querySelector(`.item[data-di="${pdi}"][data-ii="${pii}"]`);
            if(prevRow){prevRow.querySelector('.item-sel-cb').checked=false;prevRow.classList.remove('sel-active');}
          }
          selectedPlanKey=key; selCb.checked=true; row.classList.add('sel-active'); showItemRoute(di,ii);
        }
        openDrawer(di, ii, it.title);
      });

      body.appendChild(row);

      // 연속 항목 간 이동수단 + 거리 표시
      const nextIt = day.items[ii+1];
      if(nextIt){
        const cA = getItemCoords(it), cB = getItemCoords(nextIt);
        if(cA && cB){
          const t = transportBetween(cA, cB);
          const walk = document.createElement('div');
          walk.className='item-walk';
          walk.innerHTML=`<span class="item-walk-icon">${t.icon}</span><span class="item-walk-label">${t.label}</span> ~${t.mins}분 · ${t.km.toFixed(1)}km`;
          body.appendChild(walk);
        }
      }
    });

    // 빈 시간 추천 섹션
    renderDayGap(di, body);

    const add=document.createElement('button'); add.className='add-item'; add.textContent='+ 일정 추가';
    add.addEventListener('click',()=>{
      // 이전 항목 기준 이동 정보 자동 생성
      let autoNote = '';
      const dayItems = plan[di].items;
      if(dayItems.length > 0){
        // 마지막 좌표 있는 항목 탐색
        let prevIt = null;
        for(let i=dayItems.length-1;i>=0;i--){ if(getItemCoords(dayItems[i])){ prevIt=dayItems[i]; break; } }
        if(prevIt){
          const prevCoords = getItemCoords(prevIt);
          // 숙소 좌표를 기본 목적지로 제안
          const stay = {lat:55.6671, lng:12.5519};
          const t = transportBetween(prevCoords, stay);
          autoNote = `← ${prevIt.title}에서 ${t.icon} ${t.label} ~${t.mins}분`;
        }
      }
      plan[di].items.push({time:'',title:'새 일정',note:'',dist:'',_addedBy:currentUser,_user:true,_personal:false,_with:['miju','sanghyo']});
      savePlan();
      renderPlan();
      // 새로 추가된 항목의 시간 필드에 포커스
      const newIdx = plan[di].items.length - 1;
      setTimeout(()=>{
        const body=document.getElementById(`body-${di}`);
        if(!body) return;
        const rows=[...body.querySelectorAll('.item')];
        const newRow=rows[newIdx];
        if(newRow){
          const timeFld=newRow.querySelector('.item-time-edit');
          if(timeFld){ timeFld.focus(); selectAll(timeFld); }
        }
      },80);
    });
    body.appendChild(add);

    // 드래그&드롭 — 날짜 간 이동 + 순서 변경
    Sortable.create(body,{
      group:{name:'days',pull:true,put:true},
      animation:150,
      handle:'.drag-handle',
      filter:'.item-walk,.day-gap-section,.add-item',
      ghostClass:'sortable-ghost',
      chosenClass:'sortable-chosen',
      dragClass:'sortable-drag',
      delay:150,
      delayOnTouchOnly:true,
      touchStartThreshold:4,
      onEnd:(evt)=>{
        const fromDi=+evt.item.dataset.di;
        const fromIdx=+evt.item.dataset.ii;
        const toDi=+evt.to.dataset.di;
        const siblings=[...evt.to.querySelectorAll(':scope > .item')];
        const toIdx=siblings.indexOf(evt.item);
        if(toIdx<0||(fromDi===toDi&&fromIdx===toIdx)) return;
        const planItem=plan[fromDi].items.splice(fromIdx,1)[0];
        plan[toDi].items.splice(toIdx,0,planItem);
        savePlan();
        renderPlan();
        // 시간 순서 검증 → 경고 토스트
        checkDragOrder(toDi, planItem);
      }
    });
  });

  // 경과 시간 기반 음영 + 진행률 바 초기화
  updatePastItems();
  // 충돌 경고 배너
  renderConflictBanner(el);
  // 첫 렌더 시: 핀만 표시 (연결선은 명시적 선택 시에만)
  if(routeLayer){ map.removeLayer(routeLayer); routeLayer=null; }
  renderPlanMarkers(currentVisDay);

  // 스크롤로 날짜 바뀌면 핀만 업데이트 (연결선 자동 생성 없음)
  el.onscroll = ()=>{
    const days = el.querySelectorAll('.day');
    for(let i=0;i<days.length;i++){
      const rect=days[i].getBoundingClientRect(), pRect=el.getBoundingClientRect();
      if(rect.bottom>pRect.top+10){
        if(i!==currentVisDay){
          currentVisDay=i;
          if(routeLayer){ map.removeLayer(routeLayer); routeLayer=null; }
          renderPlanMarkers(i);
        }
        break;
      }
    }
  };
}

/* ---------- RECOMMEND DATA ---------- */
// 날짜인덱스: 0=6/8, 1=6/9, 2=6/10, 3=6/11, 4=6/12, 5=6/13, 6=6/14, 7=6/15, 8=6/16
const RECOMMEND = [
  { dayIdx:1, label:'DAY 1', date:'6/9 (화)', tag:'도착일', fest:false,
    theme:'긴 이동 후 가볍게 — 설치미술 & 뉘하운',
    items:[
      {time:'09:00', title:'시차 극복 산책 — Istedgade 카페', note:'베스테르브로 로컬 카페에서 커피 한 잔, 동네 분위기 파악', tag:'☕ 다이닝', color:'#7a4a1e'},
      {time:'10:30', title:'Torvehallerne 마켓', note:'코펜하겐 최대 푸드마켓 — 스모레브레드, 신선 식재료 둘러보기', tag:'☕ 다이닝', color:'#7a4a1e', _lat:55.6836, _lng:12.5713},
      {time:'13:00', title:'Nørreport 인근 산책', note:'빌라 주거지구 골목 워킹 — 코펜하겐 일상 풍경', tag:'🚶 투어', color:'#3a4a5a'},
      {time:'14:30', title:'Magnus Olesen 쇼룸', note:'Frederiksgade 7 — 덴마크 가구 브랜드 쇼룸 · 디자인뮤지엄 바로 인근', tag:'🏛 전시', color:'#6d3b54', _lat:55.6848, _lng:12.5882},
      {time:'15:30', title:'KLASSIK Moderne Møbelkunst', note:'Bredgade 3 — 빈티지 덴마크 가구 편집샵 · Finn Juhl·Wegner·Jacobsen 원본 작품', tag:'🏛 전시', color:'#6d3b54', _lat:55.6836, _lng:12.5870},
      {time:'17:30', title:'뉘하운(Nyhavn) 운하 산책', note:'컬러풀 건물과 운하 — 저녁 조명이 아름다운 코펜하겐 상징', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6797, _lng:12.5913},
      {time:'19:30', title:'저녁식사 — Nyhavn 인근', note:'운하변 비스트로 · 내일 페스티벌을 위해 일찍 귀숙', tag:'☕ 다이닝', color:'#7a4a1e'},
    ]
  },
  { dayIdx:2, label:'DAY 2', date:'6/10 (수)', tag:'페스티벌 1일차', fest:true,
    theme:'Frederiksstaden + Kongens Nytorv — 왕실지구 & 도심 핵심',
    items:[
      {time:'09:00', title:'Designers Panel: Art & Design (Paper Collective)', note:'Bredgade 71 — 아트와 디자인 통합 시각 패널 토크', tag:'💬 토크', color:'#2f6b6b', _lat:55.6840, _lng:12.5890},
      {time:'09:30', title:'Exclusive Talk: Norm Architects (Søuld)', note:'Esplanaden 8b — 소재와 형태에 관한 심층 대화', tag:'💬 토크', color:'#2f6b6b', _lat:55.6848, _lng:12.5912},
      {time:'10:30', title:'Designmuseum Danmark — Vibskov Pavilion 오프닝', note:'Bredgade 68 — Søren Vibskov 파빌리온 & 상설 컬렉션', tag:'🏛 전시', color:'#6d3b54', _lat:55.6866, _lng:12.5928},
      {time:'12:00', title:'점심 — Kongens Nytorv 인근 카페', note:'광장 주변 로컬 런치 · 에너지 보충 후 오후 쇼룸 집중 방문', tag:'☕ 다이닝', color:'#7a4a1e'},
      {time:'13:00', title:'Fritz Hansen Listening Lounge', note:'Løvstræde 5 — 오디오+디자인 종일 체험 공간 · 아이코닉 가구 감상', tag:'🏛 전시', color:'#6d3b54', _lat:55.6795, _lng:12.5773},
      {time:'14:00', title:'Georg Jensen — Playdate', note:'Amagertorv 4 — 테이블웨어·주얼리 인터랙티브 체험', tag:'🏛 전시', color:'#6d3b54', _lat:55.6789, _lng:12.5800},
      {time:'14:30', title:'Hay House 플래그십', note:'Pilestræde — 덴마크 대표 디자인 브랜드 플래그십 스토어', tag:'🏛 전시', color:'#6d3b54', _lat:55.6794, _lng:12.5797},
      {time:'11:30', title:'Alvar Aalto 90 Pavilion — iittala', note:'Ofelia Plads, Kvæsthusbroen — 아알토 90주년 파빌리온 · 뉘하운 인근 · 매일 06:00–22:30', tag:'🏛 전시', color:'#6d3b54', _lat:55.6815, _lng:12.5930},
      {time:'13:00', title:'Ingo Maurer — Alice Folker Gallery', note:'Esplanaden 14 — 조명 거장 잉고 마우러 전시 · Frederiksstaden 갤러리', tag:'🏛 전시', color:'#6d3b54', _lat:55.6870, _lng:12.5924},
      {time:'13:30', title:'Wendelbo 쇼룸 & 파티', note:'Bredgade 65 — 10:00–18:00 전시 · 17:00–22:00 오프닝 파티 · Frederiksstaden', tag:'🏛 전시', color:'#6d3b54', _lat:55.6852, _lng:12.5920},
      {time:'14:30', title:'MOEBE 전시', note:'Valkendorfsgade 13B — 미니멀 덴마크 가구 브랜드 · 화–금 11:00–17:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6787, _lng:12.5771},
      {time:'15:30', title:'Illums Bolighus', note:'Amagertorv 10 — 북유럽 디자인 백화점 · 기념품 리스트업', tag:'🏛 전시', color:'#6d3b54', _lat:55.6789, _lng:12.5800},
      {time:'16:00', title:'베스테르브로 복귀 이동', note:'메트로/도보 · 17시 SALU 다이닝 준비', tag:'🚶 투어', color:'#3a4a5a'},
    ]
  },
  { dayIdx:3, label:'DAY 3', date:'6/11 (목)', tag:'페스티벌 2일차', fest:true,
    theme:'Nordhavn + Islands Brygge — 항구재생 & 하버프론트',
    items:[
      {time:'08:00', title:'Guided Breathwork at the Harbour (Rockfon)', note:'Sundkaj 163 — 항구 아침 호흡 명상 · 상쾌하게 하루 시작', tag:'🧘 웰니스', color:'#9c3318', _lat:55.7126, _lng:12.5927},
      {time:'09:00', title:'Morning Design Talks: OEO Studio (Time & Style)', note:'Orientkaj 22 — 현대 인테리어 스튜디오 OEO 작업 소개', tag:'💬 토크', color:'#2f6b6b', _lat:55.7120, _lng:12.5940},
      {time:'10:00', title:'GUBI Nordhavn 그랜드 오프닝', note:'Orientkaj 18-20 — 이탈리아×북유럽 디자인의 만남 · 하이라이트', tag:'🏛 전시', color:'#6d3b54', _lat:55.7126, _lng:12.5927},
      {time:'10:30', title:'TIME & STYLE — OEO Studio Talk', note:'Orientkaj 22 — 현대 인테리어 스튜디오 OEO 작업 소개 · 6/9 17시 칵테일파티도 있음', tag:'💬 토크', color:'#2f6b6b', _lat:55.7120, _lng:12.5940},
      {time:'11:00', title:'Japanmade Vol.1', note:'Dampfærgevej 2 — Dezeen 추천 전시 · 일본 디자인 × 북유럽 공간 · 매일 09:00–17:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.7090, _lng:12.5938},
      {time:'11:30', title:'The Power of Daylight (VELUX)', note:'Århusgade 126 — 자연광과 디자인·웰빙의 관계 아티스트 토크', tag:'💬 토크', color:'#2f6b6b', _lat:55.7120, _lng:12.5921},
      {time:'12:30', title:'점심 — FORM BAR at FORMARKIVET', note:'Århusgade 128D — 디자인 마켓플레이스 레스토랑, 인근 쇼룸 둘러보기', tag:'☕ 다이닝', color:'#7a4a1e', _lat:55.7120, _lng:12.5920},
      {time:'13:30', title:'Kvadrat Acoustics & Café', note:'Orient Plads 1, 2층 — Kvadrat & Vitra Café 09–15시 · 화–일 10:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.7085, _lng:12.5900},
      {time:'14:30', title:'The Audo Copenhagen', note:'Århusgade 130 — 컨셉 호텔+스토어 · 13–16시 바 운영 · 카페 매일 08:00–16:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.7095, _lng:12.5903},
      {time:'15:30', title:'Bread and Butter — Sandkaj 30', note:'Sandkaj 30, Nordhavn — Dezeen 추천 · 매일 06:00–22:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.7130, _lng:12.5930},
      {time:'16:30', title:'Islands Brygge 이동 (메트로/자전거)', note:'M4 Orientkaj → Islands Brygge 환승 또는 자전거 20분', tag:'🚶 투어', color:'#3a4a5a'},
      {time:'14:30', title:'PP Møbler 쇼룸', note:'Bryggernes Plads 11 — Hans J. Wegner 가구의 정수 · 장인 정신 감상', tag:'🏛 전시', color:'#6d3b54', _lat:55.6641, _lng:12.5731},
      {time:'15:30', title:'UMAGE — BREAKFAST CLUB 방문', note:'Havnegade 29 — 조명 브랜드 쇼룸 · 스칸디나비안 감성', tag:'🏛 전시', color:'#6d3b54', _lat:55.6741, _lng:12.5797},
      {time:'17:00', title:'Evening Talk: The Future of Scandinavian Design', note:'Nordhavn — 스칸디나비아 디자인 미래를 전망하는 저녁 토크', tag:'💬 토크', color:'#2f6b6b'},
      {time:'저녁', title:'Islands Brygge 하버바스 수영 (선택)', note:'무료 공공 수영장 · 일몰 감상 · 코펜하겐 여름의 하이라이트', tag:'🧘 웰니스', color:'#9c3318', _lat:55.6641, _lng:12.5731},
    ]
  },
  { dayIdx:4, label:'DAY 4', date:'6/12 (금)', tag:'페스티벌 3일차', fest:true,
    theme:'Holmen + Christianshavn — 섬 지구 & 페스티벌 클로징',
    items:[
      {time:'08:30', title:'Final Morning Yoga (HUBBUB, Holmen)', note:'Kanonbådsvej 4A — 페스티벌 마지막 날 아침 요가', tag:'🧘 웰니스', color:'#9c3318', _lat:55.6885, _lng:12.6110},
      {time:'09:15', title:'Design Talk: PH Lamp (Louis Poulsen)', note:'Kuglegårdsvej 19-23 — PH 램프의 역사와 현재 · 필수 토크', tag:'💬 토크', color:'#2f6b6b', _lat:55.6875, _lng:12.6118},
      {time:'10:00', title:'FANZI Pavilion — Slow Writing & Stack', note:'Posten 6 — 캘리그라피 시연 + MOTO의 모듈 디자인 토크 연속 관람', tag:'🏛 전시', color:'#6d3b54', _lat:55.6883, _lng:12.6102},
      {time:'11:00', title:'BAUX 가이드 투어', note:'Papirøen 5 — 어쿠스틱 패널 디자인 혁신 · 건축 자재의 미래', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6888, _lng:12.6098},
      {time:'11:30', title:'Head Outside — XD Outdoor Launch (The Form Follows)', note:'Café Niko, Papirøen 81 — 아웃도어 가구 런칭 이벤트', tag:'🚀 런칭', color:'#d99021', _lat:55.6890, _lng:12.6095},
      {time:'12:30', title:'점심 — Reffen 스트리트푸드', note:'세계 최대 스트리트푸드 마켓 · 다양한 나라 음식 · Holmen 옆', tag:'☕ 다이닝', color:'#7a4a1e', _lat:55.6915, _lng:12.6045},
      {time:'11:30', title:'Material Matters — Ukraine House', note:'Amaliegade 38 (Christianshavn 방향) — Dezeen 추천 · 화–토 12:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6863, _lng:12.5895},
      {time:'12:00', title:'ARPER — Store Strandstræde 21', note:'Store Strandstræde 21 — 이탈리아 가구 브랜드 · 페스티벌 기간 09:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6838, _lng:12.5918},
      {time:'12:30', title:'점심 — Reffen 스트리트푸드', note:'세계 최대 스트리트푸드 마켓 · 다양한 나라 음식 · Holmen 옆', tag:'☕ 다이닝', color:'#7a4a1e', _lat:55.6915, _lng:12.6045},
      {time:'14:00', title:'Fredericia & Santa&Cole', note:'Løvstræde 1 — Dezeen 추천 · 10–18시 Santa&Cole 예약 가능 · 페스티벌 기간 09:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6793, _lng:12.5775},
      {time:'14:30', title:'Sell Out — Maria\'s Kiosk', note:'Indre By — Dezeen 추천 전시 · 매일 07:00–20:00', tag:'🏛 전시', color:'#6d3b54'},
      {time:'15:00', title:'Other Circle — The Lab (Refshaleøen)', note:'Refshaleøen — Dezeen 추천 · 월–금 08:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6905, _lng:12.6157},
      {time:'15:30', title:'Christianshavn 이동 — Ege Carpets', note:'Christianshavns Kanal 4 — 운하변 카펫 브랜드', tag:'🏛 전시', color:'#6d3b54', _lat:55.6737, _lng:12.5892},
      {time:'16:30', title:'House of Finn Juhl × Edition — Artistry of Craftsmanship', note:'Strandgade 66 — 핀 율 가구 장인 정신 전시 · 페스티벌 최고 하이라이트', tag:'🏛 전시', color:'#6d3b54', _lat:55.6732, _lng:12.5888},
      {time:'18:00', title:'Closing Symposium: Make This Moment Matter', note:'페스티벌 클로징 심포지엄 · 참가 가능 시 참석 권장', tag:'💬 토크', color:'#2f6b6b'},
      {time:'저녁', title:'페스티벌 클로징 파티 & 기념 디너', note:'참가 브랜드들의 클로징 이벤트 탐방 · 페스티벌 마지막 밤', tag:'☕ 다이닝', color:'#7a4a1e'},
    ]
  },
  { dayIdx:5, label:'DAY 5', date:'6/13 (토)', tag:'북쪽 해안선 — 아르네 야콥센 비치 & Louisiana', fest:false,
    theme:'Kystbanen 기차로 — 벨뷰 해변 → Louisiana 미술관 연계',
    items:[
      {time:'10:00', title:'코펜하겐 중앙역 → Klampenborg 출발', note:'Kystbanen 기차 · 약 20분 · Klampenborg 역 하차', tag:'🚶 투어', color:'#3a4a5a'},
      {time:'10:30', title:'벨뷰 해변 — 아르네 야콥센 비치', note:'Bellevue Strand, Klampenborg — 야콥센이 설계한 라이프가드 타워 · 북유럽 모더니즘 해변', tag:'🚶 투어', color:'#3a4a5a', _lat:55.7766, _lng:12.5780},
      {time:'12:00', title:'Klampenborg → Humlebæk 이동', note:'기차로 15분 추가 이동 · 해안선 경치', tag:'🚶 투어', color:'#3a4a5a'},
      {time:'12:30', title:'Louisiana 현대미술관 도착', note:'GL Strandvej 13, Humlebæk — 해안절벽 위 건축 · 북유럽 최고 미술관 · 토-일 11:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.9695, _lng:12.5430},
      {time:'13:00', title:'Louisiana 레스토랑 런치', note:'미술관 내 바다 전망 레스토랑 · 덴마크 오픈 샌드위치 추천', tag:'☕ 다이닝', color:'#7a4a1e'},
      {time:'14:00', title:'Louisiana 관람 — 상설 컬렉션 & 조각공원', note:'Giacometti, Calder, Moore 등 거장 · 야외 조각공원 · 바다 조망 테라스', tag:'🏛 전시', color:'#6d3b54', _lat:55.9695, _lng:12.5430},
      {time:'16:30', title:'코펜하겐 귀환 기차', note:'Humlebæk → 코펜하겐 중앙역 · 약 35분', tag:'🚶 투어', color:'#3a4a5a'},
      {time:'19:00', title:'저녁식사 — 베스테르브로 Kødbyen', note:'고기 지구 레스토랑 탐방 · Nose, Kul 등 추천', tag:'☕ 다이닝', color:'#7a4a1e'},
    ]
  },
  { dayIdx:6, label:'DAY 6', date:'6/14 (일)', tag:'코펜하겐 클래식 & 쇼핑', fest:false,
    theme:'도심 명소 + 기념품 쇼핑 + 뉘하운 마무리',
    items:[
      {time:'10:00', title:'티볼리 가든 (Tivoli Gardens)', note:'코펜하겐 중앙역 바로 옆 · 세계에서 가장 오래된 놀이공원 · 낮 분위기 추천', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6736, _lng:12.5681},
      {time:'12:00', title:'점심 — 중앙역 인근', note:'Riz Raz (채식 뷔페) 또는 Mikkeller 펍', tag:'☕ 다이닝', color:'#7a4a1e'},
      {time:'13:30', title:'Rundetårn (둥근탑) 전망대', note:'Købmagergade 52A — 나선형 램프 등반 · 코펜하겐 전경', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6814, _lng:12.5757},
      {time:'14:30', title:'Strøget 쇼핑가 — 디자인 숍 & 기념품', note:'Hay, Georg Jensen, Royal Copenhagen · A.C. Perchs Thehandel (차 구매)', tag:'🏛 전시', color:'#6d3b54'},
      {time:'16:00', title:'인어공주 동상 & Kastellet 산책', note:'Langelinie — 코펜하겐 상징 · 요새 공원 산책', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6929, _lng:12.5993},
      {time:'18:00', title:'뉘하운(Nyhavn) 저녁 산책', note:'운하변 카페에서 한 잔 · 코펜하겐 마지막 저녁', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6797, _lng:12.5913},
      {time:'19:30', title:'저녁식사 — Nørrebro 로컬 레스토랑', note:'Relæ, Manfreds 등 젊은 감각 레스토랑', tag:'☕ 다이닝', color:'#7a4a1e'},
    ]
  },
  { dayIdx:7, label:'DAY 7', date:'6/15 (월)', tag:'크리스티아니아 & 쇼핑 정리', fest:false,
    theme:'⚠ 월요일 — 박물관 대부분 휴관 · 크리스티아니아 + 마지막 쇼핑',
    items:[
      {time:'10:00', title:'프리타운 크리스티아니아', note:'Christiania, Christianshavn — 자유 공동체 마을 · 그래피티·갤러리·카페 산책 · 매일 24시간', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6729, _lng:12.5946},
      {time:'12:00', title:'점심 — Christianshavn 운하변', note:'크리스티아니아 인근 카페 또는 운하변 레스토랑', tag:'☕ 다이닝', color:'#7a4a1e'},
      {time:'13:30', title:'Henrik Vibskov Boutique', note:'Krystalgade 6, Indre By — 덴마크 아방가르드 패션 · 월–금 11:00–18:00', tag:'🏛 전시', color:'#6d3b54', _lat:55.6806, _lng:12.5725},
      {time:'14:30', title:'A.C. Perchs Thehandel — 차 대용량 구매', note:'Kronprinsensgade 5, Indre By — 1834년 창업 · 덴마크 최고령 차 전문점 · 기념품', tag:'🏛 전시', color:'#6d3b54', _lat:55.6782, _lng:12.5762},
      {time:'15:30', title:'Fritz Hansen 플래그십 & 마지막 쇼핑', note:'Løvstræde 5 — 구매 못한 디자인 아이템 최종 결정', tag:'🏛 전시', color:'#6d3b54', _lat:55.6795, _lng:12.5773},
      {time:'17:00', title:'Nyhavn 마지막 산책 & 기념사진', note:'운하변 카페에서 커피 · 코펜하겐과 작별 인사', tag:'🚶 투어', color:'#3a4a5a', _lat:55.6797, _lng:12.5913},
      {time:'19:00', title:'숙소 복귀 & 짐 정리', note:'내일 체크아웃 준비 · 구매 물품 정리 · 이른 취침 권장', tag:'🚶 투어', color:'#3a4a5a'},
    ]
  },
];

let recChecked = new Set(); // "dayIdx-i" 형태
let recMapPrev = null;  // {lat,lng,title,color,row}
let recMapCurr = null;  // {lat,lng,title,color,row}
let recPreviewLayer = null;
let recPreviewPins = [];

function clearRecPreview(){
  if(recPreviewLayer){ map.removeLayer(recPreviewLayer); recPreviewLayer=null; }
  recPreviewPins.forEach(m=>map.removeLayer(m));
  recPreviewPins=[];
}

function addRecPin(lat, lng, title, color, tag){
  const emoji = (tag||'').match(/\p{Emoji_Presentation}|\p{Emoji}️/u)?.[0] || '📍';
  const icon = L.divIcon({
    className:'',
    html:`<div class="ppv2" style="--ppbg:${color};background:${color};border-color:rgba(155,122,181,.6);box-shadow:0 0 0 2px rgba(155,122,181,.35),0 3px 8px rgba(0,0,0,.3)"><span class="ppv2-num" style="opacity:.75">✦</span><span class="ppv2-ico">${emoji}</span></div>`,
    iconSize:[36,44], iconAnchor:[18,44], popupAnchor:[0,-46]
  });
  const m = L.marker([lat,lng],{icon,zIndexOffset:500}).addTo(map);
  m.bindPopup(`<div class="pop-name">${title}</div><div class="pop-desc" style="color:${color}">✦ 추천 일정 미리보기</div>`);
  recPreviewPins.push(m);
  return m;
}

function renderRecPlaceInfoPanel(place){
  const panel = document.getElementById('recRoutePanel');
  if(!panel) return;
  panel.className='rec-route-panel show info-mode';
  const gmapBtn = place.gmapsUrl
    ? `<a href="${place.gmapsUrl}" target="_blank" class="rec-info-btn" style="text-decoration:none" onclick="event.stopPropagation()">지도 ↗</a>`
    : '';
  const tagHtml = place.tag
    ? `<span class="rec-info-tag" style="background:${place.color||'#888'}">${place.tag}</span>`
    : '';
  panel.innerHTML=`
    <button class="rec-route-clear" onclick="clearRecMapSel()">✕</button>
    <div style="padding-right:20px">${tagHtml}<b>${place.title}</b></div>
    ${place.note ? `<div class="rec-info-note">${place.note}</div>` : ''}
    <div class="rec-info-actions">
      ${gmapBtn}
    </div>
    <div class="rec-info-hint">📍 다른 장소를 클릭하면 이동거리 비교</div>`;
}

function renderRecRoutePanel(prev, curr, transport){
  const panel = document.getElementById('recRoutePanel');
  if(!panel) return;
  const barPct = Math.min(100, Math.round(transport.km/10*100));
  panel.className='rec-route-panel show';
  panel.innerHTML=`
    <button class="rec-route-clear" onclick="clearRecMapSel()">✕</button>
    <div>
      <span style="opacity:.6;font-size:10px">FROM</span> <b>${prev.title}</b>
      <span style="opacity:.4;margin:0 6px">→</span>
      <span style="opacity:.6;font-size:10px">TO</span> <b>${curr.title}</b>
    </div>
    <div class="rec-route-transport">
      <span class="rec-pin-dot" style="background:${prev.color}"></span>
      <span style="font-size:14px">${transport.icon}</span>
      <b style="letter-spacing:.04em">${transport.label}</b>
      <span style="opacity:.6">약 ${transport.mins}분</span>
      <div class="rec-route-bar"><div class="rec-route-bar-fill" style="width:${barPct}%"></div></div>
      <span style="opacity:.6">${transport.km.toFixed(1)}km</span>
      <span class="rec-pin-dot" style="background:${curr.color}"></span>
    </div>`;
}

function clearRecMapSel(){
  clearRecPreview();
  if(recMapPrev?.row) recMapPrev.row.classList.remove('map-prev');
  if(recMapCurr?.row) recMapCurr.row.classList.remove('map-active');
  recMapPrev=null; recMapCurr=null;
  const panel=document.getElementById('recRoutePanel');
  if(panel) panel.className='rec-route-panel';
}

/* ---------- RENDER: RECOMMEND ---------- */
function renderRecommend(){
  const el = document.getElementById('scroll');
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'rec-wrap';

  // 맵 상태 초기화
  clearRecMapSel();

  const intro = document.createElement('div');
  intro.className = 'rec-intro';
  intro.innerHTML = `<h3>✦ 추천 여행 일정</h3><p>항목을 클릭하면 지도에 위치가 표시됩니다. 연속으로 클릭하면 두 장소 간 동선과 이동시간이 비교됩니다.</p>`;
  wrap.appendChild(intro);

  // 동선 비교 패널 (sticky, 클릭 시 채워짐)
  const routePanel = document.createElement('div');
  routePanel.className = 'rec-route-panel';
  routePanel.id = 'recRoutePanel';
  wrap.appendChild(routePanel);

  // ── 가고싶은 곳 위시리스트 섹션 ──
  const wishWithCoords = wishlist.filter(w => w._lat && w._lng);
  // 이미 plan에 있는 항목 제외
  const wishVisible = wishlist.filter(w => !plan.some(d => d.items.some(it => it.title === w.title)));
  if(wishVisible.length > 0){
    const wishSec = document.createElement('div');
    wishSec.className = 'wish-rec-section';
    wishSec.innerHTML = `<div class="wish-rec-title">⭐ 가고싶은 곳 <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--slate);font-weight:400">${wishVisible.length}곳</span></div>`;

    wishVisible.forEach((w, wListIdx)=>{
      const row = document.createElement('div');
      row.className = 'wish-rec-item';

      // 최적 날짜 제안
      let suggestText = '';
      let bestDi = -1;
      const freeDays = plan.map((d,di)=>({di, cnt:d.items.filter(it=>!it._fixed).length}))
                          .filter(x=> x.di >= 1 && x.di <= 7)
                          .sort((a,b)=>a.cnt-b.cnt);
      if(w._lat && w._lng){
        let best = null;
        freeDays.forEach(({di})=>{
          const fixed = plan[di].items.filter(it=>it._fixed && it._lat && it._lng);
          if(!fixed.length) return;
          const avgDist = fixed.reduce((s,it)=>s+haversineKm(w._lat,w._lng,it._lat,it._lng),0)/fixed.length;
          if(!best || avgDist < best.dist){ best = {di, dist:avgDist}; }
        });
        if(best){
          bestDi = best.di;
          const t = transportBetween({lat:w._lat,lng:w._lng},{lat:plan[bestDi].items.find(it=>it._lat)?._lat||55.676,lng:plan[bestDi].items.find(it=>it._lat)?._lng||12.568});
          suggestText = `추천: ${plan[bestDi].date} · 고정 일정과 ${t.icon}${t.mins}분 거리`;
        } else if(freeDays.length){
          bestDi = freeDays[0].di;
          suggestText = `추천: ${plan[bestDi].date} (여유 있는 날)`;
        }
      } else if(freeDays.length){
        bestDi = freeDays[0].di;
        suggestText = `추천: ${plan[bestDi].date} (여유 있는 날)`;
      }

      const gmapLink = w._gmapsUrl ? `<a href="${w._gmapsUrl}" target="_blank" style="color:var(--rust);font-size:10px;margin-left:5px" onclick="event.stopPropagation()">지도 ↗</a>` : '';
      const hasCoords = !!(w._lat && w._lng);
      const mapHint = hasCoords ? `<span style="font-size:10px;color:var(--teal);margin-left:4px;opacity:.7">📍</span>` : '';

      row.innerHTML = `
        <div class="wish-rec-item-body">
          <div class="wish-rec-item-title">${w.title}${mapHint}${gmapLink}</div>
          ${w.address?`<div class="wish-rec-item-addr">${w.address}</div>`:''}
          ${w.note?`<div class="wish-rec-item-addr" style="color:var(--slate)">${w.note}</div>`:''}
          ${suggestText?`<div class="wish-rec-item-suggest">${suggestText}</div>`:''}
        </div>
        <div class="wish-rec-actions">
          <button class="wish-rec-edit-btn" title="수정">✏️</button>
          <button class="wish-rec-del-btn" title="삭제">✕</button>
          <button class="wish-rec-add-btn">+ 일정 추가</button>
        </div>`;

      // 지도 클릭 + 동선 비교 참여
      row.querySelector('.wish-rec-item-body').addEventListener('click',()=>{
        if(!hasCoords) return;
        clearRecPreview();
        if(recMapCurr){
          if(recMapPrev?.row) recMapPrev.row.classList.remove('map-prev');
          recMapPrev = recMapCurr;
          recMapPrev.row.classList.remove('map-active');
          recMapPrev.row.classList.add('map-prev');
        }
        if(recMapCurr?.row) recMapCurr.row.classList.remove('map-active');
        recMapCurr = {lat:w._lat, lng:w._lng, title:w.title, color:'#9b7ab5', tag:'⭐', note:w.note||w.address||'', gmapsUrl:w._gmapsUrl||null, row};
        row.classList.add('map-active');
        const pin = addRecPin(w._lat, w._lng, w.title, '#9b7ab5', '⭐');
        if(recMapPrev && recMapPrev.lat && recMapPrev.lng){
          addRecPin(recMapPrev.lat, recMapPrev.lng, recMapPrev.title, recMapPrev.color, recMapPrev.tag);
          const t = transportBetween({lat:recMapPrev.lat, lng:recMapPrev.lng},{lat:w._lat, lng:w._lng});
          recPreviewLayer = L.polyline(
            [[recMapPrev.lat,recMapPrev.lng],[w._lat,w._lng]],
            {color:'#9b7ab5', weight:3, opacity:.85, dashArray:'6 4'}
          ).addTo(map);
          const mid = [(recMapPrev.lat+w._lat)/2, (recMapPrev.lng+w._lng)/2];
          L.popup({closeButton:false, className:'', offset:[0,0]})
            .setLatLng(mid)
            .setContent(`<div style="font-family:Space Mono,monospace;font-size:11px;font-weight:700;padding:4px 8px">${t.icon} ${t.label} ~${t.mins}분 · ${t.km.toFixed(1)}km</div>`)
            .openOn(map);
          renderRecRoutePanel(recMapPrev, recMapCurr, t);
          map.fitBounds([[recMapPrev.lat,recMapPrev.lng],[w._lat,w._lng]],{padding:[55,55],maxZoom:15});
        } else {
          map.flyTo([w._lat, w._lng], 15, {duration:.8});
          pin.openPopup();
          renderRecPlaceInfoPanel(recMapCurr);
        }
      });

      // 삭제 버튼
      row.querySelector('.wish-rec-del-btn').addEventListener('click', e=>{
        e.stopPropagation();
        if(!confirm(`"${w.title}" 을(를) 위시리스트에서 삭제할까요?`)) return;
        const wIdx = wishlist.findIndex(x=>x.title===w.title && x.addedAt===w.addedAt);
        if(wIdx>=0){ wishlist.splice(wIdx,1); saveWishlist(); }
        renderRecommend();
      });

      // 수정 버튼 → 인라인 폼 토글
      row.querySelector('.wish-rec-edit-btn').addEventListener('click', e=>{
        e.stopPropagation();
        const existing = row.querySelector('.wish-rec-edit-form');
        if(existing){ existing.remove(); return; }
        const form = document.createElement('div');
        form.className = 'wish-rec-edit-form';
        form.innerHTML = `
          <input type="text" class="wedit-title" value="${w.title.replace(/"/g,'&quot;')}" placeholder="장소명">
          <textarea class="wedit-note" placeholder="메모 (선택)">${w.note||''}</textarea>
          <div class="wish-rec-edit-btns">
            <button class="wish-rec-save-btn">저장</button>
            <button class="wish-rec-cancel-btn">취소</button>
          </div>`;
        form.addEventListener('click', e=>e.stopPropagation());
        row.querySelector('.wish-rec-item-body').appendChild(form);
        form.querySelector('.wish-rec-save-btn').addEventListener('click', ()=>{
          const newTitle = form.querySelector('.wedit-title').value.trim();
          const newNote = form.querySelector('.wedit-note').value.trim();
          if(!newTitle) return;
          const wIdx = wishlist.findIndex(x=>x.title===w.title && x.addedAt===w.addedAt);
          if(wIdx>=0){
            wishlist[wIdx].title = newTitle;
            wishlist[wIdx].note = newNote;
            saveWishlist();
          }
          renderRecommend();
        });
        form.querySelector('.wish-rec-cancel-btn').addEventListener('click', ()=>form.remove());
      });

      // 추가 버튼 → 날짜 선택 드롭다운 inline
      const addBtn = row.querySelector('.wish-rec-add-btn');
      addBtn.addEventListener('click', e=>{
        e.stopPropagation();
        const existing = row.querySelector('.wish-rec-day-sel');
        if(existing){ existing.remove(); return; }
        const sel = document.createElement('div');
        sel.className='wish-rec-day-sel';
        sel.style.cssText='display:flex;gap:5px;align-items:center;margin-top:6px;flex-wrap:wrap';
        sel.innerHTML=`<select class="wish-day-select" style="font-size:11px">${plan.map((d,di)=>`<option value="${di}"${di===bestDi?' selected':''}>${d.date} · ${d.tag}</option>`).join('')}</select><button class="wish-day-confirm" style="font-size:10.5px;font-family:'Space Mono',monospace;padding:3px 9px;background:var(--sage);color:#fff;border:none;cursor:pointer;border-radius:2px">확인</button>`;
        row.querySelector('.wish-rec-item-body').appendChild(sel);
        sel.querySelector('.wish-day-confirm').addEventListener('click',()=>{
          const di = +sel.querySelector('select').value;
          plan[di].items.push({
            time:'미정', title:w.title, note:w.note||'', dist:'',
            _user:true, _addedBy:currentUser, _personal:false, _with:['miju','sanghyo'],
            ...(w._lat && {_lat:w._lat, _lng:w._lng}),
            ...(w._gmapsUrl && {_gmapsUrl:w._gmapsUrl})
          });
          sortDayByTime(di); savePlan();
          const wIdx = wishlist.findIndex(x=>x.title===w.title && x.addedAt===w.addedAt);
          if(wIdx>=0){ wishlist.splice(wIdx,1); saveWishlist(); }
          currentVisDay = di;
          setTab('plan');
          requestAnimationFrame(()=>{
            document.getElementById(`body-${di}`)?.closest('.day')?.scrollIntoView({behavior:'smooth',block:'start'});
          });
        });
      });

      wishSec.appendChild(row);
    });
    wrap.appendChild(wishSec);
  }

  RECOMMEND.forEach((day)=>{
    const dayEl = document.createElement('div');
    dayEl.className = 'rec-day';

    const head = document.createElement('div');
    head.className = 'rec-day-head';

    const visibleForHeader = day.items.map((it,i)=>({it,i})).filter(({it})=>!isRecInPlan(day.dayIdx, it.title));
    const hasDayItems = visibleForHeader.length > 0;
    const allAdded = hasDayItems && visibleForHeader.every(({i})=>recChecked.has(`${day.dayIdx}-${i}`));

    head.innerHTML = `
      <span class="rec-day-num${day.fest?' fest':''}">${day.label}</span>
      <span class="rec-day-date">${day.date}</span>
      <span class="rec-day-tag">${day.tag}</span>
      <button class="rec-day-add${allAdded?' done':''}" data-day="${day.dayIdx}">
        ${allAdded?'✓ 전체 선택됨':'하루 전체 선택'}
      </button>`;

    head.querySelector('.rec-day-add').onclick = e=>{
      e.stopPropagation();
      const btn = head.querySelector('.rec-day-add');
      const nowAll = day.items.every((_,i)=>recChecked.has(`${day.dayIdx}-${i}`));
      day.items.forEach((_,i)=>{
        const key=`${day.dayIdx}-${i}`;
        if(nowAll) recChecked.delete(key); else recChecked.add(key);
      });
      renderRecommend();
    };

    const itemsEl = document.createElement('div');
    itemsEl.className = 'rec-items';

    // plan에 없는 항목만 필터
    const visibleItems = day.items.map((it,i)=>({it,i})).filter(({it})=>!isRecInPlan(day.dayIdx, it.title));

    if(visibleItems.length===0){
      itemsEl.innerHTML = `<div style="padding:12px 20px;font-size:12px;color:var(--slate);opacity:.6">${
        day.items.length===0
          ? '이 날은 비어있어요. 행사 탭이나 +장소 탭에서 직접 추가하세요.'
          : '✓ 이 날 추천 항목이 모두 내 일정에 추가됐어요.'
      }</div>`;
    } else {
      const themeEl = document.createElement('div');
      themeEl.style.cssText='padding:6px 20px 4px;font-size:11.5px;color:var(--rust-deep);font-style:italic;border-bottom:1px solid var(--line)';
      themeEl.textContent = `📍 ${day.theme}`;
      itemsEl.appendChild(themeEl);

      const dayColor = DAY_COLORS[day.dayIdx] || '#888';

      visibleItems.forEach(({it,i})=>{
        const key = `${day.dayIdx}-${i}`;
        const isChecked = recChecked.has(key);
        const hasCoords = !!(it._lat && it._lng);
        const row = document.createElement('div');
        row.className = 'rec-item' + (isChecked?' added':'');

        // 좌표 있는 항목은 지도 아이콘 표시
        const mapHint = hasCoords
          ? `<span style="font-size:10px;color:var(--teal);margin-left:4px;opacity:.7" title="지도에서 확인 가능">📍</span>`
          : '';

        row.innerHTML = `
          <input type="checkbox" class="rec-item-cb" ${isChecked?'checked':''} title="일정에 추가">
          <span class="rec-item-time">${it.time}</span>
          <div class="rec-item-main">
            <div class="rec-item-title">${it.title}${mapHint}</div>
            <div class="rec-item-note">${it.note}</div>
            <span class="rec-item-tag" style="background:${it.color}">${it.tag}</span>
          </div>`;

        const cb = row.querySelector('.rec-item-cb');

        // 체크박스 클릭 → 일정 선택 (지도 클릭과 분리)
        cb.addEventListener('change', e=>{
          e.stopPropagation();
          if(cb.checked) recChecked.add(key); else recChecked.delete(key);
          row.classList.toggle('added', cb.checked);
          updateRecFooter();
        });
        cb.addEventListener('click', e=>e.stopPropagation());

        // 행 클릭 → 지도 미리보기 + 동선 비교
        row.addEventListener('click', ()=>{
          // 좌표 없으면 체크박스 토글로 대체
          if(!hasCoords){
            cb.checked=!cb.checked; cb.dispatchEvent(new Event('change'));
            return;
          }

          clearRecPreview();

          // 이전 항목 처리
          if(recMapCurr){
            if(recMapPrev?.row) recMapPrev.row.classList.remove('map-prev');
            recMapPrev = recMapCurr;
            recMapPrev.row.classList.remove('map-active');
            recMapPrev.row.classList.add('map-prev');
          }

          // 현재 항목 설정
          if(recMapCurr?.row) recMapCurr.row.classList.remove('map-active');
          recMapCurr = {lat:it._lat, lng:it._lng, title:it.title, color:dayColor, tag:it.tag, note:it.note, gmapsUrl:it._gmapsUrl||null, row};
          row.classList.add('map-active');

          // 현재 핀 표시
          const pin = addRecPin(it._lat, it._lng, it.title, dayColor, it.tag);

          if(recMapPrev && recMapPrev.lat && recMapPrev.lng){
            // 이전 핀도 표시
            addRecPin(recMapPrev.lat, recMapPrev.lng, recMapPrev.title, recMapPrev.color, recMapPrev.tag);

            // 경로선 그리기
            const t = transportBetween(
              {lat:recMapPrev.lat, lng:recMapPrev.lng},
              {lat:recMapCurr.lat, lng:recMapCurr.lng}
            );
            recPreviewLayer = L.polyline(
              [[recMapPrev.lat,recMapPrev.lng],[recMapCurr.lat,recMapCurr.lng]],
              {color:'#9b7ab5', weight:3, opacity:.85, dashArray:'6 4'}
            ).addTo(map);

            // 거리 팝업
            const mid = [(recMapPrev.lat+recMapCurr.lat)/2, (recMapPrev.lng+recMapCurr.lng)/2];
            L.popup({closeButton:false, className:'', offset:[0,0]})
              .setLatLng(mid)
              .setContent(`<div style="font-family:Space Mono,monospace;font-size:11px;font-weight:700;padding:4px 8px">${t.icon} ${t.label} ~${t.mins}분 · ${t.km.toFixed(1)}km</div>`)
              .openOn(map);

            // 패널 업데이트
            renderRecRoutePanel(recMapPrev, recMapCurr, t);

            map.fitBounds(
              [[recMapPrev.lat,recMapPrev.lng],[recMapCurr.lat,recMapCurr.lng]],
              {padding:[55,55], maxZoom:15}
            );
          } else {
            // 첫 클릭: 해당 위치로 이동 + 장소 정보 패널 표시
            map.flyTo([it._lat, it._lng], 15, {duration:.8});
            pin.openPopup();
            renderRecPlaceInfoPanel(recMapCurr);
          }
        });

        itemsEl.appendChild(row);
      });
    }

    dayEl.appendChild(head);
    dayEl.appendChild(itemsEl);
    wrap.appendChild(dayEl);
  });

  el.appendChild(wrap);
  updateRecFooter();
}

function updateRecFooter(){
  let footer = document.getElementById('recFooter');
  if(!footer){
    footer = document.createElement('div');
    footer.className = 'rec-footer';
    footer.id = 'recFooter';
    const cnt = document.createElement('span');
    cnt.className = 'rec-sel-count';
    cnt.id = 'recCount';
    const btn = document.createElement('button');
    btn.className = 'rec-apply-btn';
    btn.id = 'recApplyBtn';
    btn.onclick = applyRecItems;
    footer.appendChild(cnt);
    footer.appendChild(btn);
    document.getElementById('scroll').appendChild(footer);
  }
  const n = recChecked.size;
  document.getElementById('recCount').textContent = n > 0 ? `${n}개 선택` : '';
  document.getElementById('recApplyBtn').textContent = n > 0 ? `내 일정에 추가 →` : '항목을 선택하세요';
  document.getElementById('recApplyBtn').disabled = n === 0;
}

async function applyRecItems(){
  let added = 0, firstDi = null;
  RECOMMEND.forEach(day=>{
    day.items.forEach((it,i)=>{
      const key = `${day.dayIdx}-${i}`;
      if(!recChecked.has(key)) return;
      const di = day.dayIdx;
      if(!plan[di]) return;
      if(plan[di].items.some(p=>p.title===it.title)) return;
      plan[di].items.push({
        time: it.time,
        title: it.title,
        note: it.note,
        dist: it.tag||'',
        _user: true,
        _lat: it._lat||undefined,
        _lng: it._lng||undefined,
        _addedBy: currentUser,
        _personal: false,
        _with: ['miju','sanghyo'],
      });
      sortDayByTime(di);
      added++;
      if(firstDi===null) firstDi=di;
    });
  });
  await savePlan();
  recChecked.clear();

  if(added===0){ renderRecommend(); return; }

  setTab('plan');
  if(firstDi!==null){
    requestAnimationFrame(()=>{
      document.getElementById(`body-${firstDi}`)?.closest('.day')
        ?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2e6b2e;color:#fff;padding:10px 18px;border-radius:6px;font-size:12px;font-family:Space Mono,monospace;z-index:9999;pointer-events:none';
  t.textContent=`✓ ${added}개 일정에 추가됐어요`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}

/* ---------- RENDER: DISTRICTS ---------- */
function renderDist(){
  const el=document.getElementById('scroll'); el.innerHTML='';
  el.style.cssText='';

  const wrap=document.createElement('div');
  wrap.style.cssText='padding:12px 14px;display:flex;flex-direction:column;gap:12px';

  // 헤더
  wrap.innerHTML=`<div style="font-size:11px;color:var(--slate);font-family:'Space Mono',monospace;letter-spacing:.05em;padding-bottom:4px;border-bottom:1px solid var(--line)">8 DESIGN DISTRICTS — 행사별 규모 & 바로가기</div>`;

  DISTRICTS.forEach(d=>{
    // 행사 카운트
    const counts = {'June 10':0,'June 11':0,'June 12':0};
    FESTIVAL_EVENTS.forEach(e=>{ if(e.district===d.name && counts[e.date]!==undefined) counts[e.date]++; });
    const total = Object.values(counts).reduce((a,b)=>a+b,0);

    // 대표 베뉴 (상위 4개, 중복 제거)
    const venues = [...new Set(
      FESTIVAL_EVENTS.filter(e=>e.district===d.name).map(e=>e.venue)
    )].slice(0,4);

    // 전시 브랜드
    const exhBrands = (typeof EXHIBITIONS!=='undefined') ? EXHIBITIONS.filter(ex=>ex.district===d.name) : [];
    const exhTotal = exhBrands.length;
    const exhEvTotal = exhBrands.reduce((s,ex)=>s+ex.events.length,0);
    const topBrands = exhBrands.filter(ex=>ex.events.length>0).slice(0,4).map(ex=>ex.brand);

    const card = document.createElement('div');
    card.style.cssText=`border:1.5px solid var(--line);border-radius:6px;overflow:hidden`;
    card.innerHTML=`
      <div style="background:${d.color};color:#fff;padding:8px 12px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:13px;font-weight:700">${d.name}</div>
          <div style="font-size:10px;opacity:.85;margin-top:1px">${d.when}</div>
        </div>
        <div style="display:flex;gap:10px;font-family:'Space Mono',monospace;font-size:10px;text-align:right">
          ${total>0?`<div><div style="font-size:17px;font-weight:700;line-height:1">${total}</div><div style="opacity:.85">행사</div></div>`:''}
          ${exhTotal>0?`<div><div style="font-size:17px;font-weight:700;line-height:1">${exhTotal}</div><div style="opacity:.85">브랜드</div></div>`:''}
        </div>
      </div>
      <div style="padding:8px 12px;background:var(--cream)">
        <div style="font-size:11px;color:var(--slate);margin-bottom:6px">${d.desc}</div>

        ${total>0?`<div style="margin-bottom:8px">
          <div style="font-size:9px;font-weight:700;font-family:'Space Mono',monospace;color:var(--slate);margin-bottom:4px;letter-spacing:.06em">EVENTS</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
            ${['June 10','June 11','June 12'].map(date=>counts[date]>0
              ?`<span style="font-size:10px;font-family:'Space Mono',monospace;background:rgba(0,0,0,.06);padding:1px 6px;border-radius:2px">${date.replace('June ','6/')} · ${counts[date]}개</span>`
              :'').join('')}
          </div>
          ${venues.length?`<div style="font-size:10px;color:var(--slate);opacity:.8;line-height:1.5">${venues.join(' · ')}</div>`:''}
        </div>`:''}

        ${exhTotal>0?`<div style="margin-bottom:8px${total>0?';padding-top:7px;border-top:1px solid var(--line)':''}">
          <div style="font-size:9px;font-weight:700;font-family:'Space Mono',monospace;color:var(--teal);margin-bottom:4px;letter-spacing:.06em">EXHIBITIONS · ${exhEvTotal}개 이벤트 포함</div>
          ${topBrands.length?`<div style="font-size:10px;color:var(--slate);opacity:.85;line-height:1.6">${topBrands.join(' · ')}${exhTotal>4?` <span style="opacity:.6">외 ${exhTotal-4}개</span>`:''}</div>`:''}
        </div>`:''}

        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <a href="${gMapsUrl(d.name+' Copenhagen')}" target="_blank"
            style="padding:5px 8px;background:var(--sage);color:#fff;border-radius:4px;text-decoration:none;font-size:10.5px;font-family:'Space Mono',monospace">
            📍 Maps
          </a>
          ${total>0?`<button onclick="setTab('fest');festDistFilter='${d.name}';renderFest()"
            style="flex:1;padding:5px;background:${d.color};color:#fff;border:none;border-radius:4px;font-size:10.5px;cursor:pointer;font-family:'Space Mono',monospace">
            3DoD ${total}개 ▸
          </button>`:''}
          ${exhTotal>0?`<button onclick="exhDistFilter='${d.name}';setTab('exh')"
            style="flex:1;padding:5px;background:var(--teal);color:#fff;border:none;border-radius:4px;font-size:10.5px;cursor:pointer;font-family:'Space Mono',monospace">
            쇼룸 ${exhTotal}개 ▸
          </button>`:''}
        </div>
      </div>`;
    wrap.appendChild(card);
  });
  el.appendChild(wrap);
}

/* ---------- RENDER: INFO ---------- */
function renderInfo(){
  const el=document.getElementById('scroll');
  el.innerHTML=`<div class="info">
    <h3>행사 개요</h3>
    <p><b>3 Days of Design 2026</b> (13회차) · 덴마크 공식 디자인 페스티벌. 단일 장소가 아닌 코펜하겐 전역의 쇼룸·갤러리에서 분산 개최됩니다.</p>
    <ul>
      <li><b>일정</b> 6/10(수)~6/12(금) · 매일 10:00–18:00</li>
      <li><b>규모</b> 460+ 브랜드 · 600+ 이벤트 · 6만+ 방문</li>
      <li><b>입장</b> 전 행사 무료 · 일반 개방</li>
      <li><b>테마</b> "Make This Moment Matter"</li>
    </ul>
    <h3>숙소</h3>
    <p><b>베스테르브로(Vesterbro) Airbnb</b> · 상트요르겐스 호수 근처 · 코펜하겐 중앙역에서 900m. 침실 1 / 침대 1 / 욕실 1 (2인) 현대적 아파트.</p>
    <ul>
      <li><b>체크인</b> 6/9(화) 15:00 이후</li>
      <li><b>체크아웃</b> 6/16(화) 11:00 전</li>
      <li><b>위치 장점</b> 중앙역 도보권 → 공항·근교 이동 편리, 지구별 메트로/자전거 접근 양호</li>
    </ul>
    <p style="font-size:11px;opacity:.7">📍 숙소 주소: <b>Sommerstedgade 26, 1718 København</b> (베스테르브로 · 코펜하겐 중앙역 도보 15분)</p>
    <h3>고정 예약</h3>
    <ul>
      <li><b>Food & Music with SALU</b> (소셜 다이닝, 3명) · 6/10(수) 17:00–20:00</li>
      <li>Folkehuset Absalon · Sønder Blvd. 73, 1720 København (베스테르브로, 숙소 도보권)</li>
      <li>QR코드 3매 메일 보유 · 숙소 근처에서 만나 함께 도보 이동</li>
    </ul>
    <p style="font-size:11.5px;color:var(--teal)"><b>동선 메모:</b> 6/10 페스티벌 일정을 16시경 마무리하고 베스테르브로로 복귀해야 17시 다이닝에 맞출 수 있습니다. 일정 탭에서 이 항목은 🔒로 고정되어 삭제되지 않습니다.</p>
    <h3>항공편 (2인)</h3>
    <p><b>박상효</b> · SAS 직항</p>
    <ul>
      <li>가는 편 6/8 23:35 ICN(T2) → 6/9 06:00 CPH(T3) · SK0988 · 좌석 31F</li>
      <li>오는 편 6/16 23:55 CPH(T3) → 6/17 18:35 ICN(T2) · SK0987 · 좌석 31F</li>
    </ul>
    <p><b>김미주</b> · KLM/대한항공/SAS 경유</p>
    <ul>
      <li>가는 편 6/8 22:25 ICN → AMS 환승(KE5925/KL1267) → 6/9 08:30 CPH(T2)</li>
      <li>오는 편 6/16 16:40 CPH → LHR 환승(SK1517/KE908) → 6/17 16:15 ICN</li>
    </ul>
    <p style="font-size:11.5px;color:var(--rust-deep)"><b>주의:</b> 도착일(6/9) 박상효 06:00 · 김미주 08:30 도착으로 약 2.5시간 차. 출국일(6/16) 김미주가 16:40 먼저 출발(14:30경 공항행), 박상효는 23:55 출발이라 오후~저녁 도심 자유시간이 있습니다.</p>
    <h3>이동 팁</h3>
    <p>자전거 대여 · 메트로 · 버스 · 보트 · 도보 모두 가능. 8개 지구가 분산돼 있어 <b>지리적으로 묶어 하루 2~3개 지구</b>를 도는 전략이 효율적입니다.</p>
    <h3>참가 브랜드 (일부)</h3>
    <p><span class="chip">Fritz Hansen</span><span class="chip">&Tradition</span><span class="chip">Ferm Living</span><span class="chip">Gubi</span><span class="chip">Louis Poulsen</span><span class="chip">Audo</span><span class="chip">Carl Hansen</span><span class="chip">Georg Jensen</span><span class="chip">Arper</span><span class="chip">Flos</span></p>
    <h3>준비 체크리스트</h3>
    <ul>
      <li>공식 앱 다운로드 → 관심 브랜드·이벤트 즐겨찾기</li>
      <li>숙소 조기 예약 (6만 명 몰려 가격 급등)</li>
      <li>6월 코펜하겐은 일조시간이 길고 쌀쌀 → 레이어드 의류</li>
      <li>인기 디자인 토크는 사전 등록 필요할 수 있음</li>
    </ul>
    <p style="margin-top:14px;font-size:11px;opacity:.6">※ 일정·디자인 지구 매칭은 추천안이며, 실제 프로그램은 3daysofdesign.dk에서 확정됩니다. 일정 탭의 모든 항목은 직접 편집·추가·삭제할 수 있고 자동 저장됩니다.</p>

    <h3>🚲 자전거 대여</h3>
    <p>코펜하겐은 세계 최고의 자전거 도시 — 전용 차선이 촘촘하고 지형이 평탄해 여행 중 이동수단으로 적극 추천합니다.</p>
    <div class="bike-rental-grid" id="bikeGrid"></div>
    <p style="font-size:11.5px;color:var(--teal)"><b>팁:</b> Donkey Republic 앱은 구글/애플 계정으로 가입하고 신용카드 등록하면 바로 사용 가능. 첫날 아침 도착 직후 숙소 근처 Bike Mike 또는 Copenhagen Bicycles에서 종일권 빌리는 것도 좋아요.</p>

    <h3>🤖 여행 어시스턴트</h3>
    <p style="font-size:12px;opacity:.75">코펜하겐 여행 중 궁금한 것을 물어보세요. 대화 내역은 이 기기에 저장됩니다.</p>
    <div class="qa-wrap" id="qaWrap">
      <div class="qa-history" id="qaHistory"></div>
      <div class="qa-input-row">
        <textarea class="qa-input" id="qaInput" placeholder="예) Reffen street food가 6/10에 여나요?&#10;예) 코펜하겐 슈퍼마켓 위치 알려줘&#10;예) Nørreport역에서 Nordhavn까지 자전거로 얼마나 걸려?" rows="2"></textarea>
        <button class="qa-send" id="qaSend">전송</button>
      </div>
      <div class="qa-status" id="qaStatus"></div>
    </div>
  </div>`;

  // ── 자전거 대여소 카드 렌더링 ──
  const BIKE_SPOTS = [
    {name:'Donkey Republic (앱)', type:'app', icon:'📱', color:'#2f6b6b',
     desc:'스마트폰 앱으로 QR 잠금 해제. 코펜하겐 전역 수백 곳의 랙. 시간당 요금 (하루 약 180–250 DKK).',
     addr:'앱 설치 후 주변 자전거 찾기', lat:55.6727, lng:12.5645,
     gmaps:'https://www.google.com/maps/search/Donkey+Republic+Copenhagen/@55.6727,12.5645,14z',
     appUrl:'https://www.donkeyrepublic.com'},
    {name:'Bycyklen (전동 시티바이크)', type:'station', icon:'⚡', color:'#d99021',
     desc:'터치스크린 잠금장치 내장 전동 자전거 (최대 20km/h). 앱 또는 카드 결제. 시작 요금 25 DKK + 5 DKK/10분.',
     addr:'Rådhuspladsen (시청광장)', lat:55.6759, lng:12.5682,
     gmaps:'https://www.google.com/maps/place/55.6759,12.5682'},
    {name:'Copenhagen Bicycles', type:'shop', icon:'🏪', color:'#c8492a',
     desc:'중앙역 인근 대여점. 시티바이크·카고바이크 완비. 하루 대여 약 100–150 DKK. 헬멧 포함.',
     addr:'Nørre Voldgade 44, 1358 København', lat:55.6763, lng:12.5622,
     gmaps:'https://www.google.com/maps/place/Copenhagen+Bicycles,+N%C3%B8rre+Voldgade+44,+1358+K%C3%B8benhavn'},
    {name:'Bike Mike', type:'shop', icon:'🔧', color:'#5d7456',
     desc:'숙소(베스테르브로)에서 도보 8분. 수리+대여 겸용. 직원이 친절하고 저렴. 하루 대여 약 80–120 DKK.',
     addr:'Vester Søgade 2, 1601 København', lat:55.6740, lng:12.5530,
     gmaps:'https://www.google.com/maps/search/Bike+Mike+Vester+Søgade+Copenhagen'},
    {name:'Cykler til Leje & Salg', type:'shop', icon:'🛒', color:'#9b7ab5',
     desc:'코펜하겐 중심부 대여점. 다양한 자전거 보유. 하루 대여 약 100 DKK. 다국어 서비스.',
     addr:'Gothersgade 157, 1123 København', lat:55.6831, lng:12.5782,
     gmaps:'https://www.google.com/maps/search/Cykler+til+Leje+Gothersgade+Copenhagen'},
  ];

  const bikeGrid = document.getElementById('bikeGrid');
  if(bikeGrid){
    bikeGrid.innerHTML = BIKE_SPOTS.map(s=>`
      <div class="bike-card">
        <div class="bike-card-hd" style="color:${s.color}">${s.icon} ${s.name}</div>
        <div class="bike-card-desc">${s.desc}</div>
        <div class="bike-card-addr">📍 ${s.addr}</div>
        <div class="bike-card-links">
          <a href="${s.gmaps}" target="_blank" rel="noopener" class="bike-link">🗺 지도 보기</a>
          ${s.appUrl?`<a href="${s.appUrl}" target="_blank" rel="noopener" class="bike-link">↗ 앱/사이트</a>`:''}
          <button class="bike-link bike-pin-btn" data-lat="${s.lat}" data-lng="${s.lng}" data-name="${s.name}">📌 맵에 핀</button>
        </div>
      </div>`).join('');

    bikeGrid.querySelectorAll('.bike-pin-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const lat=+btn.dataset.lat, lng=+btn.dataset.lng, name=btn.dataset.name;
        map.flyTo([lat,lng],16,{duration:.7});
        L.marker([lat,lng],{icon:L.divIcon({className:'',
          html:`<div style="background:#2f6b6b;color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-family:'Space Mono',monospace;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">🚲 ${name}</div>`,
          iconAnchor:[0,0]})}).addTo(map)
          .bindPopup(`<div class="pop-name">🚲 ${name}</div>`).openPopup();
      });
    });
  }

  // ── AI 여행 어시스턴트 Q&A ──
  const QA_KEY = 'cph_qa_history';
  let qaHistory = JSON.parse(localStorage.getItem(QA_KEY)||'[]');

  function renderQaHistory(){
    const el = document.getElementById('qaHistory');
    if(!el) return;
    if(!qaHistory.length){
      el.innerHTML='<div style="font-size:11.5px;opacity:.5;padding:8px 0">아직 질문이 없어요. 무엇이든 물어보세요!</div>';
      return;
    }
    el.innerHTML = qaHistory.slice().reverse().map((qa,i)=>`
      <div class="qa-item">
        <div class="qa-q">❓ ${qa.q}</div>
        <div class="qa-a">${qa.a}</div>
        <div class="qa-meta">${new Date(qa.ts).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
      </div>`).join('');
  }
  renderQaHistory();

  const qaSend = document.getElementById('qaSend');
  const qaInput = document.getElementById('qaInput');
  const qaStatus = document.getElementById('qaStatus');
  if(qaSend && qaInput){
    const doAsk = async ()=>{
      const q = qaInput.value.trim();
      if(!q) return;
      qaSend.disabled=true; qaSend.textContent='...';
      qaStatus.textContent='AI가 답변 중...'; qaStatus.style.opacity='1';
      try{
        const sys = `You are a helpful travel assistant for a Korean couple (미주 and 상효) visiting Copenhagen for 3 Days of Design festival, June 10-12 2026. They are staying at Sommerstedgade 26, Vesterbro. Answer in Korean, concisely and practically. Include specific addresses, opening hours, prices (DKK) when relevant.`;
        const r = await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({system:sys, input:q, max_tokens:600})});
        if(!r.ok) throw new Error(r.status);
        const d = await r.json();
        const a = (d.text||'').trim();
        if(!a) throw new Error('빈 응답');
        qaHistory.push({q, a, ts:Date.now()});
        if(qaHistory.length>30) qaHistory=qaHistory.slice(-30);
        localStorage.setItem(QA_KEY, JSON.stringify(qaHistory));
        qaInput.value='';
        qaStatus.textContent='';
        renderQaHistory();
      }catch(e){
        qaStatus.textContent=`오류: ${e.message}. 다시 시도해주세요.`;
      }finally{
        qaSend.disabled=false; qaSend.textContent='전송';
      }
    };
    qaSend.addEventListener('click', doAsk);
    qaInput.addEventListener('keydown', e=>{ if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){ e.preventDefault(); doAsk(); } });
  }
}

/* ---------- EXHIBITION EVENT DETAIL MODAL ---------- */
const exhDetailCache = {};

function openExhEvModal(ev, ex){
  document.querySelectorAll('.ev-overlay').forEach(el=>el.remove());

  const dayColor = EXH_DAY_COLORS[ev.day]||'#888';
  const distD = EXH_DISTRICTS.find(d=>d.key===ex.district)||{color:'#888'};
  const overlay = document.createElement('div');
  overlay.className = 'ev-overlay';

  const catTags = (() => {
    const allCats = ev.cats || [];
    if(allCats.length === 0) return `<span class="fest-dk" style="background:${ev.color}">${ev.icon} ${ev.label}</span>`;
    return allCats.map(c=>{
      const info = EXH_CATS.find(x=>x.key===c);
      return info?`<span class="fest-dk" style="background:${c==='talk'?'#2f6b6b':c==='workshop'?'#5d7456':c==='drinks'?'#8b5e3c':c==='launch'?'#d99021':'#3a4a5a'}">${info.icon||''} ${info.label}</span>`:'';
    }).join('');
  })();

  const venueAddr = ev.location || ex.address || '';
  const evUrl = ev.id ? `https://www.3daysofdesign.dk/event/${ev.id}` : '';

  overlay.innerHTML=`
    <div class="ev-modal" id="evModal">
      <div class="ev-header">
        <button class="ev-close" id="evClose">✕</button>
        <div class="ev-hed-title">${ev.title}</div>
        <div class="ev-hed-meta">
          <span class="ev-hed-time">6/${ev.day} ${ev.start}${ev.end?'–'+ev.end:''}</span>
          <span>${venueAddr}</span>
          <span class="ev-hed-dk" style="background:${distD.color}">${ex.district}</span>
          ${catTags}
        </div>
      </div>
      <div class="ev-photo-placeholder" style="background:linear-gradient(135deg,${distD.color}22,${dayColor}22)">
        <div class="ev-photo-icon">${ev.icon}</div>
        <div class="ev-photo-vname">${ex.brand.toUpperCase()}</div>
      </div>
      <div class="ev-body" id="evBody">
        <div class="ev-section">
          <div class="ev-section-label">브랜드</div>
          <div class="ev-section-body" style="font-weight:600">${ex.brand}</div>
          ${ex.desc?`<div class="ev-section-body" style="margin-top:4px">${ex.desc}</div>`:''}
          ${evUrl?`<a href="${evUrl}" target="_blank" rel="noopener" class="ev-booking-link" style="margin-top:6px;display:inline-block">↗ 공식 행사 페이지</a>`:''}
        </div>
        <div id="evDetail">
          <div class="ev-loading"><div class="ev-spin"></div>상세 정보를 불러오는 중...</div>
        </div>
      </div>
      <div class="ev-add-row">
        <button class="ev-add-btn" id="evAddBtn">＋ 일정에 추가</button>
      </div>
    </div>`;

  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
  overlay.querySelector('#evClose').onclick = ()=>overlay.remove();

  // 일정 추가
  overlay.querySelector('#evAddBtn').onclick = ()=>{
    const btn = overlay.querySelector('#evAddBtn');
    const festDayIdx = ev.day===10?2:ev.day===11?3:ev.day===12?4:-1;
    if(festDayIdx<0){ alert('날짜 정보가 없습니다.'); return; }
    if(plan[festDayIdx].items.some(it=>it.title===ev.title)){
      btn.textContent='✓ 이미 추가됨'; btn.classList.add('done'); return;
    }
    plan[festDayIdx].items.push({
      time: ev.start||'미정',
      title: ev.title,
      note: `${ex.brand}${ex.address?' · '+ex.address:''}`,
      dist: ex.district||'',
      _user:true, _addedBy:currentUser, _personal:false, _with:['miju','sanghyo'],
      _dk: ex.district,
    });
    sortDayByTime(festDayIdx); savePlan();
    btn.textContent='✓ 일정에 추가됨'; btn.classList.add('done');
    const t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2e6b2e;color:#fff;padding:9px 16px;border-radius:6px;font-size:12px;font-family:Space Mono,monospace;z-index:9999;pointer-events:none;white-space:nowrap';
    t.textContent=`✓ ${plan[festDayIdx].date}에 추가됨`;
    document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
  };

  document.body.appendChild(overlay);
  loadExhEvDetail(ev, ex);
}

async function loadExhEvDetail(ev, ex){
  const detailEl = document.getElementById('evDetail');
  if(!detailEl) return;
  const cacheKey = ev.id || `${ex.brand}-${ev.title}`;
  if(exhDetailCache[cacheKey]){ renderEvDetail(exhDetailCache[cacheKey], detailEl); return; }

  const sys = `너는 코펜하겐 3 Days of Design 2026 페스티벌 전문가다. 행사 정보를 받아 JSON만 출력한다. 마크다운·설명 절대 금지.

예약 분류 기준:
- "불필요": 쇼룸 방문, 전시 관람, 브렉퍼스트/커피/토크/워크숍 등 브랜드가 무료로 여는 행사
- "티켓 필요": 유료 티켓 판매 행사만 (Long Table Dinner, Symposium, 유료 워크숍)
- "사전등록 권장": 무료이나 인원 제한으로 사전 등록 필요 시

출력 형식:
{"detail":"3~4문장 상세 설명 (한국어)","reservation":"불필요"|"사전등록 권장"|"티켓 필요","reservationNote":"예약 안내 (불필요이면 빈 문자열)","bookingUrl":"티켓/등록 URL (없으면 빈 문자열)","items":["준비물1",...],"duration":"예상 소요시간","tips":"현장 팁 한 문장"}`;

  const input = `브랜드: ${ex.brand}
이벤트: ${ev.title}
장소: ${ev.location||ex.address||''} (${ex.district})
날짜/시간: 6/${ev.day} ${ev.start}${ev.end?'–'+ev.end:''}
카테고리: ${ev.label}
브랜드 소개: ${ex.desc||''}`;

  try{
    const resp = await fetch('/api/extract',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({system:sys, input, max_tokens:600})
    });
    if(!resp.ok) throw new Error(resp.status);
    const data = await resp.json();
    const txt = (data.text||'').replace(/```json|```/g,'').trim();
    const obj = JSON.parse(txt);
    exhDetailCache[cacheKey] = obj;
    if(document.getElementById('evDetail')) renderEvDetail(obj, document.getElementById('evDetail'));
  } catch(e){
    if(detailEl){
      detailEl.innerHTML=`<div style="font-size:12px;color:var(--slate)">상세 정보를 불러올 수 없어요.</div>`;
      const retryBtn = document.createElement('button');
      retryBtn.textContent='↻ 다시 시도';
      retryBtn.style.cssText='margin-top:6px;font-size:11px;padding:3px 10px;border:1px solid var(--line);background:none;cursor:pointer;border-radius:3px;color:var(--sage)';
      retryBtn.onclick=()=>loadExhEvDetail(ev, ex);
      detailEl.appendChild(retryBtn);
    }
  }
}

/* ---------- RENDER: EXHIBITIONS ---------- */
let exhDistFilter = 'all';
let exhCatFilter  = 'all';
let exhDayFilter  = 'all';
let exhSearchQ    = '';
let exhOpenSet    = new Set();
let exhNoEvOpen   = false;

const EXH_DISTRICTS = [
  {key:'all',             label:'All Districts'},
  {key:'Frederiksstaden', label:'Frederiksstaden', color:'#2f6b6b'},
  {key:'Kongens Nytorv',  label:'Kongens Nytorv',  color:'#6d3b54'},
  {key:'Rosengård',       label:'Rosengård',        color:'#c8492a'},
  {key:'Christianshavn',  label:'Christianshavn',   color:'#3a4a5a'},
  {key:'Nordhavn',        label:'Nordhavn',         color:'#5d7456'},
  {key:'Holmen',          label:'Holmen',           color:'#d99021'},
  {key:'Kultur',          label:'Kultur',           color:'#9b7ab5'},
  {key:'Islands Brygge',  label:'Islands Brygge',   color:'#8b5e3c'},
];
/* 3DoD 공식 제품 카테고리 (https://www.3daysofdesign.dk/exhibitions) */
const EXH_CATS = [
  {key:'all',        label:'전체'},
  {key:'furniture',  label:'가구',        icon:'🪑', color:'#c8492a'},
  {key:'lighting',   label:'조명',        icon:'💡', color:'#e8a020'},
  {key:'kitchen',    label:'주방',        icon:'🍽', color:'#7a4a1e'},
  {key:'bath',       label:'욕실',        icon:'🛁', color:'#2f6b6b'},
  {key:'accessories',label:'액세서리',    icon:'🏺', color:'#9b7ab5'},
  {key:'materials',  label:'소재',        icon:'🪨', color:'#5d7456'},
  {key:'rug',        label:'러그·바닥',   icon:'🧶', color:'#7a6a3a'},
  {key:'av',         label:'오디오비주얼',icon:'🔊', color:'#3a4a5a'},
  {key:'beds',       label:'침실',        icon:'🛏', color:'#6d3b54'},
  {key:'office',     label:'오피스',      icon:'💼', color:'#2f5d6b'},
  {key:'outdoor',    label:'아웃도어',    icon:'🌿', color:'#5d8456'},
  {key:'wall',       label:'벽·표면',     icon:'🖼', color:'#7a7a7a'},
];

/* 브랜드 제품 카테고리 자동 분류 (브랜드명+설명 키워드 매칭) */
function getBrandProdCats(ex){
  const name = ex.brand.toLowerCase();
  const desc = (ex.desc||'').toLowerCase();
  const t = name + ' ' + desc;
  const cats = [];
  if(/sofa|chair(?!man)|furn|møbler|møbel|stol|bord(?!eau)|shelf|shelv|bookcase|cabinet|storage|seating|armchair|bench|daybed|dresser|wardrobe|sideboard|credenza|lounge|recliner|fritz hansen|carl hansen|pp møbler|fredericia|sibast|woud|wendelbo|softline|blond|verner panton|house of finn juhl|gubi|boconcept|arper|muuto|&tradition|handvark|moebe|frama|fogia|andersen|kinnarps|flokk|davidsign|cane.line|dedon|gloster|kettal|가구|소파|의자|테이블|선반|수납/.test(t)) cats.push('furniture');
  if(/\blamp|lighting|pendant|chandelier|sconce|floor lamp|\bled\b|nuura|lightpoint|light.point|tom rossau|umage|louis poulsen|le klint|lightyears|조명|전등|램프/.test(t)) cats.push('lighting');
  if(/kitchen|cook(?!ie)|tableware|cutlery|plates?|bowl|pitcher|kettle|\bpot\b|\bpan\b|stelton|asko|kvik|vipp|eva solo|iittala|royal copenhagen|georg jensen|주방|식기|조리/.test(t)) cats.push('kitchen');
  if(/\bbath|shower|basin|toilet|\bspa\b|faucet|sanitary|plumbing|gessi|dornbracht|frost denmark|kaldewei|\bvola\b|hansgrohe|\bgrohe\b|욕실|욕조|세면/.test(t)) cats.push('bath');
  if(/accessor|vase|candle(?!stick)|tray|cushion|\bthrow\b|pillow|mette ditmer|danish art|broste|kähler|kahler|bloomingville|marimekko|액세서리|오브제|화병/.test(t)) cats.push('accessories');
  if(/material|surface(?! design)|stone|marble|terrazzo|composite|cosentino|baux|durat|rockfon|kvadrat|vescom|camira|gabriel fabric|소재|재료|마감/.test(t)) cats.push('materials');
  if(/\brug\b|carpet|kilim|\bege\b|finarte|rezas|\bromo\b|러그|카펫|바닥/.test(t)) cats.push('rug');
  if(/audio|speaker|sound(?! design)|hifi|hi.fi|\bav\b|bang.{0,8}olufsen|beoplay|beosound|오디오|스피커|음향/.test(t)) cats.push('av');
  if(/\bbed\b|mattress|\bsleep\b|bedroom|carpe diem|h.stens|tempur|침대|침실|매트리스/.test(t)) cats.push('beds');
  if(/\boffice\b|workspace|ergonomic|work chair|workstation|\bvelux\b|task chair|사무|오피스|업무/.test(t)) cats.push('office');
  if(/outdoor|garden|terrace|patio|exterior|weather(?:proof)|teak|rattan|야외|정원|테라스/.test(t)) cats.push('outdoor');
  if(/wallpaper|wall.panel|wall.cover|wall.surface|wall.tile|wall.tex|\bpaint\b|coating|plaster|wood.panel|벽지|벽면/.test(t) && !/wall street|wall of/.test(t)) cats.push('wall');
  return cats.length ? cats : ['accessories'];
}

const EXH_DAY_COLORS = {10:'#c8492a', 11:'#2f6b6b', 12:'#9b7ab5'};

function renderExhibitions(){
  const el = document.getElementById('scroll');
  el.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;padding:0';
  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'exh-wrap';

  /* ── 지구 필터 ── */
  const filterRow = document.createElement('div');
  filterRow.className = 'exh-filters';
  EXH_DISTRICTS.forEach(d=>{
    const b = document.createElement('button');
    b.className = 'exh-filter-btn dist-btn' + (exhDistFilter===d.key?' active':'');
    b.textContent = d.label;
    b.onclick = ()=>{ exhDistFilter=d.key; renderExhibitions(); };
    filterRow.appendChild(b);
  });
  wrap.appendChild(filterRow);

  /* ── 행 2: 카테고리 ── */
  const catRow = document.createElement('div');
  catRow.className = 'exh-filters';
  EXH_CATS.forEach(c=>{
    const b = document.createElement('button');
    b.className = 'exh-filter-btn cat-btn' + (exhCatFilter===c.key?' active':'');
    b.textContent = (c.icon?c.icon+' ':'')+c.label;
    b.onclick = ()=>{ exhCatFilter=c.key; renderExhibitions(); };
    catRow.appendChild(b);
  });
  wrap.appendChild(catRow);

  /* ── 행 3: 날짜 + 초기화 ── */
  const dayRow = document.createElement('div');
  dayRow.className = 'exh-filters';
  [{k:'all',l:'전체 날짜'},{k:'10',l:'6/10 (수)'},{k:'11',l:'6/11 (목)'},{k:'12',l:'6/12 (금)'}].forEach(({k,l})=>{
    const b = document.createElement('button');
    b.className = 'exh-filter-btn' + (exhDayFilter===k?' active':'');
    b.textContent = l;
    if(k!=='all') b.style.cssText=`border-color:${EXH_DAY_COLORS[+k]};${exhDayFilter===k?`background:${EXH_DAY_COLORS[+k]};color:#fff`:`color:${EXH_DAY_COLORS[+k]}`}`;
    b.onclick = ()=>{ exhDayFilter=k; renderExhibitions(); };
    dayRow.appendChild(b);
  });
  wrap.appendChild(dayRow);

  /* ── 검색 ── */
  const sWrap = document.createElement('div');
  sWrap.className = 'exh-search-wrap';
  const sInput = document.createElement('input');
  sInput.type = 'text';
  sInput.className = 'exh-search-input';
  sInput.placeholder = '브랜드명 또는 이벤트 검색…';
  sInput.value = exhSearchQ;
  sInput.oninput = ()=>{ exhSearchQ = sInput.value; renderExhibitionsList(listEl, statEl); };
  sWrap.appendChild(sInput);
  wrap.appendChild(sWrap);

  /* ── 통계 바 ── */
  const statEl = document.createElement('div');
  statEl.style.cssText = 'padding:4px 14px;font-size:10px;font-family:Space Mono,monospace;color:var(--slate);border-bottom:1px solid var(--line);flex-shrink:0;display:flex;gap:8px;align-items:center';
  wrap.appendChild(statEl);

  /* ── 리스트 ── */
  const listEl = document.createElement('div');
  listEl.className = 'exh-list';
  wrap.appendChild(listEl);

  el.appendChild(wrap);
  renderExhibitionsList(listEl, statEl);
  requestAnimationFrame(()=>sInput.focus&&sInput.focus());
}

function filterExhibitions(){
  const q = exhSearchQ.toLowerCase().trim();
  return EXHIBITIONS.filter(ex=>{
    // 지구 필터
    if(exhDistFilter !== 'all' && ex.district !== exhDistFilter) return false;
    // 검색어
    if(q){
      const brandMatch = ex.brand.toLowerCase().includes(q);
      const evMatch = ex.events.some(ev=>ev.title.toLowerCase().includes(q));
      if(!brandMatch && !evMatch) return false;
    }
    // 제품 카테고리 필터 (브랜드 단위 필터)
    if(exhCatFilter !== 'all'){
      const brandCats = getBrandProdCats(ex);
      if(!brandCats.includes(exhCatFilter)) return false;
    }
    // 날짜 필터
    if(exhDayFilter !== 'all'){
      const dayNum = parseInt(exhDayFilter);
      const hasDay = ex.events.some(ev=>ev.day===dayNum);
      if(!hasDay) return false;
    }
    return true;
  });
}

function renderExhibitionsList(listEl, statEl){
  if(typeof EXHIBITIONS === 'undefined' || !EXHIBITIONS.length){
    listEl.innerHTML = '<div style="padding:20px 14px;font-size:12px;color:var(--slate);font-family:Space Mono,monospace">전시 데이터를 불러오는 중... 페이지를 새로고침해 주세요.</div>';
    return;
  }
  const q = exhSearchQ.toLowerCase().trim();
  const filtered = filterExhibitions();
  const withEvs  = filtered.filter(x=>x.events.length > 0);
  const noEvs    = filtered.filter(x=>x.events.length === 0);

  const totalEvs = withEvs.reduce((s,x)=>{
    // 날짜/카테고리 필터 적용된 이벤트 수
    return s + filterEventsOf(x).length;
  },0);

  statEl.innerHTML = `<b style="color:var(--ink)">${withEvs.length}</b> 이벤트 브랜드&nbsp;·&nbsp;<b>${noEvs.length}</b> 전시 전용&nbsp;·&nbsp;이벤트 <b>${totalEvs}</b>건`;
  if(exhDistFilter!=='all'||exhCatFilter!=='all'||exhDayFilter!=='all'||q){
    const rst = document.createElement('button');
    rst.style.cssText='margin-left:auto;font-size:9.5px;font-family:Space Mono,monospace;background:none;border:1px solid var(--line);padding:1px 7px;cursor:pointer;color:var(--slate);border-radius:2px';
    rst.textContent='필터 초기화';
    rst.onclick=()=>{exhDistFilter='all';exhCatFilter='all';exhDayFilter='all';exhSearchQ='';renderExhibitions();};
    statEl.appendChild(rst);
  }

  listEl.innerHTML = '';

  /* ── 이벤트 있는 브랜드 ── */
  withEvs.forEach(ex=>{ listEl.appendChild(buildExhCard(ex, q)); });

  /* ── 전시 전용 (이벤트 없는 브랜드) ── */
  if(noEvs.length > 0 && (exhCatFilter==='all' && exhDayFilter==='all')){
    const hdr = document.createElement('div');
    hdr.className = 'exh-no-events-hdr';
    hdr.innerHTML = `<span>${exhNoEvOpen?'▲':'▶'}</span> 전시 전용 부스 <span class="exh-section-count">(이벤트 없는 ${noEvs.length}개 브랜드)</span>`;
    hdr.onclick = ()=>{ exhNoEvOpen=!exhNoEvOpen; renderExhibitionsList(listEl, statEl); };
    listEl.appendChild(hdr);

    if(exhNoEvOpen){
      noEvs.forEach(ex=>{ listEl.appendChild(buildExhCard(ex, q)); });
    }
  }
}

function filterEventsOf(ex){
  return ex.events.filter(ev=>{
    if(exhDayFilter!=='all' && ev.day!==parseInt(exhDayFilter)) return false;
    return true;
  });
}

function buildExhCard(ex, q){
  const card = document.createElement('div');
  card.className = 'exh-card' + (ex.events.length?  ' has-events':'');
  const isOpen = exhOpenSet.has(ex.slug||ex.brand);

  const evs = filterEventsOf(ex);
  const hasFilteredEvs = evs.length > 0;

  // 검색어 하이라이트 함수
  const hl = (str)=>{
    if(!q) return str;
    const re = new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
    return str.replace(re,'<mark style="background:#fde68a;padding:0">$1</mark>');
  };

  /* 헤더 */
  const head = document.createElement('div');
  head.className = 'exh-card-head';

  const distD = EXH_DISTRICTS.find(d=>d.key===ex.district)||{color:'#888'};
  const evCountStr = ex.events.length > 0
    ? `${hasFilteredEvs?evs.length:ex.events.length}개 이벤트`
    : '전시';
  const evCountClass = ex.events.length > 0 ? 'exh-ev-count' : 'exh-ev-count none';

  const prodCats = getBrandProdCats(ex);
  const prodBadges = prodCats.map(k=>{ const c=EXH_CATS.find(x=>x.key===k); return c&&c.key!=='all'?`<span style="display:inline-flex;align-items:center;gap:2px;font-size:9px;font-family:'Space Mono',monospace;background:${c.color}22;color:${c.color};border:1px solid ${c.color}55;border-radius:2px;padding:1px 5px;white-space:nowrap">${c.icon} ${c.label}</span>`:'' }).join('');
  head.innerHTML = `
    <div class="exh-card-info">
      <div class="exh-brand">${hl(ex.brand)}</div>
      <div class="exh-meta" style="flex-wrap:wrap;gap:4px">
        <span class="exh-dist-badge" style="background:${distD.color||ex.districtColor}">${ex.district||'–'}</span>
        ${prodBadges}
        ${ex.address ? `<span class="exh-addr exh-addr-pin" style="margin:0;cursor:pointer;width:100%" title="지도에서 보기">📍 ${ex.address}</span>` : ''}
      </div>
      ${ex.desc ? `<div class="exh-desc">${ex.desc}</div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
      <span class="${evCountClass}">${evCountStr}</span>
      ${ex.events.length>0?`<span class="exh-toggle-arrow">▼</span>`:''}
      ${ex.slug?`<a href="https://www.3daysofdesign.dk/exhibition/${ex.slug}" target="_blank" style="font-size:9px;color:var(--rust);font-family:Space Mono,monospace;text-decoration:none" onclick="event.stopPropagation()">↗ 공식</a>`:''}
    </div>`;

  // 주소 📍 클릭 → 지도 핀 (이벤트 전파 차단)
  const addrPin = head.querySelector('.exh-addr-pin');
  if(addrPin) addrPin.addEventListener('click', e=>{ e.stopPropagation(); showExhPin(ex); });

  // 열린 상태 복원
  if(isOpen) card.classList.add('open');

  // 카드 헤더 클릭 → 이벤트 목록 토글 + 지도 핀
  head.addEventListener('click',()=>{
    showExhPin(ex);
    if(ex.events.length > 0){
      const key = ex.slug||ex.brand;
      if(exhOpenSet.has(key)) exhOpenSet.delete(key); else exhOpenSet.add(key);
      card.classList.toggle('open');
    }
  });

  card.appendChild(head);

  /* 이벤트 목록 */
  if(ex.events.length > 0){
    const evList = document.createElement('div');
    evList.className = 'exh-events';

    const displayEvs = exhDayFilter!=='all' ? evs : ex.events;

    displayEvs.forEach(ev=>{
      const row = document.createElement('div');
      row.className = 'exh-ev-row' + (ev.joint?' joint-ev':'');

      const dayColor = EXH_DAY_COLORS[ev.day]||'#888';
      const endStr = ev.end ? `–${ev.end}` : '';
      const locHtml = ev.location ? `<div class="exh-ev-loc">📍 ${ev.location}</div>` : '';
      const jointBadge = ev.joint ? `<span class="exh-joint-badge">공동</span>` : '';
      const evUrl = ev.id ? `https://www.3daysofdesign.dk/event/${ev.id}` : '';

      const catTags = `<span class="exh-ev-tag" style="background:${ev.color||'#888'}">${ev.icon||''} ${ev.label||''}</span>`;

      // 6/10=dayIdx 2, 6/11=3, 6/12=4
      const festDayIdx = ev.day === 10 ? 2 : ev.day === 11 ? 3 : ev.day === 12 ? 4 : -1;
      const alreadyIn = festDayIdx >= 0 && plan[festDayIdx]?.items.some(it => it.title === ev.title);

      row.innerHTML = `
        <span class="exh-day-chip" style="background:${dayColor}">6/${ev.day}</span>
        <div class="exh-ev-time">${ev.start}${endStr}</div>
        <div class="exh-ev-body">
          <div class="exh-ev-title">${hl(ev.title)}${jointBadge}</div>
          <div class="exh-ev-tags">${catTags}</div>
          ${locHtml}
        </div>
        <div class="exh-ev-actions">
          ${evUrl?`<a href="${evUrl}" target="_blank" class="exh-link-btn" onclick="event.stopPropagation()">↗</a>`:''}
          <button class="exh-add-btn${alreadyIn?' done':''}" title="${alreadyIn?'이미 일정에 있음':'일정에 추가'}">${alreadyIn?'✓':'+'}</button>
        </div>`;

      // 행 클릭 → AI 팝업 (+ 버튼 클릭은 별도 처리)
      row.addEventListener('click', e=>{
        if(e.target.closest('.exh-add-btn,.exh-day-sel,.exh-link-btn')) return;
        openExhEvModal(ev, ex);
      });

      // 일정 추가 버튼 클릭
      const addBtn = row.querySelector('.exh-add-btn');
      if(!alreadyIn){
        addBtn.addEventListener('click', e=>{
          e.stopPropagation();
          // 이미 열린 셀렉터 닫기
          const existing = row.querySelector('.exh-day-sel');
          if(existing){ existing.remove(); return; }

          const sel = document.createElement('div');
          sel.className = 'exh-day-sel';

          // 이벤트 날짜에 해당하는 plan dayIdx를 기본 선택
          const defaultDi = festDayIdx >= 0 ? festDayIdx : 2;
          sel.innerHTML = `
            <select class="exh-day-select">${plan.map((d,di)=>`<option value="${di}"${di===defaultDi?' selected':''}>${d.date} · ${d.tag}</option>`).join('')}</select>
            <button class="exh-day-confirm">추가</button>
            <button class="exh-day-cancel">✕</button>`;

          sel.addEventListener('click', e=>e.stopPropagation());

          sel.querySelector('.exh-day-confirm').addEventListener('click', ()=>{
            const di = +sel.querySelector('select').value;
            if(plan[di].items.some(it=>it.title===ev.title)){
              sel.remove();
              return;
            }
            // 이벤트 카테고리 → dist 태그 매핑
            const distTag = ex.district || '';
            plan[di].items.push({
              time: ev.start || '미정',
              title: ev.title,
              note: `${ex.brand}${ex.address?` · ${ex.address}`:''}`,
              dist: distTag,
              _user: true,
              _addedBy: currentUser,
              _personal: false,
              _with: ['miju','sanghyo'],
              _dk: ex.district,
            });
            sortDayByTime(di);
            savePlan();
            sel.remove();
            // 버튼을 ✓ 완료 표시로 변경
            addBtn.textContent = '✓';
            addBtn.classList.add('done');
            addBtn.disabled = true;
            // 토스트
            const t = document.createElement('div');
            t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2e6b2e;color:#fff;padding:9px 16px;border-radius:6px;font-size:12px;font-family:Space Mono,monospace;z-index:9999;pointer-events:none;white-space:nowrap';
            t.textContent=`✓ ${plan[di].date}에 추가됨`;
            document.body.appendChild(t);
            setTimeout(()=>t.remove(), 2200);
          });

          sel.querySelector('.exh-day-cancel').addEventListener('click', ()=>sel.remove());
          row.appendChild(sel);
        });
      }

      evList.appendChild(row);
    });

    card.appendChild(evList);
  }

  return card;
}

/* ---------- OPTIMIZER ENGINE ---------- */
// 날짜 인덱스 ↔ 페스티벌 매핑 (DEFAULT_PLAN 기준: 0출발 1도착 2~4페스티벌 5~8자유 9귀국)
const FEST_DAYS = [2,3,4];           // 6/10,6/11,6/12
const FREE_DAYS = [5,6,7];           // 6/13~6/15 (6/16은 출국일이라 제외)
const ARRIVAL_DAY = 1;               // 6/9 오후
// 각 페스티벌 날에 이미 배정된 지구 (동선 묶음용)
function districtsOnDay(di){
  const set=new Set();
  plan[di].items.forEach(it=>{ if(it._dk) set.add(it._dk); });
  return set;
}
// 지구 간 거리(좌표 기반) → 가장 가까운 지구 키
function nearestDistrict(lat,lng){
  let best=null,bd=1e9;
  DISTRICTS.forEach(d=>{
    const dd=Math.hypot(d.lat-lat,d.lng-lng);
    if(dd<bd){bd=dd;best=d;}
  });
  return {key:best.key, dist_km:Math.round(bd*111*10)/10, district:best};
}
// 두 지구 좌표 거리(km)
function kmBetween(a,b){return Math.hypot(a.lat-b.lat,a.lng-b.lng)*111;}

// 핵심: 추출된 장소(place)를 최적의 날/시간에 배치
function placeOptimally(place){
  // place: {title, lat, lng, districtKey, isFestival, preferTime, note, source}
  const dk = place.districtKey || (place.lat? nearestDistrict(place.lat,place.lng).key : null);
  let targetDay=null, reason='';

  // 1) 페스티벌 프로그램이면 → 같은 지구가 배정된 페스티벌 날 우선, 없으면 가장 가까운 지구의 날
  if(place.isFestival){
    let dayWithSame = FEST_DAYS.find(di=>districtsOnDay(di).has(dk));
    if(dayWithSame!=null){ targetDay=dayWithSame; reason='같은 지구 방문일에 묶음'; }
    else {
      // 지구별로 어느 페스티벌 날에 가는지 찾아 가장 가까운 지구의 날 선택
      let bestDi=FEST_DAYS[0], bd=1e9;
      FEST_DAYS.forEach(di=>{
        districtsOnDay(di).forEach(k=>{
          const A=DISTRICTS.find(x=>x.key===k), B=DISTRICTS.find(x=>x.key===dk);
          if(A&&B){const d=kmBetween(A,B); if(d<bd){bd=d;bestDi=di;}}
        });
      });
      targetDay=bestDi; reason='가장 가까운 지구의 페스티벌 날에 배치';
    }
  } else {
    // 2) 비페스티벌(상시 관광지/미술관 등) → 가장 가까운 지구가 배정된 날이 있으면 거기, 없으면 자유일 중 가장 한가한 날
    let dayWithSame = [...FEST_DAYS,...FREE_DAYS].find(di=>districtsOnDay(di).has(dk));
    if(dayWithSame!=null && dk){ targetDay=dayWithSame; reason='인접 지구 방문일에 묶음'; }
    else {
      // 자유일 중 항목 수가 가장 적은 날
      let bestDi=FREE_DAYS[0], bc=1e9;
      FREE_DAYS.forEach(di=>{ const c=plan[di].items.length; if(c<bc){bc=c;bestDi=di;} });
      targetDay=bestDi; reason='자유일 중 여유 있는 날에 배치';
    }
  }

  // 시간 결정: preferTime 있으면 사용, 없으면 해당 날 마지막 시간 뒤 슬롯
  const transportIcon = {도보:'🚶',자전거:'🚴',대중교통:'🚌',지하철:'🚇'}[place.transport]||'';
  const newItem={
    time: place.preferTime || suggestTime(targetDay),
    title: place.title,
    note: place.note || '',
    dist: [transportIcon, dk ? ('↔ '+(DISTRICTS.find(d=>d.key===dk)?.name||'')) : ''].filter(Boolean).join(' '),
    _dk: dk,
    _user: true,
    _lat: place.lat, _lng: place.lng
  };
  plan[targetDay].items.push(newItem);
  sortDayByTime(targetDay);
  return {day:targetDay, dateLabel:plan[targetDay].date, reason, districtKey:dk};
}

// 시간 문자열을 분으로 (정렬용). "오전/오후/종일" 등은 적당히 매핑
/* ── 드래그 후 시간 역순 경고 ── */
function checkDragOrder(di, movedItem){
  const items = plan[di].items;
  const warnings = [];
  const movedT = timeToMin(movedItem.time);
  const movedIdx = items.indexOf(movedItem);

  // 앞뒤 항목과 시간 비교
  const prev = items[movedIdx - 1];
  const next = items[movedIdx + 1];
  const pt = prev ? timeToMin(prev.time) : -1;
  const nt = next ? timeToMin(next.time) : 9999;

  if(movedT < 9000 && pt < 9000 && movedT < pt)
    warnings.push(`⏰ <b>${movedItem.time}</b> "${clip(movedItem.title)}"이 앞 일정 <b>${prev.time}</b> 보다 이릅니다`);
  if(movedT < 9000 && nt < 9000 && movedT > nt)
    warnings.push(`⏰ <b>${movedItem.time}</b> "${clip(movedItem.title)}"이 뒤 일정 <b>${next.time}</b> 보다 늦습니다`);

  // 고정 항목 30분 이내
  items.forEach((it,i)=>{
    if(!it._fixed || i===movedIdx) return;
    const gap = Math.abs(timeToMin(it.time) - movedT);
    if(movedT < 9000 && gap < 30)
      warnings.push(`🔒 고정 일정 "${clip(it.title)}" (${it.time})과 ${gap}분 간격 — 빠듯합니다`);
  });

  // 같은 날 전체 시간 역순 개수
  let inversions = 0;
  for(let i=0;i<items.length-1;i++){
    const a=timeToMin(items[i].time), b=timeToMin(items[i+1].time);
    if(a<9000 && b<9000 && a>b) inversions++;
  }
  if(inversions > 0 && warnings.length === 0)
    warnings.push(`⚠ 이 날 시간 순서가 맞지 않는 항목이 ${inversions}개 있습니다`);

  if(warnings.length) showDragToast(warnings, di);
}

function clip(s){ return (s||'').length > 12 ? s.slice(0,12)+'…' : s; }

function showHoursToast(warnings){
  document.getElementById('hoursToast')?.remove();
  const t = document.createElement('div');
  t.id = 'hoursToast';
  t.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:#7a4a1e;color:var(--cream);
    padding:12px 16px;border-radius:8px;max-width:320px;width:90%;
    z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.35);
    font-size:12px;line-height:1.55;animation:slideUp .2s ease`;
  t.innerHTML = `<div style="font-weight:700;margin-bottom:4px">🕐 영업시간 확인 필요</div>
    <div style="opacity:.9">${warnings.join('<br>')}</div>
    <button onclick="this.parentElement.remove()" style="margin-top:8px;padding:4px 12px;background:rgba(255,255,255,.2);border:none;border-radius:3px;color:#fff;cursor:pointer;font-size:11px;width:100%">확인</button>`;
  document.body.appendChild(t);
  setTimeout(()=>t?.remove(), 9000);
}

function showDragToast(warnings, di){
  document.getElementById('dragToast')?.remove();
  const t = document.createElement('div');
  t.id = 'dragToast';
  t.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:var(--ink);color:var(--cream);
    padding:12px 16px;border-radius:8px;max-width:320px;width:90%;
    z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.35);
    font-size:12px;line-height:1.55;animation:slideUp .2s ease`;
  t.innerHTML = `
    <div style="margin-bottom:8px">${warnings.join('<br>')}</div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button id="toastSort" style="flex:1;padding:5px;background:var(--sage);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Space Mono',monospace">⇅ 시간순 정렬</button>
      <button id="toastKeep" style="flex:1;padding:5px;background:rgba(255,255,255,.15);color:var(--cream);border:none;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Space Mono',monospace">순서 유지</button>
    </div>`;
  document.body.appendChild(t);
  t.querySelector('#toastSort').onclick = ()=>{ sortDayByTime(di); savePlan(); renderPlan(); t.remove(); };
  t.querySelector('#toastKeep').onclick = ()=>t.remove();
  setTimeout(()=>t?.remove(), 7000);
}

function selectAll(el){ const r=document.createRange(); r.selectNodeContents(el); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); }

function timeToMin(t){
  if(!t) return 9999;
  t=t.trim();
  const m=t.match(/(\d{1,2}):(\d{2})/);
  if(m) return (+m[1])*60+(+m[2]);
  if(t.includes('오전')) return 9*60;
  if(t.includes('오후')) return 14*60;
  if(t.includes('저녁')) return 19*60;
  if(t.includes('종일')) return 8*60;
  if(t.startsWith('~')){const mm=t.match(/(\d{1,2}):(\d{2})/);return mm?(+mm[1])*60+(+mm[2]):9999;}
  return 9999;
}
function sortDayByTime(di){
  plan[di].items.sort((a,b)=>timeToMin(a.time)-timeToMin(b.time));
  recalcTransitNotes(di);
}

// ← 이동 note 자동 재계산
// note가 "← [이전제목]에서 ..." 패턴이면 실제 이전 항목 기준으로 갱신
const TRANSIT_NOTE_RE = /^←\s*.+에서\s*/;
function recalcTransitNotes(di){
  const items = plan[di].items;
  for(let i=1; i<items.length; i++){
    const it = items[i];
    if(!it.note || !TRANSIT_NOTE_RE.test(it.note)) continue;
    // 좌표 있는 이전 항목 탐색
    let prevIt = null;
    for(let j=i-1; j>=0; j--){ if(getItemCoords(items[j])){ prevIt=items[j]; break; } }
    if(!prevIt) continue;
    const prevCoords = getItemCoords(prevIt);
    // 현재 항목 좌표 (숙소복귀 등은 좌표 없을 수 있음 → 숙소 기본값)
    let myCoords = getItemCoords(it);
    if(!myCoords){
      // 숙소복귀류 → 숙소 좌표 사용
      const isHome = /숙소|복귀|호텔|airbnb/i.test(it.title);
      if(isHome) myCoords = {lat:55.6671, lng:12.5519};
      else continue;
    }
    const t = transportBetween(prevCoords, myCoords);
    it.note = `← ${prevIt.title}에서 ${t.icon} ${t.label} ~${t.mins}분`;
  }
}
// 빈 시간 슬롯 추천: 마지막 구체 시간 +2시간
function suggestTime(di){
  const times=plan[di].items.map(it=>timeToMin(it.time)).filter(v=>v<9999&&v>=8*60&&v<22*60);
  if(!times.length) return '10:00';
  const last=Math.max(...times)+120;
  const h=Math.min(20,Math.floor(last/60)), mm=last%60;
  return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');
}

/* ---------- API: 입력 → 구조화된 장소 추출 ---------- */
// 잘 알려진 코펜하겐 장소 사전 → API 호출 없이 즉시 매칭 (비용 절감)
const KNOWN_PLACES = {
  'noma':        {title:'Noma',                   lat:55.6925, lng:12.6100, districtKey:'holmen',  isFestival:false, note:'세계적 파인다이닝 · 예약 필수'},
  'tivoli':      {title:'Tivoli Gardens',         lat:55.6736, lng:12.5681, districtKey:'kongens', isFestival:false, note:'중앙역 옆 놀이공원'},
  '티볼리':       {title:'Tivoli Gardens',         lat:55.6736, lng:12.5681, districtKey:'kongens', isFestival:false, note:'중앙역 옆 놀이공원'},
  'nyhavn':      {title:'Nyhavn',                  lat:55.6797, lng:12.5913, districtKey:'kongens', isFestival:false, note:'운하·컬러풀 건물'},
  '뉘하운':       {title:'Nyhavn',                  lat:55.6797, lng:12.5913, districtKey:'kongens', isFestival:false, note:'운하·컬러풀 건물'},
  'hay house':   {title:'Hay House',              lat:55.6794, lng:12.5797, districtKey:'kongens', isFestival:false, note:'덴마크 디자인 플래그십'},
  'illums':      {title:'Illums Bolighus',        lat:55.6789, lng:12.5800, districtKey:'kongens', isFestival:false, note:'디자인 백화점'},
  'designmuseum':{title:'Designmuseum Danmark',   lat:55.6866, lng:12.5928, districtKey:'frederik',isFestival:true,  note:'덴마크 디자인뮤지엄'},
  'louisiana':   {title:'Louisiana 현대미술관',     lat:55.9695, lng:12.5430, districtKey:null,      isFestival:false, note:'기차 약 35분 근교'},
  'reffen':      {title:'Reffen 스트리트푸드',       lat:55.6915, lng:12.6045, districtKey:'holmen',  isFestival:false, note:'대형 푸드마켓'},
  'absalon':     {title:'Folkehuset Absalon',     lat:55.6654, lng:12.5503, districtKey:null,      isFestival:false, note:'베스테르브로 커뮤니티 다이닝'},
  'torvehallerne':{title:'Torvehallerne',         lat:55.6836, lng:12.5713, districtKey:'rosen',   isFestival:false, note:'푸드마켓'},
  'rundetaarn':  {title:'Rundetårn (둥근탑)',       lat:55.6814, lng:12.5757, districtKey:'kultur',  isFestival:false, note:'전망대'},
  '인어공주':      {title:'Little Mermaid',          lat:55.6929, lng:12.5993, districtKey:'frederik',isFestival:false, note:'동상'},
};
function checkKnown(raw){
  const q=raw.toLowerCase().trim();
  for(const k in KNOWN_PLACES){ if(q.includes(k)){ return {...KNOWN_PLACES[k], preferTime:null, source:'사전(무료)'}; } }
  return null;
}
// 분석 결과 캐시 (같은 입력 재분석 방지)
const EXTRACT_CACHE={};

// 코펜하겐 유효 좌표 범위 검증 (AI 좌표 오류 방어)
function isCphCoord(lat, lng){
  return typeof lat==='number' && typeof lng==='number'
    && lat>=55.4 && lat<=56.1 && lng>=11.9 && lng<=12.9;
}

// claude.ai 아티팩트 환경인지 감지 (배포 시엔 /api/extract 사용)
const ON_CLAUDE = location.hostname.endsWith('claude.ai') || location.hostname.endsWith('claudeusercontent.com');

async function extractPlace(rawText){
  // 1) 캐시
  if(EXTRACT_CACHE[rawText]) return {...EXTRACT_CACHE[rawText]};
  // 2) 사전 (API 호출 0)
  const known=checkKnown(rawText);
  if(known){ EXTRACT_CACHE[rawText]=known; return {...known}; }

  const districtList = DISTRICTS.map(d=>`${d.key}: ${d.name} (${d.desc})`).join('\n');
  const sys = `You are a Copenhagen travel assistant. Extract place/event info from user input (Korean or English) and output ONLY JSON — no markdown, no explanation.
Copenhagen 8 design districts:
${districtList}

Rules:
- title: place/event name (keep original language or translate naturally, be concise)
- lat,lng: Copenhagen coordinates if known (numbers), else null
- districtKey: closest/most relevant district key from the 8 above, null if unclear
- isFestival: true if related to 3 Days of Design festival (6/10~12) showrooms/exhibitions/talks, false for general sights/restaurants
- preferTime: explicit time → "HH:MM", else null
- note: one-line memo (feature/address hint), "" if none
For URLs, infer from domain/slug. Make reasonable guesses; use null when truly unknown.
Output format: {"title":"","lat":null,"lng":null,"districtKey":null,"isFestival":false,"preferTime":null,"note":"","transport":"도보"|"자전거"|"대중교통"|"지하철" (recommended way to reach this place from city center)}
For transport: under 700m→도보, 700m-2.5km→자전거, 2.5-6km→대중교통, over 6km or suburb→지하철`;

  let txt;
  if(ON_CLAUDE){
    // claude.ai 아티팩트: 키 없이 직접 호출
    const resp = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,system:sys,messages:[{role:"user",content:rawText}]})
    });
    if(!resp.ok) throw new Error('API '+resp.status);
    const data=await resp.json();
    txt=data.content.filter(c=>c.type==='text').map(c=>c.text).join('').trim();
  } else {
    // 배포 환경: 서버리스 함수(/api/extract)가 키를 안전하게 보관하고 대신 호출
    const resp = await fetch("/api/extract",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({system:sys, input:rawText})
    });
    if(!resp.ok) throw new Error('서버 '+resp.status);
    const data=await resp.json();
    txt=(data.text||'').trim();
  }
  txt=txt.replace(/```json|```/g,'').trim();
  const obj=JSON.parse(txt);
  if(!isCphCoord(obj.lat, obj.lng)){ obj.lat=null; obj.lng=null; }
  obj.source = rawText.startsWith('http')?'링크':'입력';
  // LRU-lite: 50개 초과 시 가장 오래된 항목 제거
  if(Object.keys(EXTRACT_CACHE).length>=50) delete EXTRACT_CACHE[Object.keys(EXTRACT_CACHE)[0]];
  EXTRACT_CACHE[rawText]=obj;
  return obj;
}

/* ---------- RENDER: ADD-PLACE TAB ---------- */
function renderAdd(){
  const el=document.getElementById('scroll');
  el.innerHTML=`<div class="add-wrap">
    <h3>장소 추가 · 일정 수정</h3>
    <p class="lead">장소명·링크를 입력하면 최적 일정에 추가하고, 수정 요청을 입력하면 일정을 업데이트합니다.<br><b>한국어·영어 모두 가능해요.</b></p>

    <label class="field-label">장소 / 수정 요청 / 링크</label>
    <textarea class="add-input" id="addInput" placeholder="예) Hay House 플래그십 스토어&#10;예) Add Noma restaurant to the schedule&#10;예) 6/11 일정에서 Islands Brygge 시간을 오후 2시로 바꿔줘&#10;예) https://www.3daysofdesign.dk/..."></textarea>

    <div class="quick">
      <button data-q="Designmuseum Danmark">디자인뮤지엄</button>
      <button data-q="Hay House flagship store">Hay House</button>
      <button data-q="Tivoli Gardens">티볼리</button>
      <button data-q="Reffen street food market">Reffen</button>
      <button data-q="Fritz Hansen showroom">Fritz Hansen</button>
      <button data-q="Nyhavn 운하 산책">뉘하운</button>
    </div>

    <button class="add-btn" id="addBtn">✦ 분석해서 반영하기</button>
    <p class="hint">장소 추가: 이름·링크 입력 → 최적 날짜/시간에 자동 배치 (충돌 시 선택 카드 표시)<br>일정 수정: "~바꿔줘", "change/move/delete" 등 수정 의도 입력 → 전체 일정 업데이트</p>

    <div id="addStatus"></div>
  </div>`;

  // 위시리스트 섹션 동적 추가
  const wishWrap = document.createElement('div');
  wishWrap.className = 'add-wrap wish-section';
  wishWrap.innerHTML = `
    <h4>가고싶은 곳 목록</h4>
    <p class="lead">날짜 미정이지만 가보고 싶은 장소를 메모해두세요. 나중에 날짜를 정해 일정에 옮길 수 있어요.</p>
    <div class="wish-add-row">
      <div class="wish-input-wrap">
        <div class="wish-mode-tabs">
          <button class="wish-mode-tab active" id="wishModeSearch">🔍 이름 검색</button>
          <button class="wish-mode-tab" id="wishModeLink">🗺 Google Maps 링크</button>
        </div>
        <div id="wishSearchPanel">
          <input class="wish-input" id="wishTitle" placeholder="장소명 (3글자 이상)" maxlength="60" autocomplete="off">
          <div class="wish-suggest" id="wishSuggest" style="display:none"></div>
        </div>
        <div id="wishLinkPanel" style="display:none">
          <input class="wish-input" id="wishGmapsUrl" placeholder="Google Maps URL 붙여넣기..." autocomplete="off">
          <div id="wishLinkPreview" style="display:none;margin-top:5px">
            <input class="wish-input" id="wishGmapsName" placeholder="장소명 직접 입력..." autocomplete="off" maxlength="60" style="background:#f0f8f4;border-color:var(--sage)">
            <div id="wishLinkCoords" style="font-size:10px;color:var(--sage);padding:3px 4px;font-family:'Space Mono',monospace"></div>
          </div>
        </div>
      </div>
      <input class="wish-note-input" id="wishNote" placeholder="메모 (선택)" maxlength="80">
      <button class="wish-add-btn" id="wishAddBtn">＋ 추가</button>
    </div>
    <label class="wish-fest-toggle">
      <input type="checkbox" id="wishFestOnly">
      <span>🎪 <b>3 Days of Design</b> 기간(6/10~12)에만 방문 가능한 곳</span>
    </label>
    <div class="wish-list" id="wishList"></div>`;
  el.querySelector('.add-wrap').insertAdjacentElement('afterend', wishWrap);

  // ── 카테고리 감지 ──
  function detectWishCat(title='', note=''){
    const t=(title+' '+note).toLowerCase();
    if(/카페|cafe|café|coffee|roast|bageri|bager|빵|bakery/.test(t))  return {icon:'☕',label:'카페·베이커리',color:'#8b5e3c'};
    if(/식당|레스토랑|restaurant|fiskebar|bistro|bodega|dinner|spiseri|tavern/.test(t)) return {icon:'🍽',label:'식당·바',color:'#c8492a'};
    if(/bar|wine|øl|beer|cocktail|vinbar/.test(t))                    return {icon:'🍷',label:'바·드링크',color:'#7a3e8f'};
    if(/쇼룸|showroom|galleri|gallery|갤러리|design|udstilling/.test(t)) return {icon:'🏛',label:'디자인·갤러리',color:'#2f6b6b'};
    if(/museum|museet|미술관|박물관|kunsthal|kunstmuseum/.test(t))      return {icon:'🖼',label:'미술관',color:'#5d7456'};
    if(/park|strand|beach|해변|공원|garden|have|skov/.test(t))         return {icon:'🌿',label:'자연·공원',color:'#5d7456'};
    if(/shop|store|쇼핑|상점|스토어|market|marked|butik/.test(t))      return {icon:'🛍',label:'쇼핑',color:'#9b7ab5'};
    if(/hotel|hostel|숙소|airbnb/.test(t))                            return {icon:'🏠',label:'숙소',color:'#7a7a7a'};
    return {icon:'📍',label:'장소',color:'#7a7a7a'};
  }

  // ── Google Maps URL 파서 ──
  function parseGmapsUrl(url){
    try{
      // /place/NAME/@LAT,LNG,ZOOMz
      const pm=url.match(/\/place\/([^/@+]+)(?:\+([^/@]*))*\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if(pm){
        const raw=pm[1].replace(/\+/g,' ');
        const name=decodeURIComponent(raw);
        return {title:name, _lat:+pm[3], _lng:+pm[4], _gmapsUrl:url,
                address:`${pm[3].substring(0,8)}, ${pm[4].substring(0,8)}`};
      }
      // /@LAT,LNG
      const cm=url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if(cm) return {title:'', _lat:+cm[1], _lng:+cm[2], _gmapsUrl:url, address:''};
      // ?q= or query=
      const qm=url.match(/[?&](?:q|query)=([^&]+)/);
      if(qm) return {title:decodeURIComponent(qm[1].replace(/\+/g,' ')), _gmapsUrl:url, address:''};
      return {title:'', _gmapsUrl:url, address:''};
    }catch(e){ return null; }
  }

  // ── 확정 장소 임시 저장 ──
  let _wishConfirmed = null;

  // ── 위시리스트 렌더링 ──
  function renderWishList(){
    const list = document.getElementById('wishList');
    if(!list) return;
    if(wishlist.length===0){
      list.innerHTML='<div class="wish-empty">아직 추가된 장소가 없어요.</div>';
      return;
    }
    list.innerHTML='';
    wishlist.forEach((w,idx)=>{
      const cat = detectWishCat(w.title, w.note);
      const item = document.createElement('div');
      item.className='wish-item';
      const gmapLink = w._gmapsUrl
        ? `<a href="${w._gmapsUrl}" target="_blank" style="font-size:10px;color:var(--rust);text-decoration:none;margin-left:6px;font-family:'Space Mono',monospace" onclick="event.stopPropagation()">지도↗</a>`
        : '';
      // 주소: 좌표 문자열이면 숨김, 실제 주소명만 표시
      const addrText = w.address && !/^\d{2}\.\d/.test(w.address) ? w.address : '';
      const FEST_DI = [2,3,4]; // 6/10, 6/11, 6/12
      // _festOnly 토글 상태: item에서 변경 가능하도록 let
      let isFestOnly = !!w._festOnly;

      item.innerHTML=`
        <div class="wish-item-body">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px;flex-wrap:wrap">
            <span class="wish-item-cat" style="background:${cat.color}">${cat.icon} ${cat.label}</span>
            ${isFestOnly?`<span class="wish-fest-badge">🎪 3DoD 전용</span>`:''}
          </div>
          <div class="wish-item-title">${w.title}${gmapLink}</div>
          ${addrText?`<div class="wish-item-addr">📌 ${addrText}</div>`:''}
          ${w.note?`<div class="wish-item-note">${w.note}</div>`:''}
          <label class="wish-fest-toggle" style="margin-top:5px">
            <input type="checkbox" class="wish-fest-cb" ${isFestOnly?'checked':''}>
            <span style="font-size:10.5px;color:var(--slate)">🎪 3DoD 기간(6/10~12)에만 방문 가능</span>
          </label>
          <div class="wish-item-actions">
            <button class="wish-to-plan-btn">→ 일정에 추가</button>
            <button class="wish-del-btn">삭제</button>
          </div>
          <div class="wish-day-row" id="wish-day-row-${idx}">
            <div>
              <div class="wish-day-row-label">날짜 선택 ${isFestOnly?'<span style="color:var(--rust);font-size:9px">· 3DoD 날짜 우선 표시</span>':''}</div>
              <div class="wish-day-row-row">
                <select class="wish-day-select" id="wish-day-sel-${idx}">
                  ${plan.map((d,di)=>{
                    const isFest=FEST_DI.includes(di);
                    return `<option value="${di}"${isFestOnly&&di===FEST_DI[0]?' selected':''}${!isFestOnly&&di===2?' selected':''}>${isFest?'🎪 ':''}${d.date} · ${d.tag}</option>`;
                  }).join('')}
                </select>
              </div>
            </div>
            <div>
              <div class="wish-day-row-label">방문 시간</div>
              <div class="wish-time-chips" id="wish-time-chips-${idx}"></div>
            </div>
            <div class="wish-travel-hint" id="wish-travel-${idx}" style="display:none"></div>
            <div class="wish-day-row-row">
              <button class="wish-day-confirm">✓ 일정에 추가</button>
              <button class="wish-del-btn" style="background:none;color:var(--slate);border:1px solid var(--line);font-size:10px;padding:4px 8px;cursor:pointer">취소</button>
            </div>
          </div>
        </div>`;

      // 날짜 변경 → 시간칩 + 이동 힌트 업데이트
      function updateDayPanel(di){
        const suggested = suggestTime(di);
        const chips = document.getElementById(`wish-time-chips-${idx}`);
        const travelEl = document.getElementById(`wish-travel-${idx}`);

        // 시간 칩: 제안 시간 기준 ±1시간 옵션
        const baseMin = (() => { const m=suggested.match(/(\d+):(\d+)/); return m ? +m[1]*60+ +m[2] : 10*60; })();
        const times = [-60,0,60,120].map(d=>{ const t=baseMin+d; return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'); })
          .filter(t=>{ const h=+t.split(':')[0]; return h>=8&&h<=21; });
        times.push('미정');
        chips.innerHTML = times.map((t,i)=>`<button class="wish-time-chip${i===1?' active':''}" data-t="${t}">${t}</button>`).join('');
        chips.querySelectorAll('.wish-time-chip').forEach(b=>{
          b.onclick=()=>{ chips.querySelectorAll('.wish-time-chip').forEach(x=>x.classList.remove('active')); b.classList.add('active'); };
        });

        // 이동 힌트: w 좌표 있으면 해당 날 마지막 좌표 항목에서 이동시간 계산
        if(w._lat && w._lng){
          const dayItems = plan[di].items;
          let prevIt=null;
          for(let i=dayItems.length-1;i>=0;i--){ if(getItemCoords(dayItems[i])){ prevIt=dayItems[i]; break; } }
          if(prevIt){
            const pc=getItemCoords(prevIt);
            const t=transportBetween(pc,{lat:w._lat,lng:w._lng});
            travelEl.style.display='block';
            travelEl.textContent=`${prevIt.title}에서 ${t.icon} ${t.label} ~${t.mins}분 (${t.km.toFixed(1)}km)`;
          } else { travelEl.style.display='none'; }
        } else { travelEl.style.display='none'; }
      }

      // _festOnly 체크박스 토글 (저장 + 뱃지 즉시 반영)
      item.querySelector('.wish-fest-cb').addEventListener('change', function(){
        isFestOnly = this.checked;
        wishlist[idx]._festOnly = isFestOnly;
        saveWishlist();
        // 뱃지 업데이트
        const badgeWrap = item.querySelector('.wish-item-body > div:first-child');
        const existing = badgeWrap.querySelector('.wish-fest-badge');
        if(isFestOnly && !existing){
          const b=document.createElement('span'); b.className='wish-fest-badge'; b.textContent='🎪 3DoD 전용';
          badgeWrap.appendChild(b);
        } else if(!isFestOnly && existing){ existing.remove(); }
        // 날짜 셀렉트 옵션 기본값 변경
        const sel=document.getElementById(`wish-day-sel-${idx}`);
        if(sel && isFestOnly) sel.value=String(FEST_DI[0]);
      });

      item.querySelector('.wish-to-plan-btn').addEventListener('click',()=>{
        const row=document.getElementById(`wish-day-row-${idx}`);
        const isOpen=row.classList.toggle('open');
        if(isOpen) updateDayPanel(+document.getElementById(`wish-day-sel-${idx}`).value);
      });
      item.querySelector(`#wish-day-sel-${idx}`).addEventListener('change',function(){
        updateDayPanel(+this.value);
      });

      // 삭제 버튼 (두 곳: 일반 + 패널 내 취소)
      item.querySelectorAll('.wish-del-btn').forEach(b=>{
        b.addEventListener('click',e=>{
          e.stopPropagation();
          // 패널 내 취소인지 확인
          if(b.textContent.trim()==='취소'){ document.getElementById(`wish-day-row-${idx}`).classList.remove('open'); return; }
          wishlist.splice(idx,1); saveWishlist(); renderWishList();
        });
      });

      item.querySelector('.wish-day-confirm').addEventListener('click',()=>{
        const di=+document.getElementById(`wish-day-sel-${idx}`).value;
        const chips=document.getElementById(`wish-time-chips-${idx}`);
        const activeChip=chips.querySelector('.wish-time-chip.active');
        const time=activeChip?.dataset.t==='미정'?'미정':(activeChip?.dataset.t||'미정');
        plan[di].items.push({
          time,title:w.title,note:w.note||'',dist:'',
          _user:true,_addedBy:currentUser,_personal:false,_with:['miju','sanghyo'],
          ...(w._lat&&{_lat:w._lat,_lng:w._lng}),
          ...(w._gmapsUrl&&{_gmapsUrl:w._gmapsUrl})
        });
        sortDayByTime(di); savePlan();
        wishlist.splice(idx,1); saveWishlist();
        currentVisDay = di;
        setTab('plan');
        requestAnimationFrame(()=>{
          document.getElementById(`body-${di}`)?.closest('.day')?.scrollIntoView({behavior:'smooth',block:'start'});
        });
      });
      list.appendChild(item);
    });
  }

  // ── 탭 전환 ──
  document.getElementById('wishModeSearch').addEventListener('click',()=>{
    document.getElementById('wishModeSearch').classList.add('active');
    document.getElementById('wishModeLink').classList.remove('active');
    document.getElementById('wishSearchPanel').style.display='';
    document.getElementById('wishLinkPanel').style.display='none';
    _wishConfirmed=null;
    document.getElementById('wishTitle').focus();
  });
  document.getElementById('wishModeLink').addEventListener('click',()=>{
    document.getElementById('wishModeLink').classList.add('active');
    document.getElementById('wishModeSearch').classList.remove('active');
    document.getElementById('wishLinkPanel').style.display='';
    document.getElementById('wishSearchPanel').style.display='none';
    _wishConfirmed=null;
    document.getElementById('wishGmapsUrl').focus();
  });

  // ── Google Maps URL 붙여넣기 ──
  document.getElementById('wishGmapsUrl').addEventListener('input', function(){
    const val=this.value.trim();
    const prev=document.getElementById('wishLinkPreview');
    if(!val||!val.startsWith('http')){ prev.style.display='none'; _wishConfirmed=null; return; }
    // 단축 URL 감지
    if(/maps\.app\.goo\.gl|goo\.gl\/maps/.test(val)){
      prev.style.display='block';
      document.getElementById('wishGmapsName').value='';
      document.getElementById('wishGmapsName').placeholder='장소명 직접 입력...';
      document.getElementById('wishLinkCoords').textContent='⚠ 단축 URL은 좌표를 읽을 수 없어요. 구글맵에서 장소를 열고 주소창의 전체 URL을 복사해 주세요.';
      document.getElementById('wishLinkCoords').style.color='#c8492a';
      _wishConfirmed={_gmapsUrl:val, address:''};
      document.getElementById('wishGmapsName').oninput=()=>{ if(_wishConfirmed) _wishConfirmed.title=document.getElementById('wishGmapsName').value.trim(); };
      return;
    }
    document.getElementById('wishLinkCoords').style.color='';
    const parsed=parseGmapsUrl(val);
    if(!parsed){ prev.style.display='none'; _wishConfirmed=null; return; }
    _wishConfirmed={...parsed, address:''}; // 좌표는 내부에만, address는 사용자가 입력
    prev.style.display='block';
    // 장소명 입력 필드 - 파싱된 이름으로 채우되 사용자가 직접 수정 가능
    const nameInput=document.getElementById('wishGmapsName');
    if(parsed.title) nameInput.value=parsed.title;
    else nameInput.value=''; nameInput.placeholder='장소명 직접 입력...';
    const coordEl=document.getElementById('wishLinkCoords');
    coordEl.textContent=parsed._lat?`📍 ${parsed._lat.toFixed(5)}, ${parsed._lng.toFixed(5)} · 지도 핀 연결됨`:'📍 좌표 없음 (이름으로 검색됩니다)';
    // 이름 입력 이벤트
    nameInput.oninput=()=>{ if(_wishConfirmed) _wishConfirmed.title=nameInput.value.trim(); };
    setTimeout(()=>{ if(!parsed.title) nameInput.focus(); }, 50);
  });

  // ── Nominatim 검색 (덴마크 한정) ──
  let _wishSearchTimer=null;
  async function searchWishPlace(query){
    const sug=document.getElementById('wishSuggest');
    if(!sug) return;
    if(query.length<3){ sug.style.display='none'; return; }
    sug.style.display='block';
    sug.innerHTML='<div class="wish-suggest-loading">검색 중...</div>';
    try{
      // countrycodes=dk + 코펜하겐 viewbox + bounded=1 로 덴마크 한정
      const q=encodeURIComponent(query);
      const url=`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=6&addressdetails=1&countrycodes=dk&viewbox=12.3,55.55,12.75,55.82&bounded=0&accept-language=ko,en`;
      const res=await fetch(url,{headers:{'User-Agent':'cph-trip-planner/1.0'}});
      const data=await res.json();
      if(!data.length){ sug.innerHTML='<div class="wish-suggest-loading">덴마크에서 검색 결과 없음</div>'; return; }
      sug.innerHTML='';
      data.forEach(place=>{
        const name=place.namedetails?.name||place.namedetails?.['name:en']||place.display_name.split(',')[0];
        const addr=place.display_name.split(',').slice(1,3).join(', ').trim();
        const row=document.createElement('div');
        row.className='wish-suggest-item';
        const cat=detectWishCat(name);
        row.innerHTML=`<strong>${cat.icon} ${name}</strong><span>${addr}</span>`;
        row.addEventListener('mousedown',e=>{
          e.preventDefault();
          const gmUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+', Copenhagen')}`;
          _wishConfirmed={_lat:+place.lat,_lng:+place.lon,_gmapsUrl:gmUrl,address:addr};
          document.getElementById('wishTitle').value=name;
          sug.style.display='none';
          document.getElementById('wishNote').focus();
        });
        sug.appendChild(row);
      });
    }catch(e){ sug.innerHTML='<div class="wish-suggest-loading">검색 실패</div>'; }
  }

  const wishTitleEl=document.getElementById('wishTitle');
  wishTitleEl.addEventListener('input',()=>{
    _wishConfirmed=null;
    clearTimeout(_wishSearchTimer);
    _wishSearchTimer=setTimeout(()=>searchWishPlace(wishTitleEl.value.trim()),400);
  });
  wishTitleEl.addEventListener('blur',()=>{ setTimeout(()=>{ const s=document.getElementById('wishSuggest'); if(s) s.style.display='none'; },180); });

  // ── 추가 버튼 ──
  document.getElementById('wishAddBtn').addEventListener('click',()=>{
    const isLinkMode=document.getElementById('wishModeLink').classList.contains('active');
    let title='', confirmed=_wishConfirmed||{};
    if(isLinkMode){
      // 링크 모드: 이름 입력 필드 우선
      title=document.getElementById('wishGmapsName').value.trim()
           || confirmed.title
           || document.getElementById('wishNote').value.trim()
           || '새 장소';
      confirmed.title=title; // 저장용
    } else {
      title=wishTitleEl.value.trim();
    }
    if(!title) return;
    const note=document.getElementById('wishNote').value.trim();
    const festOnly = document.getElementById('wishFestOnly')?.checked || false;
    wishlist.unshift({title,note,addedBy:currentUser||'',addedAt:Date.now(),...confirmed,...(festOnly&&{_festOnly:true})});
    saveWishlist();
    wishTitleEl.value='';
    document.getElementById('wishGmapsUrl').value='';
    document.getElementById('wishNote').value='';
    document.getElementById('wishSuggest').style.display='none';
    document.getElementById('wishLinkPreview').style.display='none';
    const festEl=document.getElementById('wishFestOnly'); if(festEl) festEl.checked=false;
    _wishConfirmed=null;
    renderWishList();
  });
  wishTitleEl.addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('wishAddBtn').click(); });
  document.getElementById('wishGmapsUrl').addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('wishAddBtn').click(); });

  renderWishList();

  el.querySelectorAll('.quick button').forEach(b=>{
    b.addEventListener('click',()=>{ document.getElementById('addInput').value=b.dataset.q; });
  });
  document.getElementById('addBtn').addEventListener('click',runSmartAdd);
  document.getElementById('addInput').addEventListener('keydown', e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){ e.preventDefault(); runSmartAdd(); }
  });
}

/* 입력 의도 분류: 장소추가 vs 일정수정 */
function classifyIntent(raw){
  const modifyKw = /바꿔|수정|변경|삭제|이동|추가해줘|넣어줘|옮겨|고쳐|change|move|delete|update|remove|modify|reschedule|shift|cancel/i;
  return modifyKw.test(raw) ? 'modify' : 'add';
}

/* 충돌 감지: 이동시간 포함한 스마트 충돌 체크 */
function detectConflict(di, newTime, newCoords){
  if(!newTime) return null;
  const newMin = timeToMin(newTime);
  if(newMin>=9999) return null;

  return plan[di].items.find(it=>{
    const m = timeToMin(it.time);
    if(m>=9999) return false;
    // 고정 항목끼리는 스킵
    if(it._fixed) return false;
    // 새 항목이 기존 항목보다 이른 경우: 반대 방향이므로 스킵
    if(newMin < m) return false;

    const dur = estimateDuration(it);
    const itEnd = m + dur;
    const gap = newMin - itEnd;

    // 이동시간 계산
    let travelMins = 0;
    if(newCoords){
      const prevCoords = getItemCoords(it);
      if(prevCoords) travelMins = transportBetween(prevCoords, newCoords).mins;
    }

    return gap < travelMins + 10; // 여유가 이동시간+10분 미만이면 충돌
  }) || null;
}

/* 일정 전체 충돌 스캔 */
/* 항목 담당자 추출 — "[미주]", "[상효]" 등 앞 태그 */
function getPersonTag(it){
  return (it.title||'').match(/^\[([^\]]+)\]/)?.[1] || null;
}

/* 항목 예상 소요시간 (분) */
function estimateDuration(it){
  // 고정 항목(항공·공항이동 등)은 즉각적 — 시작 시각만 점유
  if(it._fixed) return 0;
  const txt = ((it.title||'')+(it.note||'')).toLowerCase();
  if(/check.?in|체크인|airbnb|숙소/.test(txt))   return 15;
  if(/checkout|체크아웃/.test(txt))               return 30;
  if(/공항|airport|이동/.test(txt))               return 0;   // 이동은 소요시간 없음
  if(/dinner|lunch|breakfast|dining|식사|다이닝|brunch|레스토랑/.test(txt)) return 90;
  if(/museum|전시|exhibition|미술관/.test(txt))   return 90;
  if(/tour|투어|walk|산책/.test(txt))             return 60;
  if(/yoga|wellness|breathwork/.test(txt))        return 45;
  return 30; // 토크·쇼룸 등 기본값
}

function scanAllConflicts(){
  const results = [];
  plan.forEach((day, di)=>{
    const items = day.items;
    for(let i=0; i<items.length-1; i++){
      const a = items[i], b = items[i+1];
      const tA = timeToMin(a.time), tB = timeToMin(b.time);
      if(tA>=9999 || tB>=9999) continue;

      // ① 다른 사람의 일정이면 충돌 아님 ([미주]↔[상효] 등)
      const pA = getPersonTag(a), pB = getPersonTag(b);
      if(pA && pB && pA !== pB) continue;

      // ② 둘 다 고정 항공편이면 스킵 (각자 비행기)
      if(a._fixed && b._fixed) continue;

      // ③ 항목 A 소요시간 + 이동시간 계산
      const aDur = estimateDuration(a);
      const aEnd = tA + aDur;

      // 이동시간: 좌표 있을 때만
      const cA = getItemCoords(a), cB = getItemCoords(b);
      let travelMins = 0;
      if(cA && cB){
        const t = transportBetween(cA, cB);
        travelMins = t.mins;
      }

      const needed = travelMins + 10; // 이동 + 여유 10분
      const gap = tB - aEnd;          // 실제 여유

      if(gap < needed){
        results.push({di, i, a, b, gap, needed, travelMins, day: day.date});
      }
    }
  });
  return results;
}

/* 일정 탭 상단에 충돌 경고 배너 표시 */
function renderConflictBanner(el){
  const conflicts = scanAllConflicts();
  if(!conflicts.length) return;
  const banner = document.createElement('div');
  banner.style.cssText='margin:8px 16px;padding:10px 12px;background:#fff3e0;border-left:3px solid #e65100;font-size:12px;line-height:1.5';
  banner.innerHTML=`<b>⚠ 시간 여유 부족 ${conflicts.length}건</b><br>`
    + conflicts.slice(0,3).map(c=>{
        const travelNote = c.travelMins>0 ? ` (이동 ${c.travelMins}분 포함)` : '';
        return `${c.day}: <b>${c.a.title}</b> → <b>${c.b.title}</b> — 여유 ${Math.max(0,c.gap)}분 · ${c.needed}분 필요${travelNote}`;
      }).join('<br>')
    + (conflicts.length>3 ? `<br><span style="opacity:.7">...외 ${conflicts.length-3}건</span>` : '');
  el.insertBefore(banner, el.firstChild);
}

/* 충돌 카드 표시 */
function showConflictCard(st, place, result, conflictItem){
  const distName = result.districtKey?(DISTRICTS.find(d=>d.key===result.districtKey)?.name||''):'';
  st.innerHTML=`
    <div class="conflict-card">
      <b>⚠ 일정 충돌</b><br>
      <b>${plan[result.day].date}</b> ${plan[result.day].items[0]?'':''}에 이미
      <b>"${conflictItem.title}" (${conflictItem.time})</b>이 있어요.<br>
      "${place.title}"을 어떻게 배치할까요?
      <div class="conflict-opts">
        <button class="conflict-btn primary" id="cfAddAnyway">이 날 그대로 추가</button>
        <button class="conflict-btn" id="cfPickDay">다른 날 선택 ▾</button>
        <button class="conflict-btn" id="cfCancel">취소</button>
      </div>
      <div id="cfDayPicker" style="display:none;margin-top:8px">
        <select style="width:100%;padding:6px;border:1.5px solid var(--ink);font-family:'Archivo';font-size:13px">
          ${plan.map((d,i)=>`<option value="${i}">${d.date} · ${d.tag}</option>`).join('')}
        </select>
        <button class="conflict-btn primary" style="margin-top:6px;width:100%" id="cfConfirmDay">이 날에 추가</button>
      </div>
    </div>`;

  st.querySelector('#cfAddAnyway').onclick = async()=>{
    plan[result.day].items.push(result._item);
    sortDayByTime(result.day);
    await savePlan(); addUserMarker(place);
    if(place.lat) map.flyTo([place.lat,place.lng],14,{duration:1});
    st.innerHTML=`<div class="status show"><b>✓ "${place.title}"</b> 추가 완료! → <b>${plan[result.day].date}</b></div>`;
  };
  st.querySelector('#cfPickDay').onclick = ()=>{
    const picker = st.querySelector('#cfDayPicker');
    picker.style.display = picker.style.display==='none'?'block':'none';
  };
  st.querySelector('#cfConfirmDay').onclick = async()=>{
    const sel = st.querySelector('select');
    const di = +sel.value;
    result._item.time = suggestTime(di);
    plan[di].items.push(result._item);
    sortDayByTime(di);
    await savePlan(); addUserMarker(place);
    if(place.lat) map.flyTo([place.lat,place.lng],14,{duration:1});
    st.innerHTML=`<div class="status show"><b>✓ "${place.title}"</b> → <b>${plan[di].date}</b>에 추가됐어요!</div>`;
  };
  st.querySelector('#cfCancel').onclick = ()=>{ st.innerHTML=''; };
}

async function runSmartAdd(){
  const input = document.getElementById('addInput');
  const btn = document.getElementById('addBtn');
  const st = document.getElementById('addStatus');
  const raw = input.value.trim();
  if(!raw){ input.focus(); return; }

  btn.disabled=true; btn.textContent='분석 중...';
  st.innerHTML=`<div class="status show"><span class="spin"></span> 분석 중이에요...</div>`;

  try{
    const intent = classifyIntent(raw);

    if(intent==='modify'){
      // 일정 수정 모드
      st.innerHTML=`<div class="status show"><span class="spin"></span> 일정을 수정하고 있어요...</div>`;
      const sys = `You are a Copenhagen trip plan editor. Given the current plan JSON and a modification request (Korean or English), output ONLY the updated full plan JSON array. No markdown, no explanation.
Rules: never delete _fixed:true items; preserve _user,_fixed,_lat,_lng,_dk fields; sort by time after changes.`;
      const planJson = JSON.stringify(plan.map(day=>({
        date:day.date,tag:day.tag,fest:day.fest,
        items:day.items.map(it=>({time:it.time,title:it.title,note:it.note,dist:it.dist,
          _fixed:it._fixed||undefined,_user:it._user||undefined,
          _lat:it._lat||undefined,_lng:it._lng||undefined,_dk:it._dk||undefined}))
      })));
      const resp = await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({system:sys,input:`Current plan:\n${planJson}\n\nRequest: ${raw}`,max_tokens:4000})});
      if(!resp.ok) throw new Error('서버 '+resp.status);
      const data = await resp.json();
      const txt = (data.text||'').replace(/```json|```/g,'').trim();
      const updated = JSON.parse(txt);
      if(!Array.isArray(updated)) throw new Error('형식 오류');
      updated.forEach((day,di)=>{
        if(!plan[di]) return;
        const fixed = plan[di].items.filter(it=>it._fixed);
        plan[di].items = day.items;
        fixed.forEach(fi=>{ if(!plan[di].items.some(it=>it.title===fi.title)) plan[di].items.push(fi); });
        sortDayByTime(di);
      });
      await savePlan();
      input.value='';
      st.innerHTML=`<div class="status show"><b>✓ 일정이 수정됐어요!</b> 일정 탭에서 확인하세요.</div>`;
      if(activeTab==='plan') renderPlan();

    } else {
      // 장소 추가 모드
      const place = await extractPlace(raw);
      if(!place.title) place.title=raw.slice(0,40);
      const result = placeOptimally(place);
      // _item을 result에 저장 (충돌 카드에서 재사용)
      result._item = plan[result.day].items.pop(); // placeOptimally가 이미 push했으므로 꺼냄

      const newCoords = place.lat && place.lng ? {lat:place.lat, lng:place.lng} : null;
      const conflict = detectConflict(result.day, result._item.time, newCoords);
      if(conflict){
        st.innerHTML='';
        showConflictCard(st, place, result, conflict);
        input.value='';
      } else {
        // 충돌 없음 → 바로 추가
        plan[result.day].items.push(result._item);
        sortDayByTime(result.day);
        await savePlan();
        addUserMarker(place, result.day);
        const distName = result.districtKey?(DISTRICTS.find(d=>d.key===result.districtKey)?.name||''):'';
        input.value='';
        st.innerHTML=`<div class="status show">
          <b>✓ "${place.title}"</b> 추가 완료!
          <div class="placed">→ <b>${result.dateLabel}</b>${distName?' · '+distName:''}</div>
          <div class="placed" style="opacity:.7">배치 근거: ${result.reason}</div>
        </div>`;
        if(place.lat) map.flyTo([place.lat,place.lng],14,{duration:1});
      }
    }
  } catch(e){
    st.innerHTML=`<div class="status show err">실패했어요 (${e.message}). 더 구체적으로 입력하거나 다시 시도해 주세요.</div>`;
  } finally{
    btn.disabled=false; btn.textContent='✦ 분석해서 반영하기';
  }
}

/* ---------- ITEM DRAWER ---------- */
let drawerContext = null; // {di, ii}
let _currentOptNote = '';

function updateDrawerPrivacy(){
  if(!drawerContext) return;
  const it = plan[drawerContext.di]?.items[drawerContext.ii];
  if(!it){ document.getElementById('drawerPrivacy').style.display='none'; return; }
  document.getElementById('drawerPrivacy').style.display='flex';

  const withVal = (!it._with || it._with.length>=2) ? 'both' : it._with[0];
  document.querySelectorAll('.drawer-with-btn').forEach(b=>
    b.classList.toggle('active', b.dataset.with===withVal));

  const visVal = it._personal ? 'personal' : 'shared';
  document.querySelectorAll('.drawer-vis-btn').forEach(b=>
    b.classList.toggle('active', b.dataset.vis===visVal));
}

function openDrawer(di, ii, title){
  drawerContext = {di, ii};
  document.getElementById('drawerLabel').textContent = title;
  document.getElementById('drawerInput').value = '';
  document.getElementById('drawerStatus').className = 'drawer-status';
  // 이전 응답 초기화
  const resp = document.getElementById('drawerResponse');
  resp.classList.remove('show');
  document.getElementById('drawerRespIntro').innerHTML = '';
  document.getElementById('drawerOptions').innerHTML = '';
  document.getElementById('drawerFollowup').style.display = 'none';
  document.getElementById('drawerConfirmBar').className = 'drawer-confirm-bar';
  document.getElementById('drawerRespActions').innerHTML = '';
  _currentOptNote = '';
  document.getElementById('itemDrawer').classList.add('open');
  updateDrawerPrivacy();

  const it = plan[di]?.items[ii];

  // Google Maps G 버튼
  const gmapBtn = document.getElementById('drawerGmapBtn');
  if(gmapBtn && it){
    gmapBtn.href = it._gmapsUrl || gMapsUrlForItem(it);
    gmapBtn.style.display = 'inline';
  }

  // 삭제 버튼 (고정 항목은 숨김)
  const delBtn = document.getElementById('drawerDeleteBtn');
  if(delBtn){
    delBtn.style.display = (it && !it._fixed) ? 'inline' : 'none';
    delBtn.onclick = ()=>{
      if(!confirm(`"${it.title}" 일정을 삭제할까요?`)) return;
      plan[di].items.splice(ii,1); savePlan(); renderPlan(); closeDrawer();
    };
  }

  // 위치편집 입력창: 현재 저장된 URL 표시
  const locInput = document.getElementById('drawerLocInput');
  const locRow   = document.getElementById('drawerLocRow');
  if(locInput && it){
    locInput.value = it._gmapsUrl || '';
    locInput.placeholder = gMapsUrlForItem(it); // 자동생성 URL을 플레이스홀더로
  }
  if(locRow) locRow.style.display = 'none'; // 열 때마다 닫힘 상태로

  setTimeout(()=>document.getElementById('drawerInput').focus(), 250);
}

// 위치편집 토글
document.getElementById('drawerLocToggle').addEventListener('click', ()=>{
  const row = document.getElementById('drawerLocRow');
  const isOpen = row.style.display !== 'none';
  row.style.display = isOpen ? 'none' : 'flex';
  if(!isOpen) document.getElementById('drawerLocInput').focus();
});

// 위치 저장
document.getElementById('drawerLocSave').addEventListener('click', ()=>{
  if(!drawerContext) return;
  const it = plan[drawerContext.di]?.items[drawerContext.ii];
  if(!it) return;
  const val = document.getElementById('drawerLocInput').value.trim();
  // Google Maps URL이면 그대로, 아니면 Places Search URL로 변환
  if(val && !val.startsWith('http')){
    it._gmapsUrl = gMapsUrl(val + (val.toLowerCase().includes('copenhagen')?'':' Copenhagen'));
  } else {
    it._gmapsUrl = val || undefined;
  }
  savePlan();
  document.getElementById('drawerLocRow').style.display = 'none';
  // G 버튼 업데이트
  const gmapBtn = document.getElementById('drawerGmapBtn');
  if(gmapBtn) gmapBtn.href = it._gmapsUrl || gMapsUrlForItem(it);
  renderPlan();
});

// 위치 초기화 (자동생성으로 복원)
document.getElementById('drawerLocReset').addEventListener('click', ()=>{
  if(!drawerContext) return;
  const it = plan[drawerContext.di]?.items[drawerContext.ii];
  if(!it) return;
  delete it._gmapsUrl;
  savePlan();
  const locInput = document.getElementById('drawerLocInput');
  if(locInput){ locInput.value = ''; locInput.placeholder = gMapsUrlForItem(it); }
  renderPlan();
});

function closeDrawer(){
  document.getElementById('itemDrawer').classList.remove('open');
  drawerContext = null;
}

/* 질문 vs 명령 판별 — 명확한 플랜 편집 지시어만 command, 나머지는 question */
function isQuestion(text){
  return !/삭제해|지워줘|제거해|이동해|옮겨줘|날짜.*(변경|바꿔|수정)|시간.*(변경|바꿔|수정)|다른 날로|수정해줘|편집해줘/.test(text.trim());
}

async function sendDrawerMsg(){
  if(!drawerContext) return;
  const input = document.getElementById('drawerInput');
  const btn   = document.getElementById('drawerSend');
  const st    = document.getElementById('drawerStatus');
  const resp  = document.getElementById('drawerResponse');
  const raw   = input.value.trim();
  if(!raw) return;

  const {di,ii} = drawerContext;
  const item = plan[di]?.items[ii];
  if(!item) return;

  btn.disabled=true; btn.textContent='...';
  st.className='drawer-status show'; st.textContent='생각 중...';
  resp.classList.remove('show');

  if(isQuestion(raw)) await _drawerQuestion(raw,di,ii,item,input,btn,st,resp);
  else                await _drawerCommand(raw,di,ii,item,input,btn,st);
}

/* ── 질문 모드: 선택형 카드 UI ── */
async function _drawerQuestion(raw,di,ii,item,input,btn,st,resp){
  const dayLabel = plan[di]?.date+' · '+plan[di]?.tag;
  const todayList = plan[di].items.map(it=>`  ${it.time||'?'} ${it.title}`).join('\n') || '  없음';
  const gpsStr = currentPos
    ? `현재 위치: 위도 ${currentPos.lat.toFixed(5)}, 경도 ${currentPos.lng.toFixed(5)}`
    : '현재 위치: 미확인';

  const sys=`You are a warm, practical travel assistant for a Korean couple (미주 and 상효) visiting Copenhagen for 3 Days of Design festival, June 8–16 2026.
Always respond in Korean. Be specific and concise.

## 앱 지도 기능 (중요 — 틀린 안내 금지)
이 앱에는 코펜하겐 Leaflet 지도가 내장되어 있고, 일정 항목에 _lat/_lng 좌표가 있으면 지도에 자동으로 핀이 표시됩니다.
좌표 추가 방법: '+장소' 탭에서 장소명을 입력하면 AI가 자동으로 좌표를 찾아 일정에 추가합니다.
Google Maps 링크를 note에 추가하는 것은 앱 내 지도 핀을 생성하지 않습니다 — 이 방법은 효과가 없다고 안내하세요.
좌표가 없는 기존 항목(항공편 등)은 클릭해도 지도 핀이 안 생기는 것이 정상입니다.

## 응답 형식 규칙 (엄격히 준수)

### ✅ <options> 필수 사용 케이스 (반드시 태그 사용):
- 식당/카페/바 추천 (저녁식사, 점심, 커피, 술집 등)
- 관광지/장소 추천
- 쇼핑/마켓 추천
- 활동/체험 추천
- "어디", "추천", "좋은 곳" 등 장소를 묻는 모든 질문

<options> 형식:
<options>[
  {"title":"장소명","time":"HH:MM","note":"한 줄 핵심 정보 (위치·가격·특징)","day_index":${di},"tags":["태그1","태그2"],"tip":"예약 권장"},
  {"title":"장소명2","time":"HH:MM","note":"...","day_index":${di},"tags":["태그"],"tip":""}
]</options>
옵션 수: 2–4개. time은 선택 일정의 마지막 시간 이후로 자연스럽게 설정. 모를 경우 "".

### ✅ <add> 사용 케이스 (단 1개 추천):
<add>{"title":"장소명","time":"HH:MM","note":"한 줄 설명","day_index":${di}}</add>

### ✅ 텍스트만 사용 케이스 (장소 추가가 전혀 불필요한 경우만):
- 순수 정보 질문: 영업시간, 가격, 교통편 정보 등
- 이미 일정에 있는 항목에 대한 세부 정보
- "~해줘" 명령이 아닌 사실 확인 질문

### ✅ 삭제 요청 케이스 (현재 일정 삭제 시 반드시 이 형식):
사용자가 현재 선택 일정("${item.title}")을 삭제하려 할 때:
<options>[
  {"title":"삭제 확인","action":"delete","note":"${item.title} 일정을 삭제합니다","day_index":${di},"tags":["일정 관리"]},
  {"title":"취소","action":"cancel","note":"일정 유지","day_index":${di},"tags":["일정 관리"]}
]</options>

⚠️ 식사·카페·장소 추천은 예외 없이 <options> 사용. 절대로 텍스트만으로 추천하지 말 것.

day_index ${di} = ${plan[di]?.date}.
tags는 핵심 특징 2–3개 (예: "도보 10분", "예약 권장", "가성비", "뷰 맛집", "현지인 맛집").
서두 텍스트는 1문장으로만.`;

  const ctx=`선택 일정: "${item.title}" (${dayLabel})
${gpsStr}
오늘 일정:
${todayList}

질문: ${raw}`;

  try{
    const r=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system:sys,input:ctx,max_tokens:900})});
    if(!r.ok) throw new Error('서버 '+r.status);
    const d=await r.json();
    let text=(d.text||'').trim();

    // <options> 파싱
    let options=null;
    const mo=text.match(/<options>([\s\S]*?)<\/options>/);
    if(mo){ try{ options=JSON.parse(mo[1].trim()); }catch(e){} text=text.replace(/<options>[\s\S]*?<\/options>/,'').trim(); }

    // <add> 파싱 (단일 추천 fallback)
    let singleAdd=null;
    if(!options){
      const ma=text.match(/<add>([\s\S]*?)<\/add>/);
      if(ma){ try{ singleAdd=JSON.parse(ma[1].trim()); }catch(e){} text=text.replace(/<add>[\s\S]*?<\/add>/,'').trim(); }
    }

    // 렌더링
    _renderDrawerOptions(text, options, singleAdd, di, resp, st, input);
    resp.classList.add('show');
    st.className='drawer-status';
    input.value='';
  }catch(e){
    st.className='drawer-status show err'; st.textContent=`실패 (${e.message})`;
  }finally{
    btn.disabled=false; btn.textContent='전송';
  }
}

function _renderDrawerOptions(introText, options, singleAdd, di, resp, st, input){
  // 서두 텍스트
  const introEl = document.getElementById('drawerRespIntro');
  introEl.innerHTML = introText ? introText.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>') : '';

  const optEl   = document.getElementById('drawerOptions');
  const fuEl    = document.getElementById('drawerFollowup');
  const barEl   = document.getElementById('drawerConfirmBar');
  const actEl   = document.getElementById('drawerRespActions');
  optEl.innerHTML=''; fuEl.style.display='none'; fuEl.innerHTML='';
  barEl.className='drawer-confirm-bar';
  actEl.innerHTML='';

  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.className='drawer-dismiss-btn'; closeBtn.textContent='닫기';
  closeBtn.onclick=()=>{ resp.classList.remove('show'); };
  actEl.appendChild(closeBtn);

  document.getElementById('drawerDismiss2').onclick=()=>resp.classList.remove('show');

  // 확정 바 초기화
  const daySelEl = document.getElementById('confirmDay');
  daySelEl.innerHTML = plan.map((d,i)=>`<option value="${i}"${i===di?' selected':''}>${d.date} · ${d.tag}</option>`).join('');

  document.getElementById('confirmAddBtn').onclick=()=>{
    const title = document.getElementById('confirmTitle').value.trim();
    const time  = document.getElementById('confirmTime').value.trim();
    const dIdx  = +document.getElementById('confirmDay').value;
    if(!title) return;
    const newItem = {time,title,note:_currentOptNote||'',dist:'',_user:true,_addedBy:currentUser,_personal:false,_with:['miju','sanghyo']};
    plan[dIdx].items.push(newItem);
    sortDayByTime(dIdx); savePlan(); renderPlan();
    resp.classList.remove('show');
    st.className='drawer-status show ok'; st.textContent='✓ 일정에 추가됐어요!';
    setTimeout(closeDrawer,1400);
    // 백그라운드 좌표 자동 등록
    geocodePlanItem(newItem, dIdx);
  };

  // ── 단일 추천 ──
  if(singleAdd){
    document.getElementById('confirmTitle').value = singleAdd.title||'';
    document.getElementById('confirmTime').value  = singleAdd.time||'';
    document.getElementById('confirmDay').value   = singleAdd.day_index??di;
    _currentOptNote = singleAdd.note||'';
    barEl.classList.add('show');
    return;
  }

  // ── 다중 선택지 카드 ──
  if(options && options.length){
    const NUMS=['①','②','③','④'];
    options.forEach((opt,i)=>{
      const card = document.createElement('div');
      card.className='drawer-opt-card';
      const tags=(opt.tags||[]).map((t,ti)=>`<span class="opt-tag${ti===0?' highlight':''}">${t}</span>`).join('');
      card.innerHTML=`
        <span class="opt-num">${NUMS[i]||i+1}</span>
        <div class="opt-title">${opt.title}</div>
        ${opt.note?`<div class="opt-note">${opt.note}</div>`:''}
        ${opt.tip?`<div class="opt-note" style="color:var(--rust-deep);font-size:11px">⚑ ${opt.tip}</div>`:''}
        ${tags?`<div class="opt-tags">${tags}</div>`:''}`;

      card.addEventListener('click',()=>{
        optEl.querySelectorAll('.drawer-opt-card').forEach(c=>c.classList.remove('selected'));
        card.classList.add('selected');

        // 삭제 액션
        if(opt.action==='delete'){
          const {di:cDi,ii:cIi}=drawerContext||{};
          if(cDi!=null && cIi!=null && !plan[cDi]?.items[cIi]?._fixed){
            plan[cDi].items.splice(cIi,1); savePlan(); renderPlan();
            resp.classList.remove('show');
            st.className='drawer-status show ok'; st.textContent='✓ 삭제됐어요!';
            setTimeout(closeDrawer,1000);
          }
          return;
        }
        // 취소 액션
        if(opt.action==='cancel'){ resp.classList.remove('show'); return; }

        _currentOptNote = opt.note||'';

        // 확정 바 채우기
        document.getElementById('confirmTitle').value = opt.title||'';
        document.getElementById('confirmTime').value  = opt.time||'';
        document.getElementById('confirmDay').value   = opt.day_index??di;
        barEl.classList.add('show');

        // 시간 미정이면 시간 칩 제안
        fuEl.innerHTML=''; fuEl.style.display='none';
        if(!opt.time){
          fuEl.style.display='block';
          fuEl.innerHTML=`<div class="followup-q">⏱ 몇 시에 추가할까요?</div><div class="followup-chips" id="timeChips"></div>`;
          const chips=['17:00','18:00','19:00','20:00','21:00','미정'];
          document.getElementById('timeChips').innerHTML=chips.map(c=>`<button class="followup-chip" data-t="${c}">${c}</button>`).join('');
          document.getElementById('timeChips').querySelectorAll('.followup-chip').forEach(b=>{
            b.onclick=()=>{
              document.getElementById('timeChips').querySelectorAll('.followup-chip').forEach(x=>x.classList.remove('active'));
              b.classList.add('active');
              document.getElementById('confirmTime').value = b.dataset.t==='미정'?'':b.dataset.t;
            };
          });
        }
        card.scrollIntoView({behavior:'smooth',block:'nearest'});
      });
      optEl.appendChild(card);
    });
    return;
  }

  // ── 선택지 없는 일반 답변 ──
  // introText만 표시, 확정 바 없음
}

/* ── 명령 모드: 플랜 JSON 직접 수정 (기존 동작) ── */
async function _drawerCommand(raw,di,ii,item,input,btn,st){
  const sys=`You are a Copenhagen trip plan editor. The user selected a specific item and made a request about it (Korean or English). Apply the change to the full plan and output ONLY the updated full plan JSON array. No markdown, no explanation.
Rules:
- Never delete _fixed:true items
- Preserve _user, _fixed, _lat, _lng, _dk fields on all items
- Moving an item to another day: remove from original day, add to target day
- Sort each day's items by time after changes
- Date reference: Day 0=6/8, Day 1=6/9, Day 2=6/10, Day 3=6/11, Day 4=6/12, Day 5=6/13, Day 6=6/14, Day 7=6/15, Day 8=6/16`;

  const planJson=JSON.stringify(plan.map(day=>({
    date:day.date,tag:day.tag,fest:day.fest,
    items:day.items.map(it=>({
      time:it.time,title:it.title,note:it.note,dist:it.dist,
      _fixed:it._fixed||undefined,_user:it._user||undefined,
      _lat:it._lat||undefined,_lng:it._lng||undefined,_dk:it._dk||undefined
    }))
  })));
  const dayLabel=plan[di]?.date+' · '+plan[di]?.tag;
  const ctx=`Selected item: "${item.title}" on ${dayLabel}\nFull plan JSON:\n${planJson}\n\nUser request: ${raw}`;

  try{
    const r=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system:sys,input:ctx,max_tokens:4000})});
    if(!r.ok) throw new Error('서버 '+r.status);
    const d=await r.json();
    const txt=(d.text||'').replace(/```json|```/g,'').trim();
    const updated=JSON.parse(txt);
    if(!Array.isArray(updated)) throw new Error('형식 오류');

    updated.forEach((day,i)=>{
      if(!plan[i]) return;
      const fixed=plan[i].items.filter(it=>it._fixed);
      plan[i].items=day.items||[];
      fixed.forEach(fi=>{ if(!plan[i].items.some(it=>it.title===fi.title)) plan[i].items.push(fi); });
      sortDayByTime(i);
    });
    await savePlan(); input.value='';
    st.className='drawer-status show ok'; st.textContent='✓ 수정됐어요!';
    if(activeTab==='plan') renderPlan();
    setTimeout(closeDrawer,1200);
  }catch(e){
    st.className='drawer-status show err'; st.textContent=`실패 (${e.message})`;
  }finally{
    btn.disabled=false; btn.textContent='전송';
  }
}

/* ── AI 재조율 ── */
const _rescheduleCache = {};

async function triggerReschedule(di){
  const slot = document.getElementById(`reschedule-slot-${di}`);
  const btn  = document.getElementById(`reschedule-btn-${di}`);
  if(!slot) return;

  // 토글 — 이미 열려 있으면 닫기
  if(slot.innerHTML.trim()){
    slot.innerHTML='';
    if(btn){ btn.textContent='✦ 재조율'; btn.classList.remove('loading'); btn.disabled=false; }
    return;
  }

  const day = plan[di];
  if(!day || !day.items.length) return;

  slot.innerHTML=`<div class="reschedule-panel"><div class="reschedule-hd">✦ AI 재조율</div><div class="reschedule-loading">일정을 분석 중이에요…</div></div>`;
  if(btn){ btn.textContent='분석 중…'; btn.classList.add('loading'); btn.disabled=true; }

  // 이동 시간 정보
  const travelLines = [];
  for(let i=0;i<day.items.length-1;i++){
    const cA=getItemCoords(day.items[i]), cB=getItemCoords(day.items[i+1]);
    if(cA&&cB){ const t=transportBetween(cA,cB); travelLines.push(`"${day.items[i].title}"→"${day.items[i+1].title}": ${t.label} ~${t.mins}분`); }
  }

  const itemsDesc = day.items.map((it,i)=>
    `${i+1}. [${it.time||'미정'}] ${it.title}${it.note?' ('+it.note+')':''}${it._fixed?' [고정]':''}`
  ).join('\n');

  const sys=`You are an expert Copenhagen travel scheduler for a Korean couple visiting for 3 Days of Design festival (June 8–16, 2026).
Analyze the given day's schedule and respond in Korean with:
1. 2–3 sentences: key issues or strengths (crowding, travel gaps, opening hours, energy pacing)
2. An optimized time suggestion

Rules:
- NEVER change times of [고정] items
- Realistic durations: museum 1.5–2h, café/bakery 30–45min, showroom 20–40min, walk variable
- If an item has time 미정, suggest a concrete time
- If the schedule is already optimal, say so briefly
- End your response with EXACTLY this block (no markdown):
<reschedule>
[{"time":"HH:MM or 미정","title":"제목 그대로","changed":true/false}]
</reschedule>
Include ALL items in the array. Set changed:true only for items whose time actually differs from the current schedule.
Travel between items: ${travelLines.join(' | ')||'(좌표 정보 부족)'}`;

  const ctx=`날짜: ${day.date} (${day.tag})\n현재 일정:\n${itemsDesc}\n\n이 날 일정을 분석하고 최적화된 시간표를 제안해주세요.`;

  try{
    const r=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system:sys,input:ctx,max_tokens:1000})});
    if(!r.ok) throw new Error('서버 '+r.status);
    const data=await r.json();
    let text=(data.text||'').trim();

    let suggestion=null;
    const m=text.match(/<reschedule>([\s\S]*?)<\/reschedule>/);
    if(m){ try{ suggestion=JSON.parse(m[1].trim()); }catch(e){} text=text.replace(/<reschedule>[\s\S]*?<\/reschedule>/,'').trim(); }
    _rescheduleCache[di]=suggestion;

    const proposalHtml = suggestion ? `
      <div class="reschedule-proposal">
        <div class="reschedule-proposal-hd">제안된 시간표</div>
        ${suggestion.map(it=>`
          <div class="reschedule-row">
            <span class="reschedule-row-time">${it.time}</span>
            <span class="reschedule-row-title">${it.title}</span>
            ${it.changed?`<span class="reschedule-row-changed">← 변경</span>`:''}
          </div>`).join('')}
      </div>
      <div class="reschedule-actions">
        <button class="reschedule-apply" onclick="applyReschedule(${di})">이 순서로 적용</button>
        <button class="reschedule-close" onclick="closeReschedulePanel(${di})">닫기</button>
      </div>` : `<div class="reschedule-actions"><button class="reschedule-close" onclick="closeReschedulePanel(${di})">닫기</button></div>`;

    slot.innerHTML=`<div class="reschedule-panel">
      <div class="reschedule-hd">✦ AI 재조율 — ${day.date}</div>
      <div class="reschedule-analysis">${text.replace(/\n/g,'<br>')}</div>
      ${proposalHtml}
    </div>`;
  }catch(e){
    slot.innerHTML=`<div class="reschedule-panel"><div class="reschedule-analysis" style="color:#e07070">분석 실패: ${e.message}</div><div class="reschedule-actions"><button class="reschedule-close" onclick="closeReschedulePanel(${di})">닫기</button></div></div>`;
  }finally{
    if(btn){ btn.textContent='✦ 재조율'; btn.classList.remove('loading'); btn.disabled=false; }
  }
}

function applyReschedule(di){
  const suggestion=_rescheduleCache[di];
  if(!suggestion) return;
  const day=plan[di];
  if(!day) return;
  suggestion.forEach(sugg=>{
    const item=day.items.find(it=>it.title===sugg.title);
    if(item && !item._fixed && sugg.changed) item.time=sugg.time;
  });
  sortDayByTime(di);
  savePlan();
  renderPlan();
}

function closeReschedulePanel(di){
  const slot=document.getElementById(`reschedule-slot-${di}`);
  if(slot) slot.innerHTML='';
  const btn=document.getElementById(`reschedule-btn-${di}`);
  if(btn){ btn.textContent='✦ 재조율'; btn.classList.remove('loading'); btn.disabled=false; }
}

// 사용자 추가 장소 지도 마커
const userMarkers=[];
function addUserMarker(place, di){
  if(!place.lat||!place.lng) return;
  const color = di!=null ? DAY_COLORS[di]||'#d99021' : '#d99021';
  const icon = getCategoryIcon({title:place.title,note:place.note||''});
  const mkIcon=L.divIcon({className:'',html:`<div class="plan-pin" style="background:${color}"><span>${icon}</span></div>`,iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-32]});
  const m=L.marker([place.lat,place.lng],{icon:mkIcon}).addTo(map);
  m.bindPopup(`<div class="pop-name">${place.title}</div><div class="pop-desc">${place.note||'사용자 추가 장소'}</div>`);
  userMarkers.push(m);
}

/* ---------- TABS ---------- */
let activeTab='plan';
function setTab(t){
  if(activeTab==='rec'  && t!=='rec')  clearRecMapSel();
  if(activeTab==='fest' && t!=='fest') clearFestMarkers();
  if(activeTab==='exh'  && t!=='exh')  clearExhPin();
  activeTab=t;
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  if(t==='plan'){
    document.getElementById('scroll').style.cssText='';
    renderPlan();
  } else if(t==='rec'){
    document.getElementById('scroll').style.cssText='';
    renderRecommend();
  } else if(t==='fest'){
    renderFest();
  } else if(t==='exh'){
    renderExhibitions();
  } else if(t==='add'){
    document.getElementById('scroll').style.cssText='';
    renderAdd();
  } else if(t==='dist'){
    document.getElementById('scroll').style.cssText='';
    renderDist();
  } else {
    document.getElementById('scroll').style.cssText='';
    renderInfo();
  }
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));

// Escape 키: 모달·드로어 닫기
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  const evOverlay = document.querySelector('.ev-overlay');
  if(evOverlay){ evOverlay.remove(); return; }
  if(document.getElementById('itemDrawer')?.classList.contains('open')){ closeDrawer(); return; }
  if(document.getElementById('loginOverlay')?.style.display !== 'none'){ document.getElementById('loginOverlay').style.display='none'; }
});

// 사용자 선택 (미주 / 상효)
document.querySelectorAll('.user-sel-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    saveUserPref(btn.dataset.user);
    updateUserSelector();
    renderPlan();
  });
});

// 드로어 참가자·공개 버튼
document.querySelectorAll('.drawer-with-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(!drawerContext) return;
    const it = plan[drawerContext.di]?.items[drawerContext.ii];
    if(!it) return;
    it._with = btn.dataset.with==='both' ? ['miju','sanghyo'] : [btn.dataset.with];
    savePlan(); updateDrawerPrivacy(); renderPlan();
  });
});
document.querySelectorAll('.drawer-vis-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(!drawerContext) return;
    const it = plan[drawerContext.di]?.items[drawerContext.ii];
    if(!it) return;
    it._personal = btn.dataset.vis==='personal';
    if(it._personal && !it._addedBy) it._addedBy = currentUser;
    savePlan(); updateDrawerPrivacy(); renderPlan();
  });
});

// 드로어 이벤트
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerMapBtn').addEventListener('click', ()=>{
  if(drawerContext) showItemRoute(drawerContext.di, drawerContext.ii);
});
document.getElementById('drawerSend').addEventListener('click', sendDrawerMsg);
document.getElementById('drawerInput').addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){ e.preventDefault(); sendDrawerMsg(); }
});

document.getElementById('reset').addEventListener('click',async()=>{
  if(confirm('일정을 초기 상태로 되돌릴까요? 편집한 내용이 사라집니다.')){
    plan=structuredClone(DEFAULT_PLAN); await savePlan(); if(activeTab==='plan')renderPlan();
  }
});

/* ---------- MAP ---------- */
// 날짜별 핀 색상
const DAY_COLORS = [
  '#7a7a7a', // 0: 6/8 출발
  '#9b7ab5', // 1: 6/9 도착
  '#c8492a', // 2: 6/10 페스티벌 1
  '#2f6b6b', // 3: 6/11 페스티벌 2
  '#d99021', // 4: 6/12 페스티벌 3
  '#5d7456', // 5: 6/13 자유
  '#4a7a9b', // 6: 6/14 근교
  '#8b6a2e', // 7: 6/15 자유
  '#7a5a8b', // 8: 6/16 귀국
];
const DAY_LABELS = ['6/8 출발','6/9 도착','6/10 Festival①','6/11 Festival②','6/12 Festival③','6/13 자유','6/14 근교','6/15 자유','6/16 귀국'];

// 카테고리 아이콘 추론
function getCategoryIcon(it){
  const t=(it.title||'').toLowerCase(), n=(it.note||it.dist||'').toLowerCase();
  const all=t+' '+n;
  if(/icn|cph→|ams|lhr|출발|직항|항공편|sk\d|ke\d|kl\d/.test(all)) return '✈️';
  if(it._fixed && /salu|다이닝|dining/.test(all)) return '🍽';
  if(it._fixed) return '🔒';
  if(/breakfast|brunch|lunch|dinner|dining|café|coffee|식사|다이닝|점심|저녁|아침|음식|레스토랑|restaurant|bar|eating/.test(all)) return '🍽';
  if(/museum|전시|exhibition|gallery|오프닝|opening|lounge|pavilion/.test(all)) return '🏛';
  if(/talk|panel|토크|세미나|symposium|discussion|lecture|강연/.test(all)) return '💬';
  if(/workshop|워크숍|making|crafting/.test(all)) return '✂️';
  if(/yoga|wellness|breathwork|요가|웰니스|meditation/.test(all)) return '🧘';
  if(/walk|tour|투어|산책|stroll|hike/.test(all)) return '🚶';
  if(/launch|런칭|grand open/.test(all)) return '🚀';
  if(/hotel|airbnb|체크인|숙소|accommodation/.test(all)) return '🏠';
  return '📍';
}

const map = L.map('map',{zoomControl:true,attributionControl:false}).setView([55.685,12.59],13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
const markers={};

// ── 지구 라벨 레이어
DISTRICTS.forEach((d)=>{
  // 지구명 라벨 마커 (클릭 가능)
  const lbl = L.divIcon({
    className:'',
    html:`<div class="dist-lbl" style="border-color:${d.color};color:${d.color}">${d.name}</div>`,
    iconAnchor:[0,0]
  });
  const m = L.marker([d.lat+0.003,d.lng],{icon:lbl, zIndexOffset:-200}).addTo(map);
  m.bindPopup(`<div class="pop-name">${d.name}</div><div class="pop-desc">${d.desc}<br><b style="color:${d.color}">${d.when}</b></div>`);
  markers[d.key]=m;
});

// 숙소 마커
const stayIcon=L.divIcon({className:'',html:`<div class="pin home"><span>★</span></div>`,iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-30]});
const stayMarker=L.marker([STAY.lat,STAY.lng],{icon:stayIcon}).addTo(map);
stayMarker.bindPopup(`<div class="pop-name">🏠 ${STAY.name}</div><div class="pop-desc">${STAY.desc}<br><b>${STAY.meta}</b></div>`);
markers['stay']=stayMarker;

// SALU 고정 마커
const saluIcon=L.divIcon({className:'',html:`<div class="ppv2 fixed-pin" style="--ppbg:${DAY_COLORS[2]};background:${DAY_COLORS[2]};border-color:rgba(0,0,0,.5)"><span class="ppv2-num">🔒</span><span class="ppv2-ico">🍽</span></div>`,iconSize:[36,44],iconAnchor:[18,44],popupAnchor:[0,-46]});
const saluMarker=L.marker([55.665398,12.550298],{icon:saluIcon}).addTo(map);
saluMarker.bindPopup(`<div class="pop-name">🍽 Food & Music with SALU</div><div class="pop-desc">소셜 다이닝 (3명 예약) · 6/10(수) 17:00–20:00<br>Folkehuset Absalon · Sønder Blvd. 73, 1720 København</div>`);
markers['salu']=saluMarker;

// 범례 토글 (모바일에서 기본 접힘)
(function(){
  const legend = document.getElementById('mapLegend');
  const toggle = document.getElementById('legToggle');
  if(!legend || !toggle) return;
  const isMobile = () => window.innerWidth <= 820;
  if(isMobile()) legend.classList.add('leg-collapsed');
  toggle.addEventListener('click', ()=>{
    if(!isMobile()) return;
    legend.classList.toggle('leg-collapsed');
  });
  window.addEventListener('resize', ()=>{
    if(!isMobile()) legend.classList.remove('leg-collapsed');
  });
})();

// ── 범례: 날짜별 색상 + 숙소 + 지구
const leg=document.getElementById('legend');
leg.innerHTML='';

// 숙소
const stayRow=document.createElement('div'); stayRow.className='leg-stay-row';
stayRow.innerHTML=`<span class="leg-stay-dot">★</span><span>우리 숙소</span>`;
stayRow.title='클릭하면 숙소 위치로 이동';
stayRow.onclick=()=>{map.flyTo([STAY.lat,STAY.lng],16,{duration:1});stayMarker.openPopup()};
leg.appendChild(stayRow);

// 날짜별 범례
const planHead=document.createElement('div'); planHead.className='leg-section-head';
planHead.textContent='PLAN — 날짜별 이동';
leg.appendChild(planHead);

// 날짜 약칭 (뱃지용)
const DAY_SHORT=['6/8','6/9','6/10','6/11','6/12','6/13','6/14','6/15','6/16'];
const DAY_SUBLABEL=['출발','도착','Fest①','Fest②','Fest③','자유','근교','자유','귀국'];

DAY_COLORS.forEach((color,i)=>{
  const r=document.createElement('div'); r.className='leg-row';
  r.title=`${DAY_LABELS[i]} — 클릭하면 일정 지도 표시`;
  r.innerHTML=`
    <span class="leg-day-badge" style="background:${color}">${DAY_SHORT[i]}</span>
    <span>${DAY_SUBLABEL[i]}</span>`;
  r.onclick=()=>{ currentVisDay=i; updateDayViz(i); setTab('plan'); };
  leg.appendChild(r);
});

// 지구 목록
const distHead=document.createElement('div'); distHead.className='leg-section-head';
distHead.textContent='8 DISTRICTS';
leg.appendChild(distHead);
DISTRICTS.forEach((d,i)=>{
  const r=document.createElement('div'); r.className='leg-dist-row';
  r.title=`${d.name} — ${d.desc}`;
  r.innerHTML=`
    <span class="leg-dist-sq" style="background:${d.color}"></span>
    <span>${i+1}. ${d.name}</span>`;
  r.onclick=()=>{map.flyTo([d.lat,d.lng],14.5,{duration:1});markers[d.key].openPopup()};
  leg.appendChild(r);
});

/* ---------- GPS (무료, 브라우저 내장) ---------- */
let meMarker=null;
let currentPos=null;
function haversineKm(a,b,c,d){
  const R=6371,toR=x=>x*Math.PI/180;
  const dLat=toR(c-a),dLng=toR(d-b);
  const x=Math.sin(dLat/2)**2+Math.cos(toR(a))*Math.cos(toR(c))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function walkMin(km){return Math.max(1,Math.round(km/5*60));} // 도보 5km/h 기준
document.getElementById('gpsBtn').addEventListener('click',()=>{
  const btn=document.getElementById('gpsBtn'), info=document.getElementById('gpsInfo');
  if(!navigator.geolocation){
    info.className='gps-info show'; info.innerHTML='이 브라우저는 위치 기능을 지원하지 않아요.'; return;
  }
  btn.disabled=true; btn.textContent='◎ 찾는 중...';
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const {latitude:la,longitude:lo}=pos.coords;
      if(meMarker) map.removeLayer(meMarker);
      const icon=L.divIcon({className:'',html:`<div class="me-dot me-pulse"></div>`,iconSize:[18,18],iconAnchor:[9,9]});
      meMarker=L.marker([la,lo],{icon,zIndexOffset:1000}).addTo(map);
      meMarker.bindPopup('<div class="pop-name">📍 내 위치</div>');
      map.flyTo([la,lo],14,{duration:1});
      // 가장 가까운 디자인 지구 + 숙소까지 거리
      let near=null,nd=1e9;
      DISTRICTS.forEach(d=>{const km=haversineKm(la,lo,d.lat,d.lng); if(km<nd){nd=km;near=d;}});
      const stayKm=haversineKm(la,lo,STAY.lat,STAY.lng);
      const saluKm=haversineKm(la,lo,55.665398,12.550298);
      info.className='gps-info show';
      info.innerHTML=`<b>가장 가까운 지구</b><br>${near.name} · ${nd.toFixed(1)}km (도보 ~${walkMin(nd)}분)
        <br><br>🏠 숙소까지 ${stayKm.toFixed(1)}km (~${walkMin(stayKm)}분)
        <br>🍽 SALU까지 ${saluKm.toFixed(1)}km (~${walkMin(saluKm)}분)`;
      currentPos={lat:la,lng:lo};
      btn.classList.add('active'); btn.disabled=false; btn.textContent='◎ 내 위치';
    },
    err=>{
      info.className='gps-info show';
      const msg=err.code===1?'위치 권한이 거부됐어요. 브라우저 설정에서 허용해 주세요.':'위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.';
      info.innerHTML=msg;
      btn.disabled=false; btn.textContent='◎ 내 위치';
    },
    {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
  );
});

/* ---------- WEATHER ---------- */
// WMO 날씨 코드 → 이모지 + 한국어
const WMO_ICON = {
  0:'☀️',1:'🌤',2:'⛅',3:'☁️',
  45:'🌫',48:'🌫',
  51:'🌦',53:'🌦',55:'🌧',
  61:'🌧',63:'🌧',65:'🌧',
  71:'🌨',73:'🌨',75:'🌨',
  80:'🌦',81:'🌧',82:'⛈',
  95:'⛈',96:'⛈',99:'⛈',
};
const WMO_LABEL = {
  0:'맑음',1:'대체로맑음',2:'구름조금',3:'흐림',
  45:'안개',48:'안개',
  51:'이슬비',53:'이슬비',55:'이슬비',
  61:'비',63:'비',65:'폭우',
  71:'눈',73:'눈',75:'폭설',
  80:'소나기',81:'소나기',82:'뇌우',
  95:'뇌우',96:'뇌우',99:'뇌우',
};

let weatherCache = null;
// 여행 날짜 배열 (DEFAULT_PLAN과 동기화)
const TRIP_DATES = ['2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15','2026-06-16'];

async function fetchWeather(){
  if(weatherCache) return weatherCache;
  try{
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=55.676&longitude=12.568'
      + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode'
      + '&timezone=Europe%2FCopenhagen'
      + `&start_date=${TRIP_DATES[0]}&end_date=${TRIP_DATES[TRIP_DATES.length-1]}`;
    const ctrl = new AbortController();
    const tId = setTimeout(()=>ctrl.abort(), 4000);
    const res = await fetch(url, {signal: ctrl.signal}).finally(()=>clearTimeout(tId));
    if(!res.ok) return null;
    const data = await res.json();
    // {dayIdx → {icon, label, max, min, rain}}
    const map = {};
    (data.daily?.time||[]).forEach((date,i)=>{
      const di = TRIP_DATES.indexOf(date);
      if(di<0) return;
      const code = data.daily.weathercode[i];
      map[di] = {
        icon: WMO_ICON[code]||'🌡',
        label: WMO_LABEL[code]||'',
        max: Math.round(data.daily.temperature_2m_max[i]),
        min: Math.round(data.daily.temperature_2m_min[i]),
        rain: +(data.daily.precipitation_sum[i]||0).toFixed(1),
      };
    });
    weatherCache = map;
    return map;
  }catch(e){ return null; }
}

/* ---------- PAST ITEMS / PROGRESS ---------- */
function isPlanItemPast(dayDate, itemTime){
  const now = new Date();
  const nm = now.getMonth()+1, nd = now.getDate();
  const m = dayDate?.match(/(\d+)\/(\d+)/);
  if(!m) return false;
  const dm=+m[1], dd=+m[2];
  if(dm < nm || (dm===nm && dd < nd)) return true; // 지난 날
  if(dm > nm || (dm===nm && dd > nd)) return false; // 미래 날
  // 오늘 — 시간 비교
  if(!itemTime) return false;
  const t = itemTime.match(/^(\d{1,2}):(\d{2})$/);
  if(!t) return false;
  return now.getHours() > +t[1] || (now.getHours()===+t[1] && now.getMinutes()>=+t[2]);
}

function updatePastItems(){
  plan.forEach((day, di)=>{
    let pastCount=0;
    day.items.forEach((it, ii)=>{
      const row=document.querySelector(`.item[data-di="${di}"][data-ii="${ii}"]`);
      const past=isPlanItemPast(day.date, it.time);
      if(past) pastCount++;
      if(row) row.classList.toggle('past', past);
    });
    const items=day.items.length;
    const pct=items?Math.round(pastCount/items*100):0;
    const bar=document.getElementById(`prog-${di}`);
    if(bar) bar.style.width=pct+'%';
  });
}

/* ---------- FAVORITES ---------- */
const FAV_KEY = 'cph_favorites';
let favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
let festFavFilter = false;

/* ---------- WISHLIST (가고싶은 곳) ---------- */
const WISH_KEY = 'cph_wishlist_v1';
let wishlist = JSON.parse(localStorage.getItem(WISH_KEY)||'[]');
function saveWishlist(){
  localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  queueServerSave({wishlist});
}

/* 추천 항목이 현재 plan에 있는지 확인 */
function isRecInPlan(di, title){
  return !!(plan[di]?.items.some(it => it.title === title));
}

/* ---------- FEST MAP MARKERS ---------- */
const festMarkers = {};
const festGeoCache = {}; // cacheKey -> {lat, lng}

function strHash(s){
  let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0; return h;
}

async function geocodeFestEvent(ev){
  const cacheKey = ev.address || (ev.venue + '_' + ev.district);
  if(festGeoCache[cacheKey]) return festGeoCache[cacheKey];
  const queries = [];
  if(ev.address) queries.push(ev.address);
  if(ev.venue && ev.address) queries.push(ev.venue + ' ' + ev.address);
  if(ev.venue) queries.push(ev.venue);
  for(const q of queries){
    try{
      const c = await nominatimGeocode(q);
      if(c){ festGeoCache[cacheKey]=c; return c; }
    }catch(e){}
  }
  return null;
}

function showFestMarker(ev, id){
  if(festMarkers[id]) return;
  const dist = DISTRICTS.find(d=>d.name===ev.district);
  if(!dist) return;
  const dkColor = districtColor(ev.district);
  const catKeyM2 = (ev.category==='lunch'||ev.category==='afternoon') ? 'brunch' : ev.category;
  const catInfo = FEST_CATEGORIES.find(c=>c.key===catKeyM2)||FEST_CATEGORIES[0];
  const icon = L.divIcon({
    className:'',
    html:`<div class="plan-pin" style="background:${dkColor};box-shadow:0 0 0 3px #fff,0 0 0 5px ${dkColor}"><span style="font-size:11px">${catInfo.icon}</span></div>`,
    iconSize:[28,28], iconAnchor:[14,28], popupAnchor:[0,-30]
  });
  const makePopup = (lat, lng) =>
    `<div class="pop-name">${ev.title}</div><div class="pop-desc">${ev.time} · ${ev.venue}<br><b style="color:${dkColor}">${ev.district}</b></div>`;

  const cacheKey = ev.address || (ev.venue + '_' + ev.district);
  const cached = festGeoCache[cacheKey];
  if(cached){
    // 캐시 히트: 실제 좌표로 즉시 표시
    const m = L.marker([cached.lat, cached.lng],{icon,zIndexOffset:300}).addTo(map);
    m.bindPopup(makePopup());
    festMarkers[id]=m;
    map.flyTo([cached.lat, cached.lng],16,{duration:.6});
    m.openPopup();
    return;
  }

  // 캐시 미스: 지구 중심에 먼저 표시 후 실제 좌표로 이동
  const h = strHash(ev.title);
  const initLat = dist.lat + ((h%100)/100-0.5)*0.004;
  const initLng = dist.lng + (((h>>8)%100)/100-0.5)*0.006;
  const m = L.marker([initLat, initLng],{icon,zIndexOffset:300}).addTo(map);
  m.bindPopup(makePopup());
  festMarkers[id]=m;
  map.flyTo([initLat, initLng],15,{duration:.6});
  m.openPopup();

  geocodeFestEvent(ev).then(c=>{
    if(!c || !festMarkers[id]) return;
    const wasOpen = festMarkers[id].isPopupOpen();
    festMarkers[id].setLatLng([c.lat, c.lng]);
    if(wasOpen){ festMarkers[id].openPopup(); }
    map.flyTo([c.lat, c.lng],16,{duration:.4});
  });
}
function hideFestMarker(id){
  if(festMarkers[id]){ map.removeLayer(festMarkers[id]); delete festMarkers[id]; }
}
function clearFestMarkers(){
  Object.keys(festMarkers).forEach(id=>hideFestMarker(id));
}

/* ---------- MOBILE MAP BOTTOM SHEET ---------- */
(function(){
  const SNAPS=[0.10,0.44,0.80]; // window.innerHeight 비율: peek / half / full
  let snapIdx=1, startY=0, startH=0, dragging=false;

  const wrap=document.querySelector('.map-wrap');
  const pnl =document.querySelector('aside.panel');
  const hdl =document.getElementById('mapHandle');
  if(!hdl||!wrap||!pnl) return;

  function isMobile(){ return window.innerWidth<=820; }

  function applyH(h, anim){
    if(anim) wrap.classList.add('anim'); else wrap.classList.remove('anim');
    wrap.style.height = h+'px';
    pnl.style.bottom  = h+'px';
    clearTimeout(applyH._t);
    applyH._t = setTimeout(()=>{
      try{ map.invalidateSize(); }catch(e){}
      wrap.classList.remove('anim');
    }, anim ? 310 : 30);
  }

  function snap(idx, anim=true){
    snapIdx = Math.max(0, Math.min(SNAPS.length-1, idx));
    applyH(Math.round(SNAPS[snapIdx]*window.innerHeight), anim);
  }

  // 드래그
  hdl.addEventListener('touchstart', e=>{
    if(!isMobile()) return;
    dragging=true; startY=e.touches[0].clientY; startH=wrap.offsetHeight;
    wrap.classList.remove('anim');
  },{passive:true});

  window.addEventListener('touchmove', e=>{
    if(!dragging||!isMobile()) return;
    const dy  = startY - e.touches[0].clientY;
    const min = SNAPS[0]*window.innerHeight;
    const max = SNAPS[SNAPS.length-1]*window.innerHeight;
    applyH(Math.max(min, Math.min(max, startH+dy)), false);
  },{passive:true});

  window.addEventListener('touchend', e=>{
    if(!dragging||!isMobile()) return;
    dragging=false;
    const f      = wrap.offsetHeight/window.innerHeight;
    const totalDy= startY - e.changedTouches[0].clientY;
    // 가장 가까운 스냅 포인트
    let best=0, bestD=Infinity;
    SNAPS.forEach((s,i)=>{ const d=Math.abs(s-f); if(d<bestD){bestD=d;best=i;} });
    // 빠른 스와이프면 방향으로 한 단계 이동
    if(Math.abs(totalDy)>50) best = totalDy>0
      ? Math.min(SNAPS.length-1, snapIdx+1)
      : Math.max(0, snapIdx-1);
    snap(best, true);
  },{passive:true});

  // 탭: 다음 단계로 순환
  hdl.addEventListener('click', ()=>{
    if(!isMobile()) return;
    snap((snapIdx+1)%SNAPS.length, true);
  });

  function init(){
    if(isMobile()) snap(snapIdx, false);
    else{ wrap.style.height=''; wrap.style.transition=''; pnl.style.bottom=''; }
  }
  window.addEventListener('resize', ()=>{ clearTimeout(init._t); init._t=setTimeout(init,80); });
  init();
})();

/* ---------- SERVICE WORKER ---------- */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
  // 오프라인 감지 배너
  const offlineBanner = document.createElement('div');
  offlineBanner.style.cssText='display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#1a1714;color:#fbf7ee;text-align:center;font-size:12px;padding:7px;font-family:Space Mono,monospace;letter-spacing:.05em';
  offlineBanner.textContent='📵 오프라인 — 저장된 일정과 지도 타일은 계속 사용 가능합니다';
  document.body.appendChild(offlineBanner);
  window.addEventListener('offline', ()=>{ offlineBanner.style.display='block'; });
  window.addEventListener('online',  ()=>{ offlineBanner.style.display='none';  });
}

/* ---------- LOGIN MODAL ---------- */
{
  let _selUser=null;
  const _ov=document.getElementById('loginOverlay');

  _ov.querySelectorAll('.login-user-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      _selUser=btn.dataset.user;
      _ov.querySelectorAll('.login-user-btn').forEach(b=>b.className='login-user-btn');
      btn.classList.add('sel',btn.dataset.user);
      document.getElementById('loginPwRow').style.display='block';
      document.getElementById('loginPw').value='';
      document.getElementById('loginPw').focus();
      document.getElementById('loginErr').textContent='';
    });
  });

  async function submitLogin(){
    if(!_selUser) return;
    const pw=document.getElementById('loginPw').value;
    if(!pw){ document.getElementById('loginErr').textContent='비밀번호를 입력하세요'; return; }
    const sub=document.getElementById('loginSub');
    sub.disabled=true; sub.textContent='...';
    document.getElementById('loginErr').textContent='';
    try{
      await doLogin(_selUser,pw);
      saveUserPref(_selUser);
      _ov.style.display='none';
      await initApp();
    }catch(e){
      document.getElementById('loginErr').textContent=e.message;
      sub.disabled=false; sub.textContent='입장 →';
    }
  }

  document.getElementById('loginSub').addEventListener('click',submitLogin);
  document.getElementById('loginPw').addEventListener('keydown',e=>{ if(e.key==='Enter') submitLogin(); });
  document.getElementById('loginSkip').addEventListener('click',async()=>{
    _ov.style.display='none';
    await initApp();
  });
}


/* 기존 저장 플랜에 달리기 코스 주입 (없는 날에만) */
function patchRunningCourses(){
  const RUNS = [
    {di:2, item:{time:'07:00', title:'🏃 아침 달리기 — 호수 이스트 루프 5km', note:'숙소 → Åboulevard → 상트요르겐스 호수 북쪽 → 페블링에 호수 동쪽 반바퀴 → 귀숙 · 약 30분 · 완전 평탄 포장', dist:'', _lat:55.6801, _lng:12.5631, _runningCourse:true, ...RUNNING_ROUTES[2]}},
    {di:3, item:{time:'07:00', title:'🏃 아침 달리기 — 3대 호수 풀 루프 7km', note:'숙소 → 상트요르겐스 → 페블링에 → 소르테담 호수 끝까지 → 반대편 돌아 귀숙 · 약 42분 · 코펜하겐 최고 인기 러닝 코스', dist:'', _lat:55.6855, _lng:12.5686, _runningCourse:true, ...RUNNING_ROUTES[3]}},
    {di:4, item:{time:'07:00', title:'🏃 아침 달리기 — 프레데릭스베르 공원 루프 5km', note:'숙소 → Gammel Kongevej → 프레데릭스베르 Have 메인게이트 → 공원 내부 루프 → 귀숙 · 약 30분 · 왕실 정원 자갈길', dist:'', _lat:55.6762, _lng:12.5265, _runningCourse:true, ...RUNNING_ROUTES[4]}},
    {di:5, item:{time:'07:00', title:'🏃 아침 달리기 — 하버 & 운하 루프 7km', note:'숙소 → 중앙역 → Langebro 다리 → Amager Blvd → 크리스티안스하운 운하 → Knippelsbro → 귀숙 · 약 42분 · 운하·항구 파노라마', dist:'', _lat:55.6700, _lng:12.5755, _runningCourse:true, ...RUNNING_ROUTES[5]}},
    {di:6, item:{time:'07:00', title:'🏃 아침 달리기 — 베스테르브로 & 시청광장 루프 5km', note:'숙소 → Vesterbrogade → Rådhuspladsen 시청광장 → H.C. Andersens Blvd → Istedgade → 귀숙 · 약 30분 · 아침 코펜하겐 도심 분위기', dist:'', _lat:55.6757, _lng:12.5680, _runningCourse:true, ...RUNNING_ROUTES[6]}},
    {di:7, item:{time:'07:00', title:'🏃 아침 달리기 — 프레데릭스베르 확장 루프 7km', note:'숙소 → Gammel Kongevej → 프레데릭스베르 Have → Frederiksberg Allé → 주택가 골목 → 귀숙 · 약 42분 · 왕실 정원 + 고급 주거지구', dist:'', _lat:55.6780, _lng:12.5200, _runningCourse:true, ...RUNNING_ROUTES[7]}},
  ];
  let changed = false;
  RUNS.forEach(({di, item})=>{
    if(!plan[di]) return;
    if(plan[di].items.some(it=>it._runningCourse)) return; // 이미 있으면 스킵
    plan[di].items.push({...item});
    sortDayByTime(di);
    changed = true;
  });
  if(changed) savePlan();
}

/* 기존 저장 플랜의 항공편·공항 항목에 좌표 주입 */
function patchFlightCoords(){
  const ICN = {lat:37.4692, lng:126.4503}; // 인천국제공항
  const CPH = {lat:55.6180, lng:12.6560};  // 코펜하겐 공항
  const flightKw = /ICN|CPH|AMS|LHR|공항|출발|도착|터미널|T2|T3/i;
  let changed = false;
  plan.forEach(day=>{
    day.items.forEach(it=>{
      if(!it._fixed || (it._lat && it._lng)) return;
      if(!flightKw.test(it.title)) return;
      if(/ICN|인천/.test(it.title)){ it._lat=ICN.lat; it._lng=ICN.lng; changed=true; }
      else if(/CPH|코펜/.test(it.title)){ it._lat=CPH.lat; it._lng=CPH.lng; changed=true; }
    });
  });
  if(changed) savePlan();
}

async function initApp(){
  if(authToken){
    const d=await serverGet();
    if(!authToken){ // 401 — 토큰 만료
      document.getElementById('loginOverlay').style.display='flex';
      return;
    }
    if(d?.plan){
      plan=d.plan;
      try{ localStorage.setItem(STORE_KEY,JSON.stringify(plan)); }catch(e){}
    }
    if(d?.favs){
      favorites=new Set(d.favs);
      try{ localStorage.setItem(FAV_KEY,JSON.stringify(d.favs)); }catch(e){}
    }
    if(d?.wishlist){
      wishlist=d.wishlist;
      try{ localStorage.setItem(WISH_KEY,JSON.stringify(d.wishlist)); }catch(e){}
    }
  }
  patchRunningCourses();
  patchFlightCoords();
  plan.forEach(day=>day.items.forEach(it=>{
    if(it._user&&it._lat&&it._lng) addUserMarker({title:it.title,note:it.note,lat:it._lat,lng:it._lng});
  }));
  updateUserSelector();
  setTab('plan');
}

/* ---------- INIT ---------- */
(async()=>{
  loadUserPref();
  await loadPlan(); // localStorage에서 즉시 로드
  if(!authToken){
    document.getElementById('loginOverlay').style.display='flex';
  } else {
    await initApp();
  }
})();

// 1분마다 경과 시간 기반 음영 자동 갱신
setInterval(updatePastItems, 60000);
