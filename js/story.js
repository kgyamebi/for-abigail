(function () {
  const root = document.documentElement;
  const play = document.getElementById("play");
  const playLabel = document.getElementById("play-label");
  const bar = document.getElementById("progress");
  const finale = document.getElementById("stay");
  const hold = document.getElementById("hold");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const beats = [
    { sel: "#overture", dwell: 2800 },
    { sel: "#title", dwell: 4600 },
    { sel: "#v1", dwell: 2400 },
    { sel: "#portrait", dwell: 4600 },
    { sel: "#v2", dwell: 2600 },
    { sel: "#still", dwell: 4200 },
    { sel: "#v3", dwell: 2600 },
    { sel: "#light", dwell: 4400 },
    { sel: "#letter", dwell: 15000, read: true },
    { sel: "#stay", dwell: 2200 }
  ];

  let playing = false;
  let paused = false;
  let mode = "idle";
  let beat = 0;
  let moveFrom = 0;
  let moveTo = 0;
  let moveStart = 0;
  let moveDur = 1200;
  let dwellStart = 0;
  let dwellDur = 0;
  let reading = false;
  let linearMove = false;
  let pausedAt = 0;
  let filmFrame = 0;

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function topOf(el) {
    return window.scrollY + el.getBoundingClientRect().top - 72;
  }

  function paint(value) {
    bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, value)) + ")";
  }

  function setPlaying(next) {
    playing = next;
    play.setAttribute("aria-pressed", next ? "true" : "false");
    playLabel.textContent = next ? "Pause" : "Play";
  }

  function stop() {
    playing = false;
    paused = false;
    mode = "idle";
    reading = false;
    cancelAnimationFrame(filmFrame);
    setPlaying(false);
    root.style.scrollBehavior = "";
  }

  function beginMove(index, fromRead) {
    const item = beats[index];
    const el = document.querySelector(item.sel);
    if (!el) return stop();
    beat = index;
    reading = Boolean(fromRead);
    linearMove = Boolean(fromRead);
    moveFrom = window.scrollY;
    if (fromRead) {
      moveTo = Math.max(topOf(el), topOf(el) + el.offsetHeight - window.innerHeight);
      moveDur = item.dwell;
    } else {
      moveTo = Math.max(0, topOf(el));
      moveDur = Math.min(1700, Math.max(680, Math.abs(moveTo - moveFrom) * 0.85));
    }
    if (reduced) moveDur = 1;
    moveStart = performance.now();
    mode = "move";
  }

  function filmStep(now) {
    if (!playing) return;
    const item = beats[beat];
    if (mode === "move") {
      const t = Math.min(1, (now - moveStart) / moveDur);
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, moveFrom + (moveTo - moveFrom) * (linearMove ? t : ease(t)));
      if (t >= 1) {
        if (item.read && !reading) beginMove(beat, true);
        else {
          mode = "dwell";
          reading = false;
          dwellStart = now;
          dwellDur = item.read ? 700 : item.dwell;
        }
      }
    } else if ((now - dwellStart) / dwellDur >= 1) {
      if (beat >= beats.length - 1) return stop();
      beginMove(beat + 1, false);
    }
    const local = mode === "move"
      ? Math.min(1, (now - moveStart) / moveDur)
      : Math.min(1, (now - dwellStart) / dwellDur);
    paint((beat + local) / beats.length);
    filmFrame = requestAnimationFrame(filmStep);
  }

  function nearestBeat() {
    let best = 0;
    const y = window.scrollY + 24;
    beats.forEach(function (item, index) {
      const el = document.querySelector(item.sel);
      if (el && topOf(el) <= y) best = index;
    });
    return best;
  }

  play.addEventListener("click", function () {
    if (document.body.getAttribute("data-screen") !== "story") return;
    if (playing) {
      paused = true;
      pausedAt = performance.now();
      setPlaying(false);
      cancelAnimationFrame(filmFrame);
      return;
    }
    if (paused) {
      const drift = performance.now() - pausedAt;
      moveStart += drift;
      dwellStart += drift;
      paused = false;
      setPlaying(true);
      filmFrame = requestAnimationFrame(filmStep);
      return;
    }
    setPlaying(true);
    beginMove(nearestBeat(), false);
    filmFrame = requestAnimationFrame(filmStep);
  });

  function interrupt() {
    if (playing || paused) stop();
  }

  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchmove", interrupt, { passive: true });

  function holdOn(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    interrupt();
    finale.classList.add("is-holding");
    if (event.pointerId !== undefined && hold.setPointerCapture) hold.setPointerCapture(event.pointerId);
  }
  function holdOff() { finale.classList.remove("is-holding"); }

  hold.addEventListener("pointerdown", holdOn);
  hold.addEventListener("pointerup", holdOff);
  hold.addEventListener("pointercancel", holdOff);
  hold.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      finale.classList.add("is-holding");
    }
  });
  hold.addEventListener("keyup", function (event) {
    if (event.key === " " || event.key === "Enter") holdOff();
  });
  hold.addEventListener("blur", holdOff);

  const frames = document.querySelectorAll(".frame img");
  function parallax() {
    if (reduced || document.body.getAttribute("data-screen") !== "story") return;
    frames.forEach(function (img) {
      const rect = img.getBoundingClientRect();
      const center = (rect.top + rect.height / 2) / window.innerHeight - 0.5;
      img.style.translate = "0 " + (-center * 10).toFixed(2) + "px";
    });
  }
  window.addEventListener("scroll", parallax, { passive: true });

  window.AbigailStory = { stop: stop, enter: function () {} };
})();
