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
    { sel: "#sixteenth", dwell: 7000 },
    { sel: "#hall", dwell: 4200 },
    { sel: "#stay", dwell: 2200 }
  ];

  let opened = false;
  let openTimers = [];

  function later(fn, ms) {
    const id = window.setTimeout(fn, ms);
    openTimers.push(id);
    return id;
  }

  function cancelOpening() {
    openTimers.forEach(function (id) { window.clearTimeout(id); });
    openTimers = [];
    veil.classList.remove("is-on");
  }

  function revealPage() {
    opened = true;
    body.classList.add("is-open", "is-named");
    body.classList.remove("locked");
    intro.setAttribute("hidden", "");
    document.title = "Abigail Horlali Fiawoo";
  }

  function goToHall() {
    cancelOpening();
    revealPage();
    const hall = document.getElementById("hall");
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + hall.getBoundingClientRect().top);
    root.style.scrollBehavior = "";
  }
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
    later(function () { intro.setAttribute("hidden", ""); }, 1100);

    if (reduced) {
      finishOpen();
      return;
    }

    later(function () { overture.classList.add("is-out"); }, 4300);
    later(function () { veil.classList.add("is-on"); }, 5300);
    later(function () {
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, title.offsetTop);
      root.style.scrollBehavior = "";
      veil.classList.remove("is-on");
      body.classList.add("is-named");
      document.title = "Abigail Horlali Fiawoo";
    }, 6150);
    later(function () { body.classList.remove("locked"); }, 8200);
  }

  if (reduced) openPage();
  else enter.addEventListener("click", openPage);

  document.getElementById("to-activities").addEventListener("click", goToHall);
  document.getElementById("hall-jump").addEventListener("click", function (event) {
    event.preventDefault();
    goToHall();
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !opened && event.target !== hold && event.target.id !== "to-activities") openPage();
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

  const marks = document.getElementById("marks");
  const daysEl = document.getElementById("cd-days");
  const daysLabel = document.getElementById("cd-days-label");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");
  const todayEl = document.getElementById("day-today");
  const gridEl = document.getElementById("clock-grid");
  const liveEl = document.getElementById("cd-live");
  let lastLive = "";

  for (let d = 1; d <= 16; d++) {
    const li = document.createElement("li");
    li.dataset.day = String(d);
    marks.appendChild(li);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function upcomingSixteenth(now) {
    const year = now.getFullYear();
    const start = new Date(year, 9, 16, 0, 0, 0, 0);
    const end = new Date(year, 9, 17, 0, 0, 0, 0);
    if (now >= end) return new Date(year + 1, 9, 16, 0, 0, 0, 0);
    return start;
  }

  function tickClock() {
    const now = new Date();
    const target = upcomingSixteenth(now);
    const birthdayEnd = new Date(target.getFullYear(), 9, 17, 0, 0, 0, 0);
    const onDay = now >= target && now < birthdayEnd;
    todayEl.hidden = !onDay;
    gridEl.hidden = onDay;

    marks.querySelectorAll("li").forEach(function (li) {
      const day = Number(li.dataset.day);
      const approaching = now.getMonth() === 9 && now.getDate() < 16 && now.getFullYear() === target.getFullYear();
      li.classList.toggle("is-lit", onDay || (approaching && now.getDate() >= day));
    });

    if (onDay) {
      if (lastLive !== "today") {
        lastLive = "today";
        liveEl.textContent = "Today is 16 October. Abigail and her mother.";
      }
      return;
    }

    let diff = target.getTime() - now.getTime();
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    daysEl.textContent = String(days);
    daysLabel.textContent = days === 1 ? "day" : "days";
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.classList.remove("is-tick");
    void secsEl.offsetWidth;
    secsEl.textContent = pad(secs);
    secsEl.classList.add("is-tick");
    const spoken = days + " days until 16 October.";
    if (spoken !== lastLive) {
      lastLive = spoken;
      liveEl.textContent = spoken + " Abigail and her mother.";
    }
  }

  tickClock();
  window.setInterval(tickClock, 1000);

  const sky = document.getElementById("sky");
  const keptEl = document.getElementById("kept");
  const doneEl = document.getElementById("game-done");
  const againBtn = document.getElementById("game-again");
  const beginBtn = document.getElementById("game-begin");

  function startLights() {
    sky.hidden = false;
    sky.innerHTML = "";
    sky.classList.remove("is-won");
    beginBtn.hidden = true;
    doneEl.hidden = true;
    againBtn.hidden = true;
    keptEl.textContent = "0";
    let caught = 0;

    for (let i = 0; i < 16; i++) {
      const mote = document.createElement("button");
      mote.type = "button";
      mote.className = "mote";
      mote.setAttribute("aria-label", "Light " + (i + 1) + " of 16");
      mote.style.left = (6 + Math.random() * 82) + "%";
      mote.style.animationDuration = (8 + Math.random() * 7).toFixed(2) + "s";
      mote.style.animationDelay = (-Math.random() * 9).toFixed(2) + "s";
      mote.addEventListener("click", function () {
        if (mote.classList.contains("is-caught")) return;
        mote.classList.add("is-caught");
        caught += 1;
        keptEl.textContent = String(caught);
        if (caught === 16) {
          sky.classList.add("is-won");
          doneEl.hidden = false;
          againBtn.hidden = false;
        }
      });
      sky.appendChild(mote);
    }
  }

  beginBtn.addEventListener("click", startLights);
  againBtn.addEventListener("click", startLights);

  const faces = ["16", "Abigail", "Gold", "Night", "Light", "Mother", "Stay", "Kofi"];
  const board = document.getElementById("board");
  const turnsEl = document.getElementById("pair-turns");
  const turnsWord = document.getElementById("pair-turns-word");
  const bestEl = document.getElementById("pair-best");
  const pairsDone = document.getElementById("pairs-done");
  const pairsAgain = document.getElementById("pairs-again");
  const pairsBegin = document.getElementById("pairs-begin");
  let flipTimer = 0;
  let boardLocked = false;
  let openCards = [];
  let pairMatches = 0;
  let pairTurns = 0;

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function showBest() {
    let best = 0;
    try { best = Number(window.localStorage.getItem("abigail-pairs-best")) || 0; } catch (err) { best = 0; }
    bestEl.textContent = best ? " · best " + best : "";
  }

  function finishPairs() {
    pairsDone.hidden = false;
    pairsDone.textContent = "Every pair found, in " + pairTurns + (pairTurns === 1 ? " turn." : " turns.");
    pairsAgain.hidden = false;
    try {
      const previous = Number(window.localStorage.getItem("abigail-pairs-best")) || 0;
      if (!previous || pairTurns < previous) window.localStorage.setItem("abigail-pairs-best", String(pairTurns));
    } catch (err) { /* this phone may block storage */ }
    showBest();
  }

  function flipCard(card) {
    if (boardLocked || card.classList.contains("is-open") || card.classList.contains("is-matched")) return;
    card.classList.add("is-open");
    card.setAttribute("aria-label", card.dataset.face);
    openCards.push(card);
    if (openCards.length < 2) return;
    pairTurns += 1;
    turnsEl.textContent = String(pairTurns);
    turnsWord.textContent = pairTurns === 1 ? " turn" : " turns";
    const first = openCards[0];
    const second = openCards[1];
    openCards = [];
    if (first.dataset.face === second.dataset.face) {
      first.classList.add("is-matched");
      second.classList.add("is-matched");
      pairMatches += 1;
      if (pairMatches === faces.length) finishPairs();
      return;
    }
    boardLocked = true;
    flipTimer = window.setTimeout(function () {
      first.classList.remove("is-open");
      second.classList.remove("is-open");
      first.setAttribute("aria-label", "Hidden card");
      second.setAttribute("aria-label", "Hidden card");
      boardLocked = false;
    }, 720);
  }

  function dealPairs() {
    window.clearTimeout(flipTimer);
    boardLocked = false;
    openCards = [];
    pairMatches = 0;
    pairTurns = 0;
    turnsEl.textContent = "0";
    turnsWord.textContent = " turns";
    pairsDone.hidden = true;
    pairsAgain.hidden = true;
    pairsBegin.hidden = true;
    board.hidden = false;
    board.innerHTML = "";
    shuffle(faces.concat(faces)).forEach(function (face) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.dataset.face = face;
      card.setAttribute("aria-label", "Hidden card");
      const label = document.createElement("span");
      label.textContent = face;
      card.appendChild(label);
      card.addEventListener("click", function () { flipCard(card); });
      board.appendChild(card);
    });
  }

  showBest();
  pairsBegin.addEventListener("click", dealPairs);
  pairsAgain.addEventListener("click", dealPairs);

  const prompts = [
    "The person holding the phone tells a true story in one sentence. Then pass it to the left.",
    "Everyone names something that happened on a 16th. Any 16th counts.",
    "Give Abigail one sincere sentence. No jokes on this turn.",
    "Decide who will hold the last page the longest. The winner chooses the next game.",
    "One person describes a scene on this page without naming anyone. The others guess which one.",
    "Count to sixteen as a group. One number each. If two people speak at once, begin again.",
    "The holder asks what you should do on the 16th. Every answer is four words.",
    "Pass the phone to the person who has spoken the least.",
    "One minute. Name things in the room that are gold. No writing, just the room talking.",
    "Close the round by reading her name once, in full. Abigail Horlali Fiawoo."
  ];
  const passPanel = document.getElementById("pass-panel");
  const passPrompt = document.getElementById("pass-prompt");
  const passRound = document.getElementById("pass-round");
  const passBegin = document.getElementById("pass-begin");
  let passOrder = [];
  let passIndex = 0;

  function showPrompt() {
    passPrompt.textContent = passOrder[passIndex];
    passRound.textContent = (passIndex + 1) + " of " + passOrder.length;
  }

  function startPass() {
    passOrder = shuffle(prompts);
    passIndex = 0;
    passBegin.hidden = true;
    passPanel.hidden = false;
    showPrompt();
  }

  passBegin.addEventListener("click", startPass);
  document.getElementById("pass-next").addEventListener("click", function () {
    if (!passOrder.length) return;
    passIndex = (passIndex + 1) % passOrder.length;
    showPrompt();
  });
  document.getElementById("pass-prev").addEventListener("click", function () {
    if (!passOrder.length) return;
    passIndex = (passIndex - 1 + passOrder.length) % passOrder.length;
    showPrompt();
  });
})();
