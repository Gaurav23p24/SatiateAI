const busboy = require('busboy');
const { Readable } = require('stream');

exports.handler = function (event) {
  return new Promise((resolve) => {
    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return resolve({
        statusCode: 400,
        body: JSON.stringify({ error: 'Expected multipart/form-data' }),
      });
    }

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '');

    const bb = busboy({ headers: { 'content-type': contentType } });

    let audioBuffer = null;
    let audioMimeType = 'audio/webm';
    let audioFilename = 'audio.webm';

    bb.on('file', (fieldname, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        audioBuffer = Buffer.concat(chunks);
        audioMimeType = info.mimeType || 'audio/webm';
        audioFilename = info.filename || 'audio.webm';
      });
    });

    bb.on('finish', async () => {
      if (!audioBuffer) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ error: 'No audio file in request' }),
        });
      }

      try {
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: audioMimeType });
        formData.append('file', audioBlob, audioFilename);
        formData.append('model_id', 'scribe_v1');

        const response = await fetch(
          'https://api.elevenlabs.io/v1/speech-to-text',
          {
            method: 'POST',
            headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
            body: formData,
          }
        );

        if (!response.ok) {
          const detail = await response.text();
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'STT failed', detail }),
          });
        }

        const data = await response.json();
        resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: data.text || data.transcript || '',
          }),
        });
      } catch (err) {
        console.error('[stt]', err);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: err.message }),
        });
      }
    });

    bb.on('error', (err) => {
      console.error('[stt] busboy error:', err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Parse failed', detail: err.message }),
      });
    });

    Readable.from(bodyBuffer).pipe(bb);
  });
};
