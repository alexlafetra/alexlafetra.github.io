export default VideoScrollHelperWrapper;
declare class VideoScrollHelperWrapper {
    constructor(setPlayingIdxState: any);
    setPlayingIdxState: any;
    handleEvent: () => void;
    trigger: {
        SCROLL: () => void;
        INIT_SCROLL: () => void;
    };
    stop: () => void;
    initializePlayState: () => void;
    initVideoScrollHelperIfNeeded(galleryStructureData: any, items: any): void;
    updateGalleryStructure(scrollHelperNewGalleryStructure: any, shouldTryToInit: any, items: any): void;
}
