(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var button = document.querySelector('.mobile-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = queryAll('.hero-slide', root);
    var dots = queryAll('.hero-dot', root);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-goto-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function normalized(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initCardFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    var type = document.querySelector('[data-type-filter]');
    var cards = queryAll('.movie-card', list);

    function apply() {
      var keyword = normalized(input && input.value);
      var yearValue = normalized(year && year.value);
      var typeValue = normalized(type && type.value);
      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !yearValue || normalized(card.getAttribute('data-year')) === yearValue;
        var okType = !typeValue || normalized(card.getAttribute('data-type')) === typeValue;
        card.style.display = okKeyword && okYear && okType ? '' : 'none';
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initRankTableFilter() {
    var input = document.querySelector('[data-table-filter]');
    var table = document.querySelector('[data-rank-table]');
    if (!input || !table) {
      return;
    }
    var rows = queryAll('tbody tr', table);
    input.addEventListener('input', function () {
      var keyword = normalized(input.value);
      rows.forEach(function (row) {
        row.style.display = !keyword || normalized(row.textContent).indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  function initPlayer() {
    var button = document.querySelector('.play-overlay');
    var video = document.getElementById('moviePlayer');
    if (!button || !video) {
      return;
    }

    button.addEventListener('click', function () {
      var source = button.getAttribute('data-video-src');
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported() && source.indexOf('.m3u8') !== -1) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play();
        }, { once: true });
        video.load();
      }

      button.classList.add('hidden');
    });
  }

  function createSearchCard(movie) {
    var detailHref = 'detail/' + movie.file;
    var imageHref = movie.cover + '.jpg';
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title), '">',
      '<a class="poster-link" href="', detailHref, '">',
      '<img src="', imageHref, '" alt="', escapeHtml(movie.title), '" loading="lazy" onerror="this.classList.add(\'image-missing\'); this.removeAttribute(\'src\');">',
      '<span class="poster-fallback">', escapeHtml(movie.title.slice(0, 8)), '</span>',
      '<span class="score-pill">热度 ', movie.score, '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="', detailHref, '">', escapeHtml(movie.title), '</a>',
      '<p class="card-meta">', movie.year, ' · ', escapeHtml(movie.region), ' · ', escapeHtml(movie.type), '</p>',
      '<p class="card-desc">', escapeHtml(movie.oneLine), '</p>',
      '<div class="tag-row">', tags, '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var input = document.getElementById('globalSearchInput');
    var button = document.getElementById('globalSearchButton');
    var results = document.getElementById('globalSearchResults');
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      render(initial);
    }

    function render(keyword) {
      var term = normalized(keyword);
      var items = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        if (!term) {
          return true;
        }
        return normalized([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' ')).indexOf(term) !== -1;
      }).slice(0, 120);

      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
        return;
      }
      results.innerHTML = items.map(createSearchCard).join('');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    if (button) {
      button.addEventListener('click', function () {
        render(input.value);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroCarousel();
    initCardFilters();
    initRankTableFilter();
    initPlayer();
    initGlobalSearch();
  });
})();
