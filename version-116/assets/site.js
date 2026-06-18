(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dotsHost = slider.querySelector('[data-hero-dots]');
    let activeIndex = 0;
    let timer = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      if (dotsHost) {
        Array.from(dotsHost.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (dotsHost) {
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
        dot.addEventListener('click', function () {
          activate(index);
          start();
        });
        dotsHost.appendChild(dot);
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function applyLocalSearch(form) {
    const input = form.querySelector('.movie-search');
    const list = document.querySelector('[data-card-list]');
    const counter = document.querySelector('[data-result-count]');

    if (!input || !list) {
      return;
    }

    const cards = Array.from(list.children);

    function filterCards() {
      const keyword = input.value.trim().toLowerCase();
      let shown = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        const matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          shown += 1;
        }
      });

      if (counter) {
        counter.textContent = shown + ' 部影片';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });

    input.addEventListener('input', filterCards);
  }

  document.querySelectorAll('[data-local-search]').forEach(applyLocalSearch);

  const librarySearch = new URLSearchParams(window.location.search).get('q');
  if (librarySearch) {
    const input = document.querySelector('.movie-search');
    if (input) {
      input.value = librarySearch;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}());
