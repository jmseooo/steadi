-- Steadi 졸전 UT 기록
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run (방명록과 같은 프로젝트에 테이블만 따로 추가)

-- 1) 사용 기록: 관람객 한 명(체험 한 번) = session_id 하나
create table if not exists public.ut_events (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  booth text,
  seq int not null,
  type text not null check (char_length(type) <= 40),
  path text check (char_length(path) <= 200),
  target text check (char_length(target) <= 200),
  value jsonb,
  at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists ut_events_session on public.ut_events (session_id, seq);

-- 누구나 쓰기만 가능. 읽기는 아래 관리자 함수로만
alter table public.ut_events enable row level security;
drop policy if exists "ut write" on public.ut_events;
create policy "ut write" on public.ut_events
  for insert to anon, authenticated with check (true);

-- 2) 관리자 비밀번호 (정책이 없어 바깥에서는 읽을 수 없음)
create table if not exists public.ut_admin (
  id int primary key default 1 check (id = 1),
  password text not null
);
alter table public.ut_admin enable row level security;

-- 3) 비밀번호가 맞을 때만 기록을 돌려준다
create or replace function public.ut_admin_events(pass text)
returns setof public.ut_events
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.ut_admin where password = pass) then
    raise exception 'wrong password' using errcode = '28P01';
  end if;
  return query select * from public.ut_events order by created_at, session_id, seq;
end;
$$;
revoke all on function public.ut_admin_events(text) from public;
grant execute on function public.ut_admin_events(text) to anon, authenticated;

-- 4) 비밀번호 정하기: 아래 줄의 '여기에-비밀번호' 를 바꿔서 한 번 더 Run
--    (이 파일은 공개 레포에 올라가니 실제 비밀번호를 여기 적어 커밋하지 말 것)
-- insert into public.ut_admin (id, password) values (1, '여기에-비밀번호')
--   on conflict (id) do update set password = excluded.password;
