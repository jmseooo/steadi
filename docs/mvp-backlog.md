# Steadi MVP 남은 일

마지막 정리: 2026-11-24 · 기준 브랜치 `mvp`
끝난 일은 `[x]`로 바꾸고, 새로 생긴 일은 해당 칸 아래에 추가한다. 담당: 민서(리드·뼈대) / 제나(로그인·카톡·동의) / 윤진(AI 대화·사진·캘린더) / 다현(화면). 항목 앞 ①~⑤는 핵심 흐름 순서, 🟢 쉬움 · 🟡 보통 · 🔴 어려움(민서)

**진행 방식: 주차 일정 없이 ASAP.** 기능 하나가 끝나면 바로 다음으로 간다. 순서는 아래 "핵심 흐름 순서"를 따르고, 막히는 일은 기다리지 말고 다른 일부터 한다.

### 핵심 흐름 순서
1. 로그인 → 내 데이터만 보인다
2. 카톡·노션 기록이 DB에 쌓인다
3. 쌓인 기록으로 Project 화면이 채워진다 (AI 1차 — 가장 중요)
4. Home·Growth·Connection이 매일 새로 바뀐다 (새벽 배치·연결된 경험)
5. 연동 늘리기, 사용자 테스트

## 지금까지 끝난 것

- [x] Supabase 프로젝트 (조직 Steadi · Steadi-project · 도쿄), 민서 Developer 초대
- [x] `mvp` 브랜치, `CLAUDE.md` 작업 규칙, Vercel 미리보기 환경변수 (Supabase 주소·키, Gemini 키)
- [x] 데이터 형식 `src/lib/model.ts` (줄바꿈은 Figma처럼 AI가 넣음)
- [x] 데이터 함수 입구 `src/lib/data.ts` — 화면은 page.tsx → 데이터 함수 → props로만 데이터를 받는다
- [x] DB 표 초안 `supabase/mvp/schema.sql` (표 13개, RLS, 탈퇴 시 전부 삭제)
- [x] Gemini 실험 `scripts/ai/digest.mjs` — 가짜 카톡 → 경험 카드 5장, 화면 규칙 통과

## 합류 준비 (지금)

- [x] **제나** GitHub 초대(JenaSeo) 수락
- [ ] **제나** `git switch mvp` → `npm ci` → `.env.local` 넣기 → `npm run dev`
- [ ] **민서** 제나에게 제나용 합류 안내 보내기 (아래 "합류 안내"에서 GitHub·Supabase 초대 줄 빼고, Owner 일 추가: 윤진·다현 Developer 초대, secret 키 민서에게 개인 메시지로)
- [ ] **민서** 제나에게 `.env.local` Supabase 값 2개 비공개 전달 (`NEXT_PUBLIC_APP_SUPABASE_URL`, `..._PUBLISHABLE_KEY`). Gemini 키는 제나가 직접 발급

- [ ] **팀원 2명 추가 합류** (2026-11-24 결정)
  - [ ] **민서** 윤진·다현에게 합류 안내 보내기 (아래 "합류 안내" 문구 그대로)
  - [ ] 윤진: GitHub `yunjin4011014-hub`가 윤진 계정인지 확인 (이미 레포 협업자라 맞으면 초대 불필요)
  - [ ] 다현: GitHub 아이디 받아 레포 초대
  - [ ] 제나(Supabase Owner)가 `Steadi` 조직에 Developer로 초대
  - [x] `CLAUDE.md` 규칙 4명 기준으로 갱신 (합류 예정 2칸, 백로그에 이름 적고 시작, 데이터는 data.ts로만, mvp 직접 푸시 금지, PR 전 검사, Gemini 키 각자)
  - [x] 역할 나누기 → 모두 개발, 가장 어려운 뼈대(🔴)만 민서: 제나(로그인·카톡·동의) · 윤진(AI 대화·사진·캘린더) · 다현(화면)
  - [x] 이름 정하기: 윤진(AI 대화·사진·캘린더), 다현(화면)
  - [ ] GitHub 아이디 확인되면 `CLAUDE.md` 역할 표 채우기
  - [ ] 각자 Gemini 개발용 키 따로 발급 (무료 한도를 4명이 나눠 쓰지 않게)
  - [ ] `.env.local` 값 비공개 전달, 첫 실행 확인

## DB 표

- [x] **민서** 결정할 것 3개 (2026-11-26)
  - [x] `raw_records` 저장 단위: 카톡·AI 대화는 메시지 1개, 노션은 페이지 1개, 캘린더는 일정 1개 = 1줄. 노션·캘린더는 원본이 고쳐지면 덮어씀
  - [x] `connections.scope` 형식: 모든 서비스 `[{ id?, title }]`
  - [x] 원본 링크(`url`): 있는 곳(노션·캘린더)만 저장, 카톡·AI 대화는 저장된 원문을 보여 줌
- [x] Supabase SQL Editor에서 `supabase/mvp/schema.sql` 실행 (표 13개, 전부 RLS, 로그인 안 하면 401 확인)
- [ ] 표를 바꿀 때는 `schema.sql`을 다시 돌리지 않고 `supabase/mvp/` 아래 변경 SQL을 새 파일로 남긴다 (이미 실행됨)
- [ ] **제나(Owner)** 새벽 배치용 Supabase secret 키 발급 → 민서가 서버 환경변수로 (Developer 권한으로는 못 볼 수 있음)
- [x] 남의 프로젝트·연결 카드를 가리키지 못하게 막기 (`(id, user_id)` 외래키)
- [x] AI가 만든 표는 브라우저에서 상태 칸(보관·메모·성장의 순간·읽음·닫기)만 고치게 (칸 단위 grant). 프로필은 이름·알림 설정만

## AI (민서)

- [ ] **무료 등급 503 대비** — 실험 중 "요청이 몰려 있음"(503)이 자주 났고, 5·15·45초 뒤 다시 시도해도 실패한 적이 있다.
  새벽 배치는 실패한 사용자·프로젝트를 표시해 두고 다음 날 다시 처리하게 만든다. 한 번에 몰아 부르지 말고 사이에 간격을 둔다.
- [ ] **모델은 `gemini-3.5-flash-lite` 유지** — 상위 `gemini-3.5-flash`는 오히려 줄 길이 규칙을 4번 넘겼다. lite가 빠르고(약 14초) 규칙도 지켰다.
- [ ] **프롬프트 수정 재확인** — 피드백 이름 띄어쓰기("위치변경요청" → "위치 변경 요청"), 피드백 요약 해요체. 프롬프트는 고쳤고 503 때문에 결과 확인 못 함
- [ ] 같은 기록으로 여러 번 돌려 결과가 얼마나 흔들리는지 확인
- [ ] 실험 코드를 실제 서버 코드(`src/lib/ai/`)로 옮기기: 프로젝트 묶기, 목표 대화, 프로젝트 정리, 연결된 경험 만들기
- [ ] 임베딩(`gemini-embedding-001`, 768차원)으로 비슷한 경험 카드 찾기 → 연결된 경험 + 제안 카드
- [ ] 새벽 배치 (Vercel Cron 하루 1회)

## 나누는 원칙

모두 개발한다. 다만 **가장 어려운 부분은 민서가 맡는다**: 로그인 세션·보안의 뼈대, DB 표·RLS, 연동 토큰 보관, Gemini 프롬프트·새벽 배치·임베딩, 데이터 함수의 Supabase 연결 구조.
나머지 개발은 제나·윤진·다현이 나눠 맡는다. 민서가 뼈대(로그인, 저장 함수, 데이터 형식)를 먼저 깔고, 그 위에 각자 기능을 붙이는 순서.
처음 PR은 🟢로 프로젝트 구조에 익숙해지고 🟡로 넘어간다. 🔴는 민서.

## 민서 (리드) — 위 "AI"·"DB 표" 칸 포함

- [x] 🔴 ① DB 표 검토 3개 결정 → `schema.sql` 실행, RLS 확인
- [x] 🔴 ① 로그인 뼈대: Supabase Auth 클라이언트·세션 유지·로그인 안 된 사용자 막기 (버튼 연결은 제나) — `src/lib/supabase/`, `src/lib/auth.ts`, `src/proxy.ts`, `/auth/callback`
- [ ] 카카오·구글 공급자가 켜지면: 실제 로그인으로 세션·RLS(내 데이터만 보임) 확인 → `STEADI_REQUIRE_LOGIN=1`을 Vercel 미리보기에 켜기
- [x] 🔴 ② 원본 기록 저장 함수(`raw_records`에 넣기·중복 막기) — `src/lib/records.ts` `saveRawRecords`, 입력 모양 `NewRawRecord`(model.ts)
- [ ] 실제 로그인 세션으로 `saveRawRecords` 한 번 돌려 보기 (카카오·구글 공급자 켜진 뒤)
- [x] 🔴 ② Notion 연동 코드 — 공개 통합 "Steadi" 등록(읽기 전용), `/api/notion/connect` → 콜백 → 토큰 저장(`save_connection`, `002_save_connection.sql` 실행됨) → 고른 페이지 읽기 → `saveRawRecords`
- [ ] 노션 연결 실제로 해 보기 (로그인이 돼야 함 — 카카오·구글 또는 시험용 로그인)
- [ ] 노션 다시 읽기(새벽 배치)와 토큰 갱신 — 배치 만들 때
- [ ] 🔴 ③ 데이터 함수(`src/lib/data.ts`)를 Supabase 조회로 바꾸는 구조 + Project부터 연결
- [x] 🔴 ③ 프로젝트 묶기·온보딩 목표 대화 Gemini 호출 — `src/lib/ai/` (`gemini.ts` 공통·재시도, `group.ts` `groupProjects`, `goal.ts` `askGoal`·`reflectGoal`). 섞인 시험 기록 31개 → 프로젝트 3개, 잡담 제외 확인
- [ ] 온보딩 화면에 연결: 연동 끝 → 기록 읽기 → `groupProjects` → `projects`에 저장 → 목표 대화 (다현 온보딩 연결 화면과 맞추기)
- [ ] 🔴 ④ 새벽 배치, 임베딩, 연결된 경험
- [x] 제나 콘솔 설정 안내서 `docs/team/jena-console.md`
- [ ] 제나에게 Vercel 미리보기 주소 패턴 개인 메시지로 전달 (Supabase Redirect URLs용)
- [ ] PR 리뷰·합치기

## 제나 (로그인 · 카톡 · 동의)

- [ ] 🟢 Supabase Owner 일: 윤진·다현을 `Steadi` 조직에 Developer로 초대, secret 키 발급해 민서에게 비공개 전달
- [ ] 🟡 Kakao Developers 앱 등록 + Google Cloud OAuth 클라이언트 → Supabase Auth 공급자 설정 (`docs/team/jena-console.md`)
- [ ] 🟡 ① 로그인 화면 버튼을 실제 카카오·구글 로그인에 연결, 로그아웃 (민서 로그인 뼈대 위에)
- [ ] 🟡 ② 카톡 대화 파일 파서를 `src/`로 옮기기 (`scripts/ai/digest.mjs`의 `parseKakao`에서 시작) + 아이폰·안드로이드 내보내기 형식 지원
- [ ] 🟡 ② 카톡 파일 업로드 → 파서 → 민서의 저장 함수로 `raw_records`에 넣기
- [ ] 🟡 ② AI 분석 동의: 화면에서 고른 대화방을 `consents`에 저장, 동의 안 한 기록은 분석에서 빼기

## 윤진 (AI 대화 · 사진 · 캘린더)

- [ ] 🟢 시험용 가짜 대화 만들기: `scripts/ai/samples/kakao-band.txt`처럼 마케팅 공모전·자기소개서·영어 스터디 각 20~30줄 → `node scripts/ai/digest.mjs [파일]`로 돌려 보기
- [ ] 🟡 ② AI 대화 파일 파서: ChatGPT·Claude 내보내기 파일(JSON)을 읽어 카톡 파서와 같은 모양으로 → 저장 함수로 넣기
- [ ] 🟡 ② 사진 업로드: 사용자가 고른 사진만, 압축해서 Supabase Storage에 (사진 설명 글은 `raw_records`에)
- [ ] 🟡 ⑤ Google 캘린더 일정 읽기 (읽기 전용) → `raw_records`
- [ ] 🟡 Profile > 서비스 연결: 연결된 서비스 목록 보여 주기·해제 (`connections`)
- [ ] 🟡 AI 결과 검수표: 카드마다 "기록에 있는 내용인가 / 내가 한 행동인가 / 줄바꿈이 Figma 같은가" — 프롬프트 고칠 근거로

## 다현 (화면)

화면은 데이터 함수(`src/lib/data.ts`)로만 데이터를 받는다. 새 데이터 모양이 필요하면 민서와 `src/lib/model.ts`부터 정한다.

- [ ] 🟢 문구: "83% 확신" → "근거 기록 N개" (`project-detail/Cards.tsx`), 온보딩 "기기에서 찾기" → 직접 골라 연결 (`onboarding/data.ts`), 히스토리 "확인하고 있어요"·"진행중" → 끝난 작업 기록 (`home/History.tsx`)
- [ ] 🟡 ③ 아직 데이터 함수를 안 거치는 화면 옮기기: 알림(`Notifications.tsx`), 프로필(`Profile.tsx`), 경험 카드 자세히 보기 본문(`ExperienceModal.tsx`) — `src/lib/data.ts`의 기존 함수들을 본보기로
- [ ] 🟡 ② AI 분석 동의 화면, 카톡 파일 업로드 화면 (저장은 제나와 맞추기)
- [ ] 🟡 ② 온보딩 연결 화면: 서비스 목록에서 연결 버튼 직접 누르기, 연결 진행 상황·"끝나면 알려드릴게요"
- [ ] 🟡 빈 화면·로딩·오류 (프로젝트·카드·피드백이 없거나 AI가 아직 안 돌았을 때)
- [ ] 🟡 로그아웃·회원 탈퇴 확인 창, 타임라인 단계 직접 고치기, "참석 여부 답하기" → 답장 초안 복사 창

## 같이

- [ ] 기능이 하나 붙을 때마다 실제 기록을 넣어 카드가 잘 나오는지 확인
- [ ] 핵심 흐름 4번까지 돌면 사용자 5~10명 테스트, 데모 영상
- [ ] 테스트를 다른 사람에게 받을 때 Vercel 미리보기 주소의 로그인 보호 끄기

## 합류 안내 (새 팀원에게 그대로 보내기)

사람별로 합류 안내와 할 일을 합친 파일: `docs/team/jena.md` · `docs/team/yunjin.md` · `docs/team/dahyun.md` — 이 파일 하나만 보내면 된다.

**준비물**
- GitHub 계정 (아이디 알려 주기 → 레포 초대 수락)
- Supabase 계정 (GitHub로 가입 → 가입한 이메일 알려 주기 → 제나가 보낸 초대 메일 수락)
- Node.js 20 이상, Claude Code
- Gemini API 키: https://aistudio.google.com/apikey 에서 각자 발급

**처음 실행**
```
git clone https://github.com/jmseooo/steadi.git
cd steadi
git switch mvp
npm ci
```
`steadi` 폴더에 `.env.local`을 만들고 민서가 따로 보낸 값 2개(`NEXT_PUBLIC_APP_SUPABASE_URL`, `NEXT_PUBLIC_APP_SUPABASE_PUBLISHABLE_KEY`)와 본인 `GEMINI_API_KEY`를 넣는다.
`npm run dev` → http://localhost:3120

**꼭 읽기**: `CLAUDE.md`(작업 규칙, Claude Code가 자동으로 읽음), `docs/mvp-backlog.md`(남은 일·담당)

**규칙**
- 일을 시작하기 전에 백로그 항목에 자기 이름 적기
- `mvp`에서 기능마다 브랜치(`feat/이름`) → PR을 `mvp`로 → 민서 리뷰 후 합침 (`mvp`에 직접 푸시 금지)
- PR 전에 `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과 확인
- 키·비밀번호는 코드·PR·이슈에 절대 쓰지 않는다 (레포 공개)
- 운영 주소(steadi-gold)에 배포하지 않는다 (`--prod` 금지)
