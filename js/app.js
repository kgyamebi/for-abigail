(function () {
  const screens = ["home", "oware", "lights", "pairs", "pass", "dare", "ask", "story"];
  const titles = {
    home: "For Abigail",
    oware: "Oware",
    lights: "Keep the lights",
    pairs: "Pairs",
    pass: "Pass the phone",
    dare: "Truth or dare",
    ask: "Ask",
    story: "The letter"
  };
  const back = document.getElementById("back");
  const barTitle = document.getElementById("bar-title");
  const play = document.getElementById("play");

  function show(name) {
    if (screens.indexOf(name) === -1) name = "home";
    document.querySelectorAll("section[data-screen]").forEach(function (el) {
      const on = el.getAttribute("data-screen") === name;
      el.hidden = !on;
    });
    document.body.hidden = false;
    document.body.setAttribute("data-screen", name);
    back.hidden = name === "home";
    play.hidden = name !== "story";
    const today = document.documentElement.classList.contains("is-today");
    barTitle.textContent = name === "home" && today ? "Today" : titles[name];
    document.title = name === "home" ? "For Abigail" : titles[name] + " · For Abigail";
    if (name !== "story" && window.AbigailStory) window.AbigailStory.stop();
    if (window.Curtain && name !== "oware") window.Curtain.hide();
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = "";
    const curtain = document.getElementById("curtain");
    if (name !== "home" && (!curtain || curtain.hidden)) {
      const screen = document.querySelector("section[data-screen='" + name + "']");
      screen.setAttribute("tabindex", "-1");
      screen.focus({ preventScroll: true });
    }
  }

  function go(name) {
    const current = (location.hash || "#home").slice(1) || "home";
    if (current !== name) {
      if (name === "home") history.pushState({ view: "home" }, "", location.pathname + location.search);
      else history.pushState({ view: name }, "", "#" + name);
    }
    show(name);
  }

  document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function () {
      go(button.getAttribute("data-go"));
    });
  });

  back.addEventListener("click", function () { go("home"); });

  function screenFromHash(raw) {
    const name = raw || "home";
    if (name.indexOf("oware-") === 0) return "oware";
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
  const shared = initial.indexOf("oware-") === 0 || initial.indexOf("dare-") === 0 || initial.indexOf("ask-") === 0;
  history.replaceState({ view: start }, "", start === "home" ? location.pathname + location.search : (shared ? "#" + initial : "#" + start));
  show(start);
})();