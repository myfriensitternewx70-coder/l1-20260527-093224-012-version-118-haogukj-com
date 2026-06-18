(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggles = document.querySelectorAll("[data-nav-toggle]");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var target = document.querySelector(toggle.getAttribute("data-nav-toggle"));
        if (target) {
          target.classList.toggle("is-open");
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    showSlide(0);

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function filterCards(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var query = normalize(input ? input.value : "");
      var genre = select ? select.value : "all";

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" "));
        var cardGenre = card.getAttribute("data-category") || "";
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var genreMatch = genre === "all" || cardGenre === genre;
        card.hidden = !(queryMatch && genreMatch);
      });
    }

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-filter-select]");
      if (input) {
        input.addEventListener("input", function () {
          filterCards(scope);
        });
      }
      if (select) {
        select.addEventListener("change", function () {
          filterCards(scope);
        });
      }
      filterCards(scope);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        if (!input.value) {
          input.value = query;
          var scope = input.closest("[data-search-scope]");
          if (scope) {
            filterCards(scope);
          }
        }
      });
    }
  });
})();
