export default VideoScrollHelper;
declare class VideoScrollHelper {
    constructor(config: any);
    scrollBase: number;
    videoItems: any[];
    currentPlayingIdx: number;
    lastItemCount: number;
    playing: boolean;
    updateGalleryStructure({ galleryStructure, scrollBase, videoPlay, videoLoop, itemClick, oneRow, }: {
        galleryStructure: any;
        scrollBase: any;
        videoPlay: any;
        videoLoop: any;
        itemClick: any;
        oneRow: any;
    }): void;
    initializePlayState(): void;
    onScroll({ top, left }: {
        top: any;
        left: any;
    }): void;
    handleEvent({ eventName, eventData }: {
        eventName: any;
        eventData: any;
    }): void;
    play(idx: any): void;
    stop(indexInVideoItems: any): void;
    isVisible(item: any, { top, left }: {
        top: any;
        left: any;
    }): boolean;
    top: number;
    left: number;
    videoPlay: any;
    itemClick: any;
    setPlayingVideos: any;
    lastVideoPlayed: number;
    trigger: any;
    galleryWidth: any;
    videoLoop: any;
    oneRow: any;
    itemHovered(idx: any): void;
    itemClicked(idx: any): void;
    videoEnded(idx: any): void;
    videoPlayed(idx: any): void;
    videoErrorReported(): void;
    autoPlayNextVideoByRating({ top, left }: {
        top: any;
        left: any;
    }): void;
    calculateCurrentItemPlacement(): number;
    onPlayingIdxChange(): void;
    setPlayingIdx(idx: any): void;
    isCurrentVideoStillVisible({ top, left }: {
        top: any;
        left: any;
    }): boolean;
    shouldAutoPlay(): boolean;
    allowedLoop(): boolean;
    IdxExistsInVideoItems(idx: any): boolean;
}
