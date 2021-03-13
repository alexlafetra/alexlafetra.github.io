"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var imageItem_1 = tslib_1.__importDefault(require("../imageItem"));
var play_background_1 = tslib_1.__importDefault(require("../../svgs/components/play_background"));
var play_triangle_1 = tslib_1.__importDefault(require("../../svgs/components/play_triangle"));
var videoItemPlaceholder_1 = tslib_1.__importDefault(require("./videoItemPlaceholder"));
var videoControls = [
    react_1.default.createElement("i", { key: "play-triangle", "data-hook": "play-triangle", className: 'gallery-item-video-play-triangle play-triangle ' },
        react_1.default.createElement(play_triangle_1.default, null)),
    react_1.default.createElement("i", { key: "play-bg", "data-hook": "play-background", className: 'gallery-item-video-play-background play-background ' },
        react_1.default.createElement(play_background_1.default, null)),
];
var VideoItemWrapper = /** @class */ (function (_super) {
    tslib_1.__extends(VideoItemWrapper, _super);
    function VideoItemWrapper(props) {
        var _this = _super.call(this, props) || this;
        _this.mightPlayVideo = _this.mightPlayVideo.bind(_this);
        _this.createVideoItemPlaceholder = _this.createVideoItemPlaceholder.bind(_this);
        _this.state = { VideoItemLoaded: false };
        return _this;
    }
    VideoItemWrapper.prototype.mightPlayVideo = function () {
        var _a = this.props.styleParams, videoPlay = _a.videoPlay, itemClick = _a.itemClick;
        var hasLink = this.props.hasLink;
        if (this.props.isVideoPlaceholder) {
            return false;
        }
        if (videoPlay === 'hover' || videoPlay === 'auto') {
            return true;
        }
        else if (itemClick === 'nothing') {
            return true;
        }
        else if (itemClick === 'link' && !hasLink) {
            return true;
        }
        // }
        return false;
    };
    VideoItemWrapper.prototype.createVideoItemPlaceholder = function (showVideoControls) {
        var props = pro_gallery_lib_1.utils.pick(this.props, [
            'alt',
            'title',
            'description',
            'id',
            'idx',
            'styleParams',
            'createUrl',
            'settings',
            'actions',
        ]);
        return (react_1.default.createElement(videoItemPlaceholder_1.default, tslib_1.__assign({}, props, { key: "videoPlaceholder", imageDimensions: this.props.imageDimensions, isThumbnail: !!this.props.thumbnailHighlightId, id: this.props.idx, videoControls: showVideoControls && !this.mightPlayVideo() && videoControls })));
    };
    VideoItemWrapper.prototype.componentDidMount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var VideoItem, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!pro_gallery_lib_1.isEditMode()) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return tslib_1.__importStar(require(
                            /* webpackChunkName: "proGallery_videoItem" */ './videoItem')); })];
                    case 2:
                        VideoItem = _a.sent();
                        this.VideoItem = VideoItem.default;
                        if (this.mightPlayVideo()) {
                            this.setState({ VideoItemLoaded: true });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error('Failed to fetch VideoItem');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VideoItemWrapper.prototype.render = function () {
        var hover = this.props.hover;
        var showVideoControls = !this.props.hidePlay && this.props.styleParams.showVideoPlayButton;
        var videoPlaceholder = this.createVideoItemPlaceholder(showVideoControls);
        var VideoItem = this.VideoItem;
        if (!this.mightPlayVideo() || !VideoItem) {
            return [videoPlaceholder, hover];
        }
        return (react_1.default.createElement(VideoItem, tslib_1.__assign({}, this.props, { videoPlaceholder: videoPlaceholder, videoControls: showVideoControls && videoControls })));
    };
    return VideoItemWrapper;
}(imageItem_1.default));
exports.default = VideoItemWrapper;
//# sourceMappingURL=videoItemWrapper.js.map