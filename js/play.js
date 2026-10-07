(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function blip() {
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }

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
        blip();
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
    blip();
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
    }, reduced ? 0 : 720);
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
      const inner = document.createElement("span");
      inner.className = "card-inner";
      const back = document.createElement("span");
      back.className = "card-back";
      back.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "card-face";
      label.textContent = face;
      inner.appendChild(back);
      inner.appendChild(label);
      card.appendChild(inner);
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
  const passReady = document.getElementById("pass-ready");
  const passPanel = document.getElementById("pass-panel");
  const passHand = document.getElementById("pass-hand");
  const passPrompt = document.getElementById("pass-prompt");
  const passRound = document.getElementById("pass-round");
  let passOrder = [];
  let passIndex = 0;
  let handTimer = 0;

  function showPrompt() {
    passHand.hidden = true;
    passPanel.hidden = false;
    passPrompt.textContent = passOrder[passIndex];
    passRound.textContent = (passIndex + 1) + " of " + passOrder.length;
  }

  function startPass() {
    passOrder = shuffle(prompts);
    passIndex = 0;
    passReady.hidden = true;
    showPrompt();
  }

  document.getElementById("pass-begin").addEventListener("click", startPass);
  document.getElementById("pass-next").addEventListener("click", function () {
    if (!passOrder.length) return;
    window.clearTimeout(handTimer);
    passPanel.hidden = true;
    passHand.hidden = false;
    blip();
    handTimer = window.setTimeout(function () {
      passIndex = (passIndex + 1) % passOrder.length;
      showPrompt();
    }, reduced ? 0 : 700);
  });
  document.getElementById("pass-prev").addEventListener("click", function () {
    if (!passOrder.length) return;
    window.clearTimeout(handTimer);
    passIndex = (passIndex - 1 + passOrder.length) % passOrder.length;
    showPrompt();
  });
})();
