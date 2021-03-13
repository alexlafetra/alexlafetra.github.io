export const cssScrollHelper: CssScrollHelper;
declare class CssScrollHelper {
    pgScrollSteps: number[];
    pgScrollClassName: string;
    screenSize: number;
    scrollCss: any[];
    scrollCssProps: any[];
    calcScrollPaddings(): void;
    allPagePadding: (() => number[]) | undefined;
    inScreenPadding: (() => number[]) | undefined;
    aboveScreenPadding: (() => number[]) | undefined;
    justBelowScreenPadding: ((itemHeight: any) => number[]) | undefined;
    justBelowAndAboveScreenPadding: (() => number[]) | undefined;
    justBelowAndInScreenPadding: (() => number[]) | undefined;
    belowScreenPadding: (() => number[]) | undefined;
    highResPadding: (() => number[]) | undefined;
    lowResPadding: (() => number[]) | undefined;
    getSellectorDomId({ id, idx }: {
        id: any;
        idx: any;
    }): string;
    buildScrollClassName(domId: any, idx: any, val: any): string;
    calcScrollClasses(domId: any, scrollTop: any): string;
    calcScrollCss({ domId, items, styleParams, container }: {
        domId: any;
        items: any;
        styleParams: any;
        container: any;
    }): any;
    minHeight: number | undefined;
    maxHeight: number | undefined;
    shouldCalcScrollCss({ type }: {
        type: any;
    }): boolean;
    createScrollSelectorsFunction({ domId, item, styleParams }: {
        domId: any;
        item: any;
        styleParams: any;
    }): (padding: any, suffix: any) => string;
    calcScrollCssForItem({ domId, item, styleParams }: {
        domId: any;
        item: any;
        styleParams: any;
    }): any;
    createScrollAnimationsIfNeeded({ idx, styleParams, createScrollSelectors }: {
        idx: any;
        styleParams: any;
        createScrollSelectors: any;
    }): string;
}
export {};
