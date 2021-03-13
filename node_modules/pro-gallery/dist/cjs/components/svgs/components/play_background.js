"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint-disable */
/* tslint:disable */
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_1 = tslib_1.__importDefault(require("react"));
var play_background = function (_a) {
    var size = _a.size, props = tslib_1.__rest(_a, ["size"]);
    return (react_1.default.createElement("svg", tslib_1.__assign({ viewBox: "0 0 60 60", fill: "currentColor", width: size || "60", height: size || "60" }, props),
        react_1.default.createElement("path", { d: "M30,0c16.6,0,30,13.4,30,30S46.6,60,30,60C13.4,60,0,46.6,0,30S13.4,0,30,0z", fillRule: "evenodd", clipRule: "evenodd" })));
};
play_background.displayName = 'play_background';
play_background.propTypes = {
    size: prop_types_1.default.string
};
exports.default = play_background;
/* tslint:enable */
/* eslint-enable */
//# sourceMappingURL=play_background.js.map