const THREE = require('three')
const ColladaLoader = require('three-collada-loader')
const Detector = require('./lib/WebGLDetector')

const IMAGE_MAP = [
  // {
  //   assetUrl: "/assets/home/gradient-map.png",
  //   scale: 4.5
  // },
  // {
  //   assetUrl: "/assets/home/shapes-1.png",
  //   scale: 4
  // },
  // {
  //   assetUrl: "/assets/home/unicorn.png",
  //   scale: 1.3
  // },
  // {
  //   assetUrl: "/assets/home/glyph-map.png",
  //   scale: 7.5
  // }
]

if ( !Detector.webgl ) {
  throw Error()
}

const IS_MOBILE = 'ontouchstart' in window

class ThreeJsWrapper {
  constructor() {
    this.container = document.getElementById( 'animation' )

    this.frustumSize = 5;
    var aspect = 1;
    this.camera = new THREE.OrthographicCamera( this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 1, 2000 );
    this.camera.position.y = 400;
    this.scene = new THREE.Scene()

    this.clock = new THREE.Clock();
    this.startTime = Date.now()

    var size = 10;
    var divisions = 10;
    var gridHelper = new THREE.GridHelper( size, divisions );
    this.scene.add( gridHelper );

    this.clock = new THREE.Clock();

    const promises = IMAGE_MAP.map((image, i) => {
      return this.loadTexture(image, i)
    })

    Promise.all(promises).then(images => this.images = images)

  	this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )
    this.renderer.setClearColor( 0x000000, 0 )
  	this.renderer.setPixelRatio( window.devicePixelRatio )
  	this.renderer.setSize( window.innerWidth * 1.5, window.innerWidth * 1.5 )
  	this.container.appendChild( this.renderer.domElement )

    this.onWindowResize = this.onWindowResize.bind(this)

  	window.addEventListener( 'resize', this.onWindowResize, false )

    this.animate()
  }

  loadTexture(image, i) {
    return new Promise(resolve => {
      var map = new THREE.TextureLoader().load(image.assetUrl)
      var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true } )
      var sprite = new THREE.Sprite( material )
      sprite.scale.set(image.scale, image.scale, 1)
      sprite.position.y = i
      this.scene.add( sprite )
      resolve(sprite)
    })
  }

  onWindowResize() {
    var aspect = 1

    this.camera.left   = - this.frustumSize * aspect / 2;
    this.camera.right  =   this.frustumSize * aspect / 2;
    this.camera.top    =   this.frustumSize / 2;
    this.camera.bottom = - this.frustumSize / 2;
    this.camera.updateProjectionMatrix();
  	this.renderer.setSize( window.innerWidth * 1.5, window.innerWidth * 1.5)
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
  }

  render() {
    var delta = this.clock.getDelta()
    const now = Date.now()
    const diff = now - this.startTime

    if (diff > 5000) {
      this.camera.zoom -= delta * 0.3
      if (this.camera.zoom < 0.1) this.camera.zoom  = 0.1
    }
    this.camera.updateProjectionMatrix();
    this.camera.lookAt( this.scene.position );
    this.renderer.render( this.scene, this.camera );
  }
}


class Home3d {
  constructor() {
    window.addEventListener('resize', this.handleResize.bind(this))
    this.isMobile = window.innerWidth < 768
    new ThreeJsWrapper()
    // if (this.isMobile) this.renderMobile()
    // if (!this.isMobile) this.renderDesktop()
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


module.exports = Home3d
