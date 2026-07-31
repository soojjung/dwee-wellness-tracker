// Supabase Edge Function — delete-account
// Permanently deletes the caller's auth user + all their storage objects.
// Public.* rows cascade via `on delete cascade` from auth.users.
//
// Auth: requires a Supabase JWT. Uses service_role only to (a) recursively
// list/remove the caller's `media/{userId}/…` objects and (b) call
// auth.admin.deleteUser — never to read another user's data.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEDIA_BUCKET = 'media';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return jsonError(405, 'method_not_allowed');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonError(500, 'missing_config');
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return jsonError(401, 'unauthenticated');
  const userId = userData.user.id;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    await removeUserMedia(admin, userId);
  } catch (e) {
    console.error('[delete-account] media cleanup failed', e);
    return jsonError(500, 'storage_cleanup_failed');
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
  if (deleteErr) {
    console.error('[delete-account] admin.deleteUser failed', deleteErr.message);
    return jsonError(500, 'auth_delete_failed');
  }

  return jsonOk({ userId });
});

async function removeUserMedia(admin: SupabaseClient, userId: string): Promise<void> {
  const paths = await listAllObjectPaths(admin, userId, '');
  if (paths.length === 0) return;
  const { error } = await admin.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) throw error;
}

// Supabase storage.list is non-recursive. Walk subfolders and collect every
// object path under `{userId}/`.
async function listAllObjectPaths(
  admin: SupabaseClient,
  userId: string,
  subpath: string,
): Promise<string[]> {
  const prefix = subpath ? `${userId}/${subpath}` : userId;
  const { data, error } = await admin.storage
    .from(MEDIA_BUCKET)
    .list(prefix, { limit: 1000 });
  if (error) throw error;
  if (!data) return [];

  const files: string[] = [];
  for (const entry of data as Array<{ name: string; id: string | null }>) {
    const nextSub = subpath ? `${subpath}/${entry.name}` : entry.name;
    if (entry.id === null) {
      const nested = await listAllObjectPaths(admin, userId, nextSub);
      files.push(...nested);
    } else {
      files.push(`${userId}/${nextSub}`);
    }
  }
  return files;
}

function jsonOk(payload: unknown): Response {
  return new Response(JSON.stringify({ ok: true, data: payload }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function jsonError(status: number, code: string): Response {
  return new Response(JSON.stringify({ ok: false, error: code }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
