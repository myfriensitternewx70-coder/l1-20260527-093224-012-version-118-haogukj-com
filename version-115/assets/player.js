(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var url = player.getAttribute('data-video-url');
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (loaded || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      loaded = true;
    }

    function startPlayback() {
      attachSource();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
