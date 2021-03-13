"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var prop_types_1 = tslib_1.__importDefault(require("prop-types"));
exports.default = {
    items: prop_types_1.default.array.isRequired,
    container: prop_types_1.default.object.isRequired,
    domId: prop_types_1.default.string,
    scrollingElement: prop_types_1.default.any,
    options: prop_types_1.default.object,
    eventsListener: prop_types_1.default.func,
    totalItemsCount: prop_types_1.default.number,
    resizeMediaUrl: prop_types_1.default.func,
};
//# sourceMappingURL=propTypes.js.map