"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinPaddingVertically = exports.isWithinPaddingHorizontally = exports.scrollToGroupImp = exports.scrollToItemImp = void 0;
var pro_gallery_lib_1 = require("pro-gallery-lib");
function scrollToItemImp(scrollParams) {
    var to, from;
    var _a = scrollParams.scrollMarginCorrection, scrollMarginCorrection = _a === void 0 ? 0 : _a, durationInMS = scrollParams.durationInMS, horizontalElement = scrollParams.horizontalElement, scrollingElement = scrollParams.scrollingElement, isRTL = scrollParams.isRTL, oneRow = scrollParams.oneRow, galleryWidth = scrollParams.galleryWidth, galleryHeight = scrollParams.galleryHeight, totalWidth = scrollParams.totalWidth, top = scrollParams.top, items = scrollParams.items, itemIdx = scrollParams.itemIdx, fixedScroll = scrollParams.fixedScroll;
    var rtlFix = isRTL ? -1 : 1;
    //default = scroll by half the container size
    if (oneRow) {
        from = horizontalElement.scrollLeft * rtlFix;
        to = from + (itemIdx * galleryWidth) / 2;
    }
    else {
        from = top;
        to = top + (itemIdx * galleryHeight) / 2;
    }
    if (fixedScroll !== true) {
        //scroll to specific item
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Scrolling to items #' + itemIdx);
        }
        var item = items.find(function (itm) { return itm.idx === itemIdx; });
        to = oneRow
            ? pro_gallery_lib_1.utils.get(item, 'offset.left')
            : pro_gallery_lib_1.utils.get(item, 'offset.top');
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Scrolling to position ' + to, item);
        }
        if (!(to >= 0)) {
            pro_gallery_lib_1.utils.isVerbose() && console.warn('Position not found, not scrolling');
            return new Promise(function (res) { return res(); });
        }
        if (oneRow) {
            //set scroll to place the item in the middle of the component
            var diff = (galleryWidth - item.width) / 2;
            if (diff > 0) {
                to -= diff;
            }
            to = Math.max(0, to);
            to = Math.min(to, totalWidth - galleryWidth + scrollMarginCorrection);
            to *= rtlFix;
            from *= rtlFix;
            if (pro_gallery_lib_1.utils.isVerbose()) {
                console.log('Scrolling to new position ' + to, this);
            }
        }
    }
    if (oneRow) {
        return horizontalCssScrollTo(horizontalElement, Math.round(from), Math.round(to), durationInMS, isRTL, true);
    }
    else {
        return new Promise(function (resolve) {
            scrollingElement.vertical().scrollTo(0, to);
            resolve(to);
        });
    }
}
exports.scrollToItemImp = scrollToItemImp;
function scrollToGroupImp(scrollParams) {
    var to, from;
    var _a = scrollParams.scrollMarginCorrection, scrollMarginCorrection = _a === void 0 ? 0 : _a, durationInMS = scrollParams.durationInMS, horizontalElement = scrollParams.horizontalElement, scrollingElement = scrollParams.scrollingElement, isRTL = scrollParams.isRTL, oneRow = scrollParams.oneRow, galleryWidth = scrollParams.galleryWidth, galleryHeight = scrollParams.galleryHeight, totalWidth = scrollParams.totalWidth, top = scrollParams.top, groups = scrollParams.groups, groupIdx = scrollParams.groupIdx, fixedScroll = scrollParams.fixedScroll;
    //default = scroll by half the container size
    if (oneRow) {
        from = horizontalElement.scrollLeft;
        if (isRTL) {
            to = from - (groupIdx * galleryWidth) / 2;
        }
        else {
            to = from + (groupIdx * galleryWidth) / 2;
        }
        // console.log('[RTL SCROLL] scrollTogroupImp: ', from, to);
    }
    else {
        from = top;
        to = top + (groupIdx * galleryHeight) / 2;
    }
    if (fixedScroll !== true) {
        //scroll to specific group
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Scrolling to groups #' + groupIdx);
        }
        var group = groups.find(function (grp) { return grp.idx === groupIdx; });
        to = oneRow ? pro_gallery_lib_1.utils.get(group, 'left') : pro_gallery_lib_1.utils.get(group, 'top');
        if (group && isRTL) {
            to += group.width;
        }
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Scrolling to position ' + to, group);
        }
        if (!(to >= 0)) {
            pro_gallery_lib_1.utils.isVerbose() && console.warn('Position not found, not scrolling');
            return new Promise(function (res) { return res(); });
        }
        if (oneRow) {
            //set scroll to place the group in the middle of the component
            var diff = (galleryWidth - group.width) / 2;
            if (diff > 0) {
                if (isRTL) {
                    to += diff;
                }
                else {
                    to -= diff;
                }
            }
            if (isRTL) {
                to = totalWidth - to;
            }
            to = Math.max(0, to);
            to = Math.min(to, totalWidth - galleryWidth + scrollMarginCorrection);
            if (pro_gallery_lib_1.utils.isVerbose()) {
                console.log('Scrolling to new position ' + to, this);
            }
        }
    }
    if (oneRow) {
        return horizontalCssScrollTo(horizontalElement, Math.round(from), Math.round(to), durationInMS, isRTL, true);
    }
    else {
        return new Promise(function (resolve) {
            scrollingElement.vertical().scrollTo(0, to);
            resolve(to);
        });
    }
}
exports.scrollToGroupImp = scrollToGroupImp;
// ----- rendererd / visible ----- //
function getDistanceFromScreen(_a) {
    var offset = _a.offset, scroll = _a.scroll, itemStart = _a.itemStart, itemEnd = _a.itemEnd, screenSize = _a.screenSize;
    var before = scroll - offset - itemEnd;
    var after = offset + itemStart - screenSize - scroll;
    return { before: before, after: after };
}
function isWithinPaddingVertically(_a) {
    var target = _a.target, scrollBase = _a.scrollBase, top = _a.top, bottom = _a.bottom, screenHeight = _a.screenHeight, padding = _a.padding;
    var res = getDistanceFromScreen({
        offset: scrollBase || 0,
        scroll: target.scrollY,
        itemStart: top,
        itemEnd: bottom,
        screenSize: screenHeight,
    });
    return res.before < padding && res.after < padding;
}
exports.isWithinPaddingVertically = isWithinPaddingVertically;
function isWithinPaddingHorizontally(_a) {
    var target = _a.target, left = _a.left, right = _a.right, screenWidth = _a.screenWidth, padding = _a.padding;
    var res = getDistanceFromScreen({
        offset: 0,
        scroll: target.scrollLeft,
        itemStart: left,
        itemEnd: right,
        screenSize: screenWidth,
    });
    return res.before < padding && res.after < padding;
}
exports.isWithinPaddingHorizontally = isWithinPaddingHorizontally;
function horizontalCssScrollTo(scroller, from, to, duration, isRTL) {
    var change = to - from;
    if (change === 0) {
        return new Promise(function (resolve) { return resolve(to); });
    }
    var scrollerInner = scroller.firstChild;
    scroller.setAttribute('data-scrolling', 'true');
    Object.assign(scroller.style, {
        'scroll-snap-type': 'none',
    });
    Object.assign(scrollerInner.style, {
        transition: "margin " + duration + "ms linear",
        '-webkit-transition': "margin " + duration + "ms linear",
    }, isRTL
        ? {
            marginRight: change + "px",
        }
        : {
            marginLeft: -1 * change + "px",
        });
    var intervals = 10;
    var scrollTransitionEvent = new CustomEvent('scrollTransition', {
        detail: change / intervals,
    });
    var scrollTransitionInterval = setInterval(function () {
        scroller.dispatchEvent(scrollTransitionEvent);
    }, Math.round(duration / intervals));
    return new Promise(function (resolve) {
        setTimeout(function () {
            clearInterval(scrollTransitionInterval);
            Object.assign(scrollerInner.style, {
                transition: "none",
                '-webkit-transition': "none",
            }, isRTL
                ? {
                    marginRight: 0,
                }
                : {
                    marginLeft: 0,
                });
            scroller.style.removeProperty('scroll-snap-type');
            scroller.scrollLeft = to;
            scroller.setAttribute('data-scrolling', '');
            resolve(to);
        }, duration);
    });
}
//# sourceMappingURL=scrollHelper.js.map