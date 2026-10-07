(function () {
  const curtain = document.getElementById("curtain");
  const title = document.getElementById("curtain-title");
  const note = document.getElementById("curtain-note");
  const go = document.getElementById("curtain-go");
  const send = document.getElementById("curtain-send");
  let onDone = null;
  let link = "";

  function hide() {
    curtain.hidden = true;
    document.body.classList.remove("is-curtained");
    onDone = null;
  }

  function show(opts) {
    title.textContent = opts.title || "Their turn.";
    note.textContent = opts.note || "Hand the phone over.";
    link = opts.link || "";
    send.hidden = !link;
    send.textContent = "Copy the link";
    onDone = opts.done || null;
    curtain.hidden = false;
    document.body.classList.add("is-curtained");
    go.focus();
  }

  go.addEventListener("click", function () {
    const done = onDone;
    hide();
    if (done) done();
  });

  send.addEventListener("click", function () {
    const write = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(link)
      : Promise.reject();
    write.then(function () {
      send.textContent = "Copied";
    }).catch(function () {
      window.prompt("Copy this link", link);
    });
  });

  window.Curtain = { show: show, hide: hide };
})();
