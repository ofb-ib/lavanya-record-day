import confetti from "canvas-confetti";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function burst(big = false): void {
  if (reducedMotion()) return;
  confetti({
    particleCount: big ? 220 : 90,
    spread: big ? 110 : 70,
    startVelocity: big ? 55 : 40,
    origin: { y: 0.3 },
    colors: ["#D6A646", "#F7F1E3", "#B8862F"],
  });
}

let audio: AudioContext | null = null;

/** A short tone. Call from a tap so the browser allows sound. */
export function beep(long = false): void {
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = long ? 440 : 880;
    gain.gain.setValueAtTime(0.25, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (long ? 0.6 : 0.15));
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + (long ? 0.6 : 0.15));
  } catch {
    // No sound available; the attempt still works.
  }
}

/** A short pop: a burst of filtered noise. */
export function popSound(): void {
  try {
    audio ??= new AudioContext();
    const len = Math.floor(audio.sampleRate * 0.12);
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    const src = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    src.buffer = buf;
    src.connect(filter).connect(audio.destination);
    src.start();
  } catch {
    // No sound available.
  }
}

let lock: WakeLockSentinel | null = null;

export async function keepAwake(on: boolean): Promise<void> {
  try {
    if (on && !lock && "wakeLock" in navigator) lock = await navigator.wakeLock.request("screen");
    if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch {
    lock = null;
  }
}
