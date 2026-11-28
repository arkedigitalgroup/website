// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "./firebase";

// Created on first upload, not at import: createClient throws when the URL is
// missing, which would crash prerendering of every page that imports this file.
let client: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
    if (!client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        }
        client = createClient(url, key);
    }
    return client;
}

export const DEFAULT_BUCKET = "arke-media";

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * The server (app/api/upload-url) checks the Firebase sign-in and that the path is
 * "<folder>/<uid>/...", then hands back a one-time signed upload token.
 *
 * @param file File or Blob to upload
 * @param path Storage destination path (e.g. `receipts/<uid>/filename.jpg`)
 */
export async function uploadToSupabase(file: File | Blob, path: string): Promise<string> {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Sign in before uploading files.");

    const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ path: path.replace(/^\/+/, "") }),
    });
    const signed = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Upload not allowed: ${signed.error || res.status}`);

    const supabase = getSupabase();
    const { error } = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file, { cacheControl: "3600" });
    if (error) throw new Error(`Supabase Storage Error: ${error.message}`);

    return supabase.storage.from(signed.bucket).getPublicUrl(signed.path).data.publicUrl;
}
