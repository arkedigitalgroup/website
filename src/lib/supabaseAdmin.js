// src/lib/supabaseAdmin.js
// Server-only Supabase client using the secret key (sb_secret_…), for deleting files.
import { createClient } from "@supabase/supabase-js";
import { parseSupabasePublicUrl } from "./billing";

const DEFAULT_BUCKET = "arke-media"; // same bucket as src/lib/supabase.ts uploads to

export function getSupabaseAdmin() {
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!key || !url) return null; // callers report "storage not configured" instead of crashing
    return createClient(url, key, { auth: { persistSession: false } });
}

/** Deletes files given by public URLs plus everything in the listed folders. Returns error messages. */
export async function removeSupabaseFiles(supabase, urls = [], folders = []) {
    const byBucket = new Map();
    const add = (bucket, path) => byBucket.set(bucket, [...(byBucket.get(bucket) || []), path]);
    urls.map(parseSupabasePublicUrl).filter(Boolean).forEach((f) => add(f.bucket, f.path));
    for (const folder of folders) {
        const { data } = await supabase.storage.from(DEFAULT_BUCKET).list(folder, { limit: 1000 });
        (data || []).filter((f) => f.id).forEach((f) => add(DEFAULT_BUCKET, `${folder}/${f.name}`));
    }
    const errors = [];
    for (const [bucket, paths] of byBucket) {
        const { error } = await supabase.storage.from(bucket).remove([...new Set(paths)]);
        if (error) errors.push(`${bucket}: ${error.message}`);
    }
    return errors;
}
