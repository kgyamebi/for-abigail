(function () {
  const btn = document.getElementById("sound");
  if (!btn) return;
  const key = "abigail-sound";
  let audioCtx = null;
  let audioGain = null;
  let want = false;

  try { want = window.localStorage.getItem(key) === "1"; } catch (err) { want = false; }

  function save(on) {
    try { window.localStorage.setItem(key, on ? "1" : "0"); } catch (err) { /* storage may be blocked */ }
  }

  function ensure() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    if (audioCtx) return true;
    audioCtx = new Ctx();
    const seconds = 2;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    audioGain = audioCtx.createGain();
    audioGain.gain.value = 0;
    source.connect(filter);
    filter.connect(audioGain);
    audioGain.connect(audioCtx.destination);
    source.start();
    return true;
  }

  function setOn(on) {
    if (!ensure()) {
      btn.hidden = true;
      return;
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    audioGain.gain.cancelScheduledValues(audioCtx.currentTime);
    audioGain.gain.linearRampToValueAtTime(on ? 0.028 : 0, audioCtx.currentTime + 0.4);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "Mute" : "Sound";
    save(on);
  }

  btn.addEventListener("click", function () {
    setOn(btn.getAttribute("aria-pressed") !== "true");
  });

  if (want) {
    const arm = function () {
      setOn(true);
      window.removeEventListener("pointerdown", arm);
    };
    window.addEventListener("pointerdown", arm);
  }

  function blip() {
    if (btn.getAttribute("aria-pressed") !== "true" || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 540;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.13);
  }

  window.AbigailAudio = { blip: blip };
})();
