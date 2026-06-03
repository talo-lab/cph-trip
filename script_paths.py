# script_paths.py — 데이터 경로 공통 유틸
# 모든 Python 스크립트가 이 모듈을 통해 경로를 해석합니다.
# 절대 경로를 코드에 직접 박지 않도록 합니다.

import os
import pathlib

# repo 루트 = 이 파일이 있는 디렉터리
REPO_ROOT = pathlib.Path(__file__).parent.resolve()

# 출력 JS 파일 경로 (repo 루트 기준, 고정)
EVENTS_JS      = REPO_ROOT / 'events-data.js'
EXHIBITIONS_JS = REPO_ROOT / 'exhibitions-data.js'


def get_data_dir() -> pathlib.Path:
    """
    원천 JSON 데이터 폴더를 반환합니다.

    탐색 순서:
      1. 환경변수 CPH_TRIP_DATA_DIR
      2. repo 내 data/3daysofdesign
      3. 상위 output/3daysofdesign  (기존 로컬 레이아웃)
      4. 상위 New project/output/3daysofdesign  (기존 로컬 레이아웃)
    """
    env = os.environ.get('CPH_TRIP_DATA_DIR', '').strip()
    if env:
        p = pathlib.Path(env)
        if p.is_dir():
            return p
        raise FileNotFoundError(
            f'CPH_TRIP_DATA_DIR={env} 폴더를 찾을 수 없습니다.'
        )

    candidates = [
        REPO_ROOT / 'data' / '3daysofdesign',
        REPO_ROOT.parent / 'output' / '3daysofdesign',
        REPO_ROOT.parent / 'New project' / 'output' / '3daysofdesign',
    ]
    for p in candidates:
        if p.is_dir():
            return p

    raise FileNotFoundError(
        '원천 JSON 데이터 폴더를 찾을 수 없습니다.\n'
        '다음 중 하나를 수행하세요:\n'
        '  1. 환경변수 설정: $env:CPH_TRIP_DATA_DIR = "C:\\path\\to\\3daysofdesign"\n'
        '  2. 폴더 생성: repo_root/data/3daysofdesign/ 에 JSON 파일 배치'
    )
