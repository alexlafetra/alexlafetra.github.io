import React from 'react';
import ReactDOM from 'react-dom';

import { ProGallery } from 'pro-gallery';
import 'pro-gallery/dist/statics/main.css';

export function Gallery() {
// Add your images here...
const items = [{
        itemId: 'sample-id',
        mediaUrl: 'images/drawings/IMG_4029.jpeg',
        metaData: {
            type: 'image',
            height: 300,
            width: 300,
            title: 'sample-title',
            description: 'sample-description',
            focalPoint: [0, 0],
            link: {
                url: 'images/drawings/IMG_4029.jpeg',
                target: '_blank'
            }
        }
    },
]
// The options of the gallery (from the playground current state)
const options = {
  galleryLayout: 2,
};

// The size of the gallery container. The images will fit themselves in it
const container = {
  width: window.innerWidth,
  height: window.innerHeight
};

// The eventsListener will notify you anytime something has happened in the gallery.
const eventsListener = (eventName, eventData) => console.log({eventName, eventData}); 

// The scrollingElement is usually the window, if you are scrolling inside another element, suplly it here
const scrollingElement = window;

return (
  <ProGallery
    items={items}
    options={options}
    container={container}
    eventsListener={eventsListener}
    scrollingElement={scrollingElement}
  />
);
}

// Enjoy using your new gallery!
// For more options, visit https://github.com/wix/pro-gallery

ReactDOM.render(Gallery(), document.getElementById("col-gallery"));
