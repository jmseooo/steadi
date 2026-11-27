-- 002: 연동 연결 저장 함수 (schema.sql 실행 뒤 한 번 실행)
--
-- connection_secrets는 브라우저 정책이 없어서 로그인 사용자도 토큰을 읽지도 쓰지도 못한다.
-- 연결 직후(노션 OAuth 콜백)에는 서버가 사용자 권한으로 토큰을 "넣기만" 해야 하므로,
-- 자기 연결에만 쓰는 함수를 하나 연다. 읽기는 여전히 새벽 배치(secret 키)만 한다.

create or replace function public.save_connection(
  p_service text,
  p_scope jsonb,
  p_access_token text,
  p_refresh_token text default null,
  p_expires_at timestamptz default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception '로그인이 필요해요' using errcode = '42501';
  end if;

  insert into public.connections (user_id, service, status, scope, last_synced_at)
  values (v_user, p_service, 'on', coalesce(p_scope, '[]'::jsonb), null)
  on conflict (user_id, service) do update
    set status = 'on', scope = excluded.scope, connected_at = now()
  returning id into v_id;

  insert into public.connection_secrets (connection_id, user_id, access_token, refresh_token, expires_at)
  values (v_id, v_user, p_access_token, p_refresh_token, p_expires_at)
  on conflict (connection_id) do update
    set access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at;

  return v_id;
end $$;

revoke all on function public.save_connection(text, jsonb, text, text, timestamptz) from public, anon;
grant execute on function public.save_connection(text, jsonb, text, text, timestamptz) to authenticated;
