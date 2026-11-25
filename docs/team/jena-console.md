# 제나 — 카카오·구글 로그인 콘솔 설정 안내서

`docs/team/jena.md` 할 일 3번 "로그인 공급자 등록"용. 코드 작업 없이 **콘솔(웹 사이트) 설정만** 한다. 로그인 버튼 연결(할 일 4번)은 이 설정과 민서의 로그인 뼈대가 끝난 뒤.

- 걸리는 시간: 1~2시간
- 끝나면: 백로그에서 이 항목을 체크하고, 아래 "끝났는지 확인"을 민서에게 알려 주기
- **Client Secret 값은 Supabase 화면에만 붙여 넣는다.** 민서에게도, 단톡방에도, 레포에도 보내지 않는다

> 콘솔 메뉴 이름은 자주 바뀐다. 이 문서와 다르면 Claude Code나 각 공식 문서(맨 아래)에서 찾고, 이 문서를 고쳐 PR로 올려 주세요.

---

## 0. Supabase에서 Callback URL 복사하기 (먼저)

카카오·구글 둘 다 이 주소를 넣어야 한다.

1. https://supabase.com/dashboard → `Steadi-project`
2. 왼쪽 **Authentication** → Configuration 아래 **Sign In / Providers**
3. 목록에서 **Kakao**를 펼치면 **Callback URL**이 보인다 → **Copy**
   - 모양: `https://<프로젝트 아이디>.supabase.co/auth/v1/callback`
   - 구글도 같은 주소다

## 1. 카카오

https://developers.kakao.com → 오른쪽 위 로그인 (본인 카카오 계정)

**① 앱 만들기**
- **앱** → **앱 생성**
- 앱 이름 `Steadi`, 회사 이름은 팀 이름, 카테고리는 가장 가까운 것(교육·라이프스타일 등), 아이콘은 Steadi 로고 → 저장

**② 키 확인 + Redirect URI 넣기**
- **앱 설정 → 앱 → 플랫폼 키**에서 **REST API 키**를 누른다
- **카카오 로그인 Redirect URI** 칸에 0번에서 복사한 Callback URL을 넣고 저장
- 같은 화면에서 **카카오 로그인 Client Secret**이 **활성화**인지 확인하고, Client Secret 코드를 확인한다 (6번에서 씀)

**③ 카카오 로그인 켜기**
- **제품 설정 → 카카오 로그인 → 일반** → 사용 설정 상태 **ON**

**④ 동의항목**
- **제품 설정 → 카카오 로그인 → 동의항목**
- **닉네임**(`profile_nickname`), **프로필 사진**(`profile_image`)을 설정한다. 동의 목적: "서비스 화면에 이름·프로필 표시"
- **카카오계정(이메일)**(`account_email`)은 **설정하지 않는다** — 비즈 앱 전환(사업자 정보 입력)이 필요해서 MVP에서는 이메일 없이 간다

**⑤ Supabase에 넣기**
- Supabase → Authentication → Sign In / Providers → **Kakao**
- **Kakao Enabled** ON
- **Kakao Client ID** = ②의 **REST API 키**
- **Kakao Client Secret** = ②의 **Client Secret 코드**
- **Allow users without an email** ON (④에서 이메일을 안 받기 때문. 안 켜면 로그인이 실패한다)
- **Save**

## 2. 구글

https://console.cloud.google.com → 본인 구글 계정

**① 프로젝트 만들기**
- 위쪽 프로젝트 선택 → **새 프로젝트** → 이름 `Steadi` → 만들기 → 만든 프로젝트로 전환

**② Google Auth Platform 설정** (왼쪽 메뉴 검색창에 "Google Auth Platform"; 처음이면 **시작하기**)
- **브랜딩(Branding)**: 앱 이름 `Steadi`, 사용자 지원 이메일·개발자 연락처는 본인 이메일
- **대상(Audience)**: 사용자 유형 **외부(External)**. 게시 상태는 **테스트(Testing)** 그대로 두고, **테스트 사용자**에 팀원 4명의 구글 이메일을 넣는다
  - 테스트 상태에서는 여기 넣은 사람만 로그인된다. 사용자 테스트 전에 민서와 "앱 게시"를 정한다
- **데이터 액세스(Data Access)**: 범위 추가에서 `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` 세 개만. 다른 범위는 넣지 않는다 (넣으면 구글 심사가 생긴다. 캘린더 범위는 윤진 작업 때 따로)

**③ OAuth 클라이언트 만들기**
- **클라이언트(Clients)** → **클라이언트 만들기**
- 애플리케이션 유형 **웹 애플리케이션**, 이름 `Steadi web`
- **승인된 JavaScript 원본**: `http://localhost:3120`
- **승인된 리디렉션 URI**: 0번의 Supabase Callback URL
- 만들기 → **클라이언트 ID**와 **클라이언트 보안 비밀번호**가 나온다 (창을 닫기 전에 4번에 바로 넣기)

**④ Supabase에 넣기**
- Supabase → Authentication → Sign In / Providers → **Google**
- Enable ON → **Client ID**, **Client Secret** 넣기 → **Save**

## 3. 로그인 후 돌아올 주소 허용 (Supabase)

로그인이 끝나면 Supabase가 우리 앱으로 돌려보낸다. 허용한 주소로만 돌려보낸다.

- Supabase → Authentication → **URL Configuration**
- **Site URL**: `http://localhost:3120` (지금은 로컬 기준. 운영 주소가 생기면 바꾼다)
- **Redirect URLs**에 추가:
  - `http://localhost:3120/**`
  - Vercel 미리보기 주소 패턴 — 민서가 개인 메시지로 보낸다 (계정 이름이 들어 있어 공개 레포에 쓰지 않는다)

## 4. 끝났는지 확인

민서에게 아래를 알려 주면 된다 (값이 아니라 **됐는지**만):

- [ ] 카카오: 앱 생성, Redirect URI, Client Secret 활성화, 카카오 로그인 ON, 동의항목(닉네임·프로필 사진)
- [ ] Supabase Kakao: Enabled, Client ID·Secret, Allow users without an email
- [ ] 구글: 프로젝트, 브랜딩, 대상(테스트 사용자 4명), 데이터 액세스(3개 범위), 웹 클라이언트(리디렉션 URI)
- [ ] Supabase Google: Enabled, Client ID·Secret
- [ ] URL Configuration: Site URL, Redirect URLs 2개

실제로 로그인이 되는지는 민서의 로그인 뼈대가 들어간 뒤 할 일 4번에서 확인한다.

## 자주 나는 문제

| 증상 | 원인 |
|---|---|
| 카카오 `KOE006` | Redirect URI가 Callback URL과 한 글자라도 다름 |
| 카카오 `KOE205` | 동의항목에 없는 범위(보통 이메일)를 요청 → Supabase의 Allow users without an email 확인 |
| 구글 `redirect_uri_mismatch` | 구글 리디렉션 URI가 Supabase Callback URL과 다름 |
| 구글 "액세스 차단됨: 테스트 중" | 테스트 사용자에 그 이메일이 없음 |
| 로그인 후 엉뚱한 주소로 감 | Supabase URL Configuration의 Redirect URLs에 그 주소가 없음 |

## 공식 문서

- 카카오: https://supabase.com/docs/guides/auth/social-login/auth-kakao
- 구글: https://supabase.com/docs/guides/auth/social-login/auth-google
- 돌아올 주소: https://supabase.com/docs/guides/auth/redirect-urls
