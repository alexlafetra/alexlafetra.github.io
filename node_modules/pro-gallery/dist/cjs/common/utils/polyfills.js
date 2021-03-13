"use strict";
if (!Object.entries) {
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj);
        var i = ownProps.length;
        var resArray = new Array(i); // preallocate the Array
        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }
        return resArray;
    };
}
if (!Object.values) {
    Object.values = function (obj) { return Object.keys(obj).map(function (e) { return obj[e]; }); };
}
//# sourceMappingURL=polyfills.js.map