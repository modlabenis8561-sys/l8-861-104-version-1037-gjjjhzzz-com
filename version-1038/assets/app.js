
(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var index = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeSelect = document.querySelector('[data-type-select]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grid = document.querySelector('[data-card-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var apply = function () {
      var word = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : 'all';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
        var typeMatched = type === 'all' || card.dataset.type.indexOf(type) !== -1 || card.dataset.tags.indexOf(type) !== -1;
        var matched = (!word || haystack.indexOf(word) !== -1) && typeMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    var sortCards = function () {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === 'rating') {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return String(b.dataset.date || '').localeCompare(String(a.dataset.date || ''));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    };
    if (filterInput) {
      filterInput.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
      sortCards();
    }
    apply();
  }

  var searchGrid = document.querySelector('[data-search-grid]');
  if (searchGrid && window.SEARCH_MOVIES) {
    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get('q') || '';
    var input = document.querySelector('[data-search-box]');
    if (input) {
      input.value = query;
    }
    var render = function (keyword) {
      searchGrid.innerHTML = '';
      var text = String(keyword || '').trim().toLowerCase();
      var list = text ? window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(text) !== -1;
      }).slice(0, 96) : window.SEARCH_MOVIES.slice(0, 48);
      list.forEach(function (movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = '<a class="movie-poster" href="./' + movie.detail + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-shade"></span><span class="movie-score">' + movie.rating + '</span></a><div class="movie-card-body"><div class="movie-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div><h3><a href="./' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div>';
        searchGrid.appendChild(article);
      });
      var empty = document.querySelector('[data-search-empty]');
      if (empty) {
        empty.classList.toggle('is-visible', list.length === 0);
      }
    };
    var escapeHtml = function (text) {
      return String(text || '').replace(/[&<>"']/g, function (char) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char];
      });
    };
    render(query);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.cinema-player'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-src');
    var loaded = false;
    var bind = function () {
      if (loaded || !src) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({enableWorker: true, lowLatencyMode: true});
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    var start = function () {
      bind();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
  });
})();
