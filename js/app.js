(function () {
  const screens = ["home", "oware", "lights", "pairs", "pass", "story"];
  const titles = {
    home: "For Abigail",
    oware: "Oware",
    lights: "Keep the lights",
    pairs: "Pairs",
    pass: "Pass the phone",
    story: "The letter"
  };
  const back = document.getElementById("back");
  const barTitle = document.getElementById("bar-title");
  const play = document.getElementById("play");

  function show(name) {
    if (screens.indexOf(name) === -1) name = "home";
    document.querySelectorAll("[data-screen]").forEach(function (el) {
      const on = el.getAttribute("data-screen") === name;
      el.hidden = !on;
    });
    document.body.setAttribute("data-screen", name);
    back.hidden = name === "home";
    play.hidden = name !== "story";
    const today = document.documentElement.classList.contains("is-today");
    barTitle.textContent = name === "home" && today ? "Today" : titles[name];
    document.title = name === "home" ? "For Abigail" : titles[name] + " · For Abigail";
    if (name !== "story" && window.AbigailStory) window.AbigailStory.stop();
    window.scrollTo(0, 0);
    if (name !== "home") {
      const screen = document.querySelector("[data-screen='" + name + "']");
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

  window.addEventListener("popstate", function () {
    const name = (location.hash || "#home").slice(1) || "home";
    show(screens.indexOf(name) === -1 ? "home" : name);
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.getAttribute("data-screen") !== "home") {
      const tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      go("home");
    }
  });

  const initial = (location.hash || "").slice(1);
  const start = screens.indexOf(initial) === -1 ? "home" : initial;
  history.replaceState({ view: start }, "", start === "home" ? location.pathname + location.search : "#" + start);
  show(start);
})();