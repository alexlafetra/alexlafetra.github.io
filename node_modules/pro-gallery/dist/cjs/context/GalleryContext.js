"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryProvider = exports.GalleryContext = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
try {
    exports.GalleryContext = react_1.default.createContext({});
}
catch (e) {
    exports.GalleryContext = null;
}
var GalleryProvider = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryProvider, _super);
    function GalleryProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GalleryProvider.prototype.render = function () {
        if (exports.GalleryContext) {
            // const value = { ...this.value, ...this.state };
            return (react_1.default.createElement(exports.GalleryContext.Provider, { value: this.state }, this.props.children));
        }
        else {
            return this.props.children;
        }
    };
    return GalleryProvider;
}(react_1.default.Component));
exports.GalleryProvider = GalleryProvider;
//# sourceMappingURL=GalleryContext.js.map