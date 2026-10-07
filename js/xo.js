(function () {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const boardEl = document.getElementById("xo-board");
  const turnEl = document.getElementById("xo-turn");
  const doneEl = document.getElementById("xo-done");
  const togetherBtn = document.getElementById("xo-together");
  const houseBtn = document.getElementById("xo-house");
  const againBtn = document.getElementById("xo-again");
  const copyBtn = document.getElementById("xo-copy");
  if (!boardEl) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mode = "together";
  let board = [];
  let turn = "x";
  let over = false;
  let gen = 0;

  function blip() {
    if (window.AbigailAudio) window.AbigailAudio.blip();
  }

  function winner(cells) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const mark = cells[line[0]];
      if (mark && mark === cells[line[1]] && mark === cells[line[2]]) return { who: mark, line: line };
    }
    for (let i = 0; i < 9; i++) if (!cells[i]) return null;
    return { who: "draw", line: [] };
  }

  function best(cells) {
    function score(current, mark) {
      const found = winner(current);
      if (found) return found.who === "o" ? 1 : found.who === "x" ? -1 : 0;
      let bestScore = mark === "o" ? -2 : 2;
      for (let i = 0; i < 9; i++) {
        if (current[i]) continue;
        current[i] = mark;
        const next = score(current, mark === "o" ? "x" : "o");
        current[i] = "";
        if (mark === "o") bestScore = Math.max(bestScore, next);
        else bestScore = Math.min(bestScore, next);
      }
      return bestScore;
    }
    let move = -1;
    let bestScore = -2;
    for (let i = 0; i < 9; i++) {
      if (cells[i]) continue;
      cells[i] = "o";
      const next = score(cells, "x");
      cells[i] = "";
      if (next > bestScore) {
        bestScore = next;
        move = i;
      }
    }
    return move;
  }

  function say(result) {
    if (!result) {
      doneEl.hidden = true;
      if (turn === "x") turnEl.textContent = "Your mark.";
      else if (mode === "house") turnEl.textContent = "The house is choosing.";
      else turnEl.textContent = "Their mark. This phone stays between you.";
      return;
    }
    if (result.who === "draw") doneEl.textContent = "The board is full.";
    else if (result.who === "x") doneEl.textContent = "You have the row.";
    else doneEl.textContent = mode === "house" ? "The house has the row." : "They have the row.";
    doneEl.hidden = false;
    turnEl.textContent = "That’s the game.";
  }

  function render(result) {
    const win = result && result.line ? result.line : [];
    let html = "";
    for (let i = 0; i < 9; i++) {
      const mark = board[i];
      const open = !over && !mark && !(mode === "house" && turn === "o");
      const cls = ["xo-cell"];
      if (mark === "o") cls.push("is-o");
      if (open) cls.push("is-open");
      if (win.indexOf(i) !== -1) cls.push("is-win");
      const name = mark === "x" ? "Your mark" : mark === "o" ? (mode === "house" ? "The house" : "Their mark") : "Empty square";
      html += "<button class=\"" + cls.join(" ") + "\" type=\"button\" data-cell=\"" + i + "\"" +
        (open ? "" : " disabled") + " aria-label=\"" + name + "\">" + (mark ? mark.toUpperCase() : "") + "</button>";
    }
    boardEl.innerHTML = html;
    say(result);
  }

  function encode() {
    const packed = board.map(function (cell) { return cell || "."; }).join("") + turn;
    return btoa(packed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function remember() {
    if (mode !== "together") return;
    const next = "#xo-" + encode();
    if (location.hash !== next) history.replaceState({ view: "xo" }, "", next);
  }

  function copyLink() {
    const link = location.origin + location.pathname + "#xo-" + encode();
    const write = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(link)
      : Promise.reject();
    write.then(function () { copyBtn.textContent = "Copied"; }).catch(function () {
      window.prompt("Copy this link", link);
    });
  }

  function houseReply() {
    const token = gen;
    window.setTimeout(function () {
      if (token !== gen || over || turn !== "o" || mode !== "house") return;
      const cell = best(board);
      if (cell < 0) return;
      place(cell, true);
    }, reduced ? 0 : 380);
  }

  function place(index, byHouse) {
    if (over || board[index]) return;
    if (!byHouse && mode === "house" && turn !== "x") return;
    board[index] = turn;
    turn = turn === "x" ? "o" : "x";
    blip();
    const result = winner(board);
    if (result) over = true;
    render(result);
    if (mode === "together") remember();
    if (over) return;
    if (mode === "house" && turn === "o") houseReply();
  }

  function deal(nextMode, saved) {
    gen += 1;
    mode = nextMode || mode;
    board = saved ? saved.board.slice() : ["", "", "", "", "", "", "", "", ""];
    turn = saved ? saved.turn : "x";
    over = false;
    togetherBtn.classList.toggle("is-on", mode === "together");
    houseBtn.classList.toggle("is-on", mode === "house");
    togetherBtn.setAttribute("aria-pressed", mode === "together" ? "true" : "false");
    houseBtn.setAttribute("aria-pressed", mode === "house" ? "true" : "false");
    copyBtn.hidden = mode !== "together";
    copyBtn.textContent = "Copy the link";
    const result = winner(board);
    if (result) over = true;
    render(result);
    if (!over && mode === "house" && turn === "o") houseReply();
    else if (!over && mode === "together" && saved) remember();
    if (mode === "house" && (location.hash || "").indexOf("#xo") === 0) {
      history.replaceState({ view: "xo" }, "", "#xo");
    }
  }

  function restore(token) {
    try {
      const pad = token.replace(/-/g, "+").replace(/_/g, "/");
      const packed = atob(pad);
      if (packed.length !== 10) return false;
      const cells = packed.slice(0, 9).split("");
      const next = packed.charAt(9);
      if (next !== "x" && next !== "o") return false;
      for (let i = 0; i < 9; i++) {
        if (cells[i] === ".") cells[i] = "";
        else if (cells[i] !== "x" && cells[i] !== "o") return false;
      }
      deal("together", { board: cells, turn: next });
      return true;
    } catch (err) {
      return false;
    }
  }

  boardEl.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cell]");
    if (!button || button.disabled) return;
    place(Number(button.getAttribute("data-cell")));
  });
  togetherBtn.addEventListener("click", function () { deal("together"); });
  houseBtn.addEventListener("click", function () { deal("house"); });
  againBtn.addEventListener("click", function () { deal(mode); });
  copyBtn.addEventListener("click", copyLink);

  const incoming = (location.hash || "").slice(1);
  if (incoming.indexOf("xo-") === 0 && restore(incoming.slice(3))) return;
  deal("together");
})();
