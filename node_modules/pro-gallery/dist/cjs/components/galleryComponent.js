"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryComponent = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var GalleryContext_js_1 = require("../context/GalleryContext.js");
var GalleryComponent = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryComponent, _super);
    function GalleryComponent(props) {
        var _this = _super.call(this, props) || this;
        if (typeof _this.context !== 'object') {
            _this.context = {};
        }
        if (props && typeof props.context === 'object') {
            _this.context = tslib_1.__assign(tslib_1.__assign({}, _this.context), props.context);
        }
        return _this;
    }
    GalleryComponent.contextType = GalleryContext_js_1.GalleryContext;
    return GalleryComponent;
}(react_1.default.Component));
exports.GalleryComponent = GalleryComponent;
//# sourceMappingURL=galleryComponent.js.map