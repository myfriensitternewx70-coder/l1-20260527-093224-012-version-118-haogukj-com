(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLiveSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));
    if (!inputs.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function filter(value) {
      var keyword = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var matched = !keyword || normalize(card.textContent).indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    inputs.forEach(function (input) {
      if (initial && !input.value) {
        input.value = initial;
      }
      input.addEventListener('input', function () {
        filter(input.value);
      });
    });

    filter(initial || inputs[0].value);
  }

  function setupVideoPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      if (!video || !button) {
        return;
      }

      var source = video.getAttribute('data-src');
      var status = shell.querySelector('[data-player-status]');
      var loaded = false;
      var hls = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadSource() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('高清播放');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放加载中');
            }
          });
          shell._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('高清播放');
        } else {
          video.src = source;
          setStatus('高清播放');
        }
      }

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        loadSource();
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            shell.classList.add('is-playing');
          }).catch(function () {
            shell.classList.remove('is-playing');
          });
        } else {
          shell.classList.add('is-playing');
        }
      }

      button.addEventListener('click', startPlayback);
      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          startPlayback(event);
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  function setupBackTop() {
    var button = document.querySelector('.back-top');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupLiveSearch();
    setupVideoPlayers();
    setupBackTop();
  });
})();
