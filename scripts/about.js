const $intro = document.getElementsByClassName('intro')[0]
const $unicorn = $intro.getElementsByClassName('unicorn')[0].getElementsByTagName('IMG')[0]
const $values = document.getElementsByClassName('values')[0]
const $valueH1s = Array.prototype.slice.call($values.getElementsByTagName('H1'))
const $about = document.querySelector('.about')

const IS_MOBILE = 'ontouchstart' in window

const round = (num) => {
  return Math.floor(num / INCREMENT) * INCREMENT
}

const rand = (max) => {
  return round((Math.random() * max) - max/2)
}

const loadImages = () => {
  const $images = Array.prototype.slice.call(document.getElementsByTagName('IMG'))
  $images.forEach($image => {
    $image.addEventListener('load', () => $image.classList.add('is-loaded'))
    ImageLoader.load($image, { useAdvancedPositioning: true, mode: 'cover' })
  })
}

$valueH1s.forEach(($h1, i) => {
  $h1.dataset.number = i
})

let queuedDestination = null
const INCREMENT = 1
const lastDestination = { x: 0, y: 0 }
let vw = window.innerWidth
let vh = window.innerHeight
loadImages()

window.addEventListener('resize', () => {
  vw = window.innerWidth
  vh = window.innerHeight
  loadImages()
})

if (IS_MOBILE) {
  $intro.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) return
    const touch = e.touches[0]
    queuedDestination = { x: round(touch.clientX - vw/2), y: round(touch.clientY - vh/2) }
  })
} else {
  $intro.addEventListener('mousemove', (e) => {
    queuedDestination = { x: round(e.clientX - vw/2), y: round(e.clientY - vh/2) }
  })
}

const animateUnicorn = () => {
  let { x, y } = lastDestination
  let q = queuedDestination

  if (!q || q.x === x && q.y === y) {
    queuedDestination = { x: rand(vw/3), y: rand(vh/3) }
    return
  }

  if (q.x !== x) {
    x = q.x > x ? x + INCREMENT : x - INCREMENT
  }
  if (q.y !== y) {
    y = q.y > y ? y + INCREMENT : y - INCREMENT
  }

  lastDestination.x = x
  lastDestination.y = y

  $unicorn.style.transform = `translate3d(${x}px,${y}px,0)`
}

let lastFrame = performance.now()

const animate = () => {
  const now = performance.now()
  if (now - lastFrame < 50) {
    // don't do anything
  } else {
    lastFrame = now
    animateUnicorn()
  }

  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
