"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var itemView_js_1 = tslib_1.__importDefault(require("../item/itemView.js"));
var galleryComponent_1 = require("../galleryComponent");
var GroupView = /** @class */ (function (_super) {
    tslib_1.__extends(GroupView, _super);
    function GroupView(props) {
        var _this = _super.call(this, props) || this;
        _this.displayName = 'GroupView';
        _this.dom = [];
        _this.state = {};
        return _this;
    }
    GroupView.prototype.createDom = function (visible) {
        var _this = this;
        return this.props.items.map(function (item) {
            return react_1.default.createElement(itemView_js_1.default, tslib_1.__assign(tslib_1.__assign({}, item.renderProps(tslib_1.__assign(tslib_1.__assign({}, _this.props.galleryConfig), { visible: visible }))), _this.props.itemsLoveData[item.id]));
        });
    };
    GroupView.prototype.shouldRender = function () {
        var items = this.props.items;
        if (!items || !items.length || !items[0]) {
            return false;
        }
        return true;
    };
    GroupView.prototype.isVisible = function () {
        var _a = this.props, items = _a.items, galleryConfig = _a.galleryConfig;
        if (this.props.allowLoop) {
            var idx = items[items.length - 1].idx;
            var currentIdx = galleryConfig.currentIdx, totalItemsCount = galleryConfig.totalItemsCount;
            var distance = currentIdx - idx;
            var padding = Math.floor(totalItemsCount / 2);
            return Math.abs(distance) <= padding;
        }
        return true;
    };
    GroupView.prototype.render = function () {
        return this.shouldRender() ? (react_1.default.createElement("div", { key: "group_" + this.props.idx + "_" + this.props.items[0].id, "data-hook": 'group-view', "aria-hidden": this.props.ariaHidden }, this.createDom(this.isVisible()))) : null;
    };
    return GroupView;
}(galleryComponent_1.GalleryComponent));
exports.default = GroupView;
//# sourceMappingURL=groupView.js.map