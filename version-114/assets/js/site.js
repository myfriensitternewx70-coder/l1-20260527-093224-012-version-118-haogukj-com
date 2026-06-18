(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var tabs = qsa('[data-hero-tab]', hero);
        var current = 0;
        function setHero(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            tabs.forEach(function (tab, tabIndex) {
                tab.classList.toggle('active', tabIndex === current);
            });
        }
        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                setHero(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                setHero(current + 1);
            }, 5200);
        }
    }

    var filterRoot = qs('[data-filter-root]');
    if (filterRoot) {
        var input = qs('[data-filter-input]', filterRoot);
        var year = qs('[data-filter-year]', filterRoot);
        var order = qs('[data-filter-order]', filterRoot);
        var grid = qs('[data-filter-grid]', filterRoot);
        var cards = qsa('.movie-card', grid);
        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                var matchedText = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !selectedYear || card.dataset.year === selectedYear;
                card.style.display = matchedText && matchedYear ? '' : 'none';
            });
        }
        function applyOrder() {
            if (!grid || !order) {
                return;
            }
            var sorted = cards.slice().sort(function (a, b) {
                var ya = Number(a.dataset.year || 0);
                var yb = Number(b.dataset.year || 0);
                if (order.value === 'year-asc') {
                    return ya - yb;
                }
                if (order.value === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return yb - ya;
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        [input, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
        if (order) {
            order.addEventListener('change', function () {
                applyOrder();
                applyFilter();
            });
        }
    }

    var resultBox = qs('[data-search-results]');
    if (resultBox && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var inputBox = qs('[data-search-input]');
        if (inputBox) {
            inputBox.value = query;
        }
        function renderSearch(keyword) {
            var term = keyword.trim().toLowerCase();
            var data = window.MOVIE_SEARCH_INDEX;
            var matches = term ? data.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
                return text.indexOf(term) !== -1;
            }) : data.slice(0, 60);
            resultBox.innerHTML = matches.slice(0, 160).map(function (item) {
                return '<article class="movie-card">' +
                    '<a class="movie-cover" href="./' + item.file + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="play-dot">▶</span>' +
                    '</a>' +
                    '<div class="movie-info">' +
                    '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</p>' +
                    '<p class="movie-line">' + escapeHtml(item.oneLine) + '</p>' +
                    '</div>' +
                    '</article>';
            }).join('');
            var empty = qs('[data-empty-state]');
            if (empty) {
                empty.style.display = matches.length ? 'none' : 'block';
            }
        }
        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }
        renderSearch(query);
    }
})();
