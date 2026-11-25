-- Steadi MVP DB 표 — Supabase SQL Editor에서 한 번 실행
-- 형식 기준: src/lib/model.ts. 프로젝트: 조직 Steadi · Steadi-project (도쿄)
--
-- 원칙
-- - 모든 표에 user_id. 회원 탈퇴(auth.users 삭제) 시 가져온 기록·카드·연동 토큰까지 함께 지워진다 (on delete cascade)
-- - 모든 표에 RLS. 사용자는 자기 줄만 본다
-- - 사용자가 직접 만드는 것(원본 기록 업로드, 프로젝트, 동의, 연동)은 브라우저에서 쓰기 가능
-- - AI가 만드는 것(카드·피드백·변경 사항·알림 …)은 새벽 배치가 서버 secret 키로만 넣는다.
--   브라우저는 읽기 + 보관·메모·읽음·닫기 같은 상태 바꾸기 + 지우기만
-- - 연동 접근 토큰은 connection_secrets에 따로 두고 브라우저 정책을 하나도 주지 않는다 (서버만 읽음)
-- - 다른 표를 가리킬 때는 (id, user_id)를 같이 가리킨다 → 내 기록이 남의 프로젝트에 붙을 수 없다
-- - 브라우저 권한은 맨 아래 grant로 칸 단위까지 정한다 (Supabase 기본 권한에 기대지 않음)

create extension if not exists vector;

-- ─── 사용자 ───────────────────────────────────────────

create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text,
  alert_settings jsonb not null default '{}', -- 알림 설정 탭 켜고 끈 값
  created_at timestamptz not null default now()
);

-- 가입하면 프로필 한 줄을 만든다 (카카오·구글 이름·이메일)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 수집 (제나) ──────────────────────────────────────

-- 연결한 서비스 (Profile > 서비스 연결)
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  service text not null check (service in ('kakao','notion','ai-chat','photo','calendar','drive','slack','github','figma','discord')),
  status text not null default 'on' check (status in ('on','off','error')),
  -- 사용자가 고른 읽을 범위. 모든 서비스 같은 모양: [{ "id": "노션 페이지 id", "title": "공모전 기획" }, { "title": "밴드 동아리" }]
  -- id는 서비스 쪽 고유 id(없으면 생략), title은 화면에 보일 이름
  scope jsonb not null default '[]' check (jsonb_typeof(scope) = 'array'),
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  unique (user_id, service),
  unique (id, user_id)
);

-- 접근 토큰: 서버(secret 키)만 읽고 쓴다. RLS는 켜되 정책을 만들지 않는다
create table public.connection_secrets (
  connection_id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  foreign key (connection_id, user_id) references public.connections (id, user_id) on delete cascade
);

-- AI 분석 동의: 어떤 출처의 기록을 분석에 쓸지
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text not null,
  source_title text not null, -- 대화방·페이지 이름
  agreed_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, source, source_title)
);

-- 원본 기록 (텍스트만, DB 500MB 한도). AI 카드의 "근거 기록"이 이 줄을 가리킨다
-- 한 줄 = 카톡·AI 대화는 메시지 1개, 노션은 페이지 1개, 캘린더는 일정 1개
-- hash = 같은 기록인지 가리는 값. 카톡·AI 대화는 내용으로 만들어 같은 파일을 다시 올려도 겹치지 않고,
--        노션·캘린더는 서비스 id로 만들어 원본이 고쳐지면 그 줄을 덮어쓴다 (저장 함수가 upsert)
create table public.raw_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text not null,
  source_title text not null,
  url text, -- 원본 주소가 있는 곳만 (노션 페이지·캘린더 일정). 카톡·AI 대화 파일은 비워 두고 저장된 text를 원문으로 보여 준다
  author text,
  text text not null,
  at timestamptz not null,
  hash text not null,
  project_id uuid, -- AI가 프로젝트로 묶은 뒤 채움 (아래 projects 만든 뒤 외래키 추가)
  analyzed_at timestamptz, -- 새벽 배치가 읽은 시각 (null이면 아직)
  created_at timestamptz not null default now(),
  unique (user_id, hash)
);
create index raw_records_unanalyzed on public.raw_records (user_id) where analyzed_at is null;

-- ─── 프로젝트 ────────────────────────────────────────

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  color text not null check (color in ('pink','orange','blue','purple')),
  status text not null default '진행 중' check (status in ('진행 중','종료')),
  goal text not null default '',
  intro text not null default '', -- 온보딩 "노션 ‘공모전 기획’에서 … 확인했어요"
  started_at date not null default current_date,
  steps jsonb not null default '[]', -- ProjectStep[] 타임라인. AI가 제안, 사용자가 고침
  insight jsonb, -- { title, desc } "스테디가 보고 있는 지금"
  sources jsonb not null default '[]', -- [{ app, title }] 이 프로젝트를 찾은 곳
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

alter table public.raw_records
  add constraint raw_records_project_fk foreign key (project_id, user_id)
  references public.projects (id, user_id) on delete set null (project_id);

-- ─── AI가 만드는 것 (민서) ───────────────────────────

-- 경험 카드. embedding: gemini-embedding-001 768차원 (비슷한 카드 찾기)
create table public.experience_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_id uuid not null,
  text text not null, -- 카드 문장 (Figma처럼 줄바꿈 포함, 4줄 이내)
  source text not null,
  at timestamptz not null, -- 감지한 시각
  summary text not null,
  steps jsonb not null, -- [{ label: 상황|판단|행동, text }]
  origin jsonb not null, -- { app, title, text, url? } 원문 보기
  record_ids uuid[] not null default '{}', -- 근거가 된 원본 기록
  archived boolean not null default false,
  memo text,
  embedding vector(768),
  created_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index experience_cards_embedding on public.experience_cards using hnsw (embedding vector_cosine_ops);

-- 연결된 경험 카드 (여러 프로젝트에 걸친 패턴) + 자세히 보기 이야기
create table public.connected_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null, -- 두 줄
  tone text not null check (tone in ('pink','orange','blue','purple')),
  art int not null, -- 카드 그림 번호 public/assets/cards/c{art}
  project_ids uuid[] not null, -- 태그
  experience_ids uuid[] not null, -- 이야기에 나오는 경험 카드 2~3장 (뒤 → 앞)
  evidence_count int not null, -- "근거 기록 N개"
  category text not null check (category in ('problem-solving','decision-making','adaptation','analysis','planning')),
  story jsonb not null, -- { discovery, common[], pattern { lead?, highlight, note }, save }
  saved_as_moment boolean not null default false, -- 성장의 순간으로 저장
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

-- 제안 카드 (연결된 경험을 지금 프로젝트에 써 보기)
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  connected_id uuid not null,
  project_id uuid not null,
  stage text not null,
  title text not null,
  "desc" text not null,
  candidates text not null,
  criteria text not null,
  action text not null,
  created_at timestamptz not null default now(),
  foreign key (connected_id, user_id) references public.connected_cards (id, user_id) on delete cascade,
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);

-- 홈 주요 변경 사항. dismissed: X로 닫음
create table public.changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_id uuid not null,
  kind text not null,
  title text not null,
  "desc" text not null,
  action text not null,
  at timestamptz not null default now(),
  dismissed boolean not null default false,
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);

-- 스테디 히스토리 (끝난 작업 기록만. 동기화·분석 때 서버가 남김)
create table public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_id uuid, -- 비어 있으면 프로젝트와 상관없는 기록
  source text not null,
  text text not null,
  at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);

-- 커넥션 피드백
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_id uuid not null,
  type text not null, -- "자리이동 요청"
  source text not null,
  line text not null, -- 목록 한 줄
  at timestamptz not null,
  title text not null,
  meta text not null,
  original text not null,
  summary jsonb not null, -- [{ label, text }]
  suggestion jsonb not null, -- { title, desc, action, columns[] }
  record_ids uuid[] not null default '{}',
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index feedbacks_by_day on public.feedbacks (user_id, at);

-- 알림
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tab text not null check (tab in ('스테디','프로젝트','시스템')),
  source text[] not null, -- [앱 이름, 세부, …]
  title text not null,
  "desc" text not null,
  href text,
  at timestamptz not null default now(),
  read boolean not null default false
);
create index notifications_by_user on public.notifications (user_id, at desc);

-- ─── RLS ─────────────────────────────────────────────

do $$
declare t text;
begin
  -- 모든 표 RLS 켜기
  foreach t in array array['profiles','connections','connection_secrets','consents','raw_records','projects',
    'experience_cards','connected_cards','suggestions','changes','history','feedbacks','notifications'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- 사용자가 직접 만드는 표: 자기 줄 읽기·쓰기·고치기·지우기
  foreach t in array array['connections','consents','raw_records','projects'] loop
    execute format('create policy "own rows" on public.%I for all to authenticated
      using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;

  -- AI가 만드는 표: 자기 줄 읽기·지우기 (넣기는 서버만)
  foreach t in array array['experience_cards','connected_cards','suggestions','changes','history','feedbacks','notifications'] loop
    execute format('create policy "own rows read" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows delete" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
  -- 상태 칸이 있는 표만 고치기 정책 (어떤 칸을 고칠지는 아래 grant)
  foreach t in array array['experience_cards','connected_cards','changes','notifications'] loop
    execute format('create policy "own rows update" on public.%I for update to authenticated
      using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- 프로필: 자기 것만 읽고 고침 (만들기는 가입 트리거)
create policy "own profile read" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- connection_secrets: 정책 없음 = 브라우저에서 접근 불가

-- ─── 브라우저 권한 (칸 단위) ─────────────────────────
-- RLS는 "어떤 줄", grant는 "어떤 동작·어떤 칸". 둘 다 통과해야 한다.
-- 로그인 안 한 사용자(anon)는 아무것도 못 한다. 서버(secret 키)는 RLS·grant와 상관없이 다 한다.

revoke all on all tables in schema public from anon, authenticated;

-- 사용자가 만드는 표
grant select, insert, update, delete on public.connections, public.consents, public.raw_records, public.projects to authenticated;

-- 프로필: 이름·알림 설정만 고침
grant select on public.profiles to authenticated;
grant update (name, alert_settings) on public.profiles to authenticated;

-- AI가 만드는 표: 읽기·지우기 + 상태 칸만 고침
grant select, delete on public.experience_cards, public.connected_cards, public.suggestions,
  public.changes, public.history, public.feedbacks, public.notifications to authenticated;
grant update (archived, memo) on public.experience_cards to authenticated; -- 보관·메모
grant update (saved_as_moment) on public.connected_cards to authenticated; -- 성장의 순간으로 저장
grant update (dismissed) on public.changes to authenticated; -- X로 닫기
grant update (read) on public.notifications to authenticated; -- 읽음
