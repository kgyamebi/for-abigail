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
  const pool = [
    "Kiss them once, then wait until they kiss you back.",
    "Put your hand where they tell you, over clothes, and leave it.",
    "Hold their eyes while they count to twenty.",
    "They choose one thing you take off. You choose whether it happens.",
    "Whisper the place you want their mouth. They decide if they go there.",
    "Sit in their lap. Neither of you moves for ten breaths.",
    "Trace their collarbone with one finger. Stop when they say.",
    "Say what you want in one sentence. Then do only the first half.",
    "Let them undo one button. Only one.",
    "Stand behind them, close enough to feel them, and don’t touch.",
    "Ask for a kiss that lasts three seconds. No longer.",
    "They put your hands on their waist. You don’t move them.",
    "Tell them to come closer, then tell them to stop.",
    "Kiss their neck and stop before it becomes more.",
    "Trade one secret you’ve never said out loud. Then kiss them.",
    "Slow dance with no music. Stay dressed until someone laughs.",
    "They pick the next place you kiss. You can say no.",
    "Lie down. They may touch you over clothes until you say enough.",
    "Hold their face in both hands. Don’t kiss until they nod.",
    "Take their hand and put it where you want it. They can move it away.",
    "Describe what you want to do to them. Then wait for a yes.",
    "One minute of kissing. Hands stay where they started.",
    "They say a number. You kiss them that many times, then stop.",
    "Sit between their knees. Look up. Wait.",
    "Let them cover your eyes. They kiss you once, wherever they choose.",
    "Say their name against their mouth. Don’t kiss yet.",
    "Undo something of yours. They watch. You stop after one.",
    "Ask them to stay still while you kiss them. Two taps ends it.",
    "Whoever finishes the drink chooses the next kiss.",
    "Put your mouth by their ear and tell them the dare you were saving.",
    "They lead for thirty seconds. You only follow.",
    "Kneel or sit, your choice. They decide the kiss.",
    "Keep one hand on them, over clothes, while you talk about something ordinary.",
    "Tell them to take one thing off, or to put one thing back on. Their choice.",
    "Lie facing them. Close the distance only when both of you lean in.",
    "They write a place on your skin with a fingertip. You may kiss it.",
    "Hold them from behind. No hands under clothes. Stay until one of you laughs.",
    "Say stop and mean it, then say go and mean that too.",
    "Look at them while you take your time with one kiss.",
    "They choose: your mouth, or your hands, for one minute.",
    "Whisper a yes or no. They answer with a kiss or with a shake of the head.",
    "Stand in a doorway together. Nobody leaves until someone is kissed.",
    "Let them set the pace. If you want faster, you ask.",
    "One piece of clothing, moved, not removed. They pick it.",
    "Tell them the last thing you want tonight. Do it only if they want it too.",
    "Kiss the inside of their wrist. Ask if you may go further.",
    "Sit so your foreheads touch. Eyes closed. Count the same ten.",
    "They get one instruction from you. They can change one word of it.",
    "Breathe on their neck and keep your hands to yourself.",
    "Choose a song’s length of not touching. Then one kiss, and stop.",
    "Let them move your hair and kiss whatever they uncover.",
    "Say where you are shy. They may go there only if you repeat the yes.",
    "Trade places: they tell you what to do, for one minute, and you can refuse one thing.",
    "A kiss on the shoulder, then the jaw, then they decide if there is a third."
  ];
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
  function takeSet(items) {
    const room = 20 - items.length;
    if (room <= 0) return [];
    const count = Math.min(room, 4 + Math.floor(Math.random() * 3));
    const have = {};
    items.forEach(function (line) { have[line] = true; });
    let fresh = shuffle(pool.filter(function (line) { return !have[line]; }));
    if (fresh.length < count) fresh = shuffle(pool.filter(function (line) { return !have[line]; }));
    return fresh.slice(0, count);
  }

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
    const paint = mountList(input, document.getElementById(prefix + "-add"), list, items);
    const surprise = document.getElementById(prefix + "-surprise");
    if (surprise) {
      surprise.addEventListener("click", function () {
        takeSet(items).forEach(function (line) { items.push(line); });
        paint();
        blip();
      });
    }

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

  const betweenSteps = [
    "Sit with a hand’s width between you. Don’t close it yet.",
    "Look at them until the quiet gets heavy. Don’t fill it.",
    "Move one inch closer. Then stop.",
    "Tell them what that inch cost. One sentence.",
    "They decide the next inch. You don’t take it yourself.",
    "Breathe on the same count. Four in, four out. Still not touching.",
    "Put your mouth near their ear. Say nothing.",
    "They may close the distance. You stay until they do, or until they don’t.",
    "Ask whether to keep the gap, or end it. Accept the answer.",
    "The last inch is theirs. They take it, or they leave it."
  ];
  mountLadder("closer", closerSteps);
  mountLadder("still", stillSteps);
  mountLadder("between", betweenSteps);

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
    const paintYours = mountList(yoursInput, document.getElementById("yours-add"), yoursList, items);
    document.getElementById("yours-surprise").addEventListener("click", function () {
      takeSet(items).forEach(function (line) { items.push(line); });
      paintYours();
      blip();
    });

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

  const tradeGate = document.getElementById("trade-gate");
  const tradeSetup = document.getElementById("trade-setup");
  const tradePlay = document.getElementById("trade-play");
  if (tradeGate && tradeSetup && tradePlay) {
    const tradeInput = document.getElementById("trade-input");
    const tradeList = document.getElementById("trade-list");
    const tradePrompt = document.getElementById("trade-prompt");
    const tradeRound = document.getElementById("trade-round");
    const items = [];
    let deck = [];
    let index = 0;
    const paintTrade = mountList(tradeInput, document.getElementById("trade-add"), tradeList, items);
    document.getElementById("trade-surprise").addEventListener("click", function () {
      takeSet(items).forEach(function (line) { items.push(line); });
      paintTrade();
      blip();
    });
    function showCard() {
      tradeRound.textContent = (index + 1) + " of " + deck.length;
      tradePrompt.textContent = deck[index];
    }
    function begin() {
      deck = items.length ? items.slice() : starters.slice();
      index = 0;
      tradeSetup.hidden = true;
      tradePlay.hidden = false;
      showCard();
    }
    function open() {
      tradeGate.hidden = true;
      tradeSetup.hidden = false;
      tradePlay.hidden = true;
    }
    document.getElementById("trade-yes").addEventListener("click", function () { allow(); open(); });
    document.getElementById("trade-no").addEventListener("click", function () { document.getElementById("back").click(); });
    document.getElementById("trade-begin").addEventListener("click", begin);
    document.getElementById("trade-next").addEventListener("click", function () {
      if (index >= deck.length) {
        begin();
        return;
      }
      blip();
      index += 1;
      if (index >= deck.length) {
        tradePrompt.textContent = "That’s the trade.";
        tradeRound.textContent = "Again, or stop.";
        return;
      }
      window.Curtain.show({
        title: "Their turn.",
        note: "Pass this phone. This one was written for them.",
        done: showCard
      });
    });
    document.getElementById("trade-skip").addEventListener("click", function () {
      index += 1;
      if (index >= deck.length) index = 0;
      showCard();
    });
    document.getElementById("trade-stop").addEventListener("click", function () { document.getElementById("back").click(); });
    if (allowed()) open();
  }

  const wheelGate = document.getElementById("wheel-gate");
  const wheelPlay = document.getElementById("wheel-play");
  const wheelEl = document.getElementById("wheel");
  if (wheelGate && wheelPlay && wheelEl) {
    const wheelRound = document.getElementById("wheel-round");
    const wheelPrompt = document.getElementById("wheel-prompt");
    const wheelSpin = document.getElementById("wheel-spin");
    const wheelHand = document.getElementById("wheel-hand");
    const reducedSpin = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rotation = 0;
    let spinning = false;
    let last = [];
    let forThem = false;
    let landed = "";
    let seam = 0;

    function paintWheel() {
      const parts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 360;
        const b = ((i + 1) / 8) * 360;
        const fill = i % 2 ? "#241c14" : "#14110e";
        parts.push("#c6a06a " + a.toFixed(2) + "deg " + (a + 1.15).toFixed(2) + "deg");
        parts.push(fill + " " + (a + 1.15).toFixed(2) + "deg " + b.toFixed(2) + "deg");
      }
      wheelEl.style.background = "conic-gradient(from " + seam.toFixed(2) + "deg, " + parts.join(",") + ")";
    }
    function dealWheel() {
      const have = {};
      last.forEach(function (line) { have[line] = true; });
      let fresh = shuffle(pool.filter(function (line) { return !have[line]; }));
      if (fresh.length < 8) fresh = shuffle(pool);
      const eight = fresh.slice(0, 8);
      last = eight.slice();
      return eight;
    }
    function showLanded() {
      if (!spinning) return;
      spinning = false;
      wheelSpin.disabled = false;
      wheelRound.textContent = forThem ? "For them." : "For you.";
      wheelPrompt.textContent = landed;
      wheelHand.hidden = false;
      forThem = !forThem;
      blip();
    }
    function spin() {
      if (spinning) return;
      const eight = dealWheel();
      seam = Math.random() * 360;
      paintWheel();
      const index = Math.floor(Math.random() * eight.length);
      landed = eight[index];
      const center = (seam + ((index + 0.5) / 8) * 360) % 360;
      const current = ((rotation % 360) + 360) % 360;
      let delta = (360 - center) - current;
      if (delta < 0) delta += 360;
      rotation += (5 + Math.floor(Math.random() * 3)) * 360 + delta;
      spinning = true;
      wheelSpin.disabled = true;
      wheelHand.hidden = true;
      wheelRound.textContent = "";
      wheelPrompt.textContent = "";
      if (reducedSpin) {
        wheelEl.style.transition = "none";
        wheelEl.style.transform = "rotate(" + rotation + "deg)";
        showLanded();
        return;
      }
      wheelEl.style.transition = "transform 4.4s cubic-bezier(0.12, 0.7, 0.08, 1)";
      const wait = window.setTimeout(showLanded, 4700);
      function done(event) {
        if (event.propertyName !== "transform") return;
        wheelEl.removeEventListener("transitionend", done);
        window.clearTimeout(wait);
        showLanded();
      }
      wheelEl.addEventListener("transitionend", done);
      wheelEl.style.transform = "rotate(" + rotation + "deg)";
    }
    function open() {
      wheelGate.hidden = true;
      wheelPlay.hidden = false;
      paintWheel();
    }
    document.getElementById("wheel-yes").addEventListener("click", function () {
      allow();
      open();
    });
    document.getElementById("wheel-no").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    wheelSpin.addEventListener("click", spin);
    document.getElementById("wheel-skip").addEventListener("click", function () {
      wheelPrompt.textContent = "";
      wheelRound.textContent = "Skipped.";
      wheelHand.hidden = true;
    });
    document.getElementById("wheel-stop").addEventListener("click", function () {
      document.getElementById("back").click();
    });
    wheelHand.addEventListener("click", function () {
      if (!landed) return;
      window.Curtain.show({
        title: "Their turn.",
        note: "Pass this phone. The wheel already chose.",
        done: function () {
          wheelPrompt.textContent = landed;
        }
      });
    });
    if (allowed()) open();
  }
})();
