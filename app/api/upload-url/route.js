// app/api/upload-url/route.js
// Supabase can't see Firebase sign-ins, so its row-level security rejects browser uploads.
// This checks the Firebase ID token and the path, then returns a one-time signed upload
// token; the browser uploads the file straight to Supabase with it.
import { NextResponse } from "next/server";
import { getAdminAuth } from "../../../src/lib/firebaseAdmin";
import { getSupabaseAdmin } from "../../../src/lib/supabaseAdmin";
import { isAllowedUploadPath } from "../../../src/lib/uploadPath";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "arke-media";

export async function POST(request) {
    const idToken = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    let uid;
    try {
        ({ uid } = await getAdminAuth().verifyIdToken(idToken));
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await request.json().catch(() => ({}));
    if (!isAllowedUploadPath(path, uid)) {
        return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bucket: BUCKET, path: data.path, token: data.token });
}
