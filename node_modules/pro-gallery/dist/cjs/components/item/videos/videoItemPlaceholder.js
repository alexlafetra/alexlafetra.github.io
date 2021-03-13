"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var imageItem_1 = tslib_1.__importDefault(require("../imageItem"));
var VideoItemPlaceholder = /** @class */ (function (_super) {
    tslib_1.__extends(VideoItemPlaceholder, _super);
    function VideoItemPlaceholder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoItemPlaceholder.prototype.render = function () {
        var videoControls = this.props.videoControls;
        var VideoPlaceholderContainerClassnames = this.getImageContainerClassNames() + ' video-item gallery-item-video';
        var videoPlaceholderImageRenderer = this.getImageElement();
        var renderedItem = this.getImageContainer(videoPlaceholderImageRenderer, VideoPlaceholderContainerClassnames, videoControls);
        return renderedItem;
    };
    return VideoItemPlaceholder;
}(imageItem_1.default));
exports.default = VideoItemPlaceholder;
//# sourceMappingURL=videoItemPlaceholder.js.map