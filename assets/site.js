(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function runFilter(root, query, category) {
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var empty = root.querySelector(".empty-state");
        var text = normalize(query);
        var activeCategory = category || "all";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-title"));
            var cardCategory = card.getAttribute("data-category") || "";
            var textMatch = !text || haystack.indexOf(text) !== -1;
            var categoryMatch = activeCategory === "all" || cardCategory === activeCategory;
            var show = textMatch && categoryMatch;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }
            var query = input.value.trim();
            if (!query) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    document.querySelectorAll("[data-page-filter]").forEach(function (form) {
        var root = form.closest("main") || document;
        var input = form.querySelector("input[type='search']");
        var category = "all";
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            runFilter(root, input ? input.value : "", category);
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });

        if (input) {
            input.addEventListener("input", apply);
        }

        root.querySelectorAll("[data-filter]").forEach(function (button) {
            button.addEventListener("click", function () {
                category = button.getAttribute("data-filter") || "all";
                root.querySelectorAll("[data-filter]").forEach(function (other) {
                    other.classList.remove("is-active");
                });
                button.classList.add("is-active");
                apply();
            });
        });

        apply();
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var slideIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === slideIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === slideIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide") || 0));
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5000);
    }

    window.setupPlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        var started = false;

        if (!video || !streamUrl) {
            return;
        }

        function attachAndPlay() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", attachAndPlay);
        }

        video.addEventListener("click", function () {
            if (!started) {
                attachAndPlay();
            }
        });
    };
})();
