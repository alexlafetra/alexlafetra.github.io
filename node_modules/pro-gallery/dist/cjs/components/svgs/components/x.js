"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint-disable */
/* tslint:disable */
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_1 = tslib_1.__importDefault(require("react"));
var x = function (_a) {
    var size = _a.size, props = tslib_1.__rest(_a, ["size"]);
    return (react_1.default.createElement("svg", tslib_1.__assign({ viewBox: "0 0 15 15", fill: "currentColor", width: size || "15", height: size || "15" }, props),
        react_1.default.createElement("path", { d: "M15 0.6L14.4 0 7.5 6.9 0.6 0 0 0.6 6.9 7.5 0 14.4 0.6 15 7.5 8.1 14.4 15 15 14.4 8.1 7.5z", fillRule: "evenodd", clipRule: "evenodd" })));
};
x.displayName = 'x';
x.propTypes = {
    size: prop_types_1.default.string
};
exports.default = x;
/* tslint:enable */
/* eslint-enable */
//# sourceMappingURL=x.js.map