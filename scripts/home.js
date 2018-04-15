const BaseSlideshow = require('./lib/BaseSlideshow')
const Home3d = require('./Home3d')

const $mentions = document.getElementsByClassName('mentions')[0]
const $animation = document.getElementsByClassName('animation')[0]

const baseSlideshow = new BaseSlideshow({
  slideshowRef: $mentions,
  childSelector: '.mention',
  numOfClones: 1
})

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    baseSlideshow.stop()
  }

  if (document.visibilityState === 'visible') {
    baseSlideshow.play()
  }
})

window.addEventListener('resize', () => {
  if (window.zoomedIn) {
    $animation.classList.add('locked-in')
  }
})


setTimeout(() => {
  $animation.classList.add('zoomed-out')
  window.zoomedIn = true
}, 5000)