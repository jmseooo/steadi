# 다현 — 화면

Steadi MVP 합류 안내와 할 일. **이 문서 하나만 보고 시작부터 PR까지 할 수 있게** 썼다. 막히면 Claude Code에게 이 문서를 보여 주고 물어본다.

## 0. 준비물

- [ ] GitHub 계정 → 아이디를 민서에게 알려 주고, 메일로 온 레포 초대 수락
- [ ] Supabase 계정 (https://supabase.com 에서 GitHub로 가입) → 가입한 이메일을 민서에게 **개인 메시지로** 알려 주고, 제나가 보낸 초대 메일 수락
- [ ] Node.js 22 이상 (터미널에 `node -v` → `v22` 이상이면 OK)
- [ ] Claude Code 설치·로그인
- [ ] GitHub CLI: `brew install gh` → `gh auth login` (Claude Code가 푸시·PR을 올릴 때 쓴다)
- [ ] Gemini API 키: https://aistudio.google.com/apikey 에서 **본인 것**으로 발급 (무료 한도를 나눠 쓰지 않게)

> 처음이라 막막하면: 아무 폴더에서 `claude`를 실행하고 이 문서 전체를 붙여 넣은 뒤 "0번·1번 같이 해줘"라고 하면 된다.

## 1. 처음 실행

```
git clone https://github.com/jmseooo/steadi.git
cd steadi
git switch mvp
npm ci
```

`steadi` 폴더에 `.env.local` 파일을 만들고 아래 3줄을 넣는다. 위 2줄 값은 민서가 개인 메시지로 보낸다.

```
NEXT_PUBLIC_APP_SUPABASE_URL=민서가 보낸 값
NEXT_PUBLIC_APP_SUPABASE_PUBLISHABLE_KEY=민서가 보낸 값
GEMINI_API_KEY=본인 키
```

`npm run dev` → 브라우저에서 http://localhost:3120 이 열리면 준비 끝.
(localhost는 **내 컴퓨터에서만** 보이는 주소다. 내가 고친 화면을 내가 확인하는 용도. 3120은 이 프로젝트에 정해 둔 번호)

## 2. 꼭 읽기

- `CLAUDE.md` — 팀 작업 규칙. Claude Code가 자동으로 읽고 따른다
- `docs/mvp-backlog.md` — 전체 남은 일. 끝난 일은 `[x]`

## 3. 작업하는 법 (시작부터 합쳐질 때까지)

git 명령은 외울 필요 없다. `steadi` 폴더에서 `claude`를 실행하고 아래처럼 말하면 된다. 소통은 **GitHub PR**에서 한다 (리뷰 요청·댓글·합침 알림이 GitHub 메일로 온다).

**① 시작 — 할 일 하나 고르기**
먼저 https://github.com/jmseooo/steadi/pulls 에서 같은 일을 누가 하고 있지 않은지 본다. 그다음:
→ "나는 다현이야. docs/team/dahyun.md 할 일 1번 시작하자. mvp 최신으로 받고 브랜치 만들고, 백로그 그 항목에 내 이름 적어서 draft PR로 올려줘"
- Claude Code가 `feat/…` 브랜치를 만들고, 빈 작업 상태의 **draft PR**을 올린다. 다른 사람이 PR 목록에서 "누가 무엇을 하는 중인지" 볼 수 있다.
- `mvp` 브랜치에 바로 커밋·푸시하지 않는다.
- `mvp`를 최신으로 받은 뒤에는 `npm ci`를 한 번 한다 (새 패키지가 추가됐을 수 있다. 안 하면 localhost가 안 열리거나 `Module not found` 오류). Claude Code에게 "mvp 최신으로 받고 npm ci 해줘"라고 해도 된다

**② 작업**
- 하고 싶은 걸 말로 시키고, 결과는 http://localhost:3120 (내 컴퓨터)에서 확인한다.
- 중간중간 "지금까지 커밋 푸시해줘" — 날아갈 걱정이 없고 PR에 진행 상황이 쌓인다.
- 막히면 에러 메시지를 그대로 붙여 넣고 "이거 왜 안 돼?"
- Claude Code가 뼈대 파일(`src/lib/model.ts`, `src/lib/data.ts`의 기존 함수 모양, `supabase/`)을 고치려 하면 멈추고, PR 댓글로 민서에게 물어본다. (`data.ts`에 새 함수를 **추가**하는 건 괜찮다)

**③ 끝 — 리뷰 요청**
→ "검사 돌리고(tsc·lint·build) 커밋 푸시한 다음, 백로그 그 항목 체크하고 PR을 리뷰 준비 완료로 바꾸고 jmseooo를 리뷰어로 지정해줘"
- 검사가 실패하면 "고쳐줘".
- 화면을 바꿨다면 PR 페이지(github.com)에 들어가 설명란에 스크린샷을 끌어다 놓는다.
- PR에 Vercel이 미리보기 링크를 자동으로 단다. 지금은 민서 계정에서만 열린다 (각자 확인은 localhost로).

**④ 리뷰 → 합침 → 다음 일**
- 민서가 댓글을 달면 → "PR 댓글 반영해줘"
- 민서가 합치면 GitHub 알림이 온다 → "mvp 최신으로 받고 다음 할 일 시작하자" (다시 ①)

## 4. 하지 않을 것

- `mvp`·`main`에 직접 푸시하지 않기
- 키·비밀번호·`.env.local`을 코드·PR·이슈·단톡방에 올리지 않기 (레포가 공개다. 전달은 개인 메시지로만)
- 실제 카톡·AI 대화 파일을 커밋하지 않기 (다른 사람 대화가 들어 있다. 시험 파일은 가짜로 만든다)
- `vercel --prod` 등 운영 주소(steadi-gold) 배포하지 않기

## 5. 할 일

화면은 `src/lib/data.ts`(데이터 함수)로만 데이터를 받는다. `page.tsx`가 데이터 함수를 부르고 → 화면 컴포넌트에 props로 넘기는 구조. `src/app/projects/page.tsx`를 먼저 보면 이해가 쉽다.

### 바로 할 수 있는 것

1. 🟢 **문구 바꾸기**
   - "83% 확신" → "근거 기록 N개": `src/components/project-detail/Cards.tsx` 74줄. 값도 `confidence` 대신 `evidenceCount`(이미 `src/lib/model.ts`에 있음)를 쓰게
   - 온보딩 "기기에서 찾기" → 서비스를 직접 골라 연결: `src/components/onboarding/data.ts`, `Onboarding.tsx`
   - 히스토리 "확인하고 있어요" → "확인했어요" 같은 끝난 작업 기록: `src/components/home/data.ts` 73~75줄, 필터의 "진행중"(`src/components/home/History.tsx`) 정리
2. 🟡 **데이터 함수로 화면 옮기기**: 화면 파일 안의 가짜 데이터를 `src/lib/data.ts`의 새 함수로 빼고 props로 받게
   - 알림 `src/components/Notifications.tsx`, 프로필 `src/components/Profile.tsx`, 경험 카드 자세히 보기 `src/components/project-detail/ExperienceModal.tsx`
   - `data.ts`의 `getProjects`·`getMoments` 등을 본보기로. 옮긴 뒤 화면이 전과 똑같아야 한다
3. 🟡 **빈 화면·로딩·오류**: 프로젝트·카드·피드백이 하나도 없을 때, AI가 아직 안 돌았을 때 보일 화면 (Figma에 없으면 민서와 먼저 정하기)
4. 🟡 **확인 창**: 로그아웃·회원 탈퇴 확인 창, "참석 여부 답하기" → 답장 초안을 보여 주고 복사하는 창

### 제나·민서 작업과 맞물리는 것

5. 🟡 AI 분석 동의 화면, 카톡 파일 업로드 화면 — 화면은 먼저 만들 수 있고, 저장 연결은 제나와 PR 댓글로 맞추기
6. 🟡 온보딩 연결 화면: 서비스 목록에서 연결 버튼 직접 누르기, 연결 진행 상황·"끝나면 알려드릴게요"
7. 🟡 타임라인 단계 직접 고치기 (Project 상세)

예상 시간: 20~31시간
