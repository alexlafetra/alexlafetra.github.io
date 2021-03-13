"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var cssScrollHelper_1 = require("../../helpers/cssScrollHelper");
var galleryComponent_1 = require("../../galleryComponent");
var ScrollIndicator = /** @class */ (function (_super) {
    tslib_1.__extends(ScrollIndicator, _super);
    function ScrollIndicator(props) {
        var _this = _super.call(this) || this;
        _this.state = {
            scrollTop: 0,
            scrollLeft: 0,
        };
        _this.debouncedOnScroll = pro_gallery_lib_1.utils.debounce(props.onScroll, 50);
        return _this;
    }
    ScrollIndicator.prototype.removeScrollListener = function () {
        if (this.scrollEventListenerSet) {
            var scrollingElement = this.props.scrollingElement;
            try {
                scrollingElement
                    .vertical()
                    .removeEventListener('scroll', this.onVerticalScroll);
            }
            catch (e) {
                //
            }
            try {
                var oneRow = this.props.oneRow;
                if (oneRow) {
                    scrollingElement
                        .horizontal()
                        .removeEventListener('scroll', this.onHorizontalScroll);
                }
            }
            catch (e) {
                //
            }
            this.scrollEventListenerSet = false;
        }
    };
    ScrollIndicator.prototype.initScrollListener = function () {
        var _this = this;
        if (this.scrollEventListenerSet) {
            this.removeScrollListener();
        }
        this.scrollEventListenerSet = true;
        var scrollingElement = this.props.scrollingElement;
        //Horizontal Scroll
        this.onHorizontalScrollTransition = function (_a) {
            var detail = _a.detail;
            var step = Math.round(detail);
            if (step >= 0) {
                if (_this.props.oneRow) {
                    _this.setState({
                        scrollTop: _this.state.scrollTop + step,
                        scrollLeft: _this.state.scrollLeft + step,
                    });
                }
            }
        };
        this.onHorizontalScroll = function (e) {
            _this.props.setGotFirstScrollIfNeeded();
            var target = e.currentTarget || e.target || e;
            var top = target && (target.scrollY || target.scrollTop || target.y);
            var left = target && (target.scrollX || target.scrollLeft || target.x);
            if (_this.props.isRTL) {
                left = Math.abs(left); //this.props.totalWidth - left;
            }
            // console.log('[RTL SCROLL] onHorizontalScroll: ', left);
            if (left >= 0) {
                if (_this.props.oneRow) {
                    _this.setState({
                        scrollTop: left,
                        scrollLeft: left,
                    });
                    _this.props.getMoreItemsIfNeeded(left);
                    _this.debouncedOnScroll({ top: top, left: left });
                }
            }
        };
        try {
            scrollingElement
                .horizontal()
                .addEventListener('scroll', this.onHorizontalScroll);
            scrollingElement
                .horizontal()
                .addEventListener('scrollTransition', this.onHorizontalScrollTransition);
        }
        catch (e) {
            //
        }
        //Vertical Scroll
        this.onVerticalScroll = function (e) {
            _this.props.setGotFirstScrollIfNeeded();
            var target = e.currentTarget || e.target || e;
            var top = target && (target.scrollY || target.scrollTop || target.y);
            var left = target && (target.scrollX || target.scrollLeft || target.x);
            if (_this.props.isRTL) {
                left = _this.props.totalWidth - left;
            }
            // console.log('[RTL SCROLL] onVerticalScroll: ', left);
            if (top >= 0) {
                if (!_this.props.oneRow) {
                    _this.setState({
                        scrollTop: top,
                    });
                    _this.props.getMoreItemsIfNeeded(top);
                    _this.debouncedOnScroll({ top: top, left: left });
                }
            }
        };
        try {
            scrollingElement
                .vertical()
                .addEventListener('scroll', this.onVerticalScroll);
        }
        catch (e) {
            //
        }
    };
    ScrollIndicator.prototype.componentWillUnmount = function () {
        this.removeScrollListener();
    };
    ScrollIndicator.prototype.componentDidMount = function () {
        this.initScrollListener();
    };
    ScrollIndicator.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        var didChange = false;
        for (var _i = 0, _a = [
            'domId',
            'oneRow',
            'isRTL',
            'totalWidth',
            'scrollBase',
        ]; _i < _a.length; _i++) {
            var prop = _a[_i];
            if (nextProps[prop] !== this.props[prop]) {
                didChange = true;
                break;
            }
        }
        if (didChange) {
            this.initScrollListener();
        }
    };
    ScrollIndicator.prototype.render = function () {
        var verticalScrollBase = !this.props.oneRow && this.props.scrollBase > 0
            ? this.props.scrollBase
            : 0;
        var scrollTopWithoutBase = this.state.scrollTop - verticalScrollBase;
        var domId = this.props.domId;
        return (react_1.default.createElement("div", { key: "css-scroll-indicator", "data-hook": "css-scroll-indicator", "data-scroll-base": verticalScrollBase, "data-scroll-top": this.state.scrollTop, className: cssScrollHelper_1.cssScrollHelper.calcScrollClasses(domId, scrollTopWithoutBase), style: { display: 'none' } }));
    };
    return ScrollIndicator;
}(galleryComponent_1.GalleryComponent));
exports.default = ScrollIndicator;
//# sourceMappingURL=galleryScrollIndicator.js.map