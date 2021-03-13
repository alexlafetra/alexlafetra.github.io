"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInnerInfoStyle = exports.getOuterInfoStyle = exports.getImageStyle = exports.getContainerStyle = void 0;
var tslib_1 = require("tslib");
var pro_gallery_lib_1 = require("pro-gallery-lib");
function getContainerStyle(styleParams) {
    return tslib_1.__assign({}, ((styleParams.imageInfoType ===
        pro_gallery_lib_1.GALLERY_CONSTS.infoType.ATTACHED_BACKGROUND ||
        pro_gallery_lib_1.GALLERY_CONSTS.hasHoverPlacement(styleParams.titlePlacement)) && tslib_1.__assign(tslib_1.__assign({}, getBorderStyle(styleParams.itemBorderRadius, styleParams.itemBorderWidth, styleParams.itemBorderColor)), boxShadow(styleParams))));
}
exports.getContainerStyle = getContainerStyle;
function boxShadow(styleParams) {
    var _boxShadow = {};
    if (styleParams.itemEnableShadow) {
        var itemShadowBlur = styleParams.itemShadowBlur, itemShadowDirection = styleParams.itemShadowDirection, itemShadowSize = styleParams.itemShadowSize;
        var alpha = ((-1 * (Number(itemShadowDirection) - 90)) / 360) * 2 * Math.PI;
        var shadowX = Math.round(itemShadowSize * Math.cos(alpha));
        var shadowY = Math.round(-1 * itemShadowSize * Math.sin(alpha));
        _boxShadow = {
            boxShadow: shadowX + "px " + shadowY + "px " + itemShadowBlur + "px " + pro_gallery_lib_1.utils.formatColor(styleParams.itemShadowOpacityAndColor),
        };
    }
    return _boxShadow;
}
function getImageStyle(styleParams) {
    return tslib_1.__assign({}, (!pro_gallery_lib_1.GALLERY_CONSTS.hasHoverPlacement(styleParams.titlePlacement) &&
        (styleParams.imageInfoType === pro_gallery_lib_1.GALLERY_CONSTS.infoType.NO_BACKGROUND ||
            styleParams.imageInfoType ===
                pro_gallery_lib_1.GALLERY_CONSTS.infoType.SEPARATED_BACKGROUND) && tslib_1.__assign({}, getBorderStyle(styleParams.itemBorderRadius, styleParams.itemBorderWidth, styleParams.itemBorderColor))));
}
exports.getImageStyle = getImageStyle;
function getBorderStyle(borderRadius, borderWidth, borderColor) {
    return tslib_1.__assign({ overflow: 'hidden', borderRadius: borderRadius, borderWidth: borderWidth + 'px', borderColor: pro_gallery_lib_1.utils.formatColor(borderColor) }, (borderWidth && {
        borderStyle: 'solid',
    }));
}
function getOuterInfoStyle(placement, styleParams, mediaHeight, textBoxHeight) {
    var styles = tslib_1.__assign(tslib_1.__assign({}, (pro_gallery_lib_1.GALLERY_CONSTS.hasHorizontalPlacement(placement) && {
        height: mediaHeight,
        float: pro_gallery_lib_1.GALLERY_CONSTS.isRightPlacement(placement) ? 'right' : 'left',
    })), (pro_gallery_lib_1.GALLERY_CONSTS.hasVerticalPlacement(placement) && {
        height: textBoxHeight,
        boxSizing: 'content-box',
    }));
    if (styleParams.imageInfoType === pro_gallery_lib_1.GALLERY_CONSTS.infoType.SEPARATED_BACKGROUND) {
        return tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, styles), getBorderStyle(styleParams.textBoxBorderRadius, styleParams.textBoxBorderWidth, styleParams.textBoxBorderColor)), (pro_gallery_lib_1.GALLERY_CONSTS.hasAbovePlacement(placement) && {
            marginBottom: styleParams.textImageSpace,
        })), (pro_gallery_lib_1.GALLERY_CONSTS.hasBelowPlacement(placement) && {
            marginTop: styleParams.textImageSpace,
        }));
    }
    return styles;
}
exports.getOuterInfoStyle = getOuterInfoStyle;
function getInnerInfoStylesAboveOrBelow(styleParams, infoHeight) {
    return {
        width: '100%',
        height: infoHeight,
    };
}
function getInnerInfoStylesRightOrLeft(styleParams, infoWidth) {
    return {
        height: '100%',
        width: infoWidth,
    };
}
function getInnerInfoStyle(placement, styleParams, infoHeight, infoWidth) {
    var commonStyles = tslib_1.__assign(tslib_1.__assign({}, ((styleParams.imageInfoType ===
        pro_gallery_lib_1.GALLERY_CONSTS.infoType.SEPARATED_BACKGROUND ||
        styleParams.imageInfoType ===
            pro_gallery_lib_1.GALLERY_CONSTS.infoType.ATTACHED_BACKGROUND) &&
        styleParams.textBoxFillColor &&
        styleParams.textBoxFillColor.value && {
        backgroundColor: styleParams.textBoxFillColor.value,
    })), { overflow: 'hidden', boxSizing: 'border-box' });
    var infoAboveOrBelow = pro_gallery_lib_1.GALLERY_CONSTS.hasVerticalPlacement(placement);
    var infoRightOrLeft = pro_gallery_lib_1.GALLERY_CONSTS.hasHorizontalPlacement(placement);
    return tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, commonStyles), (infoAboveOrBelow &&
        getInnerInfoStylesAboveOrBelow(styleParams, infoHeight))), (infoRightOrLeft &&
        getInnerInfoStylesRightOrLeft(styleParams, infoWidth)));
}
exports.getInnerInfoStyle = getInnerInfoStyle;
//# sourceMappingURL=itemViewStyleProvider.js.map