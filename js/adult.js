(function () {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const key = "abigail-adult";

  function allowed() {
    try { return window.sessionStorage.getItem(key) === "1"; } catch (err) { return false; }
  }
  function allow() {
    try { window.sessionStorage.setItem(key, "1"); } catch (err) { /* continue for this visit anyway */ }
  }

  function hashCode(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffleWith(list, seed) {
    const rand = mulberry32(hashCode(seed));
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function freshCode() {
    let code = "";
    for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  function clean(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 4);
  }

  function copyLink(code, prefix) {
    const link = location.origin + location.pathname + "#" + prefix + "-" + code;
    const write = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(link)
      : Promise.reject();
    return write.catch(function () { window.prompt("Copy this link", link); });
  }

  const truths = [
    "Where do you want their hands. Say the place. Don’t point.",
    "What do you think about when you want them.",
    "Tell them the most selfish thing you want from them tonight.",
    "Describe, slowly, how you want to be kissed.",
    "What should they take off first. Yours, or theirs.",
    "Name something they do that you notice and have never said.",
    "Lights on, or off. Choose, and say why in one sentence.",
    "What do you want more of from them. Be specific.",
    "Tell them a sentence you would only say in the dark.",
    "Who decides when it stops. Say it out loud.",
    "What have you wanted to ask them and haven’t.",
    "Slow, or urgent. Pick one for the next ten minutes."
  ];

  const dares = [
    "Kiss them until one of you laughs.",
    "Take one thing off. You choose whose.",
    "Whisper in their ear what you want next. They don’t answer yet.",
    "Put their hand where you want it, over clothes, and leave it there for three breaths.",
    "Kiss their neck. Stop when they say your name.",
    "Sit close enough to feel them breathe, and don’t kiss yet.",
    "Tell them, quietly, where you want their mouth.",
    "Let them move your hand. You keep it where they put it for three breaths.",
    "Trade one piece of clothing. No commentary.",
    "Hold eye contact and tell them one thing you want. Then look away.",
    "They choose: a kiss, or a truth you were going to skip.",
    "Stand behind them and say what you want, close to their ear."
  ];

  const questions = [
    "What do you want their hands to do that they don’t do yet.",
    "Slow or urgent. Don’t explain it. Just choose.",
    "What should stay on.",
    "Tell them one place you want kissed, and one place you don’t.",
    "When do you want them closer than this.",
    "What do you want to hear from them, in the dark.",
    "Who leads the next five minutes.",
    "What are you hoping they ask you.",
    "Name the thing you’d skip if you were being polite.",
    "What do you want to be asked to do.",
    "Stay dressed, or lose one thing. Choose for both of you.",
    "What would you like them to repeat."
  ];

  function codeFromHash(prefix) {
    const raw = (location.hash || "").slice(1);
    if (raw.indexOf(prefix + "-") !== 0) return "";
    return clean(raw.slice(prefix.length + 1));
  }

  function setupDeck(prefix, list, nodes) {
    let code = codeFromHash(prefix) || freshCode();
    let deck = shuffleWith(list, code);
    let index = 0;
    nodes.codeEl.textContent = code;

    let lap = 0;
    function card() { return deck[index]; }
    function advance() {
      index += 1;
      if (index < deck.length) return;
      lap += 1;
      index = 0;
      deck = shuffleWith(list, code + ":" + lap);
    }
    function place() { return (index + 1) + " of " + deck.length; }

    nodes.copy.addEventListener("click", function () {
      copyLink(code, prefix).then(function () { nodes.copy.textContent = "Copied"; });
    });
    nodes.input.addEventListener("change", function () {
      const next = clean(nodes.input.value);
      if (next.length < 4) return;
      code = next;
      deck = shuffleWith(list, code);
      index = 0;
      nodes.codeEl.textContent = code;
      nodes.input.value = "";
      if (nodes.onJoin) nodes.onJoin();
    });
    return { card: card, advance: advance, place: place };
  }

  const dareGate = document.getElementById("dare-gate");
  const darePlay = document.getElementById("dare-play");
  const dareChoose = document.getElementById("dare-choose");
  const dareCard = document.getElementById("dare-card");
  const dareKind = document.getElementById("dare-kind");
  const darePrompt = document.getElementById("dare-prompt");
  let dareBag = "truth";
  let truthDeck = [];
  let dareDeck = [];
  let truthIndex = 0;
  let dareIndex = 0;
  let dareCode = codeFromHash("dare") || freshCode();

  function dealDare(code) {
    dareCode = code;
    truthDeck = shuffleWith(truths, code + ":t");
    dareDeck = shuffleWith(dares, code + ":d");
    truthIndex = 0;
    dareIndex = 0;
    document.getElementById("dare-code").textContent = code;
  }
  dealDare(dareCode);

  function currentDare() {
    return dareBag === "dare" ? dareDeck[dareIndex % dareDeck.length] : truthDeck[truthIndex % truthDeck.length];
  }
  function advanceDare() {
    if (dareBag === "dare") dareIndex = (dareIndex + 1) % dareDeck.length;
    else truthIndex = (truthIndex + 1) % truthDeck.length;
  }

  function openDare() {
    dareGate.hidden = true;
    darePlay.hidden = false;
    dareChoose.hidden = false;
    dareCard.hidden = true;
  }

  document.getElementById("dare-yes").addEventListener("click", function () {
    allow();
    openDare();
  });
  document.getElementById("dare-no").addEventListener("click", function () {
    document.getElementById("back").click();
  });
  document.getElementById("dare-copy").addEventListener("click", function () {
    const button = document.getElementById("dare-copy");
    copyLink(dareCode, "dare").then(function () { button.textContent = "Copied"; });
  });
  document.getElementById("dare-join").addEventListener("change", function () {
    const input = document.getElementById("dare-join");
    const next = clean(input.value);
    if (next.length < 4) return;
    dealDare(next);
    input.value = "";
    dareChoose.hidden = false;
    dareCard.hidden = true;
  });

  function showDare(kind) {
    dareBag = kind;
    dareKind.textContent = kind === "dare" ? "Dare" : "Truth";
    darePrompt.textContent = currentDare();
    dareChoose.hidden = true;
    dareCard.hidden = false;
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }

  document.getElementById("dare-truth").addEventListener("click", function () { showDare("truth"); });
  document.getElementById("dare-dare").addEventListener("click", function () { showDare("dare"); });
  document.getElementById("dare-skip").addEventListener("click", function () {
    window.Curtain.show({
      title: "Skipped.",
      note: "Hand the phone over.",
      done: function () {
        dareChoose.hidden = false;
        dareCard.hidden = true;
      }
    });
  });
  document.getElementById("dare-another").addEventListener("click", function () {
    advanceDare();
    darePrompt.textContent = currentDare();
  });
  document.getElementById("dare-done").addEventListener("click", function () {
    advanceDare();
    window.Curtain.show({
      title: "Their turn.",
      note: "Hand the phone over. They choose truth or dare.",
      done: function () {
        dareChoose.hidden = false;
        dareCard.hidden = true;
      }
    });
  });

  if (allowed()) openDare();

  const askGate = document.getElementById("ask-gate");
  const askPlay = document.getElementById("ask-play");
  const askPrompt = document.getElementById("ask-prompt");
  const askRound = document.getElementById("ask-round");
  const askList = questions.concat(window.AbigailLong ? window.AbigailLong.ask : []);
  const askDeck = setupDeck("ask", askList, {
    codeEl: document.getElementById("ask-code"),
    copy: document.getElementById("ask-copy"),
    input: document.getElementById("ask-join"),
    onJoin: function () { paintAsk(); }
  });

  function paintAsk() {
    askPrompt.textContent = askDeck.card();
    askRound.textContent = askDeck.place();
  }

  function openAsk() {
    askGate.hidden = true;
    askPlay.hidden = false;
    paintAsk();
  }

  document.getElementById("ask-yes").addEventListener("click", function () {
    allow();
    openAsk();
  });
  document.getElementById("ask-no").addEventListener("click", function () {
    document.getElementById("back").click();
  });
  document.getElementById("ask-next").addEventListener("click", function () {
    askDeck.advance();
    window.Curtain.show({
      title: "Their turn.",
      note: "Hand the phone over.",
      done: paintAsk
    });
  });
  document.getElementById("ask-skip").addEventListener("click", function () {
    askDeck.advance();
    paintAsk();
  });
  if (allowed()) openAsk();
})();
