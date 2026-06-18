(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function attachStream(player) {
    if (player.classList.contains("is-ready")) {
      return;
    }

    var video = player.querySelector("video");
    var stream = player.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      player._hls = hls;
    } else {
      video.src = stream;
    }

    player.classList.add("is-ready");
    var playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        video.controls = true;
      });
    }
  }

  ready(function () {
    document.querySelectorAll(".movie-player").forEach(function (player) {
      var button = player.querySelector(".play-overlay");
      var video = player.querySelector("video");

      if (button) {
        button.addEventListener("click", function () {
          attachStream(player);
        });
      }

      if (video) {
        video.addEventListener("play", function () {
          attachStream(player);
        }, { once: true });
      }
    });
  });
})();
