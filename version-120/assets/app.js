(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initCardFilter() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-movie-card]"),
    );
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var yearValue = normalize(yearSelect && yearSelect.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var type = normalize(card.getAttribute("data-type"));
        var year = normalize(card.getAttribute("data-year"));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && type !== typeValue) {
          ok = false;
        }
        if (yearValue && year !== yearValue) {
          ok = false;
        }
        card.classList.toggle("hidden-card", !ok);
      });
    }
    [input, typeSelect, yearSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initPlayer() {
    document.querySelectorAll("[data-video-shell]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      var started = false;
      function attachSource() {
        if (started || !source) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        attachSource();
        shell.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      shell.addEventListener("click", function (event) {
        if (event.target && event.target.tagName === "VIDEO") {
          return;
        }
        play();
      });
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initCardFilter();
    initHero();
    initPlayer();
  });
})();
