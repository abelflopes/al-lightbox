
var alLightbox = (function () {
    "use strict";

    var page = document.documentElement;

    var cfg = {
        class: {
            image: "al-lightbox-image",
            overlay: "al-lightbox-overlay",
            overlayImage: "al-lightbox-overlay-image",
            center: "al-lightbox-center",
            hidden: "al-lightbox-hidden",
            visible: "al-lightbox-visible",
            transition: "al-lightbox-transition",
            overflow: "al-lightbox-overflow",
            close: "al-lightbox-close"
        },
        dataAttr: {
            initialized: "data-al-lightbox-initialized",
            height: "data-al-height",
            width: "data-al-width"
        },
        overlayMargin: 30,
        transitionApplyTimeout: 50,
        checkSizeInterval: 500
    };


    var _removeClassAfterTransition = function (element) {
        element.addEventListener("transitionend", function () {
            element.classList.remove(cfg.class.transition);
        }, false);
    };


    var _delete = function (value) {
        if (typeof value === "string") {
            value = document.querySelectorAll("." + value);
        } else {
            value = [value];
        }
        var elements = value,
            i;
        for (i = 0; i < elements.length; i += 1) {
            elements[i].outerHTML = "";
        }
    };


    var _hide = function (value) {
        if (typeof value === "string") {
            value = document.querySelectorAll("." + value);
        } else {
            value = [value];
        }
        var elements = value,
            i;

        function _h(element) {
            var count = 0;
            element.classList.add(cfg.class.transition);
            setTimeout(function () {
                element.classList.add(cfg.class.hidden);
                element.classList.remove(cfg.class.visible);
            }, cfg.transitionApplyTimeout);
            element.addEventListener("transitionend", function () {
                if (count === 0) {
                    _delete(element);
                    count += 1;
                }
            }, false);
        }

        for (i = 0; i < elements.length; i += 1) {
            _h(elements[i]);
        }

    };


    var _show = function (element, fade, callback) {
        _removeClassAfterTransition(element);
        if (fade) {
            element.classList.add(cfg.class.transition);
            setTimeout(function () {
                element.classList.remove(cfg.class.hidden);
                element.classList.add(cfg.class.visible);
                callback();
            }, cfg.transitionApplyTimeout);
        } else {
            element.classList.remove(cfg.class.hidden);
            element.classList.add(cfg.class.visible);
            callback();
        }
    };


    var _closeLightbox = function () {
        _hide(cfg.class.overlay);
        _hide(cfg.class.overlayImage);
        page.classList.remove(cfg.class.overflow);
    };


    var _insertClose = function (image) {
        var close;
        close = document.createElement("button");
        close.setAttribute("type", "button");
        close.classList.add(cfg.class.close);
        image.appendChild(close);
        close.addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            _closeLightbox();
        }, false);
    };


    var _showOverlay = function (overlay, image) {
        page.classList.add(cfg.class.overflow);
        _show(overlay, true, function () {
            overlay.addEventListener("click", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _closeLightbox();
            }, false);
        });
        _insertClose(image);
    };


    var _insertOverlay = function (image) {
        _delete(cfg.class.overlay);
        var overlay;
        overlay = document.createElement("div");
        overlay.classList.add(cfg.class.overlay);
        overlay.classList.add(cfg.class.hidden);
        document.body.appendChild(overlay);
        _showOverlay(overlay, image);
    };


    var _scaleImage = function (image, size) {
        setTimeout(function () {
            image.classList.add(cfg.class.transition);
            setTimeout(function () {
                image.style.height = size.height + "px";
                image.style.width = size.width + "px";
                _insertOverlay(image);
            }, cfg.transitionApplyTimeout);
        }, cfg.transitionApplyTimeout);
    };


    var _centerImage = function (image, size) {
        var allow = true;
        image.classList.add(cfg.class.transition);
        setTimeout(function () {
            image.style.top = (page.scrollTop + window.innerHeight / 2) + "px";
            image.style.left = "";
            image.classList.add(cfg.class.center);
        }, cfg.transitionApplyTimeout);
        image.addEventListener("transitionend", function () {
            if (!allow) {
                return;
            }
            allow = false;
            _scaleImage(image, size);
        }, false);
    };


    var _getImage = function (src, callback) {
        var img = new Image();
        img.onload = function () {
            callback({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = function () {
            callback(false);
        };
        img.src = src;
    };


    var _fit = function (size) {

        var w = size.width,
            h = size.height,
            rh = h / w,
            rw = w / h;

        var fitH = window.innerHeight - cfg.overlayMargin * 2,
            fitW = window.innerWidth - cfg.overlayMargin * 2;

        if (w > fitW) {
            w = fitW;
            h = w * rh;
        }

        if (h > fitH) {
            h = fitH;
            w = h * rw;
        }

        return {
            width: w,
            height: h
        };
    };


    var _showImage = function (element, image) {
        _show(image, false, function () {
            var size = {},
                interval;

            function _check() {
                if (element.hasAttribute(cfg.dataAttr.height) && element.hasAttribute(cfg.dataAttr.width)) {
                    size.height = element.getAttribute(cfg.dataAttr.height);
                    size.width = element.getAttribute(cfg.dataAttr.width);
                    size = _fit(size);
                    _centerImage(image, size);
                    clearInterval(interval);
                }
            }
            interval = setInterval(function () {
                _check();
            }, cfg.checkSizeInterval);
            _check();
        });
    };


    var _insertImage = function (element, data) {
        _delete(cfg.class.overlayImage);
        var src = element.getAttribute("data-image"),
            image;
        image = document.createElement("div");
        image.style.backgroundImage = "url(" + src + ")";
        image.style.height = data.height + "px";
        image.style.width = data.width + "px";
        image.style.top = data.top + "px";
        image.style.left = data.left + "px";
        image.classList.add(cfg.class.overlayImage, cfg.class.hidden);
        document.body.appendChild(image);
        _showImage(element, image, src);
    };


    var _getElementData = function (element) {
        var data = {
            height: element.clientHeight,
            width: element.clientWidth,
            top: element.getBoundingClientRect().top - page.getBoundingClientRect().top,
            left: element.getBoundingClientRect().left - page.getBoundingClientRect().left
        };
        _insertImage(element, data);
    };

    var _imageClick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        _getElementData(this);
    };


    var _onImageClick = function (element) {
        element.addEventListener("click", _imageClick);
    };


    var _setImage = function (element) {
        var src = element.getAttribute("data-image");
        _getImage(src, function (size) {
            element.style.backgroundImage = "url(" + src + ")";
            element.classList.add(cfg.class.image);
            if (size) {
                element.setAttribute(cfg.dataAttr.height, size.height);
                element.setAttribute(cfg.dataAttr.width, size.width);
            } else {
                element.setAttribute(cfg.dataAttr.height, element.clientHeight + "");
                element.setAttribute(cfg.dataAttr.width, element.clientWidth + "");
            }
        });
    };


    var init = function (selector) {

        if (!selector) {
            console.error("AL-Lightbox: A selector must be defined as parameter when calling init()");
            return;
        }

        var elements = document.querySelectorAll(selector),
            i,
            initialized;

        for (i = 0; i < elements.length; i += 1) {
            initialized = elements[i].hasAttribute(cfg.dataAttr.initialized);
            if (!initialized) {
                _setImage(elements[i]);
                _onImageClick(elements[i]);
                elements[i].setAttribute(cfg.dataAttr.initialized, "");
            }
        }

    };


    var destroy = function (selector) {

        if (!selector) {
            console.error("AL-Lightbox: A selector must be defined as parameter when calling destroy()");
            return;
        }

        _delete(cfg.class.overlayImage);
        _delete(cfg.class.overlay);
        page.classList.remove(cfg.class.overflow);

        var elements = document.querySelectorAll(selector),
            i,
            initialized;

        for (i = 0; i < elements.length; i += 1) {
            initialized = elements[i].hasAttribute(cfg.dataAttr.initialized);
            if (initialized) {
                elements[i].removeAttribute(cfg.dataAttr.initialized);
                elements[i].removeAttribute(cfg.dataAttr.height);
                elements[i].removeAttribute(cfg.dataAttr.width);
                elements[i].classList.remove(cfg.class.image);
                elements[i].style.backgroundImage = "";
                elements[i].removeEventListener("click", _imageClick);
            }
        }

    };

    return {
        destroy: destroy,
        init: init
    };

}());