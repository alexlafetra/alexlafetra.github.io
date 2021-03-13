"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var galleryComponent_1 = require("../galleryComponent");
var TextItem = /** @class */ (function (_super) {
    tslib_1.__extends(TextItem, _super);
    function TextItem(props) {
        var _this = _super.call(this, props) || this;
        if (typeof _this.props.actions.setItemLoaded === 'function') {
            _this.props.actions.setItemLoaded();
        }
        return _this;
    }
    TextItem.prototype.getTextDimensions = function () {
        var _a = this.props, style = _a.style, styleParams = _a.styleParams, cubeRatio = _a.cubeRatio;
        var isVerticalItem = style.ratio < cubeRatio - 0.01;
        //text dimensions include scaling
        var textHeight = (isVerticalItem
            ? style.height / style.maxHeight
            : style.width / style.maxWidth) * style.maxHeight;
        var textWidth = (!isVerticalItem
            ? style.width / style.maxWidth
            : style.height / style.maxHeight) * style.maxWidth;
        var translate = styleParams.cubeType === 'fit'
            ? '0, 0'
            : Math.round((style.width - textWidth) / 2) + "px, " + Math.round((style.height - textHeight) / 2) + "px";
        var scale = isVerticalItem
            ? style.height / style.maxHeight
            : style.width / style.maxWidth;
        var transform = "translate(" + translate + ") scale(" + scale + ")";
        return {
            width: style.maxWidth + 'px',
            height: style.maxHeight + 'px',
            transformOrigin: '0 0',
            WebkitTransform: transform,
            MsTransform: transform,
            OTransform: transform,
            transform: transform,
        };
    };
    TextItem.prototype.processInnerhtml = function (html) {
        // Remove html class name from inner html elements
        // In older version of the text editor we used font themes (set as classes). Without the iframe it clashes with Santa's css
        try {
            return html.replace(/class="font_\d+"/gm, '');
        }
        catch (e) {
            return html;
        }
    };
    TextItem.prototype.render = function () {
        var _a = this.props, id = _a.id, styleParams = _a.styleParams, html = _a.html, style = _a.style, actions = _a.actions, imageDimensions = _a.imageDimensions;
        var processedHtml = this.processInnerhtml(html);
        var dimensions = this.getTextDimensions();
        var htmlParam = { dangerouslySetInnerHTML: { __html: processedHtml } };
        var changeBgColor = {
            style: Object.assign(dimensions, styleParams.cubeType === 'fit' ? { backgroundColor: style.bgColor } : {}),
        };
        var attributes = tslib_1.__assign(tslib_1.__assign({}, htmlParam), changeBgColor);
        var itemContentStyle = {
            height: imageDimensions && !this.props.isPrerenderMode
                ? imageDimensions.height
                : 'inherit',
            backgroundColor: styleParams.cubeType !== 'fit' ? style.bgColor : 'inherit',
        };
        if (imageDimensions && imageDimensions.borderRadius) {
            itemContentStyle.borderRadius = imageDimensions.borderRadius;
        }
        return (react_1.default.createElement("div", { className: 'gallery-item-content', style: itemContentStyle },
            react_1.default.createElement("div", tslib_1.__assign({ className: 'gallery-item-visible gallery-item gallery-item-loaded text-item', key: 'item-text-' + id, onTouchStart: actions.handleItemMouseDown, onTouchEnd: actions.handleItemMouseUp, "data-hook": "text-item" }, attributes))));
    };
    return TextItem;
}(galleryComponent_1.GalleryComponent));
exports.default = TextItem;
//# sourceMappingURL=textItem.js.map