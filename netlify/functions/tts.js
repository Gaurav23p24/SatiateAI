const VOICE_PREVIEW_TEXT =
  "Its a beautiful campus but Chapel Hill is humongous!!, it took me 20 minutes to reach to the venue after I parked my car! And while leaving I forgot where I parked my car, it took me additional 42 minutes, however, I had a lot of fun!";

exports.handler = async function (event) {
  try {
    const { text, voiceId } = JSON.parse(event.body || '{}');

    const ttsText = text === '__PREVIEW__' ? VOICE_PREVIEW_TEXT : text;

    const resolvedVoiceId =
      voiceId && voiceId !== 'null' && voiceId !== 'undefined'
        ? voiceId
        : process.env.ELEVENLABS_VOICE_ID;

    if (!resolvedVoiceId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No voice ID configured' }),
      };
    }

    if (!ttsText || !ttsText.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Empty text' }),
      };
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error('[tts] ElevenLabs error:', detail);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'TTS failed', detail }),
      };
    }

    const buffer = await res.arrayBuffer();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('[tts]', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
