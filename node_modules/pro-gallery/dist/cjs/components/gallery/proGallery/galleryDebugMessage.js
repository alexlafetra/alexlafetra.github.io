"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryComponent_1 = require("../../galleryComponent");
var GalleryDebugMessage = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryDebugMessage, _super);
    function GalleryDebugMessage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GalleryDebugMessage.prototype.render = function () {
        if (pro_gallery_lib_1.utils.getTopUrlParam('pgdebug') !== 'true') {
            return false;
        }
        var version = (react_1.default.createElement("div", { className: "version-header " },
            "Pro Gallery Version #",
            pro_gallery_lib_1.window.staticsVersion));
        var parentSize = '';
        try {
            parentSize =
                ' psw' +
                    pro_gallery_lib_1.window.top.screen.width +
                    ' piw' +
                    pro_gallery_lib_1.window.top.innerWidth +
                    ' pbw' +
                    pro_gallery_lib_1.window.top.document.body.clientWidth;
        }
        catch (e) {
            //not on the domain
        }
        var debugMsg = (react_1.default.createElement("div", { className: "version-header " },
            pro_gallery_lib_1.utils.isLandscape() ? 'land' : 'port',
            " sw",
            pro_gallery_lib_1.window.screen.width,
            "sh",
            pro_gallery_lib_1.window.screen.height,
            " iw",
            pro_gallery_lib_1.window.innerWidth,
            " bw",
            pro_gallery_lib_1.window.document.body.clientWidth,
            " sr",
            '1',
            "rc",
            this.props.resizeCount,
            " oc",
            this.props.orientationCount,
            " nh",
            this.props.newHeight,
            " lh",
            this.props.lastHeight,
            parentSize,
            "www",
            this.props.maxGalleryWidth));
        return (react_1.default.createElement("div", null,
            version,
            debugMsg));
    };
    return GalleryDebugMessage;
}(galleryComponent_1.GalleryComponent));
exports.default = GalleryDebugMessage;
//# sourceMappingURL=galleryDebugMessage.js.map