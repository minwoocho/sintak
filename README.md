# SINTAK

전인구경제연구소 영상의 시장 전망과 다음 거래일 움직임을 비교하는 SvelteKit 정적 대시보드입니다. GitHub Pages에 무료로 배포하며 GitHub Actions가 매일 데이터를 갱신합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

API 키 없이 실행하면 예시 데이터가 표시됩니다.

## 실제 데이터 생성

Google Cloud에서 YouTube Data API v3 키를 만든 뒤 `.env.example`을 참고해 환경 변수를 설정합니다. 실제 `.env`는 Git에 포함되지 않습니다.

```bash
export YOUTUBE_API_KEY='your-key'
npm run sync:data
```

동기화 작업은 다음을 수행합니다.

1. 채널 업로드 재생목록을 최신부터 2025년 1월까지 조회
2. 제목·설명에서 나스닥/코스피 및 상승/하락이 모두 명확한 영상 선별
3. Yahoo Finance의 `^IXIC`, `^KS11` 일봉 조회
4. 게시 후 최초 거래 세션의 시가·종가 연결
5. `src/lib/data/oracles.json` 갱신

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소의 `main` 브랜치에 푸시합니다.
2. 저장소 `Settings → Secrets and variables → Actions`로 이동합니다.
3. Repository secret `YOUTUBE_API_KEY`를 등록합니다.
4. `Settings → Pages → Build and deployment`의 Source를 **GitHub Actions**로 선택합니다.
5. `Actions → Sync data and deploy Pages → Run workflow`를 한 번 실행합니다.

이후 워크플로는 매일 UTC 22:15, 한국 시간 오전 7:15에 실행됩니다. 생성된 데이터 JSON은 `github-actions[bot]`이 자동 커밋합니다.

## 검증

```bash
npm run check
npm run build
```

## 주의

- 제목과 설명 기반의 보수적인 규칙 분류이며 애매한 영상은 제외합니다.
- 데이터 생성 결과는 관리자나 연구자가 검토하는 것이 좋습니다.
- 이 프로젝트는 오락·연구 목적이며 투자 권유가 아닙니다.
