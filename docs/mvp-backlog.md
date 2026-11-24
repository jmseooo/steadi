# Steadi MVP 남은 일

마지막 정리: 2026-11-24 · 기준 브랜치 `mvp`
끝난 일은 `[x]`로 바꾸고, 새로 생긴 일은 해당 칸 아래에 추가한다. 담당: 민서(리드·분석) / 제나(수집)

## 지금까지 끝난 것

- [x] Supabase 프로젝트 (조직 Steadi · Steadi-project · 도쿄), 민서 Developer 초대
- [x] `mvp` 브랜치, `CLAUDE.md` 작업 규칙, Vercel 미리보기 환경변수 (Supabase 주소·키, Gemini 키)
- [x] 데이터 형식 `src/lib/model.ts` (줄바꿈은 Figma처럼 AI가 넣음)
- [x] 데이터 함수 입구 `src/lib/data.ts` — 화면은 page.tsx → 데이터 함수 → props로만 데이터를 받는다
- [x] DB 표 초안 `supabase/mvp/schema.sql` (표 13개, RLS, 탈퇴 시 전부 삭제)
- [x] Gemini 실험 `scripts/ai/digest.mjs` — 가짜 카톡 → 경험 카드 5장, 화면 규칙 통과

## 0주차 · 합류 준비

- [ ] **제나** GitHub 초대(JenaSeo) 수락 → `git switch mvp` → `npm ci` → `.env.local` 넣기 → `npm run dev`
- [ ] **민서** 제나에게 `.env.local` 값 3개 비공개 전달 (`NEXT_PUBLIC_APP_SUPABASE_URL`, `..._PUBLISHABLE_KEY`, `GEMINI_API_KEY`)

## DB 표

- [ ] **같이** 검토할 것 3개
  - [ ] `raw_records` 저장 단위: 카톡 한 줄마다? 몇 분 단위 대화 묶음? (파서 담당 제나가 정함)
  - [ ] `connections.scope` 형식: 노션에서 고른 페이지, 카톡 대화방 이름을 어떤 모양으로 둘지
  - [ ] 연동별 원본 링크(`url`) 저장 방식: 노션은 페이지 주소, 카톡은 없음
- [ ] 검토 반영 후 Supabase SQL Editor에서 `supabase/mvp/schema.sql` 실행
- [ ] **제나(Owner)** 새벽 배치용 Supabase secret 키 발급 → 서버 환경변수로 (Developer 권한으로는 못 볼 수 있음)
- [ ] 검토 후 고려: `raw_records.project_id` 등이 남의 프로젝트를 가리키지 못하게 막기 (지금은 외래키만 있음)
- [ ] 검토 후 고려: AI가 만든 카드는 브라우저에서 상태 칸(보관·메모·읽음·닫기)만 고치게 좁히기 (지금은 자기 줄이면 모든 칸)

## AI (민서)

- [ ] **무료 등급 503 대비** — 실험 중 "요청이 몰려 있음"(503)이 자주 났고, 5·15·45초 뒤 다시 시도해도 실패한 적이 있다.
  새벽 배치는 실패한 사용자·프로젝트를 표시해 두고 다음 날 다시 처리하게 만든다. 한 번에 몰아 부르지 말고 사이에 간격을 둔다.
- [ ] **모델은 `gemini-3.5-flash-lite` 유지** — 상위 `gemini-3.5-flash`는 오히려 줄 길이 규칙을 4번 넘겼다. lite가 빠르고(약 14초) 규칙도 지켰다.
- [ ] **프롬프트 수정 재확인** — 피드백 이름 띄어쓰기("위치변경요청" → "위치 변경 요청"), 피드백 요약 해요체. 프롬프트는 고쳤고 503 때문에 결과 확인 못 함
- [ ] 같은 기록으로 여러 번 돌려 결과가 얼마나 흔들리는지 확인
- [ ] 실험 코드를 실제 서버 코드(`src/lib/ai/`)로 옮기기: 프로젝트 묶기, 목표 대화, 프로젝트 정리, 연결된 경험 만들기
- [ ] 임베딩(`gemini-embedding-001`, 768차원)으로 비슷한 경험 카드 찾기 → 연결된 경험 + 제안 카드
- [ ] 새벽 배치 (Vercel Cron 하루 1회)

## 화면 데이터 연결 (민서)

데이터 함수(`src/lib/data.ts`)를 아직 거치지 않는 화면. 실제 데이터가 생기는 시점에 같이 옮긴다.

- [ ] GNB 알림 목록 (`Notifications.tsx`)
- [ ] 프로필·서비스 연결·알림 설정 (`Profile.tsx`)
- [ ] 온보딩 찾은 프로젝트·목표 대화 (`onboarding/data.ts`)
- [ ] 경험 카드 자세히 보기 본문 (`ExperienceModal.tsx` — 지금은 모든 카드가 같은 샘플 문구)
- [ ] 성장 그림 미리 받기 (`GrowthPreload.tsx`)
- [ ] 데이터 함수 속을 가짜 데이터 → Supabase 조회로 바꾸기 (model.ts 형식 → 화면 타입 변환)
- [ ] 화면 문구: "83% 확신" → "근거 기록 N개", 히스토리 "확인하고 있어요" → "새벽 3시 동기화 완료" 같은 기록, 온보딩 "기기에서 찾기" → 연결 버튼 직접

## 수집 (제나)

- [ ] 카카오·구글 로그인 (Google Cloud, Kakao Developers 앱 등록 → Supabase Auth 연결)
- [ ] 카톡 대화 파일 업로드 + 파서 (`scripts/ai/digest.mjs`의 PC 내보내기 파서 참고, 모바일 내보내기 형식도 확인)
- [ ] AI 분석 동의 화면, 업로드 화면, 온보딩 연결 화면
- [ ] Notion 연동 (OAuth, 사용자가 고른 페이지만)
- [ ] AI 대화 파일(ChatGPT·Claude) 파서, 사진 업로드
- [ ] Profile 연동 추가·해제, 회원 탈퇴
- [ ] 7주차부터: 캘린더 · Drive · Slack → GitHub · Figma · Discord

## 같이

- [ ] 격주로 실제 기록을 넣어 카드가 잘 나오는지 확인
- [ ] 9~10주차 사용자 5~10명 테스트, 데모 영상
- [ ] 테스트를 다른 사람에게 받을 때 Vercel 미리보기 주소의 로그인 보호 끄기
