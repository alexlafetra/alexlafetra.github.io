"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssScrollHelper = void 0;
var pro_gallery_lib_1 = require("pro-gallery-lib");
var CssScrollHelper = /** @class */ (function () {
    function CssScrollHelper() {
        this.pgScrollSteps = [
            40960,
            20480,
            10240,
            5120,
            2560,
            1280,
            640,
            320,
            160,
            80,
            40,
            20,
            10,
        ];
        this.pgScrollClassName = 'pgscl';
        this.screenSize = Math.max(pro_gallery_lib_1.window.screen.width, pro_gallery_lib_1.window.screen.height);
        this.scrollCss = [];
        this.scrollCssProps = [];
        this.calcScrollPaddings(false);
    }
    CssScrollHelper.prototype.calcScrollPaddings = function () {
        var _this = this;
        //padding: [belowScreen, aboveScreen]
        //padding: [above images, below image]
        this.allPagePadding = function () { return [Infinity, Infinity]; };
        this.inScreenPadding = function () { return [0, 0]; };
        this.aboveScreenPadding = function () { return [0, Infinity]; };
        this.justBelowScreenPadding = function (itemHeight) { return [
            Infinity,
            -1 * (itemHeight + _this.screenSize),
        ]; };
        this.justBelowAndAboveScreenPadding = function () { return [2560, Infinity]; };
        this.justBelowAndInScreenPadding = function () { return [5120, 0]; };
        this.belowScreenPadding = function () { return [Infinity, 0]; };
        this.highResPadding = function () { return [5120, Infinity]; };
        this.lowResPadding = function () { return [10240, Infinity]; };
    };
    CssScrollHelper.prototype.getSellectorDomId = function (_a) {
        var id = _a.id, idx = _a.idx;
        var shortId = String(id).replace(/[\W]+/g, '');
        return "pgi" + shortId + "_" + idx;
    };
    CssScrollHelper.prototype.buildScrollClassName = function (domId, idx, val) {
        var shortId = String(domId).replace(/[\W]+/g, '').slice(-8);
        return this.pgScrollClassName + "_" + shortId + "_" + val + "-" + (this.pgScrollSteps[idx] + Number(val));
    };
    CssScrollHelper.prototype.calcScrollClasses = function (domId, scrollTop) {
        var _this = this;
        return (this.pgScrollClassName + "-" + scrollTop + " " +
            this.pgScrollSteps
                .map(function (step, idx) {
                return _this.buildScrollClassName(domId, idx, Math.floor(scrollTop / step) * step);
            })
                .join(' '));
    };
    CssScrollHelper.prototype.calcScrollCss = function (_a) {
        var _this = this;
        var domId = _a.domId, items = _a.items, styleParams = _a.styleParams, container = _a.container;
        pro_gallery_lib_1.utils.isVerbose() && console.time('CSS Scroll');
        if (!(items && items.length)) {
            return [];
        }
        var scrollAnimation = styleParams.scrollAnimation;
        if (!scrollAnimation ||
            scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.NO_EFFECT) {
            return [];
        }
        this.screenSize = styleParams.oneRow
            ? Math.min(pro_gallery_lib_1.window.outerWidth, pro_gallery_lib_1.window.screen.width, container.galleryWidth)
            : Math.min(pro_gallery_lib_1.window.outerHeight, pro_gallery_lib_1.window.screen.height);
        if (!styleParams.oneRow && pro_gallery_lib_1.utils.isMobile()) {
            this.screenSize += 50;
        }
        this.calcScrollPaddings();
        var lastItem = items.slice(-1)[0];
        var _b = lastItem.offset, top = _b.top, right = _b.right;
        var maxStep = this.pgScrollSteps[0];
        this.minHeight = 0 - maxStep;
        this.maxHeight =
            (Math.ceil(((styleParams.oneRow ? right : top) + this.screenSize) / maxStep) +
                1) *
                maxStep;
        var cssScroll = items.map(function (item) {
            return _this.calcScrollCssForItem({ domId: domId, item: item, styleParams: styleParams });
        });
        pro_gallery_lib_1.utils.isVerbose() && console.timeEnd('CSS Scroll');
        return cssScroll;
    };
    CssScrollHelper.prototype.shouldCalcScrollCss = function (_a) {
        var type = _a.type;
        if (type === 'video' || type === 'text') {
            return false;
        }
        return true;
    };
    CssScrollHelper.prototype.createScrollSelectorsFunction = function (_a) {
        var _this = this;
        var domId = _a.domId, item = _a.item, styleParams = _a.styleParams;
        var imageTop = styleParams.oneRow
            ? item.offset.left - this.screenSize
            : item.offset.top - this.screenSize;
        var imageBottom = styleParams.oneRow
            ? item.offset.left + item.width
            : item.offset.top + item.height;
        var minStep = this.pgScrollSteps[this.pgScrollSteps.length - 1];
        var ceil = function (num, step) {
            return Math.ceil(Math.min(_this.maxHeight, num) / step) * step;
        };
        var floor = function (num, step) {
            return Math.floor(Math.max(_this.minHeight, num) / step) * step;
        };
        var sellectorDomId = this.getSellectorDomId(item);
        return function (padding, suffix) {
            var before = padding[0], after = padding[1];
            if (before === Infinity && after === Infinity) {
                return "#pro-gallery-" + domId + " #" + sellectorDomId + " " + suffix;
            }
            var from = floor(imageTop - before, minStep);
            var to = ceil(imageBottom + after, minStep);
            // if (utils.isVerbose()) {
            //   console.log(
            //     `CSS SCROLL - item #${item.idx} display range is: (${from} - ${to})`,
            //   );
            // }
            var scrollClasses = [];
            while (from < to) {
                var largestDividerIdx = _this.pgScrollSteps.findIndex(function (step) { return (from % step === 0 && from + step <= to); }); //eslint-disable-line
                if (largestDividerIdx === -1) {
                    console.error("largestDividerIdx is -1. Couldn't find index in pgScrollSteps array.\nfrom =", from, '\nto =', to, '\npadding[0] =', padding[0], '\npadding[1] =', padding[1]);
                    break;
                }
                scrollClasses.push("." + _this.buildScrollClassName(domId, largestDividerIdx, from) + " ~ div #" + sellectorDomId + " " + suffix);
                from += _this.pgScrollSteps[largestDividerIdx];
                // console.count('pgScroll class created');
            }
            return scrollClasses.join(', ');
        };
    };
    CssScrollHelper.prototype.calcScrollCssForItem = function (_a) {
        var domId = _a.domId, item = _a.item, styleParams = _a.styleParams;
        var idx = item.idx;
        var scrollCss = '';
        var createScrollSelectors = this.createScrollSelectorsFunction({
            domId: domId,
            item: item,
            styleParams: styleParams,
        });
        //scrollAnimation
        scrollCss += this.createScrollAnimationsIfNeeded({
            idx: idx,
            item: item,
            styleParams: styleParams,
            createScrollSelectors: createScrollSelectors,
        });
        // if (utils.isVerbose()) {
        //   console.log(
        //     'CSS SCROLL - css calc for item #' + idx,
        //     item,
        //     this.scrollCss[idx],
        //   );
        // }
        this.scrollCss[idx] = scrollCss || this.scrollCss[idx];
        return this.scrollCss[idx];
        // console.count('pgScroll item created');
    };
    CssScrollHelper.prototype.createScrollAnimationsIfNeeded = function (_a) {
        var idx = _a.idx, styleParams = _a.styleParams, createScrollSelectors = _a.createScrollSelectors;
        var isRTL = styleParams.isRTL, oneRow = styleParams.oneRow, scrollAnimation = styleParams.scrollAnimation;
        if (!scrollAnimation ||
            scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.NO_EFFECT) {
            return '';
        }
        var _randomDelay = ((idx % 3) + 1) * 100; //100 - 300
        var _randomDuration = ((idx % 3) + 1) * 100; //100 - 300
        var animationPreparationPadding = this.allPagePadding();
        var animationActivePadding = this.aboveScreenPadding();
        var scrollAnimationCss = '';
        // notice: these 2 animations must have the blurry image
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.MAIN_COLOR ||
            scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.BLUR) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, " [data-hook=\"image-item-overlay\"]") +
                    ("{filter: opacity(1); transition: filter 1." + _randomDuration + "s ease-in " + _randomDelay + "ms !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, " [data-hook=\"image-item-overlay\"]") + "{filter: opacity(0) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.FADE_IN) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, ' .gallery-item-wrapper') +
                    ("{filter: opacity(0); transition: filter 1." + _randomDuration + "s ease-in !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + "{filter: opacity(1) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.GRAYSCALE) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, ' .gallery-item-wrapper') +
                    ("{filter: grayscale(100%); transition: filter 1." + (200 + _randomDuration) + "s ease-in !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + "{filter: grayscale(0) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.SLIDE_UP) {
            var axis = oneRow ? 'X' : 'Y';
            var direction = isRTL ? '-' : '';
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, '') +
                    '{overflow: visible !important;}' +
                    createScrollSelectors(animationPreparationPadding, ' > div') +
                    ("{transform: translate" + axis + "(" + direction + "100px); transition: transform 0.8s cubic-bezier(.13,.78,.53,.92) !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' > div') +
                    ("{transform: translate" + axis + "(0) !important;}");
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.EXPAND) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, ' > div') +
                    ("{transform: scale(0.95); transition: transform 1s cubic-bezier(.13,.78,.53,.92) " + _randomDelay + "ms !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' > div') +
                    "{transform: scale(1) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.SHRINK) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, '') +
                    '{overflow: visible !important;}' +
                    createScrollSelectors(animationPreparationPadding, ' > div') +
                    ("{transform: scale(1.05); transition: transform 1s cubic-bezier(.13,.78,.53,.92) " + _randomDelay + "ms !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' > div') +
                    "{transform: scale(1) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.ZOOM_OUT) {
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, ' .gallery-item-wrapper') +
                    ("{transform: scale(1.1); transition: transform 1.2s cubic-bezier(.13,.78,.53,.92) " + _randomDelay + "ms !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + "{transform: scale(1) !important;}";
        }
        if (scrollAnimation === pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.ONE_COLOR) {
            var oneColorAnimationColor = styleParams.oneColorAnimationColor &&
                styleParams.oneColorAnimationColor.value
                ? styleParams.oneColorAnimationColor.value
                : 'transparent';
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, '') +
                    ("{background-color: " + oneColorAnimationColor + ";}");
            scrollAnimationCss +=
                createScrollSelectors(animationPreparationPadding, ' .gallery-item-wrapper') +
                    ("{filter: opacity(0); transition: filter 0." + (600 + _randomDuration) + "s ease-in !important;}");
            scrollAnimationCss +=
                createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + "{filter: opacity(1) !important;}";
        }
        return scrollAnimationCss;
    };
    return CssScrollHelper;
}());
exports.cssScrollHelper = new CssScrollHelper();
// Testing the best combination of scroll steps (goal is to reduce the number of classe sper item to minimum)
// ----------------------------------------------------------------------------------------------------------
// pgScrollSteps = [1000, 100, 10]; -> 6759 / 354 = 19 classes per item
// pgScrollSteps = [2500, 500, 100, 20]; -> 4137 / 354 = 11.6 classes per item
// pgScrollSteps = [2560, 1280, 640, 320, 160, 80, 40, 20]; -> 2502 / 354 = 7 classes per item
// pgScrollSteps = [5120, 2560, 1280, 640, 320, 160, 80, 40, 20]; -> 2502 / 354 = 7 classes per item
// pgScrollSteps = [5120, 2560, 1280, 640, 320, 160, 80, 40, 20, 10]; -> 2772 / 354 = 7.8 classes per item
//# sourceMappingURL=cssScrollHelper.js.map