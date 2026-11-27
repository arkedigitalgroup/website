// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
 * Uploads a file to Supabase Storage and returns its publicly accessible URL.
 * Automatically tries the specified bucket, falling back to 'arke' or 'public' if not found.
 *
 * @param file File or Blob to upload
 * @param path Storage destination path (e.g. `receipts/uid/filename.jpg`)
 * @param bucket Bucket name (defaults to 'arke-media')
 * @returns Promise<string> Public URL of the uploaded file
 */
export async function uploadToSupabase(
    file: File | Blob,
    path: string,
    bucket: string = DEFAULT_BUCKET
): Promise<string> {
    const cleanPath = path.replace(/^\/+/, "");
    const supabase = getSupabase();

    // Attempt upload with overwrite enabled
    let uploadRes = await supabase.storage
        .from(bucket)
        .upload(cleanPath, file, {
            upsert: true,
            cacheControl: "3600",
        });

    // If bucket does not exist, try common fallback bucket names
    if (uploadRes.error && uploadRes.error.message?.includes("Bucket not found")) {
        const fallbacks = ["arke", "media", "receipts", "images"];
        for (const fb of fallbacks) {
            if (fb === bucket) continue;
            const retry = await supabase.storage.from(fb).upload(cleanPath, file, {
                upsert: true,
                cacheControl: "3600",
            });
            if (!retry.error) {
                bucket = fb;
                uploadRes = retry;
                break;
            }
        }
    }

    if (uploadRes.error) {
        throw new Error(`Supabase Storage Error: ${uploadRes.error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return data.publicUrl;
}
