(function () {
  function each(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function matchesCard(card, keyword, typeValue, yearValue) {
    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type")
    ].join(" ").toLowerCase();

    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
    var typeMatch = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
    var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
    return keywordMatch && typeMatch && yearMatch;
  }

  function initFilters() {
    each("[data-filter-panel]", function (panel) {
      var gridSelector = panel.getAttribute("data-filter-panel");
      var grid = document.querySelector(gridSelector);
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
      var input = panel.querySelector("[data-filter-input]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");

      function run() {
        var keyword = normalize(input ? input.value : "");
        var typeValue = normalize(typeSelect ? typeSelect.value : "");
        var yearValue = normalize(yearSelect ? yearSelect.value : "");

        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", !matchesCard(card, keyword, typeValue, yearValue));
        });
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }

      run();
    });
  }

  function initPlayers() {
    each("[data-player]", function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector("[data-play-cover]");
      var stream = box.getAttribute("data-stream");
      var ready = false;
      var instance = null;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (ready) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls();
          instance.loadSource(stream);
          instance.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (!ready) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (instance && instance.destroy) {
          instance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
