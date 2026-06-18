(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }

      showSlide(dotIndex);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-search-input]');
    var categorySelect = filterRoot.querySelector('[data-category-filter]');
    var yearSelect = filterRoot.querySelector('[data-year-filter]');
    var typeSelect = filterRoot.querySelector('[data-type-filter]');
    var countTarget = filterRoot.querySelector('[data-result-count]');
    var emptyState = filterRoot.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));

    function valueOf(element) {
      return element ? String(element.value || '').trim().toLowerCase() : '';
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = valueOf(searchInput);
      var category = valueOf(categorySelect);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesCategory = !category || String(card.getAttribute('data-category') || '').toLowerCase() === category;
        var matchesYear = !year || String(card.getAttribute('data-year') || '').toLowerCase() === year;
        var matchesType = !type || String(card.getAttribute('data-type') || '').toLowerCase() === type;
        var shouldShow = matchesQuery && matchesCategory && matchesYear && matchesType;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = '当前显示 ' + visible + ' 部影片';
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, categorySelect, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
