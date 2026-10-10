(function () {
  const face = document.getElementById("guess-face");
  const form = document.getElementById("guess-form");
  const input = document.getElementById("guess-answer");
  const turn = document.getElementById("guess-turn");
  const score = document.getElementById("guess-score");
  const best = document.getElementById("guess-best");
  if (!face || !form) return;

  let mode = "alone";
  let secret = 0;
  let guesses = 0;
  let yours = true;
  let you = 0;
  let them = 0;
  let fewest = 0;

  function readBest() {
    try { return Number(window.localStorage.getItem("abigail-guess-best")) || 0; } catch (err) { return 0; }
  }
  function writeBest(value) {
    try {
      const previous = readBest();
      if (!previous || value < previous) window.localStorage.setItem("abigail-guess-best", String(value));
    } catch (err) { /* this phone may block storage */ }
  }
  function paint() {
    face.textContent = "1 – 50";
    if (mode === "alone") {
      score.textContent = guesses + (guesses === 1 ? " guess" : " guesses");
      fewest = readBest();
      best.textContent = fewest ? " · best " + fewest : "";
    } else {
      score.textContent = you + " you · " + them + " them";
      best.textContent = "";
    }
  }
  function deal() {
    secret = 1 + Math.floor(Math.random() * 50);
    guesses = 0;
    input.value = "";
    paint();
    turn.textContent = mode === "turns" && !yours ? "Their guess." : "Higher or lower.";
  }
  function setMode(next) {
    mode = next;
    document.getElementById("guess-alone").classList.toggle("is-on", next === "alone");
    document.getElementById("guess-turns").classList.toggle("is-on", next === "turns");
    document.getElementById("guess-alone").setAttribute("aria-pressed", next === "alone" ? "true" : "false");
    document.getElementById("guess-turns").setAttribute("aria-pressed", next === "turns" ? "true" : "false");
    yours = true;
    you = 0;
    them = 0;
    deal();
  }
  document.getElementById("guess-alone").addEventListener("click", function () { setMode("alone"); });
  document.getElementById("guess-turns").addEventListener("click", function () { setMode("turns"); });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const guess = Number(input.value);
    if (!guess || guess < 1 || guess > 50) {
      turn.textContent = "From 1 to 50.";
      return;
    }
    guesses += 1;
    input.value = "";
    if (guess === secret) {
      if (window.AbigailAudio) window.AbigailAudio.blip();
      if (mode === "alone") {
        writeBest(guesses);
        turn.textContent = "Yes. " + guesses + (guesses === 1 ? " guess." : " guesses.");
        window.setTimeout(deal, 700);
      } else {
        if (yours) you += 1;
        else them += 1;
        yours = !yours;
        turn.textContent = "Found, in " + guesses + ". A new one.";
        window.setTimeout(deal, 700);
      }
      paint();
      return;
    }
    const hint = guess < secret ? "Higher." : "Lower.";
    if (mode === "turns") {
      yours = !yours;
      turn.textContent = hint + (yours ? " Your guess." : " Their guess.");
    } else turn.textContent = hint;
    paint();
  });
  setMode("alone");
})();
