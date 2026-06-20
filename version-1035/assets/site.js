(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.visibility = 'hidden';
    });
  });

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function activate(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      activate(index + 1);
    }, 5000);
  }

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var section = bar.closest('section');
    var list = section ? section.querySelector('[data-filter-list]') : document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var keyword = bar.querySelector('[data-filter-keyword]');
    var type = bar.querySelector('[data-filter-type]');
    var year = bar.querySelector('[data-filter-year]');

    if (type && type.options.length <= 1) {
      Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-type');
      }).filter(Boolean))).slice(0, 40).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        type.appendChild(option);
      });
    }

    if (year && year.options.length <= 1) {
      Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year');
      }).filter(Boolean))).sort().reverse().slice(0, 40).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    function applyFilter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
      });
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
