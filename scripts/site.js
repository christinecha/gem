const core = require('@squarespace/core')
const Lifecycle = require('@squarespace/core/Lifecycle')


// Load all images via Squarespace's Responsive ImageLoader
function loadAllImages() {
  var images = document.querySelectorAll('img[data-src]' );
  for (var i = 0; i < images.length; i++) {
    ImageLoader.load(images[i], {load: true});
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // loadAllImages()
  // Lifecycle.init()
})
