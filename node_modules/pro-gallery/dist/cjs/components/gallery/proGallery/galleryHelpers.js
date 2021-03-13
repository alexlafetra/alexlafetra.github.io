"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGalleryInViewport = void 0;
var pro_gallery_lib_1 = require("pro-gallery-lib");
function isGalleryInViewport(container) {
    try {
        var haveAllVariablesForViewPortCalc = !!(container &&
            Number.isInteger(container.scrollBase) &&
            Number.isInteger(container.galleryHeight) &&
            pro_gallery_lib_1.window &&
            pro_gallery_lib_1.window.document &&
            pro_gallery_lib_1.window.document.documentElement &&
            (Number.isInteger(pro_gallery_lib_1.window.document.documentElement.scrollTop) ||
                (pro_gallery_lib_1.window.document.scrollingElement &&
                    Number.isInteger(pro_gallery_lib_1.window.document.scrollingElement.scrollTop))) &&
            Number.isInteger(pro_gallery_lib_1.window.document.documentElement.offsetHeight));
        var inTopViewPort = haveAllVariablesForViewPortCalc &&
            container.scrollBase + container.galleryHeight >
                pro_gallery_lib_1.window.document.documentElement.scrollTop;
        var inBottomViewPort = haveAllVariablesForViewPortCalc &&
            container.scrollBase <
                (pro_gallery_lib_1.window.document.documentElement.scrollTop ||
                    pro_gallery_lib_1.window.document.scrollingElement.scrollTop) +
                    pro_gallery_lib_1.window.document.documentElement.offsetHeight;
        return ((inTopViewPort && inBottomViewPort) || !haveAllVariablesForViewPortCalc); // if some parameters are missing (haveAllVariablesForViewPortCalc is false) we still want the used functionality to work
    }
    catch (e) {
        console.warn('Could not calculate viewport', e);
        return true;
    }
}
exports.isGalleryInViewport = isGalleryInViewport;
//# sourceMappingURL=galleryHelpers.js.map