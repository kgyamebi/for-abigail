(function () {
  const hours = [
    { id: "h0", title: "Today.", line: "The night arrived with her name.", kicker: "16 October · Abigail Horlali Fiawoo" },
    { id: "h1", title: "Still.", line: "Her name is on the page while the house is quiet.", kicker: "Abigail Horlali Fiawoo" },
    { id: "h2", title: "Quiet.", line: "Anyone who opens this sees her first.", kicker: "For Abigail" },
    { id: "h3", title: "Before.", line: "The sixteenth is already here. It does not hurry.", kicker: "Both of them" },
    { id: "h4", title: "Almost.", line: "Hold the dark a little longer. Her name can take it.", kicker: "Abigail" },
    { id: "h5", title: "Morning.", line: "Both of them. The day is just opening.", kicker: "For Abigail" },
    { id: "h6", title: "Waking.", line: "The page woke with her.", kicker: "Abigail and her mother" },
    { id: "h7", title: "Light.", line: "There is nowhere else this light is going.", kicker: "16 October" },
    { id: "h8", title: "Open.", line: "Come in. The whole of it is theirs.", kicker: "For Abigail Horlali Fiawoo" },
    { id: "h9", title: "The day.", line: "It is still theirs. Stay as long as you like.", kicker: "Abigail and her mother" },
    { id: "h10", title: "Stay.", line: "Nothing on this page is in a rush.", kicker: "For Abigail" },
    { id: "h11", title: "Near noon.", line: "Her name has been here all morning. It can stay.", kicker: "Abigail Horlali Fiawoo" },
    { id: "h12", title: "Noon.", line: "The middle of their day. The page is full of it.", kicker: "Both of them" },
    { id: "h13", title: "Still today.", line: "The light has not gone anywhere.", kicker: "16 October" },
    { id: "h14", title: "Afternoon.", line: "Open it again. It is not the morning you left.", kicker: "For Abigail" },
    { id: "h15", title: "Later.", line: "The sixteenth is still the only thing this page is doing.", kicker: "Abigail" },
    { id: "h16", title: "The long light.", line: "Her name is the whole of this page.", kicker: "For Abigail Horlali Fiawoo" },
    { id: "h17", title: "Still gold.", line: "This is the hour people remember. It has her name in it.", kicker: "Abigail Horlali Fiawoo" },
    { id: "h18", title: "Folding.", line: "The day is folding, not ending.", kicker: "Both of them" },
    { id: "h19", title: "Evening.", line: "The day is still here. It does not have to end loudly.", kicker: "Both of them" },
    { id: "h20", title: "After.", line: "Whoever opens this now gets the evening, not the morning.", kicker: "For Abigail" },
    { id: "h21", title: "Nightfall.", line: "The lights on this page are the ones she keeps.", kicker: "Abigail" },
    { id: "h22", title: "Hold on.", line: "The last hours are still the sixteenth.", kicker: "Abigail Horlali Fiawoo" },
    { id: "h23", title: "Last.", line: "Stay. Tomorrow can wait until this date is finished.", kicker: "Abigail Horlali Fiawoo" }
  ];
  const keptPhases = [
    { id: "night", from: 0, keptTitle: "Kept.", keptLine: "The sixteenth stayed on this page." },
    { id: "dawn", from: 5, keptTitle: "Morning.", keptLine: "The page is still here." },
    { id: "day", from: 9, keptTitle: "Still here.", keptLine: "Play something. The day does not have to be the sixteenth." },
    { id: "afternoon", from: 13, keptTitle: "The afternoon.", keptLine: "A word and a number are waiting. They change at midnight." },
    { id: "gold", from: 16, keptTitle: "The light.", keptLine: "It is the same room. It is not the same hour." },
    { id: "evening", from: 19, keptTitle: "Evening.", keptLine: "Come in. Leave when you want." },
    { id: "late", from: 22, keptTitle: "The night.", keptLine: "The letter is where it was." }
  ];
  const words = ["amber", "river", "moon", "velvet", "night", "pearl", "flame", "willow", "garden", "silver", "honey", "cedar", "storm", "linen", "coral", "quiet", "maple", "orchid", "frost", "harbor", "lotus", "thunder", "saffron", "meadow", "crystal", "lantern", "blossom", "ivory", "canyon", "sparrow", "comet", "willow", "piano", "saffron", "tiger", "island", "bronze", "feather", "galaxy", "jasmine"];
  const title = document.getElementById("hero-title");
  const line = document.getElementById("today-line");
  const kicker = document.getElementById("hero-kicker");
  const caption = document.querySelector(".marks-caption");
  const nextNote = document.getElementById("next-note");
  const dayClock = document.getElementById("day-clock");
  const hourList = document.getElementById("hours");
  const live = document.getElementById("cd-live");
  const veil = document.getElementById("veil");
  const veilKicker = document.getElementById("veil-kicker");
  const veilLine = document.getElementById("veil-line");
  const veilGo = document.getElementById("veil-go");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mode = "approach";
  let phase = hours[0];
  let latest = new Date();
  let veilTimer = 0;
  let lastSpoken = "";

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function unit(now) {
    let a = hash(dateKey(now)) || 1;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function dateKey(now) {
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  }
  function season(now) {
    const month = now.getMonth();
    const date = now.getDate();
    if (month === 9 && date === 16) return "birthday";
    if (month === 9 && date < 16) return "approach";
    return "kept";
  }
  function keptFor(now) {
    const hour = now.getHours();
    let found = keptPhases[0];
    for (let i = 0; i < keptPhases.length; i++) {
      if (hour >= keptPhases[i].from) found = keptPhases[i];
    }
    return found;
  }
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  function placeLight(now, on) {
    const root = document.documentElement;
    if (!on) {
      root.style.removeProperty("--day-x");
      root.style.removeProperty("--day-y");
      root.style.removeProperty("--day-a");
      return;
    }
    const t = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const u = Math.max(0, Math.min(1, (t - 5.5) / (18.75 - 5.5)));
    const x = 8 + u * 84;
    const y = 72 - Math.sin(u * Math.PI) * 84;
    let glow = 0.04;
    if (t >= 5 && t < 8) glow = 0.11 + ((t - 5) / 3) * 0.06;
    else if (t >= 8 && t < 15) glow = 0.16;
    else if (t >= 15 && t < 19) glow = 0.14 + (1 - Math.min(1, Math.abs(t - 17.15) / 2)) * 0.2;
    else if (t >= 19 && t < 22) glow = 0.08;
    root.style.setProperty("--day-x", x.toFixed(2) + "%");
    root.style.setProperty("--day-y", y.toFixed(2) + "%");
    root.style.setProperty("--day-a", glow.toFixed(3));
  }
  function paintHours(now, onDay) {
    if (!hourList) return;
    if (!hourList.children.length) {
      for (let i = 0; i < 24; i++) hourList.appendChild(document.createElement("li"));
    }
    const h = now.getHours();
    for (let i = 0; i < hourList.children.length; i++) {
      hourList.children[i].classList.toggle("is-past", onDay && i < h);
      hourList.children[i].classList.toggle("is-now", onDay && i === h);
    }
  }
  function paint(now, nextMode) {
    latest = now;
    mode = nextMode;
    const onDay = mode === "birthday";
    phase = onDay ? hours[now.getHours()] : keptFor(now);
    const root = document.documentElement;
    if (onDay) root.dataset.phase = phase.id;
    else if (mode === "kept") root.dataset.phase = phase.id;
    root.classList.toggle("is-today", onDay);
    root.classList.toggle("is-kept", mode === "kept");
    placeLight(now, onDay);
    paintHours(now, onDay);
    if (dayClock) {
      dayClock.textContent = onDay
        ? "16 October · " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds())
        : "";
    }
    if (mode === "approach") {
      root.removeAttribute("data-phase");
      if (kicker) kicker.textContent = "16 October · Abigail and her mother";
      if (title) title.textContent = "16 October";
      if (caption) caption.textContent = "The first sixteen days of October. The last belongs to them.";
      if (nextNote) nextNote.hidden = true;
      hideVeil();
      paintDaily(now);
      return;
    }
    const nextTitle = onDay ? phase.title : phase.keptTitle;
    const nextLine = onDay ? phase.line : phase.keptLine;
    const changed = line && line.textContent !== nextLine;
    if (title) title.textContent = nextTitle;
    if (line) line.textContent = nextLine;
    if (kicker) kicker.textContent = onDay ? phase.kicker : "After the sixteenth";
    if (caption) caption.textContent = onDay ? "The sixteenth. It changes as the hours do." : "The sixteenth was theirs. The page stayed.";
    if (nextNote) {
      nextNote.hidden = onDay;
      nextNote.textContent = "The next 16 October will come. This page is not waiting for it.";
    }
    const spoken = onDay ? "Today is 16 October. " + phase.line : phase.keptLine;
    if (live && spoken !== lastSpoken) {
      lastSpoken = spoken;
      live.textContent = spoken;
    }
    const bar = document.getElementById("bar-title");
    if (bar && document.body.getAttribute("data-screen") === "home") {
      bar.textContent = onDay ? "Today" : "For Abigail";
    }
    if (!reduced && changed && line) {
      line.classList.remove("is-new");
      void line.offsetWidth;
      line.classList.add("is-new");
    }
    if (mode === "birthday" && document.body.getAttribute("data-screen") === "home") welcome();
    paintDaily(now);
  }
  function hideVeil() {
    window.clearTimeout(veilTimer);
    if (!veil) return;
    veil.hidden = true;
    document.body.classList.remove("is-veiled");
  }
  function welcome() {
    if (mode !== "birthday" || !veil) return;
    if (document.body.getAttribute("data-screen") !== "home") return;
    const token = dateKey(latest) + ":" + phase.id;
    let seen = "";
    try { seen = window.sessionStorage.getItem("abigail-veil") || ""; } catch (err) { seen = ""; }
    if (seen === token) return;
    try { window.sessionStorage.setItem("abigail-veil", token); } catch (err) { /* show it anyway */ }
    if (veilKicker) veilKicker.textContent = phase.kicker;
    if (veilLine) veilLine.textContent = phase.line;
    veil.hidden = false;
    document.body.classList.add("is-veiled");
    if (veilGo) veilGo.focus();
    window.clearTimeout(veilTimer);
    if (!reduced) veilTimer = window.setTimeout(hideVeil, 9000);
  }
  if (veilGo) veilGo.addEventListener("click", hideVeil);

  const dayFace = document.getElementById("day-face");
  const daySum = document.getElementById("day-sum");
  const dayForm = document.getElementById("day-form");
  const dayAnswer = document.getElementById("day-answer");
  const dayTurn = document.getElementById("day-turn");
  const dayKicker = document.getElementById("day-kicker");
  let dayWord = "";
  let dayValue = 0;
  let daySumText = "";
  let dayStage = "word";
  let dayStamp = "";

  function mixWord(word, rand) {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const swap = letters[i];
      letters[i] = letters[j];
      letters[j] = swap;
    }
    if (letters.join("") === word && letters.length > 1) letters.push(letters.shift());
    return letters.join(" ");
  }
  function puzzleFor(now) {
    const rand = unit(now);
    const word = words[Math.floor(rand() * words.length)];
    const a = 2 + Math.floor(rand() * 9);
    const b = 2 + Math.floor(rand() * 9);
    const times = Math.floor(rand() * 2) === 1;
    return {
      word: word,
      mixed: mixWord(word, rand),
      sum: times ? a + " × " + b : a + " + " + b,
      value: times ? a * b : a + b
    };
  }
  function paintDaily(now) {
    if (!dayFace) return;
    const stamp = dateKey(now);
    const onDay = season(now) === "birthday";
    if (dayKicker) dayKicker.textContent = onDay ? "Their day" : "Changes at midnight";
    if (stamp === dayStamp) return;
    dayStamp = stamp;
    const puzzle = puzzleFor(now);
    dayWord = puzzle.word;
    dayValue = puzzle.value;
    daySumText = puzzle.sum;
    dayStage = "word";
    let solved = "";
    try { solved = window.localStorage.getItem("abigail-daily") || ""; } catch (err) { solved = ""; }
    if (solved === stamp) {
      dayFace.textContent = puzzle.word;
      daySum.textContent = puzzle.sum + " = " + puzzle.value;
      if (dayTurn) dayTurn.textContent = "You have today’s. Tomorrow, another.";
      if (dayAnswer) dayAnswer.hidden = true;
      const doneButton = dayForm && dayForm.querySelector("button");
      if (doneButton) doneButton.hidden = true;
      return;
    }
    dayFace.textContent = puzzle.mixed;
    daySum.textContent = "";
    if (dayAnswer) {
      dayAnswer.hidden = false;
      dayAnswer.value = "";
    }
    const againButton = dayForm && dayForm.querySelector("button");
    if (againButton) againButton.hidden = false;
    if (dayTurn) dayTurn.textContent = onDay ? "Theirs, today. The word first." : "The word first. It will be different tomorrow.";
  }
  if (dayForm) {
    dayForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const raw = String(dayAnswer.value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!raw) return;
      if (dayStage === "word") {
        if (raw !== dayWord) {
          dayTurn.textContent = "Not that word.";
          return;
        }
        dayStage = "sum";
        dayFace.textContent = dayWord;
        daySum.textContent = daySumText;
        dayAnswer.value = "";
        dayTurn.textContent = "Now the number.";
        if (window.AbigailAudio) window.AbigailAudio.blip();
        return;
      }
      if (Number(raw) !== dayValue) {
        dayTurn.textContent = "Not that number.";
        return;
      }
      try { window.localStorage.setItem("abigail-daily", dayStamp); } catch (err) { /* keep going */ }
      dayAnswer.hidden = true;
      const submit = dayForm.querySelector("button");
      if (submit) submit.hidden = true;
      dayTurn.textContent = "You have today’s. Tomorrow, another.";
      if (window.AbigailAudio) window.AbigailAudio.blip();
    });
  }

  window.AbigailDay = {
    season: season,
    sync: paint,
    welcome: welcome,
    hide: hideVeil
  };
})();
