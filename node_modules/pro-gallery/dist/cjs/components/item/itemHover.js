"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryComponent_1 = require("../galleryComponent");
var ItemHover = /** @class */ (function (_super) {
    tslib_1.__extends(ItemHover, _super);
    function ItemHover() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemHover.prototype.getHoverClass = function () {
        var _a = this.props, styleParams = _a.styleParams, forceShowHover = _a.forceShowHover;
        var hoverClass = ['gallery-item-hover'];
        hoverClass.push('fullscreen-' + (styleParams.fullscreen ? 'enabled' : 'disabled'));
        if (pro_gallery_lib_1.utils.isUndefined(styleParams.itemOpacity)) {
            //if gallery was just added to the page, and it's settings were never opened,
            //the styles of opacity and background were not set (are undefined),
            //so we are using the default background & opacity (is scss under .gallery-item-hover.default)
            hoverClass.push('default');
        }
        if (forceShowHover) {
            //in mobile, when item is hovered (tapped, with all the right configurations), forceShowHover is true
            hoverClass.push('force-hover');
        }
        else if (pro_gallery_lib_1.utils.isMobile()) {
            hoverClass.push('hide-hover');
        }
        return hoverClass.join(' ');
    };
    ItemHover.prototype.shouldRenderHoverInnerIfExist = function () {
        var _a = this.props, itemWasHovered = _a.itemWasHovered, styleParams = _a.styleParams;
        var hoveringBehaviour = styleParams.hoveringBehaviour, overlayAnimation = styleParams.overlayAnimation, alwaysShowHover = styleParams.alwaysShowHover, previewHover = styleParams.previewHover;
        var APPEARS = pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover.APPEARS;
        var NO_EFFECT = pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.NO_EFFECT;
        if (alwaysShowHover) {
            return true;
        }
        if (pro_gallery_lib_1.isEditMode() && previewHover) {
            return true;
        }
        if (hoveringBehaviour === APPEARS && overlayAnimation !== NO_EFFECT) {
            //when there is a specific overlayAnimation, to support the animation we render the itemHover before any hover activity (see 'shouldHover()' in itemView).
            //so in this specific case, the itemHover exists right away, but we do'nt want to render yet the hover-inner,
            //the hover-inner will be rendered only after (at) the first hover an on, and not before.
            return itemWasHovered;
        }
        return true;
    };
    ItemHover.prototype.render = function () {
        var _a = this.props, imageDimensions = _a.imageDimensions, actions = _a.actions, idx = _a.idx, renderCustomInfo = _a.renderCustomInfo;
        var hoverClass = this.getHoverClass();
        return (react_1.default.createElement("div", { className: hoverClass, key: 'item-hover-' + idx, "data-hook": 'item-hover-' + idx, "aria-hidden": true, style: imageDimensions && imageDimensions.borderRadius
                ? { borderRadius: imageDimensions.borderRadius }
                : {} },
            react_1.default.createElement("div", { style: { height: '100%' }, onTouchStart: actions.handleItemMouseDown, onTouchEnd: actions.handleItemMouseUp }, this.shouldRenderHoverInnerIfExist() && renderCustomInfo ? (react_1.default.createElement("div", { className: "gallery-item-hover-inner" }, renderCustomInfo())) : null)));
    };
    return ItemHover;
}(galleryComponent_1.GalleryComponent));
exports.default = ItemHover;
//# sourceMappingURL=itemHover.js.map