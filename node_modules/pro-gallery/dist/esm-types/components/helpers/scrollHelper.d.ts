export function scrollToItemImp(scrollParams: any): Promise<any>;
export function scrollToGroupImp(scrollParams: any): Promise<any>;
export function isWithinPaddingHorizontally({ target, left, right, screenWidth, padding, }: {
    target: any;
    left: any;
    right: any;
    screenWidth: any;
    padding: any;
}): boolean;
export function isWithinPaddingVertically({ target, scrollBase, top, bottom, screenHeight, padding, }: {
    target: any;
    scrollBase: any;
    top: any;
    bottom: any;
    screenHeight: any;
    padding: any;
}): boolean;
