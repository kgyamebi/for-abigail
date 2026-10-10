(function () {
  const screens = ["home", "oware", "lights", "pairs", "xo", "guess", "pass", "scramble", "chain", "run", "make", "daily", "dare", "further", "ask", "closer", "still", "yours", "between", "trade", "wheel", "story"];
  const titles = {
    home: "For Abigail",
    oware: "Oware",
    lights: "Keep the lights",
    pairs: "Pairs",
    xo: "Tic tac toe",
    guess: "Higher or lower",
    pass: "Pass the phone",
    scramble: "Scramble",
    chain: "The chain",
    run: "The run",
    make: "Make it",
    daily: "The day",
    dare: "Truth or dare",
    further: "Further",
    ask: "Ask",
    closer: "Closer",
    still: "Still",
    yours: "Yours",
    between: "Between",
    trade: "Trade",
    wheel: "The wheel",
    story: "The letter"
  };
  const back = document.getElementById("back");
  const barTitle = document.getElementById("bar-title");
  const play = document.getElementById("play");
  let guardUntil = 0;
  let openingToken = 0;

  document.addEventListener("click", function (event) {
    if (Date.now() > guardUntil) return;
    const opener = event.target && event.target.closest && event.target.closest("[data-go]");
    if (opener) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  function holdClicks() {
    const token = ++openingToken;
    guardUntil = Date.now() + 500;
    document.body.classList.add("is-opening");
    window.setTimeout(function () {
      if (token === openingToken) document.body.classList.remove("is-opening");
    }, 500);
  }

  function show(name) {
    if (screens.indexOf(name) === -1) {
      const exists = document.querySelector("section[data-screen='" + name + "']");
      if (!exists) name = "home";
    }
    document.querySelectorAll("section[data-screen]").forEach(function (el) {
      const on = el.getAttribute("data-screen") === name;
      el.hidden = !on;
    });
    document.body.hidden = false;
    document.body.setAttribute("data-screen", name);
    if (back) back.hidden = name === "home";
    if (play) play.hidden = name !== "story";
    const today = document.documentElement.classList.contains("is-today");
    if (barTitle) barTitle.textContent = name === "home" && today ? "Today" : (titles[name] || name);
    if (name === "home" && window.AbigailDay) {
      window.AbigailDay.welcome();
      window.AbigailDay.anticipate();
    } else if (name !== "home" && window.AbigailDay) {
      window.AbigailDay.hide();
    }
    document.title = name === "home" ? "For Abigail" : (titles[name] || name) + " · For Abigail";
    if (name !== "story" && window.AbigailStory) window.AbigailStory.stop();
    if (window.Curtain && name !== "oware") window.Curtain.hide();
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = "";
    const curtain = document.getElementById("curtain");
    if (name !== "home" && (!curtain || curtain.hidden)) {
      const screen = document.querySelector("section[data-screen='" + name + "']");
      if (screen) {
        screen.setAttribute("tabindex", "-1");
        window.requestAnimationFrame(function () {
          if (document.body.getAttribute("data-screen") !== name) return;
          try { screen.focus({ preventScroll: true }); } catch (err) { /* keep the screen open */ }
        });
      }
    }
  }

  function go(name) {
    holdClicks();
    const current = (location.hash || "#home").slice(1) || "home";
    const here = location.pathname + location.search;
    if (current !== name) {
      if (name === "home") history.pushState({ view: "home" }, "", here);
      else history.pushState({ view: name }, "", here + "#" + name);
    }
    show(name);
  }

  document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      go(button.getAttribute("data-go"));
    });
  });

  back.addEventListener("click", function () { go("home"); });

  function screenFromHash(raw) {
    const name = raw || "home";
    if (name.indexOf("oware-") === 0) return "oware";
    if (name.indexOf("xo-") === 0) return "xo";
    if (name.indexOf("further-") === 0) return "further";
    if (name.indexOf("dare-") === 0) return "dare";
    if (name.indexOf("ask-") === 0) return "ask";
    return screens.indexOf(name) === -1 ? "home" : name;
  }

  window.addEventListener("popstate", function () {
    show(screenFromHash((location.hash || "#home").slice(1)));
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.getAttribute("data-screen") !== "home") {
      const tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      go("home");
    }
  });

  const initial = (location.hash || "").slice(1);
  const start = screenFromHash(initial);
  const shared = initial.indexOf("oware-") === 0 || initial.indexOf("xo-") === 0 || initial.indexOf("further-") === 0 || initial.indexOf("dare-") === 0 || initial.indexOf("ask-") === 0;
  history.replaceState({ view: start }, "", start === "home" ? location.pathname + location.search : (shared ? "#" + initial : "#" + start));
  show(start);
})();