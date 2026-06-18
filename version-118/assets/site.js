(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var btn = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupBackTop() {
    document.querySelectorAll("[data-back-top]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
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

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) return;
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-category-select]");
    var sort = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]") || document.querySelector(".movie-grid");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-result]");
    if (!grid || !cards.length) return;

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var cat = select ? select.value : "all";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardCat = card.getAttribute("data-category") || "";
        var matchedText = !keyword || text.indexOf(keyword) !== -1;
        var matchedCat = cat === "all" || cardCat === cat;
        var ok = matchedText && matchedCat;
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    function sortCards() {
      var value = sort ? sort.value : "default";
      if (value === "default") {
        apply();
        return;
      }
      cards.sort(function (a, b) {
        var ya = parseInt(a.getAttribute("data-year") || "0", 10);
        var yb = parseInt(b.getAttribute("data-year") || "0", 10);
        return value === "year-desc" ? yb - ya : ya - yb;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }

    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
    if (sort) sort.addEventListener("change", sortCards);
    apply();
  }

  function setupPlayer() {
    var wrap = document.querySelector("[data-player]");
    if (!wrap) return;
    var video = wrap.querySelector("video");
    var btn = wrap.querySelector("[data-play]");
    var source = video ? video.querySelector("source") : null;
    if (!video || !btn || !source) return;
    var src = source.getAttribute("src");
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      load();
      wrap.classList.add("playing");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          wrap.classList.remove("playing");
        });
      }
    }

    btn.addEventListener("click", play);
    video.addEventListener("click", play);
    video.addEventListener("play", function () {
      wrap.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      wrap.classList.remove("playing");
    });
  }

  ready(function () {
    setupNav();
    setupBackTop();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
