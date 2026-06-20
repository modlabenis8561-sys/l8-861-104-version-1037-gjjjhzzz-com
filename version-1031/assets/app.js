(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var clear = panel.querySelector("[data-clear-search]");
        var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var active = "all";
        if (input) {
            input.value = query;
        }
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function apply() {
            var term = normalize(input ? input.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.textContent
                ].join(" ").toLowerCase();
                var matchText = !term || text.indexOf(term) !== -1;
                var matchFilter = active === "all" || card.getAttribute("data-category") === active;
                var showCard = matchText && matchFilter;
                card.hidden = !showCard;
                if (showCard) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        if (input) {
            input.addEventListener("input", apply);
        }
        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                apply();
            });
        }
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

function initializeVideoPlayer(videoId, playlistUrl) {
    var video = document.getElementById(videoId);
    var cover = document.querySelector('[data-player-cover="' + videoId + '"]');
    var button = document.querySelector('[data-player-button="' + videoId + '"]');
    var player = null;
    var loaded = false;

    if (!video) {
        return;
    }

    function setCoverHidden() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    }

    function attach() {
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
            player = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            player.loadSource(playlistUrl);
            player.attachMedia(video);
            return new Promise(function (resolve) {
                player.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                player.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        loaded = false;
                    }
                });
            });
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            return Promise.resolve();
        }
        video.src = playlistUrl;
        return Promise.resolve();
    }

    function play() {
        setCoverHidden();
        attach().then(function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    if (button && button !== cover) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            play();
        }
    });
    video.addEventListener("play", setCoverHidden);
    window.addEventListener("pagehide", function () {
        if (player) {
            player.destroy();
            player = null;
        }
    });
}
