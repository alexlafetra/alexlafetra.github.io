"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var pro_gallery_lib_1 = require("pro-gallery-lib");
var VideoScrollHelperWrapper = /** @class */ (function () {
    function VideoScrollHelperWrapper(setPlayingIdxState) {
        this.setPlayingIdxState = setPlayingIdxState;
        this.handleEvent = function () { };
        this.trigger = { SCROLL: function () { }, INIT_SCROLL: function () { } };
        this.stop = function () { };
        this.initializePlayState = function () { };
    }
    VideoScrollHelperWrapper.prototype.initVideoScrollHelperIfNeeded = function (galleryStructureData, items) {
        var _this = this;
        if (items.some(function (item) {
            return (item.metaData && item.metaData.type === 'video') ||
                (item.metadata && item.metadata.type === 'video');
        })) {
            var videoScrollHelperConfig_1 = {
                setPlayingVideos: pro_gallery_lib_1.isEditMode() ? function () { } : this.setPlayingIdxState,
            };
            Promise.resolve().then(function () { return __importStar(require(
            /* webpackChunkName: "proGallery_videoScrollHelper" */ './videoScrollHelper.js')); }).then(function (VideoScrollHelper) {
                Object.assign(_this, new VideoScrollHelper.default(videoScrollHelperConfig_1));
                _this.updateGalleryStructure(galleryStructureData);
                _this.initializePlayState();
            })
                .catch(function (e) {
                console.error('Failed to load videoScrollHelper. error: ' + e);
            });
        }
    };
    VideoScrollHelperWrapper.prototype.updateGalleryStructure = function (scrollHelperNewGalleryStructure, shouldTryToInit, items) {
        if (shouldTryToInit) {
            this.initVideoScrollHelperIfNeeded(scrollHelperNewGalleryStructure, items);
        }
    };
    return VideoScrollHelperWrapper;
}());
exports.default = VideoScrollHelperWrapper;
//# sourceMappingURL=videoScrollHelperWrapper.js.map