(function () {
  var data = window.MovieIndex || [];
  var input = document.getElementById('searchInput');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var button = document.getElementById('searchButton');
  var results = document.getElementById('searchResults');
  var empty = document.getElementById('emptyState');

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  Array.from(new Set(data.map(function (item) {
    return item.type;
  }).filter(Boolean))).slice(0, 40).forEach(function (value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    typeFilter.appendChild(option);
  });

  Array.from(new Set(data.map(function (item) {
    return item.year;
  }).filter(Boolean))).sort().reverse().slice(0, 40).forEach(function (value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    yearFilter.appendChild(option);
  });

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card>' +
        '<a class="poster-wrap" href="' + escapeAttr(item.url) + '">' +
          '<img class="card-img" src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">' +
          '<span class="score">' + Number(item.score).toFixed(1) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
          '<p class="movie-desc">' + escapeHtml(item.oneLine || '') + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (match) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      })[match];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    var type = typeFilter.value;
    var year = yearFilter.value;
    var items = data.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' ').toLowerCase();
      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (type && item.type !== type) {
        return false;
      }
      if (year && item.year !== year) {
        return false;
      }
      return true;
    }).slice(0, 240);

    results.innerHTML = items.map(card).join('');
    empty.classList.toggle('show', items.length === 0);
    results.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.visibility = 'hidden';
      });
    });
  }

  [input, typeFilter, yearFilter].forEach(function (control) {
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });

  button.addEventListener('click', render);
  render();
})();
