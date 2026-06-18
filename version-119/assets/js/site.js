(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function filterCards(input) {
    var value = normalize(input.value);
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    cards.forEach(function(card) {
      var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords") + " " + card.textContent);
      card.classList.toggle("hidden", value.length > 0 && haystack.indexOf(value) === -1);
    });
  }

  function initSearch() {
    var url = new URL(window.location.href);
    var query = url.searchParams.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    inputs.forEach(function(input) {
      if (query) {
        input.value = query;
      }
      filterCards(input);
      input.addEventListener("input", function() {
        filterCards(input);
      });
    });
  }

  window.initMoviePlayer = function(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.querySelector('[data-player-for="' + videoId + '"]');
    if (!video || !sourceUrl) {
      return;
    }
    var activated = false;

    function bindSource() {
      if (activated) {
        return;
      }
      activated = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      bindSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  };

  ready(function() {
    initMenu();
    initHero();
    initSearch();
  });
})();
