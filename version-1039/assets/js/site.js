(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        if (menuButton) {
            menuButton.addEventListener("click", function () {
                document.body.classList.toggle("menu-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-slide") || "0", 10);
                showSlide(index);
                startHero();
            });
        });

        var prev = document.querySelector(".hero-arrow.prev");
        var next = document.querySelector(".hero-arrow.next");
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }
        startHero();

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var filterInput = document.querySelector(".movie-filter-input");
        var typeSelect = document.querySelector(".movie-filter-type");
        var yearSelect = document.querySelector(".movie-filter-year");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target .movie-card"));

        if (filterInput && query) {
            filterInput.value = query;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var text = normalize(filterInput ? filterInput.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = (!text || haystack.indexOf(text) !== -1) &&
                    (!type || cardType === type) &&
                    (!year || cardYear === year);
                card.classList.toggle("is-hidden", !matched);
            });
        }

        [filterInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        applyFilter();

        Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".play-overlay");
            var src = player.getAttribute("data-src");
            var hlsInstance = null;

            function attach() {
                if (!video || !src || player.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
                player.setAttribute("data-ready", "1");
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                if (video) {
                    video.controls = true;
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
