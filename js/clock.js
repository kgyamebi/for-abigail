(function () {
  const daysEl = document.getElementById("cd-days");
  const daysLabel = document.getElementById("cd-days-label");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");
  const title = document.getElementById("hero-title");
  const live = document.getElementById("cd-live");
  const marks = document.querySelectorAll(".marks li");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastLive = "";
  let wasOnDay = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function setTick(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    if (reduced) return;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function targetFor(now) {
    const year = now.getFullYear();
    const start = new Date(year, 9, 16, 0, 0, 0, 0);
    const end = new Date(year, 9, 17, 0, 0, 0, 0);
    if (now >= end) return new Date(year + 1, 9, 16, 0, 0, 0, 0);
    return start;
  }

  function enterToday(animate) {
    const root = document.documentElement;
    const hero = document.querySelector(".hero");
    if (!animate || reduced) {
      title.textContent = "Today.";
      root.classList.add("is-today");
      return;
    }
    hero.classList.add("is-leaving");
    window.setTimeout(function () {
      title.textContent = "Today.";
      hero.classList.remove("is-leaving");
      root.classList.add("is-today");
      const bar = document.getElementById("bar-title");
      if (bar && document.body.getAttribute("data-screen") === "home") bar.textContent = "Today";
    }, 640);
  }

  function tick() {
    const now = new Date();
    const target = targetFor(now);
    const end = new Date(target.getFullYear(), 9, 17, 0, 0, 0, 0);
    const onDay = now >= target && now < end;

    marks.forEach(function (li, index) {
      const day = index + 1;
      const approaching = now.getMonth() === 9 && now.getDate() < 16 && now.getFullYear() === target.getFullYear();
      li.classList.toggle("is-lit", onDay || (approaching && now.getDate() >= day));
    });

    if (window.AbigailDay) {
      const mode = window.AbigailDay.season(now);
      if (mode === "birthday" || mode === "kept") {
        marks.forEach(function (li) { li.classList.add("is-lit"); });
        window.AbigailDay.sync(now, mode);
        wasOnDay = mode === "birthday";
        return;
      }
      window.AbigailDay.sync(now, "approach");
    } else if (onDay) {
      if (wasOnDay === false) enterToday(true);
      else if (!document.documentElement.classList.contains("is-today")) enterToday(false);
      if (lastLive !== "today") {
        lastLive = "today";
        live.textContent = "Today is 16 October. Abigail and her mother.";
      }
      wasOnDay = true;
      return;
    }

    if (onDay) return;

    wasOnDay = false;
    let diff = target.getTime() - now.getTime();
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    setTick(daysEl, String(days));
    daysLabel.textContent = days === 1 ? "day" : "days";
    setTick(hoursEl, pad(hours));
    setTick(minsEl, pad(mins));
    setTick(secsEl, pad(secs));
    const spoken = days + (days === 1 ? " day" : " days") + " until 16 October.";
    if (spoken !== lastLive) {
      lastLive = spoken;
      live.textContent = spoken + " Abigail and her mother.";
    }
  }

  tick();
  window.setInterval(tick, 1000);
})();
