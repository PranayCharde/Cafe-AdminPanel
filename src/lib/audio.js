// Web Audio Synthesizer for Kitchen Chime Alert
export function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

