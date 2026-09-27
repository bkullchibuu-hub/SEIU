import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'seiu-topik-audio';
const AUDIO_PREFIX = 'audio/';
const MAX_TEXT_LENGTH = 2400;

const clean = (value, max = 2400) => String(value || '').replace(/<[^>]*>/g, '').trim().slice(0, max);
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const env = name => globalThis.Netlify?.env?.get?.(name) || process.env[name] || '';

const xmlEscape = value => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const synthesizeAzure = async (text, role) => {
  const key = env('AZURE_SPEECH_KEY');
  const region = env('AZURE_SPEECH_REGION');
  if (!key || !region) return null;

  const voice = role === 'male'
    ? (env('AZURE_TTS_MALE_VOICE') || 'ko-KR-InJoonNeural')
    : (env('AZURE_TTS_FEMALE_VOICE') || 'ko-KR-SunHiNeural');
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR"><voice name="${xmlEscape(voice)}"><prosody rate="-8%" pitch="${role === 'male' ? '-2%' : '+1%'}">${xmlEscape(text)}</prosody></voice></speak>`;
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'SEIU-TOPIK',
    },
    body: ssml,
  });
  if (!response.ok) throw new Error(`Azure Speech ${response.status}`);
  return { provider: 'azure', audio: await response.arrayBuffer(), voice };
};

const synthesizeOpenAI = async (text, role) => {
  const key = env('OPENAI_API_KEY');
  if (!key) return null;
  const voice = role === 'male'
    ? (env('OPENAI_TTS_MALE_VOICE') || 'cedar')
    : (env('OPENAI_TTS_FEMALE_VOICE') || 'marin');
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env('OPENAI_TTS_MODEL') || 'gpt-4o-mini-tts',
      voice,
      input: text,
      response_format: 'mp3',
      instructions: role === 'male'
        ? 'Read in standard Seoul Korean as a calm male TOPIK listening-test speaker. Use measured pace, crisp articulation, neutral emotion, and natural Korean intonation.'
        : 'Read in standard Seoul Korean as a calm female TOPIK listening-test speaker. Use measured pace, crisp articulation, neutral emotion, and natural Korean intonation.',
    }),
  });
  if (!response.ok) throw new Error(`OpenAI Speech ${response.status}`);
  return { provider: 'openai', audio: await response.arrayBuffer(), voice };
};

export default async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Dữ liệu âm thanh không hợp lệ.' }, 400); }

  const text = clean(body?.text, MAX_TEXT_LENGTH);
  const role = body?.role === 'male' ? 'male' : 'female';
  if (!text || text.length > MAX_TEXT_LENGTH) return json({ error: 'Nội dung đọc không hợp lệ.' }, 400);
  if (!/[가-힣]/.test(text)) return json({ error: 'Âm thanh TOPIK chỉ nhận nội dung tiếng Hàn.' }, 400);

  const provider = env('AZURE_SPEECH_KEY') && env('AZURE_SPEECH_REGION') ? 'azure' : env('OPENAI_API_KEY') ? 'openai' : '';
  if (!provider) return json({ error: 'Chưa cấu hình dịch vụ tạo giọng AI.' }, 503);

  const version = provider === 'azure'
    ? `${env('AZURE_TTS_FEMALE_VOICE')}-${env('AZURE_TTS_MALE_VOICE')}`
    : `${env('OPENAI_TTS_MODEL')}-${env('OPENAI_TTS_FEMALE_VOICE')}-${env('OPENAI_TTS_MALE_VOICE')}`;
  const hash = createHash('sha256').update(`${provider}|${version}|${role}|${text}`).digest('hex');
  const blobKey = `${AUDIO_PREFIX}${provider}/${role}/${hash}.mp3`;
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const cached = await store.get(blobKey, { type: 'arrayBuffer', consistency: 'strong' });

  if (cached) {
    return new Response(cached, {
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-seiu-audio-cache': 'hit',
        'x-seiu-audio-provider': provider,
      },
    });
  }

  try {
    const generated = provider === 'azure'
      ? await synthesizeAzure(text, role)
      : await synthesizeOpenAI(text, role);
    if (!generated?.audio) return json({ error: 'Không tạo được âm thanh AI.' }, 503);
    await store.set(blobKey, generated.audio, {
      metadata: { contentType: 'audio/mpeg', provider: generated.provider, voice: generated.voice, role },
      onlyIfNew: true,
    });
    return new Response(generated.audio, {
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-seiu-audio-cache': 'miss',
        'x-seiu-audio-provider': generated.provider,
      },
    });
  } catch (error) {
    console.error('TOPIK audio generation failed', error);
    return json({ error: 'Dịch vụ tạo giọng AI đang bận.' }, 502);
  }
};
