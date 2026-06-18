import { H as Hls } from './vendor/hls-vendor-dru42stk.js';

function setupPlayer(root) {
  const video = root.querySelector('video[data-src]');
  const button = root.querySelector('[data-play-button]');
  const status = root.querySelector('[data-player-status]');
  let initialized = false;
  let hls = null;

  if (!video || !button) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initializeSource() {
    if (initialized) {
      return Promise.resolve();
    }

    const source = video.dataset.src;

    if (!source) {
      setStatus('当前影片暂无可用播放源。');
      return Promise.reject(new Error('Missing video source'));
    }

    initialized = true;
    setStatus('正在初始化播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('播放源已加载。');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请稍后重试。');
          if (hls) {
            hls.destroy();
            hls = null;
          }
          initialized = false;
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已加载。');
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    setStatus('当前浏览器不支持 HLS 播放。');
    return Promise.reject(new Error('HLS is not supported'));
  }

  button.addEventListener('click', function () {
    initializeSource()
      .then(function () {
        button.classList.add('is-hidden');
        return video.play();
      })
      .catch(function () {
        button.classList.remove('is-hidden');
      });
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
