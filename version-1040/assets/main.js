(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
  }

  function setupFiltering() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var sort = panel.querySelector("[data-sort-select]");
      var grid = document.querySelector("[data-filter-grid]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
      if (!grid) {
        return;
      }
      var items = Array.prototype.slice.call(grid.children);
      var activeChip = "全部";

      function itemValue(item, name) {
        return item.getAttribute("data-" + name) || "";
      }

      function apply() {
        var query = text(input ? input.value : "");
        var filtered = items.filter(function (item) {
          var haystack = text([
            itemValue(item, "title"),
            itemValue(item, "genre"),
            itemValue(item, "region"),
            itemValue(item, "type"),
            itemValue(item, "year")
          ].join(" "));
          var chipMatch = activeChip === "全部" || haystack.indexOf(text(activeChip)) !== -1;
          return haystack.indexOf(query) !== -1 && chipMatch;
        });

        items.forEach(function (item) {
          item.style.display = "none";
        });

        var sortValue = sort ? sort.value : "default";
        if (sortValue !== "default") {
          filtered.sort(function (a, b) {
            if (sortValue === "title") {
              return itemValue(a, "title").localeCompare(itemValue(b, "title"), "zh-Hans-CN");
            }
            return Number(itemValue(b, sortValue)) - Number(itemValue(a, sortValue));
          });
        }

        filtered.forEach(function (item) {
          item.style.display = "";
          grid.appendChild(item);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeChip = chip.getAttribute("data-filter-chip") || "全部";
          chips.forEach(function (button) {
            button.classList.toggle("is-active", button === chip);
          });
          apply();
        });
      });
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + movie.year + "\" data-rating=\"" + movie.rating + "\" data-heat=\"" + movie.heat + "\">" +
      "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"card-year\">" + movie.year + "</span>" +
      "<span class=\"card-score\">" + movie.rating + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</p>" +
      "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var index = window.SITE_SEARCH_INDEX || [];
    if (!form || !input || !results || !status || !index.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var q = text(query).trim();
      if (!q) {
        status.textContent = "热门内容";
        return;
      }
      var words = q.split(/\s+/).filter(Boolean);
      var matches = index.filter(function (movie) {
        var haystack = text([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.year,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      status.textContent = matches.length ? "搜索结果" : "暂无匹配内容";
      results.innerHTML = matches.map(createSearchCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", nextUrl);
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initial);
  }

  function setupPlayerButton() {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("play-button");
    if (!video || !button) {
      return;
    }
    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      if (!video || !sourceUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      setupPlayerButton();
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupSearchPage();
    setupPlayerButton();
  });
})();
