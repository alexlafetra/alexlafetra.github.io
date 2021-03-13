"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint-disable */
/* tslint:disable */
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_1 = tslib_1.__importDefault(require("react"));
var pause = function (_a) {
    var size = _a.size, props = tslib_1.__rest(_a, ["size"]);
    return (react_1.default.createElement("svg", tslib_1.__assign({ viewBox: "0 0 10 14", fill: "currentColor", width: size || "10", height: size || "14" }, props),
        react_1.default.createElement("g", { id: "final", stroke: "none", fill: "none", strokeWidth: "1", fillRule: "evenodd" },
            react_1.default.createElement("g", { id: "Play", transform: "translate(-490 -763)", fill: "currentColor" },
                react_1.default.createElement("g", { id: "Group-2", transform: "translate(470 284)" },
                    react_1.default.createElement("g", { id: "Group", transform: "translate(20 479)" },
                        react_1.default.createElement("path", { d: "M7,0 L10,0 L10,14 L7,14 L7,0 Z M0,0 L3,0 L3,14 L0,14 L0,0 Z", id: "_copy_3" })))))));
};
pause.displayName = 'pause';
pause.propTypes = {
    size: prop_types_1.default.string
};
exports.default = pause;
/* tslint:enable */
/* eslint-enable */
//# sourceMappingURL=pause.js.map