"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint-disable */
/* tslint:disable */
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
var react_1 = tslib_1.__importDefault(require("react"));
var play = function (_a) {
    var size = _a.size, props = tslib_1.__rest(_a, ["size"]);
    return (react_1.default.createElement("svg", tslib_1.__assign({ viewBox: "0 0 11 14", fill: "currentColor", width: size || "11", height: size || "14" }, props),
        react_1.default.createElement("g", { id: "final", stroke: "none", fill: "none", strokeWidth: "1", fillRule: "evenodd" },
            react_1.default.createElement("g", { id: "Pause", transform: "translate(-490 -763)", fill: "currentColor" },
                react_1.default.createElement("g", { id: "Group-2", transform: "translate(470 284)" },
                    react_1.default.createElement("g", { id: "Group", transform: "translate(20 479)" },
                        react_1.default.createElement("path", { id: "play", d: "M0.0788076641 0L0 14 10.5 6.81856071z" })))))));
};
play.displayName = 'play';
play.propTypes = {
    size: prop_types_1.default.string
};
exports.default = play;
/* tslint:enable */
/* eslint-enable */
//# sourceMappingURL=play.js.map