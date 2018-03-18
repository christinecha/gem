const THREE = require('three')
const ColladaLoader = require('three-collada-loader')
const Detector = require('./lib/WebGLDetector')

if ( !Detector.webgl ) {
  throw Error()
}

const COIN_TYPES = [
  'bitcoin',
  'ethereum',
  'eos',
  'litecoin',
  'stellar',
  'neo'
]

const COIN_COORDS = [
  [0,1,3.5],
  [-5,1,-0.5],
  [2,1,-3.5],
  [0,-4.2,3.2],
  [-6,-4.5,1],
  [-2,-4,-4],
]

const getRand = (min, max) => {
  return Math.random() * (max - min) + min
}
class ThreeJsWrapper {
  constructor() {
    this.container = document.getElementById( 'threejs-wrapper' )
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 )
    this.camera.position.set( 10, 1, 0 );
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) )
  	this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color( 0xffffff )

    // var size = 10;
    // var divisions = 10;
    // var gridHelper = new THREE.GridHelper( size, divisions );
    // this.scene.add( gridHelper );

    this.clock = new THREE.Clock();

    this.coins = []
    this.coinDirections = COIN_TYPES.map(() => {
      return { position: 1, rotation: 1, forceRotation: null }
    })

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.mousePrev = new THREE.Vector2()

    Promise.all(COIN_TYPES.map(this.loadObject.bind(this)))
    .then((coins) => {
      this.coins = coins
      this.coinBounceRanges = coins.map((c, i) => {
        const diff = getRand(0.05, 0.2)
        return [COIN_COORDS[i][1] - diff, COIN_COORDS[i][1] + diff]
      })
    })

  	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 )
  	this.scene.add( ambientLight )
  	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 )
  	directionalLight.position.set( 10, 10, 0 )
  	this.scene.add( directionalLight )

  	this.renderer = new THREE.WebGLRenderer( { antialias: true } )
  	this.renderer.setPixelRatio( window.devicePixelRatio )
  	this.renderer.setSize( window.innerWidth, window.innerHeight )
  	this.container.appendChild( this.renderer.domElement )

  	window.addEventListener( 'resize', this.onWindowResize.bind(this), false )
    window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );

    this.animate()
  }

  loadObject(name, i) {
    return new Promise(resolve => {
      const loader = new THREE.ObjectLoader()
      loader.load(`https://s3.amazonaws.com/gem-token-models/${name}.json`, obj => {
        const [x, y, z] = COIN_COORDS[i]

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
   this.mousePrev.x = this.mouse.x
   this.mousePrev.y = this.mouse.y
   this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
   this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
 }

  animate() {
  	requestAnimationFrame( this.animate.bind(this) )
  	this.render()
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

    this.coins.forEach((coin, i) => {

      let rotationFactor = 0.03 * this.coinDirections[i].rotation

      if (coinSwipes[i] !== null) {
        let dir = coinSwipes[i] > 0 ? 1 : -1
        if (coinSwipes[i] === 0) dir = 0
        rotationFactor = dir * 1.5
        this.coinDirections[i].rotation = dir
      }

      coin.rotation.y += delta * rotationFactor;
      coin.position.y += (delta * 0.03) * this.coinDirections[i].position;

      if (coin.rotation.y > 2 && this.coinDirections[i].rotation === 1) {
        this.coinDirections[i].rotation = -1
      } else if (coin.rotation.y < 1.1 && this.coinDirections[i].rotation === -1) {
        this.coinDirections[i].rotation = 1
      }

      if (coin.position.y > this.coinBounceRanges[i][1] && this.coinDirections[i].position === 1) {
        this.coinDirections[i].position = -1
      } else if (coin.position.y < this.coinBounceRanges[i][0] && this.coinDirections[i].position === -1) {
        this.coinDirections[i].position = 1
      }
    })

  	this.renderer.render( this.scene, this.camera )
  }
}

var threeJsWrapper = new ThreeJsWrapper()
