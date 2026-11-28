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
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // arke-media bucket file size limit

/**
 * Phone photos are often 3–10 MB: too big for the bucket and slow on mobile data.
 * Re-encode images to at most 1600px / JPEG; keep the original if that isn't smaller
 * or the browser can't decode it (e.g. HEIC).
 */
async function shrinkImage(file: File | Blob): Promise<File | Blob> {
    if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
        return blob && blob.size < file.size ? blob : file;
    } catch {
        return file;
    }
}

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * The server (app/api/upload-url) checks the Firebase sign-in and that the path is
 * "<folder>/<uid>/...", then hands back a one-time signed upload token.
 *
 * @param file File or Blob to upload
 * @param path Storage destination path (e.g. `receipts/<uid>/filename.jpg`)
 */
export async function uploadToSupabase(original: File | Blob, path: string): Promise<string> {
    const file = await shrinkImage(original);
    if (file.size > MAX_UPLOAD_BYTES) {
        throw Object.assign(new Error("File is larger than 5 MB."), { code: "file-too-large" });
    }

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
