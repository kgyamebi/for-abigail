(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const body = document.body;
  const intro = document.getElementById("intro");
  const enter = document.getElementById("enter");
  const play = document.getElementById("play");
  const playLabel = document.getElementById("play-label");
  const soundBtn = document.getElementById("sound");
  const bar = document.getElementById("progress");
  const finale = document.getElementById("stay");
  const hold = document.getElementById("hold");
  const overture = document.getElementById("overture");
  const title = document.getElementById("title");
  const veil = document.getElementById("veil");
  const cursor = document.getElementById("cursor");
  const dust = document.getElementById("dust");

  if (fine && !reduced) body.classList.add("fine");

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

  let opened = false;
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

  function finishOpen() {
    body.classList.add("is-named");
    body.classList.remove("locked");
    document.title = "Abigail Horlali Fiawoo";
  }

  function openPage() {
    if (opened) return;
    opened = true;
    body.classList.add("is-open");
    window.setTimeout(function () { intro.setAttribute("hidden", ""); }, 1100);

    if (reduced) {
      finishOpen();
      return;
    }

    window.setTimeout(function () { overture.classList.add("is-out"); }, 4300);
    window.setTimeout(function () { veil.classList.add("is-on"); }, 5300);
    window.setTimeout(function () {
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, title.offsetTop);
      root.style.scrollBehavior = "";
      veil.classList.remove("is-on");
      body.classList.add("is-named");
      document.title = "Abigail Horlali Fiawoo";
    }, 6150);
    window.setTimeout(function () { body.classList.remove("locked"); }, 8200);
  }

  if (reduced) openPage();
  else enter.addEventListener("click", openPage);

  window.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !opened && event.target !== hold) openPage();
  });

  function scrollProgress() {
    const max = root.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  function paintBar(value) {
    bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, value)) + ")";
  }

  function onScroll() {
    if (!playing) paintBar(scrollProgress());
    parallax();
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  const sections = document.querySelectorAll("[data-spy-section]");
  const links = document.querySelectorAll("[data-spy]");
  const spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("data-spy-section");
        links.forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("data-spy") === id);
        });
      });
    },
    { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
  );
  sections.forEach(function (section) { spy.observe(section); });

  const reveal = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.28 }
  );
  document.querySelectorAll(".verse, .plate, .letter-wrap").forEach(function (el) {
    reveal.observe(el);
  });

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function topOf(el) {
    return window.scrollY + el.getBoundingClientRect().top;
  }

  function setPlaying(next) {
    playing = next;
    play.setAttribute("aria-pressed", next ? "true" : "false");
    playLabel.textContent = next ? "Pause" : "Play";
  }

  function stopFilm() {
    playing = false;
    paused = false;
    mode = "idle";
    reading = false;
    cancelAnimationFrame(filmFrame);
    setPlaying(false);
    root.style.scrollBehavior = "";
    paintBar(scrollProgress());
  }

  function beginMove(index, fromRead) {
    const item = beats[index];
    const el = document.querySelector(item.sel);
    if (!el) return stopFilm();
    beat = index;
    reading = Boolean(fromRead);
    linearMove = Boolean(fromRead);
    moveFrom = window.scrollY;
    if (fromRead) {
      moveTo = Math.max(topOf(el), topOf(el) + el.offsetHeight - window.innerHeight);
      moveDur = item.dwell;
    } else {
      moveTo = Math.max(0, topOf(el));
      const dist = Math.abs(moveTo - moveFrom);
      moveDur = Math.min(1700, Math.max(680, dist * 0.85));
    }
    moveStart = performance.now();
    mode = "move";
  }

  function filmStep(now) {
    if (!playing) return;
    const item = beats[beat];
    if (mode === "move") {
      const t = Math.min(1, (now - moveStart) / moveDur);
      root.style.scrollBehavior = "auto";
      const curved = linearMove ? t : ease(t);
      window.scrollTo(0, moveFrom + (moveTo - moveFrom) * curved);
      if (t >= 1) {
        if (item.read && !reading) {
          reading = true;
          beginMove(beat, true);
        } else {
          mode = "dwell";
          reading = false;
          dwellStart = now;
          dwellDur = item.read ? 700 : item.dwell;
        }
      }
    } else if ((now - dwellStart) / dwellDur >= 1) {
      if (beat >= beats.length - 1) {
        stopFilm();
        return;
      }
      beginMove(beat + 1, false);
    }

    const local = mode === "move"
      ? Math.min(1, (now - moveStart) / moveDur)
      : Math.min(1, (now - dwellStart) / dwellDur);
    paintBar((beat + local) / beats.length);
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
    if (!opened) openPage();
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
    if (!body.classList.contains("is-named") && !reduced) return;
    setPlaying(true);
    beginMove(nearestBeat(), false);
    filmFrame = requestAnimationFrame(filmStep);
  });

  function interrupt() {
    if (playing || paused) stopFilm();
  }

  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchmove", interrupt, { passive: true });
  window.addEventListener("keydown", function (event) {
    const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
    if (keys.indexOf(event.key) !== -1 && document.activeElement !== hold) interrupt();
  });

  function holdOn(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (playing || paused) stopFilm();
    finale.classList.add("is-holding");
    if (event.pointerId !== undefined && hold.setPointerCapture) {
      hold.setPointerCapture(event.pointerId);
    }
  }

  function holdOff() {
    finale.classList.remove("is-holding");
  }

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

  let audioCtx = null;
  let audioGain = null;

  function ensureRoom() {
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

  soundBtn.addEventListener("click", function () {
    if (!ensureRoom()) {
      soundBtn.hidden = true;
      return;
    }
    const on = soundBtn.getAttribute("aria-pressed") !== "true";
    if (audioCtx.state === "suspended") audioCtx.resume();
    audioGain.gain.cancelScheduledValues(audioCtx.currentTime);
    audioGain.gain.linearRampToValueAtTime(on ? 0.028 : 0, audioCtx.currentTime + 0.4);
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
    soundBtn.textContent = on ? "Mute" : "Sound";
  });

  const frames = document.querySelectorAll(".frame img");
  function parallax() {
    if (reduced) return;
    frames.forEach(function (img) {
      const rect = img.getBoundingClientRect();
      const center = (rect.top + rect.height / 2) / window.innerHeight - 0.5;
      img.style.translate = "0 " + (-center * 14).toFixed(2) + "px";
    });
  }
  parallax();

  if (!reduced) {
    const ctx = dust.getContext("2d");
    const count = fine ? 22 : 10;
    const specks = [];
    function sizeCanvas() {
      dust.width = window.innerWidth;
      dust.height = window.innerHeight;
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    for (let i = 0; i < count; i++) {
      specks.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.3 + 0.3,
        s: Math.random() * 0.15 + 0.04,
        a: Math.random() * 0.35 + 0.08
      });
    }
    function drawDust() {
      if (document.hidden) {
        window.setTimeout(drawDust, 400);
        return;
      }
      ctx.clearRect(0, 0, dust.width, dust.height);
      specks.forEach(function (speck) {
        speck.y -= speck.s / dust.height;
        if (speck.y < 0) speck.y = 1;
        ctx.fillStyle = "rgba(228, 200, 154," + speck.a + ")";
        ctx.beginPath();
        ctx.arc(speck.x * dust.width, speck.y * dust.height, speck.r, 0, Math.PI * 2);
        ctx.fill();
      });
      window.requestAnimationFrame(drawDust);
    }
    drawDust();
  } else {
    dust.remove();
  }

  if (fine && !reduced) {
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let seen = false;
    window.addEventListener("pointermove", function (event) {
      if (!seen) {
        seen = true;
        cursor.style.opacity = "1";
      }
      x = event.clientX;
      y = event.clientY;
      const hit = event.target.closest("a, button");
      body.classList.toggle("on-link", Boolean(hit));
    });
    function moveCursor() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      window.requestAnimationFrame(moveCursor);
    }
    moveCursor();
  }
})();
