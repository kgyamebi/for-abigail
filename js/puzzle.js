(function () {
  const BOOK = [
    "acorn", "almond", "amber", "anchor", "apple", "apricot", "arrow", "atlas",
    "bamboo", "banjo", "barley", "basil", "beacon", "birch", "bison", "blanket", "bloom", "blossom", "boulder", "bread", "breeze", "bridge", "bronze", "brook",
    "cabin", "candle", "canyon", "canvas", "carbon", "castle", "cedar", "cellar", "charm", "cherry", "cinnamon", "citrus", "cloud", "clover", "cobalt", "comet", "copper", "coral", "cotton", "cradle", "crane", "cricket", "crystal",
    "daisy", "dance", "delta", "desert", "diamond", "dolphin", "dragon", "drift", "dusk",
    "echo", "elbow", "ember",
    "fairy", "falcon", "feather", "fennel", "ferry", "fiddle", "flame", "flint", "forest", "fossil", "fountain", "frost",
    "galaxy", "garden", "garlic", "gazelle", "ginger", "glacier", "glass", "gleam", "golden", "grain", "granite", "grape", "gravel", "grove", "guitar",
    "harbor", "hazel", "heron", "hollow", "honey", "horizon", "hyacinth",
    "indigo", "island", "ivory",
    "jacket", "jasmine", "jewel", "jigsaw", "jolt", "jungle",
    "kayak", "kettle", "kingdom", "kitten", "knoll",
    "ladder", "lagoon", "lantern", "lemon", "lilac", "linen", "lizard", "lotus", "lunar",
    "magnet", "maple", "marble", "marsh", "meadow", "melon", "meteor", "mirror", "moon", "mosaic", "moss", "muffin",
    "nectar", "night", "north", "nutmeg",
    "ocean", "olive", "opal", "orange", "orchid", "oyster",
    "paddle", "palace", "panda", "papaya", "parrot", "pearl", "pebble", "pepper", "petal", "piano", "pillow", "pirate", "planet", "plaza", "plum", "pocket", "pollen", "poppy", "prairie", "pumpkin", "python",
    "quartz", "queen", "quiet", "quill",
    "rabbit", "raisin", "raven", "ribbon", "river", "robin", "rocket",
    "sable", "saffron", "salmon", "sandal", "sapphire", "scarlet", "shade", "shadow", "silk", "silver", "skillet", "smoke", "sparrow", "spice", "spiral", "sprout", "statue", "stone", "storm", "sugar", "summer", "sunset", "swallow",
    "tangerine", "temple", "thistle", "thunder", "thyme", "tiger", "timber", "topaz", "tornado", "tower", "treasure", "trumpet", "tulip", "tunnel", "turtle",
    "umbrella",
    "valley", "vanilla", "velvet", "vessel", "violet", "vivid", "volcano", "voyage",
    "walnut", "wander", "waterfall", "wheat", "whisper", "willow", "window", "winter", "wisteria", "wizard",
    "xenon",
    "yacht", "yellow", "yogurt",
    "zebra", "zenith", "zest"
  ];
  ["quest", "quilt", "quake", "quiver", "xylem", "yarn", "yearn", "yeast", "yield", "young", "yonder", "zinc", "zipper", "zodiac", "zonal", "unique", "upper", "urban", "utter", "useful", "umbra", "union", "usher", "velvet", "cinder", "cobalt", "dune", "ember", "fjord", "glen", "harp", "inlet", "jasper", "kelp", "lark", "mirth", "nectar", "onyx", "plume", "quartz", "reed", "sable", "thorn", "vapor", "wren"].forEach(function (word) {
    if (BOOK.indexOf(word) === -1) BOOK.push(word);
  });
  const known = {};
  BOOK.forEach(function (word) { known[word] = true; });

  function blip() {
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }
  function lettersOnly(value) {
    return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  }
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
  function readBest(key) {
    try { return Number(window.localStorage.getItem(key)) || 0; } catch (err) { return 0; }
  }
  function writeBest(key, value) {
    try {
      const previous = readBest(key);
      if (value > previous) window.localStorage.setItem(key, String(value));
    } catch (err) { /* this phone may block storage */ }
  }
  function setMode(buttons, name) {
    Object.keys(buttons).forEach(function (key) {
      const on = key === name;
      buttons[key].classList.toggle("is-on", on);
      buttons[key].setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  const scrambleFace = document.getElementById("scramble-face");
  const scrambleForm = document.getElementById("scramble-form");
  const scrambleAnswer = document.getElementById("scramble-answer");
  const scrambleTurn = document.getElementById("scramble-turn");
  const scrambleScore = document.getElementById("scramble-score");
  const scrambleBest = document.getElementById("scramble-best");
  if (scrambleFace && scrambleForm) {
    let scrambleMode = "alone";
    let scrambleWord = "";
    let scrambleStreak = 0;
    let scrambleYou = 0;
    let scrambleThem = 0;
    let scrambleYours = true;
    let scrambleLast = "";
    const scrambleLeft = { short: [], mid: [], long: [] };

    function bandKey() {
      const n = scrambleMode === "alone" ? scrambleStreak : Math.max(scrambleYou, scrambleThem);
      if (n < 5) return "short";
      if (n < 12) return "mid";
      return "long";
    }
    function scrambleBag() {
      const n = scrambleMode === "alone" ? scrambleStreak : Math.max(scrambleYou, scrambleThem);
      return BOOK.filter(function (word) {
        if (n < 5) return word.length <= 5;
        if (n < 12) return word.length >= 5 && word.length <= 7;
        return word.length >= 7;
      });
    }
    function dealScramble() {
      const key = bandKey();
      if (!scrambleLeft[key].length) scrambleLeft[key] = shuffle(scrambleBag().length ? scrambleBag() : BOOK);
      let word = scrambleLeft[key].pop();
      if (word === scrambleLast && scrambleLeft[key].length) {
        scrambleLeft[key].unshift(word);
        word = scrambleLeft[key].pop();
      }
      scrambleLast = word;
      scrambleWord = word;
      let mixed = shuffle(word.split(""));
      if (mixed.join("") === word) mixed.push(mixed.shift());
      scrambleFace.textContent = mixed.join(" ");
      scrambleAnswer.value = "";
      paintScramble();
    }
    function paintScramble() {
      if (scrambleMode === "alone") {
        scrambleScore.textContent = scrambleStreak + (scrambleStreak === 1 ? " in a row" : " in a row");
        const best = readBest("abigail-scramble-best");
        scrambleBest.textContent = best ? " · best " + best : "";
        scrambleTurn.textContent = "Unscramble it.";
      } else {
        scrambleScore.textContent = scrambleYou + " you · " + scrambleThem + " them";
        scrambleBest.textContent = "";
        scrambleTurn.textContent = scrambleYours ? "Your word." : "Their word. This phone stays here.";
      }
    }
    function scrambleModeTo(next) {
      scrambleMode = next;
      setMode({ alone: document.getElementById("scramble-alone"), turns: document.getElementById("scramble-turns") }, next);
      scrambleStreak = 0;
      scrambleYou = 0;
      scrambleThem = 0;
      scrambleYours = true;
      dealScramble();
    }
    document.getElementById("scramble-alone").addEventListener("click", function () { scrambleModeTo("alone"); });
    document.getElementById("scramble-turns").addEventListener("click", function () { scrambleModeTo("turns"); });
    scrambleForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const guess = lettersOnly(scrambleAnswer.value);
      if (!guess) return;
      if (guess === scrambleWord) {
        blip();
        if (scrambleMode === "alone") {
          scrambleStreak += 1;
          writeBest("abigail-scramble-best", scrambleStreak);
        } else if (scrambleYours) scrambleYou += 1;
        else scrambleThem += 1;
        if (scrambleMode === "turns") scrambleYours = !scrambleYours;
        dealScramble();
        return;
      }
      scrambleTurn.textContent = "Not that.";
      scrambleAnswer.select();
    });
    document.getElementById("scramble-show").addEventListener("click", function () {
      scrambleTurn.textContent = "It was " + scrambleWord + ".";
      if (scrambleMode === "alone") scrambleStreak = 0;
      if (scrambleMode === "turns") scrambleYours = !scrambleYours;
      window.setTimeout(dealScramble, 700);
    });
    scrambleModeTo("alone");
  }

  const chainLetter = document.getElementById("chain-letter");
  const chainForm = document.getElementById("chain-form");
  const chainAnswer = document.getElementById("chain-answer");
  const chainTurn = document.getElementById("chain-turn");
  const chainScore = document.getElementById("chain-score");
  if (chainLetter && chainForm) {
    let chainMode = "house";
    let chainNeed = "";
    let chainUsed = {};
    let chainLength = 0;
    let chainYou = 0;
    let chainThem = 0;
    let chainYours = true;
    let chainGen = 0;

    function wordsFor(letter) {
      return BOOK.filter(function (word) {
        return !chainUsed[word] && (!letter || word.charAt(0) === letter);
      });
    }
    function paintChain() {
      chainLetter.textContent = chainNeed ? chainNeed.toUpperCase() : "Any";
      chainScore.textContent = chainLength + (chainLength === 1 ? " word" : " words") + " · " + chainYou + "–" + chainThem;
      if (!chainNeed) chainTurn.textContent = chainMode === "turns" && !chainYours ? "Their word. Any word in the book." : "Any word in the book.";
      else if (chainMode === "house") chainTurn.textContent = "Your word. It starts with " + chainNeed.toUpperCase() + ".";
      else chainTurn.textContent = (chainYours ? "Your word. " : "Their word. ") + "It starts with " + chainNeed.toUpperCase() + ".";
    }
    function freshChain(point) {
      if (point === "you") chainYou += 1;
      if (point === "them") chainThem += 1;
      chainNeed = "";
      chainUsed = {};
      chainLength = 0;
      chainAnswer.value = "";
      paintChain();
    }
    function acceptChain(word, byHouse) {
      chainUsed[word] = true;
      chainLength += 1;
      chainNeed = word.charAt(word.length - 1);
      chainAnswer.value = "";
      blip();
      if (chainMode === "turns" && !byHouse) chainYours = !chainYours;
      const note = (byHouse ? "The house plays " + word + "." : word + ".") + " Next starts with " + chainNeed.toUpperCase() + ".";
      if (!wordsFor(chainNeed).length) {
        const who = chainMode === "turns" ? (chainYours ? "them" : "you") : "you";
        paintChain();
        chainTurn.textContent = "Nothing in the book starts with " + chainNeed.toUpperCase() + ".";
        window.setTimeout(function () { freshChain(who); }, 900);
        return;
      }
      paintChain();
      chainTurn.textContent = note;
      if (!byHouse && chainMode === "house") houseChain();
    }
    function houseChain() {
      const token = ++chainGen;
      window.setTimeout(function () {
        if (token !== chainGen || chainMode !== "house") return;
        const bag = wordsFor(chainNeed);
        if (!bag.length) {
          freshChain("you");
          chainTurn.textContent = "The house is stuck. A new chain.";
          return;
        }
        acceptChain(bag[Math.floor(Math.random() * bag.length)], true);
      }, 420);
    }
    function chainModeTo(next) {
      chainMode = next;
      chainGen += 1;
      setMode({ house: document.getElementById("chain-house"), turns: document.getElementById("chain-turns") }, next);
      chainYou = 0;
      chainThem = 0;
      chainYours = true;
      freshChain("");
    }
    document.getElementById("chain-house").addEventListener("click", function () { chainModeTo("house"); });
    document.getElementById("chain-turns").addEventListener("click", function () { chainModeTo("turns"); });
    chainForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const word = lettersOnly(chainAnswer.value);
      if (word.length < 3) {
        chainTurn.textContent = "Three letters, at least.";
        return;
      }
      if (!known[word]) {
        chainTurn.textContent = "Not in this book.";
        return;
      }
      if (chainUsed[word]) {
        chainTurn.textContent = "Already played.";
        return;
      }
      if (chainNeed && word.charAt(0) !== chainNeed) {
        chainTurn.textContent = "It has to start with " + chainNeed.toUpperCase() + ".";
        return;
      }
      acceptChain(word, false);
    });
    document.getElementById("chain-stuck").addEventListener("click", function () {
      chainGen += 1;
      freshChain(chainMode === "turns" && !chainYours ? "you" : "them");
      if (chainMode === "turns") chainYours = !chainYours;
      paintChain();
      chainTurn.textContent = "A new chain.";
    });
    chainModeTo("house");
  }

  const runFace = document.getElementById("run-face");
  const runForm = document.getElementById("run-form");
  const runAnswer = document.getElementById("run-answer");
  const runTurn = document.getElementById("run-turn");
  const runScore = document.getElementById("run-score");
  const runBest = document.getElementById("run-best");
  if (runFace && runForm) {
    let runMode = "alone";
    let runStreak = 0;
    let runYou = 0;
    let runThem = 0;
    let runYours = true;
    let runValue = 0;

    function nextProblem() {
      const level = runMode === "alone" ? runStreak : (runYours ? runYou : runThem);
      const span = Math.min(12, 4 + Math.floor(level / 2));
      const a = 2 + Math.floor(Math.random() * span);
      const b = 2 + Math.floor(Math.random() * span);
      if (level < 4) {
        runFace.textContent = a + " + " + b;
        runValue = a + b;
      } else if (level < 10) {
        runFace.textContent = a + " × " + b;
        runValue = a * b;
      } else {
        const c = 1 + Math.floor(Math.random() * 9);
        runFace.textContent = a + " × " + b + " + " + c;
        runValue = a * b + c;
      }
      runAnswer.value = "";
      paintRun();
    }
    function paintRun() {
      if (runMode === "alone") {
        runScore.textContent = runStreak + " in a row";
        const best = readBest("abigail-run-best");
        runBest.textContent = best ? " · best " + best : "";
        runTurn.textContent = "The next one.";
      } else {
        runScore.textContent = runYou + " you · " + runThem + " them";
        runBest.textContent = "";
        runTurn.textContent = runYours ? "Your number." : "Their number.";
      }
    }
    function runModeTo(next) {
      runMode = next;
      setMode({ alone: document.getElementById("run-alone"), turns: document.getElementById("run-turns") }, next);
      runStreak = 0;
      runYou = 0;
      runThem = 0;
      runYours = true;
      nextProblem();
    }
    document.getElementById("run-alone").addEventListener("click", function () { runModeTo("alone"); });
    document.getElementById("run-turns").addEventListener("click", function () { runModeTo("turns"); });
    runForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (runAnswer.value === "") return;
      const guess = Number(runAnswer.value);
      if (guess === runValue) {
        blip();
        if (runMode === "alone") {
          runStreak += 1;
          writeBest("abigail-run-best", runStreak);
        } else if (runYours) runYou += 1;
        else runThem += 1;
      } else {
        runTurn.textContent = "It was " + runValue + ".";
        if (runMode === "alone") runStreak = 0;
        runAnswer.value = "";
        if (runMode === "turns") runYours = !runYours;
        window.setTimeout(nextProblem, 650);
        return;
      }
      if (runMode === "turns") runYours = !runYours;
      nextProblem();
    });
    runModeTo("alone");
  }

  const makeNums = document.getElementById("make-nums");
  const makeTarget = document.getElementById("make-target");
  const makeForm = document.getElementById("make-form");
  const makeAnswer = document.getElementById("make-answer");
  const makeTurn = document.getElementById("make-turn");
  const makeScore = document.getElementById("make-score");
  if (makeNums && makeForm) {
    let makeMode = "alone";
    let makeNumbers = [];
    let makeGoal = 0;
    let makeSolved = 0;
    let makeYou = 0;
    let makeThem = 0;
    let makeYours = true;

    function combine(list) {
      if (list.length === 1) return list[0];
      const i = Math.floor(Math.random() * (list.length - 1));
      const a = list[i];
      const b = list[i + 1];
      const op = Math.floor(Math.random() * 4);
      let value = null;
      if (op === 0) value = a + b;
      else if (op === 1 && a !== b) value = Math.abs(a - b);
      else if (op === 2) value = a * b;
      else if (b !== 0 && a % b === 0) value = a / b;
      else if (a !== 0 && b % a === 0) value = b / a;
      if (value === null || value <= 0 || value > 480 || value % 1 !== 0) return null;
      const next = list.slice();
      next.splice(i, 2, value);
      return combine(next);
    }
    function dealMake() {
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (let attempt = 0; attempt < 50; attempt++) {
        const nums = [];
        const bag = pool.slice();
        for (let i = 0; i < 4; i++) nums.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]);
        const target = combine(nums.slice());
        if (target && target > 10) {
          makeNumbers = nums;
          makeGoal = target;
          makeNums.textContent = nums.join("   ");
          makeTarget.textContent = String(target);
          makeAnswer.value = "";
          paintMake();
          return;
        }
      }
      makeNumbers = [2, 3, 4, 6];
      makeGoal = 24;
      makeNums.textContent = "2   3   4   6";
      makeTarget.textContent = "24";
      makeAnswer.value = "";
      paintMake();
    }
    function paintMake() {
      if (makeMode === "alone") {
        makeScore.textContent = makeSolved + " made";
        makeTurn.textContent = "Use each number once.";
      } else {
        makeScore.textContent = makeYou + " you · " + makeThem + " them";
        makeTurn.textContent = makeYours ? "Your try." : "Their try.";
      }
    }
    function evaluate(raw) {
      const source = String(raw || "").toLowerCase().replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/x/g, "*").replace(/\s+/g, "");
      const used = [];
      let i = 0;
      function peek() { return source.charAt(i); }
      function factor() {
        if (peek() === "(") {
          i += 1;
          const inner = expr();
          if (inner === null || peek() !== ")") return null;
          i += 1;
          return inner;
        }
        let token = "";
        while (peek() >= "0" && peek() <= "9") {
          token += peek();
          i += 1;
        }
        if (!token) return null;
        const value = Number(token);
        let found = -1;
        for (let n = 0; n < makeNumbers.length; n++) {
          if (makeNumbers[n] === value && used.indexOf(n) === -1) {
            found = n;
            break;
          }
        }
        if (found === -1) return null;
        used.push(found);
        return value;
      }
      function term() {
        let value = factor();
        if (value === null) return null;
        while (peek() === "*" || peek() === "/") {
          const op = peek();
          i += 1;
          const right = factor();
          if (right === null || (op === "/" && right === 0)) return null;
          value = op === "*" ? value * right : value / right;
        }
        return value;
      }
      function expr() {
        let value = term();
        if (value === null) return null;
        while (peek() === "+" || peek() === "-") {
          const op = peek();
          i += 1;
          const right = term();
          if (right === null) return null;
          value = op === "+" ? value + right : value - right;
        }
        return value;
      }
      const value = expr();
      if (value === null || i !== source.length || used.length !== makeNumbers.length) return null;
      return value;
    }
    function makeModeTo(next) {
      makeMode = next;
      setMode({ alone: document.getElementById("make-alone"), turns: document.getElementById("make-turns") }, next);
      makeSolved = 0;
      makeYou = 0;
      makeThem = 0;
      makeYours = true;
      document.getElementById("make-pass").hidden = next !== "turns";
      dealMake();
    }
    document.getElementById("make-alone").addEventListener("click", function () { makeModeTo("alone"); });
    document.getElementById("make-turns").addEventListener("click", function () { makeModeTo("turns"); });
    makeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = evaluate(makeAnswer.value);
      if (value === null) {
        makeTurn.textContent = "Use each of these numbers once. + − × ÷ and brackets.";
        return;
      }
      if (Math.abs(value - makeGoal) > 1e-6) {
        makeTurn.textContent = "That makes " + value + ", not " + makeGoal + ".";
        return;
      }
      blip();
      if (makeMode === "alone") makeSolved += 1;
      else if (makeYours) makeYou += 1;
      else makeThem += 1;
      if (makeMode === "turns") makeYours = !makeYours;
      dealMake();
    });
    document.getElementById("make-pass").addEventListener("click", function () {
      if (makeMode !== "turns") {
        dealMake();
        return;
      }
      makeYours = !makeYours;
      paintMake();
      makeAnswer.focus();
    });
    makeModeTo("alone");
  }
})();
