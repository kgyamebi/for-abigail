(function (root) {
  function other(side) { return side ^ 1; }

  function pitsOf(side) {
    return side === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  }

  function onSide(side, pit) {
    return side === 0 ? pit < 6 : pit >= 6;
  }

  function countSide(board, side) {
    let n = 0;
    const pits = pitsOf(side);
    for (let i = 0; i < pits.length; i++) n += board[pits[i]];
    return n;
  }

  function play(board, scores, side, pit) {
    const b = board.slice();
    const sc = scores.slice();
    const steps = [];
    let seeds = b[pit];
    b[pit] = 0;
    steps.push({ board: b.slice(), pit: pit });
    let i = pit;
    while (seeds > 0) {
      i = (i + 1) % 12;
      if (i === pit) continue;
      b[i] += 1;
      seeds -= 1;
      steps.push({ board: b.slice(), pit: i });
    }
    let captured = 0;
    let slam = false;
    const taken = [];
    if (!onSide(side, i) && (b[i] === 2 || b[i] === 3)) {
      let j = i;
      while (!onSide(side, j) && (b[j] === 2 || b[j] === 3)) {
        taken.push(j);
        j = (j + 11) % 12;
      }
      let takeSum = 0;
      for (let t = 0; t < taken.length; t++) takeSum += b[taken[t]];
      if (countSide(b, other(side)) - takeSum === 0) {
        slam = true;
        taken.length = 0;
      } else {
        for (let t = 0; t < taken.length; t++) {
          captured += b[taken[t]];
          b[taken[t]] = 0;
        }
        sc[side] += captured;
      }
    }
    return { board: b, scores: sc, captured: captured, last: i, slam: slam, steps: steps, taken: taken };
  }

  function legalMoves(board, side) {
    const mustFeed = countSide(board, other(side)) === 0;
    const moves = [];
    const mine = pitsOf(side);
    for (let i = 0; i < mine.length; i++) {
      const pit = mine[i];
      if (!board[pit]) continue;
      if (!mustFeed) {
        moves.push(pit);
        continue;
      }
      const next = play(board, [0, 0], side, pit);
      if (countSide(next.board, other(side)) > 0) moves.push(pit);
    }
    return moves;
  }

  function pocket(board, scores) {
    const b = board.slice();
    const sc = scores.slice();
    for (let p = 0; p < 12; p++) {
      sc[p < 6 ? 0 : 1] += b[p];
      b[p] = 0;
    }
    return { board: b, scores: sc };
  }

  function evaluate(board, scores, side) {
    const mine = scores[side];
    const theirs = scores[other(side)];
    if (mine >= 25) return 900 + mine - theirs;
    if (theirs >= 25) return -900 - theirs + mine;
    return (mine - theirs) * 16 + (countSide(board, side) - countSide(board, other(side)));
  }

  function negamax(board, scores, side, depth, alpha, beta) {
    if (scores[0] >= 25 || scores[1] >= 25) return evaluate(board, scores, side);
    const moves = legalMoves(board, side);
    if (!moves.length) {
      const done = pocket(board, scores);
      return evaluate(done.board, done.scores, side);
    }
    if (depth === 0) return evaluate(board, scores, side);
    const ordered = moves.slice().sort(function (a, b) {
      return play(board, scores, side, b).captured - play(board, scores, side, a).captured;
    });
    let best = -9999;
    for (let i = 0; i < ordered.length; i++) {
      const next = play(board, scores, side, ordered[i]);
      const val = -negamax(next.board, next.scores, other(side), depth - 1, -beta, -alpha);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  function choose(board, scores, side) {
    const moves = legalMoves(board, side);
    if (!moves.length) return -1;
    const seeds = countSide(board, 0) + countSide(board, 1);
    const depth = seeds > 36 ? 4 : seeds > 18 ? 5 : 6;
    let best = -9999;
    let picks = [];
    for (let i = 0; i < moves.length; i++) {
      const next = play(board, scores, side, moves[i]);
      const val = -negamax(next.board, next.scores, other(side), depth - 1, -9999, 9999);
      if (val > best) {
        best = val;
        picks = [moves[i]];
      } else if (val === best) picks.push(moves[i]);
    }
    return picks[Math.floor(Math.random() * picks.length)];
  }

  const api = { play: play, legalMoves: legalMoves, pocket: pocket, choose: choose };

  function mount() {
    const rootEl = document.getElementById("oware");
    if (!rootEl) return;
    const boardEl = document.getElementById("oware-board");
    const turnEl = document.getElementById("oware-turn");
    const doneEl = document.getElementById("oware-done");
    const northCount = document.getElementById("oware-n-count");
    const southCount = document.getElementById("oware-s-count");
    const northName = document.getElementById("oware-n-name");
    const northWho = document.getElementById("oware-north");
    const southWho = document.getElementById("oware-south");
    const recordEl = document.getElementById("oware-record");
    const friendBtn = document.getElementById("oware-friend");
    const houseBtn = document.getElementById("oware-house");
    const againBtn = document.getElementById("oware-again");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const order = [11, 10, 9, 8, 7, 6, 0, 1, 2, 3, 4, 5];
    const recordKey = "abigail-oware-record";

    let mode = "friend";
    let board = [];
    let scores = [0, 0];
    let side = 0;
    let starter = 0;
    let seen = {};
    let over = false;
    let busy = false;
    let gen = 0;
    let note = "";
    let handoff = false;
    let record = loadRecord();

    function loadRecord() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(recordKey));
        if (saved && typeof saved.you === "number") return saved;
      } catch (e) { /* keep the default */ }
      return { you: 0, house: 0, draw: 0 };
    }

    function saveRecord() {
      try { window.localStorage.setItem(recordKey, JSON.stringify(record)); } catch (e) { /* private mode */ }
    }

    function northLabel() { return mode === "house" ? "The house" : "Them"; }

    function paintRecord() {
      const played = record.you + record.house + record.draw;
      recordEl.hidden = played === 0;
      if (!played) return;
      recordEl.textContent = "Against the house, " + record.you + "–" + record.house + (record.draw ? ", " + record.draw + " drawn" : "") + ".";
    }

    function seedsHtml(n) {
      const show = Math.min(n, 10);
      let html = "";
      for (let i = 0; i < show; i++) html += "<i></i>";
      return html;
    }

    function render(marks) {
      marks = marks || {};
      const moves = over || busy ? [] : legalMoves(board, side);
      let html = "";
      for (let i = 0; i < order.length; i++) {
        const pit = order[i];
        const legal = moves.indexOf(pit) !== -1;
        const cls = ["pit"];
        if (legal) cls.push("is-legal");
        if (marks.last === pit) cls.push("is-last");
        if (marks.taken && marks.taken.indexOf(pit) !== -1) cls.push("is-taken");
        const owner = pit < 6 ? "Your house" : northLabel() + "’s house";
        html += "<button class=\"" + cls.join(" ") + "\" type=\"button\" data-pit=\"" + pit + "\"" +
          (legal ? "" : " disabled") +
          " aria-label=\"" + owner + ", " + board[pit] + (board[pit] === 1 ? " seed" : " seeds") + "\">" +
          "<span class=\"seeds\">" + seedsHtml(board[pit]) + "</span><b>" + board[pit] + "</b></button>";
      }
      boardEl.innerHTML = html;
      northCount.textContent = String(scores[1]);
      southCount.textContent = String(scores[0]);
      northName.textContent = northLabel();
      northWho.classList.toggle("is-playing", !over && side === 1);
      southWho.classList.toggle("is-playing", !over && side === 0);
    }

    function say(text) { turnEl.textContent = text; }

    function winner() {
      if (scores[0] > scores[1]) return 0;
      if (scores[1] > scores[0]) return 1;
      return -1;
    }

    function endGame(reason) {
      over = true;
      busy = false;
      const who = winner();
      doneEl.hidden = false;
      if (who === 0) doneEl.textContent = scores[0] >= 25 && reason !== "pocket" ? "Twenty-five. The board is yours." : "You have " + scores[0] + ". The board is yours.";
      else if (who === 1) doneEl.textContent = northLabel() + " has " + scores[1] + ".";
      else doneEl.textContent = "Twenty-four each. A draw.";
      if (reason === "slam") { /* message already on the turn line */ }
      say(who === -1 ? "Set them up again." : "Another game is one tap away.");
      if (mode === "house") {
        if (who === 0) record.you += 1;
        else if (who === 1) record.house += 1;
        else record.draw += 1;
        saveRecord();
        paintRecord();
      }
      if (who === -1) starter = starter ^ 1;
      else starter = who;
      render();
    }

    function beginTurn() {
      if (scores[0] >= 25 || scores[1] >= 25) {
        endGame("score");
        return;
      }
      const stamp = side + ":" + scores.join(",") + ":" + board.join(",");
      if (seen[stamp]) {
        const done = pocket(board, scores);
        board = done.board;
        scores = done.scores;
        endGame("pocket");
        return;
      }
      seen[stamp] = true;
      const moves = legalMoves(board, side);
      if (!moves.length) {
        const done = pocket(board, scores);
        board = done.board;
        scores = done.scores;
        endGame("pocket");
        return;
      }
      doneEl.hidden = true;
      const lead = note;
      note = "";
      if (side === 0) say(lead + "Your turn. Sow from a house on your side.");
      else if (mode === "friend") say(lead + "Their turn. Pass this phone. The far row is theirs.");
      else say(lead + "The house is choosing.");
      render();
      if (mode === "friend" && handoff && window.Curtain) {
        const mine = side === 0;
        const packed = encodeState();
        window.Curtain.show({
          title: mine ? "Your turn." : "Their turn.",
          note: mine ? "This phone is yours. The near row is yours." : "Pass this phone. The far row is theirs.",
          link: location.origin + location.pathname + "#oware-" + packed,
          done: function () { handoff = false; }
        });
      }
      if (mode === "house" && side === 1) {
        const token = gen;
        window.setTimeout(function () {
          if (token !== gen || over) return;
          const pit = choose(board, scores, 1);
          if (pit < 0) return;
          commit(pit);
        }, reduced ? 0 : 420);
      }
    }

    function commit(pit) {
      const token = gen;
      const result = play(board, scores, side, pit);
      busy = true;
      render();
      const frames = result.steps;
      let frame = 0;
      const gap = reduced ? 0 : (frames.length > 16 ? 42 : 78);

      function show() {
        if (token !== gen) return;
        board = frames[frame].board.slice();
        render({ last: frames[frame].pit });
        frame += 1;
        if (frame < frames.length) {
          window.setTimeout(show, gap);
          return;
        }
        window.setTimeout(function () {
          if (token !== gen) return;
          board = result.board;
          scores = result.scores;
          if (result.slam) note = "That would take every seed they have, so it captures nothing. ";
          else if (result.captured) note = result.captured + " seeds kept. ";
          render({ last: result.last, taken: result.taken });
          window.setTimeout(function () {
            if (token !== gen) return;
            busy = false;
            side = other(side);
            if (mode === "friend") handoff = true;
            beginTurn();
          }, result.captured || result.slam ? 520 : 160);
        }, result.taken.length ? 260 : 40);
      }
      show();
    }

    function deal(nextMode) {
      gen += 1;
      mode = nextMode || mode;
      board = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
      scores = [0, 0];
      side = starter;
      seen = {};
      over = false;
      busy = false;
      friendBtn.classList.toggle("is-on", mode === "friend");
      houseBtn.classList.toggle("is-on", mode === "house");
      friendBtn.setAttribute("aria-pressed", mode === "friend" ? "true" : "false");
      houseBtn.setAttribute("aria-pressed", mode === "house" ? "true" : "false");
      doneEl.hidden = true;
      handoff = false;
      if (window.Curtain) window.Curtain.hide();
      paintRecord();
      beginTurn();
    }

    function encodeState() {
      const json = JSON.stringify({ b: board, s: scores, t: side });
      return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    function restore(token) {
      try {
        const pad = token.replace(/-/g, "+").replace(/_/g, "/");
        const data = JSON.parse(atob(pad));
        if (!data.b || data.b.length !== 12) return false;
        gen += 1;
        mode = "friend";
        board = data.b.slice();
        scores = data.s.slice();
        side = data.t === 1 ? 1 : 0;
        seen = {};
        over = false;
        busy = false;
        handoff = true;
        friendBtn.classList.add("is-on");
        houseBtn.classList.remove("is-on");
        friendBtn.setAttribute("aria-pressed", "true");
        houseBtn.setAttribute("aria-pressed", "false");
        doneEl.hidden = true;
        paintRecord();
        beginTurn();
        return true;
      } catch (err) {
        return false;
      }
    }

    boardEl.addEventListener("click", function (event) {
      const button = event.target.closest("[data-pit]");
      if (!button || busy || over) return;
      if (mode === "house" && side === 1) return;
      const pit = Number(button.getAttribute("data-pit"));
      if (legalMoves(board, side).indexOf(pit) === -1) return;
      commit(pit);
    });

    friendBtn.addEventListener("click", function () { deal("friend"); });
    houseBtn.addEventListener("click", function () { deal("house"); });
    againBtn.addEventListener("click", function () { deal(mode); });
    const incoming = (location.hash || "").slice(1);
    if (incoming.indexOf("oware-") === 0 && restore(incoming.slice(6))) return;
    deal("friend");
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }

  root.Oware = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
