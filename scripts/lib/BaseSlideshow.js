const DEFAULT_CONFIG = {
  slideshowRef: null,
  childSelector: '.slide',
  numOfClones: 0,
  slideInterval: 3000,
  shouldAutoplay: true,
  handleChange: null,
  startIndex: 0,
  shouldAutoInitialize: true
}

/**
 * A base gallery that coveres autoplaying, forward/backward movement, and clones.
 * This is the most basic of bases.
 *
 * @param config: {
 *   slideshowRef {DOMElement}      | The container element. [REQUIRED]
 *   childSelector {String}         | The selector for each element that should be updated. (will override)
 *   numOfClones {Number}           | How many clones we should make.
 *   slideInterval {Number}         | Number of milliseconds during a single slide
 *   shouldAutoplay {Boolean}       | Should it autoplay?
 *   handleChange {Function}        | Callback method supplied with the index, index including clones, and direction.
 *   slideInterval {Number}         | Index of slide to start at.
 *   shoudlAutoInitialize {Boolean} | Call the initialize() method directly from the constructor.
 * }
**/

class BaseSlideshow {
  constructor( config ) {
    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    if (this.config.shouldAutoInitialize) {
      this.initialize()
    }
  }

  initialize() {
    const { slideshowRef, childSelector, numOfClones, shouldAutoplay, startIndex } = this.config

    this.childRefs = Array.from( slideshowRef.querySelectorAll( childSelector ))
    this.numOfOriginalChildren = this.childRefs.length
    this.numOfAllChildren = this.numOfOriginalChildren * (numOfClones + 1)
    this.forceStop = false
    this.requestedIndex = null

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.play = this.play.bind(this)
    this.stop = this.stop.bind(this)

    this.makeClones()
    this.goToIndex(startIndex)
    slideshowRef.classList.add( 'is-initialized' )

    if ( shouldAutoplay ) {
      this.play()
    }
  }

  makeClones() {
    for (let i = 0; i < this.config.numOfClones; i++) {
      this.childRefs.forEach(( childRef ) => {
        const clone = childRef.cloneNode( true )
        childRef.parentNode.appendChild( clone )
        this.childRefs.push(clone)
      })
    }
  }

  // Get the index not including clones.
  getOriginal(index) {
    return index % this.numOfOriginalChildren
  }

  // Instead of going directly to an index, travel the shortest distance, one index
  // at a time, until you get there. This lets you do things like flip-through
  // transitions and also prevents directional mix-ups.
  requestIndex(index, timeout = 0) {
    this.requestedIndex = index
    const distance = this.getOriginal(index) - this.getOriginal(this.index)

    if (distance === 0) {
      this.goToIndex(index)
      return
    }

    const move = distance < 0 ? this.prev : this.next

    let count = Math.abs(distance)

    const requestMove = () => {
      if (count > 0) {
        count -= 1
        setTimeout(() => {
          if (this.requestedIndex === index) {
            requestAnimationFrame(move)
            requestMove()
          }
        }, timeout)
      }
    }

    requestMove()
  }

  // Go directly to a new index.
  goToIndex( index ) {
    this.index = index
    this.nextIndex = (this.index + 1) % this.numOfAllChildren
    this.prevIndex = (this.index - 1 + this.numOfAllChildren) % this.numOfAllChildren

    this.updateChildren()

    if (this.config.shouldAutoplay && !this.forceStop) {
      this.play()
    }
  }

  next() {
    this.goToIndex(this.nextIndex)
  }

  prev() {
    this.goToIndex(this.prevIndex)
  }

  updateChildren( direction ) {
    if ( this.config.handleChange && typeof this.config.handleChange === 'function' ) {
      this.config.handleChange( this.getOriginal(this.index), this.index, direction )
    }

    this.childRefs.forEach(( $child, i ) => {
      const distFromIndex = Math.abs( this.index - i )
      const distFromEnd = this.numOfAllChildren - distFromIndex

      const arrivalIndex = i >= this.index ? distFromIndex : distFromEnd
      const departureIndex = i <= this.index ? distFromIndex : distFromEnd

      $child.dataset.arrivalIndex = arrivalIndex
      $child.dataset.departureIndex = departureIndex
    })
  }

  /* Play! :) */
  play() {
    clearTimeout( this.timeout )
    this.timeout = setTimeout( this.next, this.config.slideInterval )
  }

  /* Stop! (in the naaaame of love)
   */
  stop() {
    this.forceStop = true
    clearTimeout( this.timeout )
  }
}

module.exports = BaseSlideshow
