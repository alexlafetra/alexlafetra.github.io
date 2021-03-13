"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pro_gallery_lib_1 = require("pro-gallery-lib");
var emptyLayout = {
    galleryType: undefined,
    groupSize: undefined,
    showArrows: undefined,
    cubeImages: undefined,
    cubeType: undefined,
    cubeRatio: undefined,
    isVertical: undefined,
    gallerySize: undefined,
    collageAmount: undefined,
    collageDensity: undefined,
    groupTypes: undefined,
    oneRow: undefined,
    imageMargin: undefined,
    galleryMargin: undefined,
    scatter: undefined,
    rotatingScatter: undefined,
    chooseBestGroup: undefined,
    smartCrop: undefined,
    hasThumbnails: undefined,
    enableScroll: undefined,
    isGrid: undefined,
    isSlider: undefined,
    isColumns: undefined,
    isSlideshow: undefined,
    cropOnlyFill: undefined,
    fixedColumns: undefined,
    enableInfiniteScroll: undefined,
};
function getStyleByGalleryType(styles) {
    //legacy layouts
    var galleryType = styles.galleryType, gallerySize = styles.gallerySize;
    var galleryTypes = {
        collage_ver: function () { return ({
            cubeImages: false,
            isVertical: true,
            galleryType: 'Columns',
            groupSize: 3,
            groupTypes: '1,2h,2v,3t,3b,3l,3r',
            targetItemSize: Math.round(gallerySize * 5 + 500),
            fixedColumns: 0,
        }); },
        collage_hor: function () { return ({
            cubeImages: false,
            isVertical: false,
            galleryType: 'Strips',
            groupSize: 3,
            groupTypes: '1,2h,2v,3t,3b,3l,3r',
            targetItemSize: Math.round(gallerySize * 5 + 500),
            fixedColumns: 0,
        }); },
        grid: function () { return ({
            cubeImages: true,
            isVertical: true,
            galleryType: 'Columns',
            groupSize: 1,
            groupTypes: '1',
            targetItemSize: Math.round(gallerySize * 8.5 + 150),
            fixedColumns: 0,
            isGrid: true,
        }); },
        masonry_ver: function () { return ({
            cubeImages: false,
            isVertical: true,
            galleryType: 'Columns',
            groupSize: 1,
            groupTypes: '1',
            targetItemSize: Math.round(gallerySize * 8 + 200),
            fixedColumns: 0,
        }); },
        masonry_hor: function () { return ({
            cubeImages: false,
            isVertical: false,
            galleryType: 'Strips',
            groupSize: 1,
            groupTypes: '1',
            targetItemSize: Math.round(gallerySize * 5 + 200),
            fixedColumns: 0,
        }); },
        one_col: function () { return ({
            cubeImages: false,
            isVertical: true,
            galleryType: 'Columns',
            groupSize: 1,
            groupTypes: '1',
            targetItemSize: function () { return pro_gallery_lib_1.dimensionsHelper.getGalleryWidth(); },
            fixedColumns: 1,
        }); },
        one_row: function () { return ({
            cubeImages: false,
            isVertical: false,
            galleryType: 'Strips',
            groupSize: 1,
            groupTypes: '1',
            targetItemSize: function () { return pro_gallery_lib_1.dimensionsHelper.getGalleryHeight(); },
            fixedColumns: 0,
        }); },
        slideshow: function () { return ({
            showArrows: true,
            cubeImages: true,
            cubeRatio: function () { return pro_gallery_lib_1.dimensionsHelper.getGalleryRatio(); },
            isVertical: true,
            targetItemSize: function () { return pro_gallery_lib_1.dimensionsHelper.getGalleryWidth(); },
            galleryType: 'Columns',
            groupSize: 1,
            groupTypes: '1',
            fixedColumns: 1,
        }); },
    };
    var styleState;
    switch (galleryType) {
        case '-1': //empty
            styleState = {};
            break;
        case '0': //vertical collage
            styleState = galleryTypes.collage_ver();
            break;
        default:
        case '1': //horizontal collage
            styleState = galleryTypes.collage_hor();
            break;
        case '2': //grid
            styleState = galleryTypes.grid();
            break;
        case '3': //vertical masonry
            styleState = galleryTypes.masonry_ver();
            break;
        case '4': //horizontal masonry
            styleState = galleryTypes.masonry_hor();
            break;
        case '5': //one column
            styleState = galleryTypes.one_col();
            break;
        case '6': //one row
            styleState = galleryTypes.one_row();
            break;
        case '7': //slideshow
            styleState = galleryTypes.slideshow();
            break;
    }
    return styleState;
}
function addLayoutStyles(styles, customExternalInfoRendererExists) {
    var galleryLayoutV1 = styles.galleryType;
    var galleryLayoutV2 = styles.galleryLayout;
    if (!pro_gallery_lib_1.utils.isUndefined(galleryLayoutV1) &&
        pro_gallery_lib_1.utils.isUndefined(galleryLayoutV2)) {
        //legacy layouts - only if galleyrType parameter is specifically defined (i.e. layout had changed)
        styles = Object.assign(styles, getStyleByGalleryType(styles)); //legacy layouts
        styles.layoutsVersion = 1;
        var selectedLayoutVars = [
            'galleryType',
            'galleryThumbnailsAlignment',
            'magicLayoutSeed',
            'cubeType',
            'isVertical',
            'scrollDirection',
            'enableInfiniteScroll',
        ];
        styles.selectedLayout = selectedLayoutVars
            .map(function (key) { return String(styles[key]); })
            .join('|');
    }
    else {
        //new layouts
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Using galleryLayout for defaults', styles);
        }
        styles = Object.assign({}, emptyLayout, styles);
        var selectedLayoutVars = [
            'galleryLayout',
            'galleryThumbnailsAlignment',
            'magicLayoutSeed',
            'cubeType',
            'isVertical',
            'scrollDirection',
            'enableInfiniteScroll',
        ];
        styles.selectedLayout = selectedLayoutVars
            .map(function (key) { return String(styles[key]); })
            .join('|');
        styles.layoutsVersion = 2;
        styles.selectedLayoutV2 = galleryLayoutV2;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('new selected layout', styles.selectedLayout);
        }
    }
    styles = Object.assign(styles, pro_gallery_lib_1.processLayouts(styles, customExternalInfoRendererExists));
    return styles;
}
exports.default = addLayoutStyles;
//# sourceMappingURL=layoutHelper.js.map