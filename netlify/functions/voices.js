exports.handler = async function () {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    });

    if (!res.ok) throw new Error(`ElevenLabs voices error ${res.status}`);

    const data = await res.json();
    const allVoices = data.voices || [];

    const voices = allVoices.slice(0, 8).map((v) => ({
      id: v.voice_id,
      label: v.name,
      name: v.name,
      preview_url: v.preview_url ?? null,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voices),
    };
  } catch (err) {
    console.error('[voices]', err);
    const defaultVoice = process.env.ELEVENLABS_VOICE_ID;
    const fallback = defaultVoice
      ? [{ id: defaultVoice, label: 'Default', name: 'Default', preview_url: null }]
      : [];
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fallback),
    };
  }
};
