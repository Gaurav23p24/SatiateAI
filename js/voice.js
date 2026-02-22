let mediaRecorder = null;
let stopResolve = null;
let activeAudio = null; // module-level ref prevents GC during playback

export async function recordAudio() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    throw new Error('MIC_DENIED');
  }

  const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
  mediaRecorder = new MediaRecorder(stream, { mimeType });

  const chunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    stopResolve = resolve;

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.start();
  });
}

export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

export async function transcribe(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await fetch('/api/stt', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'STT request failed');
  }

  const data = await response.json();
  return data.transcript;
}

export async function speak(text, voiceId = null) {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[speak] TTS request failed:', err);
    throw new Error(err.error || 'TTS failed');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  activeAudio = new Audio(url);

  return new Promise((resolve, reject) => {
    activeAudio.onended = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      resolve();
    };
    activeAudio.onerror = (e) => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      reject(e);
    };
    const playPromise = activeAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error('[speak] Autoplay blocked:', err);
        URL.revokeObjectURL(url);
        activeAudio = null;
        resolve();
      });
    }
  });
}
