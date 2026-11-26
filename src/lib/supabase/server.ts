import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * 서버(page.tsx·서버 액션·route.ts)용. 로그인한 사용자 권한으로 움직여서 RLS가 자기 데이터만 보여 준다.
 * secret 키를 쓰는 서버 전용 클라이언트(새벽 배치)는 따로 만든다 — 이것과 섞지 않는다.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 세션 갱신은 src/proxy.ts가 맡으니 무시해도 된다
        }
      },
    },
  });
}

export type CurrentUser = { id: string; email?: string; name: string };

/** 지금 로그인한 사용자. 로그인 안 했거나 Supabase 값이 없으면 null */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  // getClaims: 쿠키의 토큰을 서명까지 검증한다 (getSession은 검증 없이 믿으므로 쓰지 않는다)
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const name = String(meta.name ?? meta.full_name ?? meta.nickname ?? "");
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined, name };
}
