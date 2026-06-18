(function () {
    function setupPlayer(root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var hlsInstance = null;
        var triedLocal = false;
        function setFallback() {
            var fallback = video.getAttribute('data-fallback');
            if (fallback && video.currentSrc !== fallback) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                video.src = fallback;
                video.load();
            }
        }
        function loadHls(source) {
            if (!source) {
                setFallback();
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (!triedLocal && video.getAttribute('data-local-m3u8')) {
                            triedLocal = true;
                            hlsInstance.destroy();
                            hlsInstance = null;
                            loadHls(video.getAttribute('data-local-m3u8'));
                            return;
                        }
                        setFallback();
                    }
                });
                return;
            }
            setFallback();
        }
        function playVideo() {
            button.classList.add('hidden');
            if (!video.dataset.loaded) {
                video.dataset.loaded = '1';
                loadHls(video.getAttribute('data-m3u8') || video.getAttribute('data-local-m3u8'));
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }
        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('hidden');
            }
        });
    }
    Array.prototype.slice.call(document.querySelectorAll('[data-player-root]')).forEach(setupPlayer);
})();
