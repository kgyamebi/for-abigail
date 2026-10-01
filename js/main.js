(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const intro = document.getElementById("intro");
  const enter = document.getElementById("enter");
  const play = document.getElementById("play");
  const playLabel = document.getElementById("play-label");
  const bar = document.getElementById("progress");
  const finale = document.getElementById("stay");
  const hold = document.getElementById("hold");

  function openPage() {
    body.classList.remove("locked");
    body.classList.add("is-open");
    document.title = "Abigail Horlali Fiawoo";
    window.setTimeout(function () {
      intro.setAttribute("hidden", "");
    }, 950);
  }

  if (reduced) {
    openPage();
  } else {
    enter.addEventListener("click", openPage);
  }

  function onScroll() {
    const max = root.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + p + ")";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sections = document.querySelectorAll("[data-spy-section]");
  const links = document.querySelectorAll("[data-spy]");
  const spy = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("data-spy-section");
        links.forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("data-spy") === id);
        });
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
  );
  sections.forEach(function (section) { spy.observe(section); });

  const reveal = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.22 }
  );
  document.querySelectorAll(".verse, .plate, .letter-wrap").forEach(function (el) {
    reveal.observe(el);
  });

  let playing = false;
  let frame = 0;

  function setPlaying(next) {
    playing = next;
    play.setAttribute("aria-pressed", next ? "true" : "false");
    playLabel.textContent = next ? "Pause" : "Play";
  }

  function stopPlay() {
    if (!playing) return;
    setPlaying(false);
    cancelAnimationFrame(frame);
    root.style.scrollBehavior = "";
  }

  play.addEventListener("click", function () {
    if (!body.classList.contains("is-open")) openPage();
    if (playing) {
      stopPlay();
      return;
    }
    setPlaying(true);
    root.style.scrollBehavior = "auto";
    const from = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    const distance = Math.max(0, max - from);
    const duration = Math.max(7000, (distance / Math.max(max, 1)) * 54000);
    const start = performance.now();

    function step(now) {
      if (!playing) return;
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, from + distance * t);
      if (t < 1) frame = requestAnimationFrame(step);
      else {
        setPlaying(false);
        root.style.scrollBehavior = "";
      }
    }

    frame = requestAnimationFrame(step);
  });

  window.addEventListener("wheel", stopPlay, { passive: true });
  window.addEventListener("touchmove", stopPlay, { passive: true });
  window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "PageDown" || event.key === "PageUp" || event.key === " ") {
      if (document.activeElement !== hold) stopPlay();
    }
  });

  function holdOn(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopPlay();
    finale.classList.add("is-holding");
    if (event.pointerId !== undefined && hold.setPointerCapture) {
      hold.setPointerCapture(event.pointerId);
    }
  }

  function holdOff() {
    finale.classList.remove("is-holding");
  }

  hold.addEventListener("pointerdown", holdOn);
  hold.addEventListener("pointerup", holdOff);
  hold.addEventListener("pointercancel", holdOff);
  hold.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      finale.classList.add("is-holding");
    }
  });
  hold.addEventListener("keyup", function (event) {
    if (event.key === " " || event.key === "Enter") holdOff();
  });
  hold.addEventListener("blur", holdOff);
})();
