# 제나 — 로그인 · 카톡 · 동의

Steadi MVP 합류 안내와 할 일. **이 문서 하나만 보고 시작부터 PR까지 할 수 있게** 썼다. 막히면 Claude Code에게 이 문서를 보여 주고 물어본다.

## 0. 준비물

- [x] GitHub: 레포 초대 수락 완료
- [x] Supabase: `Steadi` 조직 Owner라 가입·초대 필요 없음
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
→ "나는 제나이야. docs/team/jena.md 할 일 1번 시작하자. mvp 최신으로 받고 브랜치 만들고, 백로그 그 항목에 내 이름 적어서 draft PR로 올려줘"
- Claude Code가 `feat/…` 브랜치를 만들고, 빈 작업 상태의 **draft PR**을 올린다. 다른 사람이 PR 목록에서 "누가 무엇을 하는 중인지" 볼 수 있다.
- `mvp` 브랜치에 바로 커밋·푸시하지 않는다.

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

### 바로 할 수 있는 것

1. 🟢 **Supabase Owner 일** (https://supabase.com/dashboard)
   - `Steadi` 조직 → Team → Invite member: 윤진·다현의 이메일(민서가 전달)을 **Developer**로 초대
   - Steadi-project → Project Settings → API Keys에서 secret 키를 만들어 민서에게 **개인 메시지로만** 전달 (서버 전체 권한 키)
   - 이 일은 PR 없이 끝난다. 끝나면 민서에게 알리기
2. 🟡 **카톡 파서를 `src/`로 옮기기**
   - 시작점: `scripts/ai/digest.mjs`의 `parseKakao` (지금은 PC 내보내기 형식만 읽는다)
   - 옮길 곳: `src/lib/parsers/kakao.ts`. 결과는 `src/lib/model.ts`의 `RawRecord` 모양으로
   - 아이폰·안드로이드 내보내기 형식도 읽게: 본인 카톡에서 내보내 형식을 보고, **가짜 대화로** 같은 형식 시험 파일을 `scripts/ai/samples/`에 만든다
3. 🟡 **로그인 공급자 등록**: Kakao Developers 앱 + Google Cloud OAuth 클라이언트 → Supabase Auth 공급자 설정
   - 안내서: `docs/team/jena-console.md` (콘솔 설정만, 코드 작업 없음)
   - 안내서 3번에 넣을 Vercel 미리보기 주소 패턴은 민서가 개인 메시지로 보낸다 (못 받았으면 민서에게 요청)

### 민서 작업이 끝나면 (백로그 민서 칸에서 해당 항목이 `[x]`인지 확인)

4. 🟡 로그인 화면 버튼(`src/components/onboarding/Onboarding.tsx`의 "카카오로 회원가입"·"구글로 회원가입")을 실제 로그인에 연결, 로그아웃 — **"로그인 뼈대"** 이후 (완료됨, 3번 콘솔 설정이 끝나면 시작)
   - 쓸 것: `src/lib/auth.ts`의 `signInWith("kakao" | "google", 돌아갈 주소)`, `signOut()` — 서버 액션이라 `<form action={…}>`이나 `startTransition`으로 부른다
   - 로그인한 사람 정보는 서버에서 `getCurrentUser()` (`src/lib/supabase/server.ts`)
   - 로그인 실패하면 `/onboarding?error=login`으로 돌아온다 → 오류 문구 보여 주기
   - 로그인 강제는 `.env.local`에 `STEADI_REQUIRE_LOGIN=1`을 넣으면 켜진다 (평소엔 끔)
5. 🟡 카톡 파일 업로드 → 2번 파서 → 저장 함수로 `raw_records`에 넣기 — **"원본 기록 저장 함수"** 이후. 업로드 화면은 다현이 만든다
6. 🟡 AI 분석 동의: 고른 대화방을 `consents`에 저장, 동의 안 한 기록은 분석에서 빼기 — **"schema.sql 실행"** 이후. 동의 화면은 다현과 맞추기

예상 시간: 15~27시간
