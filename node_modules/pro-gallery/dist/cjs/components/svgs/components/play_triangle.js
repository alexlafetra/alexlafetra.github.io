"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint-disable */
/* tslint:disable */
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_1 = tslib_1.__importDefault(require("react"));
var play_triangle = function (_a) {
    var size = _a.size, props = tslib_1.__rest(_a, ["size"]);
    return (react_1.default.createElement("svg", tslib_1.__assign({ viewBox: "0 0 60 60", fill: "currentColor", width: size || "60", height: size || "60" }, props),
        react_1.default.createElement("path", { d: "M41.5,30l-17,10V20L41.5,30z" })));
};
play_triangle.displayName = 'play_triangle';
play_triangle.propTypes = {
    size: prop_types_1.default.string
};
exports.default = play_triangle;
/* tslint:enable */
/* eslint-enable */
//# sourceMappingURL=play_triangle.js.map