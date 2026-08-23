// Supabase Edge Function — sticker-cutout
// Receives a user photo and returns a transparent PNG with the background
// removed via remove.bg. Photos are processed in-memory and never stored —
// neither in this function nor in Supabase Storage.
//
// Auth: requires a Supabase JWT (anonymous sessions are fine). The JWT's
// user_id is used to enforce a daily call quota via `sticker_cutout_calls`.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

interface RequestBody {
  imageBase64: string;
  imageMediaType: ImageMediaType;
}

// remove.bg accepts up to 12 MB per image.
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const DAILY_LIMIT = 20;
const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed');
  }

  const removeBgKey = Deno.env.get('REMOVE_BG_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!removeBgKey || !supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, 'missing_config');
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const validationError = validate(body);
  if (validationError) {
    return jsonError(400, validationError);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonError(401, 'unauthenticated');
  }
  const userId = userData.user.id;

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count, error: countErr } = await supabase
    .from('sticker_cutout_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('called_at', dayStart.toISOString());
  if (countErr) {
    return jsonError(500, 'rate_check_failed');
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return jsonError(429, 'rate_limit_exceeded');
  }

  const imageBytes = base64ToBytes(body.imageBase64);

  const form = new FormData();
  form.append('size', 'auto');
  form.append('format', 'png');
  form.append(
    'image_file',
    // .buffer widens to ArrayBufferLike (which includes SharedArrayBuffer);
    // narrow back to ArrayBuffer for Blob's BlobPart. Runtime is unaffected.
    new Blob([imageBytes.buffer as ArrayBuffer], { type: body.imageMediaType }),
    'input',
  );

  let res: Response;
  try {
    res = await fetch(REMOVE_BG_URL, {
      method: 'POST',
      headers: { 'X-Api-Key': removeBgKey },
      body: form,
    });
  } catch {
    return jsonError(502, 'remove_bg_unreachable');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('remove.bg non-2xx', res.status, errText);
    // remove.bg 402 = out of credits; 400 = image too small / bad; 429 =
    // provider throttled. Map to something the client can distinguish.
    if (res.status === 402) return jsonError(429, 'quota_exceeded');
    if (res.status === 400) return jsonError(422, 'image_refused');
    return jsonError(502, 'remove_bg_failed');
  }

  const pngBuffer = await res.arrayBuffer();
  const pngBase64 = bytesToBase64(new Uint8Array(pngBuffer));

  let usedCount = count ?? 0;
  const { error: insertErr } = await supabase
    .from('sticker_cutout_calls')
    .insert({ user_id: userId });
  if (insertErr) {
    console.error('sticker_cutout_calls insert failed', insertErr.message);
  } else {
    usedCount += 1;
  }

  return jsonOk({
    pngBase64,
    remaining: Math.max(0, DAILY_LIMIT - usedCount),
  });
});

function validate(b: RequestBody): string | null {
  if (typeof b.imageBase64 !== 'string' || b.imageBase64.length === 0) {
    return 'missing_image';
  }
  if (approxBytes(b.imageBase64) > MAX_IMAGE_BYTES) {
    return 'image_too_large';
  }
  if (!isMediaType(b.imageMediaType)) {
    return 'invalid_media_type';
  }
  return null;
}

function isMediaType(v: unknown): v is ImageMediaType {
  return v === 'image/jpeg' || v === 'image/png' || v === 'image/webp';
}

function approxBytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  // Chunk the conversion so we don't blow the argument limit of
  // String.fromCharCode on large PNGs.
  const CHUNK = 0x8000;
  let out = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(out);
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
