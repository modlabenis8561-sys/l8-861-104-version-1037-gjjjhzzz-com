(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var toggle = one("[data-mobile-toggle]");
    var panel = one("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSiteSearch() {
    all("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = one("input[name='q']", form);
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        if (query) {
          window.location.href = action + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = action;
        }
      });
    });
  }

  function setupHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  function setupCardFilters() {
    var panel = one("[data-filter-page]");
    if (!panel) {
      return;
    }
    var searchInput = one("[data-card-search]");
    var selects = all("[data-filter-key]");
    var cards = all("[data-movie-card]");
    var empty = one("[data-empty-state]");
    function apply() {
      var query = normalize(searchInput ? searchInput.value : "");
      var values = {};
      selects.forEach(function (select) {
        values[select.getAttribute("data-filter-key")] = normalize(select.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = !query || text.indexOf(query) !== -1;
        Object.keys(values).forEach(function (key) {
          if (values[key] && normalize(card.getAttribute("data-" + key)) !== values[key]) {
            matched = false;
          }
        });
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function cardMarkup(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">HD</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var root = one("[data-search-results]");
    var form = one("[data-search-main]");
    if (!root || !form || !window.SEARCH_MOVIES) {
      return;
    }
    var input = one("input[name='q']", form);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render() {
      var query = normalize(input ? input.value : "");
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        if (!query) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 240);
      root.innerHTML = results.length
        ? results.map(cardMarkup).join("")
        : '<div class="empty-state is-visible">未找到匹配影片</div>';
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupSiteSearch();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
}());

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var button = document.getElementById("movie-play-button");
  var started = false;
  if (!video || !streamUrl) {
    return;
  }
  function attachSource() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    attachSource();
    if (button) {
      button.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      play();
    }
  });
}
