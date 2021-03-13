'use strict';

import { ProGallery } from 'pro-gallery';
import 'pro-gallery/dist/statics/main.css';

export function Gallery() {
  // Add your images here...
  var items = [{
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
  }];
  // The options of the gallery (from the playground current state)
  var options = {
    galleryLayout: 2
  };

  // The size of the gallery container. The images will fit themselves in it
  var container = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // The eventsListener will notify you anytime something has happened in the gallery.
  var eventsListener = function eventsListener(eventName, eventData) {
    return console.log({ eventName: eventName, eventData: eventData });
  };

  // The scrollingElement is usually the window, if you are scrolling inside another element, suplly it here
  var scrollingElement = window;

  return React.createElement(ProGallery, {
    items: items,
    options: options,
    container: container,
    eventsListener: eventsListener,
    scrollingElement: scrollingElement
  });
}

// Enjoy using your new gallery!
// For more options, visit https://github.com/wix/pro-gallery

//selecting id to insert react component
//rendering react component
ReactDOM.render(React.createElement(Gallery, null), document.getElementById("gallery"));