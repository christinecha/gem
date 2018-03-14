const THREE = require('three')
const ColladaLoader = require('three-collada-loader')

const Detector = require('./lib/WebGLDetector')

if ( ! Detector.webgl ) Detector.addGetWebGLMessage()

var container, controls, bitcoin, clock
var camera, scene, renderer, mixer

function init() {
	container = document.getElementById( 'threejs-container' )
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
  camera.position.set( 8, 0, 8 );
  camera.lookAt( new THREE.Vector3( 0, 3, 0 ) );
	scene = new THREE.Scene()
  scene.background = new THREE.Color( 0xffffff )

  clock = new THREE.Clock();

	var loader = new THREE.ObjectLoader()
	loader.load( '../assets/models/bitcoin.json', function ( obj ) {
    obj.position.set(0,3,0)
    bitcoin = obj
		scene.add( bitcoin )
	})

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 )
	scene.add( ambientLight )
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 )
	directionalLight.position.set( 1, 1, - 1 )
	scene.add( directionalLight )

	renderer = new THREE.WebGLRenderer( { antialias: true } )
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( window.innerWidth, window.innerHeight )
	container.appendChild( renderer.domElement )

	window.addEventListener( 'resize', onWindowResize, false )
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize( window.innerWidth, window.innerHeight )
}

function animate() {
	requestAnimationFrame( animate )
	render()
}

function render() {
  var delta = clock.getDelta();

  if ( bitcoin !== undefined ) {
    bitcoin.rotation.y += delta * 0.5;
  }

	renderer.render( scene, camera )
}

init()
animate()
