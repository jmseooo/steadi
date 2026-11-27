import { NextResponse, type NextRequest } from "next/server";
import { NOTION_CALLBACK_PATH, exchangeNotionCode, pageTitle, readNotionRecords } from "@/lib/notion";
import { saveRawRecords } from "@/lib/records";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// 노션 허용 화면에서 돌아오는 곳: 토큰 저장 → 고른 페이지 읽기 → 원본 기록 저장 → next로
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const next = request.cookies.get("notion_next")?.value ?? "/";
  const back = (params: Record<string, string>) => {
    const url = new URL(next, origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = NextResponse.redirect(url);
    res.cookies.delete({ name: "notion_state", path: "/api/notion" });
    res.cookies.delete({ name: "notion_next", path: "/api/notion" });
    return res;
  };

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (searchParams.get("error") || !code) return back({ notion: "cancel" }); // 사용자가 노션 화면에서 취소
  if (!state || state !== request.cookies.get("notion_state")?.value) return back({ notion: "error", reason: "state" });
  if (!(await getCurrentUser())) return NextResponse.redirect(new URL("/onboarding?error=login", origin));

  try {
    const token = await exchangeNotionCode(code, origin + NOTION_CALLBACK_PATH);
    const { pages, records } = await readNotionRecords(token.access_token);

    const supabase = await createClient();
    const { error } = await supabase.rpc("save_connection", {
      p_service: "notion",
      p_scope: pages.map((p) => ({ id: p.id, title: pageTitle(p) })),
      p_access_token: token.access_token,
      p_refresh_token: token.refresh_token ?? null,
      p_expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
    });
    if (error) throw new Error(`연결 저장 실패: ${error.message}`);

    const result = await saveRawRecords(records, supabase);
    await supabase.from("connections").update({ last_synced_at: new Date().toISOString() }).eq("service", "notion");
    return back({ notion: "ok", pages: String(pages.length), saved: String(result.saved + result.updated) });
  } catch (e) {
    console.error("[notion callback]", e);
    return back({ notion: "error" });
  }
}
