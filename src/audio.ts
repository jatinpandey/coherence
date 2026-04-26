import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let configured = false;

export async function configureAudio() {
  if (configured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
    configured = true;
  } catch {}
}

function makeTone(freq: number, durationMs: number): string {
  const sampleRate = 22050;
  const samples = Math.floor((sampleRate * durationMs) / 1000);
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const env =
      Math.min(1, i / (sampleRate * 0.02)) *
      Math.min(1, (samples - i) / (sampleRate * 0.15));
    const v = Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
    view.setInt16(44 + i * 2, v * 32767, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const g: any = globalThis as any;
  const b64 =
    typeof g.btoa === "function"
      ? g.btoa(binary)
      : g.Buffer
      ? g.Buffer.from(binary, "binary").toString("base64")
      : "";
  return `data:audio/wav;base64,${b64}`;
}

let inhalePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let exhalePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let holdPlayer: ReturnType<typeof createAudioPlayer> | null = null;

function ensurePlayers() {
  if (inhalePlayer) return;
  try {
    inhalePlayer = createAudioPlayer({ uri: makeTone(523.25, 380) });
    exhalePlayer = createAudioPlayer({ uri: makeTone(349.23, 460) });
    holdPlayer = createAudioPlayer({ uri: makeTone(440.0, 240) });
  } catch {}
}

export async function playPhaseTone(
  phase: "inhale" | "exhale" | "holdIn" | "holdOut"
) {
  await configureAudio();
  ensurePlayers();
  const p =
    phase === "inhale"
      ? inhalePlayer
      : phase === "exhale"
      ? exhalePlayer
      : holdPlayer;
  if (!p) return;
  try {
    await p.seekTo(0);
    p.play();
  } catch {}
}
