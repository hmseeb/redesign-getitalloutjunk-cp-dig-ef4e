/* Get It All Out Junk Removal — site scripts (vanilla JS, no dependencies) */
(function () {
  "use strict";

  /* ---------------- Mobile navigation ---------------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var closeBtn = document.querySelector(".nav-close");

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.setAttribute("data-open", open ? "true" : "false");
    if (backdrop) backdrop.setAttribute("data-open", open ? "true" : "false");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(nav.getAttribute("data-open") !== "true");
    });
  }
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setNav(false); });
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------------- Hidden _page field + ?submitted=1 ---------------- */
  var href = window.location.href;
  Array.prototype.forEach.call(document.querySelectorAll('input[name="_page"]'), function (input) {
    input.value = href;
  });

  var params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "1") {
    Array.prototype.forEach.call(document.querySelectorAll(".alert-sent"), function (el) {
      el.setAttribute("data-show", "true");
    });
    var firstAlert = document.querySelector(".alert-sent");
    if (firstAlert) {
      window.setTimeout(function () {
        firstAlert.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
    }
  }

  /* ---------------- Form submission via fetch (progressive enhancement) --- */
  Array.prototype.forEach.call(document.querySelectorAll("form[data-leadr]"), function (form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) return; // let the browser show its messages

      event.preventDefault();

      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = window.location.href;

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        if (typeof value !== "string") return; // never send binary data
        payload[key] = value;
      });
      payload._page = window.location.href;

      var originalLabel = button ? button.innerHTML : "";
      if (button) {
        button.disabled = true;
        button.innerHTML = "Sending…";
      }
      if (status) {
        status.removeAttribute("data-state");
        status.textContent = "";
      }

      fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().catch(function () { return { ok: response.ok }; });
        })
        .then(function (data) {
          if (!data || data.ok !== true) throw new Error("Submission failed");
          if (status) {
            status.setAttribute("data-state", "ok");
            status.textContent = "Thanks, your message was sent. We’ll get back to you with pricing fast — need it sooner? Call or text (323) 381-6235.";
          }
          var card = form.closest(".form-card");
          if (card) card.classList.add("is-sent");
          form.reset();
          var pf = form.querySelector('input[name="_page"]');
          if (pf) pf.value = window.location.href;
        })
        .catch(function () {
          if (status) {
            status.setAttribute("data-state", "error");
            status.textContent = "Sorry — that didn’t send. Please call or text (323) 381-6235 and we’ll take care of you.";
          }
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
        });
    });
  });

  /* ---------------- Before / after comparison slider ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".ba"), function (ba) {
    var range = ba.querySelector(".ba__range");

    function setPos(pct) {
      var clamped = Math.max(0, Math.min(100, pct));
      ba.style.setProperty("--pos", clamped + "%");
    }

    setPos(range ? Number(range.value) : 50);

    if (range) {
      range.addEventListener("input", function () { setPos(Number(range.value)); });
    }

    function pointerPos(clientX) {
      var rect = ba.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      setPos(pct);
      if (range) range.value = String(Math.max(0, Math.min(100, pct)));
    }

    var dragging = false;
    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      pointerPos(e.clientX);
    });
    window.addEventListener("pointermove", function (e) {
      if (dragging) pointerPos(e.clientX);
    });
    window.addEventListener("pointerup", function () { dragging = false; });
  });

  /* ---------------- Marquee: duplicate content for a seamless loop ------- */
  Array.prototype.forEach.call(document.querySelectorAll(".marquee__track"), function (track) {
    track.appendChild(track.firstElementChild.cloneNode(true));
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- Current year in footer ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
