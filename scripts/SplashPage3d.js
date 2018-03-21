const THREE = require('three')
const ColladaLoader = require('three-collada-loader')
const Detector = require('./lib/WebGLDetector')
const {
  DESKTOP_COIN_TYPES,
  DESKTOP_COIN_COORDS,
  MOBILE_COIN_TYPES,
  MOBILE_COIN_COORDS
} = require('./constants')

if ( !Detector.webgl ) {
  throw Error()
}

const IS_MOBILE = 'ontouchstart' in window

const getRand = (min, max) => {
  return Math.random() * (max - min) + min
}
class ThreeJsWrapper {
  constructor(coinTypes, coinCoords) {
    this.coinTypes = coinTypes
    this.coinCoords = coinCoords

    this.container = document.getElementById( 'threejs-wrapper' )
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 )
    this.camera.position.set( 10, 1, 0 );
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) )
  	this.scene = new THREE.Scene()

    this.lastSpin = null

    // var size = 10;
    // var divisions = 10;
    // var gridHelper = new THREE.GridHelper( size, divisions );
    // this.scene.add( gridHelper );

    this.clock = new THREE.Clock();

    this.coins = []

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.mousePrev = new THREE.Vector2()

    Promise.all(coinTypes.map(this.loadObject.bind(this)))
    .then((coins) => {
      this.coins = coins

      this.coinBounceRanges = coins.map((c, i) => {
        const diff = getRand(0.05, 0.2)
        return [coinCoords[i][1] - diff, coinCoords[i][1] + diff]
      })

      this.coinDirections = coinTypes.map(() => {
        return { position: 1, rotation: 1, forceRotation: null }
      })

      this.container.classList.add('is-loaded')
    })

  	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 )
  	this.scene.add( ambientLight )
  	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 )
  	directionalLight.position.set( 20, 10, 0 )
  	this.scene.add( directionalLight )

    var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.2 )
    directionalLight2.position.set( 10, 10, 0 )
    this.scene.add( directionalLight2 )

  	this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )
    this.renderer.setClearColor( 0x000000, 0 )
  	this.renderer.setPixelRatio( window.devicePixelRatio )
  	this.renderer.setSize( window.innerWidth, window.innerHeight )
  	this.container.appendChild( this.renderer.domElement )

    this.isFocused = true

    this.onWindowResize = this.onWindowResize.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onVisibilityChange = this.onVisibilityChange.bind(this)

  	window.addEventListener( 'resize', this.onWindowResize, false )
    window.addEventListener( 'mousemove', this.onMouseMove, false )
    window.addEventListener( 'touchmove', this.onTouchMove, false )
    window.addEventListener('visibilitychange', this.onVisibilityChange, false)

    this.animate()
  }

  loadObject(name, i) {
    return new Promise(resolve => {
      const loader = new THREE.ObjectLoader()
      loader.load(`https://s3.amazonaws.com/gem-token-models/${name}.json`, obj => {
        const [x, y, z] = this.coinCoords[i]

        obj.position.set(x,y,z)
        obj.scale.set(0.01,0.01,0.01)
        obj.rotation.y = getRand(1.1, 2);
        this.scene.add( obj )

        resolve(obj)
      })
    })
  }

  getParentCoin(obj) {
    if (!obj.parent) return null

    if (this.coins.indexOf(obj.parent) > -1) {
      return obj.parent
    }

    return this.getParentCoin(obj.parent)
  }

  onWindowResize() {
  	this.camera.aspect = window.innerWidth / window.innerHeight
  	this.camera.updateProjectionMatrix()
  	this.renderer.setSize( window.innerWidth, window.innerHeight )
  }

  onMouseMove( event ) {
    if (IS_MOBILE) return
    this.mousePrev.x = this.mouse.x
    this.mousePrev.y = this.mouse.y
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  onTouchMove( event ) {
    if (!IS_MOBILE) return
    if (event.touches.length > 1) return
    const touch = event.touches[0]

    this.mousePrev.x = this.mouse.x
    this.mousePrev.y = this.mouse.y
    this.mouse.x = ( touch.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( touch.clientY / window.innerHeight ) * 2 + 1;
  }

  onVisibilityChange() {
    this.isFocused = !document.hidden
  }

  animate() {
  	this.animationId = requestAnimationFrame( this.animate.bind(this) )
  	this.render()
  }

  destroy() {
    this.container.classList.remove('is-loaded')
    this.container.innerHTML = ''
    cancelAnimationFrame(this.animationId)
    window.removeEventListener( 'resize', this.onWindowResize, false )
    window.removeEventListener( 'mousemove', this.onMouseMove, false )
    window.removeEventListener('visibilitychange', this.onVisibilityChange, false)
  }

  render() {
    var delta = this.clock.getDelta();

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera( this.mouse, this.camera );

    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects( this.coins, true );
    const coinSwipes = this.coins.map(() => null)

    if (intersects.length > 0) {
      document.body.style.cursor = 'move'

      for ( var i = 0; i < intersects.length; i++ ) {
        const coin = this.getParentCoin(intersects[i].object)
        if (coin) {
          const index = this.coins.indexOf(coin)
          coinSwipes[index] = this.mouse.x - this.mousePrev.x
        }
      }
    } else {
      document.body.style.cursor = 'auto'
    }

    if (IS_MOBILE && this.coinDirections && intersects.length > 0) {
      const dist = this.mouse.x - this.mousePrev.x
      const _dir = dist > 0 ? 1 : -1
      const rotation = _dir * Math.abs(dist) * 150

      this.coinDirections[0].rotation = _dir
      this.coins[0].rotation.y += delta * rotation;
    }

    else if (this.isFocused) {
      this.coins.forEach((coin, i) => {

        let rotationFactor = 0.1 * this.coinDirections[i].rotation

        if (coinSwipes[i] !== null) {
          let dir = coinSwipes[i] > 0 ? 1 : -1
          if (coinSwipes[i] === 0) dir = 0
          rotationFactor = dir * Math.abs(coinSwipes[i]) * 200
          this.coinDirections[i].rotation = dir
        }

        coin.rotation.y += delta * rotationFactor;

        let position = coin.position.y + ((delta * 0.03) * this.coinDirections[i].position)
        if (position > this.coinBounceRanges[i][1]) position = this.coinBounceRanges[i][1]
        if (position < this.coinBounceRanges[i][0]) position = this.coinBounceRanges[i][0]
        coin.position.y = position;

        if (coin.rotation.y > 2 && this.coinDirections[i].rotation === 1) {
          this.coinDirections[i].rotation = -1
        } else if (coin.rotation.y < 1.1 && this.coinDirections[i].rotation === -1) {
          this.coinDirections[i].rotation = 1
        }

        if (coin.position.y >= this.coinBounceRanges[i][1] && this.coinDirections[i].position === 1) {
          this.coinDirections[i].position = -1
        } else if (coin.position.y <= this.coinBounceRanges[i][0] && this.coinDirections[i].position === -1) {
          this.coinDirections[i].position = 1
        }
      })
    }

  	this.renderer.render( this.scene, this.camera )
  }
}


class SplashPage3d {
  constructor() {
    window.addEventListener('resize', this.handleResize.bind(this))
    this.isMobile = window.innerWidth < 768

    if (this.isMobile) this.renderMobile()
    if (!this.isMobile) this.renderDesktop()
  }

  handleResize() {
    if (!this.isMobile && window.innerWidth < 768) this.renderMobile()
    if (this.isMobile && window.innerWidth > 768) this.renderDesktop()

    this.isMobile = window.innerWidth < 768
  }

  renderMobile() {
    if (this.threeJsWrapper) this.threeJsWrapper.destroy()
    this.threeJsWrapper = new ThreeJsWrapper(MOBILE_COIN_TYPES, MOBILE_COIN_COORDS, true)
  }

  renderDesktop() {
    if (this.threeJsWrapper) this.threeJsWrapper.destroy()
    this.threeJsWrapper = new ThreeJsWrapper(DESKTOP_COIN_TYPES, DESKTOP_COIN_COORDS)
  }
}


module.exports = SplashPage3d
