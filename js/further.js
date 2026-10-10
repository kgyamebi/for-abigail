(function () {
  const gate = document.getElementById("further-gate");
  const play = document.getElementById("further-play");
  if (!gate || !play || !window.AbigailLong) return;
  const truths = window.AbigailLong.truths;
  const dares = window.AbigailLong.dares;
  const choose = document.getElementById("further-choose");
  const card = document.getElementById("further-card");
  const kindEl = document.getElementById("further-kind");
  const prompt = document.getElementById("further-prompt");
  const key = "abigail-adult";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let bag = "truth";
  let truthDeck = [];
  let dareDeck = [];
  let truthIndex = 0;
  let dareIndex = 0;
  let truthLap = 0;
  let dareLap = 0;
  let turned = false;

  function allowed() {
    try { return window.sessionStorage.getItem(key) === "1"; } catch (err) { return false; }
  }
  function allow() {
    try { window.sessionStorage.setItem(key, "1"); } catch (err) { /* this visit still opens */ }
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
  function codeFromHash() {
    const raw = (location.hash || "").slice(1);
    if (raw.indexOf("further-") !== 0) return "";
    return clean(raw.slice(8));
  }
  let code = codeFromHash() || freshCode();

  function deal(next) {
    code = next;
    truthLap = 0;
    dareLap = 0;
    truthDeck = shuffleWith(truths, code + ":t");
    dareDeck = shuffleWith(dares, code + ":d");
    truthIndex = 0;
    dareIndex = 0;
    turned = false;
    document.getElementById("further-code").textContent = code;
  }
  deal(code);

  function current() {
    return bag === "dare" ? dareDeck[dareIndex] : truthDeck[truthIndex];
  }
  function paint() {
    const index = bag === "dare" ? dareIndex : truthIndex;
    const total = bag === "dare" ? dareDeck.length : truthDeck.length;
    const name = bag === "dare" ? "Dare" : "Truth";
    kindEl.textContent = name + " · " + (index + 1) + " of " + total + (turned ? " · the deck turned over" : "");
    prompt.textContent = current();
    turned = false;
  }
  function advance() {
    if (bag === "dare") {
      dareIndex += 1;
      if (dareIndex >= dareDeck.length) {
        dareLap += 1;
        dareIndex = 0;
        dareDeck = shuffleWith(dares, code + ":d:" + dareLap);
        turned = true;
      }
    } else {
      truthIndex += 1;
      if (truthIndex >= truthDeck.length) {
        truthLap += 1;
        truthIndex = 0;
        truthDeck = shuffleWith(truths, code + ":t:" + truthLap);
        turned = true;
      }
    }
  }
  function open() {
    gate.hidden = true;
    play.hidden = false;
    choose.hidden = false;
    card.hidden = true;
  }
  function copyLink() {
    const link = location.origin + location.pathname + "#further-" + code;
    const write = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(link)
      : Promise.reject();
    return write.catch(function () { window.prompt("Copy this link", link); });
  }

  document.getElementById("further-yes").addEventListener("click", function () {
    allow();
    open();
  });
  document.getElementById("further-no").addEventListener("click", function () {
    document.getElementById("back").click();
  });
  document.getElementById("further-copy").addEventListener("click", function () {
    const button = document.getElementById("further-copy");
    copyLink().then(function () { button.textContent = "Copied"; });
  });
  document.getElementById("further-join").addEventListener("change", function () {
    const input = document.getElementById("further-join");
    const next = clean(input.value);
    if (next.length < 4) return;
    deal(next);
    input.value = "";
    choose.hidden = false;
    card.hidden = true;
  });
  function show(nextBag) {
    bag = nextBag;
    choose.hidden = true;
    card.hidden = false;
    paint();
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }
  document.getElementById("further-truth").addEventListener("click", function () { show("truth"); });
  document.getElementById("further-dare").addEventListener("click", function () { show("dare"); });
  document.getElementById("further-skip").addEventListener("click", function () {
    window.Curtain.show({
      title: "Skipped.",
      note: "Hand the phone over.",
      done: function () {
        choose.hidden = false;
        card.hidden = true;
      }
    });
  });
  document.getElementById("further-another").addEventListener("click", function () {
    advance();
    paint();
  });
  document.getElementById("further-done").addEventListener("click", function () {
    advance();
    window.Curtain.show({
      title: "Their turn.",
      note: "Hand the phone over. They choose truth or dare.",
      done: function () {
        choose.hidden = false;
        card.hidden = true;
      }
    });
  });
  function stop() { document.getElementById("back").click(); }
  document.getElementById("further-stop").addEventListener("click", stop);
  document.getElementById("further-end").addEventListener("click", stop);
  if (allowed()) open();
})();
