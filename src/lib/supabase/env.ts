// MVP Supabase 주소·키 (CLAUDE.md "환경변수와 키"). publishable 키는 브라우저에 노출돼도 되고, 데이터는 RLS가 지킨다
export const SUPABASE_URL = process.env.NEXT_PUBLIC_APP_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_APP_SUPABASE_PUBLISHABLE_KEY ?? "";

/** .env.local에 값이 없으면 로그인 기능을 건너뛴다 (화면 작업은 값 없이도 되게) */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * 로그인 안 한 사용자를 막을지. 카카오·구글 로그인이 실제로 되기 전까지는 꺼 둔다 (팀원 화면 작업이 막히지 않게).
 * 켜기: .env.local·Vercel에 STEADI_REQUIRE_LOGIN=1
 */
export const isLoginRequired = process.env.STEADI_REQUIRE_LOGIN === "1";
