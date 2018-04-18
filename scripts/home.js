const BaseSlideshow = require('./lib/BaseSlideshow')

const $hero = document.getElementsByClassName('hero')[0]
const $mentions = document.getElementsByClassName('mentions')[0]
const $layers = document.getElementsByClassName('layers')[0]
const $scene = document.getElementsByClassName('scene')[0]
const $glyph = document.getElementsByClassName('glyph')[0]
const $animation = document.getElementsByClassName('animation')[0]
const $imgs = document.getElementsByTagName('IMG')[0]
const $videos = document.getElementsByTagName('VIDEO')
const $heroVideo = $hero.getElementsByTagName('VIDEO')[0]
const $playVideoButton = document.getElementsByClassName('play-video-button')[0]
const $videoIframe = document.getElementsByClassName('video-iframe')[0]
const $videoIframeClose = $videoIframe.getElementsByClassName('close')[0]

// const baseSlideshow = new BaseSlideshow({
//   slideshowRef: $mentions,
//   childSelector: '.mention',
//   numOfClones: 1
// })

// window.addEventListener('visibilitychange', () => {
//   if (document.visibilityState === 'hidden') {
//     baseSlideshow.stop()
//   }

//   if (document.visibilityState === 'visible') {
//     baseSlideshow.play()
//   }
// })

if ($heroVideo.complete) {
  $hero.classList.remove('is-loading')
} else {
  $heroVideo.addEventListener('loadeddata', () => {
    $hero.classList.remove('is-loading')
  })
}

$playVideoButton.addEventListener('click', () => {
  $videoIframe.classList.add('is-active')
  document.body.classList.add('locked')
})

$videoIframeClose.addEventListener('click', () => {
  $videoIframe.classList.remove('is-active')
  document.body.classList.remove('locked')
})

// window.addEventListener('resize', () => {
//   if (window.zoomedIn) {
//     $animation.classList.add('locked-in')
//     document.body.classList.remove('locked')
//   }
// })

// const promises = [].slice.call($imgs).map($img => {
//   return new Promise(resolve => {
//     if ($img.complete) {
//       return resolve()
//     }
//     $img.addEventListener('load', resolve)
//   })
// })

// window.addEventListener('DOMContentLoaded', () => {
//   scrollTo(0,0)
//   setTimeout(() => {
//     document.body.classList.add('locked')
//     scrollTo(0,0)
//   }, 1000)
// })

// Promise.all(promises)
// .then(() => {
//   $hero.classList.remove('is-loading')

//   setTimeout(() => {
//     const handleTransitionEnd = (e) => {
//       if (e.propertyName !== 'transform') return
//       if (e.target !== $animation) return
//       $animation.removeEventListener('transitionend', handleTransitionEnd)

//       ;[].slice.call($videos).forEach($vid => {
//         $vid.setAttribute('autoplay', true)
//         $vid.play()
//       })

//       document.body.classList.remove('locked')
//     }

//     $animation.addEventListener('transitionend', handleTransitionEnd)
//     $animation.classList.add('zoomed-out')
//     window.zoomedIn = true
//   }, 5000)
// })

// const dur = 5000
// const first = Date.now()
// const end = dur

// const animate = () => {
//   const now = Date.now()
//   const diff = now - first
//   const progress = diff / dur
//   if (progress > 1) return

//   const animationX = progress * (13)
//   const animationY = -1.8
//   const layersScale = 1 - (progress * (1 - 0.02))
//   const glyphScale = 1.6 - (progress * (1.6 - 0.02))
//   const sceneOpacity = 1 - (progress * (1 - 0))

//   $animation.style.transform = `translate3d(${animationX}vw, ${animationY}vw, 0)`
//   $layers.style.transform = `scale(${layersScale})`
//   $glyph.style.transform = `scale(${glyphScale})`
//   $scene.style.opacity = sceneOpacity
//   requestAnimationFrame(animate)
// }

// requestAnimationFrame(animate)
