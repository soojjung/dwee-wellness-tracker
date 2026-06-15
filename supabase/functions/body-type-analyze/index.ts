// Supabase Edge Function — body-type-analyze
// Receives a user photo and returns a structured body-type report from
// OpenAI gpt-4o vision. Photos are processed in-memory and never stored
// — neither in this function nor in Supabase Storage.
//
// Auth: requires a Supabase JWT (anonymous sessions are fine). The JWT's
// user_id is used to enforce a daily call quota via `body_type_calls`.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { BODY_TYPE_REPORT_SCHEMA } from './schema.ts';
import { buildSystemPrompt, buildUserText } from './prompt.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';
type ShotType = 'full-body' | 'upper-body';
type Locale = 'en' | 'ko';

interface RequestBody {
  imageBase64: string;
  imageMediaType: ImageMediaType;
  shotType: ShotType;
  locale: Locale;
}

const MAX_IMAGE_BYTES = 18 * 1024 * 1024; // 18 MB (OpenAI vision limit is 20 MB encoded)
const DAILY_LIMIT = 5;
const OPENAI_MODEL = 'gpt-4o';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed');
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!openaiKey || !supabaseUrl || !supabaseAnonKey) {
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

  // Scope the Supabase client to the caller's JWT so RLS enforces
  // user_id = auth.uid() on body_type_calls inserts and reads.
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

  // Rate limit — UTC day window.
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count, error: countErr } = await supabase
    .from('body_type_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('called_at', dayStart.toISOString());
  if (countErr) {
    return jsonError(500, 'rate_check_failed');
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return jsonError(429, 'rate_limit_exceeded');
  }

  const dataUri = `data:${body.imageMediaType};base64,${body.imageBase64}`;
  const openaiPayload = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(body.locale) },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildUserText(body.locale, body.shotType) },
          { type: 'image_url', image_url: { url: dataUri, detail: 'high' } },
        ],
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'body_type_report',
        schema: BODY_TYPE_REPORT_SCHEMA,
        strict: true,
      },
    },
    max_tokens: 4000,
    temperature: 0.6,
  };

  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    });
  } catch {
    return jsonError(502, 'openai_unreachable');
  }

  if (!openaiRes.ok) {
    const errText = await openaiRes.text().catch(() => '');
    console.error('openai non-2xx', openaiRes.status, errText);
    return jsonError(502, 'openai_failed');
  }

  let openaiJson: {
    choices?: Array<{
      message?: { content?: string | null; refusal?: string | null };
    }>;
  };
  try {
    openaiJson = await openaiRes.json();
  } catch {
    return jsonError(502, 'openai_invalid_response');
  }

  const choice = openaiJson.choices?.[0]?.message;
  if (choice?.refusal) {
    return jsonError(422, 'image_refused');
  }
  const reportText = choice?.content;
  if (!reportText) {
    return jsonError(502, 'openai_empty');
  }

  let report: unknown;
  try {
    report = JSON.parse(reportText);
  } catch {
    return jsonError(502, 'report_parse_failed');
  }

  // Best-effort log; we already have the result so don't fail the user
  // response on insert error (just log it).
  const { error: insertErr } = await supabase
    .from('body_type_calls')
    .insert({ user_id: userId });
  if (insertErr) {
    console.error('body_type_calls insert failed', insertErr.message);
  }

  return jsonOk({
    report,
    remaining: Math.max(0, DAILY_LIMIT - ((count ?? 0) + 1)),
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
  if (b.shotType !== 'full-body' && b.shotType !== 'upper-body') {
    return 'invalid_shot_type';
  }
  if (b.locale !== 'en' && b.locale !== 'ko') {
    return 'invalid_locale';
  }
  return null;
}

function isMediaType(v: unknown): v is ImageMediaType {
  return v === 'image/jpeg' || v === 'image/png' || v === 'image/webp';
}

function approxBytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
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
