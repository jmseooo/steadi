@AGENTS.md

# Steadi MVP 작업 규칙

전시용 프로토타입(steadi-gold.vercel.app)을 실제로 쓸 수 있는 서비스로 만드는 중이다.
근거 문서: Figma `Steadi_바이브` 231:1306 「Steadi 구현 가능성 검토」(2026.11.10) — 2인 팀, 월 0원.
모든 답변·커밋 메시지·코드 주석은 한국어로 쓴다.
남은 일은 `docs/mvp-backlog.md`에 모은다. 일을 끝내거나 새로 생기면 거기를 고친다.

## 역할

| 사람 | GitHub | 맡는 일 |
|---|---|---|
| 민서 (개발 리드 · 분석) | jmseooo | DB 표·AI 응답 형식 최종 결정, PR 리뷰와 `mvp` 합치기, Gemini 프롬프트, 프로젝트 묶기·목표 대화, 경험·피드백·제안 카드 생성, 새벽 배치, 임베딩·연결된 경험, Project·Home·Growth·Connection·알림 화면에 실제 데이터 연결 |
| 제나 (수집) | JenaSeo | 카카오·구글 로그인(Supabase Auth 설정), DB 표 생성·보안 규칙(RLS), 카톡·AI 대화 파일 파서, Notion 등 외부 연동, AI 분석 동의·업로드·연결 화면, Profile(연동 관리·탈퇴) |

자기 담당이 아닌 파일을 크게 고쳐야 하면 먼저 상대에게 알린다.

## 브랜치와 배포

- 기준 브랜치는 `mvp`. 기능마다 `mvp`에서 브랜치를 따고(`feat/kakao-login`, `feat/notion` 처럼) PR을 `mvp`로 보낸다. 리드가 리뷰한 뒤 합친다.
- `home`·`growth-stories`·`project` 등 다른 브랜치는 전시 프로토타입이다. MVP 작업을 섞지 않는다.
- 운영 주소 steadi-gold.vercel.app은 프로토타입 그대로 둔다. MVP는 Vercel **미리보기(preview)** 배포로만 확인한다 (`vercel deploy`, `--prod` 금지).
- 로컬 개발 서버는 `npm run dev` (포트 3120).

## 환경변수와 키

`.env.local`에 넣는다. 값은 리드에게 따로 받고, **레포·PR·이슈·코드에 절대 쓰지 않는다** (레포가 공개다).

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_APP_SUPABASE_URL` | MVP Supabase (조직 Steadi · Steadi-project · 도쿄) |
| `NEXT_PUBLIC_APP_SUPABASE_PUBLISHABLE_KEY` | 위 프로젝트의 publishable 키 (브라우저에 노출돼도 되는 키 — RLS가 지켜야 한다) |
| `GEMINI_API_KEY` | Gemini. 서버에서만 읽는다. `NEXT_PUBLIC_`을 붙이지 않는다 |
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 전시 UT 기록용(steadi-guestbook). MVP에서 쓰지 않는다 |

Supabase secret 키와 DB 비밀번호는 코드에 두지 않는다. 필요하면 서버 환경변수로만.

## 데이터와 AI 원칙

- 모든 표에 RLS를 켜고, 사용자는 자기 데이터만 읽고 쓴다.
- AI는 **새벽 배치로 하루 1번**, 사용자당 1~3번만 호출하고 결과를 DB에 저장해 재사용한다. 실시간 호출은 온보딩 목표 대화뿐이다.
- 모델은 `gemini-3.5-flash-lite`. 문서의 `gemini-2.5-flash(-lite)`는 새 사용자에게 막혀 있다.
- AI 응답 형식(JSON)은 지금 화면이 읽는 가짜 데이터 모양(`src/components/home/data.ts`, `src/components/project-detail/data.ts`, `src/components/growth/stories.ts`)을 따른다. 화면을 바꾸지 말고 데이터를 맞춘다.
- 기록을 AI로 보내기 전에 사용자의 분석 동의를 받는다 (단톡방에는 다른 사람의 메시지도 있다).
- 원본 기록은 텍스트만 저장한다 (DB 500MB 한도). 카드마다 근거가 된 원본 링크를 저장한다.

## MVP에서 빼는 것

기기에서 서비스 찾기, 사진 자동 스캔, 카카오톡 자동 연동, Gmail, 외부 서비스에서 대신 답장·등록하기(답장 초안 복사로 대체), 애플 로그인.

## 화면 문구 바꿀 것

- "83% 확신" → "근거 기록 N개"
- "지금 확인하고 있어요" 같은 실시간 표현 → "오늘 새벽 3시 동기화 완료" 같은 작업 기록
- 온보딩 "기기에서 찾기" → 서비스 목록에서 연결 버튼을 직접 누르는 방식

## 커밋

- 커밋 메시지는 한국어. 첫 줄 요약, 빈 줄, 본문.
- `public/assets/connected-tools.png`는 커밋하지 않는다.
