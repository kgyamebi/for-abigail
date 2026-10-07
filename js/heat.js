(function () {
  const key = "abigail-adult";
  function allowed() {
    try { return window.sessionStorage.getItem(key) === "1"; } catch (err) { return false; }
  }
  function allow() {
    try { window.sessionStorage.setItem(key, "1"); } catch (err) { /* this visit still opens */ }
  }
  function blip() {
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }
  function cleanLine(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 180);
  }

  const closerSteps = [
    "Sit so your knees touch. Neither of you speaks.",
    "Look at their mouth until one of you smiles. Don’t explain it.",
    "Put your hand on their knee. Leave it there for five breaths.",
    "Tell them one thing you notice. One sentence. Then stop talking.",
    "Come close enough that they feel your breath. Do not kiss yet.",
    "Let them place your hand, over clothes. Keep it where they put it.",
    "Kiss them once. Stop before you want the second.",
    "Whisper what you have been thinking. They don’t answer yet.",
    "They undo one thing. Only one. Then they stop.",
    "Stay still while they kiss your neck. End it by saying their name.",
    "Say how much closer you want them. No joke. One sentence.",
    "They choose: another kiss, or twenty breaths of not touching.",
    "If you both want to, one thing comes off. The person wearing it decides.",
    "Ask them what the next step is. Do only that. Then look at them and wait."
  ];
  const stillSteps = [
    "Look at them until someone blinks. The phone stays where you can both see it.",
    "Hands still. They may touch you, over clothes. You don’t move.",
    "They draw one slow line on you. You stay quiet.",
    "Hold their eyes while they say what they want. Don’t answer.",
    "They move your hands. You leave them there.",
    "They kiss you. You don’t kiss back until they say your name.",
    "Close enough to feel the warmth. No contact. Twenty breaths.",
    "They choose where your mouth goes. Stop the moment they tap you twice.",
    "Say closer, or say enough. Then do only what that word allows.",
    "If it was closer, they lead for three breaths. Then you ask again."
  ];
  const starters = [
    "Kiss them once, then wait.",
    "Tell them where you want their hands.",
    "Sit close enough to share a breath, and don’t kiss yet.",
    "Take one thing off. You choose whose.",
    "Whisper a dare you almost didn’t say.",
    "Hold them until one of you laughs."
  ];

  function weave(base, extra) {
    const deck = base.map(function (text) { return { text: text, own: false }; });
    extra.forEach(function (text, n) {
      const at = Math.min(deck.length, 4 + n * 2);
      deck.splice(at, 0, { text: text, own: true });
    });
    return deck;
  }

  function mountList(input, addBtn, list, items) {
    function paint() {
      list.innerHTML = "";
      items.forEach(function (text, index) {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = text;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "text";
        remove.textContent = "Remove";
        remove.addEventListener("click", function () {
          items.splice(index, 1);
          paint();
        });
        li.appendChild(span);
        li.appendChild(remove);
        list.appendChild(li);
      });
    }
    function add() {
      const text = cleanLine(input.value);
      if (!text || items.length >= 20) return;
      items.push(text);
      input.value = "";
      paint();
      input.focus();
    }
    addBtn.addEventListener("click", add);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        add();
      }
    });
    return paint;
  }

  function mountLadder(prefix, steps) {
    const gate = document.getElementById(prefix + "-gate");
    const setup = document.getElementById(prefix + "-setup");
    const play = document.getElementById(prefix + "-play");
    if (!gate || !setup || !play) return;
    const input = document.getElementById(prefix + "-input");
    const list = document.getElementById(prefix + "-list");
    const prompt = document.getElementById(prefix + "-prompt");
    const round = document.getElementById(prefix + "-round");
    const items = [];
    let deck = [];
    let index = 0;
    mountList(input, document.getElementById(prefix + "-add"), list, items);

    function showCard() {
      const card = deck[index];
      round.textContent = card.own ? "Yours · " + (index + 1) : "Step " + (index + 1);
      prompt.textContent = card.text;
    }
    function begin() {
      deck = weave(steps, items);
      index = 0;
      setup.hidden = true;
      play.hidden = false;
      showCard();
    }
    function open() {
      gate.hidden = true;
      setup.hidden = false;
      play.hidden = true;
    }
    function hand(title, note, after) {
      window.Curtain.show({
        title: title,
        note: note,
        done: after
      });
    }
    function advance(escalate) {
      if (index >= deck.length) {
        begin();
        return;
      }
      if (escalate) index += 1;
      if (index >= deck.length) {
        prompt.textContent = "That’s the end of this round.";
        round.textContent = "Again, or stop.";
        return;
      }
      blip();
      hand("Their turn.", "Pass this phone.", showCard);
    }
    document.getElementById(prefix + "-yes").addEventListener("click", function () {
      allow();
      open();
    });
    document.getElementById(prefix + "-no").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    document.getElementById(prefix + "-begin").addEventListener("click", begin);
    document.getElementById(prefix + "-next").addEventListener("click", function () {
      if (index >= deck.length) {
        begin();
        return;
      }
      advance(true);
    });
    const stay = document.getElementById(prefix + "-stay");
    if (stay) stay.addEventListener("click", function () { advance(false); });
    document.getElementById(prefix + "-skip").addEventListener("click", function () {
      index += 1;
      if (index >= deck.length) begin();
      else showCard();
    });
    document.getElementById(prefix + "-stop").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    if (allowed()) open();
  }

  mountLadder("closer", closerSteps);
  mountLadder("still", stillSteps);

  const yoursGate = document.getElementById("yours-gate");
  const yoursSetup = document.getElementById("yours-setup");
  const yoursPlay = document.getElementById("yours-play");
  if (yoursGate && yoursSetup && yoursPlay) {
    const yoursInput = document.getElementById("yours-input");
    const yoursList = document.getElementById("yours-list");
    const yoursPrompt = document.getElementById("yours-prompt");
    const yoursRound = document.getElementById("yours-round");
    const mixBtn = document.getElementById("yours-mix");
    const items = [];
    let deck = [];
    let index = 0;
    let mix = false;
    mountList(yoursInput, document.getElementById("yours-add"), yoursList, items);

    function build() {
      const own = items.slice();
      if (mix || !own.length) return (own.length ? own.concat(starters) : starters.slice());
      return own;
    }
    function showCard() {
      yoursRound.textContent = (index + 1) + " of " + deck.length;
      yoursPrompt.textContent = deck[index];
    }
    function begin() {
      deck = build();
      index = 0;
      yoursSetup.hidden = true;
      yoursPlay.hidden = false;
      showCard();
    }
    function open() {
      yoursGate.hidden = true;
      yoursSetup.hidden = false;
      yoursPlay.hidden = true;
    }
    document.getElementById("yours-yes").addEventListener("click", function () {
      allow();
      open();
    });
    document.getElementById("yours-no").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    mixBtn.addEventListener("click", function () {
      mix = !mix;
      mixBtn.classList.toggle("is-on", mix);
      mixBtn.setAttribute("aria-pressed", mix ? "true" : "false");
    });
    document.getElementById("yours-begin").addEventListener("click", begin);
    document.getElementById("yours-next").addEventListener("click", function () {
      if (index >= deck.length) {
        begin();
        return;
      }
      blip();
      index += 1;
      if (index >= deck.length) {
        yoursPrompt.textContent = "That’s everything you wrote.";
        yoursRound.textContent = "Again, or stop.";
        return;
      }
      window.Curtain.show({
        title: "Their turn.",
        note: "Pass this phone.",
        done: showCard
      });
    });
    document.getElementById("yours-skip").addEventListener("click", function () {
      index += 1;
      if (index >= deck.length) index = 0;
      showCard();
    });
    document.getElementById("yours-stop").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    document.getElementById("yours-again").addEventListener("click", function () {
      if (!deck.length) begin();
      else {
        index = 0;
        showCard();
      }
    });
    if (allowed()) open();
  }
})();
